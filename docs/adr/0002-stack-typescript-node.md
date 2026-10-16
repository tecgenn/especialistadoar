# Stack: TypeScript + Node, pnpm workspaces, Vitest

**Status:** aceito

Adotamos TypeScript ESM sobre Node 24, monorepo com pnpm workspaces, testes com
Vitest (incluindo snapshots golden de `aparelhos.jsonl` e do Relatório de
revisão), parsing de CSV com `csv-parse`, contrato gerado por `@sinclair/typebox`
e exposto como JSON Schema, validação com `ajv`, e Biome para lint/formatação. O
desenvolvimento acontece em **Windows (Git Bash)** e **Linux (bash)**; a saída
canônica precisa ser idêntica nos dois, então forçamos LF via `.gitattributes` e
testamos numa matrix de CI.

## Considered Options

- **TypeScript + Vitest** (escolhido) — os tipos viram contrato (schema.json) e os
  snapshots cobrem regressão de dados.
- **JavaScript + `node:test`** — menos peças, mas sem contrato gerado nem
  snapshots ergonômicos.
- **Parser de CSV próprio** — descartado: o arquivo tem campos entre aspas com
  vírgula e BOM; um parser RFC 4180 maduro é mais seguro.

## Consequences

- O `schema.json` é derivado dos tipos TypeBox, não mantido à mão — uma fonte só.
- Minutos de runner Windows custam 2× em repo privado: o Windows roda em PR e é
  não-bloqueante no push; o Linux é a referência.
- Node 24 executa TS diretamente para o CLI; `tsc` fica para typecheck.

## Notas

- **2026-10-15:** o repositório é **público**, então minutos de runner no GitHub
  Actions não são cobrados — a premissa de custo 2× do Windows (acima) deixou de
  valer. A regra de Windows não-bloqueante foi mantida por decisão do ticket #06.
  O setup manual de CI/publicação está em `docs/agents/ci-cd-setup.md`.
