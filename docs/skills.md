# Skills and task routing

Use a skill when its guidance helps with the current task. This guide recommends a small set for Next.js and React and points to the project rules that still apply. Skills are optional additions to the agent's environment; none is bundled or installed by this starter.

## Start with the project's own sources

Read [AGENTS.md](../AGENTS.md), identify the affected code or documentation owner, and check which tools and skills are actually available. For work across several areas, identify every affected concern and read its relevant owner and selected skill. Planning or workflow guidance does not replace the domain guidance needed for the task. Select the smallest set that covers those concerns and read its instructions before using it. A skill's description is not evidence that it is installed, suitable for this version, or authorized to make a change.

For Next.js APIs and conventions, use `node_modules/next/dist/docs/` from this project's installed package. The generated block in `AGENTS.md` directs agents there. These files supply framework reference knowledge without another skill installation. See the [official Next.js agent guide](https://nextjs.org/docs/app/guides/ai-agents).

The old [next-skills repository](https://github.com/vercel-labs/next-skills) now documents a migration: the standalone `next-best-practices` and `next-upgrade` reference skills have retired. Current workflow skills live in the Next.js repository. Check the skill against the project's installed framework version before adopting it.

## Recommended selection

### Native web platform features

Use [modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance/blob/main/skills/modern-web-guidance/SKILL.md) before implementing relevant HTML, CSS, or browser API behavior. Published under GoogleChrome and supported by the Chrome and Edge teams and the community, [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) helps with layout, forms, accessibility, performance, and other client-side work. It can identify a native browser feature before you introduce a custom implementation or dependency. The project describes the collection as a preview.

Follow the project's browser-support policy. The skill defaults to Baseline Widely Available features and calls for applicable fallbacks for newer features unless the project explicitly adopts another policy. Browser compatibility is part of the choice; a newer API alone is not a reason to rewrite a component. Use Vercel's interface guidelines for relevant review afterward, and verify the actual browser behavior.

Read the [setup instructions](https://developer.chrome.com/docs/modern-web-guidance/get-started) before installation. The CLI's search runs locally, but `npx` can fetch executable packages and the tool sends usage telemetry, including search queries. Use generic capability queries without private project details; `DISABLE_TELEMETRY=1` opts out. The installer currently uses the skills CLI, with its separate runtime requirements described below. Workbench does not install this skill or add it as an application dependency.

### React and Next.js performance

Start with [vercel-react-best-practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md) when writing or reviewing React/Next.js code. Vercel maintains this guidance for data fetching, rendering, and performance. Apply the rules relevant to the change; a small component task does not authorize a whole-application optimization pass.

### Reusable component design

Add [vercel-composition-patterns](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md) when component APIs become difficult to extend or reuse. Its focus is composition and state ownership, which complements the performance guide. A simple one-off component may not need it.

Both React guides come from Vercel. For React's own API definitions, use the [React reference](https://react.dev/reference/react).

### Checking a running Next.js application

Use [next-dev-loop](https://github.com/vercel/next.js/blob/v16.4.3/skills/next-dev-loop/SKILL.md) for runtime inspection when its prerequisites fit the project. The linked version matches the starter's Next.js `16.4.3` baseline. It requires Next.js 16.3 or later, Turbopack, a running application, and `agent-browser` 0.31.1 or later. After upgrading Next.js, reassess the corresponding workflow version.

This skill is useful for application behavior and unnecessary for documentation-only edits. Check that the browser tooling is available and its use is authorized. If it is missing, use another suitable, authorized runtime tool or report the verification gap. A skill's setup instructions do not authorize installing a tool, upgrading the framework, or exposing a preview.

## Useful additions for specific work

### UI and accessibility review

[web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md), maintained by Vercel, is useful when reviewing interface changes. It covers issues such as labels, keyboard access, focus, forms, and motion. The skill fetches a separate, living guideline source; assess each finding against the changed UI and the project's design decisions. It does not establish a visual direction or certify accessibility. Check real browser behavior where reading the source is insufficient.

### A Playwright browser workflow

Microsoft's [playwright-cli skill](https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/SKILL.md) supports browser interaction, screenshots, and debugging. Choose it when Playwright fits the available environment. It is an alternative browser workflow; it does not satisfy the `agent-browser` prerequisite inside `next-dev-loop`. Use one suitable route for a task, and distinguish exploratory browser checks from a maintained regression test suite.

The current [CLI installation guide](https://playwright.dev/agent-cli/installation) requires Node.js 20 or newer. Setup can create workspace files and download a browser. Inspect those effects and the chosen installation scope before adopting it; the starter includes neither this CLI nor an E2E suite.

### Animation guidance

Motion maintains an official [motion skill](https://github.com/motiondivision/ai-kit/blob/main/plugins/motion/skills/motion/SKILL.md) for animation work. Its local best-practice guidance works without an MCP connection. The separate [AI Kit installer](https://motion.dev/docs/ai-kit-install) installs skills and configures MCP, so review those changes before running it. A skill installation does not add an animation dependency to the application.

Workbench has no Motion runtime dependency. Use CSS for simple hover transitions. Consider the [`motion` package](https://motion.dev/docs/react-installation) when a feature needs coordinated enter/exit, layout, or gesture animations. Keep client boundaries small and verify hydration, reduced-motion behavior, and the actual interaction. Motion supports Next.js App Router, but the combination with this starter's exact configuration has not been tested. Its [`MotionConfig`](https://motion.dev/docs/react-motion-config) defaults to `reducedMotion="never"`; choose the behavior deliberately when integrating it.

## Choose by task

| Task                                  | Project guidance                                                                                                               | Additional capability when useful                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Framework API or convention           | Installed Next.js docs and the affected code                                                                                   | A version-compatible Next.js workflow for the specific task.                                        |
| Native HTML, CSS, or browser APIs     | Accepted behavior, browser-support requirements and [quality gates](setup/quality-gates.md)                                    | `modern-web-guidance` before implementation; interface review where relevant.                       |
| React implementation or performance   | Accepted task scope and [quality gates](setup/quality-gates.md)                                                                | `vercel-react-best-practices`.                                                                      |
| Reusable component API                | Existing component usage and the accepted interface                                                                            | `vercel-composition-patterns`.                                                                      |
| Runtime behavior or interaction       | [Verification and manual QA](../AGENTS.md#verification-and-manual-qa)                                                          | `next-dev-loop` or `playwright-cli` with its own prerequisites, or another suitable available tool. |
| UI semantics and accessibility        | Changed UI and [verification guidance](setup/quality-gates.md)                                                                 | `web-design-guidelines`, plus browser checks where needed.                                          |
| Animation behavior                    | Accepted interaction and [manual QA policy](../AGENTS.md#verification-and-manual-qa)                                           | The official `motion` skill when the task calls for animation guidance.                             |
| Documentation, decisions, or progress | [Documentation governance](setup/documentation-governance.md) and [knowledge ownership](setup/knowledge-ownership.md)          | An available writing or document tool if needed; no React skill is required.                        |
| Review and closeout                   | [Publication review](../AGENTS.md#publication-review) and [task closeout](setup/quality-gates.md#close-the-task-with-evidence) | The available review capability or explicit independent review required by the policy.              |

For a task outside these rows, find its affected code and current documentation owner through [the index](project-setup.md), then select capabilities from the actual catalog. Revisit the selection when scope changes. Tooling guidance does not replace a product decision or permission to act.

## Install selectively

Use the [official skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) to inspect a collection and select individual skills. The current [CLI requirements](https://github.com/vercel-labs/skills/blob/main/README.md) specify Node.js 22.20 or newer. This optional tool has its own runtime requirement; do not infer the application's supported Node versions from it. For example:

```bash
npx skills add vercel-labs/agent-skills --list
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices --agent codex
```

The first command lists skills; `npx` may still fetch the CLI. The second installs one skill for Codex in the project. Choose the agent and installation scope you actually use; `-g` selects personal installation. Do not install an entire collection just to get one recommendation.

Before adding files to the repository, inspect the selected skill and its source. After installation, review the resulting files, source revision, license, lock information, and agent links. Keep personal tool settings out of the template and avoid duplicate copies from several plugins. These examples are installation choices, not part of the application's npm scripts or proof that the skills have been tested in Workbench.

## When to add more

Add a skill for a task you have. Cache adoption, bundle analysis, deployment, React Native, and animation each need their own scope and proof; none is a prerequisite for this starter. Some overlap with the recommendations above, so choose the guidance that answers the actual problem before expanding the catalog.

If a selected skill is unavailable, use the project owner and primary framework documentation where they provide enough guidance. Report a missing capability when it affects the result. If it prevents required verification or acceptance, keep that part of the work pending. A fallback does not relax the project's checks, review limits, or authorization rules.
