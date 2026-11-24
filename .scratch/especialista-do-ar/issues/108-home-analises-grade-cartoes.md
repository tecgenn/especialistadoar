# 108 — Análises em destaque: grade estática de até três cartões

**What to build:** o carrossel de Análises sai. A seção vira uma **grade estática com no máximo as três Análises mais recentes**, cada uma num cartão com imagem de abertura quando existir, data em mono, título, resumo e a linha de Oferta do #106. No cabeçalho, um link **“Todas as análises →”** leva a `/analises/`; o link solto do rodapé da seção desaparece. Sem imagem, o cartão não inventa fotografia: abre com a data e o título, com a mesma altura mínima da grade. A seção continua ausente quando não há Análise publicada.

**Blocked by:** 102 (cabeçalho de seção), 106 (linha de Oferta).

**Skills:** `design-taste-frontend` — `references/cards.md` e `references/photos.md` (imagem real, sem placeholder inventado). `impeccable` — `reference/distill.md`, `reference/component-review.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"editorial card grid" --domain ux`.

**Status:** done

## Estrutura

- [x] `AnalisesDestaque.astro` sem `modoDaSecaoDeAnalises`, sem `data-carrossel`, sem controles de anterior/próxima/pausa e sem `aria-roledescription="carrossel"`
- [x] `lib/carrossel.ts`, `AnalisesCarrosselScript.astro` e os testes exclusivos do carrossel removidos
- [x] `destaques` ordenados por data decrescente e cortados em 3 no build; o restante fica em `/analises/`
- [x] Cabeçalho com `CabecalhoDeSecao` do #102: ícone `analise`, título “Análises em destaque”, lead curto e o link “Todas as análises →” no slot de ações
- [x] Nenhum script de rotação é servido; a página não carrega JavaScript por causa desta seção

## Cartões

- [x] Grade de 3 colunas ≥ 1024 px, 2 ≥ 640 px, 1 abaixo, com `align-items: stretch`
- [x] Cartão com imagem no topo em proporção 16:10 (`aspect-ratio`), `alt` real e `loading="lazy"` exceto o primeiro
- [x] Sem imagem, o cartão abre com um bloco tipográfico de data e título, sem cor decorativa e sem ícone de imagem quebrada
- [x] Data em mono 0,75 rem, título em grotesca como link, resumo em 2–3 linhas com `line-clamp` só se não cortar sentido
- [x] Oferta em uma linha por loja, com logo e o aviso no tooltip; sem parágrafo de divulgação
- [x] Alturas alinhadas por linha; o link “Todas as análises” não fica órfão no rodapé
- [x] Hover discreto: borda `--tinta` e sublinhado no título, sem sombra e sem zoom de imagem
- [x] 0 px de overflow em 320/390/768/1024/1440 px
- [x] Testes de build conferem no máximo 3 cartões, a ordem por data, o link para `/analises/`, a ausência de markup/script de carrossel e o cartão sem imagem
- [x] `DESIGN.md`, seção “Análises em destaque (home)”, atualizado no mesmo commit, removendo a decisão do #97

## Pedido do produto (2026-11-23): logo do Mercado Livre e aviso mínimo

Acrescentado a este ticket a pedido do produto, no mesmo commit da grade.

- [x] O SVG oficial do Mercado Livre saiu da raiz e vive em `apps/site/src/assets/lojas/mercado-livre.svg`, com `<title>` e `role="img"` para o lint
- [x] O CTA de Oferta usa o logotipo real da marca, com as cores da loja, em 20 px de altura e 79 px de largura reservada, no lugar do símbolo desenhado em código
- [x] Logo e rótulo estão no mesmo link, que abre o endereço afiliado do produto em nova aba (`rel="sponsored nofollow noopener"`)
- [x] O texto visível “link de afiliado” saiu dos cartões (ficha, Análise, Comparação, home); o aviso ficou no `title` do logo — o tooltip ao parar o ponteiro — e no nome acessível `Ver oferta — <loja> — link de afiliado`
- [x] A divulgação por extenso continua no bloco “Transparência com o Leitor” do rodapé, nos Termos de Uso e no banner do topo de cada Análise
- [x] A Amazon mantém o desenho de linha de 22 px (não há arquivo oficial no projeto); loja desconhecida segue no nome em texto
- [x] O token `--texto-micro`, que só existia para o marcador visível, foi removido junto do seu teste
- [x] Testes de build e de ilha conferem o `<img>` do Mercado Livre, o `title`, a ausência do marcador e o destino afiliado

## Notas

- O #97 aprovou o carrossel; o produto pediu a volta da grade estática. A decisão do #97 é substituída, não convive com ela.
- Com uma Análise só, a grade tem um cartão e não centraliza nem estica o cartão para ocupar a linha inteira: a coluna mantém a largura da grade.
