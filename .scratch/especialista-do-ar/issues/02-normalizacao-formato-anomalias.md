# 02 — Normalização de formato e Anomalias

**What to build:** A normalização de formato e a detecção de Anomalias sobre as Linhas da tabela: padronizar casing, unidades-no-texto, parsing de tensão (bivolt), `º`/`°` e coerção numérica — sempre preservando o Valor original — e marcar como Anomalia o que fugir do padrão, sem falhar o build.

- Padronização apenas de formato: diferença só de formato é resolvida por regra, nunca por Exceção manual.
- Tensão fora da identidade: um Aparelho bivolt continua sendo um só.
- Anomalia é um sinal, não um erro: o valor original é preservado e a Anomalia fica visível junto ao Aparelho.

**Blocked by:** 01 — Fundação e primeira fatia do pipeline (ingest + parse).

**Status:** completed

- [x] O Valor original é preservado ponta a ponta; o Valor oficial só difere dele por regra de formato.
- [x] `º` e `°` padronizados por regra, não por exceção.
- [x] Tensão no formato `127-220` é parseada sem virar dois Aparelhos.
- [x] Campo numérico que vem com texto gera uma Anomalia em `anomalias.jsonl`, sem abortar o build.
- [x] Vitest cobre cada regra, com snapshot golden de `anomalias.jsonl`.

## Origin

Migrado da issue #2 do GitHub (https://github.com/tecgenn/especialistadoar/issues/2) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
