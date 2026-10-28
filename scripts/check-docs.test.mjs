import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { checkDocs } from "./check-docs.mjs";

const script = fileURLToPath(new URL("./check-docs.mjs", import.meta.url));
const guide =
  "# Guide\n\nThis guide describes the fixture workflow.\n\n## Details\n\nCurrent behavior.\n";
const baseFiles = {
  ".gitignore": "AGENTS.local.md\nnode_modules/\n.next/\nscratch/\n",
  "AGENTS.md":
    "# Agent Operating Policy\n\nKeep work within the requested scope.\n",
  "CLAUDE.md": "@AGENTS.md\n",
  "README.md": "# Fixture\n\n[Guide](docs/setup/guide.md#details).\n",
  "CONTRIBUTING.md":
    "# Contributing\n\nRead the [guide](docs/setup/guide.md).\n",
  "package.json": '{"name":"fixture","private":true}\n',
  "docs/setup/guide.md": guide,
};

function git(root, ...args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function write(root, path, content) {
  const destination = join(root, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}

function workspace(t, overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), "workbench-docs-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries({
    ...baseFiles,
    ...overrides,
  })) {
    if (content !== null) write(root, path, content);
  }
  git(root, "init", "--quiet");
  return root;
}

function passes(root) {
  const result = checkDocs(root);
  assert.deepEqual(result.issues, [], JSON.stringify(result.issues, null, 2));
  assert.equal(typeof result.files, "number");
  assert.ok(result.files > 0);
  return result;
}

function hasIssue(root, code, file, line) {
  const result = checkDocs(root);
  const issue = result.issues.find(
    (item) => item.code === code && item.file === file,
  );
  assert.ok(
    issue,
    `Expected ${code} in ${file}: ${JSON.stringify(result.issues)}`,
  );
  if (line !== undefined) assert.equal(issue.line, line);
  assert.equal(typeof issue.message, "string");
  assert.ok(issue.message.length > 0);
  return result;
}

function physicalLines(count, newline = "\n", trailing = true) {
  const lines = [
    "# Bounded guide",
    "",
    "This guide describes bounded content.",
    "",
    "## Details",
  ];
  while (lines.length < count) lines.push("Content.");
  return lines.join(newline) + (trailing ? newline : "");
}

function snapshot(root) {
  const files = {};
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === ".git") continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else files[relative(root, path)] = readFileSync(path).toString("base64");
    }
  }
  visit(root);
  return files;
}

test("accepts a portable tree with nested, local-file and public-directory links", (t) => {
  const root = workspace(t, {
    "docs/setup/guide.md": `${guide}\n[This section](#details), [README](../../README.md), [manifest](../../package.json), and [guides](../setup/).\n`,
    "docs/Other.md":
      "# Other\n\nA filename may contain uppercase letters while its extension is lowercase.\n",
  });
  passes(root);
});

test("requires the exact CLAUDE alias bytes", (t) => {
  passes(workspace(t));
  for (const content of [
    null,
    "@AGENTS.md",
    "@AGENTS.md\r\n",
    "\uFEFF@AGENTS.md\n",
    "@AGENTS.md\n\n",
    "@AGENTS.md\nExtra rules.\n",
  ]) {
    hasIssue(
      workspace(t, { "CLAUDE.md": content }),
      "agent-alias",
      "CLAUDE.md",
    );
  }
});

test("reports a missing AGENTS entry point without source-specific heading requirements", (t) => {
  passes(workspace(t));
  hasIssue(workspace(t, { "AGENTS.md": null }), "missing-agent", "AGENTS.md");
});

test("rejects non-lowercase Markdown extensions and non-Markdown files under docs", (t) => {
  for (const path of [
    "docs/example.MD",
    "docs/example.mdx",
    "docs/example.txt",
    "docs/image.png",
  ]) {
    hasIssue(
      workspace(t, { [path]: "# Example\n\nDescription.\n" }),
      "extension",
      path,
    );
  }
});

test("requires an actual H1 at the beginning of each docs file", (t) => {
  for (const content of [
    "\n# Guide\n\nDescription.\n",
    "<!-- note -->\n# Guide\n\nDescription.\n",
    "Introduction.\n\n# Guide\n",
    "## Guide\n\nDescription.\n",
    "```md\n# Guide\n```\n\nDescription.\n",
  ]) {
    hasIssue(
      workspace(t, { "docs/setup/guide.md": content }),
      "h1",
      "docs/setup/guide.md",
    );
  }
});

test("requires a scope paragraph before the first H2 rather than text inside code", (t) => {
  passes(workspace(t));
  for (const content of [
    "# Guide\n\n## Details\n\nDescription appears too late.\n",
    "# Guide\n\n```text\nAn example is not the scope paragraph.\n```\n\n## Details\n",
  ]) {
    hasIssue(
      workspace(t, { "docs/setup/guide.md": content }),
      "scope",
      "docs/setup/guide.md",
    );
  }
});

test("distinguishes 400 from 401 physical lines with LF, CRLF and no final newline", (t) => {
  for (const [newline, trailing] of [
    ["\n", true],
    ["\r\n", true],
    ["\n", false],
  ]) {
    passes(
      workspace(t, {
        "docs/setup/guide.md": physicalLines(400, newline, trailing),
      }),
    );
    hasIssue(
      workspace(t, {
        "docs/setup/guide.md": physicalLines(401, newline, trailing),
      }),
      "lines",
      "docs/setup/guide.md",
    );
  }
});

test("applies the line budget to the stated living and target paths without source exceptions", (t) => {
  for (const path of [
    "docs/example.md",
    "docs/setup/example.md",
    "docs/workflows/example.md",
    "docs/system/example.md",
    "docs/target/example.md",
  ]) {
    hasIssue(workspace(t, { [path]: physicalLines(401) }), "lines", path);
  }
  for (const path of [
    "docs/specs/example.md",
    "docs/decisions/example.md",
    "docs/history/example.md",
  ]) {
    passes(workspace(t, { [path]: physicalLines(401) }));
  }
});

test("reports actual missing inline-link and image targets at their source lines", (t) => {
  for (const link of [
    "[Missing](missing.md)",
    "![Missing image](missing.png)",
  ]) {
    hasIssue(
      workspace(t, { "README.md": `# Fixture\n\n${link}\n` }),
      "missing-file",
      "README.md",
      3,
    );
  }
});

test("resolves full, collapsed and shortcut references using the first definition", (t) => {
  passes(
    workspace(t, {
      "README.md":
        "# Fixture\n\n[Full][guide]\n\n[Guide][]\n\n[GUIDE]\n\n[guide]: docs/setup/guide.md#details\n[GUIDE]: missing.md\n",
    }),
  );
  hasIssue(
    workspace(t, {
      "README.md":
        "# Fixture\n\n[Full][guide]\n\n[guide]: missing.md\n[GUIDE]: docs/setup/guide.md\n",
    }),
    "missing-file",
    "README.md",
    3,
  );
});

test("ignores link-shaped text in code, comments, raw HTML and unresolved bracket text", (t) => {
  passes(
    workspace(t, {
      "README.md": [
        "# Fixture",
        "",
        "`[inline](missing-inline.md)`",
        "",
        "```md",
        "[fenced](missing-fenced.md)",
        "[bad encoding](%E0%A4%A)",
        "```",
        "",
        "    [indented](missing-indented.md)",
        "",
        "<!-- [comment](missing-comment.md) -->",
        "",
        '<a href="missing-html.md">Raw HTML is outside this checker.</a>',
        "",
        "An undefined [bracketed phrase] is ordinary text.",
        "",
        "[Real guide](docs/setup/guide.md#details)",
        "",
      ].join("\n"),
    }),
  );
});

test("recognizes duplicate Unicode heading anchors and resets slugs for each file", (t) => {
  const headings =
    "# Guide\n\nThis guide owns heading examples.\n\n## Café\n\nFirst.\n\n## Café\n\nSecond.\n\n## Привіт світ\n\nThird.\n\n## Use `code` and **bold**\n";
  passes(
    workspace(t, {
      "docs/setup/guide.md": headings,
      "docs/setup/other.md":
        "# Other\n\nThis guide owns another example.\n\n## Café\n",
      "README.md":
        "# Fixture\n\n[First](docs/setup/guide.md#caf%C3%A9)\n[Second](docs/setup/guide.md#café-1)\n[Unicode](docs/setup/guide.md#привіт-світ)\n[Formatting](docs/setup/guide.md#use-code-and-bold)\n[Independent](docs/setup/other.md#café)\n",
    }),
  );
});

test("rejects missing heading fragments and headings that exist only inside examples", (t) => {
  const root = workspace(t, {
    "docs/setup/guide.md": `${guide}\n\x60\x60\x60md\n## Phantom\n\x60\x60\x60\n`,
    "README.md":
      "# Fixture\n\n[Absent](docs/setup/guide.md#absent)\n[Example only](docs/setup/guide.md#phantom)\n",
  });
  const result = hasIssue(root, "missing-anchor", "README.md", 3);
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "missing-anchor" &&
        issue.file === "README.md" &&
        issue.line === 4,
    ),
  );
});

test("decodes local filenames and rejects malformed path or fragment encoding", (t) => {
  passes(
    workspace(t, {
      "docs/setup/local guide.md": guide,
      "README.md":
        "# Fixture\n\n[Guide](docs/setup/local%20guide.md#details)\n",
    }),
  );
  for (const destination of [
    "docs/%E0%A4%A.md",
    "docs/setup/guide.md#%E0%A4%A",
  ]) {
    hasIssue(
      workspace(t, { "README.md": `# Fixture\n\n[Invalid](${destination})\n` }),
      "encoding",
      "README.md",
      3,
    );
  }
});

test("skips scheme and protocol-relative URLs without treating them as local files", (t) => {
  passes(
    workspace(t, {
      "README.md":
        "# Fixture\n\n[Web](https://invalid.example/not-checked#missing)\n[Email](mailto:person@example.invalid)\n[Telephone](tel:+10000000000)\n[Remote](//invalid.example/not-checked)\n![Badge](https://invalid.example/badge.svg)\n",
    }),
  );
});

test("accepts GFM footnotes and still checks real local links within their bodies", (t) => {
  passes(
    workspace(t, {
      "README.md":
        "# Fixture\n\nA statement.[^note]\n\n[^note]: Read the [guide](docs/setup/guide.md#details).\n",
    }),
  );
  hasIssue(
    workspace(t, {
      "README.md":
        "# Fixture\n\nA statement.[^note]\n\n[^note]: Read the [missing guide](missing.md).\n",
    }),
    "missing-file",
    "README.md",
    5,
  );
});

test("excludes ignored private and generated content while discovering new public Markdown", (t) => {
  const excluded = "PRIVATE_FIXTURE_SENTINEL\n\n[Broken](%E0%A4%A)\n";
  const root = workspace(t, {
    "AGENTS.local.md": excluded,
    "node_modules/example/README.md": excluded,
    ".next/generated.md": excluded,
    "scratch/draft.md": excluded,
  });
  write(root, ".git/private-example.md", excluded);
  const result = passes(root);
  assert.ok(!JSON.stringify(result).includes("PRIVATE_FIXTURE_SENTINEL"));
  git(root, "add", "--force", "AGENTS.local.md");
  const trackedPrivate = hasIssue(root, "private-file", "AGENTS.local.md");
  assert.ok(!trackedPrivate.issues.some((issue) => issue.code === "encoding"));
  assert.ok(
    !JSON.stringify(trackedPrivate).includes("PRIVATE_FIXTURE_SENTINEL"),
  );
  write(root, "notes.md", "# Notes\n\n[Broken](missing.md)\n");
  hasIssue(root, "missing-file", "notes.md", 3);
});

test("does not validate a public link merely because an excluded private file exists locally", (t) => {
  for (const target of [
    "AGENTS.local.md",
    "node_modules/example/README.md",
    ".next/generated.md",
    "scratch/draft.md",
  ]) {
    const result = hasIssue(
      workspace(t, {
        [target]: "# PRIVATE_FIXTURE_SENTINEL\n\nPrivate content.\n",
        "README.md": `# Fixture\n\n[Local-only content](${target})\n`,
      }),
      "missing-file",
      "README.md",
      3,
    );
    assert.ok(!JSON.stringify(result).includes("PRIVATE_FIXTURE_SENTINEL"));
  }
});

test("reports a tracked Markdown file removed from disk instead of silently dropping it", (t) => {
  const root = workspace(t, { "docs/setup/removed.md": guide });
  git(root, "add", "docs/setup/removed.md");
  rmSync(join(root, "docs/setup/removed.md"));
  hasIssue(root, "read-file", "docs/setup/removed.md");
});

test("rejects absolute and escaping local paths while allowing parent paths within the root", (t) => {
  const root = workspace(t, {
    "docs/setup/guide.md": `${guide}\n[README](../../README.md)\n`,
  });
  passes(root);
  const outside = mkdtempSync(join(tmpdir(), "workbench-docs-outside-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  write(
    outside,
    "private.md",
    "# OUTSIDE_FIXTURE_SENTINEL\n\nOutside content.\n",
  );
  const outsideFile = join(outside, "private.md");
  const escapedPath = relative(root, outsideFile).split(sep).join("/");
  for (const target of ["/README.md", escapedPath]) {
    write(root, "README.md", `# Fixture\n\n[Outside](${target})\n`);
    const result = hasIssue(root, "outside-root", "README.md", 3);
    assert.ok(!JSON.stringify(result).includes("OUTSIDE_FIXTURE_SENTINEL"));
  }
});

test("rejects local links through file or directory symlinks even when the target is internal", (t) => {
  for (const kind of ["file", "directory"]) {
    const root = workspace(t);
    const alias = kind === "file" ? "linked.md" : "linked-directory";
    const destination = kind === "file" ? "docs/setup/guide.md" : "docs/setup";
    symlinkSync(
      destination,
      join(root, alias),
      kind === "file" ? "file" : "dir",
    );
    const link = kind === "file" ? alias : `${alias}/guide.md`;
    write(root, "README.md", `# Fixture\n\n[Symlink](${link})\n`);
    hasIssue(root, "symlink", "README.md", 3);
  }
});

test("CLI uses its working directory, gives deterministic failing locations and never edits inputs", (t) => {
  const root = workspace(t);
  const cleanBefore = snapshot(root);
  const clean = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(clean.status, 0, clean.stderr || clean.stdout);
  assert.deepEqual(snapshot(root), cleanBefore);

  const nested = spawnSync(process.execPath, [script], {
    cwd: join(root, "docs"),
    encoding: "utf8",
  });
  assert.equal(typeof nested.status, "number");
  assert.notEqual(
    nested.status,
    0,
    "A nested directory must not inherit its parent checkout as the requested root.",
  );
  assert.deepEqual(snapshot(root), cleanBefore);

  write(root, "README.md", "# Fixture\n\n[Missing](missing.md)\n");
  write(
    root,
    "CONTRIBUTING.md",
    "# Contributing\n\n[Missing](also-missing.md)\n",
  );
  const brokenBefore = snapshot(root);
  const first = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
  });
  const second = spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(typeof first.status, "number");
  assert.notEqual(first.status, 0);
  assert.equal(second.status, first.status);
  assert.equal(second.stdout, first.stdout);
  assert.equal(second.stderr, first.stderr);
  assert.match(`${first.stdout}\n${first.stderr}`, /README\.md:3/);
  assert.match(`${first.stdout}\n${first.stderr}`, /CONTRIBUTING\.md:3/);
  assert.deepEqual(snapshot(root), brokenBefore);
});

test("rejects a deleted tracked asset and a directory whose public files are gone", (t) => {
  const root = workspace(t, {
    "assets/icon.svg": "<svg/>\n",
    "README.md": "# Fixture\n\n![Icon](assets/icon.svg)\n[Assets](assets/)\n",
  });
  git(root, "add", "assets/icon.svg");
  rmSync(join(root, "assets"), { recursive: true });
  const result = hasIssue(root, "missing-file", "README.md", 3);
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "missing-file" && issue.line === 4,
    ),
  );
});

test("supports queries and image references while matching public filenames case-sensitively", (t) => {
  const root = workspace(t, {
    "assets/icon.svg": "<svg/>\n",
    "README.md":
      "# Fixture\n\n[Guide](docs/setup/guide.md?view=1#details)\n![Icon][image]\n\n[image]: assets/icon.svg\n",
  });
  passes(root);
  write(
    root,
    "README.md",
    "# Fixture\n\n[Wrong case](docs/setup/Guide.md#details)\n",
  );
  hasIssue(root, "missing-file", "README.md", 3);
});

test("rejects encoded traversal and accepts plain footnote prose", (t) => {
  const root = workspace(t, {
    "README.md": "# Fixture\n\nNote[^plain].\n\n[^plain]: Note\n",
  });
  passes(root);
  write(root, "README.md", "# Fixture\n\n[Escape](%2E%2E/outside.md)\n");
  hasIssue(root, "outside-root", "README.md", 3);
});

test("does not accept stale indexed descendants as public directory contents", (t) => {
  const root = workspace(t, {
    ".gitignore": `${baseFiles[".gitignore"]}assets/private.txt\n`,
    "assets/icon.svg": "<svg/>\n",
    "README.md": "# Fixture\n\n[Assets](assets/)\n",
  });
  git(root, "add", "assets/icon.svg");
  rmSync(join(root, "assets/icon.svg"));
  hasIssue(root, "missing-file", "README.md", 3);
  write(root, "assets/private.txt", "PRIVATE_FIXTURE_SENTINEL\n");
  hasIssue(root, "missing-file", "README.md", 3);
  symlinkSync("../package.json", join(root, "assets/alias.json"));
  hasIssue(root, "missing-file", "README.md", 3);
  write(root, "assets/public.svg", "<svg/>\n");
  passes(root);
});
