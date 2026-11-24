# 109 — FAQ e Metodologia compactos, e Fontes no rodapé

**What to build:** o FAQ e a Metodologia continuam visíveis e continuam abrindo no clique, mas param de ocupar meia página com oito linhas empilhadas. Cada seção vira uma **grade de duas colunas de `<details>` compactos** a partir de 900 px (uma coluna abaixo), com numeração `01–08` em mono, linha hairline entre os itens, 56 px de altura fechada e `+`/`−` no ciano. O corpo só aparece quando abre; o texto do FAQ e da metodologia não muda uma palavra. As duas seções ganham o cabeçalho do #102 (ícones `perguntas` e `camadas`) e um lead curto. A linha **“Fontes · exportação oficial de produtos do INMETRO · Portaria INMETRO 269/2021 · ciclo de referência de 2.080 h/ano”** sai da metodologia e é absorvida pela coluna **Proveniência** do rodapé, que já é o lugar único da proveniência desde o #100.

**Blocked by:** 102.

**Skills:** `design-taste-frontend` — `references/sections-library.md` e `references/layout-v4.md` (densidade e ritmo). `impeccable` — `reference/distill.md`, `reference/component-review.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"accordion FAQ two column" --domain ux` e `"native details disclosure" --domain ux`.

**Status:** done

## FAQ e Metodologia

- [x] `home-faq-lista` e `home-metodologia-lista` em `grid-template-columns: repeat(2, minmax(0, 1fr))` com `column-gap: var(--esp-8)` a partir de 900 px; uma coluna abaixo
- [x] Cada `<details>` com índice em mono `--mudo`, `aria-hidden="true"`, alinhado ao topo do título
- [x] `summary` com no mínimo 56 px, `padding-block` de 12 px, `h3` em 1 rem e `+`/`−` em mono no ciano (`--foco-texto`)
- [x] Corpo do FAQ em interface, corpo da metodologia em serifa, ambos com 68ch e respiro de 12 px; nada de corpo sempre visível
- [x] Abrir um item não desloca a coluna vizinha além da própria linha; sem animação de altura e sem JavaScript
- [x] Cabeçalho de cada seção com ícone, título e lead curto: “Respostas curtas sobre BTUs, consumo e dados do INMETRO.” e “Como os dados do INMETRO viram as fichas e a estimativa do site.”
- [x] As duas seções fechadas cabem em 357 px cada a 1440 px (contra ~500 px antes do ticket), sem perder o texto restante
- [x] Com a pergunta de consumo removida no alinhamento pós-revisão, `PERGUNTAS_FREQUENTES` e o JSON-LD `FAQPage` seguem com as mesmas oito perguntas, respostas e ordem
- [x] Nenhum `details` aberto por padrão; teclado e leitor de tela continuam funcionando

## Fontes no rodapé

- [x] `.home-fontes` removido de `index.astro` e `global.css`
- [x] Coluna **Proveniência** do rodapé passa a dizer: “Base construída a partir da exportação oficial de produtos do INMETRO, sob a Portaria INMETRO 269/2021. Os cálculos de custo usam o ciclo de referência de 2.080 h/ano.”
- [x] A frase não duplica a Versão da tabela nem cria uma quarta coluna; o rodapé continua com três colunas no desktop
- [x] A metodologia mantém a Portaria 269/2021 apenas no tópico “Vigência da classificação”, onde ela explica a data da etiqueta — não como nota de fonte repetida
- [x] Testes de build conferem a ausência de `.home-fontes`, a nova frase do rodapé **dentro da coluna Proveniência, junto da Versão**, a grade de duas colunas no CSS e uma coluna abaixo de 900 px

## Notas

- A nota de fontes não é um tópico de metodologia: é proveniência global. O rodapé já concentra origem, versão e transparência; manter a linha na home criava dois lugares para a mesma afirmação.
- A grade de duas colunas é a mudança de densidade, não uma mudança de conteúdo. O teste de contrato do FAQ continua lendo o mesmo array.
- `DESIGN.md` atualizado no mesmo commit: seções “Perguntas frequentes (home)”, “Metodologia e INMETRO (home)”, “Rodapé” e Don'ts.

## Comments

### Execução (2026-11-23)

- **Alinhamento pós-revisão (2026-11-24):** a revisão em dois eixos apontou a contradição entre as oito perguntas do contrato da Fase 12 e as nove publicadas desde o #64. "Como comparar o consumo de energia?" saiu do FAQ; `PERGUNTAS_FREQUENTES`, `FAQPage`, índice `01`–`08`, testes, `DESIGN.md` e `project-state.md` passaram a descrever as mesmas oito perguntas, com o texto restante e a ordem preservados. Com quatro linhas na grade, FAQ e metodologia fecham em 357 px a 1440 px; o índice e o `h3` seguem com o mesmo topo (y = 2176 na medição final). A grade de uma coluna abaixo de 900 px e a frase de Proveniência junto da Versão passaram a ter asserção no teste de build.
- **Código:** as URLs dos SVGs oficiais saíram dos dois componentes para `src/components/urls-dos-logos.ts`, `dadosDoLogoDaLoja` reusa o registro canônico em vez de re-declarar campos e `nomeDaLoja` saiu, porque só o teste o chamava.
- **Índice e alinhamento:** o índice fica como primeiro item do `summary` em grade de três colunas (`auto minmax(0, 1fr) auto`), com o topo do texto alinhado ao topo do `h3` (medido: ambos em y = 1477 no FAQ).
- **Verificação no navegador:** 1 coluna até 899 px e 2 colunas de 48 px de calha a partir de 900 px (900: 390 + 390; 1440: 648 + 648; 1920: 648 + 648). Item fechado de 57 px (56 de `min-height` mais a hairline). Abrir o primeiro item leva a linha de 57 para 171 px e empurra só as linhas seguintes; o vizinho da mesma linha não se move. Enter no `summary` focado abre com o marcador `−`, foco de 2 px ciano com offset de 2 px, corpo do FAQ em interface e o da metodologia em Source Serif. 0 px de overflow horizontal em 320/390/640/768/899/900/1024/1440/1920 px.
- **Rodapé:** um único `Versão da tabela:` por página, dentro da coluna Proveniência junto da frase nova, três colunas de 416 px no desktop, parágrafo em `--mudo-escuro` (4,9:1) e nenhum `.home-fontes` na home.
- **Skills:** `ui-ux-pro-max` não tem verbo para accordion/FAQ duas colunas (`"accordion FAQ two column"` e `"accordion disclosure"` não retornaram nada; `"FAQ section"` devolveu só navegação e `"long list scanning"` só limites de linha, ambos genéricos). A densidade seguiu `design-taste-frontend` (`sections-library.md`/`layout-v4.md`) e `impeccable` (`distill.md`/`component-review.md`/`craft-floor.md`); `sections-library.md` pede respostas sempre abertas, e a decisão do #71/#99 (fechadas, nativas) prevalece por ser o contrato do projeto.
