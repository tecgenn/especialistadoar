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

**Status:** done

## Pesquisa e decisão

A tabela "índices novos (IDRS)" do INMETRO
(`inmetro.gov.br/consumidor/pbe/condicionadores-de-ar-indices-novos-idrs.pdf`)
define `Consumo de Energia (kWh)` "com base nos resultados do ciclo normalizado
pelo INMETRO, de 2.080 horas por ano" — a mesma métrica para todos os tipos,
inclusive Janela. Não existe métrica separada de kWh/mês para Janela nessa
tabela. Os valores pequenos são dados em outra escala (provavelmente kWh/mês da
etiqueta antiga), não uma métrica oficial distinta. Exemplo oficial: ELGIN
9.000 BTU/h, IDRS 5,82, 352 kWh/ano → 39,1 kWh por 1.000 BTU/h, igual à mediana
dos splits.

Distribuição medida na base atual (`consumo / (capacidadeBtu / 1000)`):

| Tipo | n | p1 | p5 | mediana | p95 | p99 | máx |
|---|---|---|---|---|---|---|---|
| Split Hi-Wall | 1918 | 1,90 | 26,77 | 39,96 | 69,22 | 77,08 | 140,80 |
| Split Cassete | 380 | — | — | 40,02 | — | — | — |
| Split Piso-teto | 347 | — | — | 41,06 | — | — | — |
| Janela | 236 | — | — | 73,40 | 83,63 | 218,67 | 230,50 |

Clusters legítimos: splits 17,5–91,2; Janela 47,5–88,1. Vazios: 8–17,5 e
91,2–140,8 (splits) / 88,1–218,7 (Janela). **Decisão:** faixa única `[10, 120]`
por 1.000 BTU/h, que cai nos dois vazios e cobre os dois tipos — não foi preciso
limiar por tipo. Resultado: 147 Linhas abaixo e 8 acima = 155 Anomalias de
consumo; 137 dos 2.460 Aparelhos ficam `suspeito`.

Os três exemplos do ticket são sinalizados: MYSTIC 9.000/32,8 (3,64), CONSUL
22.000/70,1 (3,19; a base traz `CBK22C / CBL22C` com 88,7 → 4,04) e MBO
18.000/2.534,4 (140,8).

O Relatório de revisão **não** muda nesta entrega: a versão atual é a primeira,
então `anomaliasNovas` é vazio e o relatório continua "Primeira Versão". As 155
Anomalias aparecem em `data/build/anomalias.jsonl`.

`suspeito` é uma projeção do `consulta.json`, não um campo do contrato do
Aparelho (`aparelhos.json`): o ADR-0017 adiou marcar o Aparelho na base servida,
e esta entrega não reabre essa decisão — só leva o sinal para a camada de
consulta.

- [x] O limiar sai da distribuição real da base (consumo por 1.000 BTU/h por tipo),
      medida e registrada no ticket; os três exemplos acima são sinalizados.
- [x] A regra vive em `REGRAS_PLAUSIBILIDADE`, roda depois das Exceções e não altera
      nenhum valor; nenhum Aparelho é excluído (seguem 2.460).
- [x] `anomalias.jsonl` passa a mostrar as novas Anomalias; o Relatório de revisão
      não muda porque esta é a primeira Versão. `docs/agentes.md` documenta o que
      `valor_implausivel` cobre agora.
- [x] `ItemConsulta.suspeito` é `true` só para Aparelhos com Linha sinalizada.
- [x] A conclusão sobre a métrica dos Janela fica registrada (no ticket e, se virar
      termo, no `CONTEXT.md`).
- [x] `pnpm build` reproduz `data/build` e `reports` byte a byte; testes cobrem a
      regra com fixture.
