# 03 — Contrato, agrupamento em Aparelho e base servida

**What to build:** A base servida: `aparelhos.jsonl` (canônico) e `aparelhos.json` (espelho), com os Aparelhos que têm Dados declarados, validados contra `schema.json`.

- Contrato: `@sinclair/typebox` gera `schema.json`; validação com Ajv mais invariantes de domínio.
- Agrupar Linhas em Aparelhos. Identidade = marca + unid. interna + unid. externa (ou Modelo quando as unidades não vêm separadas); tensão fora da identidade.
- Cada marca é um Aparelho distinto, mesmo quando várias marcas compartilham o mesmo Registro INMETRO.
- A base servida só inclui Aparelhos com Dados declarados; os demais seguem no histórico (`registros.jsonl`).
- Violação de invariante falha o build (identidade única, só Aparelhos com Dados declarados, proveniência presente).

**Blocked by:** 02 — Normalização de formato e Anomalias.

**Status:** done

- [x] `schema.json` é derivado dos tipos TypeBox, não mantido à mão.
- [x] Cada Aparelho aponta para as Linhas da tabela e Registros INMETRO de origem (proveniência presente).
- [x] Marcas compartilhando um Registro INMETRO geram Aparelhos distintos.
- [x] Um Aparelho bivolt é um só.
- [x] Aparelho sem Dados declarados existe em `registros.jsonl`, mas não na base servida.
- [x] `aparelhos.json` é espelho fiel de `aparelhos.jsonl`.
- [x] Violação de invariante falha o build.
- [x] Vitest cobre o agrupamento e a validação, com snapshot golden dos dois artefatos.

## Origin

Migrado da issue #3 do GitHub (https://github.com/tecgenn/especialistadoar/issues/3) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
