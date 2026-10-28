# Contributing

Contributions should help people start and maintain a Next.js project with coding agents. Keep the shared workflow portable, the documentation accurate, and the application scaffold small.

## Proposing a change

For a bug, describe the behavior, expected result, relevant runtime or agent host, and the smallest steps that reproduce it. Include logs only after removing credentials and private project data.

For a substantial change to the workflow, dependencies, or starter scope, discuss the problem and proposed outcome with a maintainer before building it. A small correction with clear scope can go straight into a focused contribution. An accepted proposal and permission to implement or publish remain separate; agent work follows [AGENTS.md](AGENTS.md).

Useful contributions include reproducible workflow fixes, clearer documentation, checks for actual failure modes, and improvements that keep new projects independent of a particular product or personal tool setup.

## Working locally

Follow [local development](README.md#local-development) and use npm with the checked-in lockfile. Keep unrelated dependency upgrades and formatting out of your change.

Use a separate branch for a new change. Preserve existing local work. Read the documentation owner for the area you are changing; [the index](docs/project-setup.md) is the entry point. If private maintainer context is needed, request a task brief or access before making a dependent decision.

Keep machine-specific preferences and private workspace references out of tracked files. Root `AGENTS.local.md` is ignored and explicitly read through the shared policy; it must not become a hidden requirement for public contributors.

## Verification

Follow [quality gates](docs/setup/quality-gates.md) for actual commands, proof selection, test integrity, and result reporting. [AGENTS.md](AGENTS.md#verification-and-manual-qa) owns manual QA and publication boundaries. Verify the intended behavior and describe what the chosen checks do not establish.

Before handoff, complete the guide's [cleanup and closeout](docs/setup/quality-gates.md#cleanup-before-handoff). Keep useful evidence and other people's work, remove only task-owned disposable artifacts, and confirm authorized documentation and status updates. Report unresolved synchronization instead of marking the whole task complete.

## Preparing a contribution

Explain the problem, the resulting behavior, and how you verified it. Link the relevant decision or issue when one exists. Document changed behavior in its smallest authoritative guide and add a meaningful user-facing entry under **Unreleased** in [CHANGELOG.md](CHANGELOG.md). Pure spelling and formatting corrections do not need a changelog entry.

Keep the diff focused and leave product UI unchanged for documentation, configuration, and tooling work unless that surface is part of the request. Include screenshots or reproduction steps when they help a reviewer assess an actual interface change.

Agent-assisted work must preserve the owner's authorization and stop conditions. [The publication review policy](AGENTS.md#publication-review) governs review and remediation. A clean review does not authorize a merge, release, or deployment; maintainers handle those actions under [the release guide](docs/releasing.md).

## Licensing

Contribute only material you have the right to share under the project's [MIT license](LICENSE). Preserve required notices and identify copied third-party material and its license. Do not paste private instructions, paid skill content, or another project's internal documents into the repository without the necessary rights and permission.
