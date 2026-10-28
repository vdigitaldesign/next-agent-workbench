# Local development

This guide explains the runtime requirements, local setup, and configuration of the Next.js scaffold. [Quality gates](quality-gates.md#available-commands) owns the full command reference and verification policy.

## Requirements

Use npm and an actively supported [Node.js LTS release](https://nodejs.org/en/about/previous-releases) that satisfies the installed Next.js requirement. Next.js `16.4.3` declares Node.js `>=20.9.0`; this is the framework's minimum, not a recommendation to install an end-of-life Node release or a tested Workbench version matrix.

The repository uses `package-lock.json` with lockfile version 3. It does not pin Node.js or npm through `engines`, `packageManager`, `.nvmrc`, or `.node-version`. Check the versions selected by your shell or IDE with:

```bash
node --version
npm --version
```

Use npm for this lockfile. When your project adopts a runtime or package-manager pin, record it here and keep local and CI environments consistent.

Git is required by the [documentation checker](quality-gates.md#documentation-checker). Run it from the Git repository root. If you started from a ZIP download or another copy without Git metadata, run `git init` in the project directory first; no commit is needed.

## Install and start

From the project root:

```bash
npm ci
npm run dev
```

[`npm ci`](https://docs.npmjs.com/cli/v11/commands/npm-ci/) installs the locked dependency tree, replaces an existing `node_modules`, and fails if the manifest and lockfile disagree. Use npm to update the lockfile when intentionally changing dependencies.

The development server normally starts at [localhost:3000](http://localhost:3000). Use the address printed in the terminal. Edit `app/page.tsx` to change the starter page; `app/layout.tsx` owns the root layout and metadata, and `app/globals.css` contains the global styles.

The scaffold needs no application-specific environment variables or external accounts. Document environment requirements when you add a feature that needs them; keep credentials out of the repository.

## Lint and production preview

```bash
npm run lint
npm run build
npm run start
```

Lint runs ESLint. Build compiles the production application. Start serves that build and requires a successful build first; use `dev` for normal editing. These commands have no combined verification script. See [quality gates](quality-gates.md#match-proof-to-the-change) for choosing the checks relevant to a change.

## Configuration to know about

- `next.config.ts` enables Cache Components and partial prefetching. Tailwind CSS is processed through the configured `@tailwindcss/turbopack` loader. Consult the installed `node_modules/next/dist/docs/` before changing framework behavior.
- `tsconfig.json` enables strict TypeScript checking and maps `@/*` to the repository root.
- `eslint.config.mjs` uses Next.js Core Web Vitals and TypeScript presets. Generated Next.js output is excluded from linting.
- `app/layout.tsx` loads Geist and Geist Mono through `next/font/google`. Next.js downloads the font files during build and serves them with the application; a clean build needs access to the font provider when the files are not cached. Browsers receive the self-hosted files.

Dependency downloads also need registry access unless the required packages are cached. Install scripts follow npm's effective configuration. The repository has no `.npmrc` or executable build-script allowlist; the approval rules in [AGENTS.md](../../AGENTS.md#verification-and-manual-qa) do not configure npm. Inspect the actual controls before changing script permissions, and keep personal npm settings out of the starter.
