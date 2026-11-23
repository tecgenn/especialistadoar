# 106 — Ofertas: logo da loja e divulgação mínima

**What to build:** o link de Oferta para de escrever o nome da loja e passa a mostrar o **logo do marketplace** em SVG inline, monocromático e herdando `currentColor`: Mercado Livre e Amazon desenhados à mão na grade de 24 px, com fallback em texto para loja desconhecida. O parágrafo longo de divulgação que hoje abre a faixa de Ofertas (“Links comerciais (de afiliado): a compra acontece na loja e a comissão, se houver, não custa nada a você.”) sai de todos os cartões. No lugar fica só o marcador mínimo **“link de afiliado”** a 0,625 rem em `--mudo`, ao lado do CTA, mais o bloco do rodapé e os Termos que já existem. A camada pura da home passa a carregar **todas** as Ofertas de um Aparelho, não só a primeira, para o cartão poder mostrar Mercado Livre e Amazon lado a lado quando houver as duas.

**Blocked by:** 102.

**Skills:** `design-taste-frontend` — `references/icons.md` (marca monocromática dentro da grade) e `references/cards.md`. `impeccable` — `reference/component-review.md` e `reference/clarify.md`. `ui-ux-pro-max` — `"affiliate disclosure microcopy" --domain ux`.

**Status:** done

## Logos

- [x] `lib/lojas.ts` normaliza o nome (sem acento, minúsculo, `mercado livre`/`mercadolivre`, `amazon`) e devolve a chave da loja ou `null`
- [x] `components/primitivos/LogoLoja.astro` renderiza o SVG inline com `role="img"` e `aria-label` com o nome da loja; sem logo, cai para o nome em texto
- [x] Marcas desenhadas como linha, 20–24 px, `currentColor`, sem preenchimento amarelo/colorido: aperto de mão do Mercado Livre e sorriso/seta da Amazon
- [x] Nenhuma requisição externa, nenhum arquivo de imagem e nenhum pacote de logos
- [x] O logo herda a cor do link e não muda de cor no hover além do que o texto já muda

## Divulgação

- [x] `--texto-micro: 0.625rem` adicionado aos tokens
- [x] `OfertaFaixa` não renderiza mais o parágrafo `intro`; o título e a lista continuam
- [x] `OfertaCartao` mostra `[logo] Ver oferta →` e o marcador “link de afiliado” em 0,625 rem e `--mudo`
- [x] O marcador continua dentro do link (o programa exige que a divulgação acompanhe o CTA), sem virar caixa, selo ou pill
- [x] Ficha, Análise e Comparação herdam o mesmo cartão e a mesma marcação
- [x] O rodapé (“Transparência com o Leitor”) e os Termos continuam sendo o texto completo; nenhuma explicação longa volta para o cartão

## Dados

- [x] `CartaoDestaquePorCapacidade.oferta` vira `ofertas: { url, loja, rotulo }[]`
- [x] `destaquesPorCapacidade` mapeia **todas** as Ofertas publicadas do Aparelho, na ordem do arquivo, sem `.at(0)`
- [x] Testes de `home.test.ts` cobrem Aparelho com uma e com duas Ofertas e garantem que nenhuma é descartada
- [x] `DESIGN.md`, seção de Ofertas e de cartões, atualizado no mesmo commit
- [x] `pnpm test` verde; nenhuma mudança em `data/build` ou `reports`

## Notas

- O logo não substitui o rótulo “Ver oferta”: ele substitui o **nome da loja**, que era texto redundante ao lado do logo. O CTA continua dizendo o que acontece no clique.
- A divulgação passa de três níveis (parágrafo + marcador + rodapé/Termos) para dois (marcador + rodapé/Termos). O #110 revisa o ADR-0023 e o `CONTEXT.md` para refletir a decisão.
- Um Aparelho com duas Ofertas mostra duas linhas, cada uma com seu logo; o cartão não escolhe “a melhor” loja.
