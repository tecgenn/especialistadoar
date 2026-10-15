# Project State

Updated after each ticket completion. The **Frontier** section is rewritten every time; the **Completed** log is append-only.

The issue tracker is the source of truth for ticket status. The Frontier table is a cached summary of it; if they disagree, the tracker wins and `/prime` flags the mismatch. The Completed log is the only part with no tracker equivalent.

## Frontier

| # | Ticket | Status | Blocked by |
|---|--------|--------|------------|
| 02 | Normalização de formato e Anomalias | completed | — |

## Completed

### 01 — Fundação e primeira fatia do pipeline (ingest + parse) (2026-10-14)

- **Changed:** `packages/pipeline/src/{parse,ingest,build,cli}.ts`; monorepo root (`package.json`, `pnpm-workspace.yaml`, `tsconfig.json`/`tsconfig.base.json`, `biome.json`, `vitest.config.ts`, `.gitignore`); moved `data.csv` → `data/raw/inmetro-export-2026-10-12.csv`; generated `data/build/registros.jsonl` + `data/build/manifest.json`; tests `packages/pipeline/test/{parse,build}.test.ts` (golden snapshots + `fixtures/amostra.csv`).
- **What works:** `pnpm build` reads a Versão da tabela from `data/raw/`, computes its sha256, registers the raw snapshot immutably (idempotent by content — re-running never duplicates), and writes `registros.jsonl` (7474 Linhas da tabela, including the ~4.593 without Dados declarados) plus `manifest.json` (hash, data de obtenção, origem, contagem de Linhas). Parser is RFC 4180 with `bom: true` and an aparado header (handles the quoted-comma column and the trailing-space column). `pnpm test` (Vitest) and `pnpm typecheck` are green.
- **Ticket:** #01 (local tracker: `01-fundacao-pipeline-ingest-parse`)

### 02 — Normalização de formato e Anomalias (2026-10-14)

- **Changed:** `packages/pipeline/src/{normalize,anomalias,build,cli}.ts`; `packages/pipeline/test/{normalize,anomalias,build}.test.ts` (golden snapshots de `registros.jsonl`/manifest/`anomalias.jsonl`); fixture `test/fixtures/amostra-anomalias.csv`; artefatos `data/build/anomalias.jsonl`, `data/build/registros.jsonl` atualizados.
- **What works:** Normalização preserva valores originais; padroniza `º→°`, casing, espaços, converte números (aceitando `,.`, removendo unidades), parseia tensão `127-220 (...)` como `{voltagens:[127,220], fases:[...]}` (não duplica Aparelho). Detecção de Anomalias: em campos numéricos com múltiplos números (ex. `640g / 600g / 690g`) gera `valor_multiplo`; texto sem número gera `texto_em_campo_numerico`. `runBuild` grava `anomalias.jsonl` junto com `registros.jsonl` e não aborta build.
- **Ticket:** #02 (local tracker: `02-normalizacao-formato-anomalias`)
- **Checks:** Vitest 50/50, tsc --noEmit OK, biome check OK.
