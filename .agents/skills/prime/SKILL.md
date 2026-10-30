---
name: prime
description: "Resume a ticket-based project in a fresh session: load only the context needed to name the frontier ticket — the one ready to implement next — without implementing it."
disable-model-invocation: true
---

# Prime

Orient a fresh session on a project already running the ticket flow and name its **frontier**: the first open, unblocked, unclaimed ticket in the tracker's order (same sense as `/to-tickets` and `/wayfinder`). Then stop; `/implement` builds it once the user confirms.

Load the minimum that supports a correct answer, and widen only when a check forces you to. What a doc says is **documented**; it becomes **verified** once checked against the tracker, git, or code. Report the two apart.

Read-only: no code, no doc edits (`/update-project-state` owns `project-state.md`), nothing that touches the working tree or uncommitted changes.

## Process

### 1. Read the core and confirm the project is in the flow

Read in full whichever exist, skipping the rest in silence:

- `AGENTS.md` / `CLAUDE.md` at the repo root — only if the harness hasn't loaded it, and once if one points at the other.
- `docs/agents/project-state.md`
- `docs/agents/issue-tracker.md`

No `issue-tracker.md` means `/setup-matt-pocock-skills` never ran: a greenfield repo, or one that hasn't entered the flow. `prime` resumes the flow, it doesn't start it. End here and point to where it begins — `/setup-matt-pocock-skills`, then `/grill-with-docs` (which builds `CONTEXT.md` and `architecture.md` as it explores the code).

Done when the core docs are read, and you've either confirmed the flow is set up or ended with that pointer.

### 2. Verify the frontier candidate

Take the first Frontier row of `project-state.md` as the leading candidate — a hint, not an authority. With no state doc, derive it from the tracker.

Check it at the tracker, following `issue-tracker.md`: open, no open blocker, no assignee or claim. Read the candidate and its blockers; list the wider tracker only when the candidate fails. A candidate that is done, blocked, claimed, or missing means the state doc is stale — walk forward in tracker order to the first eligible ticket and flag the mismatch.

When the tracker or its ordering is unclear, report the ambiguity rather than choosing. Status, blocker, and claim checks are never traded for fewer reads.

Done when you can name one ticket whose status and blockers you read at the tracker, or state that none is ready (tracker empty, all done, or all blocked).

### 3. Check the working tree

Run `git status --short` once and note uncommitted changes that could bear on the candidate. Leave them as they are.

Reach for `git log` only when the state doc looks unreliable — the candidate was already done, or a Completed entry has no matching commit (`git log --grep` on its ticket reference, in the format `issue-tracker.md` prescribes). Read just enough history to settle that question.

Done when relevant uncommitted changes are noted and any doubt about the state doc is settled or flagged.

### 4. Load context for this ticket

Read the candidate ticket in full — scope, acceptance criteria, blockers — plus its parent spec only when the ticket alone leaves its scope unclear.

Pull in a supporting doc only when it bears on this ticket:

- `architecture.md` and `domain.md` when the ticket touches the modules or conventions they describe.
- `CONTEXT.md` (or the relevant context via `CONTEXT-MAP.md`) when the ticket uses domain terms you can't place.
- Any of them, scoped to the affected area, when core docs are missing, contradictory, or outdated.

Open source files only to verify a claim that matters: a blocker's work exists, a dependency is real, the ticket's premise holds. Scale this to the ticket's risk; a small ticket under consistent docs needs none. When the ticket depends on something the docs call built, confirm it in code or tests.

Done when you can state the ticket's end-to-end outcome, acceptance criteria, and blockers, each marked verified or documented, with material uncertainty noted.

### 5. Report and stop

In order:

1. **Project status** — two or three lines: what the project is, what's documented as built, where it stands.
2. **Frontier ticket** — id and title, end-to-end outcome, the acceptance criteria that matter, and the blockers you verified. If none is ready, say so and why; with no tickets in the tracker, point to `/to-tickets`.
3. **Context gaps** — only missing, contradictory, or outdated information that could materially affect implementation. Omit when none.
4. **Ready** — one line confirming you can start `/implement` once the user says so. Omit when no ticket is ready.

Stop the moment you've reported.
