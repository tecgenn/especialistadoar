# 08 — Catálogo: barra de ferramentas e pesquisa avançada

**What to build:** a barra do catálogo vira um instrumento de recorte: busca, filtros ativos, contagem e ordenação no mesmo lugar, sticky ao rolar. A Pesquisa avançada mantém as duas faixas (Aparelho e Desempenho), os chips de marca, as faixas de capacidade, a Classe e a Tensão — e no celular abre como painel sobreposto, com foco preso, `Esc` para fechar e um rodapé que mostra quantos resultados o recorte tem.

**Blocked by:** 07 — Catálogo: a tabela de instrumento.

**Skills:** `ui-ux-pro-max` — `"filter panel focus trap" --domain ux` e `"form search results count" --domain ux`. `design-taste-frontend` — `SKILL.md` + `references/cards.md`.

**Status:** ready-for-agent

- [ ] A barra é sticky, não cobre a linha em leitura e tem contraste e hairline próprios; no celular empilha em duas linhas sem overflow.
- [ ] Busca, chips do recorte efetivo (incluindo o padrão implícito de 220 V), contagem e ordenação mantêm os contratos de URL atuais.
- [ ] O painel avançado mantém as faixas **Aparelho** (Marca, Tipo, Função) e **Desempenho** (Capacidade, Classe, Tensão), com chips que quebram linha e campos em largura total.
- [ ] O campo "Outras marcas" continua escrevendo `?marca=` na hora e não repete um valor já ativo num chip.
- [ ] Faixa de capacidade e capacidade exata continuam exclusivas nos dois sentidos; links com `?btu=` e `?btuMin=&btuMax=` abrem o recorte correto.
- [ ] "Limpar filtros" só aparece fora do padrão, preserva a ordenação e a seleção, e o painel começa fechado (abrindo sozinho com filtro avançado na URL).
- [ ] No celular, o painel é uma sobreposição com rolagem interna, foco preso, `Esc`, retorno de foco e botão "Ver N resultados"; no desktop é embutido.
- [ ] O filtro padrão continua resultando em 2.116 linhas e a contagem do recorte reage a cada mudança.
- [ ] Testes de ilha cobrem abertura/fechamento, `Esc`, foco e o rodapé de contagem; nenhum teste existente quebra.
