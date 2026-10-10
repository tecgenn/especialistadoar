---
name: update-project-state
description: "Preserve project memory after development work. Use after /implement and /code-review, when a task completes, or when the user says 'update state'. Updates project-state.md, marks tickets done, flags review needs for architecture.md, AGENTS.md, CONTEXT.md, or ADRs."
---

# Update Project State

Maintain the operational memory of the project after validated development work.

The main objective is ensuring that a future AI agent, developer, or different model can continue the project without reconstructing previous conversations.

## Core Principle

Responsibilities are separated:

- **`/grill-with-docs`** — understanding, discovery, domain knowledge, terminology, architectural decisions
- **`/implement`** — building changes
- **`/code-review`** — validating implementation quality
- **`/update-project-state`** — preserving project memory

## When To Run

Run after:

- as the step right before `/implement`'s commit (or, when run standalone, before committing)
- completed features
- significant refactors
- before ending a long development session

## Process

### 1. Read project-state.md

Read `docs/agents/project-state.md`. If it does not exist, stop — run `/setup-matt-pocock-skills` first.

Completion criterion: Done when project-state.md has been read or the stop condition triggered.

### 2. Update project-state.md

Analyze what was just built and update the file:

**Frontier** — rewrite this section entirely. Derive it from the issue tracker per `docs/agents/issue-tracker.md`: open tickets with no open blocker and no assignee. Don't reconstruct it from memory of this session — the tracker is the source of truth for ticket status.

**Completed** — append a new entry (never edit past entries):

```
### NN — Ticket title (YYYY-MM-DD)

- **Changed:** key files/modules affected
- **What works:** the behaviour this ticket delivered
- **Ticket:** #NN (local tracker: `NN-slug`)
```

Completion criterion: Done when Frontier rewritten and Completed entry appended.

### 3. Mark the ticket as done

In the configured tracker:

- **Local files** (`.scratch/` or `tickets/`): update the ticket's `Status:` field to `done` and mark all checkboxes as `[x]`
- **GitHub/GitLab**: close the issue following `docs/agents/issue-tracker.md`'s convention, e.g. `gh issue close <n> --comment "Done — see project-state.md entry NN"`. Don't use a `done` label — it isn't part of the triage vocabulary, and native blockers only clear when the blocking issue is closed.

Completion criterion: Done when ticket is marked done in the tracker.

### 4. Analyze architecture.md

Read `docs/agents/architecture.md`. If it does not exist, skip this step.

Review whether recent changes affected:

- system structure
- modules
- dependencies
- data flow
- technical boundaries
- infrastructure

If the architecture changed significantly, add it to the "Review Needed" section of the final report. Do not rewrite automatically.

Completion criterion: Done when architecture.md has been reviewed and flagged if needed.

### 5. Analyze AGENTS.md

Read `AGENTS.md` at the repo root. If it does not exist, skip this step.

Review whether recent changes revealed a new permanent engineering rule.

**Requires review:**

- a new mandatory testing rule
- a new coding standard
- a permanent repository convention

**Does not require review:**

- a one-time implementation choice
- a local code pattern
- a temporary workaround

If needed, add it to the "Review Needed" section. Do not modify automatically.

Completion criterion: Done when AGENTS.md has been reviewed and flagged if needed.

### 6. Analyze CONTEXT.md

Do not modify CONTEXT.md.

Check whether changes introduced:

- new business concepts
- new terminology
- changed domain rules

If a `CONTEXT-MAP.md` exists at the root, check each context's `CONTEXT.md` that is relevant to the area changed.

If changes are detected, add it to the "Review Needed" section with the action: "Execute `/grill-with-docs` to resolve the new terms."

Completion criterion: Done when CONTEXT.md has been reviewed and flagged if needed.

### 7. Analyze ADRs

Never create, modify, or delete ADRs.

If a significant architectural decision was discovered during the work — one that is hard to reverse, surprising without context, and the result of a real trade-off — add it to the "Review Needed" section with the action: "Execute `/grill-with-docs` to document the decision."

Completion criterion: Done when ADRs have been reviewed and flagged if needed.

### 8. Final Report

After analysis, produce a summary:

```markdown
## Updated

- `docs/agents/project-state.md` — Frontier rewritten, completed log appended
- Ticket marked as done in [tracker]

## Review Needed

[Only include items that actually need review — omit this section entirely if nothing was flagged]

### architecture.md
- [what changed and why it needs review]
- **Action:** Run `/grill-with-docs` to rewrite, or edit manually

### AGENTS.md
- [what new rule was detected]
- **Action:** Add the rule manually to `AGENTS.md`

### CONTEXT.md
- [what new concept or term was introduced]
- **Action:** Run `/grill-with-docs` to resolve the term

### ADR
- [what decision needs documenting]
- **Action:** Run `/grill-with-docs` to create the ADR
```

Completion criterion: Done when the final report has been produced.

## Rules

This skill must:

- preserve project continuity
- keep `project-state.md` accurate
- avoid duplicating knowledge
- suggest changes instead of making uncertain decisions
- defer to `/grill-with-docs` for terminology, domain knowledge, and documenting decisions
- flag CONTEXT.md and ADR changes for review instead of modifying them directly
- wait for user confirmation before rewriting `architecture.md` or `AGENTS.md`

This skill must not:

- make architectural decisions
