# 109 — FAQ e Metodologia compactos, e Fontes no rodapé

**What to build:** o FAQ e a Metodologia continuam visíveis e continuam abrindo no clique, mas param de ocupar meia página com oito linhas empilhadas. Cada seção vira uma **grade de duas colunas de `<details>` compactos** a partir de 900 px (uma coluna abaixo), com numeração `01–08` em mono, linha hairline entre os itens, 56 px de altura fechada e `+`/`−` no ciano. O corpo só aparece quando abre; o texto do FAQ e da metodologia não muda uma palavra. As duas seções ganham o cabeçalho do #102 (ícones `perguntas` e `camadas`) e um lead curto. A linha **“Fontes · exportação oficial de produtos do INMETRO · Portaria INMETRO 269/2021 · ciclo de referência de 2.080 h/ano”** sai da metodologia e é absorvida pela coluna **Proveniência** do rodapé, que já é o lugar único da proveniência desde o #100.

**Blocked by:** 102.

**Skills:** `design-taste-frontend` — `references/sections-library.md` e `references/layout-v4.md` (densidade e ritmo). `impeccable` — `reference/distill.md`, `reference/component-review.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"accordion FAQ two column" --domain ux` e `"native details disclosure" --domain ux`.

**Status:** ready-for-agent

## FAQ e Metodologia

- [ ] `home-faq-lista` e `home-metodologia-lista` em `grid-template-columns: repeat(2, minmax(0, 1fr))` com `column-gap: var(--esp-8)` a partir de 900 px; uma coluna abaixo
- [ ] Cada `<details>` com índice `01`–`08` em mono `--mudo`, `aria-hidden="true"`, alinhado ao topo do título
- [ ] `summary` com no mínimo 56 px, `padding-block` de 8–12 px, `h3` em 1 rem e `+`/`−` em mono no ciano (`--foco-texto`)
- [ ] Corpo do FAQ em interface, corpo da metodologia em serifa, ambos com 68ch e respiro de 12 px; nada de corpo sempre visível
- [ ] Abrir um item não desloca a coluna vizinha além da própria linha; sem animação de altura e sem JavaScript
- [ ] Cabeçalho de cada seção com ícone, título e lead curto: “Respostas curtas sobre BTUs, consumo e dados do INMETRO.” e “Como os dados do INMETRO viram as fichas e a estimativa do site.”
- [ ] As duas seções fechadas cabem em ~360 px cada a 1440 px (contra ~500 px hoje), sem perder o texto
- [ ] `PERGUNTAS_FREQUENTES` e o JSON-LD `FAQPage` intactos: oito perguntas, mesmas respostas, mesma ordem
- [ ] Nenhum `details` aberto por padrão; teclado e leitor de tela continuam funcionando

## Fontes no rodapé

- [ ] `.home-fontes` removido de `index.astro` e `global.css`
- [ ] Coluna **Proveniência** do rodapé passa a dizer: “Base construída a partir da exportação oficial de produtos do INMETRO, sob a Portaria INMETRO 269/2021. Os cálculos de custo usam o ciclo de referência de 2.080 h/ano.”
- [ ] A frase não duplica a Versão da tabela nem cria uma quarta coluna; o rodapé continua com três colunas no desktop
- [ ] A metodologia mantém a Portaria 269/2021 apenas no tópico “Vigência da classificação”, onde ela explica a data da etiqueta — não como nota de fonte repetida
- [ ] Testes de build conferem a ausência de `.home-fontes`, a nova frase do rodapé e a grade de duas colunas no CSS

## Notas

- A nota de fontes não é um tópico de metodologia: é proveniência global. O rodapé já concentra origem, versão e transparência; manter a linha na home criava dois lugares para a mesma afirmação.
- A grade de duas colunas é a mudança de densidade, não uma mudança de conteúdo. O teste de contrato do FAQ continua lendo o mesmo array.
- `DESIGN.md` atualizado no mesmo commit: seções “Metodologia e INMETRO (home)”, “Perguntas frequentes” e “Rodapé”.
