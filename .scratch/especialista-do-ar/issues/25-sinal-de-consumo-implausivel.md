# 25 — Sinal de consumo implausível (⚠ nas ordenações)

**What to build:** a tabela de Aparelhos vai ordenar por consumo e IDRS, e hoje a
base tem valores que levariam números absurdos ao topo: MYSTIC `MY-INV0969BR`
(9.000 BTU/h, 32,8 kWh/ano), CONSUL `CBK22F / CBL22F` (22.000 BTU/h, 70,1 kWh/ano) e
MBO `MBOINV18C2I` (18.000 BTU/h, 2.534,4 kWh/ano). O detector de Anomalias ganha
uma regra de plausibilidade de **consumo por BTU/h** na tabela
`REGRAS_PLAUSIBILIDADE`; a regra só sinaliza, nunca corrige nem exclui (ADR-0017).
O `consulta.json` ganha `suspeito: true` para o Aparelho que tem Linha com essa
Anomalia, e a ordenação (ticket 27) manda os suspeitos para o fim.

**Pesquisar antes de codar:** parte dos Janela (ex.: GREE `GJC07BK-A3NRND2A`, 7.500
BTU/h, 15,5 kWh e IDRS 2,97) traz consumo e IDRS numa escala muito diferente dos
splits; a lista oficial do Inmetro cita um Janela de 7.000 BTU/h com 399 kWh/ano.
Confirmar na fonte do INMETRO qual métrica essas colunas guardam para os Janela
(possivelmente kWh/mês e CEE, da etiqueta antiga). Se os Janela precisarem de
tratamento próprio (limiar por tipo ou outra regra), **parar e registrar a proposta
no ticket** antes de implementar.

**Blocked by:** 24 — Classe, Situação e campos da tabela.

**Status:** ready-for-agent

- [ ] O limiar sai da distribuição real da base (consumo por 1.000 BTU/h por tipo),
      medida e registrada no ticket; os três exemplos acima são sinalizados.
- [ ] A regra vive em `REGRAS_PLAUSIBILIDADE`, roda depois das Exceções e não altera
      nenhum valor; nenhum Aparelho é excluído (seguem 2.460).
- [ ] `anomalias.jsonl` e o Relatório de revisão passam a mostrar as novas Anomalias;
      `docs/agentes.md` documenta o que `valor_implausivel` cobre agora.
- [ ] `ItemConsulta.suspeito` é `true` só para Aparelhos com Linha sinalizada.
- [ ] A conclusão sobre a métrica dos Janela fica registrada (no ticket e, se virar
      termo, no `CONTEXT.md`).
- [ ] `pnpm build` reproduz `data/build` e `reports` byte a byte; testes cobrem a
      regra com fixture.
