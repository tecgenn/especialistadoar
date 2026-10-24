# Spec — Fase 7: Página Aparelhos (tabela), ficha técnica e Aparelhos analisados

**Status:** ready-for-agent

## Problem Statement

O catálogo é uma lista crua de links (marca — modelo · tipo), sem ordem, sem os
números que a pessoa usa para escolher, e o resto do site acumulou três
incômodos:

1. **A lista não ajuda a escolher.** Não está em ordem alfabética (segue a ordem
   do build) e não mostra capacidade, consumo, IDRS nem Classe. Para comparar dois
   aparelhos é preciso abrir duas fichas. A referência pública que analisamos
   (arcondicionadoeficiente.com.br/modelos) resolve isso com uma tabela
   ordenável e filtros, mas lista 2.551 linhas com modelos repetidos e valores
   que parecem errados (ex.: 9.000 BTU/h com 32,8 kWh/ano).
2. **A ficha técnica é confusa.** São 13 linhas por Variante: "Capacidade nominal"
   aparece duas vezes (BTU/h e W) e "Capacidade"/"Potência" se repetem em oito
   linhas, uma por condição de ensaio (35 °C e 29 °C, carga total e parcial), sem
   explicação. Variantes com dados idênticos (127 V e 220 V) viram blocos
   repetidos e há variantes totalmente vazias.
3. **Existe uma página de busca (`/busca/`) que repete o catálogo.** É um campo
   Pagefind sobre as fichas, com um índice de 11 MB, enquanto o catálogo já busca
   por marca, modelo e tipo.

Além disso, os Aparelhos que terão Análise (poucos, de marca conhecida, bem
vendidos, com link de afiliado) não têm nenhum destaque na lista.

## Solution

1. **Dados:** a base servida ganha **Classe** e **Situação** (ADR-0018) e o
   `consulta.json` ganha IDRS, consumo, Classe, função, rotação, Situação e um
   sinal de dado suspeito.
2. **Página Aparelhos** (`/aparelhos/`): uma tabela com uma linha por Aparelho,
   cabeçalhos ordenáveis, ordem padrão A–Z (Marca de catálogo, depois modelo),
   filtros (marca, tipo, capacidade, tensão, função, Classe, rotação, Situação)
   com os chips que já existem, 50 linhas por vez e cartões no celular.
3. **Ficha técnica nova:** resumo no topo, grade 2×2 das condições de ensaio e
   Variantes idênticas fundidas.
4. **Aparelho analisado:** quem tem Análise ganha o selo "Analisado", link para a
   Análise e fica no topo da tabela dentro dos filtros, com aviso visível de link
   de afiliado.
5. **Home e menu:** `/` continua sendo a home (texto curto, Análises em destaque,
   botão para Aparelhos); os links antigos `/?marca=…` levam a `/aparelhos/`.
6. **Remover `/busca/`** e o Pagefind.

## User Stories

1. Como visitante, quero ver os aparelhos em ordem alfabética, para achar uma
   marca ou modelo sem procurar.
2. Como visitante, quero ver capacidade, consumo, IDRS e Classe numa tabela, para
   comparar sem abrir cada ficha.
3. Como visitante, quero ordenar clicando no cabeçalho (IDRS, consumo, BTU/h,
   marca, modelo), para ver os mais eficientes primeiro.
4. Como visitante, quero que aparelhos com dado suspeito não dominem o topo de uma
   ordenação por consumo ou IDRS, para não desconfiar da tabela.
5. Como visitante, quero filtrar por função (frio ou quente/frio), Classe, rotação
   (inverter ou fixa) e Situação, além de marca, tipo, capacidade e tensão.
6. Como visitante, quero que marcas e capacidades comuns continuem como chips.
7. Como visitante, quero ver 50 linhas de cada vez e pedir mais, para a página
   abrir rápido no celular.
8. Como visitante no celular, quero cada aparelho como um cartão legível, sem
   rolagem horizontal escondida.
9. Como visitante que compartilha links, quero que filtros e ordem fiquem na URL e
   que links antigos (`/?marca=…`) continuem funcionando.
10. Como visitante, quero um resumo claro no topo da ficha (capacidade, IDRS,
    Classe, consumo, potência em espera).
11. Como visitante, quero entender as condições de ensaio numa grade 2×2, sem
    linhas repetidas e sem condições vazias.
12. Como visitante, quero ver 127 V e 220 V juntos quando os dados são idênticos.
13. Como visitante, quero reconhecer rapidamente os aparelhos que têm análise
    completa, e chegar nela com um clique.
14. Como visitante, quero saber, sem passar o mouse, que os analisados e as Ofertas
    levam links de afiliado.
15. Como mantenedor, quero que publicar uma Análise faça o selo e o topo da tabela
    aparecerem sozinhos.
16. Como mantenedor, quero que a ligação Análise → Aparelho continue explícita
    (`aparelhoId`), para nunca pôr o selo no aparelho errado.
17. Como Agente, quero Classe e Situação na base servida e no `consulta.json`,
    com a semântica documentada.
18. Como Agente, quero que a base e o `consulta.json` continuem sem nenhum dado
    editorial ou comercial.
19. Como revisora, quero que `data/build` seja reproduzível byte a byte.
20. Como mantenedor, quero que `/busca/` redirecione para a tabela, para nenhum
    link antigo quebrar.

## Implementation Decisions

- **Uma linha por Aparelho.** Variantes sem nenhum dado são ignoradas na tabela. Os
  valores numéricos viram listas únicas e ordenadas, como `capacidadesBtu` já é;
  quando há mais de um valor, a tabela mostra a faixa (ex.: "5,5 – 5,9").
- **Contrato (ADR-0018):** `DadosDeclarados.classe: string | null` (da coluna
  "Faixa de Classificação", aparada e em maiúsculas, nunca recalculada) e
  `Aparelho.situacao: "ativo" | "inativo"` (ativo = ao menos um Registro com
  status Ativo).
- **`ItemConsulta` ganha:** `situacao`, `funcao`, `rotacao`, `classes: string[]`,
  `idrs: number[]`, `consumosKwh: number[]` e `suspeito: boolean`. Nada editorial
  entra aqui.
- **Ordenação** é função pura no entry isomórfico `@especialista-do-ar/api/consulta`
  (reusável por Agentes): padrão A–Z por `marcaCatalogo` e depois `modelo`, com
  `Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" })`. Em ordenação
  por coluna numérica o valor representativo é o menor da lista para crescente e o
  maior para decrescente. Com texto na busca a ordem inicial é por relevância; o
  seletor "Ordenar por" e os cabeçalhos trocam a ordem.
- **Dado suspeito** (consumo implausível) só sinaliza, nunca exclui (ADR-0017). Nas
  ordenações por IDRS e consumo, os suspeitos vão para o fim, com aviso ⚠.
- **Filtros novos** (`funcao`, `classe`, `rotacao`, `situacao`) entram em
  `FiltrosConsulta` e na URL, junto com `ordem` e `dir`. Situação começa em "Todos".
  Os parâmetros antigos (`marca`, `tipo`, `btu`, `tensao`, `q`) continuam iguais.
- **Volume:** 50 linhas por vez com "Mostrar mais"; filtro e ordenação em memória.
  Abaixo de 640 px a tabela vira cartões.
- **Aparelho analisado:** o build do site monta o mapa
  `aparelhoId → { titulo, url, temOferta }` a partir das Análises válidas cujo
  Aparelho está na Versão atual, e passa à ilha como propriedade. Os analisados
  vêm primeiro, dentro dos filtros ativos, também quando a pessoa ordena; a
  ordenação vale dentro de cada grupo. Com zero Análises, nada aparece.
- **Aviso de afiliado, em camadas e sempre visível:** (a) cabeçalho do grupo dentro
  da tabela, "Analisados por nós", acrescido de "· contém links de afiliado" quando
  algum analisado do resultado tem Oferta; (b) tooltip no selo, acionável por
  hover, foco e toque, que repete o aviso; (c) etiqueta "Link de afiliado" em cada
  cartão de Oferta e aviso de comissão na faixa; (d) aviso no topo da Análise
  quando o Aparelho tem Oferta. Nada depende só do tooltip.
- **Ficha:** resumo (capacidade em BTU/h com W entre parênteses, IDRS, Classe,
  consumo anual, potência em espera), grade 2×2 de "capacidade / potência" com
  linhas e colunas vazias omitidas, Variantes com `dados` idênticos fundidas num
  bloco com as tensões unidas e Variantes vazias omitidas. Proveniência continua
  listando todas as Linhas da tabela.
- **Rotas:** `/` segue como home; `/aparelhos/` é a tabela; `/aparelhos/<id>` segue
  como a ficha. O link antigo `/?marca=…` é redirecionado por um script curto na
  home (o `_redirects` do Cloudflare Pages não separa a mesma URL por parâmetros);
  `/busca/` e `/busca` são redirecionadas por `_redirects`.
- **Ligação Análise → Aparelho continua manual e explícita** (`aparelhoId`,
  achado por `pnpm aparelho:buscar`). Casamento automático por marca e modelo foi
  recusado: o texto do modelo varia entre exportações e um erro poria o selo no
  produto errado.
- **Nada muda** no agrupamento em Aparelho, nos `id`s, no sitemap das fichas, na
  Marca de catálogo nem nos chips.

## Testing Decisions

Testes observam comportamento externo: artefatos emitidos, funções puras e o DOM da
ilha. Nada de testar estrutura interna.

1. **`runBuild` com fixture:** Classe e Situação nos artefatos, campos novos no
   `consulta.json`, `id` inalterado. Prior art: `build.test.ts`, `aparelhos.test.ts`.
2. **`criarConsulta`/ordenação puras:** A–Z com número natural, ordem por coluna
   com listas, suspeitos no fim, filtros novos e a URL. Prior art:
   `api/test/consulta.test.ts`, `estado.test.ts`.
3. **`agruparVariantes` (puro, no site):** variantes idênticas fundidas, vazias
   omitidas, divergentes preservadas.
4. **Ilha em jsdom:** cabeçalho ordena e marca `aria-sort`; "Mostrar mais";
   analisados primeiro dentro do filtro; tooltip por teclado e toque. Prior art:
   `consulta.test.tsx`.
5. **Build do site ponta a ponta:** 2.462 páginas (2.460 fichas, `/` e
   `/aparelhos/`), nenhum Pagefind, redirecionamentos presentes, mapa de analisados
   com a fixture e vazio no estado real. Prior art: `analises-build.test.ts`.

## Out of Scope

- A página **Comparar** (a referência tem uma): fase futura.
- Lista pré-renderizada para buscadores: a tabela segue como ilha no cliente; as
  fichas continuam indexáveis pelo sitemap.
- A criação das Análises (texto, imagens, vídeos) e domínio próprio.
- Guias.

## Further Notes

- **Ordem dos tickets:** 24 → (25, 26) → 27 → (28, 30) → 29. Ver
  `issues/24` a `issues/30`.
- **Palavra do selo:** "Analisado" no lugar de "Recomendado": descreve o fato (há
  análise completa) sem prometer qualidade a quem tem comissão sobre a venda.
- **Responsabilidade e conteúdo das Análises (fora desta fase, mas relevante):** o
  CDC (art. 36) exige que a publicidade seja identificável "fácil e imediatamente",
  e o guia do CONAR trata a comissão de afiliado como publicidade. A responsabilidade
  do site existe mesmo quando o texto é gerado por IA ou os vídeos são de terceiros:
  recomenda-se revisar os fatos antes de publicar, identificar o conteúdo gerado por
  IA e consultar um advogado. Incorporar vídeos do YouTube pede um ticket próprio.
- **Dado suspeito dos Janela:** parte dos Janela traz consumo e IDRS em escala muito
  diferente dos splits (a lista oficial do Inmetro cita um Janela de 7.000 BTU/h com
  399 kWh/ano). O ticket 25 investiga a métrica na fonte antes de fechar a regra.
