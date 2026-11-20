# 94 — Régua de capacidade: lista mobile mantida, desktop integrado ao hero

**What to build:** a régua de capacidade continua funcionando no mobile como lista de seis linhas (já aprovado). No desktop, o efeito de linhas da régua migra para o hero (ticket #93). Decidir se a régua como navegação independente permanece na home ou é removida — se permanecer, fica abaixo do hero como seção própria; se for removida, seu conteúdo (links por faixa) é absorvido pelos blocos de aparelhos em destaque (ticket #96).

**Blocked by:** 93 — Hero renovado.

**Status:** ready-for-agent

- [ ] Mobile: régua como lista de seis linhas com barra de proporção, sem overflow
- [ ] Desktop: efeito de linhas integrado ao hero (não como régua independente)
- [ ] Decisão tomada sobre manter ou remover a régua independente na home
- [ ] Links por faixa continuam funcionando (`/aparelhos/?btuMin=&btuMax=`)
- [ ] Animação de ticks respeita `prefers-reduced-motion`
- [ ] Testes de `regua-capacidade.test.ts` e `analises-build.test.ts` atualizados
