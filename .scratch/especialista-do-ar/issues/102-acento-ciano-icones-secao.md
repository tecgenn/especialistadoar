# 102 — Acento ciano e cabeçalho de seção com ícone

**What to build:** o acento do sistema deixa de ser âmbar e passa a ser um ciano frio da mesma família do azul-frio, para o site inteiro ler como climatização — não como alerta. O âmbar e a escala térmica saem dos tokens; foco, item ativo da navegação, seleção de texto, marcador de linha analisada, borda de nota de transparência e `+` do acordeão passam a usar o ciano. Na mesma fundação nasce o **cabeçalho de seção padrão da home**: ícone de linha de 20 px num tile hairline de 32 px ao lado do `h2`, com lead opcional. Cinco ícones novos entram no conjunto existente (`lib/icones.ts`), todos funcionais: identificam uma seção ou um controle, nunca decoram.

**Blocked by:** None.

**Skills:** `design-taste-frontend` — `references/icons.md` e `references/layout-v4.md` (ícones de linha, grade e ritmo de seção). `impeccable` — `reference/colorize.md` e `reference/craft-floor.md` (contraste, foco e hierarquia). `ui-ux-pro-max` — `"section header icon" --domain ux`.

**Status:** ready-for-agent

## Decisão de cor

O ciano é **gráfico**, não texto. `--foco: #0F8FA8` tem 3,8:1 sobre giz/papel — passa o mínimo de 3:1 para contorno de foco, sublinhado e marcador, e não serve para texto. Texto em ciano usa `--foco-texto: #0B6F83` (5,8:1). A ação primária continua sendo `--azul-frio` (`#0E6B8A`); o ciano é o sinal de interação e de dado analisado, um degrau mais claro e mais frio que a ação. As Classes A–F continuam sendo as únicas cores saturadas de dado.

- [ ] `--sinal`, `--sinal-texto`, `--sinal-lavado` e `--escala-frio/neutro/morno/quente` removidos de `tokens.css`
- [ ] `--foco: #0f8fa8`, `--foco-texto: #0b6f83` e `--foco-lavado` (mix de 18% com giz, para `::selection`) definidos
- [ ] Nenhum `var(--sinal)` no CSS: foco global, `[data-superficie="escura"]`, nav ativo, `::selection`, linha analisada, nota de transparência e acordeão em ciano
- [ ] `::selection` legível: fundo `--foco-lavado` com tinta, não ciano cheio com texto claro
- [ ] O traço de 2 px acima do H1 (`.home-titulo::before`) removido — o hero do #103 nasce sem kicker
- [ ] `lib/icones.ts` ganha `ar-condicionado`, `analise`, `perguntas`, `camadas` e `sol`, na grade 24×24, traço 1,5, `currentColor`
- [ ] `components/primitivos/CabecalhoDeSecao.astro`: ícone 20 px em tile de 32 px com hairline, `h2` com `id`, lead opcional e slot para ações
- [ ] Cabeçalho aplicado a **Aparelhos em destaque**, **Análises em destaque**, **FAQ** e **Metodologia** (as seções que os tickets seguintes reescrevem reutilizam o mesmo componente)
- [ ] `DESIGN.md` atualizado no mesmo commit: todos os "âmbar", `--sinal` e "escala térmica" relidos — não só os do foco —, com a regra de que ciano não é texto
- [ ] `tokens.test.ts`, `primitivos.test.ts` e `analises-build.test.ts` verdes, com asserção de que `--sinal`/`--escala-*` não existem mais
- [ ] `impeccable detect` sem categoria nova; foco visível em todas as superfícies

## Notas

- A troca é mecânica, mas ampla: `global.css` tem 20 usos de `--sinal` e `primitivos.css` tem 9. O ticket só termina quando `grep -rn -- "--sinal\|--escala-" apps/site/src` volta vazio.
- O tile do ícone não é um selo colorido: fundo giz, borda `--linha`, ícone `--azul-frio-texto`. Em superfície escura, giz. Nada de ícone preenchido ou ilustrativo.
- O cabeçalho de seção é o mesmo em toda a home; a ficha, o catálogo e o Assistente mantêm os cabeçalhos próprios já documentados.
