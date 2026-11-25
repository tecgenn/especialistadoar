# 96 — Blocos de aparelhos em destaque por faixa (substituem populares)

**What to build:** as seções "Capacidades populares" e "Marcas populares" são removidas. Em seu lugar, blocos tipo "Aparelhos de 9.000 BTUs em destaque" e "Aparelhos de 12.000 BTUs em destaque" (ou um seletor que altera a faixa), mostrando até 3 cartões com infos técnicas (marca, modelo, capacidade, tipo, IDRS, consumo anual) daqueles Aparelhos que tenham Análise publicada e/ou Oferta (link afiliado) na faixa escolhida. Dados derivados do `consulta.json` no build.

**Blocked by:** None — can start immediately.

**Skills:** `design-taste-frontend` — `references/cards.md` e `references/sections.md` (cartões de ficha técnica, uma ideia por bloco de faixa). `impeccable` — `reference/component-review.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"product spec card" --domain ux` e `"segmented control selector" --domain ux`.

**Status:** done

- [x] "Capacidades populares" e "Marcas populares" removidas da home
- [x] Blocos de aparelhos em destaque por capacidade exata (ex: 9.000, 12.000 BTUs)
- [x] Até 3 cartões por bloco com infos técnicas
- [x] Só aparelhos com Análise e/ou Oferta na capacidade aparecem
- [x] Sem seletor: decisão registrada no `DESIGN.md` (uma única capacidade com conteúdo hoje; a descoberta completa fica nos chips do catálogo)
- [x] Sem carrossel automático sem controle de pausa
- [x] Testes de build conferem contagem e links por capacidade
- [x] `DESIGN.md` atualizado no mesmo commit (decisão final e termos relacionados revisados; `impeccable detect` e testes doc↔código conferidos)

**Nota:** "faixa" no título e no enunciado significa capacidade exata (`?btu=`), não a **Faixa de capacidade** do glossário (`btuMin`/`btuMax`, intervalo do catálogo). Código, testes e `DESIGN.md` usam "capacidade" para evitar a colisão de termos. Com os dados atuais só 12.000 BTUs tem Análise/Oferta, então a home renderiza um bloco; não há teto de blocos, e uma capacidade sem destaque não vira bloco vazio. IDRS e consumo saem em faixa quando as Variantes divergem, como na ficha, em vez de valer só a última.
