# 09 — Catálogo: seleção para comparar, dock e vitrine de análises

**What to build:** o visitante marca até três Aparelhos sem perder o recorte, vê a seleção num dock escuro que não atrapalha a leitura e chega à comparação com um link que carrega a ordem escolhida. A vitrine "Aparelhos com análise" continua fora da tabela, sempre visível quando há Análise, e nunca entra na contagem, ordenação ou paginação.

**Blocked by:** 07 — Catálogo: a tabela de instrumento; 08 — Catálogo: barra de ferramentas e pesquisa avançada.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/cards.md`, `references/moments.md`. `ui-ux-pro-max` — `"selection bar sticky action" --domain ux`.

**Status:** ready-for-agent

- [ ] Cada linha tem checkbox de 20 px com alvo de 44 px e `aria-label` "Comparar Marca Modelo".
- [ ] O dock mostra `N de 3 modelos selecionados`, nomes dos modelos em mono, "Limpar seleção" e "Comparar" (link só com 2–3); com seleção cheia, avisa o limite e desabilita os demais checkboxes.
- [ ] O dock aparece só com ao menos um item, fica acima da barra, não cobre a linha em leitura e desaparece no celular quando a seleção está vazia.
- [ ] A seleção é preservada em toda mudança de filtro, busca, ordenação e "Limpar filtros"; `?ids=` é reconstruído da URL e ids desconhecidos geram aviso com contagem.
- [ ] A vitrine mantém os cartões com imagem real, marca, título, capacidade e tipo; analisados do recorte primeiro e similares até seis, com legenda quando só há alternativas fora do recorte.
- [ ] A vitrine não altera contagem, ordenação nem paginação e continua fora da tabela.
- [ ] No celular, o dock ocupa a largura toda, mantém 44 px e a vitrine empilha em uma coluna.
- [ ] Testes de ilha cobrem limite, remoção, URL, aviso de descarte e presença da vitrine.
