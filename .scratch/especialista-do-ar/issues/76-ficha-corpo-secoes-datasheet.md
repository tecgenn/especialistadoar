# 76 — Ficha: corpo do datasheet

**What to build:** o corpo da ficha ganha ritmo de datasheet: Resumo em pares, explicadores fechados, condições de ensaio em tabelas legíveis, especificações e registros, proveniência e a análise/Ofertas claramente separadas do dado oficial. A página continua longa porque o dado é longo, mas deixa de ser uma pilha de blocos iguais.

**Blocked by:** 69 — Ofertas; 75 — Ficha: topo de datasheet, leituras e índice.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/sections.md`. `impeccable` — `reference/typeset.md`. `ui-ux-pro-max` — `"definition list table" --domain ux`.

**Status:** ready-for-agent

- [ ] Resumo em `<dl>` com hairlines, capacidade, IDRS, Classe, consumo anual e potência em espera; sem cartões decorativos.
- [ ] "Entenda os números" mantém os quatro `<details>` fechados, com abertura por teclado e texto preservado.
- [ ] Condições de ensaio usam uma tabela por Variante, com condição, carga total e parcial, unidades e nota de linhas da tabela em mono; no celular a tabela rola de forma controlada sem quebrar a página.
- [ ] Especificações, Registros INMETRO e Proveniência usam a mesma linguagem de datasheet; seções ausentes continuam omitidas.
- [ ] A seção da Análise e a faixa de Ofertas são separadas por hairline e não se confundem com Valores oficiais; a Oferta mantém a transparência.
- [ ] Todos os títulos entram na ordem correta do índice; cada seção tem `id` e `tabindex="-1"`.
- [ ] No celular, os blocos empilham, as tabelas não estouram a viewport e os alvos de 44 px são mantidos.
- [ ] Nenhum texto de método, aviso de estimativa ou proveniência é removido.
- [ ] O teste de build confere as seções presentes/ausentes e a ordem do índice.
