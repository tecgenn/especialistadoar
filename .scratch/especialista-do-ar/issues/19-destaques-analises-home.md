# 19 — Destaques de Análises na home

**What to build:** a home ganha um bloco estático de **Análises em destaque**,
mostrando as Análises publicadas com título, descrição, link e o CTA da Oferta
quando existir. O bloco é gerado no build, a partir do conteúdo do site — nada de
Oferta ou de dado carregado no cliente.

Com zero Análises, a home é exatamente a de hoje: o bloco não aparece.

**Blocked by:** 17 — Camada de Análises ponta a ponta; 18 — CTA de Oferta na Análise.

**Status:** done

- [x] A home exibe um bloco de Análises em destaque com título, descrição, link para
      `/analises/<slug>/` e o CTA quando houver Oferta.
- [x] O bloco é gerado no build; o cliente não baixa `ofertas.json` nem
      `analises.json` para renderizá-lo.
- [x] Com zero Análises, o bloco não é renderizado e a home permanece como hoje.
- [x] O bloco usa os componentes reutilizáveis de Oferta (sem duplicar markup).
- [x] Teste de build com fixture cobre o bloco com e sem Análises.
- [x] `pnpm build`, `pnpm build:site`, `pnpm lint`, `pnpm typecheck` e `pnpm test`
      verdes.

## Origin

Sessão de `grill-with-docs` de 2026-10-20 (Fase 5). Ver
`.scratch/especialista-do-ar/spec-fase-5.md` e ADR-0015.
