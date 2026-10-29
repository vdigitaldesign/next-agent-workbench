# Quality Gates

This guide owns verification commands, proof selection, result reporting, and task cleanup. [AGENTS.md](../../AGENTS.md#verification-and-manual-qa) owns authorization, manual QA, and publication review; [knowledge ownership](knowledge-ownership.md#recording-delivery-across-systems) owns progress synchronization.

## Define the result before changing it

Identify the expected outcome from the request and accepted contract, the affected surface, and the smallest check that can establish success. For behavior changes, include a plausible incorrect result that the check should reject. Resolve a missing decision only when the work depends on it; do not turn routine implementation choices into approval requests.

Inspect the affected files and current state before choosing proof. Derive new behavior from the accepted requirement; compare facts that must stay unchanged with the inspected baseline. Confirm command behavior before relying on its exit status or output in an assertion. For a bug, reproduce the failure when feasible and retain a regression case that would detect its return. Explain when reproduction is unavailable.

Keep this reasoning in the existing task or change record. A small documentation correction needs no new specification, test suite, or verification report.

## Available commands

The package uses npm and the checked-in `package-lock.json`; [local development](local-development.md) owns runtime requirements and setup. Inspect `package.json` when selecting commands; do not assume a copied project's scripts are unchanged.

| Command              | Role                       | What the result establishes                                                                                                     |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`             | Install dependencies       | Installs from the lockfile; it is not a behavior check.                                                                         |
| `npm run dev`        | Start a development server | Provides a local surface for inspection; startup alone does not prove a feature works.                                          |
| `npm run docs:check` | Documentation check        | Checks the supported structure, local links, heading anchors, and agent-file contract; see [its scope](#documentation-checker). |
| `npm run lint`       | Static check               | Runs the configured ESLint rules; it does not establish runtime correctness.                                                    |
| `npm run build`      | Production compilation     | Checks that a production build completes in the tested environment.                                                             |
| `npm run start`      | Start a built application  | Requires an existing production build; verify the relevant behavior separately.                                                 |

A dedicated typecheck script, formatter script, and application unit/E2E suite are not configured. Do not report them as passed or claim that this guide installs them. If using an available direct tool invocation, record its exact command and origin; an agent's machine-local tool is not a repository dependency.

## GitHub Actions

The [CI workflow](../../.github/workflows/ci.yml) runs on pull requests, pushes to `main`, and manual dispatch. Its single `Check` job installs the locked dependencies and always runs `npm run docs:check`, including when a deleted code or asset file could break a documentation link.

The changed paths determine the remaining steps:

| Changed files                                                                                   | Additional checks                         |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Known root documentation, Markdown under `docs/`, the PR template, or `LICENSE` only            | None                                      |
| `scripts/check-docs.mjs` or its regression tests, with optional documentation changes           | Checker regression tests and lint         |
| Any other path, including application code, dependencies, configuration, or the workflow itself | Checker regression tests, lint, and build |
| Manual run or unavailable comparison                                                            | All checks                                |

The root documentation allowlist is in the workflow. Unknown paths take the full route. Git compares the PR base with the proposed merge result, or the previous push revision with the new result. Renames include both old and new paths, so moving code into a documentation directory cannot skip the build.

CI uses Ubuntu 24.04, Node.js 24.16.0, and npm 12.2.1. It caches npm downloads, uses read-only repository permissions, and does not retain Git credentials for subsequent steps. It uses ordinary `pull_request` events and needs no project secrets. npm's default script policy still applies; the workflow does not approve dependency scripts.

A failed command fails the job. The upstream repository requires a pull request and a passing `Check` from GitHub Actions on `main`, with the branch up to date before merge. It does not require another reviewer. These are repository settings: creating a project from this template copies the workflow file, not the ruleset. Configure your own branch rules if you want GitHub to enforce the same merge requirements. CI does not deploy or publish a package.

When changing the workflow, verify both the selected commands and the path decisions. Include documentation-only, checker-only, mixed changes, deletions and renames, unknown paths, and a missing base. Inspect an actual GitHub run before claiming the workflow works there. [GitHub's Node.js guide](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) covers the underlying setup.

## Documentation checker

Run `npm run docs:check` from the Git repository root. It invokes `node scripts/check-docs.mjs` and uses Git to discover tracked and nonignored untracked files. It reads the working files without changing them or making network requests. An exported copy needs `git init` before this check; no commit is required.

The checker covers:

- All public `.md` files in that file set: inline and reference links, images, local paths, and Markdown heading anchors, including Unicode and duplicate headings. GitHub footnotes are parsed so links inside them are checked without treating note text as a path. Inline and fenced code examples are ignored.
- Repository membership with exact path casing and valid URL encoding. Missing targets, paths outside the repository, root-absolute paths, and paths through symlinks fail. Links cannot depend on ignored private files.
- Files under `docs/`: lowercase `.md`, an H1 at the start, and an introductory paragraph before the first H2. The 400-physical-line limit applies to direct `docs/*.md` files and files under `docs/setup/`, `docs/workflows/`, `docs/system/`, and `docs/target/`. Other document classes retain the governance requirements and need review; specifications, decisions, and history have no blanket line cap.
- The presence of `AGENTS.md` and the exact `CLAUDE.md` alias. Private `AGENTS.local.md` must remain outside the public file set.

External URLs are not fetched. Raw HTML links and IDs, generated footnote fragment IDs, and fragments in non-Markdown files are outside the supported checks. Heading links must target Markdown headings. A pass establishes neither the meaning of a scope paragraph nor semantic accuracy, ownership, decision acceptance, or authorization.

When changing the checker, run its regression tests as well:

```bash
node --test scripts/check-docs.test.mjs
```

These tests use Node.js's built-in test runner and cover the checker, not application behavior.

## Match proof to the change

| Change                                                                                                         | Minimum relevant evidence                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation or policy                                                                                        | Run `npm run docs:check`, inspect the diff and affected claims, and use available formatting. Check changed examples the parser ignores. Policy changes need source-ownership and normal/stop-case review. Execute application or checker tests only to verify documented behavior. |
| Narrow code change                                                                                             | Changed-file lint/format and the closest relevant behavioral check. For an exported contract, add type checking; for a production-compilation boundary, add a build.                                                                                                                |
| User interaction or integration                                                                                | Exercise the affected path in the running system when its behavior cannot be established by a smaller check. Apply the manual QA classification from AGENTS.md.                                                                                                                     |
| Transformation, replacement, or migration                                                                      | Check the invariant or compare accepted old and new behavior where useful. Record intended differences so a comparison does not preserve a known bug as a requirement.                                                                                                              |
| Broad dependency, framework, runtime, tooling, security, data-write, or architecture change; release readiness | Every applicable configured gate plus the relevant behavioral or operational proof. Disclose unavailable coverage and any acceptance it prevents.                                                                                                                                   |

Prefer unit checks for pure deterministic behavior, adapter checks for queries, redirects, environment branching and route contracts, and browser checks when the risk requires actual interaction, hydration or a built application. If a database is introduced, verify migrations, access controls and concurrency at the database boundary. Choose tools that fit the project; these layers are not installed by this guide.

Use configured checks and the actual diff first. Add assertions or tests for a concrete uncovered risk. Missing formatting tooling is a disclosed limitation, not a reason to build a harness. Stop expanding verification once it covers the task.

## Run and assess the checks

1. Inspect the final diff, including intended untracked files. Check the requested outcome, unrelated changes, and documentation impact.
2. Run the selected checks and inspect their actual results. A command invocation, generated test, screenshot, or agent assertion is not by itself a passing result. Record the checked state and environment when they matter.
3. Assess whether the evidence covers acceptance. Static analysis and compilation establish their own scope; review or a green test suite cannot fill an untested behavioral gap. Use existing review to scrutinize generated tests as well as code.
4. Diagnose failures before retrying. Prefer reproducible inputs and useful failure detail. Retain the failing case or relevant trace when needed; do not delete or disable a failing check merely to obtain a pass. A deliberate expectation change needs accepted behavior and a check that still detects an incorrect result.
5. Rerun affected proof after fixes. Reproduce unrelated broad failures narrowly and report them separately. Do not repeat passing checks without changed inputs or an unresolved concern, and do not treat intermittent success as resolution.

These mechanics do not extend the [publication review budget](../../AGENTS.md#publication-review). A reviewer or fresh agent can inspect the evidence independently when useful or required by that policy; a second agent is not mandatory for every small check.

## Cleanup before handoff

Leave the requested deliverables and a recoverable work state. A clean Git status is not the goal when authorized changes must remain uncommitted.

- Compare the final tracked and untracked changes with the starting state. Identify disposable artifacts introduced by this task, such as abandoned drafts, debug output, scratch scripts, generated previews, or test data.
- Remove only items whose ownership and purpose are known and which are no longer needed. Preserve user changes, other tasks' work, requested deliverables, private local instructions, and evidence or checkpoints needed to resume unfinished work.
- Capture the required result or preserve its reproducible source before deleting temporary evidence. Keep sensitive or local-only material outside the public file set. Record the location and reason for any temporary artifact that must remain in the task's existing handoff.
- Stop only processes started by this task that are no longer needed. Keep a preview the owner asked to use, and identify retained processes. Do not kill processes merely because they use a familiar port.
- Avoid blanket deletion of ignored files, broad `git clean`, resets, or history changes. Uncertain ownership is a reason to leave an item and report it. Branches, worktrees, external resources, and remote records follow their own authorization and lifecycle rules.
- Reinspect the diff and working state after cleanup. If cleanup changed a deliverable, rerun its affected proof and apply the existing review policy. Deleting scratch output does not require rerunning an unrelated build.

## Close the task with evidence

After verification and cleanup, follow [progress synchronization](knowledge-ownership.md#recording-delivery-across-systems). Confirm that the owning documents and status record match the actual result before handing work back. Do not convert unfinished synchronization into an unqualified completion claim.

Record the checked state, exact verification results and material limitations in the existing task or change record. Include applicable review/QA state, unresolved work and pending synchronization, plus any artifacts or processes the next person needs. Link detailed evidence once; do not repeat standing policy or enumerate unrelated checks.

Follow the [handoff contract](documentation-governance.md#active-work-and-handoff) for continuation. Report integration, publication and activation when relevant, keeping those states distinct from local completion.

## Further reading

[Agentic Verification by Addy Osmani](https://addyo.substack.com/p/agentic-verification) discusses giving agents evidence they can use to assess their work. This guide applies that idea within the project's existing scope, authorization, and review rules.
