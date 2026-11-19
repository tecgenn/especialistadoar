# 03 — Primitivos de interface e ícones

**What to build:** o vocabulário compartilhado que as páginas usam para não reinventar botão, campo, etiqueta e estado vazio. São componentes Astro estáticos (sem hidratação) e classes de CSS com todos os estados: hover, foco, ativo, desabilitado, erro e seleção. Ao final, uma página nova consegue ser montada só com primitivos e composição.

**Blocked by:** 01 — Fundação: tokens, fontes e base tipográfica.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/cards.md`, `references/icons.md`, `references/motion.md`. `ui-ux-pro-max` — `"accessible button focus state" --domain ux`.

**Status:** ready-for-agent

- [ ] Botão primário, secundário e de texto com 44 px de altura, estados completos e foco visível; nenhum pill, nenhuma sombra em repouso.
- [ ] Campo de texto, select e área de ajuda/erro com rótulo associado, `aria-describedby`, borda de foco e mensagem de erro legível; o select usa seta desenhada e mantém o comportamento nativo.
- [ ] Chip de filtro e chip de resumo com estado ativo, hover e "×" com alvo de 44 px e `aria-label` de remoção.
- [ ] Etiqueta de Classe A–F com letra, cor e fundo tonal; quando as Variantes divergem, mostra a faixa com a pior Classe e um texto explicativo.
- [ ] Leitura de dado (`Readout`) com rótulo mono, valor, unidade e legenda; usada na home e na ficha sem virar "card de estatística".
- [ ] Régua de seção (`SectionRule`) com rótulo mono, hairline e contagem opcional; `Breadcrumbs` com `nav` e `aria-label`; `Notice` para avisos de estimativa/transparência; `EmptyState` com título, frase e ação.
- [ ] Conjunto de ícones de linha em SVG inline, 1,5 px, `currentColor`, decorativos com `aria-hidden`; nenhum pacote de ícones.
- [ ] Nenhum primitivo cria ilha ou JavaScript de cliente.
- [ ] Testes de renderização cobrem estados de erro, seleção e desabilitado; lint, typecheck e suíte verdes.
