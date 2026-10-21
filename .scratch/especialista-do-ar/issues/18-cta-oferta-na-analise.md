# 18 — CTA de Oferta na Análise

**What to build:** a Análise passa a exibir o CTA da **Oferta** do Aparelho, usando um
cartão/faixa **reutilizável** — o mesmo que a ficha do Aparelho já usa, extraído para
componente. O CTA só aparece quando existe Oferta para aquele `aparelhoId`; sem
Oferta, a Análise fica sem CTA (nada de link vazio).

O componente nasce pronto para ser colocado em qualquer página, mas nesta fase só é
usado na Análise e na ficha. Ofertas continuam com
`rel="sponsored nofollow noopener"`, `target="_blank"` e o aviso de link comercial.
Nada de Oferta na ilha de busca/filtros (ADR-0010).

**Blocked by:** 17 — Camada de Análises ponta a ponta.

**Status:** done

- [x] A renderização de Oferta da ficha é extraída para um componente reutilizável
      (cartão e faixa/banner) que recebe `Oferta` e/ou `aparelhoId`.
- [x] A ficha continua exibindo as Ofertas como hoje, sem mudança de comportamento.
- [x] A Análise exibe o CTA quando há Oferta para o Aparelho e **não** exibe nada
      quando não há.
- [x] Links mantêm `rel="sponsored nofollow noopener"`, `target="_blank"` e o aviso
      de que são links comerciais, separados dos dados técnicos.
- [x] Conteúdo MDX consegue usar o componente aprovado no meio do texto, sem estilo
      inline.
- [x] Nenhuma Oferta entra em `data/build/` nem na ilha de busca; guarda de teste
      cobre os dois casos.
- [x] `pnpm build`, `pnpm build:site`, `pnpm lint`, `pnpm typecheck` e `pnpm test`
      verdes.

## Origin

Sessão de `grill-with-docs` de 2026-10-20 (Fase 5). Ver
`.scratch/especialista-do-ar/spec-fase-5.md` e ADR-0015.
