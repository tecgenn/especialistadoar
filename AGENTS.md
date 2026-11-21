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

### Design skills

Design tickets declare the skills they need on a `**Skills:**` line, with the
exact reference files and searches. When executing a ticket, load those skills
from `.agents/skills/` and follow the listed references before editing UI code.
The ticket line is the instruction: the user does not need to name the skill
again in the request.

### Design-doc sync

Design tickets update `DESIGN.md` in the **same commit** as the code. The document
is the normative contract consumed by skills, `tokens.test.ts` and `impeccable
detect`, so a visual change that lands without it leaves the next ticket working
from a stale spec. Read it before implementing, record the final decision after
browser validation, and grep related terms (every `foco` line when changing the
focus color, for example) so older statements cannot contradict the new rule.
Only a deliberate catch-up pass should edit the doc outside a ticket.

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
- **Never hand-edit `data/build/` or `reports/`** — they are derived. Content changes
  go through the curated layer (`data/excecoes-manuais.jsonl`,
  `data/vinculos-confirmados.jsonl`, `data/marcas-catalogo.jsonl`) or through a format
  rule in the pipeline.
- **Before pushing:** run
  `pnpm build && pnpm build:site && pnpm lint && pnpm typecheck && pnpm test`
  and commit the regenerated artifacts. See the README.
- **Publication only via PR:** the merge into `main` is the deploy (ADR-0004). No
  workflow may publish without passing the PR gate.
