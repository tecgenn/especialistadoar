# 76 — Ficha: corpo do datasheet

**What to build:** o corpo da ficha ganha ritmo de datasheet: Resumo em pares, explicadores fechados, condições de ensaio em tabelas legíveis, especificações e registros, proveniência e a análise/Ofertas claramente separadas do dado oficial. A página continua longa porque o dado é longo, mas deixa de ser uma pilha de blocos iguais.

**Blocked by:** 69 — Ofertas; 75 — Ficha: topo de datasheet, leituras e índice.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/sections.md`. `impeccable` — `reference/typeset.md`. `ui-ux-pro-max` — `"definition list table" --domain ux`.

**Status:** done

- [x] Resumo em `<dl>` com hairlines, capacidade, IDRS, Classe, consumo anual e potência em espera; sem cartões decorativos.
- [x] "Entenda os números" mantém os quatro `<details>` fechados, com abertura por teclado e texto preservado.
- [x] Condições de ensaio usam uma tabela por Variante, com condição, carga total e parcial, unidades e nota de linhas da tabela em mono; no celular a tabela rola de forma controlada sem quebrar a página.
- [x] Especificações, Registros INMETRO e Proveniência usam a mesma linguagem de datasheet; seções ausentes continuam omitidas.
- [x] A seção da Análise e a faixa de Ofertas são separadas por hairline e não se confundem com Valores oficiais; a Oferta mantém a transparência.
- [x] Todos os títulos entram na ordem correta do índice; cada seção tem `id` e `tabindex="-1"`.
- [x] No celular, os blocos empilham, as tabelas não estouram a viewport e os alvos de 44 px são mantidos.
- [x] Nenhum texto de método, aviso de estimativa ou proveniência é removido.
- [x] O teste de build confere as seções presentes/ausentes e a ordem do índice.

**Implementação (2026-11-28):** o corpo da ficha virou datasheet. Em
`apps/site/src/pages/aparelhos/[id].astro`, o Resumo sai de um `resumoLinhas`
único (as cinco linhas oficiais) num `<dl class="ficha-resumo">` com hairline por
par, Especificações na mesma forma, os quatro explicadores como linhas de
`<details>` nativo (texto intacto), as condições de ensaio numa tabela por
Variante dentro de `.ficha-tabela` (`role="group"`, `tabindex="0"`,
`<caption>` com a unidade e a nota de linhas em `.ficha-nota` mono), Registros
com o número em mono e a situação como etiqueta `data-situacao`, e Proveniência
com a nota de linhas em mono antes da frase de Valores oficiais. A Análise
virou seção `#analise` com `tabindex="-1"` e link de 44 px; `OfertaFaixa` passou
a dar `tabindex="-1"` à seção `#ofertas`. `global.css` ganhou a régua de seção
(hairline + 48 px), os pares do resumo/especificações (12 rem de rótulo,
empilhados abaixo de 640 px), a tabela de ensaio com rolagem contida e coluna
condição `sticky` abaixo de 900 px, as linhas do explicador com marcador `+/−`,
o status em etiqueta e a nota em mono; saíram os cartões legados de `.variante`,
`.explicador` e `.analise-destaque`. `DESIGN.md` (seção Ficha) e a arquitetura
registraram a decisão no mesmo commit.

**Checks:** Vitest 3/3 em `analises-build` (os dois builds do arquivo),
`pnpm typecheck` OK, `pnpm lint` sem erros e `pnpm build:site` com 2.433
páginas; `data/build` e `reports` intocados. No navegador (agent-browser, preview
127.0.0.1:4321 na ficha `ap-03be1a749866`): 0 px de overflow da página em
320/390/768/1024/1440 px; Resumo com 5 linhas de 43 px no desktop e 67 px
empilhadas no celular, hairline de 1 px; explicadores de 50 px fechados com
marcador `+` e sem fundo; `.ficha-tabela` com `overflow-x: auto`, legenda da
unidade e coluna de condição `sticky` em 320/390/768; em 390 px a tabela fecha
em 358 px (cabe) e em 320 px rola dentro do contêiner (353 px contra 288 px),
sem estourar a viewport; Registros “004733/2023” + etiqueta “ATIVO” com o tom da
Classe A; Análise e Ofertas com hairline de 1 px depois da Proveniência.
Divergência registrada: a seção da Análise recebeu `id` e `tabindex="-1"` mas
não entrou no índice, que continua com as oito seções de dado do #62/#75.
