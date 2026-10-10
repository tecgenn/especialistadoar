---
name: prime
description: "Load a repo's project docs and codebase, then surface the frontier ticket — the one ready to implement next — without implementing it."
disable-model-invocation: true
---

# Prime

Orient to a repo's current state before touching any code. Pairs with `/implement`: `prime` finds and names the next ticket; `/implement` is what actually builds it, run separately once the user confirms.

## Process

### 1. Read the project's docs

Read whatever of the following exists; skip in silence what doesn't — don't stall waiting for docs nobody wrote:

- `AGENTS.md` or `CLAUDE.md` at the repo root — the entry point, usually pointing at `docs/agents/`.
- `CONTEXT.md` or `CONTEXT-MAP.md` — the domain glossary.
- Every `.md` file under `docs/agents/`, in particular `project-state.md` (what's shipped, what's mid-flight, what's next), `architecture.md`, `domain.md`, and `issue-tracker.md`.

Done when every doc that exists has been read in full, not skimmed. If none of this exists, explore the repo directly instead and say so in your report.

### 2. Get the lay of the codebase

Skim the source tree, entry points, and manifest (`package.json` or equivalent) far enough to speak concretely about the stack `architecture.md` describes.

Done when you could describe the stack and top-level structure in three sentences without opening another file.

### 3. Find the frontier

The **frontier** is the one ticket ready to be picked up next — open, unblocked, unclaimed, first by order (same sense as in `/to-tickets` and `/wayfinder`).

- If `project-state.md` names a next ticket, treat it as the leading candidate.
- Verify it against wherever tickets actually live (follow `docs/agents/issue-tracker.md`'s convention, or a local tickets/issues folder) — a status doc goes stale. If the candidate is already done or still blocked, walk forward to the real frontier and flag the mismatch to the user.
- With no status doc at all, find the frontier from the tracker alone.

Done when you can name exactly one ticket, or state plainly that none are ready.

### 4. Report and stop

Tell the user, in order:

1. A two- or three-line status of the project — what it is, what's built, where it stands.
2. The frontier ticket: its title/id, what it delivers end-to-end, and any blockers you had to check.
3. One line confirming you're ready to start.

Gathering context is the whole job here. Stop the moment you've reported — don't write, edit, or run any code, and don't open `/implement` yourself. The user drives that next step.
