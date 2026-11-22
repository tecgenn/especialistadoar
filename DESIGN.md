---
name: Especialista do Ar
description: Um instrumento de climatização — dados oficiais do INMETRO, legíveis e comparáveis.
colors:
  ink: "#0A1F22"
  petrol: "#123F45"
  petrol-deep: "#0B2C30"
  chalk: "#FDFDFB"
  paper: "#F8F8F7"
  mineral: "#ECECEB"
  hairline: "#D5D8D5"
  hairline-dark: "#24454A"
  graphite: "#4B5D5F"
  muted: "#5F6F70"
  muted-dark: "#A9C0C6"
  focus: "#0F8FA8"
  focus-ink: "#0B6F83"
  focus-wash: "#D2E9EC"
  cold: "#2F7F8C"
  cold-ink: "#1D5B66"
  cold-wash: "#E3EFF0"
  blue-cold: "#0E6B8A"
  blue-cold-hover: "#1579A0"
  blue-cold-active: "#0B5A73"
  blue-cold-ink: "#0E6B8A"
  blue-cold-wash: "#E9F1F1"
  blue-cold-dark: "#084D66"
  classe-a: "#1B6A4E"
  classe-b: "#467536"
  classe-c: "#6E691B"
  classe-d: "#96601C"
  classe-e: "#9F4529"
  classe-f: "#8E2F35"
typography:
  display-home:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6.4vw, 5.25rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  display:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 5.2vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.2vw, 2.75rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  ui:
    fontFamily: "Schibsted Grotesk Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: "Azeret Mono Variable, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.08em"
  readout:
    fontFamily: "Azeret Mono Variable, ui-monospace, monospace"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "8px"
spacing:
  "1": "2px"
  "2": "4px"
  "3": "8px"
  "4": "12px"
  "5": "16px"
  "6": "24px"
  "7": "32px"
  "8": "48px"
  "9": "64px"
  "10": "96px"
  "11": "128px"
components:
  button-primary:
    backgroundColor: "{colors.blue-cold}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.xs}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.blue-cold-hover}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.xs}"
    padding: "10px 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "10px 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "10px 12px"
    height: "44px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.xs}"
    padding: "6px 10px"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.xs}"
    padding: "6px 10px"
  badge-classe:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
  panel:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "24px"
---

# Design System: Especialista do Ar

## Overview

**Creative North Star: "Instrumento de climatização"**

O site é um instrumento de medição, não uma vitrine. A superfície lembra um painel de climatização calibrado: chão quase branco e neutro, tinta petróleo profunda, linhas de 1 px que separam escalas, leituras em mono com unidade sempre presente e um único acento ciano de interação, que nunca vira texto. Nada flutua; tudo está apoiado numa grade visível. A autoridade vem da calibração — réguas de seção, colunas, numeração, procedência —, não de sombras, gradientes ou promessas.

A densidade é deliberada. O catálogo é o produto, então a tabela pode ser densa e a ficha pode ser longa; o que não pode existir é ruído. Cada ornamento tem função: a linha separa atributos, a numeração ordena listas, o mono identifica uma unidade ou uma fonte, o ciano assinala a interação e o dado analisado. O visitante deve sentir que está lendo um instrumento confiável e não uma página de marketing.

A voz editorial é sóbria e brasileira. A serifa conta a análise; a grotesca organiza a interface; o mono mede. O contraste entre as três vozes é o sistema. Não há ilustração decorativa, personagem, mascote, glassmorphism, gradiente de fundo, pill, card arredondado ou selo de "melhor". O que existe é o dado, a escala e o caminho para decidir.

**Key Characteristics:**
- Grade de medição visível: hairlines e numeração de 1 px.
- Superfícies mate: chão quase branco e neutro, tinta petróleo, nenhum brilho.
- Um acento ciano de interação e de dado analisado, um degrau mais claro e frio que a ação.
- Três vozes tipográficas: grotesca para operar, serifa para ler, mono para medir.
- Quase nenhuma sombra; profundidade por tom e linha.
- Cantos de 2–8 px nos componentes do sistema; nenhum pill. Etiquetas legadas em `global.css` ainda usam 999 px e estão inventariadas na spec da fase como dívida a limpar.
- Movimento curto e funcional, sempre com alternativa sem movimento.

**Modo:** somente claro nesta fase. Os tokens são organizados para permitir uma camada escura futura sem refazer componentes, mas não há seletor de tema nem `prefers-color-scheme` no escopo atual.

## Colors

A paleta é clara e fria: chão quase branco e neutro, azul-frio/gelo como cor de ação, petróleo profundo como legado, grafite e um único ciano de interação. As cores de Classe energética são as únicas cores saturadas de dado; o ciano é o sinal, um degrau mais claro e mais frio que a ação.

### Primary (Azul-frio / Gelo — climatização)
- **Azul-frio** (`#0E6B8A`): cor de ação primária do sistema — botões primários, links, chips ativos, badges de destaque. Azul puro, sem viés esverdeado, AA (4.5:1) sobre giz e papel. Texto branco sobre a base (7.4:1). O contorno de foco é ciano (ticket 102), não azul-frio.
- **Azul-frio hover** (`#1579A0`): estado hover do botão primário e de controles que usam a cor primária. AA sobre giz/papel.
- **Azul-frio ativo** (`#0B5A73`): estado pressed/active do botão primário.
- **Azul-frio texto** (`#0E6B8A`): links e acentos textuais sobre superfícies claras (giz/papel).
- **Azul-frio lavado** (`#E9F1F1`, `color-mix(in srgb, var(--azul-frio) 8%, var(--giz))`): fundo tonal a 8% para chips ativos, badges e acentos leves.
- **Azul-frio escuro** (`#084D66`): fundo do rodapé e de faixas escuras de largura total; substitui o petróleo profundo como superfície escura primária.

### Petróleo (legado — dado histórico)
- **Tinta petróleo** (`#0A1F22`): texto principal. É o "preto" do sistema, com subtom verde-azulado; o cabeçalho da tabela usa grafite sobre papel.
- **Petróleo** (`#123F45`): mantido no contrato como legado; não é mais hover de botão primário nem cor de ação.
- **Petróleo profundo** (`#0B2C30`): mantido no contrato como legado; não é mais fundo de seções escuras nem dock.

### Secondary
- **Ciano de foco** (`#0F8FA8`): contorno de 2 px, item ativo da navegação, seleção de texto, marcador da linha analisada, borda da nota de transparência e `+`/`−` do acordeão. Tem 3,8:1 sobre giz e papel — passa o mínimo de 3:1 para contorno, sublinhado e marcador, e **não serve para texto**. Desde o ticket 102 substitui o âmbar: o site lê como climatização, não como alerta.
- **Ciano de texto** (`#0B6F83`): a variante AA (5,8:1) para links e rótulos ciano sobre giz e papel. O ciano gráfico não é usado como texto em fundo claro.
- **Ciano lavado** (`#D2E9EC`, `color-mix(in srgb, var(--foco) 18%, var(--giz))`): fundo da `::selection`, sempre com a tinta como texto — nunca ciano cheio com texto claro.

### Tertiary
- **Frio** (`#2F7F8C`): assinatura de dado e estados informativos (ex.: aviso-frio). Como texto sobre papel, usar **frio de texto** (`#1D5B66`, 7,2:1). **Não é a cor de ação primária** — essa é o azul-frio.

### Neutral
- **Giz** (`#FDFDFB`): superfície de cartões, tabela, campos e páginas de leitura.
- **Papel** (`#F8F8F7`): fundo da página, cabeçalho da tabela, chips inativos, blocos secundários. Branco quase puro e neutro, sem viés mineral esverdeado.
- **Mineral** (`#ECECEB`): preenchimento de barras e fundo do botão secundário em estado pressed. A zebra da tabela é quase branca, não mineral.
- **Hairline** (`#D5D8D5`): toda borda de 1 px sobre papel claro.
- **Hairline escura** (`#24454A`): borda de 1 px sobre tinta ou petróleo.
- **Grafite** (`#4B5D5F`): texto secundário sobre giz (6,8:1).
- **Mudo** (`#5F6F70`): legendas, unidades e metadados sobre giz ou papel (5,2:1 e 5,0:1).
- **Mudo escuro** (`#A9C0C6`): texto secundário sobre superfície escura — tinta (9,0:1) e azul-frio escuro, o rodapé (4,9:1). O valor anterior (`#9FB0AE`) ficava em 7,6:1 sobre tinta mas caía para 4,1:1 sobre o rodapé, abaixo de AA; o tom foi clareado e puxado para a família azul-frio, para não ler como cinza lavado sobre o fundo colorido.

### Classe energética
Cada Classe tem uma cor de texto AA sobre giz e papel, usada em ponto, borda e etiqueta com fundo tonal a 10%. A cor nunca é o único portador do significado: a letra A–F sempre aparece.

- **A** `#1B6A4E` · **B** `#467536` · **C** `#6E691B` · **D** `#96601C` · **E** `#9F4529` · **F** `#8E2F35`.

### Nomes dos tokens no CSS
O frontmatter acima é a camada portátil (chaves descritivas em inglês). No CSS, os mesmos valores usam nomes em português, e essa é a única grafia aceita nos componentes:

`--tinta`, `--petroleo`, `--petroleo-profundo`, `--giz`, `--papel`, `--mineral`, `--linha`, `--linha-escura`, `--grafite`, `--mudo`, `--mudo-escuro`, `--foco`, `--foco-texto`, `--foco-lavado`, `--azul-frio`, `--azul-frio-hover`, `--azul-frio-ativo`, `--azul-frio-texto`, `--azul-frio-lavado`, `--azul-frio-escuro`, `--frio`, `--frio-texto`, `--frio-lavado`, `--classe-a`…`--classe-f`, `--shell`, `--leitura`, `--calha`, `--raio-xs`, `--raio-sm`, `--raio-md`.

Nenhum componente inventa um nome alternativo para o mesmo valor.

### Regras de cor
- Texto de corpo: tinta sobre giz/papel, giz sobre tinta. Nunca cinza claro sobre papel.
- **Azul-frio** é a cor de ação primária; ciano sinaliza interação, seleção e dado analisado, incluindo o contorno de foco de 2 px.
- **Ciano não é texto.** Só a variante `--foco-texto` é usada como texto; as Classes A–F continuam sendo as únicas cores saturadas de dado.
- Ciano e frio puros são cores gráficas; para texto, usar as variantes `-texto`.
- Vermelho só para erro, Classe E/F e consumo implausível. Nunca para "promoção".
- Nenhum gradiente de fundo; não há mais escala térmica nem gradiente de dado.
- Estados desabilitados: 45% de opacidade e cursor `not-allowed`, sem cinza extra.

## Typography

Três vozes, uma hierarquia. A grotesca opera; a serifa lê; o mono mede. A escala é fixa e não cresce por vaidade: o maior título da home é o mesmo em qualquer breakpoint, só ajustado por `clamp()`.

### Fontes
- **Schibsted Grotesk Variable** — display, títulos, navegação, botões, tabela e formulários. Pesos 400/500/600/700. `font-display: swap`.
- **Source Serif 4 Variable** — corpo de leitura, análises, textos institucionais e explicações longas. Pesos 400/500/600. Itálico real para ênfase editorial.
- **Azeret Mono Variable** — rótulos de campo, unidades, números de registro, versão da tabela, procedência e legendas de dados. Pesos 400/500/600. Sempre com `font-variant-numeric: tabular-nums` quando há colunas de números.

Todas são self-hosted via Fontsource, subconjunto `latin` apenas, e apenas um arquivo por família é pré-carregado (o peso 400 da grotesca). São ~121 KB no total, dentro do orçamento de 130 KB. A serifa e o mono entram depois, sem bloquear a primeira pintura.

### Escala
| Papel | Fonte | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
| Display da home | Grotesca | `clamp(2.75rem, 6.4vw, 5.25rem)` (abaixo de 22 rem desce para o headline) | 500 | 0.98 | -0.03em |
| Display | Grotesca | `clamp(2.75rem, 5.2vw, 4.5rem)` | 500 | 0.98 | -0.03em |
| Headline | Grotesca | `clamp(2rem, 3.2vw, 2.75rem)` | 500 | 1.05 | -0.02em |
| Título de seção | Grotesca | `1.5rem` | 600 | 1.15 | -0.01em |
| Título de bloco | Grotesca | `1.25rem` | 600 | 1.2 | -0.01em |
| Corpo de leitura | Serifa | `1.0625rem` | 400 | 1.65 | 0 |
| Corpo de interface | Grotesca | `1rem` | 400 | 1.55 | 0 |
| Corpo pequeno | Grotesca | `0.875rem` | 400 | 1.5 | 0 |
| Rótulo | Mono | `0.75rem` | 500 | 1.2 | 0.08em, maiúsculas |
| Leitura de dado | Mono | `clamp(1.75rem, 3vw, 2.5rem)` | 500 | 1 | -0.02em |
| Unidade | Mono | `0.75rem` | 500 | 1.2 | 0.02em |
| Nota de rodapé | Mono | `0.75rem` | 400 | 1.45 | 0.02em |

### Regras
- Um `<h1>` por página. Na ficha, o H1 é `Marca — Modelo`; na análise, o título editorial.
- Rótulos em mono são maiúsculos e curtos: `CAPACIDADE`, `CONSUMO ANUAL`, `REGISTRO`.
- Números sempre com unidade e separador pt-BR: `12.000 BTU/h`, `416 kWh/ano`, `R$ 40,61`.
- A serifa nunca é usada em botão, tabela, campo ou navegação.
- O mono nunca é usado em parágrafo corrido; só em rótulo, número, unidade, código e proveniência.
- Medida de leitura: 62–68 caracteres. Texto institucional e análise usam a coluna de leitura; a ficha usa a coluna larga com blocos de 68ch.

## Layout

O layout é uma grade de 12 colunas com uma régua visível no topo de cada seção. A página não "flutua": todas as bordas caem na grade.

### Larguras
- **Shell**: `90rem` (1.440 px) com `padding-inline` de `clamp(1rem, 4vw, 3rem)`.
- **Leitura**: `68ch` para artigos, institucionais e blocos explicativos.
- **Catálogo**: largura do shell; a tabela pode ocupar todas as 12 colunas.
- **Ficha**: 12 colunas; topo em 8 colunas, corpo em 8 colunas + margem de 4 para notas e índice quando houver espaço.

### Grade e ritmo
- 4 colunas abaixo de 640 px; 8 colunas de 640 a 1024 px; 12 colunas acima de 1024 px.
- Calha: 16 px no celular, 24 px no tablet, 32 px no desktop.
- Ritmo vertical: múltiplos de 8 px. Seções respiram com 64–96 px no desktop e 40–48 px no celular.
- A régua de seção é uma hairline de largura total com um rótulo mono à esquerda e, quando útil, uma contagem à direita.

### Cabeçalho e navegação
- Altura: 64 px no celular, 72 px no desktop. Não é fixo; a barra de ferramentas do catálogo é que gruda.
- Marca à esquerda em grotesca 600; navegação à direita em grotesca 500. O item ativo tem uma barra de 2 px ciano embaixo, não um pill.
- No celular, a navegação é uma faixa horizontal com rolagem, sem menu hambúrguer escondido: as quatro seções cabem.
- Skip link visível no foco, primeiro elemento do DOM.

### Barra de ferramentas do catálogo
- `position: sticky; top: 0`, fundo giz, hairline inferior, `z-index: 20`.
- Contém busca, botão "Pesquisa avançada", chips do recorte, contagem e ordenação.
- Quando a seleção para comparar tem ao menos um item, o dock sobe acima da barra com sombra única do sistema; nunca cobre a linha que está sendo lida.
- No celular, a barra empilha em duas linhas: busca + botão; chips + contagem.

### Tabela
- Cabeçalho em mono maiúsculo, fundo papel, hairline inferior de 1 px.
- Linhas de 52 px no desktop e 48 px no celular. Zebra quase branca (55% papel + 45% giz) em todas as linhas pares.
- Números alinhados à direita, texto à esquerda, Classe centrada. Nunca centralizar texto corrido.
- A primeira coluna é o checkbox de comparação, com alvo de 44 px; a coluna Modelo é a única com link.
- **A tabela continua tabela em todas as larguras.** Abaixo de 900 px, um contêiner de rolagem horizontal mantém a estrutura, com as colunas de seleção e Modelo fixas à esquerda e um aviso textual "Deslize para ver as colunas". O contêiner é focável e rolável por teclado. Nenhuma linha vira cartão.
- O aviso aparece abaixo de 900 px e desaparece depois da primeira rolagem horizontal quando o navegador suporta animações dirigidas por rolagem (CSS puro); sem suporte, ele permanece. Nenhum JS é adicionado para isso.
- Células fixas e cabeçalho sticky compartilham a mesma tabela: a seleção e o Modelo recebem `z-index` maior que o `thead`, e o `thead` maior que as células comuns, para nada se sobrepor ao rolar.
- O contêiner nunca faz a página inteira rolar na horizontal; só ele rola. A barra de rolagem é visível e o `overscroll-behavior-x` é contido.

### Ficha
- Topo: marca/modelo, etiquetas, três leituras (IDRS, consumo, capacidade) e o link "Comparar este modelo".
- Índice de seções em uma faixa horizontal sticky abaixo do topo (desktop) ou lista quebrada (celular), com a seção atual marcada por uma barra ciano.
- Corpo em blocos de 8 colunas, com notas de método em 4 colunas à direita no desktop.
- A seção de consumo e custo é um painel de instrumento: campos à esquerda, leitura grande à direita e a conta aberta abaixo, em mono.

### Comparação
- Três slots no topo, cada um um cartão de instrumento com marca, modelo, capacidade, tipo e ações.
- A matriz é uma tabela com a primeira coluna de atributos em 28% e as demais iguais. No celular, rola horizontalmente com a coluna de atributos fixa.
- O painel de custo fica acima dos slots e usa os mesmos campos da ficha.

### Assistente
- Uma pergunta por tela, com trilho de progresso de 5 segmentos e o número da etapa em mono.
- Cartões de opção grandes (alvo mínimo de 56 px), com ícone de linha e descrição curta; borda de 1 px sobre fundo giz, seleção por contorno ciano de 2 px.
- O resultado é uma leitura grande em mono, seguida dos fatores, das suposições e das orientações.

### Breakpoints
`480px` (celular grande), `640px` (tablet retrato), `768px` (tablet), `1024px` (desktop), `1280px` (desktop largo), `1536px` (shell máximo).

## Elevation & Depth

O sistema é quase plano. Profundidade vem de tom, hairline e sobreposição sólida, não de sombra difusa.

- **Nível 0** — página em papel quase branco.
- **Nível 1** — giz com hairline de 1 px: cartões, tabela, campos, painéis.
- **Nível 2** — **azul-frio escuro** (`--azul-frio-escuro`): rodapé. Cabeçalhos de tabela são claros (papel, texto grafite). O petróleo (`--petroleo-profundo`) permanece como legado mas não é usado em superfícies novas.
- **Nível 3** — sobreposição: somente o dock de seleção, o painel de filtros aberto no celular, menus e tooltips.

Regras:
- Nenhuma sombra em repouso. A única sombra permitida é a do nível 3: `0 1px 0 var(--linha), 0 16px 40px rgb(10 31 34 / 0.10)`.
- Sem `backdrop-filter`, sem vidro, sem blur.
- Nunca usar sombra para compensar falta de contraste; usar hairline e tom.
- O foco é sempre visível: contorno de 2 px **ciano** (`var(--foco)`) com `outline-offset: 2px` (com exceções de offset em âncoras e controles específicos) e, sobre tinta, contorno giz.
- A `::selection` usa o **ciano lavado** (`--foco-lavado`) com a tinta como texto: o ciano cheio com texto claro perde legibilidade.

## Shapes

- Raio padrão: **2 px** para botões, campos, chips, etiquetas e células.
- **4 px** para painéis e cartões.
- **8 px** apenas para o dock de seleção, menus e a caixa de resultado do Assistente.
- **Nenhum pill em componente novo**. Nenhum raio maior que 8 px. Nenhum círculo, exceto o marcador de rádio/checkbox e ícones circulares de 32 px. As 999 px legadas em `global.css` estão inventariadas na spec da fase.
- Bordas sempre de 1 px; a única borda de 2 px é a seleção ativa e o foco.
- Ícones de linha, 1,5 px de traço, 16/20/24 px, desenhados para a grade. Sem ícones preenchidos, coloridos ou ilustrativos.
- A régua de capacidade foi **retirada no ticket 94**. Desde o #93 a leitura de escala da primeira tela é o **simulador do ambiente**, que devolve uma capacidade com a conta aberta e as contagens daquela capacidade; a régua de seis faixas repetia a mesma afirmação num segundo gráfico. Não recriar a régua em nenhuma rota — nem como gráfico, nem como trilho, nem como lista de seis linhas com barra de proporção. A descoberta por faixa continua nos chips de **Faixa de capacidade** da Pesquisa avançada do catálogo; a entrada editorial por capacidade exata da home foi entregue no #96 como lista de modelos, não como escala.

## Components

### Cabeçalho
Faixa de 64/72 px, fundo giz, hairline inferior. Marca em grotesca 600, navegação em grotesca 500 com sublinhado ciano de 2 px no item ativo. O link "Análises" só existe quando há Análise publicada. No celular, a navegação rola horizontalmente sem esconder itens.

### Rodapé
Fundo **azul-frio escuro** (`--azul-frio-escuro`, `#084D66`), texto giz, três colunas iguais a partir de 1024 px: proveniência e Versão da tabela; navegação institucional; **Transparência com o Leitor**. Rótulos mono e parágrafos secundários usam **mudo escuro** (`--mudo-escuro`, `#A9C0C6`, 4,9:1 sobre o fundo); nenhum texto do rodapé fica abaixo de AA. Abaixo de 1024 px a grade empilha com a proveniência primeiro, e cada destino institucional mantém alvo de 44 px. A transparência é **um bloco único**, em texto e não em selo: diz que o site é um projeto técnico e editorial independente, não filiado ao INMETRO nem ao Procel, que não vende produtos diretamente, que acompanha preços em lojas parceiras e que pode receber comissão de afiliado quando alguém compra por um link, sempre sem custo adicional para o visitante. A nota de afiliado ("Alguns links deste site são de afiliado") vive dentro desse bloco, com o link para os Termos de Uso. Os links são giz com sublinhado hairline-escura e hover ciano; só o fundo vem da família azul-frio, e o rodapé não lê mais "verde-petróleo". Desde o ticket 95 a linha da **Versão da tabela** — hash curto e data de obtenção, seguidos da contagem de linhas quando disponível — aparece **uma única vez por página**, aqui, junto da proveniência, em mono de `0,75 rem` com `font-variant-numeric: tabular-nums`. A cobertura e a metodologia da home não repetem a linha, e o hero não abre com rótulo acima do H1. A data na nota das Análises cujo Modelo saiu da tabela é o estado daquela análise, não a linha de versão, e permanece.

### Botão primário
Fundo **azul-frio** (`--azul-frio`, `#0E6B8A`), texto giz, raio 2 px, altura 44 px, padding 10×20, grotesca 500. Hover: **azul-frio hover** (`--azul-frio-hover`, `#1579A0`). Active: **azul-frio ativo** (`--azul-frio-ativo`, `#0B5A73`) com deslocamento de 1 px. Disabled: 45% de opacidade. Ícone opcional à direita, 16 px. Nunca com sombra.

### Botão secundário
Fundo giz, texto tinta, borda de 1 px hairline, mesmo tamanho. Hover: fundo papel e borda grafite. É o padrão para ações não destrutivas fora do fluxo principal.

### Botão de texto
Sem fundo e sem borda, texto tinta ou `signal-ink`, sublinhado de 1 px no hover. Usado em "Limpar filtros", "Trocar", "Remover" e navegação terciária.

### Campo
Rótulo mono acima, campo giz com borda hairline, raio 2 px, altura 44 px, texto grotesca. Foco: borda tinta + anel ciano de 2 px. Erro: borda `classe-f`, mensagem em grotesca pequena com ícone de 16 px. Ajuda: mono 0,75 rem em mudo. Select com seta desenhada, não nativa.

### Chip de filtro
Fundo papel, texto grafite, borda transparente, raio 2 px, altura 32 px (44 px no celular). Ativo: fundo tinta, texto giz. Hover: borda grafite. O chip de resumo tem um "×" de 16 px com alvo de 44 px e `aria-label` "Remover filtro …".

### Etiqueta de Classe
Letra A–F em mono 600, cor da Classe, fundo tonal a 10%, borda de 1 px na cor da Classe, raio 2 px, padding 2×6. Quando as Variantes divergem, mostra a faixa `A – C` com o tom da pior Classe e um `title` com a explicação.

### Leitura de dado (readout)
Rótulo mono maiúsculo, valor em mono 1,75–2,5 rem, unidade em mono 0,75 rem, legenda em grotesca pequena. Sem caixa; a hierarquia vem do tamanho e da hairline acima. É o componente que substitui o "card de estatística" genérico.

### Hero
Decisão dos tickets 93, 95, 102 e 103: o topo da home é tipográfico e funcional. A fita de calibração saiu no ticket 95 junto com a Versão da tabela: o H1 em grotesca display — até 5,25 rem, acima do token, só aqui — abre a página sem kicker acima dele, e a linha da versão vive apenas no rodapé. **O título exato é "Seu conforto começa pela escolha certa"**, em duas linhas fixas no desktop ("Seu conforto começa" / "pela escolha certa") e fluxo natural no celular: o H1 vende a decisão, não o banco de dados. O lead em serifa assume a promessa funcional exata — "Descubra quantos BTUs seu ambiente precisa e compare modelos de ar-condicionado por capacidade, consumo e eficiência energética, com base em dados oficiais do INMETRO." — em no máximo 56 ch. Logo abaixo vem o **CTA único "Encontrar meu ar ideal"**, primário, com a seta desenhada do ícone `seta-direita`, alvo de 44 px e `href="#simulador"`: a primeira pergunta do visitante é quantos BTUs ele precisa, e a resposta começa no simulador, sem trocar de página (o Assistente completo é o passo seguinte, oferecido no resultado). Depois do CTA vem o **simulador do ambiente**, com `id="simulador"`, que é a única leitura de escala da primeira tela. Não existe painel lateral, escala decorativa, linha animada nem régua de capacidade (ticket 94), e a página segue daí para a cobertura da base. O traço de 2 px acima do título saiu no ticket 102: o hero nasce sem kicker e sem marcador. Nada de conteúdo depende de Análise publicada.

A entrada é uma só: cada linha do título sobe do próprio mask e o lead, o CTA e o simulador chegam em 12 px de subida; o estado final já está no HTML e `prefers-reduced-motion` desliga tudo. O `title` da aba, a description, o canonical e o JSON-LD continuam citando "Ar-condicionado", "BTUs" e INMETRO — a palavra-chave sai do H1 visual, não da intenção de busca.

### Cabeçalho de seção (home)
Decisão do ticket 102: as seções da home compartilham um único cabeçalho. Um ícone de linha de **20 px** dentro de um tile de **32 px** com hairline de 1 px (fundo giz, borda `--linha`, ícone `--azul-frio-texto`) fica ao lado do `h2` com `id`; abaixo dele pode vir um lead em uma linha de 62ch. As ações da seção — controles do carrossel de Análises e a contagem com o link de recorte de Aparelhos em destaque — vivem no slot à direita e descem para baixo do título abaixo de 640 px. O tile não é selo, chip colorido nem ícone preenchido: identifica a seção, nunca decora. O mesmo componente é usado por **Aparelhos em destaque**, **Análises em destaque**, **FAQ** e **Metodologia**; as seções que os tickets seguintes reescreverem reutilizam o mesmo primitivo, enquanto a ficha, o catálogo e o Assistente mantêm os cabeçalhos próprios já documentados.

### Simulador do hero
Decisão dos tickets 93 e 104: a promessa da home executada na primeira tela. A pessoa move a área (8–60 m²) e escolhe a incidência de sol; o motor puro do Assistente devolve a capacidade comercial, com a conta aberta e o que a base tem naquela capacidade. O bloco é uma faixa de instrumento, não um card: hairline superior, leitura do resultado em mono 2,5 rem, chips de 32 px (44 px no celular) e o controle deslizante com trilho de 1 px e preenchimento de 2 px em azul-frio — sem gradiente, sem sombra. Desde o #104 o topo do simulador fala a língua da interface, não a do formulário técnico: o título exato é **"Descubra quantos BTUs o seu ambiente precisa"**, em `--texto-secao` (1,5 rem), caixa de frase e fonte de interface; sob ele vem a linha de apoio "A área e o sol já bastam para uma primeira estimativa.", em 0,875 rem e `--mudo`. "Incidência de sol" sobe ao mesmo peso de interface (1 rem, 500) e ganha o ícone `sol` de 16 px — o único pictograma do bloco; os quatro chips continuam texto puro, com `aria-pressed` e alvo de 44 px. O resultado mantém a leitura grande e ganha hierarquia: o rótulo é **"Capacidade recomendada"**, a conta aberta vira um `<dl>` de três linhas — **Área × sol**, **Capacidade calculada** e **Faixa comercial** —, com os rótulos em mudo e os valores em mono tabular alinhados à direita, e a contagem do catálogo ocupa uma linha só ("318 aparelhos de 18.000 BTU/h · 256 com Classe A"). As duas ações são contextuais: a primária é **"Continuar no Assistente →"**, com a seta desenhada, e leva a `/assistente/?forma=metros&area=<area>&sol=<sol>` (o contrato existente do Assistente, sem chave nova); a secundária é **"Ver aparelhos de 18.000 BTU/h"** e abre o recorte exato (`/aparelhos/?btu=`). O Assistente completo continua linkado na nota de rodapé, que também declara a estimativa. O HTML já traz o estado padrão (20 m², sol à tarde, 18.000 BTU/h), então o bloco funciona sem JavaScript; a ilha só acrescenta a interação.

**Decisão do ticket 98:** a antiga seção "Descubra quantos BTUs você precisa" saiu da home. Ela repetia a mesma estimativa de 20 m² do simulador e não trazia os fatores que ele não pergunta (pessoas, eletrônicos, lâmpadas e janelas), a conta aberta fator por fator nem a confiança. O Assistente completo continua em `/assistente/`, linkado na ação "Continuar no Assistente" do resultado (ticket 104), na nota do simulador e na metodologia. Não recriar passos numerados, CTA "Usar o Assistente" nem um segundo resumo do método na home.

### Aparelhos em destaque por capacidade (home)
Decisão do ticket 96: as listas de "Capacidades populares" e "Marcas populares" deram lugar a blocos de até **três** fichas de Aparelhos por capacidade exata. Só entram Aparelhos com Análise publicada e/ou Oferta; as Análises abrem a lista e os demais seguem a ordem da base, sem ranking e sem promessa de serem "os melhores". As capacidades vêm da curadoria (`filtros.json`) e só viram bloco quando têm pelo menos um destaque — hoje, com uma única Análise e uma única Oferta em 12.000 BTUs, a home mostra apenas aquele bloco. Não há teto de blocos: toda capacidade curada com conteúdo aparece. Cada cartão traz marca, modelo, capacidade, tipo, IDRS e consumo anual (Valores oficiais do `consulta.json`), mais os links para a ficha, a Análise e/ou a Oferta com o marcador "link de afiliado". IDRS e consumo seguem em faixa quando as Variantes divergem, como na ficha — nunca só o último valor. O cabeçalho traz a contagem de Aparelhos da capacidade e o link para o recorte `/aparelhos/?btu=`. Sem preço, sem selo de recomendação, sem carrossel e sem seletor de capacidade: hoje há uma única capacidade em destaque, um seletor não teria o que selecionar, e a descoberta completa segue nos chips do catálogo. Visualmente é a mesma grade apoiada em hairline dos outros blocos: colunas no desktop, uma coluna no celular, sem sombra, sem pill e sem barra de proporção. Nenhum bloco vazio é renderizado.

### Análises em destaque (home)
Decisão do ticket 97: a seção deixa de ser uma pilha estática e passa a usar um **carrossel** quando há duas ou mais Análises publicadas. Com uma só, o bloco é um destaque estático — não há para onde avançar nem controles. Com duas ou mais, cada quadro é a Análise real (imagem de abertura com alt, data em mono, título, resumo e o CTA de Oferta quando houver), um por vez, sobre a mesma grade de 5/7 colunas da ficha: imagem à esquerda, texto à direita, hairline acima. Os controles — **Anterior**, **Próxima** e **Pausar/Retomar** — vivem no cabeçalho, em botões de 44 px com o foco ciano global, e o indicador `1 / 3` fica em mono tabular. A rotação automática corre a cada **7 s** e para no ponteiro, no foco, fora da tela, com a aba escondida e em `prefers-reduced-motion`, que também esconde o botão de pausa. A troca de quadro é um único momento de 240 ms (opacidade e 6 px de subida), nunca uma entrada por seção; o `aria-live` anuncia o quadro só na navegação manual. O HTML traz **todos** os quadros e os controles: sem JavaScript a lista aparece inteira e nada fica escondido, e uma Análise que compara dois Aparelhos mostra o link de afiliado de ambos na mesma faixa "Onde comprar". Sem Análise publicada, a seção não renderiza e o script de rotação não é servido.

### Metodologia e INMETRO (home)
Decisão do ticket 99: a metodologia deixa de ser um texto longo todo exposto e vira uma lista de **`<details>` nativos**, um por tópico, fechados por padrão — a mesma interação do FAQ da home, sem JavaScript. São oito tópicos (De onde vêm os dados, O recorte da tabela, IDRS e Classe energética, Condições de ensaio, Vigência da classificação, Aparelhos Inverter, Simulador e Assistente, O que é estimativa), cada um com o título em um `h3` dentro do `summary` e o texto editorial original no corpo, palavra por palavra. O `summary` mantém a tipografia de interface do FAQ, o marcador `+`/`−` em mono e o alvo de 44 px; o corpo da metodologia continua na **fonte de leitura**, porque ali o papel é explicar e não responder em duas linhas. A nota de **Fontes** fica fora dos `details`, em mono pequeno, sempre visível. Nada de promessa de economia, recomendação de compra ou segunda linguagem visual; o JSON-LD `FAQPage` não muda, porque ele descreve o FAQ, não a metodologia.

### Tabela de Aparelhos
Cabeçalho mono claro, linhas hairline, zebra quase branca, ordenação com setas de 8 px, linha analisada com marcador ciano de 2 px à esquerda e selo "Análise" discreto. A célula Modelo tem o link e a segunda linha `Função · Tensão` em grotesca pequena e mudo. Checkbox de 20 px com alvo de 44 px. A tabela nunca vira cartões: em telas estreitas ela rola na horizontal dentro do próprio contêiner, com seleção e Modelo fixas à esquerda, cabeçalho sticky e o aviso "Deslize para ver as colunas".

### Painel de filtros
Duas faixas nomeadas — **Aparelho** e **Desempenho** —, cada uma com rótulo mono e hairline superior. Campos em largura total, chips quebrando linha. A **Faixa de capacidade** (seis intervalos derivados dos dados) vive aqui, nos chips de Desempenho: é o caminho de descoberta por faixa que a home deixou de oferecer quando a régua saiu (ticket 94), com o contrato `?btuMin=&btuMax=` intacto. Rodapé com contagem do recorte e "Limpar filtros" (só quando fora do padrão). No desktop, painel embutido abaixo da barra; no celular, painel sobreposto de altura máxima com rolagem interna e botão "Aplicar" fixo.

### Dock de seleção
Barra escura (tinta) acima da tabela, com contagem `2 de 3`, nomes dos modelos em mono e ações "Limpar seleção" e "Comparar". Aparece só com ao menos um selecionado; com dois ou três, "Comparar" vira link primário em azul-frio. No celular, ocupa a largura toda e mantém 44 px de alvo.

### Cartão de Aparelho na comparação
Fundo giz, borda hairline, raio 4 px, padding 16 px. Marca em mono maiúsculo, modelo em grotesca 600, resumo em mudo, custo em mono, ações em texto. O CTA de Oferta fica na área de ações, com o marcador "link de afiliado" na mesma linha, nunca dentro da matriz.

### Matriz de comparação
Primeira coluna de atributos com fundo papel e texto mono; colunas de modelos com hairline entre si. Linhas de seção em tinta com texto giz. Valores numéricos em mono tabular. Nenhum destaque de "melhor"; a diferença é uma frase factual abaixo, não um troféu. No celular, rolagem horizontal com a primeira coluna fixa e indicador de rolagem.

### Calculadora de custo
Painel de instrumento: campos UF, tarifa, horas e dias em uma coluna de 4; resultado em leitura grande de 2,5 rem; a conta aberta em lista mono numerada; o aviso de estimativa em grotesca pequena. O resultado é uma região viva (`aria-live="polite"`). No celular, campos antes do resultado.

### Assistente
Trilho de progresso de 5 segmentos com o segmento atual em ciano e o texto `Etapa 2 de 5` em mono. Uma pergunta por tela, cartões de opção com ícone de linha, título e descrição. Botão "Voltar" em texto e "Continuar" primário. O resultado usa a leitura grande, os fatores em lista mono com valores à direita e as suposições em bloco de nota. Esta experiência mora em `/assistente/`; desde o ticket 98 a home não tem uma versão resumida dela — só o simulador do hero e o link na nota dele.

### Análise editorial
Coluna de leitura de 68ch, título em display, data e tempo de leitura em mono, aviso de transparência em bloco de nota com borda esquerda ciano de 2 px, figuras com legenda em mono, citações em serifa itálica e subtítulos em grotesca. O CTA comercial é um bloco separado por hairline, com o marcador de afiliado.

### Oferta
Texto "Ver oferta — Loja · link de afiliado" em uma linha, com o marcador em mudo. Sem preço, sem selo de desconto, sem cor de urgência. A faixa de Ofertas tem uma frase curta de transparência e nunca se mistura à matriz técnica.

### Estado vazio
Título em grotesca 1,25 rem, uma frase em serifa, uma ação primária. Sem ilustração. Exemplos: catálogo sem resultado, comparação sem modelos, análise sem Oferta, calculadora sem consumo declarado.

### 404
Página de leitura com o título "Fora da escala", uma frase curta e links claros para Aparelhos, Assistente, Comparar e Home. Sem régua, sem gráfico de recuperação e sem humor forçado: o caminho de volta é uma lista de destinos, não uma segunda escala.

### Movimento
- Durações: 120 ms (hover/foco e preenchimento do trilho), 180 ms (abertura de painel), 240 ms (dock, resultado e troca do número do simulador); na entrada do hero, 700 ms por linha do título e 520 ms no lead e no simulador (a fita foi removida no ticket 95).
- Curva: `cubic-bezier(0.2, 0, 0, 1)`.
- Uma entrada no hero, em sequência: cada linha do título sobe do próprio mask em 700 ms, 80 ms uma da outra; o lead e o simulador entram com 12 px de subida em 520 ms quando a segunda linha está assentando (340 ms no celular, 400 ms no desktop). No simulador, o preenchimento do trilho acompanha o controle em 120 ms e o número do resultado entra de novo em 240 ms a cada mudança.
- O carrossel de Análises em destaque (ticket 97) gira a cada 7 s e troca de quadro em 240 ms (opacidade e 6 px de subida), só sob `prefers-reduced-motion: no-preference`. A rotação para no ponteiro, no foco, fora da tela, na aba escondida e no botão de pausa; com movimento reduzido, o quadro ativo é o que já está no HTML e a lista aparece inteira sem JavaScript. Nenhuma outra seção se move.
- Todo o resto é feedback imediato.
- O estado final já está no HTML: a animação só descreve a chegada sob `prefers-reduced-motion: no-preference`. Com `prefers-reduced-motion: reduce` ou `forced-colors: active`, nada se move e nada fica oculto.

## Do's and Don'ts

### Do
- Mantenha o chão quase branco e neutro: é ele que deixa o dado, a hairline e o azul-frio legíveis.
- Use a grade e a hairline para separar; deixe o espaço em branco fazer o trabalho.
- Escreva o número com unidade, origem e, se calculado, a fórmula.
- Use o mono para medir e a serifa para explicar.
- Mantenha as cores de Classe como dados, com legenda e letra; use o ciano só como sinal de interação.
- Prefira uma ação primária por tela; o resto é texto ou secundário.
- Verifique contraste real (4,5:1 texto, 3:1 não texto) e alvos de 44 px.
- Use o cabeçalho de seção com ícone na home: o mesmo primitivo, um ícone funcional por seção e as ações no slot.
- Teste 320 px, 390 px, 768 px, 1024 px, 1440 px e 1920 px.
- Preserve a URL, o canonical, o JSON-LD e o conteúdo crawlável em toda mudança.

### Don't
- Não devolva o papel mineral esverdeado nem escureça o chão da página; superfície escura é só rodapé, linha de seção da matriz e dock de seleção.
- Não use gradiente de fundo, glassmorphism, blur, sombra difusa ou card flutuante.
- Não use pill ou raio maior que 8 px em componente novo (as 999 px legadas em `global.css` estão inventariadas na spec da fase), ícone colorido ou ilustração decorativa.
- Não use roxo, azul genérico de SaaS, verde "sustentável" de marca, laranja ou âmbar de urgência/alerta, nem petróleo esverdeado como cor de ação.
- Não use "melhor", "campeão", estrelas, nota, ranking ou selo de recomendação.
- Não prometa preço, desconto, economia ou prazo.
- Não esconda conteúdo atrás de animação ou scroll-jacking. Carrossel automático só no bloco de Análises em destaque, com pausa visível, controles de teclado e o estado estático em `prefers-reduced-motion` (ticket 97); em qualquer outro lugar, é proibido.
- Não sirva o script do carrossel quando a home não tem carrossel: com zero ou uma Análise, os quadros são estáticos e nenhum código de rotação entra na página (ticket 97).
- Não repita a Versão da tabela: uma única ocorrência por página, no rodapé, em mono pequeno — nunca no hero, na cobertura ou na metodologia da home (ticket 95).
- Não espalhe a transparência com o leitor em avisos separados: independência, vendas, preços acompanhados e comissão de afiliado vivem num bloco único no rodapé (ticket 100).
- Não use kicker/eyebrow acima do H1 da home: ele já diz "dados do INMETRO", então a antiga fita de calibração foi removida (ticket 95).
- Não recrie a chamada do Assistente na home: o simulador já entrega a estimativa e o caminho para a ferramenta completa são a ação "Continuar no Assistente" do resultado, a nota dele e a metodologia (tickets 98 e 104).
- Não exponha a metodologia da home como um paredão de parágrafos: cada tópico é um `<details>` nativo fechado, com o texto preservado e as fontes em mono fora dos `details` (ticket 99).
- Não troque densidade por cartões decorativos no catálogo.
- Não use o ciano como texto: só `--foco-texto` é AA sobre giz e papel (ticket 102).
- Não use ícone de seção como ornamento: cada um identifica uma seção ou um controle, sempre em tile hairline e com `aria-hidden`.
- Não use o ciano cheio como fundo de seleção com texto claro: a `::selection` é ciano lavado com tinta.
- Não crie uma segunda linguagem visual para uma página "especial".
