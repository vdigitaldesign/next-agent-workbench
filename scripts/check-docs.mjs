import { spawnSync } from "node:child_process";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { posix, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import GithubSlugger from "github-slugger";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFootnoteFromMarkdown } from "mdast-util-gfm-footnote";
import { gfmFootnote } from "micromark-extension-gfm-footnote";

function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

function headingText(node) {
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  if (node.type === "image" || node.type === "imageReference")
    return node.alt ?? "";
  return (node.children ?? []).map(headingText).join("");
}

function crossesSymlink(root, file) {
  const parts = file.split("/");
  for (let length = 1; length <= parts.length; length++) {
    try {
      if (lstatSync(resolve(root, ...parts.slice(0, length))).isSymbolicLink())
        return true;
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
      throw error;
    }
  }
  return false;
}

function discover(root) {
  const run = (...args) => {
    const result = spawnSync("git", args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    if (result.error || result.status !== 0)
      throw new Error(
        "Git could not read this checkout. Install Git and run from the repository root.",
      );
    return result.stdout;
  };
  if (
    realpathSync(run("rev-parse", "--show-toplevel").trim()) !==
    realpathSync(root)
  ) {
    throw new Error("Run the checker from the repository root.");
  }
  return new Set(
    run("ls-files", "--cached", "--others", "--exclude-standard", "-z")
      .split("\0")
      .filter(Boolean),
  );
}

function parse(source) {
  const tree = fromMarkdown(source, {
    extensions: [gfmFootnote()],
    mdastExtensions: [gfmFootnoteFromMarkdown()],
  });
  const slugger = new GithubSlugger();
  const anchors = new Set();
  const definitions = new Map();
  const links = [];
  walk(tree, (node) => {
    if (node.type === "heading") anchors.add(slugger.slug(headingText(node)));
    if (node.type === "definition" && !definitions.has(node.identifier))
      definitions.set(node.identifier, node.url);
    if (
      ["link", "image", "linkReference", "imageReference"].includes(node.type)
    )
      links.push(node);
  });
  return { tree, anchors, definitions, links };
}

function hasLineBudget(file) {
  return (
    /^docs\/[^/]+\.md$/.test(file) ||
    /^docs\/(setup|workflows|system|target)\//.test(file)
  );
}

/** Check public working-tree Markdown without changing files or fetching URLs. */
export function checkDocs(root) {
  root = resolve(root);
  const issues = [];
  const report = (code, file, line, message) =>
    issues.push({ code, file, line, message });
  let publicFiles;
  try {
    publicFiles = discover(root);
  } catch (error) {
    report("discovery", ".", 1, error.message);
    return { issues, files: 0 };
  }

  if (publicFiles.delete("AGENTS.local.md")) {
    report(
      "private-file",
      "AGENTS.local.md",
      1,
      "Private agent context must stay outside the public file set.",
    );
  }
  const markdown = new Map();
  for (const file of [...publicFiles].sort()) {
    if (file.startsWith("docs/") && !file.endsWith(".md")) {
      report(
        "extension",
        file,
        1,
        "Files under docs/ must use the lowercase .md extension.",
      );
    }
    if (!file.endsWith(".md")) continue;
    let source;
    try {
      if (crossesSymlink(root, file)) {
        report(
          "symlink",
          file,
          1,
          "Markdown files reached through symlinks are not supported.",
        );
        continue;
      }
      source = readFileSync(resolve(root, file), "utf8");
    } catch {
      report(
        "read-file",
        file,
        1,
        "Cannot read this public Markdown file; check for an unstaged deletion.",
      );
      continue;
    }
    const document = { source, ...parse(source) };
    markdown.set(file, document);
    if (!file.startsWith("docs/")) continue;
    const first = document.tree.children[0];
    if (
      first?.type !== "heading" ||
      first.depth !== 1 ||
      first.position.start.line !== 1
    ) {
      report("h1", file, 1, "Start the document with an H1 on its first line.");
    }
    const firstH2 = document.tree.children.findIndex(
      (node) => node.type === "heading" && node.depth === 2,
    );
    const introduction = document.tree.children.slice(
      1,
      firstH2 < 0 ? undefined : firstH2,
    );
    if (!introduction.some((node) => node.type === "paragraph")) {
      report(
        "scope",
        file,
        1,
        "Add an introductory scope paragraph before the first H2.",
      );
    }
    const lines =
      source.split(/\r\n|\r|\n/).length - (/[\r\n]$/.test(source) ? 1 : 0);
    if (hasLineBudget(file) && lines > 400) {
      report(
        "lines",
        file,
        401,
        `This document has ${lines} physical lines; split it by responsibility to stay within 400.`,
      );
    }
  }

  if (!markdown.has("AGENTS.md"))
    report(
      "missing-agent",
      "AGENTS.md",
      1,
      "The public agent entry point must exist and be readable.",
    );
  if (markdown.get("CLAUDE.md")?.source !== "@AGENTS.md\n") {
    report(
      "agent-alias",
      "CLAUDE.md",
      1,
      "CLAUDE.md must contain exactly @AGENTS.md followed by one newline.",
    );
  }

  const publicDirectories = new Set();
  for (const file of publicFiles) {
    try {
      if (
        crossesSymlink(root, file) ||
        !lstatSync(resolve(root, file)).isFile()
      )
        continue;
      let directory = posix.dirname(file);
      while (true) {
        publicDirectories.add(directory);
        if (directory === ".") break;
        directory = posix.dirname(directory);
      }
    } catch {
      // An absent indexed file cannot make a directory part of the public tree.
    }
  }

  for (const [file, document] of markdown) {
    for (const link of document.links) {
      const url = link.url ?? document.definitions.get(link.identifier);
      if (
        url === undefined ||
        /^[a-z][a-z\d+.-]*:/i.test(url) ||
        url.startsWith("//")
      )
        continue;
      const line = link.position.start.line;
      const hash = url.indexOf("#");
      const pathPart = (hash < 0 ? url : url.slice(0, hash)).split("?")[0];
      let destination;
      let fragment;
      try {
        destination = decodeURIComponent(pathPart);
        fragment = hash < 0 ? "" : decodeURIComponent(url.slice(hash + 1));
      } catch {
        report(
          "encoding",
          file,
          line,
          "Local link has invalid percent encoding.",
        );
        continue;
      }
      // POSIX resolution matches repository paths on every host; reject Windows separators too.
      const target = destination
        ? posix.normalize(posix.join(posix.dirname(file), destination))
        : file;
      if (
        destination.startsWith("/") ||
        destination.includes("\\") ||
        target === ".." ||
        target.startsWith("../")
      ) {
        report(
          "outside-root",
          file,
          line,
          "Use a relative link that stays inside the repository.",
        );
        continue;
      }
      try {
        if (crossesSymlink(root, target)) {
          report(
            "symlink",
            file,
            line,
            "Local links through symlinks are not supported; link to the public file directly.",
          );
          continue;
        }
      } catch {
        report(
          "read-file",
          file,
          line,
          `Cannot inspect local target: ${target}`,
        );
        continue;
      }
      const isDirectory = publicDirectories.has(target.replace(/\/$/, ""));
      let exists = false;
      try {
        const stat = lstatSync(resolve(root, target));
        exists = stat.isFile() || stat.isDirectory();
      } catch {
        // A tracked path can still be absent from the working tree.
      }
      if (!exists || (!publicFiles.has(target) && !isDirectory)) {
        report(
          "missing-file",
          file,
          line,
          `Local target is missing from the public file set: ${target}`,
        );
        continue;
      }
      if (
        fragment &&
        target.endsWith(".md") &&
        markdown.has(target) &&
        !markdown.get(target).anchors.has(fragment)
      ) {
        report(
          "missing-anchor",
          file,
          line,
          `Markdown heading does not exist: ${target}#${fragment}`,
        );
      }
    }
  }
  issues.sort((a, b) =>
    a.file < b.file
      ? -1
      : a.file > b.file
        ? 1
        : a.line - b.line || a.code.localeCompare(b.code),
  );
  return { issues, files: markdown.size };
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  const result = checkDocs(process.cwd());
  for (const issue of result.issues)
    console.error(
      `${issue.file}:${issue.line} [${issue.code}] ${issue.message}`,
    );
  if (result.issues.length) {
    console.error(
      `Documentation checks failed (${result.issues.length} issues).`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      `Documentation checks passed (${result.files} Markdown files).`,
    );
  }
}
