# Agent instructions

## Agent skills

### Session start

At the start of each session, read the files below that exist. Skip, without
comment, any that don't: `CONTEXT.md` and `architecture.md` are created lazily
by `/grill-with-docs`.
- `docs/agents/project-state.md` — what's been built, what's next, what's blocked
- `docs/agents/architecture.md` — how the codebase is structured (if it exists)
- `CONTEXT.md` (or each context's `CONTEXT.md` via `CONTEXT-MAP.md`) — domain glossary and vocabulary (if it exists)
- `docs/agents/issue-tracker.md` — where issues live and how to interact with them

### Issue tracker

Issues and PRDs live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles mapped 1:1: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
