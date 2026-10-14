# 04 — Exceção manual e Vínculo confirmado

**What to build:** As duas únicas formas de alterar conteúdo além de regra de formato: a Exceção manual (correção à mão sobre um dado de uma Linha da tabela, com motivo e fonte) e o Vínculo confirmado (fusão de identidade aprovada por uma pessoa). Ambas vivem como artefatos e são aplicadas no build.

- `excecoes-manuais.jsonl` — cada entrada guarda motivo e fonte registrados.
- `vinculos-confirmados.jsonl` — um Vínculo sugerido nunca é aplicado automaticamente; só passa a valer como identidade após confirmação, guardando o par sugerido e quem confirmou.
- Diferença apenas de formato não vira exceção.

**Blocked by:** 03 — Contrato, agrupamento em Aparelho e base servida.

**Status:** ready-for-agent

- [ ] Toda Exceção manual registra motivo e fonte, e o build a aplica sobre a Linha da tabela.
- [ ] Um Vínculo sugerido nunca é aplicado sem confirmação de uma pessoa.
- [ ] Um Vínculo confirmado guarda o par sugerido e quem confirmou, e passa a valer como identidade.
- [ ] Diferença apenas de formato é resolvida por regra, não por exceção.
- [ ] Vitest cobre os dois artefatos, com snapshot golden.

## Origin

Migrado da issue #4 do GitHub (https://github.com/tecgenn/especialistadoar/issues/4) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
