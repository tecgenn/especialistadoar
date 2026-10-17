# Issue tracker: Local Markdown

Issues and specs (you may know a spec as a PRD) for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` — never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Referência do ticket no git

A forma da referência do ticket numa mensagem de commit (e no título/corpo do PR)
depende do **modo do tracker**, porque o GitHub transforma todo `#NN` num link
para a issue/PR de mesmo número:

- **Tracker local (markdown, este modo):** `Ticket: 10` — o número do arquivo,
  **sem `#`**. O `#` linkaria um **PR** de mesmo número, que não é o ticket.
- **Tracker GitHub:** `(#123)` — aí o link para a issue é o objetivo; o número é
  único entre issues e PRs, então resolve certo (`Closes #123` no corpo do PR
  fecha o ticket no merge).

Regras comuns aos dois modos:

- A referência aparece **uma vez**, na **última linha** da mensagem de commit,
  para ser achada com `git log --grep` (`git log --grep='Ticket: 10'` no modo
  local; `git log --grep='(#123)'` no modo GitHub).
- O **número do PR nunca é escrito à mão**: o GitHub já o registra no commit de
  merge (`Merge pull request #21 from …`). Assim "ticket × PR" fica distinguível.

> Histórico anterior a 2026-10-17 usa `(#NN)` com o número do ticket local. Nos
> tickets `01`–`12` isso coincide com a issue original do GitHub (`#01`–`#12`, de
> onde foram migrados), então os links gerados ali estão corretos; para tickets
> novos, valem as regras acima.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` — the Notes / Decisions-so-far / Fog body.
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
