# 106 — Ofertas: logo da loja e divulgação mínima

**What to build:** o link de Oferta para de escrever o nome da loja e passa a mostrar o **logotipo oficial do marketplace** em um badge pequeno com a cor da marca: Mercado Livre sobre amarelo e Amazon sobre fundo escuro, com o wordmark branco e o sorriso laranja. Os dois SVGs vivem em `apps/site/src/assets/lojas/` e são importados pelos componentes; loja desconhecida cai para o nome em texto. O rótulo **“Ver oferta →”** fica fora do badge, dentro do mesmo link, e o nome da loja não se repete em texto. O parágrafo longo de divulgação que abria a faixa de Ofertas sai de todos os cartões, e o aviso **“link de afiliado”** não aparece como texto visível: vive no `title` do logo e no nome acessível do link, com a divulgação por extenso no rodapé e nos Termos. A camada pura da home passa a carregar **todas** as Ofertas de um Aparelho, não só a primeira, para o cartão mostrar uma linha por loja quando houver as duas.

**Blocked by:** 102.

**Skills:** `design-taste-frontend` — `references/icons.md` (marca dentro da grade) e `references/cards.md`. `impeccable` — `reference/component-review.md` e `reference/clarify.md`. `ui-ux-pro-max` — `"affiliate disclosure microcopy" --domain ux`.

**Status:** done

## Logos

- [x] `lib/lojas.ts` normaliza o nome (sem acento, minúsculo, `mercado livre`/`mercadolivre`, `amazon`) e devolve a chave da loja, o nome canônico e as medidas do SVG ou `null`
- [x] `components/primitivos/LogoLoja.astro` e `components/comparar/LogoLojaIsla.tsx` renderizam o mesmo badge `.loja-marca loja-marca--<chave>` com o `<img>` do arquivo oficial, `alt`, `title="link de afiliado"` e fallback em texto
- [x] `assets/lojas/mercado-livre.svg` mantém os traçados oficiais em `<path>` (sem dependência de fonte); `assets/lojas/amazon.svg` usa os paths oficiais com wordmark `#fff` e sorriso `#ff9900`
- [x] Badge de 2 px de raio, amarelo `#f7d032` no Mercado Livre e `#221f1f` na Amazon; logo em 16 px de altura, proporção preservada
- [x] Nenhuma requisição externa e nenhum pacote de logos; os SVGs são locais e não são redesenhados em código
- [x] “Ver oferta →” fica fora do badge, no mesmo link; loja desconhecida cai para o nome em texto, sem badge

## Divulgação

- [x] `OfertaFaixa` não renderiza mais o parágrafo `intro`; o título e a lista continuam
- [x] `OfertaCartao` mostra `[badge da loja] Ver oferta →` num único link com `rel="sponsored nofollow noopener"` e `target="_blank"`
- [x] O aviso “link de afiliado” não é texto visível do cartão: fica no `title` do logo e no nome acessível `Ver oferta — <loja> — link de afiliado`
- [x] Ficha, Análise e Comparação herdam o mesmo cartão e a mesma marcação
- [x] O rodapé (“Transparência com o Leitor”) e os Termos continuam sendo o texto completo; nenhuma explicação longa volta para o cartão

## Dados

- [x] `CartaoDestaquePorCapacidade.oferta` vira `ofertas: { url, loja, rotulo }[]`
- [x] `destaquesPorCapacidade` mapeia **todas** as Ofertas publicadas do Aparelho, na ordem do arquivo, sem `.at(0)`
- [x] Testes de `home.test.ts` cobrem Aparelho com uma e com duas Ofertas e garantem que nenhuma é descartada
- [x] `DESIGN.md`, seção de Ofertas e de cartões, atualizado no mesmo commit
- [x] `pnpm test` verde; nenhuma mudança em `data/build` ou `reports`

## Notas

- O logo substitui o **nome da loja**, não o rótulo “Ver oferta”: o CTA continua dizendo o que acontece no clique e o texto da marca não aparece duas vezes.
- A divulgação passa de três níveis (parágrafo + marcador + rodapé/Termos) para dois (tooltip e nome acessível + rodapé/Termos). O ADR-0023 e o `CONTEXT.md` registram a decisão.
- Um Aparelho com duas Ofertas mostra duas linhas, cada uma com o badge da sua loja; o cartão não escolhe “a melhor” loja.
- **Revisão visual (2026-11-24):** a direção original pedia logos monocromáticos desenhados à mão e um marcador visível. O produto pediu badges com as cores oficiais e o aviso só no tooltip/nome acessível; esta revisão prevalece sobre o texto original. O SVG do Mercado Livre já no projeto foi mantido por ser path-based; a versão alternativa colada no pedido usava `<text>` e dependeria de fonte local.
