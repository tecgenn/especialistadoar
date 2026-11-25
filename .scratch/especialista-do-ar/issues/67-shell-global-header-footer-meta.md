# 67 — Shell global: header, footer, larguras e metadados

**What to build:** a moldura de todas as páginas. O visitante passa a reconhecer o mesmo instrumento em qualquer rota: cabeçalho com navegação e estado ativo, rodapé com proveniência e transparência, larguras de shell/leitura corretas e metadados sociais completos. O skip link é o primeiro foco e a página pode ser operada por teclado desde o topo.

**Blocked by:** 66 — Fundação: tokens, fontes e base tipográfica.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/layout-v4.md`, `references/icons.md`. `ui-ux-pro-max` — `"navigation skip link header" --domain ux` e `--stack astro`. `impeccable` — `reference/craft-floor.md`.

**Status:** done

- [x] O header tem 64/72 px, marca, navegação com `aria-current="page"` e barra âmbar de 2 px no item ativo; no celular a navegação rola horizontalmente sem esconder itens.
- [x] O footer em tinta apresenta proveniência e Versão da tabela, navegação institucional e a nota de afiliado, em três colunas no desktop e empilhado no celular.
- [x] O skip link é o primeiro elemento focável, visível no foco, e leva ao `main`.
- [x] As props de largura do layout distinguem shell (catálogo, ficha, home), leitura (artigos e institucionais) e página ampla, sem mudar URLs nem conteúdo.
- [x] `theme-color`, `og:type`, `og:title`, `og:description`, `og:site_name`, `og:locale` e `twitter:card` são emitidos em todas as páginas; `og:image` só quando houver imagem real.
- [x] Título, description, canonical e JSON-LD existentes continuam intactos em todas as rotas.
- [x] O rodapé e o header aparecem em todas as páginas geradas; o teste de build confere skip link, `aria-current` e metadados.
- [x] `pnpm build:site` gera a mesma contagem de páginas (exceto o 404, que entra no ticket próprio) e a suíte continua verde.
