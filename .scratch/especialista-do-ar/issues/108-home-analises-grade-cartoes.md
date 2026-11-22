# 108 — Análises em destaque: grade estática de até três cartões

**What to build:** o carrossel de Análises sai. A seção vira uma **grade estática com no máximo as três Análises mais recentes**, cada uma num cartão com imagem de abertura quando existir, data em mono, título, resumo e a linha de Oferta do #106. No cabeçalho, um link **“Todas as análises →”** leva a `/analises/`; o link solto do rodapé da seção desaparece. Sem imagem, o cartão não inventa fotografia: abre com a data e o título, com a mesma altura mínima da grade. A seção continua ausente quando não há Análise publicada.

**Blocked by:** 102 (cabeçalho de seção), 106 (linha de Oferta).

**Skills:** `design-taste-frontend` — `references/cards.md` e `references/photos.md` (imagem real, sem placeholder inventado). `impeccable` — `reference/distill.md`, `reference/component-review.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"editorial card grid" --domain ux`.

**Status:** ready-for-agent

## Estrutura

- [ ] `AnalisesDestaque.astro` sem `modoDaSecaoDeAnalises`, sem `data-carrossel`, sem controles de anterior/próxima/pausa e sem `aria-roledescription="carrossel"`
- [ ] `lib/carrossel.ts`, `AnalisesCarrosselScript.astro` e os testes exclusivos do carrossel removidos
- [ ] `destaques` ordenados por data decrescente e cortados em 3 no build; o restante fica em `/analises/`
- [ ] Cabeçalho com `CabecalhoDeSecao` do #102: ícone `analise`, título “Análises em destaque”, lead curto e o link “Todas as análises →” no slot de ações
- [ ] Nenhum script de rotação é servido; a página não carrega JavaScript por causa desta seção

## Cartões

- [ ] Grade de 3 colunas ≥ 1024 px, 2 ≥ 640 px, 1 abaixo, com `align-items: stretch`
- [ ] Cartão com imagem no topo em proporção 16:10 (`aspect-ratio`), `alt` real e `loading="lazy"` exceto o primeiro
- [ ] Sem imagem, o cartão abre com um bloco tipográfico de data e título, sem cor decorativa e sem ícone de imagem quebrada
- [ ] Data em mono 0,75 rem, título em grotesca como link, resumo em 2–3 linhas com `line-clamp` só se não cortar sentido
- [ ] Oferta em uma linha por loja, com logo e marcador mínimo; sem parágrafo de divulgação
- [ ] Alturas alinhadas por linha; o link “Todas as análises” não fica órfão no rodapé
- [ ] Hover discreto: borda `--tinta` e sublinhado no título, sem sombra e sem zoom de imagem
- [ ] 0 px de overflow em 320/390/768/1024/1440 px
- [ ] Testes de build conferem no máximo 3 cartões, a ordem por data, o link para `/analises/`, a ausência de markup/script de carrossel e o cartão sem imagem
- [ ] `DESIGN.md`, seção “Análises em destaque (home)”, atualizado no mesmo commit, removendo a decisão do #97

## Notas

- O #97 aprovou o carrossel; o produto pediu a volta da grade estática. A decisão do #97 é substituída, não convive com ela.
- Com uma Análise só, a grade tem um cartão e não centraliza nem estica o cartão para ocupar a linha inteira: a coluna mantém a largura da grade.
