---
name: Especialista do Ar
description: Um instrumento de climatização — dados oficiais do INMETRO, legíveis e comparáveis.
colors:
  ink: "#0A1F22"
  petrol: "#123F45"
  petrol-deep: "#0B2C30"
  chalk: "#FCFDFB"
  paper: "#F2F5F1"
  mineral: "#E4EAE3"
  hairline: "#CFD9D1"
  hairline-dark: "#24454A"
  graphite: "#4B5D5F"
  muted: "#5F6F70"
  muted-dark: "#9FB0AE"
  signal: "#E8A33D"
  signal-ink: "#7A4A0F"
  signal-wash: "#FBEFD9"
  cold: "#2F7F8C"
  cold-ink: "#1D5B66"
  cold-wash: "#E3EFF0"
  classe-a: "#1B6A4E"
  classe-b: "#467536"
  classe-c: "#6E691B"
  classe-d: "#96601C"
  classe-e: "#9F4529"
  classe-f: "#8E2F35"
typography:
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
    backgroundColor: "{colors.ink}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.xs}"
    padding: "12px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.xs}"
    padding: "12px 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "12px 20px"
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

O site é um instrumento de medição, não uma vitrine. A superfície lembra um painel de climatização calibrado: papel mineral frio, tinta petróleo profunda, linhas de 1 px que separam escalas, leituras em mono com unidade sempre presente e uma única faixa térmica que só aparece onde existe um dado de temperatura ou energia. Nada flutua; tudo está apoiado numa grade visível. A autoridade vem da calibração — réguas, ticks, numeração, procedência —, não de sombras, gradientes ou promessas.

A densidade é deliberada. O catálogo é o produto, então a tabela pode ser densa e a ficha pode ser longa; o que não pode existir é ruído. Cada ornamento tem função: a linha separa atributos, o tick marca uma capacidade, o mono identifica uma unidade ou uma fonte, o âmbar assinala a ação ou o calor. O visitante deve sentir que está lendo um instrumento confiável e não uma página de marketing.

A voz editorial é sóbria e brasileira. A serifa conta a análise; a grotesca organiza a interface; o mono mede. O contraste entre as três vozes é o sistema. Não há ilustração decorativa, personagem, mascote, glassmorphism, gradiente de fundo, pill, card arredondado ou selo de "melhor". O que existe é o dado, a escala e o caminho para decidir.

**Key Characteristics:**
- Grade de medição visível: hairlines, ticks e numeração de 1 px.
- Superfícies mate: papel mineral, tinta petróleo, nenhum brilho.
- Um acento de sinal (âmbar) e uma escala térmica usada como dado.
- Três vozes tipográficas: grotesca para operar, serifa para ler, mono para medir.
- Quase nenhuma sombra; profundidade por tom e linha.
- Cantos de 2–8 px; nenhum pill.
- Movimento curto e funcional, sempre com alternativa sem movimento.

**Modo:** somente claro nesta fase. Os tokens são organizados para permitir uma camada escura futura sem refazer componentes, mas não há seletor de tema nem `prefers-color-scheme` no escopo atual.

## Colors

A paleta é mineral e térmica: papel frio, petróleo profundo, grafite e um único âmbar de sinal. As cores de Classe energética são as únicas cores saturadas permanentes, porque são dados.

### Primary
- **Tinta petróleo** (`#0A1F22`): texto principal, superfície de botões primários, cabeçalho da tabela e fundo do rodapé. É o "preto" do sistema, com subtom verde-azulado.
- **Petróleo** (`#123F45`): hover do botão primário, faixas de cabeçalho, fundo de blocos de destaque escuros. Nunca como texto sobre papel.
- **Petróleo profundo** (`#0B2C30`): fundo de seções escuras de largura total e do dock de seleção.

### Secondary
- **Âmbar de sinal** (`#E8A33D`): ação, foco, capacidade selecionada e o extremo "quente" da escala térmica. Sobre tinta tem 7,9:1; sobre papel é cor gráfica, nunca texto.
- **Âmbar de texto** (`#7A4A0F`): links e rótulos âmbar sobre papel (7,3:1). O âmbar claro não é usado como texto em fundo claro.

### Tertiary
- **Frio** (`#2F7F8C`): extremo "frio" da escala térmica, linhas de gráfico e estados informativos. Como texto sobre papel, usar **frio de texto** (`#1D5B66`, 7,5:1).

### Neutral
- **Giz** (`#FCFDFB`): superfície de cartões, tabela, campos e páginas de leitura.
- **Papel mineral** (`#F2F5F1`): fundo da página, cabeçalho da tabela, chips inativos, blocos secundários.
- **Mineral** (`#E4EAE3`): faixas alternadas da tabela, preenchimento de barras e trilhas.
- **Hairline** (`#CFD9D1`): toda borda de 1 px sobre papel claro.
- **Hairline escura** (`#24454A`): borda de 1 px sobre tinta ou petróleo.
- **Grafite** (`#4B5D5F`): texto secundário sobre giz (6,8:1).
- **Mudo** (`#5F6F70`): legendas, unidades e metadados sobre giz ou papel (5,2:1 e 4,8:1).
- **Mudo escuro** (`#9FB0AE`): texto secundário sobre tinta (7,6:1).

### Classe energética
Cada Classe tem uma cor de texto AA sobre giz e papel, usada em ponto, borda e etiqueta com fundo tonal a 10%. A cor nunca é o único portador do significado: a letra A–F sempre aparece.

- **A** `#1B6A4E` · **B** `#467536` · **C** `#6E691B` · **D** `#96601C` · **E** `#9F4529` · **F** `#8E2F35`.

### Escala térmica (assinatura)
Uma escala contínua frio → neutro → âmbar → quente, construída com os tokens acima. Só é usada onde existe um valor de temperatura, capacidade ou consumo; nunca como decoração de fundo.

```
--escala-frio: var(--frio);
--escala-neutro: #D9DED7;
--escala-morno: var(--sinal);
--escala-quente: #C4553B;
```

### Nomes dos tokens no CSS
O frontmatter acima é a camada portátil (chaves descritivas em inglês). No CSS, os mesmos valores usam nomes em português, e essa é a única grafia aceita nos componentes:

`--tinta`, `--petroleo`, `--petroleo-profundo`, `--giz`, `--papel`, `--mineral`, `--linha`, `--linha-escura`, `--grafite`, `--mudo`, `--mudo-escuro`, `--sinal`, `--sinal-texto`, `--sinal-lavado`, `--frio`, `--frio-texto`, `--frio-lavado`, `--classe-a`…`--classe-f`, `--shell`, `--leitura`, `--calha`, `--raio-xs`, `--raio-sm`, `--raio-md`.

Nenhum componente inventa um nome alternativo para o mesmo valor.

### Regras de cor
- Texto de corpo: tinta sobre giz/papel, giz sobre tinta. Nunca cinza claro sobre papel.
- Âmbar e frio puros são cores gráficas; para texto, usar as variantes `-ink`.
- Vermelho só para erro, Classe E/F e consumo implausível. Nunca para "promoção".
- Nenhum gradiente de fundo. A escala térmica é o único gradiente permitido, e é um dado.
- Estados desabilitados: 45% de opacidade e cursor `not-allowed`, sem cinza extra.

## Typography

Três vozes, uma hierarquia. A grotesca opera; a serifa lê; o mono mede. A escala é fixa e não cresce por vaidade: o maior título da home é o mesmo em qualquer breakpoint, só ajustado por `clamp()`.

### Fontes
- **Schibsted Grotesk Variable** — display, títulos, navegação, botões, tabela e formulários. Pesos 400/500/600/700. `font-display: swap`.
- **Source Serif 4 Variable** — corpo de leitura, análises, textos institucionais e explicações longas. Pesos 400/500/600. Itálico real para ênfase editorial.
- **Azeret Mono Variable** — rótulos de campo, unidades, números de registro, versão da tabela, procedência, ticks e legendas de dados. Pesos 400/500/600. Sempre com `font-variant-numeric: tabular-nums` quando há colunas de números.

Todas são self-hosted via Fontsource, subconjunto `latin` apenas, e apenas um arquivo por família é pré-carregado (o peso 400 da grotesca). São ~121 KB no total, dentro do orçamento de 130 KB. A serifa e o mono entram depois, sem bloquear a primeira pintura.

### Escala
| Papel | Fonte | Tamanho | Peso | Entrelinha | Tracking |
| --- | --- | --- | --- | --- | --- |
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
- Marca à esquerda em grotesca 600; navegação à direita em grotesca 500. O item ativo tem uma barra de 2 px âmbar embaixo, não um pill.
- No celular, a navegação é uma faixa horizontal com rolagem, sem menu hambúrguer escondido: as quatro seções cabem.
- Skip link visível no foco, primeiro elemento do DOM.

### Barra de ferramentas do catálogo
- `position: sticky; top: 0`, fundo giz, hairline inferior, `z-index: 20`.
- Contém busca, botão "Pesquisa avançada", chips do recorte, contagem e ordenação.
- Quando a seleção para comparar tem ao menos um item, o dock sobe acima da barra com sombra única do sistema; nunca cobre a linha que está sendo lida.
- No celular, a barra empilha em duas linhas: busca + botão; chips + contagem.

### Tabela
- Cabeçalho em mono maiúsculo, fundo papel, hairline inferior de 1 px.
- Linhas de 52 px no desktop e 48 px no celular. Zebra mineral a 50% quando houver mais de 8 colunas.
- Números alinhados à direita, texto à esquerda, Classe centrada. Nunca centralizar texto corrido.
- A primeira coluna é o checkbox de comparação, com alvo de 44 px; a coluna Modelo é a única com link.
- **A tabela continua tabela em todas as larguras.** Abaixo de 900 px, um contêiner de rolagem horizontal mantém a estrutura, com as colunas de seleção e Modelo fixas à esquerda e um aviso textual "Deslize para ver as colunas". O contêiner é focável e rolável por teclado. Nenhuma linha vira cartão.
- O aviso aparece abaixo de 900 px e desaparece depois da primeira rolagem horizontal quando o navegador suporta animações dirigidas por rolagem (CSS puro); sem suporte, ele permanece. Nenhum JS é adicionado para isso.
- Células fixas e cabeçalho sticky compartilham a mesma tabela: a seleção e o Modelo recebem `z-index` maior que o `thead`, e o `thead` maior que as células comuns, para nada se sobrepor ao rolar.
- O contêiner nunca faz a página inteira rolar na horizontal; só ele rola. A barra de rolagem é visível e o `overscroll-behavior-x` é contido.

### Ficha
- Topo: marca/modelo, etiquetas, três leituras (IDRS, consumo, capacidade) e o link "Comparar este modelo".
- Índice de seções em uma faixa horizontal sticky abaixo do topo (desktop) ou lista quebrada (celular), com a seção atual marcada por uma barra âmbar.
- Corpo em blocos de 8 colunas, com notas de método em 4 colunas à direita no desktop.
- A seção de consumo e custo é um painel de instrumento: campos à esquerda, leitura grande à direita e a conta aberta abaixo, em mono.

### Comparação
- Três slots no topo, cada um um cartão de instrumento com marca, modelo, capacidade, tipo e ações.
- A matriz é uma tabela com a primeira coluna de atributos em 28% e as demais iguais. No celular, rola horizontalmente com a coluna de atributos fixa.
- O painel de custo fica acima dos slots e usa os mesmos campos da ficha.

### Assistente
- Uma pergunta por tela, com trilho de progresso de 5 segmentos e o número da etapa em mono.
- Cartões de opção grandes (alvo mínimo de 56 px), com ícone de linha e descrição curta; seleção por borda de 2 px e fundo de 6% de tinta.
- O resultado é uma leitura grande em mono, seguida dos fatores, das suposições e das orientações.

### Breakpoints
`480px` (celular grande), `640px` (tablet retrato), `768px` (tablet), `1024px` (desktop), `1280px` (desktop largo), `1536px` (shell máximo).

## Elevation & Depth

O sistema é quase plano. Profundidade vem de tom, hairline e sobreposição sólida, não de sombra difusa.

- **Nível 0** — página em papel mineral.
- **Nível 1** — giz com hairline de 1 px: cartões, tabela, campos, painéis.
- **Nível 2** — petróleo sólido: cabeçalho de tabela escuro, blocos de destaque, rodapé.
- **Nível 3** — sobreposição: somente o dock de seleção, o painel de filtros aberto no celular, menus e tooltips.

Regras:
- Nenhuma sombra em repouso. A única sombra permitida é a do nível 3: `0 1px 0 var(--linha), 0 16px 40px rgb(10 31 34 / 0.10)`.
- Sem `backdrop-filter`, sem vidro, sem blur.
- Nunca usar sombra para compensar falta de contraste; usar hairline e tom.
- O foco é sempre visível: contorno de 2 px âmbar com `outline-offset: 2px` e, sobre tinta, contorno giz.

## Shapes

- Raio padrão: **2 px** para botões, campos, chips, etiquetas e células.
- **4 px** para painéis e cartões.
- **8 px** apenas para o dock de seleção, menus e a caixa de resultado do Assistente.
- **Nenhum pill**. Nenhum raio maior que 8 px. Nenhum círculo, exceto o marcador de rádio/checkbox e ícones circulares de 32 px.
- Bordas sempre de 1 px; a única borda de 2 px é a seleção ativa e o foco.
- Ícones de linha, 1,5 px de traço, 16/20/24 px, desenhados para a grade. Sem ícones preenchidos, coloridos ou ilustrativos.
- A régua de capacidade é o elemento gráfico-assinatura: uma linha horizontal com ticks a cada faixa comercial, rótulos mono e a faixa ativa em âmbar. Ela é navegável e mostra a contagem real de Aparelhos.

## Components

### Cabeçalho
Faixa de 64/72 px, fundo giz, hairline inferior. Marca em grotesca 600, navegação em grotesca 500 com sublinhado âmbar de 2 px no item ativo. O link "Análises" só existe quando há Análise publicada. No celular, a navegação rola horizontalmente sem esconder itens.

### Rodapé
Fundo tinta, texto giz, três colunas no desktop: proveniência e Versão da tabela; navegação institucional; nota de afiliado. No celular, empilha com a proveniência primeiro. A nota de afiliado é texto, não selo.

### Botão primário
Fundo tinta, texto giz, raio 2 px, altura 44 px, padding 12×20, grotesca 500. Hover: petróleo. Active: petróleo profundo com deslocamento de 1 px. Disabled: 45% de opacidade. Ícone opcional à direita, 16 px. Nunca com sombra.

### Botão secundário
Fundo giz, texto tinta, borda de 1 px hairline, mesmo tamanho. Hover: fundo papel e borda grafite. É o padrão para ações não destrutivas fora do fluxo principal.

### Botão de texto
Sem fundo e sem borda, texto tinta ou `signal-ink`, sublinhado de 1 px no hover. Usado em "Limpar filtros", "Trocar", "Remover" e navegação terciária.

### Campo
Rótulo mono acima, campo giz com borda hairline, raio 2 px, altura 44 px, texto grotesca. Foco: borda tinta + anel âmbar de 2 px. Erro: borda `classe-f`, mensagem em grotesca pequena com ícone de 16 px. Ajuda: mono 0,75 rem em mudo. Select com seta desenhada, não nativa.

### Chip de filtro
Fundo papel, texto grafite, borda transparente, raio 2 px, altura 32 px (44 px no celular). Ativo: fundo tinta, texto giz. Hover: borda grafite. O chip de resumo tem um "×" de 16 px com alvo de 44 px e `aria-label` "Remover filtro …".

### Etiqueta de Classe
Letra A–F em mono 600, cor da Classe, fundo tonal a 10%, borda de 1 px na cor da Classe, raio 2 px, padding 2×6. Quando as Variantes divergem, mostra a faixa `A – C` com o tom da pior Classe e um `title` com a explicação.

### Leitura de dado (readout)
Rótulo mono maiúsculo, valor em mono 1,75–2,5 rem, unidade em mono 0,75 rem, legenda em grotesca pequena. Sem caixa; a hierarquia vem do tamanho e da hairline acima. É o componente que substitui o "card de estatística" genérico.

### Régua de capacidade
Linha de 1 px com seis segmentos proporcionais às contagens reais; ticks verticais de 8 px; rótulos mono `ATÉ 9.000`, `9.001–12.000`, etc.; contagem em mono abaixo. Cada segmento é um link para o recorte correspondente. No hover/foco, o segmento ganha fundo âmbar a 12% e a contagem aparece; no celular, vira uma lista de seis linhas com barra de proporção. Como um Aparelho pode ter Variantes em mais de uma faixa, a soma das contagens pode passar do total: o rótulo fala em "aparelhos com capacidade na faixa", não em uma partição. É a assinatura da home e não se repete como decoração em outras páginas.

### Tabela de Aparelhos
Cabeçalho mono, linhas hairline, zebra mineral, ordenação com setas de 8 px, linha analisada com marcador âmbar de 2 px à esquerda e selo "Análise" discreto. A célula Modelo tem o link e a segunda linha `Função · Tensão` em grotesca pequena e mudo. Checkbox de 20 px com alvo de 44 px. A tabela nunca vira cartões: em telas estreitas ela rola na horizontal dentro do próprio contêiner, com seleção e Modelo fixas à esquerda, cabeçalho sticky e o aviso "Deslize para ver as colunas".

### Painel de filtros
Duas faixas nomeadas — **Aparelho** e **Desempenho** —, cada uma com rótulo mono e hairline superior. Campos em largura total, chips quebrando linha. Rodapé com contagem do recorte e "Limpar filtros" (só quando fora do padrão). No desktop, painel embutido abaixo da barra; no celular, painel sobreposto de altura máxima com rolagem interna e botão "Aplicar" fixo.

### Dock de seleção
Barra escura (tinta) acima da tabela, com contagem `2 de 3`, nomes dos modelos em mono e ações "Limpar seleção" e "Comparar". Aparece só com ao menos um selecionado; com dois ou três, "Comparar" vira link primário âmbar. No celular, ocupa a largura toda e mantém 44 px de alvo.

### Cartão de Aparelho na comparação
Fundo giz, borda hairline, raio 4 px, padding 16 px. Marca em mono maiúsculo, modelo em grotesca 600, resumo em mudo, custo em mono, ações em texto. O CTA de Oferta fica na área de ações, com o marcador "link de afiliado" na mesma linha, nunca dentro da matriz.

### Matriz de comparação
Primeira coluna de atributos com fundo papel e texto mono; colunas de modelos com hairline entre si. Linhas de seção em tinta com texto giz. Valores numéricos em mono tabular. Nenhum destaque de "melhor"; a diferença é uma frase factual abaixo, não um troféu. No celular, rolagem horizontal com a primeira coluna fixa e indicador de rolagem.

### Calculadora de custo
Painel de instrumento: campos UF, tarifa, horas e dias em uma coluna de 4; resultado em leitura grande de 2,5 rem; a conta aberta em lista mono numerada; o aviso de estimativa em grotesca pequena. O resultado é uma região viva (`aria-live="polite"`). No celular, campos antes do resultado.

### Assistente
Trilho de progresso de 5 segmentos com o segmento atual em âmbar e o texto `Etapa 2 de 5` em mono. Uma pergunta por tela, cartões de opção com ícone de linha, título e descrição. Botão "Voltar" em texto e "Continuar" primário. O resultado usa a leitura grande, os fatores em lista mono com valores à direita e as suposições em bloco de nota.

### Análise editorial
Coluna de leitura de 68ch, título em display, data e tempo de leitura em mono, aviso de transparência em bloco de nota com borda esquerda âmbar de 2 px, figuras com legenda em mono, citações em serifa itálica e subtítulos em grotesca. O CTA comercial é um bloco separado por hairline, com o marcador de afiliado.

### Oferta
Texto "Ver oferta — Loja · link de afiliado" em uma linha, com o marcador em mudo. Sem preço, sem selo de desconto, sem cor de urgência. A faixa de Ofertas tem uma frase curta de transparência e nunca se mistura à matriz técnica.

### Estado vazio
Título em grotesca 1,25 rem, uma frase em serifa, uma ação primária. Sem ilustração. Exemplos: catálogo sem resultado, comparação sem modelos, análise sem Oferta, calculadora sem consumo declarado.

### 404
Página de leitura com o título "Fora da escala", uma frase curta, a régua de capacidade como caminho de volta e links para Aparelhos, Assistente e Comparar. Sem humor forçado.

### Movimento
- Durações: 120 ms (hover/foco), 180 ms (abertura de painel), 240 ms (dock e resultado).
- Curva: `cubic-bezier(0.2, 0, 0, 1)`.
- Apenas uma entrada orquestrada: os ticks da régua de capacidade aparecem em sequência de 40 ms na home. Todo o resto é feedback imediato.
- `prefers-reduced-motion: reduce` remove a entrada, as transições de altura e qualquer deslocamento; nada de conteúdo fica oculto.

## Do's and Don'ts

### Do
- Use a grade e a hairline para separar; deixe o espaço em branco fazer o trabalho.
- Escreva o número com unidade, origem e, se calculado, a fórmula.
- Use o mono para medir e a serifa para explicar.
- Mantenha a escala térmica e as cores de Classe como dados, com legenda e letra.
- Prefira uma ação primária por tela; o resto é texto ou secundário.
- Verifique contraste real (4,5:1 texto, 3:1 não texto) e alvos de 44 px.
- Teste 320 px, 390 px, 768 px, 1024 px, 1440 px e 1920 px.
- Preserve a URL, o canonical, o JSON-LD e o conteúdo crawlável em toda mudança.

### Don't
- Não use gradiente de fundo, glassmorphism, blur, sombra difusa ou card flutuante.
- Não use pill, raio maior que 8 px, ícone colorido ou ilustração decorativa.
- Não use roxo, azul genérico de SaaS, verde "sustentável" de marca ou laranja de urgência.
- Não use "melhor", "campeão", estrelas, nota, ranking ou selo de recomendação.
- Não prometa preço, desconto, economia ou prazo.
- Não esconda conteúdo atrás de animação, scroll-jacking ou carrossel automático.
- Não troque densidade por cartões decorativos no catálogo.
- Não use a escala térmica como enfeite; ela só existe onde há dado.
- Não crie uma segunda linguagem visual para uma página "especial".
