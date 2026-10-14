# 01 — Fundação e primeira fatia do pipeline (ingest + parse)

**What to build:** A fundação do monorepo e a primeira fatia ponta a ponta do pipeline: registrar uma Versão da tabela a partir do CSV bruto e extrair todas as Linhas da tabela, cruas, com proveniência. Rodar o `build` sobre o CSV versionado produz o manifesto (hash, data de obtenção, origem) e `registros.jsonl`.

- Monorepo pnpm workspaces, TypeScript ESM sobre Node 24, Biome para lint/formatação e Vitest, com LF idêntico em Linux e Windows (Git Bash).
- Ingest: registrar o snapshot raw imutável com sha256 e manifesto; idempotente por conteúdo.
- Parse: CSV em RFC 4180 com `bom: true`; header com campo entre aspas contendo vírgula e espaço à direita — aparar nomes de colunas.
- Preservar cada Linha da tabela exatamente como publicada, inclusive as ~4.600 sem Dados declarados.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `pnpm install`, build e testes rodam do zero no Linux.
- [x] O build lê o CSV versionado, calcula o sha256 e grava o manifesto (data de obtenção, origem, contagem de linhas).
- [x] Rodar o build duas vezes sobre o mesmo conteúdo não duplica nada (idempotente por conteúdo).
- [x] O parser preserva cada Linha da tabela como publicada, inclusive as sem Dados declarados.
- [x] BOM tratado e nomes de coluna aparados (incluindo a coluna com vírgula entre aspas e a com espaço à direita).
- [x] Vitest cobre o parser, com snapshot golden de `registros.jsonl` e do `manifest.json`.

## Comments

### tecgenn — 2026-10-14

Done — see project-state.md entry 01. Fundação do monorepo (pnpm/TS ESM/Biome/Vitest), ingest idempotente por conteúdo (sha256 + manifesto) e parser RFC 4180 (BOM, header aparado, campo entre aspas com vírgula). Gera data/build/registros.jsonl (7474 Linhas) e data/build/manifest.json.

## Origin

Migrado da issue #1 do GitHub (https://github.com/tecgenn/especialistadoar/issues/1) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
