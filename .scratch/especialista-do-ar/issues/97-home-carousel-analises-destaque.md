# 97 — Carousel de análises em destaque na home

**What to build:** a seção "Análises em destaque" passa a usar um carousel quando houver mais de uma Análise publicada. Carrossel automático com pausa nos controles e respeito a `prefers-reduced-motion`, mais navegação manual (próximo/anterior). Suporta análises que comparam dois aparelhos, mostrando link afiliado de ambos quando houver Oferta. Sem Análise publicada, a seção desaparece.

**Blocked by:** 96 — Blocos de aparelhos em destaque por faixa.

**Skills:** `design-taste-frontend` — `references/motion.md`, `references/moments.md` e `references/cards.md` (um único momento orquestrado, com pausa nos controles e respeito a `prefers-reduced-motion`). `impeccable` — `reference/animate.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"carousel accessible controls keyboard" --domain ux` e `"carousel reduced motion pause" --domain ux`.

**Status:** done

- [x] Carousel de análises quando houver ≥ 1 Análise publicada
- [x] Automático com intervalo, pausa nos controles, respeita reduced-motion
- [x] Navegação manual (próximo/anterior) acessível por teclado
- [x] Suporta análises comparando dois aparelhos com link afiliado de ambos
- [x] Sem Análise, a seção não renderiza
- [x] Imagem real da Análise com alt, data em mono, título, resumo
- [x] Testes de build conferem carousel e ausência de seção sem Análise
- [x] `DESIGN.md` atualizado no mesmo commit (decisão final e termos relacionados revisados; `impeccable detect` e testes doc↔código conferidos)

## Comments

Implementado em 2026-11-21.

- O enunciado diz "carousel quando houver mais de uma Análise publicada" e o critério diz "≥ 1". Vale o enunciado: com **uma** Análise o bloco é um destaque estático, sem controles e sem script — um carrossel de um quadro só esconderia a ausência de navegação atrás de botões inúteis. A seção continua renderizando com 1 Análise e desaparece com zero. Decisão registrada no `DESIGN.md` (seção "Análises em destaque (home)") e na revisão do #97 na spec da fase.
- Análises que comparam dois Aparelhos: o frontmatter ganhou `aparelhosComparados` (opcional, ids `ap-<12 hex>`, sem repetir o principal). Só o `aparelhoId` principal continua virando "Aparelho analisado"; a lista comparada serve ao destaque, que soma as Ofertas de todos os Aparelhos citados via `ofertasDoDestaque`. Aparelho sem Oferta não deixa buraco.
- A rotação pausa no ponteiro, no foco, fora da tela, com a aba escondida, no botão de pausa e em `prefers-reduced-motion`; o anúncio em região viva acontece só na navegação manual. Sem JavaScript a lista inteira aparece.
- Revisão em dois eixos: removido o `aria-pressed` do botão de pausa (o rótulo já muda para "Retomar"), eliminada a região aninhada com o mesmo nome (o `aria-roledescription="carrossel"` mora na própria seção), o `text-transform: uppercase` saiu do rótulo (o nome acessível lia "PAUSAR") e o script foi para um componente próprio, servido só quando há carrossel; o script inline também deixou de aparecer no HTML de uma Análise só.
