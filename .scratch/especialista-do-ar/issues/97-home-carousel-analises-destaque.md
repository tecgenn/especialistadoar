# 97 — Carousel de análises em destaque na home

**What to build:** a seção "Análises em destaque" passa a usar um carousel quando houver mais de uma Análise publicada. Carrossel automático com pausa nos controles e respeito a `prefers-reduced-motion`, mais navegação manual (próximo/anterior). Suporta análises que comparam dois aparelhos, mostrando link afiliado de ambos quando houver Oferta. Sem Análise publicada, a seção desaparece.

**Blocked by:** 96 — Blocos de aparelhos em destaque por faixa.

**Skills:** `design-taste-frontend` — `references/motion.md`, `references/moments.md` e `references/cards.md` (um único momento orquestrado, com pausa nos controles e respeito a `prefers-reduced-motion`). `impeccable` — `reference/animate.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"carousel accessible controls keyboard" --domain ux` e `"carousel reduced motion pause" --domain ux`.

**Status:** ready-for-agent

- [ ] Carousel de análises quando houver ≥ 1 Análise publicada
- [ ] Automático com intervalo, pausa nos controles, respeita reduced-motion
- [ ] Navegação manual (próximo/anterior) acessível por teclado
- [ ] Suporta análises comparando dois aparelhos com link afiliado de ambos
- [ ] Sem Análise, a seção não renderiza
- [ ] Imagem real da Análise com alt, data em mono, título, resumo
- [ ] Testes de build conferem carousel e ausência de seção sem Análise
- [ ] `DESIGN.md` atualizado no mesmo commit (decisão final e termos relacionados revisados; `impeccable detect` e testes doc↔código conferidos)
