# Spec — Fase 5: Camada editorial de Análises

**Status:** ready-for-agent

## Problem Statement

O site existe e é tecnicamente completo, mas **ninguém chega até ele**. As 2.460
fichas de Aparelho respondem "quais são os dados deste modelo" e não respondem a
busca que traz comprador: "vale a pena este aparelho?", "qual 12.000 BTU comprar?".
Não há conteúdo editorial, não há CTA de afiliado em uso (`ofertas.json` está
vazio) e não existe caminho para publicar uma **Análise** sem inventar estrutura a
cada artigo.

O mantenedor quer escrever e publicar Análises quando quiser, com liberdade de
redação e de design, usando IA como apoio, **sem** comprometer a autoridade dos
dados oficiais do INMETRO, o SEO, a busca do site ou as métricas. Também quer que
essas páginas sejam descobríveis por Agentes, não só pelo Google.

## Solution

Entregar a **capacidade** de escrever, publicar e descobrir Análises editoriais por
Aparelho — **sem publicar nenhuma Análise nesta fase**. É uma fase de
infraestrutura de conteúdo: com zero Análises, o site continua exatamente como
hoje.

- **Análise** (termo do domínio) é uma peça editorial em MDX sobre **um** Aparelho,
  numa seção própria (`/analises/<slug>`), ligada ao Aparelho por `aparelhoId`.
- A ficha continua sendo a página dos **Valores oficiais**; as duas coexistem
  indexadas, com títulos e intenções distintos e links cruzados (ADR-0015).
- A seção, o menu, o sitemap e o `analises.json` só aparecem quando existir **≥ 1**
  Análise publicada.
- **Ofertas** viram componentes reutilizáveis (cartão, faixa/banner) prontos para
  qualquer página; nesta fase aparecem apenas na Análise, na ficha do Aparelho e em
  destaques estáticos da home. Nunca na ilha de busca/filtros.
- Descrição estruturada para Agentes e Google: JSON-LD, `analises.json`, canonical,
  sitemap e Pagefind.
- Nenhuma infraestrutura nova de medição: Search Console + Web Analytics +
  painel do programa de afiliado (Mercado Livre ou Amazon).

## User Stories

1. Como mantenedor, quero escrever uma Análise em MDX com frontmatter, para ter
   liberdade de texto e de componentes sem montar uma página do zero.
2. Como mantenedor, quero que o frontmatter exija `aparelhoId`, `slug`, `titulo`,
   `descricao` e `data`, para que nenhuma Análise nasça incompleta.
3. Como mantenedor, quero um comando que busque Aparelhos por marca, modelo ou
   potência e imprima o `id`, para copiar no frontmatter sem caçar no JSON.
4. Como mantenedor, quero que o build recuse slug repetido, para não criar duas
   URLs iguais.
5. Como mantenedor, quero que o build recuse duas Análises para o mesmo Aparelho,
   para que cada modelo tenha uma única página editorial.
6. Como mantenedor, quero publicar uma Análise abrindo um PR comum, para manter o
   fluxo de publicação já existente (merge = deploy, ADR-0004).
7. Como mantenedor, quero poder publicar uma Análise hoje e a próxima em três
   semanas, para não ficar preso a levas ou cronograma.
8. Como mantenedor, quero que o build não exija nenhuma Análise específica nem uma
   contagem mínima, para que zero Análises seja um site válido.
9. Como mantenedor, quero que a seção `/analises/` só apareça quando houver
   conteúdo, para não publicar página vazia nem link morto.
10. Como mantenedor, quero usar imagens e componentes no meio do texto, para que a
    Análise tenha a mesma qualidade visual do resto do site.
11. Como mantenedor, quero que a estilização futura mude o layout sem reescrever o
    texto das Análises, para não retrabalhar conteúdo.
12. Como mantenedor, quero que uma Análise nunca seja apagada, para preservar URL,
    indexação e links externos.
13. Como mantenedor, quero que uma Análise de um Aparelho que saiu da tabela
    continue no ar com aviso de que ele não consta na Versão atual, para atender
    quem já tem o aparelho em casa.
14. Como mantenedor, quero que essa degradação não falhe o build, para que uma nova
    Versão da tabela não bloqueie em conteúdo.
15. Como mantenedor, quero escolher livremente os números e comparações do texto,
    sem aviso de "editorial" na página, para não engessar a redação (ADR-0015).
16. Como mantenedor, quero que preço não seja afirmado no texto, para o artigo não
    envelhecer com um valor que já mudou.
17. Como leitor, quero uma página de Análise legível, com título, data, imagens e
    texto, para decidir se o aparelho serve para mim.
18. Como leitor, quero um link claro para a ficha técnica do mesmo Aparelho, para
    conferir os dados oficiais do INMETRO.
19. Como leitor, quero ver os CTAs de Oferta com aviso de que são links comerciais,
    para saber que aquilo não é dado oficial.
20. Como leitor, quero que o CTA só apareça quando houver uma Oferta real, para não
    clicar num link vazio.
21. Como leitor da ficha, quero um link para a Análise quando ela existir, para
    passar dos dados à decisão de compra.
22. Como leitor, quero que a seção de Análises seja listável, para descobrir o que
    já foi publicado.
23. Como leitor, quero que os destaques da home apontem para Análises publicadas,
    para chegar ao conteúdo sem passar pela busca.
24. Como Agente (consumidor), quero um `analises.json` com slug, URL, `aparelhoId`,
    título, descrição e data, para descobrir e citar Análises sem depender do
    Google.
25. Como Agente (consumidor), quero JSON-LD de artigo na página, para identificar
    autoridade, data e assunto.
26. Como Agente (consumidor), quero que a base servida permaneça intocada, para que
    Análise nunca se confunda com Valor oficial.
27. Como buscador, quero as Análises no sitemap e no índice do Pagefind, para que
    sejam encontradas como qualquer outra página.
28. Como mantenedor, quero que as Análises não entrem na ilha de busca por
    BTU/tensão, para que a consulta técnica continue sendo comparação de dados.
29. Como mantenedor, quero reutilizar um cartão e uma faixa de Oferta em qualquer
    página, para decidir os melhores pontos de CTA quando o design for feito.
30. Como mantenedor, quero medir o resultado pelo Search Console, Web Analytics e
    painel de afiliado, para não criar redirect/Worker só para contar clique.
31. Como mantenedor, quero que a migração futura para domínio próprio seja só
    configuração + redirect 301, para não refazer URLs.
32. Como mantenedor, quero testes com uma Análise de fixture, para provar o caminho
    completo antes de publicar a primeira.

## Implementation Decisions

- **Formato e coleção.** As Análises são uma coleção de conteúdo do site em **MDX**
  (integração `@astrojs/mdx`), um arquivo por Análise, com frontmatter:

  ```yaml
  aparelhoId: ap-<12 hex>
  slug: marca-modelo-<sufixo editorial>
  titulo: "..."
  descricao: "..."
  data: YYYY-MM-DD
  ```

  A URL pública vem do `slug`; nenhum id entra na URL.

- **Validação.** Um módulo puro do site valida: campos obrigatórios não vazios,
  `slug` único, no máximo uma Análise por `aparelhoId` e formato de `aparelhoId`.
  Ausência do Aparelho na base servida **não** é erro de build: é o estado
  **Ausente** e a página degrada (ADR-0015). Violações de contrato falham o build.

- **Página de Análise.** Layout editorial próprio sobre o layout base: título/H1
  próprio (distinto da ficha), data, corpo MDX renderizado, link "Ver ficha técnica"
  e o CTA da Oferta. `title`, meta description, canonical e OG image saem do
  frontmatter. JSON-LD de `Article`, sem nota/`Review` inventada.

- **Imagens.** Toda imagem de Análise entra por `astro:assets` (componente de imagem
  do Astro), com `alt`, dimensões e formatos otimizados; nada de `<img>` cru no MDX.
  Imagem grande é o principal risco de Core Web Vitals numa página editorial — o
  número de páginas não é.

- **Convivência com a ficha.** A ficha exibe "Leia a análise" quando existe Análise
  para aquele `aparelhoId`; o mapa `aparelhoId → Análise` é construído no build.
  Títulos e intenções são distintos: ficha = dados oficiais; Análise = decisão de
  compra. `noindex` fica fora desta fase (revisão em 60–90 dias, ADR-0015).

- **Visibilidade condicional.** Com zero Análises, nada muda: a rota
  `/analises/` não é gerada, não entra no menu, no sitemap nem no `analises.json`.
  Com ≥ 1, a rota de índice, o item de menu, o sitemap, o Pagefind e o
  `analises.json` aparecem automaticamente.

- **`analises.json`.** Artefato **do site** (não do pipeline, não de `data/build/`),
  publicado na raiz do site: lista com `slug`, `url`, `aparelhoId`, `titulo`,
  `descricao` e `data`. É o inventário para Agentes.

- **Degradação por Ausente.** Sem Aparelho na Versão atual, a Análise continua
  publicada com aviso de que o modelo não consta na tabela atual, **sem** bloco de
  dados técnicos e **sem** CTA; o conteúdo editorial permanece. O build não falha.

- **Ofertas reutilizáveis.** Extrair a renderização de Oferta da ficha para
  componentes reutilizáveis (cartão e faixa/banner) que recebem `Oferta` e/ou
  `aparelhoId`. Mantêm `rel="sponsored nofollow noopener"`, `target="_blank"` e o
  aviso de link comercial. Conteúdo MDX usa apenas componentes aprovados, nunca
  estilo inline.

- **Pontos de CTA nesta fase.** Página de Análise, ficha do Aparelho e destaques
  estáticos da home (condicionados a haver Análise). **Nada** de Oferta na ilha de
  busca/filtros (ADR-0010).

- **Editorial.** Números próprios são permitidos e não recebem aviso; a ficha segue
  oficial. Preço não é afirmado no texto. Análise nunca é apagada.

- **Descoberta.** Sitemap e Pagefind cobrem as Análises automaticamente por serem
  páginas estáticas. Sem `llms.txt` e sem versões `.md` nesta fase.

- **Domínio e medição.** O site continua em `especialista-do-ar.pages.dev`; a
  migração para domínio próprio fica fora da fase, com 301 e troca do `site:`
  previstos. Medição só pelas ferramentas externas; sem redirect `/ir/`, sem Worker
  e sem cookie novo.

- **Helper de Aparelho.** Um comando de CLI lista marca, modelo, potência e `id` a
  partir da base servida, para o mantenedor montar o frontmatter.

- **Sem mudanças no pipeline.** `data/build/`, `reports/`, a API estática e a
  semântica de consulta permanecem intocadas.

## Testing Decisions

- **Bom teste** verifica comportamento externo: os arquivos gerados pelo build do
  site (HTML, `analises.json`, sitemap) e os contratos de validação — nunca detalhes
  internos do layout.

- **Seam 1 — build do site ponta a ponta (a mais alta).** Um build real do Astro com
  uma Análise de **fixture** confere no `dist`: página `/analises/<slug>/` com H1 e
  corpo, link para a ficha, CTA com `rel` correto, entrada no sitemap,
  `analises.json` com os campos esperados e o link de volta na ficha do Aparelho.
  O mesmo teste roda o **estado zero**: sem fixture, as 2.462 páginas continuam,
  sem `/analises/` e sem `analises.json`.

- **Seam 2 — módulo puro de Análises.** Mesmo padrão de `ofertas.ts`: campos
  obrigatórios, slug único, uma Análise por Aparelho, mapa `aparelhoId → Análise`,
  lista do `analises.json` e a regra de visibilidade (`> 0`). Inclui o caso de
  Aparelho ausente da base (degradação) sem falhar o build.

- **Prior art:** testes de `ofertas`/`verificacao-links` no site, teste de
  isomorfismo que lê o texto-fonte, e os testes de build com golden snapshots do
  pipeline.

- **Fixture:** um conjunto mínimo de Análises de teste (uma válida, uma com
  Aparelho ausente) vive fora do conteúdo publicado e só é usado pelo build de
  teste, para nunca aparecer no site.

- **CI:** os testes entram na suíte Vitest já executada no job de CI; o gate de
  `pnpm build:site` continua valendo no estado real (zero Análises).

## Out of Scope

- **Publicar Análises.** O conteúdo é operação contínua, fora desta fase. A meta
  editorial é 10: duas em 9.000, 12.000, 18.000 e 24.000; uma em 30.000 e uma em
  36.000, escolhidas pelo mantenedor (priorizando Aparelhos com Oferta).
- **Adesão a programa de afiliado e Ofertas reais** (Mercado Livre/Amazon) — entram
  junto com o primeiro artigo.
- **Domínio próprio** — fase posterior; a migração exigirá **301 de cada URL
  antiga para a nova**, atualização do `site:` do Astro, do canonical e do sitemap,
  e a mudança de endereço no Search Console; o `pages.dev` continua redirecionando.
- **Redesign/estilização** — fase posterior; os componentes nascem prontos para
  receber o design.
- **Guias** (conteúdo que cruza vários Aparelhos).
- **`noindex` da ficha** e revisão de canibalização — 60–90 dias após publicações.
- **`llms.txt` e versões `.md` das Análises.**
- **Redirect `/ir/` ou qualquer contagem de clique no site** (reabriria o
  ADR-0011).
- **Mudanças no pipeline, na base servida, na API ou na consulta.**
- **Busca/filtros com Oferta** e qualquer anúncio na ilha.

## Further Notes

- Decisão registrada no **ADR-0015**; termos **Análise** e **Guia** no
  `CONTEXT.md`.
- A fase é **capacidade, não conteúdo** por escolha explícita: a entrega é a
  infraestrutura provada com fixture e o site válido com zero Análises.
- O critério de conclusão é técnico: build do site, validação, seção condicional,
  link bidirecional, `analises.json`, JSON-LD, componentes de Oferta e testes
  verdes.
- O sucesso de aquisição (impressões, cliques) só pode ser medido depois de haver
  Análises: Search Console, Web Analytics e painel de afiliado.
- **Custo acumulado da migração de domínio.** Quanto mais cedo
  `especialistadoar.com.br` entrar, menos URLs e links externos há para redirecionar;
  o custo cresce com o número de páginas e de Análises publicadas. Não é urgente,
  mas é a decisão com maior efeito acumulado entre as fases futuras.
- `docs/agents/architecture.md` deve ser reescrito quando a camada de conteúdo
  existir de fato (o `grill-with-docs` só o altera quando a estrutura muda).
