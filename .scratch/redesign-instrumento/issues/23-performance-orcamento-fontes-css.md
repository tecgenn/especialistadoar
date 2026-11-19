# 23 — Performance: orçamento de fontes, CSS e imagens

**What to build:** o redesign não pode custar velocidade. Este ticket mede e garante o orçamento: CSS crítico ≤ 80 KB gzip, fontes ≤ 130 KB no primeiro carregamento (subset `latin`, medido em ~121 KB), zero terceiros, LCP ≤ 2,5 s em 4G, CLS ≤ 0,05 e INP ≤ 200 ms. O custo dominante atual — `consulta.json` com 506 KB (65,7 KB gzip) e o cliente React compartilhado com 401 KB (120,5 KB gzip) — não pode crescer. Se algum número estourar, o ajuste é feito aqui, não deixado para depois.

**Blocked by:** 01–20 — fundação e todas as superfícies do site.

**Skills:** `design-taste-frontend` — `scripts/perf.mjs` + `references/perf.md`. `impeccable` — `reference/optimize.md`. `ui-ux-pro-max` — `"list virtualization" --domain react`.

**Status:** ready-for-agent

- [ ] O CSS entregue por página fica dentro do orçamento de 80 KB gzip; partials não usados por uma rota não são carregados nela, quando isso for possível sem duplicar manutenção.
- [ ] As três fontes somam ≤ 130 KB no primeiro carregamento; apenas a grotesca latin é pré-carregada; nenhuma fonte de CDN ou peso não usado.
- [ ] A rolagem horizontal da tabela no celular é só CSS: nenhum listener, biblioteca ou JS novo é adicionado para isso.
- [ ] Não há requisições de terceiros, nem nova dependência de runtime; as ilhas mantêm o mesmo custo de hidratação.
- [ ] Imagens têm dimensões explícitas, proporção reservada, `loading="lazy"` abaixo da dobra e formato otimizado; a imagem do topo da Análise usa `fetchpriority="high"` se for o LCP.
- [ ] LCP ≤ 2,5 s, CLS ≤ 0,05 e INP ≤ 200 ms em 4G simulado, medidos em home, catálogo, ficha, comparação e artigo.
- [ ] Nenhum `backdrop-filter`, filtro caro, sombra grande ou animação de layout no caminho crítico.
- [ ] Os números antes/depois e a metodologia são registrados no ticket; qualquer regressão tem justificativa e limite.
- [ ] `pnpm build:site` continua gerando as mesmas páginas e a suíte permanece verde.
