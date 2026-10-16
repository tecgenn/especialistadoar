# 05 — Diff entre versões e Relatório de revisão

**What to build:** O diff entre Versões da tabela e o Relatório de revisão. Ao comparar com a versão anterior, o build classifica Aparelhos novos, alterados e Ausentes, além de Anomalias novas e Vínculos sugeridos, e gera um Relatório de revisão em Markdown.

- Ausente: constava em versão anterior e sumiu de todas as Linhas da versão atual. A causa não é presumida.
- Aparelho que continua na tabela mas perdeu os Dados declarados é "Aparelho sem dados declarados", não Ausente; o histórico registra que ele já teve dados.

**Blocked by:** 03 — Contrato, agrupamento em Aparelho e base servida.

**Status:** done

- [x] O Relatório de revisão é nomeado pela data da Versão da tabela (`reports/revisao-<data>.md`).
- [x] Classifica corretamente novos, alterados e Ausentes.
- [x] Aparelho que perdeu Dados declarados não é marcado como Ausente, e o histórico mostra que já teve.
- [x] A causa de uma Ausência não é presumida no texto.
- [x] Lista Anomalias novas e Vínculos sugeridos.
- [x] A primeira versão (sem anterior) gera um relatório coerente.
- [x] Vitest cobre a classificação, com snapshot golden do relatório.

## Origin

Migrado da issue #5 do GitHub (https://github.com/tecgenn/especialistadoar/issues/5) em 2026-10-14, ao mover o tracker deste repositório para markdown local.
