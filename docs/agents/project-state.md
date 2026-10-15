# Project State

Updated after each ticket completion. The **Frontier** section is rewritten every time; the **Completed** log is append-only.

The issue tracker is the source of truth for ticket status. The Frontier table is a cached summary of it; if they disagree, the tracker wins and `/prime` flags the mismatch. The Completed log is the only part with no tracker equivalent.

## Frontier

| # | Ticket | Status | Blocked by |
|---|--------|--------|------------|
| 04 | Exceção manual e Vínculo confirmado | ready-for-agent | — |
| 05 | Diff entre versões e Relatório de revisão | ready-for-agent | — |
| 07 | API estática (arquivos JSON) | ready-for-agent | — |

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

### 03 — Contrato, agrupamento em Aparelho e base servida (2026-10-14)

- **Changed:** `packages/pipeline/src/{aparelho,group,validate,build,cli}.ts` (new `aparelho.ts` TypeBox contract, `group.ts` agrupamento, `validate.ts` invariantes; `build.ts` emite a base servida); `packages/pipeline/package.json` (+`@sinclair/typebox`, +`ajv`); root `package.json` build script fixed; tests `packages/pipeline/test/{aparelhos,group,validate}.test.ts` + `test/support.ts` (helper `dadosVazios`) + golden snapshots; fixture `test/fixtures/amostra-aparelhos.csv` (nova, com o cabeçalho real entre aspas e o mapeamento de `fluidoEspecificado` exercitado); `amostra{,-anomalias}.csv` (+`Número do Registro`); artefatos `data/build/{aparelhos.jsonl,aparelhos.json,schema.json}`; glossário `Variante` (`CONTEXT.md`) e ADR-0005.
- **What works:** `pnpm build` agrupa as Linhas em Aparelhos (identidade = marca + unid. interna + unid. externa, ou Modelo quando as unidades não vêm separadas; tensão fora da identidade, bivolt = um só) e emite a base servida `aparelhos.jsonl` (canônico), `aparelhos.json` (espelho) e `schema.json` (derivado dos tipos TypeBox via `@sinclair/typebox`). Só entram Aparelhos com Dados declarados (2881 Linhas → **2460 Aparelhos**; o restante permanece em `registros.jsonl`). Dados declarados são carregados por variante (`variantes`, indexadas por tensão; capacidades divergentes viram variantes distintas, sem perda). Marcas distintas compartilhando um Registro INMETRO geram Aparelhos distintos. `validarBaseServida` (Ajv + invariantes: contrato, só com Dados declarados, proveniência presente — `linhas` e `registros` não-vazios —, identidade única) falha o build em violação. `pnpm build`, no root, agora resolve o `data/` do repo (script apontava para o cwd do package).
- **Ticket:** #03 (local tracker: `03-contrato-agrupamento-aparelho-base-servida`)
- **Checks:** Vitest 73/73, tsc --noEmit OK, biome check OK.
