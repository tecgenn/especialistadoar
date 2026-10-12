# Architecture

How the Especialista do Ar codebase is structured. Describes the current state
(data + docs; no build code yet) and the intended shape across the delivery
phases.

## Purpose

Turn the official INMETRO product export (a CSV) into a structured, versioned
base of air-conditioners that AI agents and a website can consume, without
anyone having to parse the raw export. The **primary consumer is an AI agent**;
the base must be queryable both as static files and through a hybrid API.

## Scope

Delivered in phases — see `docs/prd.md` for the full breakdown. **MVP = phases
1–3**; admin is post-MVP.

1. **Pipeline, dataset, report, tests** — raw → served base → review report.
2. **API, docs, agent test** — static JSON + dynamic Worker; the acceptance test
   with an agent is the **decision gate** before building the site.
3. **Site (Astro), Ofertas, link-verification job.**
4. **Admin** (post-MVP).

## Source of truth

- **`data.csv`** — the INMETRO export. Canonical source (a *Versão da tabela*).
  A superset of the published PDF: Ativo + Cancelado + Inativo, plus the barcode.
- **PDF** (`Condicionadores de ar 2025.pdf`) — **removed.** Re-obtained from
  INMETRO only if a cross-check is ever needed.
- **`produtos.csv`** — discarded (content-identical to `data.csv`; order only).

Measured CSV caveats (must be handled by the parser, not by hand):

- UTF-8 **BOM** at the start — parse with `bom: true`.
- The **header** contains a quoted field with a comma
  (`"Se outro fluido refrigerante, especificar"`) and a **trailing space** in one
  column name — parse the header RFC 4180 and trim names before validating.
- `º` (ordinal) and `°` (degree) are mixed across columns — a format rule.

## Layers

```
data/
  raw/inmetro-export-YYYY-MM-DD.csv   # immutable, versioned + sha256 in manifest
  build/aparelhos.jsonl               # served base (Aparelhos with Dados declarados)
  build/aparelhos.json                # array mirror of the above
  build/registros.jsonl               # normalized raw Linhas (provenance)
  build/schema.json                   # JSON Schema contract
  build/manifest.json                 # version metadata (hash, date, counts)
  build/anomalias.jsonl               # Anomalias per Linha
  build/excecoes-manuais.jsonl        # Exceção manual overrides (reason + source)
  build/vinculos-confirmados.jsonl    # human-confirmed Vínculo sugerido
reports/revisao-YYYY-MM-DD.md         # Relatório de revisão per new version
packages/pipeline/                    # the build pipeline (CLI)
apps/site/                            # Astro catalog (phase 3)
apps/api/                             # Worker dynamic API (phase 2)
```

1. **Raw (versioned).** Every new export is stored untouched under `data/raw/`,
   identified by content hash + date obtained. Preserves *every* Linha, including
   the ones without Dados declarados — needed for the diff.
2. **Build (derived).** A script reads a raw snapshot and emits the served base
   plus the side artifacts (anomalias, exceções manuais, vínculos confirmados).
3. **Served base.** `aparelhos.jsonl` (+ `.json`) with `schema.json`.
4. **Reports (derived).** The Relatório de revisão for each new version.

## Data flow

```
new CSV export
    -> data/raw/<dated>.csv + sha256 (manifest)      (Versão da tabela)
    -> parser + normalização de formato              (regras, não exceções)
    -> detecção de Anomalias                          (sinal, não erro)
    -> agrupamento em Aparelho                        (marca + unid. interna + unid. externa)
    -> validação: schema.json + invariantes           (falha dura)
    -> data/build/aparelhos.jsonl (+ .json)           (só Aparelhos com Dados declarados)
    -> reports/revisao-<data>.md                      (novos / alterados / Ausentes / Anomalias / Vínculos)
    -> revisão humana (PR) antes de publicar
```

## Key modules

- **ingest** — register a raw CSV snapshot (hash, date, origin); idempotent by content.
- **normalize** — format-only standardization (BOM, header trim, casing,
  units-in-text, voltage parsing, numeric coercion, `º`/`°`); source text is
  preserved for provenance.
- **anomalias** — flag out-of-pattern values (non-numeric in numeric fields,
  misaligned columns); the original value is preserved, not corrected.
- **group** — fold Linhas into Aparelhos. Aparelho identity is marca + unid.
  interna + unid. externa (or Modelo when the units aren't split); voltage is
  excluded from identity (bivolt is one Aparelho).
- **validate** — JSON Schema (Ajv) + domain invariants; a violation is a hard fail.
- **diff / report** — compare against the previous version; classify novos,
  alterados, Ausentes, Anomalias novas, Vínculos sugeridos.

## Interfaces

- **In:** a path to a new INMETRO CSV.
- **Out:** `aparelhos.jsonl`, `aparelhos.json`, `schema.json`, `registros.jsonl`,
  `manifest.json`, `anomalias.jsonl`, `excecoes-manuais.jsonl`,
  `vinculos-confirmados.jsonl`, and a Relatório de revisão (Markdown).

## Serving (phase 2) — hybrid API

- **Static JSON** (no Worker, no quota): lookup by ID, list endpoints, and the
  table version — served as plain files.
- **Dynamic Worker** (`/api/v1/...`): only search, comparison, and Valor calculado.
- **Access:** open at MVP, with a per-IP rate rule on Cloudflare. Plan B if the
  free quota tightens: Workers Paid.
- **Billing:** deferred; a payment gate would sit in front of the dynamic part
  without changing responses.

See ADR-0003.

## Distribution

- The **embedded dataset** is canonical: the JSONL/JSON artifacts are the source
  of truth and the site consumes a build-time copy.
- **D1 (SQLite)** is only a plan B, derived from the JSONL — never a source of truth.
- **R2** holds large blobs if the static assets outgrow the site bundle.
- **Free-tier caveats:** the Workers free plan has request/CPU ceilings and
  commercial-use terms that must be confirmed before monetising.

## Stack

- **Runtime:** Node 24, **TypeScript**, ESM. Dev on **Windows (Git Bash)** and
  **Linux (bash)** — ordering and line endings must be identical on both; LF
  enforced via `.gitattributes`.
- **Monorepo:** pnpm workspaces.
- **Contract:** `@sinclair/typebox` → `schema.json`; validated with `ajv`.
- **CSV:** `csv-parse` (`bom: true`), never `split(",")`.
- **Tests:** Vitest, including golden snapshots of the JSONL and the report.
- **Lint/format:** Biome.
- **Site:** Astro + a React island; Pagefind/MiniSearch behind a shared query module.
- **CI/CD:** GitHub Actions, Windows + Linux matrix (Windows non-blocking on
  private repos — runner minutes cost 2×). Publication via PR.

See ADR-0002 and ADR-0004.

## Out of scope (MVP)

- Admin (phase 4).
- Billing / paid API.
- Barcode as an identity key (kept in raw, unused for now).
