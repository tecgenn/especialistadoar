# 66 — Fundação: tokens, fontes e base tipográfica

**What to build:** o alicerce visual de todo o site. Ao final, qualquer página herda a paleta de instrumento, as três vozes tipográficas, a escala de espaço, os raios, o foco e o comportamento de movimento — sem que nenhuma classe existente seja renomeada. É a base que faz o restante do redesign parecer um sistema, e não uma colagem.

**Blocked by:** None — can start immediately.

**Skills:** `impeccable` — `SKILL.md` + `reference/foundations.md`, `reference/typeset.md`, `reference/colorize.md`. `ui-ux-pro-max` — `scripts/search.py "design system tokens typography" --design-system` e `"contrast focus tokens" --domain ux`. `design-taste-frontend` — `references/system.md`, `references/layout-v4.md`.

**Status:** done

- [x] Tokens de cor, tipografia, espaço, raio, elevação, movimento, larguras e z-index existem numa camada única e são a fonte normativa; `DESIGN.md` continua sendo o contrato documentado.
- [x] As três famílias (Schibsted Grotesk, Source Serif 4, Azeret Mono) são self-hosted via Fontsource, apenas o subset `latin`, com `font-display: swap`; apenas o arquivo latin da grotesca é pré-carregado.
- [x] O total das três fontes no primeiro carregamento fica ≤ 130 KB (medido: ~121 KB nos arquivos `latin` variáveis); `latin-ext` não entra nesta fase.
- [x] Fallbacks métricos evitam troca visível de layout; nenhuma requisição a CDN de fontes.
- [x] Reset e base cobrem `box-sizing`, margens, mídia responsiva, tipografia de corpo, títulos, links, listas, `::selection`, `:focus-visible` (2 px âmbar com offset) e `scroll-margin-top`.
- [x] `prefers-reduced-motion` desliga transições e animações; `forced-colors` preserva bordas e foco.
- [x] Os tokens e pares de contraste documentados (texto sobre giz/papel, giz sobre tinta, âmbar sobre tinta, Classes A–F) passam num teste puro que lê o CSS.
- [x] Nenhuma classe existente é renomeada; nenhum comportamento de ilha muda.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build:site` permanecem verdes.

## Comments

Implementado em 2026-11-19. `tokens.css` é a camada única e normativa (o
`DESIGN.md` continua o contrato documentado); `fontes.css` e `base.css` entram
no `global.css` por `@import`, antes das regras de componente, e os nomes
antigos de variável continuam existindo como alias. Nenhuma classe foi
renomeada e nenhuma ilha React foi tocada.

Validação executada: `pnpm build` sem diff em `data/build`/`reports`;
`pnpm build:site` com **2.236 páginas** e apenas os três woff2 `latin`
(Schibsted Grotesk 46.752 B, Source Serif 4 50.936 B, Azeret Mono 26.164 B —
123,8 KB), com o preload da home apontando para o mesmo arquivo hasheado do
`@font-face`; `pnpm lint` 0 erros (24 warnings: 21 pré-existentes e 3 de
`noImportantStyles` na guarda de `prefers-reduced-motion`); `pnpm typecheck`
OK; `pnpm test` **690/690** em 47 arquivos, incluindo os 26 testes puros de
`tokens.test.ts` (tokens, contraste, subset/orçamento de fontes, reset e
acessibilidade). A conferência visual foi feita com o agent-browser no preview
(1440×900 e 390×844): as fontes grotesca e serifa aparecem `loaded`, o foco de
teclado é âmbar de 2 px com afastamento e não há overflow horizontal; a revisão
corrigiu a tabela/navegação herdeiras da serifa e restringiu o contorno giz ao
`data-superficie="escura"`.
