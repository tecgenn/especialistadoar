---
name: audit-project-knowledge
description: Periodic audit of the project's knowledge base for consistency and drift.
disable-model-invocation: true
---

# Audit Project Knowledge

Maintain the quality, consistency, and reliability of the project's knowledge base.

This is a **periodic** skill — not part of the normal development loop. Run it when the project has accumulated enough changes that documentation may have drifted.

## Frequency

Run after:

- major milestones
- large architectural changes
- when documentation becomes difficult to navigate
- once per month as a maintenance routine

## Process

### 1. Read all project docs

Read every file in scope. If a file does not exist, skip it silently.

Completion criterion: Done when every file in scope has been read or silently skipped.

- `AGENTS.md` at the repo root
- `docs/agents/architecture.md`
- `docs/agents/project-state.md`
- `CONTEXT.md` at the repo root (or each context's `CONTEXT.md` if `CONTEXT-MAP.md` exists)
- ADRs in `docs/adr/` (and `src/*/docs/adr/` in multi-context repos)

### 2. Audit each file

#### AGENTS.md

Look for:

- **Duplicate rules** — two rules that say the same thing in different words
- **Contradictory rules** — two rules that cannot both be true (e.g. "always write tests" vs "skip tests for quick fixes")
- **Stale rules** — rules that the code no longer follows (check against recent commits and code patterns)
- **Missing rules** — permanent conventions the project follows but AGENTS.md does not document

#### architecture.md

Look for:

- **Outdated modules** — modules listed that no longer exist in the codebase
- **Missing modules** — modules in the codebase not reflected in the doc
- **Stale interfaces** — method signatures or data flows that have changed
- **Outdated dependencies** — dependencies listed that are no longer used, or new dependencies not documented
- **Structural drift** — the described structure no longer matches the actual directory layout

Cross-reference with the actual codebase (`src/`, `lib/`, `packages/`) to verify.

#### project-state.md

Look for:

- **Frontier inconsistency** — tickets listed as unblocked whose blockers are not done
- **Completed log gaps** — tickets that were marked done but have no completed entry
- **Stale ticket references** — completed entries referencing tickets that don't exist in the tracker
- **Phase mismatch** — the described phase doesn't match the actual state of the project

#### CONTEXT.md (single or multi-context)

Look for:

- **Unused terms** — terms defined in the glossary but never referenced in code, tests, or issues
- **Duplicate terms** — the same concept defined under different names
- **Missing terms** — domain concepts used in code or issues but not in the glossary
- **Drifted definitions** — glossary definitions that no longer match how the term is used in code
- **Implementation details** — terms that describe code structure rather than domain concepts (CONTEXT.md is a glossary, not a spec)

If `CONTEXT-MAP.md` exists, check each context's `CONTEXT.md` for cross-context contradictions.

#### ADRs

Look for:

- **Contradictory ADRs** — two ADRs that recommend opposite approaches to the same concern
- **Reverted decisions** — ADRs whose decisions have been undone in code but not documented
- **Missing ADRs** — significant architectural decisions made in code without a corresponding ADR (check commit messages for "decided", "chose", "switched to")
- **Stale ADRs** — ADRs referencing code or patterns that no longer exist

Completion criterion: Done when every file type has been audited against its checklist.

### 3. Cross-reference between files

Check for contradictions **across** documents:

- AGENTS.md rule contradicts an ADR
- architecture.md describes a module that CONTEXT.md calls by a different name
- project-state.md references a ticket that no longer exists in the tracker
- ADR recommends an approach that architecture.md shows was not followed

Completion criterion: Done when all cross-document contradictions have been checked.

### 4. Generate audit report

```markdown
## Audit Report (YYYY-MM-DD)

### Summary

- **Critical:** X issues (must fix — active contradictions or stale data)
- **Warning:** Y issues (should fix — drift or gaps)
- **Info:** Z observations (consider fixing — opportunities to improve)

### AGENTS.md

[List issues with severity and suggested action]

Example:
- **Critical:** Rules #3 and #7 contradict — "always write tests" vs "skip tests for hotfixes"
  **Action:** Edit `AGENTS.md` to reconcile, or run `/grill-with-docs` to clarify the boundary

### architecture.md

- **Warning:** Module "PaymentProcessor" listed but does not exist in `src/`
  **Action:** Run `/grill-with-docs` to rewrite, or edit manually

### project-state.md

- **Info:** Frontier lists ticket #5 as unblocked, but its blocker #3 is still open
  **Action:** Run `/update-project-state` to fix, or edit manually

### CONTEXT.md

- **Warning:** Term "Order" defined as "a purchase request" but code uses it for "a fulfilled shipment"
  **Action:** Run `/grill-with-docs` to resolve the discrepancy

### ADRs

- **Info:** ADR-0003 recommends PostgreSQL but the codebase now uses SQLite
  **Action:** Run `/grill-with-docs` to record the decision change as a new ADR

### Cross-reference

- **Critical:** AGENTS.md rule "use UTC for all dates" contradicts ADR-0005 "use local timezone"
  **Action:** Run `/grill-with-docs` to resolve which is authoritative
```

Only include sections that have findings. Omit sections with no issues.

Completion criterion: Done when the audit report has been generated and presented to the user.

## Rules

This skill must:

- preserve project continuity
- suggest the specific skill or action to fix each problem
- prioritize critical issues (contradictions, stale data) over warnings (drift, gaps)
- flag only genuine problems — verify deliberate choices against commit messages and ADRs before flagging
- defer to `/update-project-state` for post-ticket updates
- defer to `/improve-codebase-architecture` for code architecture deepening

This skill must not:

- modify any project files
- make architectural decisions
