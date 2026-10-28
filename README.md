# Next Agent Workbench

A Next.js starter with working rules for Codex, Claude Code, and the people building with them.

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Why use it](#why-use-it) · [How it works](#working-with-agents) · [Project structure](#project-structure) · [Get started](#local-development) · [Skills](#recommended-skills) · [Background](#background) · [Documentation](docs/project-setup.md)

## Why use it

An agent can finish a change and still leave you work to do: check whether it followed the latest decision, undo an unrelated UI edit, work out what was tested, and bring the project tracker up to date. When those expectations live only in chat, the next session starts with another explanation.

Next Agent Workbench gives a new project a place for those expectations from the start. It combines a Next.js app with shared agent instructions and a small set of documentation guides. They define what an agent may change, where it should find decisions, what evidence a task needs, and what must be recorded before the work is handed back.

The workflow is useful when a project spans several tasks or people and you want decisions to survive a change of chat or agent. You keep the application code and adapt the rules to your project. There is no required knowledge service or subscription attached to the starter.

## Working with agents

Codex reads [AGENTS.md](AGENTS.md). [CLAUDE.md](CLAUDE.md) imports the same file for Claude Code, so the two hosts share one working policy. Check that your chosen host loads the instructions; their effect still depends on the agent following them and having the tools needed for the task.

The policy gives explicit answers to situations that otherwise need another prompt:

| Situation                                     | What the rules require                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A tooling fix starts touching product screens | Keep visible UI and copy outside the change unless the request includes them.                                                                           |
| A roadmap contains an accepted idea           | Establish whether implementation is authorized. Acceptance, permission, and shipped behavior are separate facts.                                        |
| A check passes                                | Compare its coverage with the requested outcome. Compilation alone does not establish that an interaction works.                                        |
| Review produces more suggestions              | Evaluate their substance. One remediation round and one re-review bound the publication review; a remaining blocker requires a scope decision.          |
| Work resumes in another session               | Recover the changed files, decisions, permissions, stop conditions, checks, and next action from the handoff.                                           |
| The implementation is done                    | Update affected documentation, remove temporary files the task no longer needs, and confirm authorized progress updates. Report anything still pending. |

For example, a request to correct setup instructions stays in documentation. The agent checks the affected links and claims against their sources, preserves your unrelated files, and reports what it checked. A small correction needs neither a new test suite nor a separate audit report.

A change to keyboard navigation needs different evidence. The agent must check the affected interaction and identify whether human QA is required. A successful production build covers compilation; the [verification guide](docs/setup/quality-gates.md) explains how to choose the remaining proof.

The starter includes ESLint, a production build command, and a documentation checker with its own regression tests. An application test suite and CI are not configured. The [command reference](docs/setup/quality-gates.md#available-commands) describes the available checks and their limits.

## Project structure

```text
next-agent-workbench/
├── app/
│   ├── page.tsx                    # Starter page
│   ├── layout.tsx                  # Root layout and metadata
│   └── globals.css                 # Tailwind and global styles
├── public/                         # Starter assets
├── scripts/
│   ├── check-docs.mjs              # Documentation structure and link checks
│   └── check-docs.test.mjs         # Regression tests for the checker
├── AGENTS.md                       # Shared agent operating policy
├── CLAUDE.md                       # Imports AGENTS.md
├── docs/
│   ├── project-setup.md            # Documentation index
│   ├── skills.md                   # Skill recommendations and task routing
│   ├── setup/
│   │   ├── local-development.md    # Runtime requirements and local setup
│   │   ├── knowledge-ownership.md  # Sources, decisions, and progress updates
│   │   ├── documentation-governance.md # Document types and maintenance
│   │   └── quality-gates.md        # Commands, verification, and cleanup
│   └── releasing.md                # Versioning and publication
├── .github/pull_request_template.md
├── next.config.ts
├── package.json
├── package-lock.json
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

[AGENTS.md](AGENTS.md) contains the rules that apply across tasks: scope, authority, review, manual QA, and handoff. It also directs agents to the installed Next.js documentation before framework work. The guides under `docs/` hold the details an agent needs for a particular task:

- [Local development](docs/setup/local-development.md) covers Node.js/npm requirements, starting the app, and configuration worth knowing about.
- [Knowledge ownership](docs/setup/knowledge-ownership.md) says where decisions live, how to resolve conflicting sources, and when to update progress.
- [Documentation governance](docs/setup/documentation-governance.md) separates current behavior, approved specifications, decisions, and historical evidence. It gives each fact one authoritative home so a README, roadmap, and implementation guide do not drift into competing versions.
- [Quality gates](docs/setup/quality-gates.md) connects a change to its proof and defines what to check, preserve, clean up, and report.
- [Skills](docs/skills.md) helps select additional guidance for the task and explains what to do when it is unavailable.

Specifications, decisions, and task records are created when the project has something to record.

## Local development

Use npm and a supported Node.js LTS release. The [local setup guide](docs/setup/local-development.md) explains runtime requirements, dependency installation, and the scaffold's configuration.

From a local copy:

```bash
npm ci
npm run dev
```

Open the local address printed by the server and edit `app/page.tsx`. For documentation checks, linting, and production preview, see the [command reference](docs/setup/quality-gates.md#available-commands).

## Make it your project

1. Set the application name and metadata, then update the lockfile through npm. Your application's version is independent of the starter's release version.
2. Write down the problem, scope, and accepted decisions for your product. Choose their locations in the [source map](docs/setup/knowledge-ownership.md#project-source-map).
3. Read `AGENTS.md` and adapt rules that depend on how you work. Verify instruction loading in your agent host and add only the skills or connectors your tasks need.
4. Replace this README with your product's introduction. Keep the useful technical guides, set contribution and release ownership, and start your application's own changelog while retaining required license notices.

Private workspace links and temporary coordination can live in ignored `AGENTS.local.md`. The shared policy explicitly tells agents to read it when present. Keep requirements that collaborators need in shared documentation, or give them an authorized brief; private context should not make a public contribution impossible to understand.

## Where decisions and progress live

We use [Superhuman Docs](https://superhuman.com/docs) for research, product direction, priorities, and release coordination. Its pages, comments, and tables let people work through those questions without a code checkout. Technical contracts, implementation specifications, and verification guidance stay beside the code so they can change in the same review.

You can use your own Superhuman Docs workspace, another service, or repository documents for everything. Give each fact one owning record. Record decision acceptance and implementation separately, and update progress from verified results.

For agent access to Superhuman Docs, see the official [Docs MCP overview](https://superhuman.com/docs/features/docs-mcp) and [connection guide](https://help.superhuman.com/hc/en-us/articles/46210076980365-Connect-to-the-Superhuman-Docs-MCP). The starter does not configure the connection. [Knowledge ownership](docs/setup/knowledge-ownership.md) explains source setup, access failures, conflicts, and confirmed status updates.

## Recommended skills

Next.js already supplies version-matched reference documentation in `node_modules/next/dist/docs/`; the generated instructions in `AGENTS.md` point agents there. Use that for framework APIs and conventions.

For additional task guidance, start with a small selection:

| Skill and source                                                                                                          | Use for                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/SKILL.md)  | GoogleChrome guidance for choosing native HTML, CSS and browser APIs, with browser compatibility and fallbacks.          |
| [vercel-react-best-practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md) | Vercel's guidance for React/Next.js data fetching and performance work.                                                  |
| [vercel-composition-patterns](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md) | When designing reusable component APIs or refactoring components with too many configuration props.                      |
| [next-dev-loop](https://github.com/vercel/next.js/blob/v16.4.3/skills/next-dev-loop/SKILL.md)                             | An official Next.js workflow for inspecting a running application, when its browser-tooling prerequisites are available. |

These are optional recommendations, not installed capabilities. The [selection guide](docs/skills.md) also covers Vercel UI review, Microsoft Playwright browser tooling, and Motion animation guidance, with prerequisites, overlap, installation choices, and fallbacks.

## Background

Next Agent Workbench grew out of my experience building a product with coding agents. These essays trace the decisions behind its rules:

- [Context Is Not Permission](https://vdigital.design/thoughts/context-is-not-permission): How I separated current behavior, accepted plans, and permission to implement, and gave each kind of project knowledge a clear owner.
- [The Process Became the Work](https://vdigital.design/thoughts/the-process-became-the-work): How checks and reviews became overhead, and why I narrowed verification and put a stopping point on review loops.

## Contributions, releases, and license

[CONTRIBUTING.md](CONTRIBUTING.md) explains how to propose and verify a change. [CHANGELOG.md](CHANGELOG.md) describes the public release contents; [the release guide](docs/releasing.md) defines versions and publication checks.

Projects created from Workbench evolve independently. Read upstream release notes and bring over changes that fit your project's own rules and requirements; updates are not applied automatically.

The workbench is licensed under [MIT](LICENSE). Retain the required copyright and permission notice when reusing it, including the [Next.js scaffold notice](THIRD_PARTY_NOTICES.md). Third-party dependencies retain their own licenses.
