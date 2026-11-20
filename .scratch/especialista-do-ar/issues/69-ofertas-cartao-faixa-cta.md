# 69 — Ofertas: cartão, faixa e CTA no novo sistema

**What to build:** a apresentação comercial do site deixa de parecer um bloco genérico e passa a ser um componente claramente separado do dado técnico. "Ver oferta — Loja · link de afiliado" continua em uma linha, com a mesma transparência de três níveis, e a matriz de comparação continua sem qualquer elemento comercial.

**Blocked by:** 68 — Primitivos de interface e ícones; 91 — Calibração do chão visual.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/cards.md`, `references/copy.md`. `ui-ux-pro-max` — `"affiliate disclosure link" --domain ux`.

**Status:** done

- [x] O cartão de Oferta usa o novo sistema: texto "Ver oferta", loja e marcador de afiliado na mesma linha, sem preço, desconto, selo de urgência ou cor de promoção.
- [x] A faixa de Ofertas mantém a frase curta de transparência e o afastamento dos dados técnicos; sem Oferta, nada é renderizado (nem espaço reservado).
- [x] O CTA de Oferta na comparação fica na área de ações do cartão, antes de "Trocar", e nunca dentro da matriz.
- [x] `rel="sponsored nofollow noopener"` e `target="_blank"` continuam centralizados no único componente de Oferta.
- [x] A nota de afiliado do rodapé continua presente em todas as páginas, agora no novo rodapé.
- [x] O visual funciona sobre giz, papel e tinta, com foco visível e alvo de 44 px no celular.
- [x] Testes existentes de Ofertas continuam verdes e cobrem a ausência de promessa de preço.
- [x] `data/build`, `reports` e o contrato de Ofertas não mudam.

## Comments

Implementado em 2026-11-20. Mudanças principais:
- `global.css`: `.ofertas` virou seção hairline-separada (border-top + hairlines entre linhas), `.oferta-cartao` com `min-height: 44px`, tipografia de interface, gap sistemático; `.cta-cartao` passou a giz + hairline + raio `--raio-sm` (sem cor de promoção, sem barra lateral, sem pill 999px); `.cta-ofertas .oferta-cartao` com visual de botão secundário do sistema; `.analises-destaque-lista .ofertas` e `.comparar-cartao-acoes .oferta-cartao` alinhados.
- `OfertaCartao.astro` e `Comparar.tsx`: marcador "link de afiliado" sem o "·" no HTML (o separador é `::before` no CSS; some no breakpoint ≤ 30rem para o marcador descer inteiro sem separador órfão).
- `analises/[slug].astro`: 7 ocorrências de `<a class="cta-acao">` substituídas por `<Botao variante="secundario">` (primitivo do ticket 68); CSS `.cta-acao` (azul `#075985`, pill 999px) removido.
- Testes: `ofertas.test.ts` ganhou describe "a apresentação da Oferta segue o sistema visual" (sem hex, sem 999px, 44px, hairline, mono marker, stacking no celular); `comparar-ilha.test.tsx` ganhou asserções de ordem DOM (Oferta → Trocar → Remover); `analises-build.test.ts` afirma ausência de `class="cta-acao"` e presença de `class="botao botao-secundario"`.
- `pnpm test` (737/737), `pnpm typecheck`, `pnpm lint` (0 erros, 24 warnings pré-existentes), `pnpm build:site` (2236 páginas) verdes. `data/build` e `reports` inalterados (`git status` limpo neles).
- Dois pedidos fora do escopo do #69 foram registrados em tickets separados: `#92` (paleta azul-frio/gelo no lugar do petróleo no rodapé/botões) e item de densidade/centralização adicionado ao `#72` (tabela do catálogo).