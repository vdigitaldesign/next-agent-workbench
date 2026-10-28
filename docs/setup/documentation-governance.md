# Documentation Governance

This contract defines how repository documents are classified, maintained, and kept consistent with their authoritative sources.

## Editing contract

- Classify the document and identify the owner of each changed fact before editing.
- Give each fact one authoritative record. Other documents may carry a short summary and a link; they must not maintain a competing full copy.
- Read the relevant owner and its required references. [Knowledge ownership](knowledge-ownership.md) defines the repository/external boundary, the active source map, and how to resolve conflicts.
- Update the smallest current-state document alongside a behavior change. Include the document in the same change and pull request as the implementation.
- Add new owner documents to [the index](../project-setup.md) with a link and a one-line description.
- Remove stale current-state content. Use version history for old behavior instead of turning a living contract into a delivery diary.
- After establishing the initial policy, add a process rule only when the same change replaces or removes an existing rule. Prefer an executable check for mechanically decidable requirements.

## Document classes

### Current-state documents

Setup guides, technical contracts, and workflow documentation describe the implementation and operating model that actually exist. Separate local candidate status from merged or released behavior. Do not list planned commands, integrations, or checks as available.

### Specifications

A specification bounds an implementation task and cites its accepted inputs. Once approved, its scope is frozen. A change of direction creates a replacement specification and marks the previous one as superseded with a link; it does not silently enlarge the approved scope.

Historical procedural references preserve the policy in effect when written. Current agent policy governs execution; a policy update alone does not require rewriting an approved specification.

### Decisions

Decision records preserve rationale and alternatives. Product decisions and technical ADRs follow the locations designated by the knowledge ownership map.

Record acceptance separately from implementation. Use `Status: Proposed | Accepted | Superseded | Deprecated` and a separate `Implementation: Not started | In progress | Partially implemented | Implemented | Superseded` field when recording a decision. An accepted decision is not proof that code exists or permission to build it. Link a superseding decision rather than rewriting old reasoning as though it never existed.

### Target direction

Create target documents only for an actual accepted future direction. Record status, the condition for integrating it into current technical contracts, and the condition for retiring it. A target cannot replace the current implementation contract or authorize implementation by itself.

An owner must accept a material direction change. Once an authorized slice is implemented and verified, update the relevant current-state documents and record the target's remaining scope. Retire a target only when its retirement condition is met and incoming references have been updated.

### Active work and handoff

Active technical plans and task lists record bounded scope, a responsible owner, dependencies, current state, and the next action. Update an existing plan when continuing the same work; do not overwrite another unfinished task to start a new one.

Keep scope, authority and stops, changed files and Git state, verification and unfinished work in the existing task record. A separate handoff points there and names the next action and relevant restrictions; include essential context directly if the successor cannot access it. Link decisions and evidence instead of copying them. Follow [progress synchronization](knowledge-ownership.md#recording-delivery-across-systems).

### History and delivery status

Historical evidence is immutable after integration. Corrections add a clearly linked newer record rather than altering past evidence. History is not mandatory startup context for every task.

Use the designated status record for project progress. Keep completed entries true to their delivery moment; later work adds new evidence and updates current contracts. Do not create an audit report after every small task. Status timing, write confirmation, and pending synchronization follow [knowledge ownership](knowledge-ownership.md#recording-delivery-across-systems), including when all records live in the repository.

### Agent policy and navigation

[AGENTS.md](../../AGENTS.md) owns the operating rules agents follow. [CLAUDE.md](../../CLAUDE.md) imports that same file and must contain exactly `@AGENTS.md` followed by one newline.

The documentation index contains links and short descriptions. The README introduces the project and routes readers to the detailed owners; neither should repeat the full policy.

## Structure and growth

- Create specifications, ADRs, target documents, and history only when needed. Do not add empty directories or placeholder owners to imitate a larger project.
- Files under `docs/` use lowercase `.md`, start with an H1, and include an introductory paragraph stating their scope before the first H2. Keep binary assets outside this documentation tree.
- Specifications and historical reports carry a top-level status. Target documents also state their integration and retirement conditions; decision records use the separate fields above.
- Treat headings as link contracts. Retain a compatibility heading only when a real incoming reference requires it, and route it to the current owner.
- Keep living contracts and target content at or below 400 physical lines. Split by responsibility when needed, updating the index and incoming links in the same change.
- Keep agent instructions and skill routing focused. Do not inherit another repository's historical byte ceilings or remove useful conditions just to reach an arbitrary size. A future executable budget must be defined and reviewed for this project's actual content.

## Verification

For a documentation change, inspect the diff and run `npm run docs:check`. Confirm command examples against the actual project and check for duplicated or conflicting ownership. Preserve accepted scope, historical evidence, and unresolved limitations during prose edits.

[Quality gates](quality-gates.md#documentation-checker) owns the checker's scope, limits, and verification procedure. Passing structure and link checks does not prove semantic accuracy, complete external-source searches, decision acceptance, or authorization. Review those against their sources.
