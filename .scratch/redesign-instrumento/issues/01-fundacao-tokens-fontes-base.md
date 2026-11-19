# 01 — Fundação: tokens, fontes e base tipográfica

**What to build:** o alicerce visual de todo o site. Ao final, qualquer página herda a paleta de instrumento, as três vozes tipográficas, a escala de espaço, os raios, o foco e o comportamento de movimento — sem que nenhuma classe existente seja renomeada. É a base que faz o restante do redesign parecer um sistema, e não uma colagem.

**Blocked by:** None — can start immediately.

**Skills:** `impeccable` — `SKILL.md` + `reference/foundations.md`, `reference/typeset.md`, `reference/colorize.md`. `ui-ux-pro-max` — `scripts/search.py "design system tokens typography" --design-system` e `"contrast focus tokens" --domain ux`. `design-taste-frontend` — `references/system.md`, `references/layout-v4.md`.

**Status:** ready-for-agent

- [ ] Tokens de cor, tipografia, espaço, raio, elevação, movimento, larguras e z-index existem numa camada única e são a fonte normativa; `DESIGN.md` continua sendo o contrato documentado.
- [ ] As três famílias (Schibsted Grotesk, Source Serif 4, Azeret Mono) são self-hosted via Fontsource, apenas o subset `latin`, com `font-display: swap`; apenas o arquivo latin da grotesca é pré-carregado.
- [ ] O total das três fontes no primeiro carregamento fica ≤ 130 KB (medido: ~121 KB nos arquivos `latin` variáveis); `latin-ext` não entra nesta fase.
- [ ] Fallbacks métricos evitam troca visível de layout; nenhuma requisição a CDN de fontes.
- [ ] Reset e base cobrem `box-sizing`, margens, mídia responsiva, tipografia de corpo, títulos, links, listas, `::selection`, `:focus-visible` (2 px âmbar com offset) e `scroll-margin-top`.
- [ ] `prefers-reduced-motion` desliga transições e animações; `forced-colors` preserva bordas e foco.
- [ ] Os tokens e pares de contraste documentados (texto sobre giz/papel, giz sobre tinta, âmbar sobre tinta, Classes A–F) passam num teste puro que lê o CSS.
- [ ] Nenhuma classe existente é renomeada; nenhum comportamento de ilha muda.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build:site` permanecem verdes.
