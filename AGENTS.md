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
- `docs/agents/ci-cd-setup.md` — the manual GitHub + Cloudflare setup the CI/publication needs (read when touching CI, secrets or deploy)

### Issue tracker

Issues and PRDs live as markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

Ticket references in commits follow the **tracker mode**: `Ticket: 10` on the last
line for the local markdown tracker; `(#123)` when the tracker is GitHub. See
`docs/agents/issue-tracker.md`.

Commit messages are written in **English** — subject, body and the ticket
reference line — regardless of the language used in code comments and docs.

### Triage labels

Five canonical roles mapped 1:1: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### CI/CD and publication

- The workflows live in `.github/workflows/`; everything they need **outside git**
  (repo secrets/variables, branch protection, the Cloudflare Pages project) lives in
  `docs/agents/ci-cd-setup.md`. Update that file in the same commit as any change to
  those manual steps.
- **Repo convention:** `data/build` and `reports` are *committed* artifacts and must
  match a fresh `pnpm build` — CI fails otherwise, so a change to the raw snapshot or
  the curated layer must be committed together with the regenerated artifacts.
- **Before pushing:** run
  `pnpm build && pnpm build:site && pnpm lint && pnpm typecheck && pnpm test`
  and commit the regenerated artifacts. See the README.
- **Publication only via PR:** the merge into `main` is the deploy (ADR-0004). No
  workflow may publish without passing the PR gate.
