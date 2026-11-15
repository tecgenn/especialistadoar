# Spec — Fase 11: calculadora de custo de energia, filtros por faixa, Ofertas e institucionais

## Problem Statement

O Especialista do Ar entrega os dados oficiais do INMETRO — capacidade, consumo, IDRS,
Classe, condições de ensaio —, compara até três Aparelhos e ajuda a descobrir quantos
BTUs o ambiente pede. O que ele **não** responde é a pergunta que decide a compra:
**quanto isso custa na conta de luz**.

Hoje o visitante lê "Consumo anual: 303 kWh/ano" e não tem como transformar isso em
reais. Ele não sabe que os 303 kWh foram medidos em 2.080 horas de uso, não sabe quanto
representa o seu uso real (8 h/dia? 4 h/dia?) e não consegue comparar dois modelos pelo
custo — embora a comparação mostre o consumo lado a lado, o número em kWh não tem
tradução imediata para quem paga a conta.

Há quatro atritos menores no mesmo caminho:

1. **A ficha não explica os próprios números.** IDRS, Classe, Consumo anual e a situação
   do Registro aparecem crus. Quem chega de um resultado de busca nunca vê a explicação
   que existe na home.
2. **O filtro de Capacidade é uma lista de 44 valores exatos.** Quem não sabe quantos
   BTUs precisa — a maioria — não tem por onde começar.
3. **O painel "Pesquisa avançada" não tem hierarquia.** São seis campos numa grade de
   três colunas iguais: dez chips de Marca espremidos em um terço da largura, um select
   "Outras…" competindo com eles, sem separação entre "o que é o aparelho" e "o que ele
   entrega", e sem contagem de resultados.
4. **Não há páginas institucionais.** Não existe contato, política de privacidade nem
   termos de uso — o que é condição prática para qualquer programa de afiliado ou de
   anúncios, e deixa o visitante sem canal para corrigir um dado.

E a Oferta de afiliado, que já existe na ficha e nas Análises, não aparece onde a decisão
acontece (a comparação), usa um rótulo que promete preço ("Ver preço e comprar") quando
não exibimos preço, e depende de um único aviso de transparência numa seção.

## Solution

Uma fase em cinco frentes, todas site-only — o pipeline, `data/build` e `reports` não
mudam:

1. **Calculadora de custo de energia**, como parte do mesmo motor determinístico do
   Assistente: consumo do INMETRO ÷ 2.080 h/ano → consumo por hora → uso informado
   (horas/dia × dias/mês) → custo com a tarifa da UF ou a tarifa digitada. Vive na
   **ficha** (seção "Consumo e custo", com R$/mês como número principal e a conta aberta
   passo a passo) e na **comparação** (um painel de entradas no topo, um cartão por
   modelo e três linhas na matriz). O estado inteiro vive na URL, com padrões que não
   sujam o link.
2. **Filtros**: a Capacidade ganha **seis faixas** como chips ao lado do select de
   capacidade exata, e o painel "Pesquisa avançada" é reorganizado em **duas faixas
   nomeadas** — "Aparelho" e "Desempenho" — com campos em largura total, contador de
   resultados e "Limpar filtros" no rodapé.
3. **Ofertas**: rótulo "Ver oferta", aviso de afiliado em três níveis (junto do link,
   nos Termos e uma linha no rodapé, todos discretos), e um CTA por modelo nos cartões da
   comparação, sempre fora da matriz.
4. **Ficha**: etiquetas de Classe, situação e registro no topo, três cartões de destaque
   (IDRS, Consumo anual, Capacidade), índice de seções e "Comparar este modelo"; uma
   seção "Entenda os números" com quatro explicadores recolhíveis.
5. **Institucionais**: `/contato`, `/politica-de-privacidade` e `/termos-de-uso`,
   escritos apenas com o que é verdade hoje (Cloudflare Web Analytics sem cookies, sem
   GA4, sem AdSense, calculadora processada no navegador).

Com isso o site deixa de responder só "qual é o mais eficiente" e passa a responder
"quanto custa no meu uso" — que é o que o concorrente responde e nós não.

## User Stories

### Calculadora — ficha

1. Como visitante da ficha, quero ver uma seção "Consumo e custo" já preenchida com um
   exemplo real, para entender o que a calculadora faz sem digitar nada.
2. Como visitante, quero escolher a minha UF numa lista de 27 estados, para partir de uma
   tarifa de referência próxima da minha.
3. Como visitante, quero ver a data de referência e a fonte da tarifa de cada UF, para
   saber o quanto aquele número pode estar desatualizado.
4. Como visitante, quero poder digitar a tarifa da minha conta, para que o resultado seja
   o meu, e não uma média.
5. Como visitante, quero que existir uma opção "Tarifa informada" que mantenha o valor
   que digitei sem associá-lo a nenhum estado.
6. Como visitante, quero que trocar a UF atualize a tarifa do campo, para não ter de
   procurar o valor.
7. Como visitante, quero ajustar horas por dia, para refletir o meu uso.
8. Como visitante, quero ajustar os dias por mês, para refletir férias ou uso sazonal.
9. Como visitante, quero ver o consumo estimado por mês em kWh, para comparar com a
   minha conta.
10. Como visitante, quero ver o **custo por mês** como número principal, para saber o que
    esperar da conta.
11. Como visitante, quero ver o **custo por ano**, para dimensionar o gasto ao longo da
    vida do aparelho.
12. Como visitante, quero ver a conta aberta passo a passo (consumo INMETRO → consumo por
    hora → horas de uso → consumo mensal → tarifa → custo), para conferir a aritmética.
13. Como visitante, quero ler as premissas do método (2.080 h/ano ≈ 5,7 h/dia, 12 meses
    iguais), para saber de onde vem o consumo declarado.
14. Como visitante, quero um exemplo numérico pronto, para entender o cálculo sem fazer
    conta.
15. Como visitante, quero um aviso claro de que o resultado é uma **estimativa** com as
    minhas entradas, não um Valor oficial nem uma promessa de economia.
16. Como visitante, quero que a ficha de um Aparelho com mais de uma Variante mostre o
    custo como faixa (mínimo–máximo), para não esconder a divergência de consumo.
17. Como visitante, quero que o link da ficha carregue tarifa e uso na URL, para mandar o
    meu cenário para outra pessoa.
18. Como visitante, quero que a URL fique limpa quando eu não mudo nada, para não
    carregar parâmetros inúteis.
19. Como visitante, quero que um link com valor absurdo (`horas=99`) abra com o padrão,
    sem erro na página.
20. Como visitante, quero valores em formato brasileiro (R$ 45,60 e 60,00 kWh), para ler
    sem traduzir.
21. Como visitante, quero que o resultado atualize na hora, sem recarregar, para testar
    cenários rapidamente.
22. Como visitante no celular, quero os campos e o resultado empilhados na ordem de
    leitura, para não rolar de lado.
23. Como visitante que usa leitor de tela, quero rótulos associados e o resultado anunciado
    como região viva, para ouvir o novo valor ao mudar uma entrada.

### Calculadora — comparação

24. Como visitante da comparação, quero um painel único de entradas no topo, para não
    repetir tarifa e uso em cada modelo.
25. Como visitante, quero que os mesmos quatro campos da ficha valham aqui, para o meu
    cenário ser o mesmo nos dois lugares.
26. Como visitante, quero um cartão por modelo com consumo mensal, custo mensal e custo
    anual, para bater o olho e comparar.
27. Como visitante, quero uma seção "Custo estimado (seu uso)" na matriz, para ver o custo
    na mesma tabela em que vejo capacidade e consumo.
28. Como visitante, quero uma frase factual com a diferença entre o maior e o menor custo
    anual, para dimensionar a decisão.
29. Como visitante, quero um aviso quando os modelos têm capacidades diferentes, para não
    confundir "custa menos" com "é mais eficiente".
30. Como visitante, quero que a comparação continue **neutra**: nenhum valor marcado como
    melhor, nenhum ★, nenhum veredito.
31. Como visitante com um único modelo selecionado, quero ver só o convite para adicionar
    outro, sem painel de custo (a ficha já cumpre esse papel).
32. Como visitante, quero abrir um link de comparação vindo da ficha e encontrar o mesmo
    recorte de tarifa e uso.
33. Como visitante, quero que o painel da comparação e o da ficha compartilhem padrões,
    para o resultado não mudar de um para o outro.
34. Como visitante no celular, quero o painel acima dos cartões e a matriz rolando na
    horizontal, para manter o lado a lado.

### Ofertas

35. Como visitante, quero o botão "Ver oferta", para não ler a promessa de um preço que o
    site não mostra.
36. Como visitante, quero saber, junto do link, que ele é de afiliado e que a comissão não
    me custa nada, para decidir com transparência.
37. Como visitante, quero essa informação discreta (texto pequeno, cor secundária), para
    não transformar a página num anúncio.
38. Como visitante, quero que a loja apareça no CTA, para saber para onde vou antes de
    clicar.
39. Como visitante da comparação, quero um CTA de Oferta no cartão do modelo que tem
    Oferta, para ir à loja sem sair do lado a lado.
40. Como visitante, quero que o CTA não apareça quando o modelo não tem Oferta, para não
    ver botão morto.
41. Como visitante, quero a matriz da comparação sem qualquer CTA, para que os dados
    continuem separados do comércio.
42. Como visitante, quero ler nos Termos de Uso que o link é comercial e que a compra
    acontece na loja, para conhecer as regras.

### Filtros — faixas de capacidade

43. Como visitante que não sabe quantos BTUs precisa, quero seis faixas de capacidade em
    chips (até 9.000, 9.001–12.000, 12.001–18.000, 18.001–24.000, 24.001–30.000, acima de
    30.000), para começar por uma estimativa.
44. Como visitante, quero que as faixas venham dos dados publicados, para nunca ver uma
    faixa vazia.
45. Como visitante que já sabe a capacidade exata, quero o select de capacidade no mesmo
    campo dos chips, para não perder a precisão.
46. Como visitante, quero que escolher uma faixa desligue a capacidade exata e vice-versa,
    para não somar dois recortes incompatíveis.
47. Como visitante, quero um chip de resumo com a faixa escolhida e um "×" para desfazê-la,
    para enxergar o recorte como nos outros filtros.
48. Como visitante, quero compartilhar a URL com a faixa (`?btuMin=&btuMax=`), para mandar
    o recorte pronto.
49. Como visitante, quero que `?btu=12000` continue funcionando como antes, para links
    antigos não quebrarem.

### Filtros — painel "Pesquisa avançada"

50. Como visitante, quero o painel dividido em duas faixas nomeadas — "Aparelho" (Marca,
    Tipo, Função) e "Desempenho" (Capacidade, Classe, Tensão) —, para entender a lógica do
    recorte.
51. Como visitante, quero cada campo em largura total, para os chips respirarem e
    quebrarem linha naturalmente.
52. Como visitante, quero as dez marcas curadas numa faixa só, para comparar de relance.
53. Como visitante, quero "Outras marcas" como busca, para achar uma marca fora da
    curadoria sem abrir uma lista enorme.
54. Como visitante, quero as seis classes como letras grandes e coloridas, para escolher
    pelo símbolo que já conheço da etiqueta.
55. Como visitante, quero o contador de resultados no rodapé do painel, para ver o efeito
    do recorte sem fechar o painel.
56. Como visitante, quero "Limpar filtros" no rodapé do painel, para recomeçar de onde
    estou.
57. Como visitante, quero que tudo continue aplicando na hora e escrevendo na URL, para
    não perder o comportamento atual.
58. Como visitante no celular, quero as duas faixas empilhadas, com os chips quebrando
    linha, para não ter seis blocos apertados.

### Ficha — topo, índice e custo

59. Como visitante, quero ver Classe, situação e número de registro como etiquetas logo
    abaixo do título, para identificar o Aparelho antes de rolar.
60. Como visitante, quero três cartões de destaque com IDRS, Consumo anual e Capacidade,
    para ter o essencial num relance.
61. Como visitante, quero um índice de seções no topo, para pular direto ao que procuro.
62. Como visitante, quero que as âncoras levem à seção certa e deixem o foco visível, para
    navegar por teclado.
63. Como visitante, quero um link "Comparar este modelo", para levar este Aparelho à
    comparação.
64. Como visitante, quero que esse link abra a comparação com o modelo já no primeiro
    campo e o convite para adicionar outro.
65. Como visitante, quero que o custo por mês seja o número grande da seção de custo, com
    os detalhes em texto menor, para a hierarquia seguir a decisão.
66. Como visitante no celular, quero os cartões de destaque empilhados, para ler na ordem.

### Listagem

67. Como visitante da tabela, quero uma segunda linha no modelo com Função e Tensão, para
    ver o que hoje só existe no filtro.
68. Como visitante, quero essa linha discreta, para não aumentar a altura da linha nem
    competir com os dados principais.
69. Como visitante no celular, quero a mesma informação no cartão, para não perder contexto.

### Conteúdo

70. Como visitante da ficha, quero uma seção "Entenda os números", para interpretar IDRS,
    Classe, Consumo anual e situação do Registro sem sair da página.
71. Como visitante, quero esses explicadores recolhidos por padrão, para a ficha não virar
    um texto longo.
72. Como visitante, quero saber que o consumo anual é medido em 2.080 horas/ano (cerca de
    5,7 h/dia), para entender por que o meu uso pode custar diferente.
73. Como visitante, quero saber o que significa um Registro Ativo, Cancelado ou Inativo,
    para interpretar o status que vejo na ficha.
74. Como visitante da home, quero ler como o INMETRO testa (carga total a 35 °C, carga
    parcial a 35 °C, carga parcial a 29 °C), para entender de onde saem os números.
75. Como visitante da home, quero saber quando a classificação A–F atual entrou em vigor
    (1º/1/2023, Portaria INMETRO 269/2021), para não comparar etiquetas de épocas
    diferentes.
76. Como visitante da home, quero uma nota sobre tecnologia Inverter, para entender por
    que dois modelos de mesma capacidade consomem diferente.
77. Como visitante, quero uma resposta para "o que é BTU/h?", para entender a unidade que
    o site inteiro usa.
78. Como visitante, quero uma resposta para "127 V ou 220 V?", para escolher a tensão com
    critério.
79. Como mecanismo de busca, quero que as duas novas perguntas entrem no `FAQPage`, para
    poder exibi-las.

### Institucionais

80. Como visitante, quero uma página de contato com um e-mail visível, para falar com o
    site.
81. Como visitante, quero assuntos sugeridos (dúvida, correção de dado do INMETRO,
    parceria), para saber o que cabe ali.
82. Como visitante, quero que cada assunto abra o e-mail já com o assunto preenchido, para
    não escrever do zero.
83. Como visitante, quero uma política de privacidade que diga o que **não** coletamos
    (sem cadastro, login, cookies próprios ou formulário), para confiar no site.
84. Como visitante, quero saber que as métricas são do Cloudflare Web Analytics, sem
    cookies, e que o Cloudflare hospeda o site.
85. Como visitante, quero saber que a calculadora e o Assistente rodam no meu navegador e
    que o que eu digito vai só para a URL.
86. Como visitante, quero saber dos direitos da LGPD e como exercê-los, para ter um canal.
87. Como visitante, quero termos de uso que separem **Valores oficiais** de **Valores
    calculados**, para não confundir estimativa com dado do INMETRO.
88. Como visitante, quero saber que o site não vende, não exibe preços e não processa
    pedidos, para entender o papel das Ofertas.
89. Como visitante, quero saber que posso usar a base, inclusive de forma automatizada,
    citando o Especialista do Ar, para saber o que é permitido.
90. Como visitante, quero os três links no rodapé, para achá-los em qualquer página.
91. Como visitante, quero que as três páginas estejam no sitemap, para que sejam
    encontradas.

## Implementation Decisions

### Vocabulário e documentação

- **Custo estimado**: o resultado da calculadora. É um **Valor calculado** no sentido já
  definido no `CONTEXT.md`: derivado do consumo oficial e de entradas informadas por quem
  consulta, sempre acompanhado de fórmula e entradas. Entra no glossário.
- **Tarifa de referência**: o valor em R$/kWh curado por UF, com mês de referência e
  fonte. É insumo do site, não dado do INMETRO; nunca entra em `data/build`.
- **Faixa de capacidade**: intervalo de BTU/h usado como filtro, derivado dos dados
  publicados. Não é uma capacidade exata e não substitui `btu`.
- **Oferta** (revisão): passa a ser identificada na tela com o rótulo "Ver oferta" e o
  marcador "link de afiliado"; a divulgação acontece em três níveis.
- ADR-0022 "Calculadora de custo de energia no site" e ADR-0023 "Divulgação de Oferta de
  afiliado em três níveis" (este revisa o ADR-0010).
- `CONTEXT.md`, `docs/agents/architecture.md`, `README.md` e
  `docs/agents/project-state.md` são atualizados no ticket de fechamento.

### Calculadora — motor e tarifas

- **Novo módulo puro** (site, sem DOM), no mesmo formato do motor do Assistente: recebe
  `consumoAnualKwh` (um ou mais, quando o Aparelho tem Variantes), `tarifa`, `horas`,
  `dias` e devolve consumo por hora, consumo mensal, custo mensal, custo anual, além das
  entradas usadas.
- **Fórmula**: consumo por hora = consumo anual ÷ 2.080; consumo mensal = consumo por hora
  × horas × dias; custo mensal = consumo mensal × tarifa; custo anual = custo mensal × 12.
  O método de 2.080 horas é o mesmo do INMETRO e aparece escrito na interface.
- **Mais de uma Variante**: o resultado vira faixa (mínimo–máximo) calculada sobre o menor
  e o maior consumo. Uma Variante, um valor.
- **Tarifas curadas** em JSON do site (`apps/site/tarifas.json`), uma entrada por UF com
  `uf`, `nome`, `tarifa`, `referencia` e `fonte`. Validado no build: 27 UFs, sem
  repetição, tarifa positiva e finita, referência e fonte obrigatórias. UF desconhecida ou
  ausente na base é erro de build, não silêncio.
- **Tarifa digitada** tem precedência sobre a da UF e não é persistida em lugar nenhum.
- **Formatação**: `Intl.NumberFormat("pt-BR")`; R$ com duas casas, kWh com duas casas,
  sempre com unidade explícita.
- **A calculadora não é um Valor oficial** e a interface diz isso: resultado, fórmula,
  entradas e aviso de estimativa andam juntos.

### Calculadora — contrato de URL

- Chaves `uf`, `tarifa`, `horas` e `dias`, idênticas na ficha e na comparação.
- **Padrões**: `uf=SP` (tarifa da curadoria), `horas=8`, `dias=30`. O padrão **não**
  aparece na URL — mesma regra do ADR-0019.
- **"Tarifa informada"** (sem UF) grava a chave `uf` vazia, que desliga o padrão na leitura;
  é o mesmo mecanismo de `tensao=`.
- **Valores inválidos** (UF inexistente, tarifa ≤ 0 ou não numérica, horas fora de 0–24,
  dias fora de 1–31) caem no padrão em silêncio, sem erro na página.
- O canonical da ficha e da comparação continua limpo; a calculadora não cria página
  indexável nova.
- A calculadora é estado de interface, como `?ids=`: não entra em `FiltrosConsulta`.

### Comparação

- Painel único no topo, com os quatro campos, acima dos cartões e dos campos de busca.
- Só aparece com **2 ou 3** modelos; com 1, permanece apenas o convite já existente.
- **Cartões**: cada modelo mostra consumo mensal, custo mensal e custo anual, no mesmo
  formato da ficha.
- **Matriz**: nova seção "Custo estimado (seu uso)" com três linhas (Consumo mensal, Custo
  mensal, Custo anual), depois das linhas técnicas.
- **Frase factual** abaixo da matriz: "Diferença entre o maior e o menor custo estimado:
  R$ X/ano". Sem "menor custo", sem "melhor", sem ★ — a neutralidade do ADR-0021 é
  preservada.
- **Aviso de capacidades diferentes**: quando as capacidades não coincidem, uma nota diz
  que custo menor não significa maior eficiência e aponta o IDRS como medida de eficiência.
- O CTA de Oferta fica no cartão do modelo (área de ações, fora da matriz), só quando há
  Oferta.

### Ofertas — três níveis de divulgação

1. **Junto do link**: o cartão do CTA mostra a loja e, na mesma linha, "link de afiliado"
   em texto pequeno e cor secundária; a faixa de Ofertas mantém uma frase curta (não um
   parágrafo longo) dizendo que o link é comercial, que a compra é na loja e que a comissão
   não custa nada ao visitante.
2. **Institucional**: seção própria nos Termos de Uso.
3. **Rodapé**: uma linha discreta ao lado da "Versão da tabela", com link para os Termos.

Nada de modal, banner, tooltip ou selo colorido. Os atributos do link continuam
`rel="sponsored nofollow noopener"` e `target="_blank"`, centralizados num componente só.

- Rótulo padrão da Oferta passa a "Ver oferta"; a Oferta de produção é reescrita.
- Multi-loja continua suportado pelo contrato atual (a Oferta já tem `loja` e o Aparelho
  aceita várias); Amazon, quando entrar, é linha nova no JSON, sem código.

### Filtros — faixas de capacidade

- Duas chaves novas no contrato de consulta: `btuMin` e `btuMax` (números, ambos
  opcionais; `btuMax` ausente significa "sem teto"). Compatível com `?btu=` — quando
  `btu` está presente, as faixas são ignoradas.
- A filtragem por faixa casa qualquer Variante cuja capacidade esteja no intervalo.
- O padrão da chave fica no motor de consulta; a serialização de URL e os chips ficam no
  módulo de estado do site, como os demais filtros.
- As **seis faixas** são derivadas dos dados: os limites são fixos e comerciais (9.000,
  12.000, 18.000, 24.000, 30.000), mas uma faixa sem nenhum Aparelho na base não é
  renderizada.
- Escolher faixa limpa `btu`; escolher capacidade exata limpa `btuMin`/`btuMax`.
- No resumo do recorte, a faixa vira um chip com o rótulo legível ("12.001–18.000 BTU/h").

### Filtros — painel "Pesquisa avançada"

- Duas faixas com título — **Aparelho**: Marca, Tipo, Função. **Desempenho**: Capacidade,
  Classe, Tensão.
- Cada campo ocupa a largura do painel; os chips quebram linha.
- **Marca**: as dez curadas num bloco de chips e "Outras marcas" como campo de busca (o
  select atual vira busca, sem lista longa).
- **Classe**: seis letras grandes com a cor da curadoria.
- **Capacidade**: chips de faixa e select de capacidade exata no mesmo campo.
- Rodapé do painel: contador de resultados e "Limpar filtros".
- Comportamento intacto: aplica na hora, escreve na URL, painel abre sozinho quando a URL
  traz filtro avançado, chips de resumo por fora.

### Ficha

- Abaixo do H1: etiquetas de **Classe** (faixa quando houver mais de uma), **situação**
  (Ativo quando ao menos um Registro está Ativo) e **número(s) de registro**.
- Três cartões de destaque: IDRS, Consumo anual, Capacidade — cada um com a unidade e uma
  legenda curta. Valores como faixa quando o Aparelho tem mais de uma Variante.
- Índice de seções com âncoras para Resumo, Consumo e custo, Condições de ensaio,
  Especificações, Registros, Proveniência e Ofertas (as que existirem na página).
- "Comparar este modelo" como link secundário no topo, ao lado das etiquetas, apontando
  para `/comparar/?ids=<id>`.
- **"Entenda os números"**: quatro blocos recolhíveis (`<details>`) — IDRS, Classe,
  Consumo anual (2.080 h/ano ≈ 5,7 h/dia), Situação do Registro. Fechados por padrão.

### Listagem

- Segunda linha sob o modelo, discreta: **Função · Tensão** ("Quente/Frio · 220 V"; bivolt
  mostra "127 · 220 V"). Sem coluna nova, sem mudança de altura relevante, sem tocar na
  contagem, ordenação ou "Mostrar mais".
- No celular, a mesma informação entra no cartão do Aparelho.
- **Não** entra Fluido refrigerante: o `consulta.json` não carrega esse campo e incluí-lo
  exigiria mudar a projeção do pipeline.

### Content (home)

- "Metodologia e INMETRO" ganha três parágrafos: as três condições de ensaio; a data e a
  portaria da classificação vigente; a nota sobre Inverter. Sem seção nova.
- Duas perguntas novas no FAQ: "O que é BTU/h?" e "Qual tensão escolher: 127 V ou 220 V?".
  As respostas seguem o tom atual (curtas, sem prometer economia) e alimentam o `FAQPage`.

### Institucionais

- Três páginas estáticas, no layout de leitura (sem `ampla`), com canonical e no sitemap:
  - **`/contato`**: um endereço de e-mail em constante única do site
    (`tecgenn@gmail.com` por enquanto), três assuntos com `mailto:` e assunto
    pré-preenchido (dúvida, correção de dado do INMETRO, parceria), e a nota de que os
    dados vêm do INMETRO e os links podem levar a lojas parceiras.
  - **`/politica-de-privacidade`**: quem somos; independência do INMETRO; o que não
    coletamos; métricas com Cloudflare Web Analytics (sem cookies) e hospedagem Cloudflare;
    Ofertas e lojas parceiras; calculadora e Assistente processados no navegador; direitos
    LGPD e contato. Sem menção a GA4 ou AdSense.
  - **`/termos-de-uso`**: finalidade informativa e independência; Valores oficiais ×
    Valores calculados; Ofertas (não vendemos, não exibimos preços, não processamos
    pedidos, comissão sem custo); uso da base (dados oficiais do INMETRO são públicos; a
    organização em Aparelhos, Variantes, ids, Marca de catálogo e Análises é do site; uso
    livre com atribuição ao Especialista do Ar); limitação de responsabilidade; legislação
    brasileira.
- Rodapé ganha os três links e a linha de divulgação de afiliado.

## Testing Decisions

Um bom teste aqui exercita **comportamento externo**: o que a pessoa vê, o que a URL
passa a conter, que número aparece. Nada de estado interno de componente, nome de classe
ou detalhe de implementação.

Seams, do mais alto para o mais baixo — todos já existentes no projeto:

1. **Ilhas no DOM (jsdom)** — o seam principal, o mesmo da consulta e do Assistente.
   Cobre a calculadora na ficha e na comparação (entradas → resultado, URL, padrões,
   inválidos), o painel de filtros redesenhado e as faixas de capacidade.
2. **Módulo puro da calculadora** — aritmética, faixa de Variantes, contrato de URL
   (padrões, chaves vazias, inválidos), formatação.
3. **Motor de consulta (pacote isomórfico)** — `btuMin`/`btuMax` isolados e em conjunto com
   `btu`, `tensao` e busca.
4. **Módulo de estado do site** — leitura/escrita das novas chaves, `temFiltroAvancado`,
   resumo do recorte.
5. **Curadoria de tarifas (build)** — validação do JSON e a mensagem de erro.
6. **Ilha da comparação** — painel só com 2–3 modelos, cartões com custo, seção da matriz,
   frase de diferença, aviso de capacidades diferentes, CTA por modelo.

Prior art: os testes de ilha da consulta e do Assistente, os testes puros de estado,
tabela, análises e comparação, e os testes do pacote de consulta.

Cobertura mínima por comportamento:

- Calculadora: padrões; trocar UF; tarifa digitada; "Tarifa informada" gravando `uf=`;
  horas e dias; faixa em Aparelho com duas Variantes; URL limpa no padrão; `horas=99` e
  tarifa negativa caindo no padrão; formatação pt-BR.
- Comparação: painel ausente com 1 modelo; presente com 2 e 3; custo por modelo; frase de
  diferença; aviso com capacidades diferentes; CTA só nos modelos com Oferta.
- Faixas: seis chips derivados; faixa filtra corretamente nos limites (9.000 entra em "até
  9.000", 9.001 entra na faixa seguinte); faixa e exata mutuamente exclusivas; `?btu=`
  preservado; chip de resumo com "×".
- Painel: duas faixas nomeadas; contador de resultados refletindo o recorte; "Limpar
  filtros" no rodapé; abre pela URL.
- Institucionais: as três rotas existem no build, com canonical e no sitemap; o endereço
  de e-mail aparece nos `mailto:`.
- Tarifas: JSON inválido (UF repetida, tarifa negativa, fonte ausente) falha o build.

## Out of Scope

- Exibir preços nas Ofertas, "problema com esta oferta", feedback de oferta e redirect
  `/out/<id>`.
- AdSense, GA4, banner de cookies e qualquer consentimento — a política descreve só o que
  existe hoje.
- Filtro "Situação" e busca por número de registro.
- Ordenação com seis opções, toggle Lista/Cards e paginação numerada.
- Reescrever o Assistente ou trocar o wizard dele.
- Página própria `/calculadora/`.
- Fluido refrigerante na listagem (exigiria mudar a projeção publicada).
- Comparar mais de 3 modelos, preços lado a lado, imagem ou PDF da comparação.
- Veredito, ★ ou "menor custo" na comparação.
- Mudanças no pipeline, em `data/build`, `reports` ou no contrato da base servida.
- Troca de domínio (`pages.dev` continua até o `.com.br`).

## Further Notes

- A calculadora é o primeiro lugar do site em que o visitante informa dados. Ela não
  envia nada: o estado vai para a URL do próprio navegador. É o que a política de
  privacidade passa a poder afirmar.
- O concorrente usa a mesma conta e a mesma referência de tarifas (dez/2024), mas sem
  data nem fonte por UF, e declara "menor custo" e ★ na comparação. Nós mantemos o método
  auditável e a comparação neutra.
- Com o padrão `uf=SP`, a ficha já abre com um número real — o risco é o visitante de
  outro estado achar que aquele é o custo dele. Por isso a UF, a data de referência e o
  aviso de estimativa ficam visíveis, não em nota de rodapé.
- As faixas de capacidade convivem com a capacidade exata; a curadoria de filtros
  (`filtros.json`) não precisa mudar.
- A linha de afiliado no rodapé aparece em páginas sem Oferta. É intencional: é letra
  miúda de transparência, não chamada comercial.
- O ticket de fechamento roda `pnpm build && pnpm build:site && pnpm lint && pnpm
  typecheck && pnpm test` e confirma que `data/build` e `reports` não mudaram.
