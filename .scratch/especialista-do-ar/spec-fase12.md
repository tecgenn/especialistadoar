# Redesign — Instrumento de Climatização

**Status:** ready-for-agent
**Escopo:** todas as rotas, layouts, componentes e estados responsivos do site Astro.
**Contrato visual:** `DESIGN.md` na raiz do repositório.
**Tracker:** local, `.scratch/especialista-do-ar/` — spec `spec-fase12.md`, tickets **#66–#110** (o `#91` corre antes do `#69`; os **#92–#110** redesenham a home depois do `#71`, e o `#110` fecha essa série).

**Contrato vigente:** o `DESIGN.md` atual é a fonte normativa — paleta azul-frio/gelo do #92, acento ciano do #102, Oferta com badge oficial do #106 e Análises em grade do #108. As descrições antigas de âmbar, escala térmica e régua de capacidade foram substituídas neste documento; o histórico das mudanças fica nas notas de revisão dos tickets 91–110.

---

## Contexto e auditoria

### O que foi inspecionado

- Site em produção `https://especialista-do-ar.pages.dev`, em desktop (1440×900) e celular (390×844): `/`, `/aparelhos/`, `/aparelhos/ap-adc70ca55429/`, `/comparar/?ids=…`, `/assistente/`, `/analises/samsung-windfree-ai-pro-12000-analise/`, `/contato/`.
- Código: `apps/site/src` (layout, 10 arquivos de rota, 11 componentes, 4 ilhas React, 2.624 linhas de CSS), `packages/api` e `packages/pipeline` como contratos de dados.
- Dados reais: 2.227 Aparelhos, 70 Marcas de catálogo, 44 capacidades; faixas 368 / 492 / 324 / 362 / 197 / 487; Classes A 1.788, B 194, C 70, D 11, E 102, F 66; tipos Split Hi-Wall 1.465, Cassete 309, Piso-teto 276, Janela 177; nenhum Aparelho sem consumo; maior consumo anual 4.397 kWh.
- Documentação: `CONTEXT.md`, `docs/agents/architecture.md`, ADRs 0001–0023, `docs/agents/project-state.md` (Fase 11 concluída, 2.236 páginas, 663/663 testes).

### O que já funciona e deve ser preservado

- A base é completa e confiável: dados oficiais do INMETRO, curadoria de marcas/capacidades, Ofertas validadas no build, tarifas por UF, uma Análise editorial real.
- O estado vive na URL e é reconstruível: `q`, `marca`, `tipo`, `btu`, `btuMin`, `btuMax`, `funcao`, `classe`, `tensao`, `ordem`, `dir`, `ids`, `uf`, `tarifa`, `horas`, `dias`.
- A arquitetura está correta: Astro estático, HTML crawlável, ilhas React isoladas, artefatos JSON publicados, pipeline separado.
- A acessibilidade básica existe: landmarks, `aria-live`, rótulos, foco visível em vários controles, testes de ilha em jsdom.
- O conteúdo editorial e a metodologia são um ativo: FAQ, explicação de IDRS/Classe, condições de ensaio, cálculo aberto, avisos de estimativa e de afiliado.

### Fraquezas que o redesign resolve

1. **Identidade visual ausente.** `system-ui`, azul `#0369a1`, fundo `#f8fafc`, cartões brancos com sombra leve e bordas `#e2e8f0`. O site parece um painel administrativo genérico, não um instrumento de clima.
2. **Hierarquia espacial fraca.** Header, main e footer compartilham o mesmo teto de 64 rem; a tabela usa 72 rem por exceção. Não há grade, régua, ritmo vertical ou contraste de escalas entre páginas.
3. **Home como lista de links.** Hero, dois cartões, contagens, duas listas de chips, destaques, passos e FAQ empilham sem um eixo narrativo. A cobertura da base é texto, não instrumento.
4. **Catálogo denso sem sinal.** A barra de filtros, os chips, a ordenação e a tabela competem; a leitura de uma linha não tem hierarquia (marca, modelo, capacidade, consumo, IDRS e Classe com o mesmo peso).
5. **Ficha longa e plana.** Etiquetas, cartões, índice, resumo, explicadores, calculadora, condições, especificações, registros, proveniência e ofertas usam o mesmo bloco visual; a calculadora não parece um instrumento.
6. **Comparação sem linguagem própria.** Os cartões de seleção, a matriz e o painel de custo não têm contraste de superfície; a matriz não deixa claro o que é atributo e o que é leitura.
7. **Assistente genérico.** Trilho de progresso, cartões e resultado não comunicam medição; a leitura final não tem o peso de um diagnóstico.
8. **Análise editorial sem voz visual.** A serifa não é usada; o texto corrido, as figuras, as citações e os CTAs têm o mesmo tratamento da interface.
9. **Institucionais e 404 sem desenho.** As três páginas institucionais são blocos de texto; não há 404.
10. **Ausências técnicas de acabamento.** Sem fontes próprias, sem `prefers-reduced-motion`, sem `@media print`, sem `aria-current`, sem Open Graph/Twitter, sem `BreadcrumbList`, sem orçamento de performance documentado.

### Restrições

- Não trocar o framework, não adicionar runtime de UI, não mover conteúdo para o cliente, não criar backend.
- Não alterar URLs, contratos de query, canonical, JSON-LD existente, sitemap, dados publicados, cálculos, regras de Oferta ou rastreamento de afiliado.
- Não editar `data/build/` nem `reports/`; eles são derivados e verificados pelo CI.
- Manter os nomes de classe existentes sempre que possível: quatro ilhas React e 663 testes dependem deles.
- Preservar o comportamento do filtro implícito de 220 V e a contagem de 2.116 linhas no recorte padrão.
- Sem dark mode nesta fase; sem biblioteca de animação; sem imagem gerada por IA; sem fotografia inventada.

---

## Problem Statement

O Especialista do Ar tem a substância de um produto de referência — a base oficial do INMETRO inteira, ferramentas de decisão e conteúdo editorial —, mas a superfície não comunica essa autoridade. O visitante encontra um site visualmente genérico, com hierarquia fraca entre catálogo, ficha, comparação e análise, e sem um sistema que transforme densidade de dados em leitura confiável. A experiência funciona, mas não parece um instrumento; parece um template.

Isso custa confiança justamente no momento em que o visitante decide: ao comparar consumo, IDRS e Classe, ao ler uma ficha técnica longa ou ao estimar o custo de energia. O redesign precisa fazer a substância visível sem sacrificar URL, SEO, acessibilidade, performance ou a neutralidade editorial.

## Solution

Substituir o mundo visual atual por **um instrumento de climatização**: uma superfície calibrada e neutra, com grade visível, leituras em mono, serifa editorial, ação em azul-frio e um único acento ciano de interação. A home abre com um **simulador de ambiente** no hero, que estima a capacidade a partir da área e do sol com as contagens reais da base; o catálogo vira uma tabela de instrumento com barra de ferramentas sticky; a ficha vira um datasheet navegável com topo de leituras e calculadora em painel; a comparação vira uma matriz neutra com cartões de instrumento; o Assistente vira um diagnóstico em cinco etapas; a análise vira leitura editorial de verdade.

O resultado deve parecer desenhado por uma equipe de produto e engenharia, não gerado por IA: cada ornamento tem função, cada número tem unidade e origem, cada superfície pertence ao mesmo sistema.

### Direção de arte

**"Instrumento de climatização"** — um painel de HVAC/pesquisa calibrado, enraizado na engenharia climática brasileira, no rigor de datasheet oficial e na autoridade editorial.

- **Chão:** giz `#FDFDFB`, papel `#F8F8F7`, mineral `#ECECEB`, tinta petróleo (`#0A1F22`), petróleo (`#123F45`), grafite (`#4B5D5F`).
- **Ação e sinal:** azul-frio (`#0E6B8A`) na ação primária, nos links e nos chips ativos; ciano (`#0F8FA8`, com `--foco-texto` `#0B6F83` para texto) no foco, na seleção, no item ativo, na linha analisada e no dado analisado. Frios de apoio em `--frio`.
- **Matéria:** quase nenhuma sombra; hairlines de 1 px, ticks, réguas de seção, numeração, bordas de 2 px só em seleção/foco.
- **Forma:** raios 2/4/8 px; nenhum pill; nenhum gradiente de fundo; nenhum vidro.
- **Vozes:** Schibsted Grotesk (operar), Source Serif 4 (ler), Azeret Mono (medir).
- **Assinatura:** o simulador de ambiente do hero e as Cores de Classe A–F como únicos dados coloridos; o resto é tinta, grafite e ciano de sinal.
- **Anti-referências:** SaaS azul, dashboard genérico, landing page de startup, "organic biophilic" verde, cartões flutuantes, glassmorphism, ilustrações decorativas, rankings com estrelas.

Mundos considerados e recusados: grade suíça de Crouwel (competitiva, doou a disciplina da grade visível), manuscrito técnico, teletexto, ASCII, papercut e noite de chuva (doaram uma disciplina cada: entrada única, leituras numeradas, gradiente térmico, camadas de filtro). A direção escolhida é a que melhor carrega **medição + confiança + decisão** sem virar fantasia.

### Princípios de experiência

1. **Mostre o número, depois explique.** Unidade, origem e fórmula sempre visíveis.
2. **Oficial e calculado são materiais diferentes.** A distinção é visual e textual, nunca só uma legenda.
3. **Densidade é recurso.** A tabela não perde linhas, colunas ou escaneabilidade por decoração.
4. **Um caminho da curiosidade ao shortlist.** Buscar → dimensionar → comparar → ler → decidir, sem beco sem saída.
5. **Autoridade calma.** A confiança vem de calibração e consistência, não de ruído.
6. **Nada é inventado.** Sem produto, preço, prova social, estatística ou imagem fictícia.

## User Stories

1. Como comprador pesquisando um ar-condicionado, quero abrir o catálogo e entender em segundos o que a tabela contém, para decidir se vale explorar.
2. Como comprador que já conhece o modelo, quero buscar por marca ou modelo, para chegar à linha certa sem rolar 2.227 registros.
3. Como comprador indeciso sobre capacidade, quero filtrar por faixa de BTUs, para ver só os aparelhos que cabem no meu ambiente.
4. Como comprador que sabe a capacidade exata, quero selecionar 12.000 BTU/h, para comparar modelos equivalentes.
5. Como comprador atento à conta de luz, quero filtrar por Classe e ordenar por consumo, para priorizar eficiência.
6. Como instalador, quero filtrar por tensão e tipo, para encontrar o aparelho compatível com a instalação.
7. Como visitante no celular, quero continuar lendo uma tabela de verdade, com as colunas de seleção e Modelo fixas e o resto rolando na horizontal, para comparar linhas sem perder a estrutura.
8. Como comprador, quero marcar até três modelos e ver a seleção preservada ao mudar filtros, para não perder o trabalho.
9. Como comprador, quero abrir uma comparação por link e reencontrar a mesma seleção, para compartilhar com outra pessoa.
10. Como comprador, quero comparar capacidade, consumo, IDRS, Classe e tensão lado a lado, para entender as diferenças reais.
11. Como comprador, quero aplicar meu cenário de uso (UF, tarifa, horas, dias) aos modelos comparados, para dimensionar o custo mensal.
12. Como comprador, quero ver a diferença de custo anual em uma frase factual, para saber a ordem de grandeza sem um "vencedor" inventado.
13. Como comprador, quero que o site avise quando as capacidades comparadas são diferentes, para não confundir custo menor com eficiência.
14. Como visitante técnico, quero abrir a ficha e ver IDRS, consumo e capacidade como leituras principais, para avaliar o modelo antes de rolar.
15. Como visitante técnico, quero ver Classe, Situação e Registro INMETRO no topo, para conferir a procedência.
16. Como visitante técnico, quero entender o que é IDRS, Classe, consumo anual e Situação, para interpretar os números sem sair da página.
17. Como visitante técnico, quero consultar as condições de ensaio por Variante, para saber em que base o número foi medido.
18. Como visitante técnico, quero imprimir a ficha com os valores atuais e a versão da tabela, para levar o datasheet a uma conversa de instalação.
19. Como comprador, quero estimar o custo mensal com a tarifa da minha UF, para comparar com a minha conta.
20. Como comprador, quero ver a conta aberta passo a passo, para confiar no resultado e saber o que mudou.
21. Como comprador que não sabe quantos BTUs precisa, quero responder cinco perguntas e receber uma capacidade recomendada com os fatores usados, para dimensionar o ambiente.
22. Como comprador, quero ver a confiança da recomendação e as suposições, para saber quando procurar um técnico.
23. Como leitor de análise, quero ler o artigo em uma coluna confortável, com figuras e legendas, para avaliar o modelo com contexto.
24. Como leitor de análise, quero saber que o artigo tem links de afiliado e que os dados oficiais vêm do INMETRO, para separar opinião de dado.
25. Como visitante novo, quero entender a cobertura da base na home, para confiar que o catálogo é completo.
26. Como visitante novo, quero usar o simulador de ambiente como ponto de partida, para chegar direto ao recorte de capacidade que me interessa.
27. Como visitante novo, quero ler as perguntas frequentes sem abrir um modal, para tirar dúvidas básicas.
28. Como visitante, quero falar com o site por e-mail com o assunto certo já preenchido, para não perder tempo.
29. Como visitante, quero entender o que o site coleta e como as Ofertas funcionam, para decidir com transparência.
30. Como visitante que errou a URL, quero uma página 404 útil que me leve de volta ao catálogo ou ao Assistente.
31. Como pessoa que usa teclado, quero operar filtros, tabela, comparação, Assistente e calculadora sem mouse, para concluir a tarefa.
32. Como pessoa que usa leitor de tela, quero landmarks, rótulos, estados e resultados anunciados, para saber onde estou e o que mudou.
33. Como pessoa com baixa visão, quero zoom de 200% e contraste AA sem perda de conteúdo, para ler confortavelmente.
34. Como pessoa sensível a movimento, quero desligar animações e manter todo o conteúdo, para navegar sem desconforto.
35. Como visitante em conexão lenta, quero que a página carregue rápido e não salte, para não desistir antes de ler.
36. Como mecanismo de busca, quero HTML semântico, canonical, metadados e JSON-LD válidos, para indexar e exibir o conteúdo corretamente.
37. Como agente de IA consumidor da base, quero que os arquivos JSON e as URLs continuem iguais, para não quebrar integrações.
38. Como mantenedor, quero adicionar uma Análise ou uma Oferta sem tocar no sistema visual, para publicar conteúdo com segurança.
39. Como mantenedor, quero atualizar a Versão da tabela sem que o layout quebre, para manter o site confiável.
40. Como visitante que recebeu um link com filtros, quero que a URL abra exatamente o mesmo recorte, para retomar a pesquisa.

---

## Rotas e inventário de componentes

| Rota | Função | Ilha / componente principal | JSON-LD atual |
| --- | --- | --- | --- |
| `/` | Hub: cobertura da base, caminhos, capacidades/marcas, destaques, link para o Assistente, FAQ, metodologia | Astro puro + `HomeDestaquesPorCapacidade`, `AnalisesDestaque` | `WebSite`, `FAQPage` |
| `/aparelhos/` | Catálogo completo com filtros, ordenação, seleção e vitrine de análises | `Consulta` (`client:load`) | `CollectionPage` |
| `/aparelhos/[id]/` | Ficha/datasheet de um Aparelho | `CalculadoraCusto` (`client:load`), `OfertaFaixa` | nenhum (adicionar `BreadcrumbList`) |
| `/comparar/` | Comparação de até 3 Aparelhos | `Comparar` (`client:load`) | nenhum |
| `/assistente/` | Dimensionamento em 5 etapas | `Assistente` (`client:load`) | `WebApplication` |
| `/analises/` | Índice editorial (condicional) | Astro puro | nenhum |
| `/analises/[slug]/` | Artigo editorial em MDX | Astro + `<Content />`, `CtaCartao`, `OfertaCta` | `Article` |
| `/contato/` | Contato por e-mail com assunto | Astro puro | nenhum |
| `/politica-de-privacidade/` | Política | Astro puro | nenhum |
| `/termos-de-uso/` | Termos | Astro puro | nenhum |
| `404` | Página de erro | Astro puro (novo) | nenhum |

Componentes existentes: `Base.astro`, `Consulta.tsx`, `Comparar.tsx`, `Assistente.tsx`, `CalculadoraCusto.tsx`, `CamposCusto.tsx`, `useCusto.ts`, `OfertaCartao.astro`, `OfertaCta.astro`, `OfertaFaixa.astro`, `CtaCartao.astro`, `AnalisesDestaque.astro`, `HomeDestaques.astro` e `SimuladorHero.tsx`.

Primitivos já entregues em `components/primitivos/` (Astro, sem hidratação): `Aviso`, `Botao`, `CabecalhoDeSecao`, `Campo`, `ChipFiltro`, `ChipResumo`, `EstadoVazio`, `EtiquetaClasse`, `Icone`, `Leitura`, `LogoLoja`, `ReguaSecao`, `Selecao`, `Trilha`. Ainda pertencem aos tickets de página: o breadcrumb (ficha e Análise, #75/#86) e o cabeçalho de impressão (#78).

---

## Especificação página por página

### 1. Shell global (`Base`)

**Objetivo:** dar a todas as rotas a mesma moldura calibrada e o mesmo contrato de metadados.

- `<html lang="pt-BR">`, skip link, header, main, footer.
- Header de 64/72 px: marca, navegação com `aria-current="page"` e sublinhado ciano de 2 px no item ativo. No celular, navegação em faixa horizontal com rolagem; nenhum item escondido.
- Footer em **azul-frio escuro** (`--azul-frio-escuro`, `#084D66`) com texto giz, em três colunas iguais a partir de 1024 px: proveniência e **Versão da tabela** (única por página, em mono de 0,75 rem com `tabular-nums`), navegação institucional com alvos de 44 px e o bloco único **"Transparência com o Leitor"**, que absorve a nota de afiliado. Abaixo de 1024 px empilha com a proveniência primeiro; rótulos e textos secundários usam `--mudo-escuro` (`#A9C0C6`), e os links são giz com sublinhado hairline-escura e hover ciano.
- `main` com largura de shell (90 rem) ou leitura (68 ch) por prop; a ficha e o catálogo usam shell; artigos e institucionais usam leitura.
- Metadados: title, description, canonical, `og:type`, `og:title`, `og:description`, `og:site_name`, `og:locale`, `twitter:card`, `theme-color`, `robots` quando aplicável. `og:image` só quando houver imagem real (Análise).
- JSON-LD existente preservado; `BreadcrumbList` novo na ficha e na Análise.
- Fontes: três famílias self-hosted, subconjunto latino, pré-carregar apenas a grotesca 400; `font-display: swap`; fallback métrico para evitar CLS.
- `@media print` global para a ficha.
- Estados: página normal, página ampla, artigo, 404, impressão.

**Aceite:** todas as rotas mantêm title/description/canonical; header e footer aparecem em 2.236+ páginas; skip link é o primeiro foco; `aria-current` correto; nenhuma mudança de URL.

### 2. Home (`/`)

**Objetivo:** provar a direção em uma tela e levar a três caminhos: simulador, catálogo e Assistente.

**Estrutura final da home:**
1. **Hero:** H1 “Seu conforto começa pela escolha certa”, lead funcional em serifa e CTA único “Encontrar meu ar ideal →” ancorado no simulador. Sem fita de versão acima do H1.
2. **Simulador do hero** (`id="simulador"`): área e incidência de sol, capacidade recomendada em leitura grande, a conta aberta em três linhas e a contagem do catálogo para aquela capacidade; ações para `/assistente/` (com `forma`, `area` e `sol`) e `/aparelhos/?btu=`.
3. **Aparelhos em destaque:** uma única seção, com o seletor de capacidade no cabeçalho (chips quando há 2+ capacidades, rótulo estático com uma) e cartões separados; cada cartão tem leitura de IDRS e consumo, “Ler análise” quando existe e uma linha de Oferta por loja.
4. **Análises em destaque:** grade estática das até três Análises mais recentes, com “Todas as análises →” no cabeçalho; sem carrossel e sem script.
5. **Perguntas frequentes:** oito `<details>` nativos, fechados por padrão, em grade de duas colunas a partir de 900 px.
6. **Metodologia e INMETRO:** oito `<details>` nativos na mesma grade compacta; a nota de fontes vive na Proveniência do rodapé.

**Mobile:** hero em uma coluna com o CTA empilhado; simulador com chips de 44 px; cartões de 1 → 2 → 3 colunas; FAQ e metodologia em uma coluna; nenhum carrossel.

> **Revisão (2026-11-21, ticket 94):** a régua de capacidade foi **removida da home** nos dois breakpoints. O simulador do ambiente do #93 é a única leitura de escala da primeira tela e a página segue dele para os Aparelhos em destaque. A navegação por faixa (`?btuMin=&btuMax=`) continua nos chips de Faixa de capacidade da Pesquisa avançada do catálogo; a entrada editorial por faixa da home nasceu no #96 e foi consolidada no #107. A estrutura final da home está descrita acima e no `DESIGN.md`.

> **Revisão (2026-11-21, ticket 95):** a fita `BASE INMETRO · VERSÃO {hash}` foi **removida**, e a cobertura e a metodologia não repetem a versão. A linha da **Versão da tabela** — hash curto, data de obtenção e contagem de linhas quando disponível — aparece uma única vez por página, no rodapé, em mono de 0,75 rem com tabular-nums. A data na nota do "Modelo fora da tabela atual" permanece: é o estado da análise, não a linha de versão.

> **Revisão (2026-11-21, ticket 97):** A seção de Análises em destaque chegou a ser um carrossel com o #97. **Decisão substituída pelo #108:** a seção passou a ser uma grade estática das até três Análises mais recentes, sem carrossel, sem script e sem controles; `carrossel.ts` e o script da seção foram removidos. A proibição de carrossel continua valendo para o resto do site. Ver `DESIGN.md`, seção "Análises em destaque (home)".

> **Revisão (2026-11-21, ticket 98):** "Assistente em 3 passos (régua numerada, CTA)" foi **removido da home**. A seção só repetia a estimativa de 20 m² do simulador do hero, sem trazer os fatores que ele não pergunta, a conta aberta fator por fator ou a confiança. O caminho para o Assistente completo continua na nota do simulador e agora também na metodologia, que explica o que a ferramenta acrescenta. Ver `DESIGN.md`, seções "Simulador do hero" e "Assistente".

> **Revisão (2026-11-21, ticket 99):** a metodologia não fica mais como texto longo exposto. Ela passa a ser uma lista de **`<details>` nativos** (oito tópicos, fechados por padrão), com o texto editorial preservado palavra por palavra e a nota de fontes em mono fora dos `details`. O `FAQPage` não muda: ele descreve o FAQ, não a metodologia. Ver `DESIGN.md`, seção "Metodologia e INMETRO (home)".

> **Revisão (2026-11-21, ticket 100):** o rodapé passa a ter **três colunas no desktop** (a partir de 1024 px) e empilha no celular com a proveniência primeiro. A nota de afiliado deixa de ser um aviso solto e vira o bloco único **"Transparência com o Leitor"**, com as palavras do projeto: independência do INMETRO e do Procel, venda indireta, preços em lojas parceiras e comissão sem custo adicional para o visitante. A Versão da tabela continua aqui, em mono pequeno e uma única vez por página (ticket 95). Ver `DESIGN.md`, componente "Rodapé".

> **Revisão (2026-11-22, tickets 102–110):** a home é redesenhada com acento ciano `#0F8FA8` em vez do âmbar. O H1 passa a ser “Seu conforto começa pela escolha certa”, com lead funcional “Descubra quantos BTUs seu ambiente precisa e compare modelos de ar-condicionado por capacidade, consumo e eficiência energética, com base em dados oficiais do INMETRO.” e CTA “Encontrar meu ar ideal →” ancorado no simulador. O simulador ganha título “Descubra quantos BTUs o seu ambiente precisa”, rótulo de resultado “Capacidade recomendada” e ações para `/assistente/` (pré-preenchido com área e sol) e `/aparelhos/?btu=`. A faixa “Cobertura da base” é removida do meio da home; nenhuma contagem da base é repetida em outro lugar. Os aparelhos em destaque passam a ter seletor de capacidade em chips e cartões separados, sem contagem nem “Ver os de …”, com badges de loja em SVG oficial e cores da marca, com “Ver oferta” fora do badge e o aviso de afiliado no tooltip/nome acessível. As análises em destaque viram grade estática de no máximo 3 mais recentes + “Todas as análises”; o carrossel é excluído. O FAQ e a Metodologia tornam-se grades de dois colunas de `<details>` compactos, que abrem no clique e preservam o texto. A linha de Fontes passa para o rodapé (coluna Proveniência). Os ícones de linha funcionais (ar-condicionado, análise, perguntas, camadas, sol) e as logos de marketplace entram na grade existente. Tickets: `102-acento-ciano-icones-secao`, `103-home-hero-escolha-certa`, `104-home-simulador-hierarquia`, `105-home-remover-cobertura-base`, `106-ofertas-logos-divulgacao-minima`, `107-home-aparelhos-seletor-cartoes`, `108-home-analises-grade-cartoes`, `109-home-faq-metodologia-compactas`, `110-home-qa-fechamento-fase12`.

**Estados:** base carregada no build (não há estado vazio); sem Análise publicada, a seção de destaques desaparece; capacidade sem Aparelho em destaque não vira chip nem painel vazio; sem Oferta, o cartão não mostra CTA.

**SEO:** preservar H1, description, `WebSite` e `FAQPage` com as mesmas oito perguntas; `FAQPage` só com conteúdo visível.

> **Alinhamento pós-revisão (2026-11-24):** "Como comparar o consumo de energia?" saiu do FAQ para cumprir este contrato de oito perguntas. `PERGUNTAS_FREQUENTES`, `FAQPage`, índice `01`–`08`, testes e `DESIGN.md` descrevem as mesmas oito perguntas; o texto restante e a ordem continuam os mesmos.

**Aceite:** o simulador usa contagens derivadas do dataset, não números à mão, e as ações levam ao recorte correto em `/aparelhos/` e ao Assistente pré-preenchido; mobile sem overflow horizontal; o texto do FAQ é idêntico ao JSON-LD.

### 3. Catálogo (`/aparelhos/`)

**Objetivo:** transformar 2.227 linhas em uma superfície de leitura e recorte, sem perder densidade.

**Topo:** H1, uma frase de escopo com a contagem, e a barra de ferramentas.

**Barra de ferramentas (sticky):**
- Busca em largura total com ícone e atalho `/`.
- Botão “Pesquisa avançada” com `aria-expanded` e contador de filtros ativos.
- Chips do recorte efetivo, incluindo o padrão implícito de 220 V; “×” remove só aquele filtro.
- Contagem `N aparelhos` e ordenação com direção explícita.
- Dock de seleção quando `ids` tem 1–3 itens.

**Tabela:**
- Colunas: seleção, Marca, Modelo (com `Função · Tensão`), Capacidade, Consumo, IDRS, Classe, Tipo, Análise.
- Cabeçalho ordenável com seta, `aria-sort` e alvo de 44 px.
- Linha analisada com marcador ciano de 2 px (`--foco`) e selo “Análise” discreto.
- Classe como etiqueta com letra e cor; nunca só cor.
- “Mostrar mais” em blocos de 50, com contagem restante.
- Mobile: a tabela continua tabela. Um contêiner de rolagem horizontal (focável, `tabindex="0"`, `role="region"` com rótulo) mantém todas as colunas; seleção e Modelo ficam fixas à esquerda com `position: sticky`; o cabeçalho acompanha a rolagem vertical. Aviso textual “Deslize para ver as colunas” aparece abaixo de 900 px e some após a primeira rolagem quando houver suporte a animação dirigida por rolagem; nenhum JS novo. Nenhuma linha vira cartão e nenhuma coluna é escondida.

**Painel avançado:**
- Duas faixas: **Aparelho** (Marca, Tipo, Função) e **Desempenho** (Capacidade, Classe, Tensão).
- Desktop: embutido; mobile: sobreposto, com rolagem interna e rodapé fixo “Ver N resultados”.
- Rodapé com “Limpar filtros” só fora do padrão.
- Foco preso no painel mobile enquanto aberto; `Esc` fecha; retorno de foco ao botão.

**Vitrine “Aparelhos com análise”:** fora da tabela, acima dela; cartões horizontais com imagem/título/capacidade; legenda quando só há similares; nunca entra na contagem, ordenação ou paginação.

**Estados:** carregando (esqueleto de linhas, não texto solto), erro de rede (alerta com ação “Tentar de novo”), recorte vazio (estado vazio com “Limpar filtros” e sugestão de faixa), seleção cheia (aviso e checkboxes desabilitados), ids descartados (aviso com contagem).

**Mobile:** barra em duas linhas; filtros em painel; tabela com rolagem horizontal contida no próprio contêiner; a página nunca rola na horizontal; alvos de 44 px preservados.

**SEO:** `CollectionPage` preservado; o HTML inicial contém o H1, a descrição e a estrutura; a tabela é progressive enhancement (sem JS, a página continua indexável e o estado vazio explica). Não introduzir conteúdo crítico só no cliente.

**Aceite:** filtro padrão de 220 V intacto; contagem padrão 2.116; todas as combinações de URL continuam funcionando; seleção preservada ao mudar filtro; teclado opera tudo; 44 px de alvo no mobile.

### 4. Ficha (`/aparelhos/[id]/`)

**Objetivo:** um datasheet navegável, confiável e imprimível.

**Topo:**
- Breadcrumb “Aparelhos / Marca / Modelo”.
- H1 `Marca — Modelo`.
- Linha de etiquetas: Classe (faixa quando divergir), Situação, Registro(s).
- Ações: “Comparar este modelo” (secundária) e “Imprimir ficha” (texto).
- Três leituras: IDRS, Consumo anual, Capacidade, com unidade, legenda e faixa quando houver Variantes. O consumo é link para `#consumo-e-custo`.

**Índice:** faixa horizontal sticky no desktop; lista quebrada no mobile; seção atual com barra ciano de 2 px (`--foco`); âncoras com `scroll-margin-top`.

**Seções na ordem:** Resumo, Entenda os números, Consumo e custo, Condições de ensaio, Especificações, Registros INMETRO, Proveniência, Leia a análise, Ofertas, “Ver outros da marca”.

**Resumo:** `<dl>` em duas colunas com hairlines; capacidade, IDRS, Classe, consumo anual, potência em espera.

**Entenda os números:** quatro `<details>` fechados, com abertura por teclado, texto preservado.

**Consumo e custo:** painel de instrumento; campos UF, tarifa, horas e dias; leitura grande do custo mensal; custo anual e consumo mensal; conta aberta numerada; aviso de estimativa; referência e fonte da tarifa.

**Condições de ensaio:** uma tabela por Variante, com condição, carga total e parcial; notas de linhas da tabela em mono; no mobile a mesma tabela rola na horizontal dentro do contêiner, com a primeira coluna fixa.

**Especificações e Registros:** `<dl>` e lista; números em mono; status com etiqueta.

**Proveniência:** linhas da tabela, versão, origem INMETRO e nota de que são Valores oficiais.

**Ofertas:** faixa separada por hairline, com transparência; nunca dentro de dados técnicos.

**Impressão:** header/footer reduzidos, topo com marca/modelo/versão, seções sem sticky, calculadora com os valores atuais, links visíveis, Ofertas mantidas com o aviso, quebras de página antes de Condições e Especificações.

**Estados:** sem consumo (calculadora explica a ausência), sem Registros (seção omitida), sem Oferta (seção omitida), múltiplas Variantes (faixas em todos os números), Aparelho ausente na versão (a Análise trata; a ficha não existe).

**SEO:** canonical preservado; `BreadcrumbList`; title e description atuais mantidos; nenhuma informação crítica só em canvas.

**Aceite:** todos os valores continuam vindo do dataset; a calculadora mantém o contrato de URL; a ordem do índice corresponde ao DOM; impressão legível em A4; nenhum dado oficial é arredondado de forma diferente.

### 5. Comparação (`/comparar/`)

**Objetivo:** confrontar 2–3 Aparelhos com neutralidade e legibilidade.

**Topo:** H1, frase de escopo, aviso de que a comparação fica na URL.

**Slots:** três cartões de instrumento; cada um com Marca em mono, Modelo em grotesca, capacidade/tipo, custo (quando há painel), CTA de Oferta na área de ações, “Trocar” e “Remover”. Slot vazio é um campo de busca com combobox e sugestões.

**Painel de custo:** aparece com 2–3 modelos; campos compartilhados; método e aviso de estimativa; no mobile, acima dos cartões.

**Matriz:** atributos à esquerda; uma coluna por modelo; linhas de seção em tinta; valores em mono tabular; faixa quando houver Variantes; travessão para ausente. Sem destaque de “melhor”. Diferença de custo anual em frase factual abaixo. Aviso quando as capacidades diferem.

**Estados:** vazio (sem modelos), um modelo (convite), dois ou três (matriz), ids inválidos (aviso de descarte), carregando, erro de rede, modelo sem Oferta (sem CTA).

**Mobile:** matriz rola na horizontal com a primeira coluna fixa e indicador “deslize”; cartões empilham; ações com 44 px.

**SEO:** canonical sem `ids`; não indexar comparações específicas; conteúdo inicial explica a função mesmo sem JS.

**Aceite:** `?ids=` preservado em todas as operações; limite de 3; Oferta fora da matriz; nenhuma linguagem de vencedor; teclado no combobox e nas sugestões.

### 6. Assistente (`/assistente/`)

**Objetivo:** um diagnóstico de BTUs em cinco etapas, com a conta aberta.

**Estrutura:** introdução curta; trilho de 5 segmentos; uma pergunta por tela; ações “Voltar” e “Continuar”; resultado.

**Etapas:** área, sol, pessoas, equipamentos, janelas. Campos numéricos com sufixo de unidade, contadores +/− com 44 px e `aria-live`.

**Resultado:** capacidade recomendada em leitura grande; rótulo “estimativa”; confiança (alta/média/baixa) com cor e texto; fatores em lista mono com BTU/h à direita; soma; suposições; orientações; CTA para o catálogo filtrado; cartões de Aparelhos analisados quando houver.

**Estados:** erro de campo com mensagem junto ao campo e `aria-describedby`; etapa incompleta bloqueia “Continuar” com explicação; resultado com confiança baixa mostra ressalva; sem análise na capacidade, não renderiza cartões.

**Mobile:** uma coluna, opções em cartões de 56 px, teclado numérico, resultado antes dos cartões.

**SEO:** `WebApplication` preservado; o H1 e a explicação do método continuam no HTML.

**Aceite:** cinco etapas, voltar/avançar sem perder respostas, foco movido para o título da etapa, resultado determinístico igual ao motor atual.

### 7. Índice de Análises (`/analises/`)

**Objetivo:** uma mesa editorial, não uma lista de cards.

- H1 “Análises”, lead curto.
- Lista em régua: data em mono, título em serifa/grotesca, marca/modelo, capacidade, link.
- Primeiro item em destaque com imagem real e resumo; demais em linhas.
- Estado vazio: se não há Análise publicada, a rota não existe (comportamento atual preservado).

**Mobile:** uma coluna, imagem com proporção fixa, metadata em mono.

**Aceite:** a rota continua condicional; nenhuma Análise inventada; links para ficha e capacidade preservados.

### 8. Artigo de Análise (`/analises/[slug]/`)

**Objetivo:** leitura editorial com autoridade e transparência.

- Coluna de 68 ch; H1 display; data e tempo de leitura em mono; breadcrumb.
- Aviso de transparência em bloco de nota com borda esquerda ciano de 2 px (`--foco`).
- CTA de topo (Oferta ou ficha) separado por hairline.
- Corpo MDX: serifa 1,0625 rem/1,65; H2 em grotesca; H3 em grotesca menor; parágrafos com 1em; listas com marcador de 1 px; figuras com legenda mono; citações em serifa itálica; links sublinhados com `--azul-frio-texto`.
- CTA do Assistente depois do corpo.
- Bloco “Dados oficiais do INMETRO” com link para a ficha.
- CTA final de Oferta/ficha/tabela.
- `Article` JSON-LD preservado; adicionar `BreadcrumbList`.
- Imagens: `<Image>` com width/height, `loading="lazy"` abaixo da dobra, `decoding="async"`, legenda real.

**Estados:** modelo fora da versão (aviso e CTA para a tabela), sem Oferta (CTA de ficha), imagem ausente (figura não renderiza).

**Mobile:** coluna única, figuras em largura total, CTAs empilhados.

**Aceite:** o texto e as imagens atuais não mudam; a hierarquia de headings é válida; o artigo continua legível sem JS; o canonical e o `Article` permanecem.

### 9. Institucionais (`/contato/`, `/politica-de-privacidade/`, `/termos-de-uso/`)

**Objetivo:** parecer o mesmo instrumento, em modo de leitura.

- Coluna de 68 ch; H1 display; lead em serifa; seções com H2 em grotesca e hairline.
- Contato: três assuntos como linhas de régua com rótulo, descrição e `mailto:`; e-mail direto em mono.
- Privacidade e Termos: H2, parágrafos, listas; links sublinhados; nenhuma caixa decorativa.
- Rodapé institucional com `aria-current`.

**Mobile:** uma coluna; alvos de 44 px nos links de assunto.

**Aceite:** textos preservados; canonical e metadata; nenhuma promessa nova; links de e-mail funcionam.

### 10. 404

**Objetivo:** recuperar o visitante sem humor forçado.

- Título “Fora da escala”; frase curta; links para Aparelhos, Assistente, Comparar e Home. Sem gráfico de recuperação: a régua saiu do site no #94 e a página não a recria.
- Sem header/footer diferentes; mesma moldura.
- `noindex`.

**Aceite:** rota `404.html` gerada; não entra no sitemap; navegação de volta funciona.

---

## Decisões de implementação

### Arquitetura CSS

- Um único ponto de entrada (`global.css`) importa partials em camadas: `tokens`, `base`, `layout`, `components`, `pages`, `utilities`. Ordem declarada com `@layer`, sem `!important`.
- Tokens em `:root`: cor, tipografia, espaço, raio, sombra, movimento, larguras, z-index. Nomes em português, coerentes com o domínio (`--tinta`, `--papel`, `--azul-frio`, `--foco`, `--linha`, `--leitura`, `--shell`).
- **Preservar os seletores existentes.** O redesign reescreve os valores e a composição, não renomeia classes usadas pelas ilhas e pelos testes. Classes novas só para componentes novos.
- CSS modular por superfície: `catalogo.css`, `ficha.css`, `comparacao.css`, `assistente.css`, `editorial.css`, `institucional.css`, `print.css`. Cada partial entra em `@layer pages`.
- Sem Tailwind, CSS-in-JS, Sass ou pré-processador. CSS moderno: custom properties, `clamp()`, `min()`, `:focus-visible`, `:has()` com fallback, `color-mix()` com fallback.
- Estados de foco, hover, active, disabled e selecionado definidos por componente; nenhum estado só por cor.
- `prefers-reduced-motion` global desliga transições e a entrada do hero.
- `forced-colors` preserva bordas e foco.

### Fontes

- Adicionar `@fontsource-variable/schibsted-grotesk`, `@fontsource-variable/source-serif-4` e `@fontsource-variable/azeret-mono`.
- Importar apenas o subset `latin`, pesos variáveis usados. `latin-ext` fica fora desta fase: o conteúdo é pt-BR e os caracteres fora do latin são cobertos pelo fallback. Medição real dos três arquivos `latin` variáveis: ~121 KB no total (Schibsted Grotesk 46,7 KB, Source Serif 4 50,9 KB, Azeret Mono 26,2 KB).
- Pré-carregar o woff2 latin da grotesca via import `?url` do Vite; os demais com `font-display: swap`.
- Fallbacks métricos: `system-ui` para grotesca, `Georgia` para serifa, `ui-monospace` para mono; `size-adjust` para minimizar CLS.
- Nenhum CDN de fontes; nenhuma requisição a terceiros.

### Ilhas e comportamento

- As quatro ilhas mantêm estado, contratos de URL, cálculos e acessibilidade. O trabalho é de markup e classes, não de lógica.
- `Consulta`: mantém `fetch` de `consulta.json`, `MiniSearch`, filtros, seleção e paginação; adiciona esqueleto, estado de erro com retry, `aria-sort`, foco no painel mobile e o dock.
- `Comparar`: mantém `?ids=`, limite de 3, combobox e matriz; adiciona estados e a leitura de custo.
- `Assistente`: mantém o motor determinístico e as cinco etapas; adiciona foco por etapa e a leitura de resultado.
- `CalculadoraCusto`/`CamposCusto`: mantêm `useCusto` e o contrato `uf`/`tarifa`/`horas`/`dias`; mudam apenas a apresentação.
- Nenhuma nova ilha. Nenhum estado global. Nenhum `useEffect` novo sem necessidade.

### Componentes e reuso

- Primitivos Astro para o que é estático: header, footer, ícone, régua de seção, leitura, etiqueta de Classe, cabeçalho de seção, estado vazio, breadcrumb, campo, aviso.
- Não criar um "design system" de 40 componentes. A regra é: repete em três lugares → primitivo; aparece uma vez → CSS local.
- Ícones em SVG inline, 1,5 px, `currentColor`, `aria-hidden` quando decorativos; nenhum pacote de ícones.
- `OfertaCartao` continua sendo o único lugar com `rel="sponsored nofollow noopener"`, `target="_blank"` e o marcador.

### Dados e build

- Nenhuma alteração em `packages/pipeline`, `packages/api`, `data/build/` ou `reports/`.
- Contagens do simulador e dos Aparelhos em destaque vêm de `consulta.json` no build, com as mesmas funções puras.
- Nenhum número de contagem escrito à mão.
- O build do site continua copiando `data/build/` para `dist/`; a API estática não muda.

### SEO

- Preservar title, description, canonical, JSON-LD e sitemap de todas as rotas.
- Adicionar `og:*` e `twitter:*` no `Base`, com `og:image` apenas quando houver imagem real.
- Adicionar `BreadcrumbList` na ficha e na Análise.
- `404` com `noindex`.
- Não esconder conteúdo indexável atrás de JS, animação ou `hidden`.
- O HTML inicial do catálogo continua com H1, descrição e a explicação do estado; a tabela é enhancement.
- Não criar URLs novas; nenhum redirect novo além dos existentes.

### Performance

- Orçamento por página: CSS crítico ≤ 80 KB gzip; fontes ≤ 130 KB no primeiro carregamento (subset `latin`, medido em ~121 KB); JS de ilha inalterado; nenhuma dependência nova de runtime.
- LCP ≤ 2,5 s em 4G; CLS ≤ 0,05; INP ≤ 200 ms.
- Zero requisições de terceiros.
- Prefetch seletivo do Astro nos links de navegação (ticket 90), nunca nas linhas da tabela nem em links de Oferta. O site continua MPA: sem router de cliente e sem transição de página.
- Imagens com dimensões explícitas; `loading="lazy"` abaixo da dobra; `fetchpriority="high"` só na imagem do topo da Análise, se houver.
- Evitar `backdrop-filter`, `filter`, sombras grandes e animação de layout.
- Medir com Lighthouse/WebPageTest e registrar os números no ticket de performance.

### Acessibilidade

- WCAG 2.2 AA: contraste 4,5:1 texto e 3:1 não texto; foco visível; alvos de 44 px; zoom 200% sem perda; reflow a 320 px.
- Teclado: skip link, header, filtros, tabela, painel, dock, combobox, matriz, assistente, calculadora, 404.
- Landmarks e headings em ordem; um H1 por página.
- Tabelas com `<caption>`, `scope`, `aria-sort`; a versão mobile mantém a relação rótulo/valor.
- Formulários com `<label>`, ajuda e erro associados; `aria-live` para resultados.
- `prefers-reduced-motion` e `forced-colors`.
- Revisão manual com leitor de tela (NVDA/VoiceOver) ou, no mínimo, árvore de acessibilidade do agent-browser.

### Movimento

- 120/180/240 ms; curva `cubic-bezier(0.2, 0, 0, 1)`.
- Uma entrada orquestrada por página: o hero da home.
- Nenhum parallax, scroll-jacking, autoplay ou animação contínua.
- Toda animação tem estado final imediato em `prefers-reduced-motion`.

---

## Decisões de teste

- **Testar comportamento externo, não implementação.** Os testes atuais de ilha continuam a ser o padrão: consulta, comparação, assistente, calculadora, ficha, resumo, estado, ofertas, institucionais.
- **Seams existentes:** testes puros em `src/lib` e testes de ilha em jsdom; o seam de build (`analises-build.test.ts`) exercita o Astro real e o HTML gerado.
- **Novos testes:**
  - `design-tokens.test.ts` (puro): lê os tokens do CSS e verifica os pares de contraste documentados (texto sobre giz/papel, giz sobre tinta, `--foco` e `--foco-texto` sobre giz/papel, Classes A–F sobre giz).
  - `base-build.test.ts` ou extensão do seam de build: skip link, `aria-current`, `og:*`, `twitter:card`, `BreadcrumbList` na ficha e na Análise, `404.html` gerado e fora do sitemap.
  - `print.test.ts` (build): a ficha contém a classe/mídia de impressão e o cabeçalho de impressão.
  - Testes de ilha ampliados: `aria-sort`, estado de erro com retry, painel mobile com `Esc`, foco no título da etapa do Assistente, resultado da calculadora com faixa.
- **Não testar aparência em unit test.** A validação visual é feita com `agent-browser` em 390/768/1024/1440, com screenshots temporários conferidos e descartados ao fim da validação.
- **Regressão:** os 663 testes devem continuar verdes; qualquer mudança de markup que quebre um teste deve ser justificada por um comportamento melhor, nunca por conveniência.
- **Build:** `pnpm build && pnpm build:site && pnpm lint && pnpm typecheck && pnpm test` antes de cada PR; `data/build` e `reports` sem diff.

---

## Ordem de execução

1. Fundação de tokens, fontes e base.
2. Shell global e primitivos.
3. Calibração do chão visual (#91) — antes de qualquer página.
4. Home (hero, simulador, destaques, FAQ, metodologia) e a série de ajustes #92–#110.
5. Catálogo (tabela, filtros, seleção, vitrine).
6. Ficha (topo, corpo, calculadora, impressão).
7. Comparação (seleção, matriz, custo).
8. Assistente.
9. Análises (índice e artigo).
10. Institucionais, Ofertas e 404.
11. SEO/metadados, acessibilidade, performance e prefetch seletivo.
12. QA visual, documentação e fechamento.

A ordem detalhada e as arestas estão nos tickets.

---

## Fora de escopo

- Dark mode e seletor de tema.
- Novas rotas, novos produtos, novas Análises, novas Ofertas ou qualquer conteúdo inventado.
- Mudanças no pipeline, na API, nos cálculos, no schema ou nos artefatos publicados.
- Migração de framework, nova biblioteca de UI, Tailwind, Sass, CMS ou backend.
- Router de cliente, `ClientRouter` ou transições de página; a navegação continua MPA, com prefetch seletivo no ticket 90.
- Autenticação, comentários, busca externa, analytics novo ou cookies.
- Geração de imagens por IA, banco de imagens, fotografia de produto fictícia.
- Reescrita do texto editorial existente além de pequenos ajustes de clareza.
- i18n; o site continua em pt-BR.

## Riscos e questões abertas

- **Regressão em 2.236 páginas.** Mitigação: preservar seletores, rodar o build real e o seam de build em cada ticket; comparar HTML de uma amostra de fichas antes/depois.
- **Peso das fontes.** Mitigação: subset `latin` apenas, uma pré-carga, `font-display: swap`, medir LCP; se estourar o orçamento, reduzir a Azeret a um peso e usar `font-variation-settings` para o resto.
- **Barra sticky + dock no celular.** Mitigação: altura máxima da barra, dock em uma linha, teste em 320 px; se cobrir a tabela, o dock vira uma faixa no rodapé da viewport só no mobile.
- **Tabela no mobile.** A tabela continua tabela, com rolagem horizontal contida e colunas de seleção/Modelo fixas. Mitigação: testar todas as colunas em 320, 390 e 768 px, garantir que a página não role na horizontal, que o contêiner seja focável por teclado, que o `z-index` das células fixas e do cabeçalho não se sobreponha e que o aviso “Deslize para ver as colunas” apareça abaixo de 900 px. Nenhuma conversão para cartões.
- **Prefetch em excesso.** Mitigação: `prefetchAll` desligado, `data-astro-prefetch` só em links de navegação deliberada, `false` explícito na tabela e nos links de Oferta; medir requisições por hover no ticket 90.
- **Contraste do ciano.** O ciano cheio passa em contorno, sublinhado e marcador (3:1), não em texto; usar `--foco-texto` e validar no teste de tokens.
- **Uma única Análise publicada.** O template precisa funcionar com título longo, sem Oferta e com imagem ausente; testar com fixtures existentes.
- **OG image.** Não há imagem de marca; a decisão é usar a imagem real da Análise quando existir e omitir `og:image` nas demais páginas até haver um ativo aprovado. Não inventar.
- **Design tokens duplicados (CSS + DESIGN.md).** Mitigação: CSS é a fonte normativa; o teste de contraste lê o CSS; o `DESIGN.md` é atualizado no ticket de fechamento.
- **Sem ferramenta de regressão visual.** Mitigação: screenshots com `agent-browser` em cinco larguras, revisão lado a lado e checklist por página no ticket de QA.
- **Escopo de "premium".** O risco é confundir premium com mais decoração. A direção é explícita: menos ornamento, mais calibração. O ticket de QA rejeita qualquer elemento sem função.
- **Chão com viés mineral.** O papel antigo (`#F2F5F1`) tinha viés esverdeado suficiente para ler como paleta genérica de dashboard. Mitigação aplicada: o ticket `#91` fixou giz/papel quase puros antes de `#69`. Os hex e raios legados que ainda vivem em `apps/site/src/styles/global.css` são removidos pelos tickets que reescrevem cada superfície — `#91` só corrige o chão e não duplica esse trabalho:
  - `#69`/`#79` — `.cta-cartao`, `.cta-acao`: `#e0f2fe`, `0.75rem`, `999px`.
  - `#70`/`#71` — `.home-cartao-destaque`, `.home-links a`: `#e0f2fe`, `999px`.
  - `#73` — `.consulta .chip-filtro`, `.consulta .chips button`, `.consulta .classes-chips button[data-classe]`, `.consulta .classe-selo`: `#16a34a`, `#2563eb`, `#ca8a04`, `#ea580c`, `#dc2626`, `999px`.
  - `#75` — `.ficha-etiqueta`, `.ficha-comparar`: `999px`.
  - `#80` — `.comparar-aviso`, `.comparar-convite`, `.comparar-aviso-capacidade`: `#fffbeb`, `#e0f2fe`, `0.5rem`.
  - `#81` — `.assistente-progresso-trilha`, `.assistente-formas button`, `.assistente-confianca`, `.assistente-analisado-selo`: `999px`.

### Questões abertas (não bloqueiam o início)

- **Ativo de Open Graph:** manter `og:image` apenas na Análise até existir um cartão de marca aprovado, ou produzir esse cartão no ticket de SEO? A recomendação é adiar e não inventar imagem.
- **Dark mode:** confirmar que fica fora desta fase. O sistema de tokens já permite uma camada escura futura sem refazer componentes.
- **Dock no celular muito estreito:** em telas abaixo de 360 px, preferir a barra fixa no rodapé da viewport em vez do dock acima da tabela? A recomendação é testar em 320 px e decidir no ticket 74.

## Further notes

- O texto do H1 da home (“Seu conforto começa pela escolha certa”) e as oito perguntas do FAQ, após a remoção da pergunta de consumo no alinhamento de 2026-11-24, são intocáveis por SEO e por contrato de conteúdo.
- A frase de independência do INMETRO, o aviso de estimativa e a transparência de afiliado são compromissos de marca; nenhum redesign pode enfraquecê-los.
- O catálogo abre com 220 V implícito e 2.116 linhas; isso é comportamento, não bug.
- O simulador do hero só é assinatura porque usa as contagens reais da base; se as faixas mudarem, o resultado muda com elas.
- A impressão da ficha é um requisito de produto: o visitante técnico precisa levar o datasheet para uma conversa de instalação.
