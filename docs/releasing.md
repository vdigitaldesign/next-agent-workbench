# Releasing

This guide owns versioning and publication of the starter repository. A project created from it has its own release process and application version.

## What a version covers

A Workbench release identifies a repository snapshot: the scaffold, agent entry points, documented workflow, commands, and documentation contracts. The compatibility surface includes their documented paths and meaning, installation requirements, and the supported setup.

Use [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for release tags:

- **Patch:** corrections that preserve the documented setup and workflow contract.
- **Minor:** compatible additions. While the project is below `1.0.0`, use a minor version for incompatible changes too, and label each one explicitly in the release notes.
- **Major:** incompatible changes after `1.0.0`, such as removing an entry point, changing required workflow behavior, or dropping a supported runtime.

A dependency bump is assessed by its effect on people using the starter; it does not mechanically copy the dependency's version category. Explain any migration steps and changed requirements.

The package version is candidate metadata until a corresponding tag and release exist. Keep the manifest and npm-generated lockfile aligned with the selected starter release version. Never hand-edit the lockfile. After adoption, an application's package version is independent of Workbench.

## Changelog and release record

Maintain [CHANGELOG.md](../CHANGELOG.md) for meaningful changes, grouped under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security` as needed. Omit empty groups and raw commit-log dumps.

Keep pending entries under **Unreleased**. During an authorized release, move that batch into a versioned section with the actual release date, retain an Unreleased heading, and add working comparison or release links once the remote exists. Do not fabricate release dates or treat a scaffold version as a published release.

The Git tag uses `vMAJOR.MINOR.PATCH` and points to the reviewed commit. The GitHub release identifies that tag, summarizes the relevant changelog entries, and calls out breaking changes, migration steps, and known limitations. Do not move a published tag to fix an error; issue a subsequent version.

## Prepare the candidate

Readiness and permission to publish are separate. Existing owner restrictions still apply. Keep preparation within the authorized scope and record evidence in the project's designated release tracker, rather than adding a release diary to current-state documentation.

Before requesting readiness acceptance:

- Verify the documented installation path in a disposable directory using the exact intended file set. Check agent entry points, required documentation, dependencies, and any hidden files the distribution must preserve.
- Run every applicable configured gate. Verify the production build and a basic startup for a release candidate, and exercise the advertised agent workflow from a fresh context. Record commands, versions, results, and missing coverage.
- Review the public inventory, including untracked files selected for inclusion and the Git history intended for publication. Exclude local agent context, private workspace links, credentials, IDE state, generated output, temporary tasks, and research notes.
- Check the license and provenance of copied code, documentation, assets, and skills. The project license does not replace third-party obligations.
- Confirm the README and setup guides describe only available behavior. Check links, example commands, badges, and any installation claims.
- Complete [publication review and applicable manual QA](../AGENTS.md#publication-review) on the exact candidate. Record remaining limitations for the owner's readiness decision.

Do not mark a failed or unrun requirement as passed. A local check cannot establish remote branch protection, GitHub settings, or the contents of a future public clone.

## Publish and verify

After readiness acceptance, retrieve explicit authorization for the intended commit, push, repository visibility, tag, and release actions. GitHub configuration, deployment, and npm publication each need their own applicable authorization; none follows automatically from a clean review.

1. Create the reviewed commit and publish it through the repository's configured integration process. Preserve the approved scope and required checks.
2. Inspect the resulting remote commit and public files. Verify any enabled template setting, repository topics, contribution links, license detection, and status badges against the real configuration.
3. Create the matching version tag and GitHub release within the authorized scope.
4. Verify the documented adoption path from the published version in a clean directory. Check the copied file set, install, build, and agent instructions; report the exact source revision.
5. Record the release URL, revision, verification, and any excluded deployment or activation in the designated release tracker.

Repository publication, template creation, and npm package publication are different distribution paths. The application package remains private; this repository does not supply a published installer package.

## Adopting upstream changes

Projects created from the starter receive no automatic updates. Read the changelog, compare the relevant files, and apply only changes that fit the application's own workflow and requirements. Review agent-policy changes as changes to that project's operating contract, not as a routine dependency update.
