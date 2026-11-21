# 94 — Régua de capacidade: lista mobile e decisão sobre a navegação independente

**What to build:** a régua de capacidade continua funcionando no mobile como lista de seis linhas (já aprovado). No desktop ela é a **única** leitura de escala da primeira tela: o #93 foi refeito e o hero não carrega mais uma escala de linhas nem um painel lateral. Decidir se a régua como navegação independente permanece na home ou é removida — se permanecer, fica abaixo do hero como seção própria; se for removida, seu conteúdo (links por faixa) é absorvido pelos blocos de aparelhos em destaque (ticket #96).

> **Revisão (2026-11-21):** a versão original deste ticket dizia que "o efeito de linhas da régua migra para o hero". Isso não acontece mais: a escala lateral foi descartada no #93 e o hero virou um simulador de ambiente. Não há segunda escala para integrar — a decisão agora é só sobre manter ou remover a régua navegável.

**Blocked by:** 93 — Hero renovado.

**Status:** ready-for-agent

- [ ] Mobile: régua como lista de seis linhas com barra de proporção, sem overflow
- [ ] Desktop: a régua é a única leitura de escala — nada equivalente dentro do hero
- [ ] Decisão tomada sobre manter ou remover a régua independente na home
- [ ] Links por faixa continuam funcionando (`/aparelhos/?btuMin=&btuMax=`)
- [ ] Animação de ticks respeita `prefers-reduced-motion`
- [ ] Testes de `regua-capacidade.test.ts` e `analises-build.test.ts` atualizados
