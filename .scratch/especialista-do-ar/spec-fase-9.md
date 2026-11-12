# Spec — Fase 9: Assistente de dimensionamento, tabela e home

## Problem Statement

O site do Especialista do Ar já tem a base, a tabela e as Análises, mas ainda não responde à pergunta que mais traz visitante: **"quantos BTUs preciso?"**. Quem chega não sabe traduzir metragem, sol, pessoas e equipamentos em capacidade, e a tabela exige que a pessoa já saiba o que filtrar.

Além disso, a interface atual tem atritos acumulados:

1. **Tabela**: as setas de ordenação só aparecem na direção ativa (ou nenhuma), então não se descobre que o cabeçalho é clicável. Falta a coluna **Tipo**, que é uma das primeiras coisas que se quer saber. As colunas têm larguras e alinhamentos irregulares. O selo "Analisado" se confunde com os chips de filtro e o cabeçalho "Analisados por nós · contém links de afiliado" polui a tabela.
2. **Filtros**: o rótulo "Classe A", "Classe B"… ocupa espaço demais, e a barra lateral é longa a ponto de precisar de rolagem interna.
3. **Home**: é só um H1, um parágrafo e um botão. Não apresenta as duas portas de entrada (catálogo e Assistente), não usa capacidades/marcas populares como link interno e não tem conteúdo de busca (FAQ, metodologia).
4. **Análise**: os CTAs são links soltos no texto, e a página não tem um aviso de transparência de afiliados no topo. Falta uma chamada clara para a ficha, para o Assistente e para outros aparelhos da mesma capacidade.

## Solution

1. **Assistente de dimensionamento** em `/assistente/`: um configurador interativo, determinístico e sem IA em runtime, que conduz o visitante por **5 telas** (ambiente, área, sol, pessoas, equipamentos + lâmpadas + janelas), mostra progresso e permite voltar. O resultado traz a **capacidade comercial recomendada**, os fatores usados, o nível de confiança, uma explicação curta e orientações (tipo indicado, Inverter, instalação, vedação e limpeza). O estado inteiro vive na URL, então o resultado é compartilhável.
2. **CTAs do resultado**: cartões dos Aparelhos analisados na capacidade exata, botão para a tabela filtrada e, quando cabível, a alternativa **"duas unidades de Y BTU/h"** (ex.: 24.000 → 2 × 12.000). Sempre há um caminho visível para os Aparelhos analisados.
3. **Tabela**: 7 colunas (Marca, Modelo, Tipo, BTU/h, Consumo, IDRS, Classe), duas setas de ordenação sempre visíveis, números à direita, Classe ao centro, larguras fixas e cabeçalho sticky. O selo passa a ser **"Análise"**, em etiqueta, com a linha destacada; os analisados que não passam nos filtros aparecem no bloco **"Com análise"** acima da tabela, sem alterar a contagem nem a paginação.
4. **Filtros**: chips de Classe só com a letra (A–F) e barra lateral densa em blocos, sem rolagem interna.
5. **Home**: vira um hub com hero, dois cartões grandes ("Ver aparelhos" e "Usar assistente"), faixa de confiança com contagens reais, capacidades e marcas populares, Análises em destaque, chamada do Assistente, FAQ com JSON-LD e metodologia/INMETRO.
6. **Análise**: banner de transparência no topo e 3–4 CTAs em cartão (topo, meio e fim), sempre pelo menos 3, mesmo sem Oferta.

## User Stories

1. As a **visitante que não sabe quantos BTUs precisa**, I want to **responder cinco perguntas simples sobre o meu ambiente**, so that **eu descubra a capacidade ideal sem entender de climatização**.
2. As a **visitante**, I want to **informar a área em m² ou largura × comprimento**, so that **eu use o dado que eu tiver em mãos**.
3. As a **visitante que não sabe as medidas**, I want to **escolher uma referência visual de ambiente pequeno, médio ou grande**, so that **eu não fique travada na primeira pergunta**.
4. As a **visitante**, I want to **dizer como é a incidência de sol (sem sol, manhã, tarde ou dia todo)**, so that **o cálculo considere a carga térmica real do meu ambiente**.
5. As a **visitante**, I want to **informar quantas pessoas usam o ambiente**, so that **o resultado não fique subdimensionado**.
6. As a **visitante**, I want to **contar eletrônicos, lâmpadas e janelas**, so that **o calor gerado e a entrada de sol entrem na conta sem eu precisar saber coeficientes**.
7. As a **visitante**, I want to **voltar e corrigir qualquer resposta**, so that **eu ajuste o resultado sem começar de novo**.
8. As a **visitante**, I want to **ver uma barra de progresso e uma pergunta por tela**, so that **a experiência pareça um configurador, não um formulário técnico**.
9. As a **visitante**, I want to **compartilhar ou recarregar o resultado**, so that **eu possa voltar a ele ou mandar para outra pessoa**.
10. As a **visitante**, I want to **ver a capacidade recomendada em destaque, com os fatores que entraram na conta**, so that **eu confie e entenda a recomendação**.
11. As a **visitante**, I want to **saber o nível de confiança da estimativa**, so that **eu saiba quando o resultado é aproximado**.
12. As a **visitante**, I want to **receber orientações sobre tipo de aparelho, Inverter, instalação, vedação e limpeza**, so that **eu tome uma decisão melhor depois do cálculo**.
13. As a **visitante**, I want to **ver os Aparelhos analisados com a capacidade recomendada**, so that **eu leia uma Análise antes de comprar**.
14. As a **visitante com um ambiente que pede mais de uma unidade**, I want to **ver a alternativa de duas unidades menores** (ex.: 2 × 12.000 em vez de 24.000), so that **eu tenha uma opção prática quando a capacidade exata não existe ou não é analisada**.
15. As a **visitante**, I want to **ir para a tabela já filtrada pela capacidade recomendada**, so that **eu compare os aparelhos sem refazer o filtro**.
16. As a **visitante**, I want to **encontrar os Aparelhos analisados em evidência mesmo quando eles não casam com os filtros que eu apliquei**, so that **eu não perca a Análise por causa de um recorte**.
17. As a **visitante da tabela**, I want to **ver as duas setas em cada coluna ordenável**, so that **eu descubra que dá para ordenar e em qual sentido**.
18. As a **visitante da tabela**, I want to **ver o Tipo do aparelho**, so that **eu saiba se é Split Hi-Wall, Cassete, Piso-teto ou Janela sem abrir a ficha**.
19. As a **visitante da tabela**, I want to **ler os números alinhados e a Classe destacada**, so that **eu compare capacidade, consumo e eficiência rapidamente**.
20. As a **visitante da tabela**, I want to **reconhecer um Aparelho analisado pelo selo "Análise"**, so that **eu não confunda o selo com um filtro**.
21. As a **visitante da tabela**, I want to **ver os analisados no topo dos resultados**, so that **as Análises tenham prioridade na leitura**.
22. As a **visitante dos filtros**, I want to **ver só A, B, C… nos chips de Classe**, so that **o menu fique compacto e a cor já comunique a eficiência**.
23. As a **visitante dos filtros**, I want to **ver todos os filtros sem uma barra de rolagem interna**, so that **eu alcance cada campo sem rolar dentro de um painel**.
24. As a **visitante da home**, I want to **escolher entre "Ver aparelhos" e "Usar assistente" logo na entrada**, so that **eu siga o caminho que faz sentido para mim**.
25. As a **visitante da home**, I want to **ver quantos aparelhos e marcas a base cobre e de onde vêm os dados**, so that **eu confie no site**.
26. As a **visitante da home**, I want to **clicar em capacidades e marcas populares**, so that **eu chegue à tabela já recortada**.
27. As a **visitante da home**, I want to **ler as Análises em destaque**, so that **eu veja conteúdo editorial antes de comprar**.
28. As a **visitante da home**, I want to **tirar dúvidas frequentes sobre BTUs, IDRS, Classe e Split × Janela**, so that **eu entenda os conceitos sem procurar em outro site**.
29. As a **visitante de uma Análise**, I want to **ver um aviso de transparência no topo**, so that **eu saiba que o artigo tem links de afiliado**.
30. As a **visitante de uma Análise**, I want to **encontrar CTAs claros e visualmente confiáveis ao longo do texto**, so that **eu vá para a oferta, para a ficha ou para o Assistente sem caçar link no meio do parágrafo**.
31. As a **visitante de uma Análise sem Oferta cadastrada**, I want to **continuar vendo pelo menos três CTAs úteis**, so that **a página não fique sem caminho de próximo passo**.
32. As a **desenvolvedor**, I want to **um motor de cálculo puro e testável**, so that **os coeficientes não fiquem espalhados na interface e possam ser auditados**.
33. As a **desenvolvedor**, I want to **o resultado ser um Valor calculado, nunca um Valor oficial**, so that **ninguém confunda a estimativa com o dado do INMETRO**.
34. As a **desenvolvedor**, I want to **reusar as costuras de teste existentes** (pipeline, API isomórfica, ilha, build do site), so that **a fase não crie uma arquitetura de testes paralela**.
35. As a **operador do site**, I want to **manter `data/build` e `reports` reproduzíveis byte a byte**, so that **o portão de CI continue valendo**.

## Implementation Decisions

### Assistente — arquitetura

- **Determinístico, sem IA em runtime.** O "agente" do documento é uma persona de atendimento, não um LLM. Não há Worker, chave de API, custo por conversa nem resposta não determinística. A inteligência está na árvore de perguntas e no motor.
- **Uma costura nova de domínio**: um módulo puro que recebe as respostas e devolve a Recomendação do Assistente (capacidade comercial, fatores, confiança, alternativa dividida). A ilha apenas coleta respostas e renderiza; não calcula.
- **Rota `/assistente/`**, item "Assistente" no menu. O `<title>` usa "Calculadora de BTUs" para capturar a busca real; o H1 fala em descobrir a capacidade ideal.
- **Estado na URL**, no mesmo contrato da tabela (ADR-0019): cada resposta vira uma chave (`ambiente`, `area`, `sol`, `pessoas`, `eletronicos`, `lampadas`, `janelas`, e a forma de área escolhida). Recarregar e compartilhar preservam o resultado. Sem `localStorage` e sem cadastro.
- **Uma pergunta por tela**, com barra de progresso, botão "Voltar", cards grandes e navegação por teclado. As cinco telas são: (1) tipo de ambiente; (2) área; (3) incidência de sol; (4) pessoas; (5) equipamentos, lâmpadas e janelas.
- **Adaptação por ambiente**: o tipo não multiplica a conta; ele escolhe o tipo de equipamento indicado e personaliza a explicação. Ambiente integrado pede a área total a ser climatizada; comércio, cozinha ou ambiente integrado com área estimada rebaixam a confiança.
- **Acessibilidade**: cards são botões de verdade, o progresso tem rótulo textual, o foco vai para o título da tela ao avançar e o resultado é anunciado numa região viva.

### Assistente — motor de cálculo

- **Base por m²** conforme a incidência solar: sem sol **600**, manhã **650**, tarde **750**, dia todo **800** BTU/h por m².
- **Pessoas**: a base cobre 1 pessoa; **+600 BTU/h por pessoa adicional**. As faixas usam o limite superior (3–4 → 4; 5–6 → 6; 7 ou mais → 8), para não subdimensionar.
- **Eletrônicos**: **+600 BTU/h por equipamento** (contagem simples, sem separar tipos).
- **Lâmpadas**: **+100 BTU/h por lâmpada**.
- **Janelas**: a base assume até 2; **+200 BTU/h por janela a partir da 3ª** (evita dupla contagem com a incidência solar).
- **Arredondamento**: sempre para a capacidade comercial **imediatamente acima** — 9.000, 12.000, 18.000, 22.000, 24.000, 30.000, 36.000, 48.000, 60.000 BTU/h.
- **Acima de 60.000**: não recomenda um único aparelho; indica mais de uma unidade e sugere avaliação técnica.
- **Alternativa dividida**: quando a capacidade recomendada dividida por 2 for uma capacidade comercial (e ≥ 9.000), o resultado oferece "duas unidades de Y BTU/h" (24.000 → 2 × 12.000; 36.000 → 2 × 18.000; 48.000 → 2 × 24.000; 60.000 → 2 × 30.000; 18.000 → 2 × 9.000).
- **Nenhum fator é aplicado duas vezes.** A tabela de coeficientes fica num só lugar, documentada e coberta por testes de cenário.
- **A recomendação é um Valor calculado**, não um Valor oficial: o resultado sempre mostra os fatores usados, a fórmula resumida, o nível de confiança e o aviso de estimativa. Nunca promete economia de energia.

### Assistente — fallbacks e confiança

- **Área**: aceita m² ou largura × comprimento. Quem não sabe as medidas escolhe uma referência visual — pequeno (~9 m²), médio (~20 m²), grande (~35 m²) — marcada como estimativa.
- **Sol**: "não sei" assume **tarde** (conservador) e o resultado declara a suposição.
- **Confiança alta**: área exata (m² ou dimensões) e todas as respostas informadas.
- **Confiança média**: área vinda de referência visual ou alguma suposição (sol "não sei").
- **Confiança baixa**: comércio, cozinha ou ambiente integrado **com** área estimada; o resultado recomenda avaliação técnica.
- O resultado sempre se declara **estimativa**; em ambiente complexo ou acima de 60.000 BTU/h, recomenda avaliação profissional de carga térmica.

### Assistente — resultado e CTAs

- **Resultado**: capacidade recomendada em destaque, capacidade comercial, resumo dos fatores (área, ambiente, sol, pessoas, equipamentos, lâmpadas, janelas), explicação curta, confiança e orientações (tipo indicado, Inverter, instalação, vedação, limpeza).
- **Tipo indicado**: Split Hi-Wall para quarto, sala, escritório, cozinha e ambientes integrados de porte residencial; Piso-teto ou Cassete para comércio e ambientes maiores. Janela e portátil não são recomendados como primeira escolha.
- **CTAs**: (1) cards dos Aparelhos analisados com a capacidade exata, com link para a Análise; (2) botão "Ver todos os aparelhos de X BTU/h" para a tabela filtrada; (3) quando a alternativa dividida existe, um segundo CTA "Duas unidades de Y BTU/h", apontando para os analisados dessa capacidade e para a tabela filtrada em Y.
- Os cards de analisados são montados **no build** (mapa de analisados e suas capacidades), não no cliente. Com zero Análises, o resultado mantém o botão da tabela e não mostra bloco vazio.
- O link para a tabela usa `?btu=X`, que **não recebe os filtros padrão** (a presença de qualquer chave de filtro desliga o padrão), então a pessoa vê todos os aparelhos daquela capacidade.

### Tabela

- **Colunas**: Marca · Modelo · **Tipo** · BTU/h · Consumo (kWh) · IDRS · Classe. Tipo entra após Modelo, é **somente leitura**, sem setas e fora do seletor "Ordenar por".
- **Setas**: todo cabeçalho ordenável mostra **↑ e ↓** em cinza claro; a direção ativa fica em cor primária e negrito. `aria-sort` continua refletindo o estado. Colunas não ordenáveis não mostram setas.
- **Layout**: tabela com largura fixa e 100% da área útil — Marca 12%, Modelo 30%, Tipo 14%, BTU 10%, Consumo 12%, IDRS 8%, Classe 8%. Marca/Modelo/Tipo à esquerda; BTU/Consumo/IDRS à direita; Classe centralizada. Modelos longos quebram linha; o cabeçalho fica preso no topo ao rolar. Abaixo de 40 rem a tabela continua em cartões (`data-label`).
- **Selo**: o rótulo "Analisado" vira **"Análise"**, numa etiqueta de contorno (não na pílula azul dos chips), com tooltip contendo o título da Análise.
- **Destaque**: as linhas dos analisados ganham fundo levemente destacado e borda de acento à esquerda.
- **Sem cabeçalho de grupo**: saem as linhas "Analisados por nós · contém links de afiliado" e "Demais aparelhos".
- **Analisados e filtros**: os analisados que passam nos filtros continuam como primeiras linhas da tabela, qualquer que seja a ordenação. Os que **não** passam aparecem num bloco compacto **"Com análise"** acima da tabela (até 3, com selo e link), explicitamente fora dos filtros atuais.
- **Contagem e paginação intactas**: a contagem reflete só o resultado filtrado; o "Mostrar mais" continua paginando esse resultado. O bloco "Com análise" não entra na contagem, no "Mostrar mais" nem na ordenação.
- **Afiliados**: a tabela **não** exibe aviso de afiliado. O selo leva para a Análise, e o banner de transparência fica no topo da Análise.

### Filtros

- **Classe**: chips só com a letra (A, B, C, D, E, F), em uma fileira, mantendo as cores curadas. A legenda do grupo é "Classe" e cada botão recebe `aria-label` "Classe A" etc. O `<select>` de classes extras continua quando houver.
- **Layout compacto**: busca em largura total; Marca em grade de 2 colunas de chips + select; Capacidade em grade de 3 colunas + select; Função e Tensão lado a lado; Tipo em largura total com chips em 2 colunas; Classe em uma fileira de 6; Ordenar em largura total com o botão de direção; "Limpar filtros" no rodapé da barra.
- **Sem rolagem interna**: a barra lateral não usa `overflow-y: auto` nem `max-height` que corte conteúdo. Ela é sticky quando cabe na altura da janela; em telas baixas, deixa de ser sticky e rola com a página.
- Todos os filtros, o contrato de URL e os chips existentes (marca, capacidade, função, tipo) permanecem.

### Home

A home passa a ter, nesta ordem:

1. **Hero** com H1 e subtítulo que citam ar-condicionado, dados do INMETRO e comparação de capacidade, consumo e eficiência.
2. **Dois cartões grandes**: "Ver aparelhos" (tabela) e "Usar assistente" (`/assistente/`), com o Assistente em destaque de cor.
3. **Faixa de confiança** com contagens reais derivadas da base (aparelhos, marcas, capacidades) e a Versão da tabela.
4. **Capacidades populares** (9.000 a 36.000) como links para a tabela filtrada.
5. **Marcas populares** (as marcas curadas em `filtros.json`) como links para a tabela filtrada.
6. **Análises em destaque** — o bloco existente, mantido.
7. **Chamada do Assistente** no meio, com "como funciona em 3 passos".
8. **FAQ** com 5–6 perguntas reais, respostas curtas e JSON-LD `FAQPage`.
9. **Metodologia/INMETRO**: de onde vêm os dados, o que são IDRS e Classe, e o caráter oficial dos valores.

- Tudo é gerado no build; a home não baixa `consulta.json`, `analises.json` nem `ofertas.json`.
- Com zero Análises, o bloco de destaques não é renderizado, como hoje.
- Metadados: `<title>` e descrição focados em "ar-condicionado", "BTUs" e "INMETRO"; JSON-LD `WebSite` mantido, `FAQPage` somado.

### Análise

- **Banner de transparência** no topo do conteúdo, antes do corpo do artigo, com o texto exato:

  > **Aviso de transparência**
  >
  > Este artigo contém links de afiliados. Podemos receber uma comissão pelas compras realizadas através desses links, sem custo adicional para você.

- **CTAs em cartão** (nunca link solto como CTA): (1) topo, após o lead — "Ver oferta" quando há Oferta, senão "Ver ficha técnica"; (2) meio do artigo — "Calcular os BTUs do meu ambiente" (Assistente); (3) fim — Oferta (quando houver), "Ver ficha técnica" e "Ver outros de X BTU/h" para a tabela filtrada.
- **Mínimo de 3 CTAs** sempre: com Oferta são 4; sem Oferta, o topo vira ficha e restam ficha + Assistente + tabela. Cada CTA é um cartão/posição (topo, meio ou fim); o cartão final pode reunir mais de uma ação sem virar um CTA extra.
- **Oferta**: o cartão comercial mantém `rel="sponsored nofollow noopener"` e `target="_blank"` e traz a identificação de link de afiliado, coerente com o ADR-0010.
- Os links de navegação interna ("Todas as análises", ficha, tabela) continuam podendo existir no texto, mas os **CTAs** são cartões.
- A Oferta embutida no MDX da Análise atual deixa de ser duplicada: o template garante os cartões e o MDX não repete o mesmo CTA.

### Domínio e documentação

- **CONTEXT.md** ganha **Assistente** e **Recomendação do Assistente**, e atualiza **Aparelho analisado** (selo "Análise", bloco "Com análise", aviso de afiliado fora da tabela).
- **ADR-0020**: "Assistente determinístico com heurística publicada" — sem LLM/Worker, coeficientes fixos, arredondamento comercial, caráter de estimativa.
- `docs/agents/architecture.md`, `README.md` e `docs/agents/project-state.md` são atualizados ao fim da fase.

## Testing Decisions

- **Princípio**: testar comportamento externo (entrada → saída), não detalhes de implementação. Reusar as costuras existentes; a única nova é o motor puro.
- **Motor do Assistente** (costura nova, alta): cenários completos cobrindo cada coeficiente, o arredondamento para capacidade comercial, o teto de 60.000, a alternativa dividida, as faixas de pessoas, os fallbacks de área/sol e os três níveis de confiança. Casos de borda: área mínima, zero eletrônicos/lâmpadas/janelas, 2 janelas (sem adicional) e 3 janelas (com adicional).
- **Ilha do Assistente**: em jsdom, as cinco telas, progresso, voltar, estado na URL (round-trip), resultado renderizado, "não sei as medidas", e o resultado compartilhável.
- **Tabela**: em jsdom, as duas setas em todas as colunas ordenáveis e nenhuma em Tipo; `aria-sort` correto; coluna Tipo exibida; selo "Análise"; bloco "Com análise" com analisados fora do filtro; contagem e "Mostrar mais" inalterados; nenhum texto "Analisados por nós" nem aviso de afiliado.
- **Filtros**: letras A–F com `aria-label`; os seis chips em uma fileira; layout denso refletido no CSS; ausência de `overflow-y: auto`/`max-height` na barra lateral.
- **Home no build**: os nove blocos presentes, contagens derivadas da base, links de capacidades/marcas, dois cartões, FAQ visível e JSON-LD `FAQPage` válido; estado zero de Análises sem bloco de destaques.
- **Análise no build**: banner com o texto exato; 3 CTAs sem Oferta; 4 com Oferta; nenhum CTA em formato de link solto; Oferta com `rel`/`target` corretos.
- **Build**: `pnpm build` reproduz `data/build` + `reports` byte a byte; `pnpm build:site` passa de **2.231** para **2.232** páginas (a nova `/assistente/`); `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes.
- **Prior art**: testes de `apps/site/test/consulta.test.tsx` (ilha em jsdom), `analises-build.test.ts` (build ponta a ponta com fixture) e `estado.test.ts` (round-trip de URL).

## Out of Scope

- **Guias** como novo tipo de conteúdo — a home aponta para Análises, capacidades e marcas; os Guias ficam para outra fase.
- **LLM/chat em runtime**, backend novo ou retorno do Worker (ADR-0011).
- **Consumo e custo estimados** no resultado do Assistente — o resultado não compete com os Valores oficiais do INMETRO.
- **Lista de aparelhos recomendados** no resultado (ranking) — só os analisados e o link para a tabela.
- Mudanças na **ficha técnica** (`/aparelhos/[id]`) além do que já existe.
- Mudanças no **pipeline** ou no **dataset de consulta** — nenhum campo novo em `data/build`.
- Verificação de links de Ofertas, migração de domínio e analytics de agente.
- Paginação numerada — continua o "Mostrar mais".

## Further Notes

- **Natureza da estimativa**: o cálculo é uma heurística de mercado, não um cálculo de carga térmica. O resultado e a documentação devem dizer isso sem rodeios. Os coeficientes ficam num só lugar e são auditáveis.
- **Contagem de páginas**: hoje 2.231 (2.229 da Fase 8 + índice e página da primeira Análise). A Fase 9 acrescenta `/assistente/` e chega a **2.232**.
- **Artefatos**: `data/build` e `reports` não mudam; continuam precisando bater byte a byte com `pnpm build`. `apps/site/dist` é ignorado pelo git e regenerado no build.
- **Filtros padrão**: o link do Assistente usa `?btu=…`, que desliga o padrão (Split Hi-Wall + 220 V + Classe A) pela regra do ADR-0019.
- **Analisados**: hoje há uma Análise publicada. O bloco "Com análise" e os cards do resultado precisam se comportar bem com zero, uma ou várias.
- **Ordem de implementação**: 41 (Assistente ponta a ponta) → 42 (CTAs) → 43–45 (tabela e filtros) → 46 (home) → 47 (análise) → 48 (validação).
- **ADRs respeitados**: ADR-0008 (ilha de consulta), ADR-0010 (Ofertas site-only e divulgação), ADR-0015 (Análises separadas da ficha), ADR-0016 (Marca de catálogo), ADR-0018 (Classe/IDRS oficiais), ADR-0019 (contrato de URL e filtros padrão).
