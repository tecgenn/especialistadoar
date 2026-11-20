# 97 — Carousel de análises em destaque na home

**What to build:** a seção "Análises em destaque" passa a usar um carousel quando houver mais de uma Análise publicada. Carrossel automático com pausa nos controles e respeito a `prefers-reduced-motion`, mais navegação manual (próximo/anterior). Suporta análises que comparam dois aparelhos, mostrando link afiliado de ambos quando houver Oferta. Sem Análise publicada, a seção desaparece.

**Blocked by:** 96 — Blocos de aparelhos em destaque por faixa.

**Status:** ready-for-agent

- [ ] Carousel de análises quando houver ≥ 1 Análise publicada
- [ ] Automático com intervalo, pausa nos controles, respeita reduced-motion
- [ ] Navegação manual (próximo/anterior) acessível por teclado
- [ ] Suporta análises comparando dois aparelhos com link afiliado de ambos
- [ ] Sem Análise, a seção não renderiza
- [ ] Imagem real da Análise com alt, data em mono, título, resumo
- [ ] Testes de build conferem carousel e ausência de seção sem Análise
