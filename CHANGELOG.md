# Changelog

Release contents and adoption notes for Next Agent Workbench. Versioning follows [the release guide](docs/releasing.md).

## Unreleased

### Added

- GitHub Actions checks for pull requests and pushes to main, with documentation, checker, and application checks selected from the changed files.
- README instructions for creating a project from the GitHub template and adapting package metadata, product identity, documentation, and agent rules.

## [0.1.0](https://github.com/vdigitaldesign/next-agent-workbench/releases/tag/v0.1.0) - 2026-10-29

Initial public release.

### Added

- A Next.js App Router scaffold with React, TypeScript, Tailwind CSS, ESLint, and an npm lockfile.
- Shared instructions for Codex and Claude Code covering task scope, authorization, review, manual QA, and handoff between sessions.
- Proportionate verification guidance, concise handoffs that reuse task status, and cleanup of task-owned temporary work.
- A local documentation checker for Markdown structure, repository links, heading anchors, and the shared agent-file contract, with regression tests using Node.js's built-in test runner.
- Documentation rules for current contracts, specifications, decisions, and history, with source ownership and progress synchronization across repository documents or an optional external workspace.
- A focused skill guide with Next.js reference documentation, selected Vercel/Next.js workflows, prerequisites, and fallbacks.
- Contributor guidance, a pull request template, starter versioning and release instructions, and an MIT license.
