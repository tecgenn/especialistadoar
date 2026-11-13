# Arquitetura

Como o código do Especialista do Ar está estruturado. Descreve o estado atual
(código de build + dados + docs) e a forma pretendida nas fases de entrega.

## Propósito

Transformar a exportação oficial de produtos do INMETRO (um CSV) numa base
estruturada e versionada de aparelhos de ar-condicionado que agentes de IA e um
site possam consumir, sem que ninguém precise parsear a exportação bruta. O
**consumidor principal é um agente de IA**; a base deve ser consultável tanto como
arquivos estáticos quanto por uma API híbrida.

## Escopo

Entregue em fases — ver `docs/prd.md` para o detalhamento completo. **MVP = Fases
1–3**; admin é pós-MVP.

1. **Pipeline, dataset, relatório, testes** — bruto → base servida → relatório de
   revisão.
2. **API, docs, teste com agente** — JSON estático (o Worker dinâmico da fase 2
   foi aposentado na fase 4, ADR-0011); o teste de aceitação com um agente é o
   **portão de decisão** antes de construir o site.
3. **Site (Astro), Ofertas, verificação de links sob demanda.**
4. **Admin** (pós-MVP) — na prática, **observabilidade** (Fase 4).

> **Fase 4 (concluída, 2026-10-19).** O "admin" colapsou em observabilidade
> (o conteúdo continua no git, editado por PR comum). Decisões: **aposentar o
> Worker dinâmico** (ADR-0011), **trilha dupla de CI/CD** com o Relatório de
> revisão só em nova Versão da tabela (ADR-0012) e **observabilidade por
> dashboards** (ADR-0013), com verificação de links manual (ADR-0014). Este
> documento já reflete os tickets 13, 14 e 15; o Valor calculado virou fórmula
> documentada em `docs/base-consumer-guide.md`.

## Fonte de verdade

- **`data/raw/inmetro-export-<data>.csv`** — a exportação do INMETRO. Fonte
  canônica (uma *Versão da tabela*). Superconjunto do PDF publicado: Ativo +
  Cancelado + Inativo, mais o código de barras. Cada exportação nova é guardada
  imutável e identificada por sha256 no `manifest.json`.
- **PDF** (`Condicionadores de ar 2025.pdf`) — **removido.** Reobtido do INMETRO
  apenas se algum dia for preciso cruzar dados.
- **`produtos.csv`** — descartado (idêntico em conteúdo ao CSV de exportação; só a
  ordem difere).

Caveats medidos do CSV (tratados pelo parser, não à mão):

- **BOM** UTF-8 no início — parsear com `bom: true`.
- O **cabeçalho** tem um campo entre aspas com vírgula
  (`"Se outro fluido refrigerante, especificar"`) e um **espaço à direita** num nome
  de coluna — parsear o cabeçalho em RFC 4180 e aparar os nomes antes de validar.
- `º` (ordinal) e `°` (grau) misturados entre colunas — regra de formato.

## Camadas

```
.github/                               # CI (build+testes) e publicação (Cloudflare Pages)
  workflows/{ci,publish}.yml
  actions/setup/action.yml             # composite: pnpm + Node 24 + install
  branch-protection.json               # regra de branch de main (reaplicável)
data/
  raw/inmetro-export-YYYY-MM-DD.csv   # imutável, versionado + sha256 no manifest
  excecoes-manuais.jsonl              # CAMADA CURADA: correções à mão (motivo + fonte)
  vinculos-confirmados.jsonl          # CAMADA CURADA: fusões confirmadas por pessoa
  marcas-catalogo.jsonl               # CAMADA CURADA: Marcas de catálogo (agrupamento)
  build/
    aparelhos.jsonl                   # base servida (Aparelhos com Dados declarados)
    aparelhos.json                    # espelho em array do acima
    consulta.json                     # dataset enxuto de consulta (~520 KB, com marcaCatalogo, função e classes)
    registros.jsonl                   # Linhas normalizadas (proveniência)
    schema.json                       # contrato JSON Schema
    manifest.json                     # metadados de versão (hash, data, contagens)
    anomalias.jsonl                   # Anomalias por Linha
    excecoes-manuais.jsonl            # cópia publicada da Camada curada
    vinculos-confirmados.jsonl        # cópia publicada da Camada curada
    marcas-catalogo.jsonl             # cópia publicada da Camada curada
reports/revisao-YYYY-MM-DD.md         # Relatório de revisão por nova versão (fase 1)
packages/pipeline/                    # o pipeline de build (CLI)
packages/api/                         # a API estática (leitura Node) + módulo de consulta isomórfico
apps/site/                            # catálogo Astro estático (fase 3)
  filtros.json                        # CAMADA CURADA do site: chips de marca/capacidade
  ofertas.json                        # CAMADA CURADA do site: Ofertas (links de afiliado), só no site
  src/content/analises/               # CAMADA EDITORIAL do site: Análises em MDX, só no site
  src/content.config.ts               # coleção `analises` (frontmatter obrigatório)
  src/conteudo/                       # glue do site (astro:content), fora de src/lib
  scripts/verificar-links.ts          # verificação manual: imprime o relatório de links
  scripts/buscar-aparelho.ts          # busca o id de um Aparelho para o frontmatter
```

1. **Bruto (versionado).** Cada exportação nova é guardada intacta em `data/raw/`,
   identificada por hash de conteúdo + data de obtenção. Preserva *toda* Linha,
   inclusive as sem Dados declarados — necessário para o diff.
2. **Camada curada.** As formas sancionadas de curadoria, editadas à mão e
   **canônicas** na raiz de `data/`: as duas que alteram conteúdo são a **Exceção
   manual** (correção de um campo de uma Linha, com motivo + fonte) e o **Vínculo
   confirmado** (fusão de identidade aprovada por uma pessoa); a terceira é a
   **Marca de catálogo** (agrupamento de Marcas oficiais para a consulta, também
   com motivo + fonte). São *insumos* do build, não derivados. Ver ADR-0006 e
   ADR-0016.
3. **Build (derivado).** Um script lê um snapshot bruto + a Camada curada e emite a
   base servida, os artefatos laterais e as cópias publicadas da curadoria.
4. **Base servida.** `aparelhos.jsonl` (+ `.json`) com `schema.json`.
5. **Relatórios (derivado).** O Relatório de revisão de cada versão nova.

## Fluxo de dados

```
nova exportação CSV
    -> data/raw/<data>.csv + sha256 (manifest)        (Versão da tabela)
    -> Exceção manual sobre o Valor original          (camada curada, antes de normalizar)
    -> normalização de formato                        (regras, não exceções)
    -> detecção de Anomalias                          (sinal, não erro)
    -> Vínculo confirmado remapeia a identidade       (camada curada, antes de agrupar)
    -> agrupamento em Aparelho                        (marca + unid. interna + unid. externa)
    -> Marca de catálogo resolve a marca da consulta  (camada curada, só na consulta)
    -> validação: schema.json + invariantes           (falha dura)
    -> data/build/aparelhos.jsonl (+ .json)           (só Aparelhos com Dados declarados)
    -> data/build/consulta.json                       (dataset enxuto p/ a ilha de consulta)
    -> data/build/{excecoes-manuais,vinculos-confirmados,marcas-catalogo}.jsonl
                                                       (cópias publicadas)
    -> reports/revisao-<data>.md                      (novos / alterados / Ausentes / Anomalias / Vínculos)
    -> revisão humana (PR) antes de publicar
```

## Módulos principais

- **ingest** — registra um snapshot bruto (hash, data, origem); idempotente por
  conteúdo.
- **parse** — CSV em RFC 4180 com `bom: true`; cabeçalho aparado. Descarta logo
  as Linhas com `Status do Modelo = "Excluido"` (duplicatas/obsoletas), antes da
  normalização; o número original das Linhas seguintes é preservado para a
  proveniência e as Exceções manuais.
- **normalize** — padronização só de formato (BOM, casing, unidades-no-texto,
  parsing de tensão, coerção numérica, `º`/`°`); o texto de origem é preservado para
  proveniência. A coerção numérica segue a gramática **pt-BR**: ponto entre grupos
  de três dígitos é separador de milhar (`1.000` = 1000, `1.160` g = 1160 g,
  `1.000,50` = 1000.5), vírgula é decimal, e a parte inteira `0` nunca é milhar
  (`0.351` = 0.351). O formato en-US (milhar com vírgula) não é suportado:
  `1,000.50` vira `null`, mas `1,000` continua sendo lido como `1` (o
  comportamento anterior à regra). A coluna **IDRS** tem leitura própria: quando
  vem um inteiro sem separador (a exportação perdeu a vírgula), o ponto decimal é
  recolocado após o primeiro dígito (`55` → `5,5`, `62` → `6,2`, `33` → `3,3`);
  decimais legítimos passam intactos. É regra de formato aplicada a toda Versão,
  não Exceção manual (ADR-0017).
- **anomalias** — sinaliza valores fora do padrão (não-numérico em campo numérico,
  colunas desalinhadas) e valores numericamente válidos, mas implausíveis para a
  coluna, por uma tabela de regras de plausibilidade (`valor_implausivel`). A regra
  pode normalizar o valor pela capacidade da Linha (consumo anual por 1.000 BTU/h,
  faixa 10–120); o valor original é preservado, não corrigido. A detecção roda
  depois das Exceções, então uma capacidade corrigida não vira Anomalia. O **IDRS**
  entra na tabela com teto de `10` Wh/Wh, lido pela mesma regra de formato da
  coluna — o que a regra já corrigiu não vira Anomalia. A Anomalia **nunca exclui**
  o Aparelho (ADR-0017); o sinal fica só em `anomalias.jsonl`.
- **excecoes** — lê e valida a Exceção manual; aplica-a sobre o Valor original
  *antes* da normalização; recusa correção só-de-formato, campo inexistente e
  exceção órfã (que não casa com nenhuma Linha desta Versão da tabela).
- **vinculos** — lê e valida o Vínculo confirmado; a identidade histórica
  (`anterior`) é canônica e absorve o Aparelho novo; guarda contra ciclos.
- **jsonl** — leitura/escrita de JSON Lines (writer único, também usado para
  republicar a curadoria).
- **marcas-catalogo** — lê e valida a camada curada que agrupa Marcas oficiais
  sob a **Marca de catálogo** (motivo + fonte; alias para si mesma recusado) e
  resolve a marca de consulta de um nível. Alias cujo lado oficial não está na
  Versão da tabela é ignorado, não é erro de build. Só o dataset de consulta
  recebe o campo — a base servida mantém a Marca oficial (ADR-0016).
- **group** — dobra Linhas em Aparelhos. A identidade é marca + unid. interna +
  unid. externa (ou Modelo quando as unidades não vêm separadas); a tensão fica fora
  da identidade (bivolt é um só Aparelho). Aceita um remapeamento canônico de
  identidade vindo dos Vínculos. Lê a **Classe** da coluna oficial em `dados` de
  cada Variante (aparada, em maiúsculas; `null` quando vazia — uma Classe fora de
  A–F é preservada, sem falhar o build). A Classe não conta como Dado declarado.
  Ver ADR-0018.
- **validate** — JSON Schema (Ajv) + invariantes de domínio; violação é falha dura.
- **build** — orquestra o pipeline: resolução da versão, leitura da curadoria,
  parse/normalização/anomalias/agrupamento, validação, escrita dos artefatos e das
  cópias publicadas.
- **diff / report** — compara com a Versão anterior; classifica Aparelhos novos,
  alterados e Ausentes, além de Aparelhos sem dados declarados (regressão),
  Anomalias novas e Vínculos sugeridos; renderiza o Relatório de revisão em
  Markdown (`reports/revisao-<data>.md`). A Versão anterior é reconstruída a
  partir do seu snapshot raw, então o diff é derivado e não guarda estado. Ver
  ADR-0007.
- **api (estática)** — em `packages/api`, `abrirApiEstatica(buildDir)` lê
  `manifest.json` e `aparelhos.json` da base publicada e expõe consulta por ID,
  listas de Aparelhos e a Versão da tabela, sem servidor. É o consumo estático da
  base servida; a ilha do site reutiliza seu módulo de consulta. O pipeline expõe
  seu contrato pelo entry point (`packages/pipeline/src/index.ts`) — o `api`
  nunca importa os internos.
- **consulta** — mesmo pacote `packages/api`, mas num *entry point* **isomórfico**
  (lógica pura, **sem** dependências de Node): filtros por campo, busca textual e
  **ordenação** sobre o `data/build/consulta.json`. É importado pela **ilha do
  site** (navegador) e por qualquer consumidor que queira a mesma semântica. O
  filtro `marca` casa a
  Marca de catálogo **e** a Marca oficial, e a busca indexa as duas (ADR-0016). O
  dataset projeta, por Aparelho, `funcao` e as listas únicas e ordenadas
  `classes`, `idrs` e `consumosKwh` (além de `capacidadesBtu` e `tensoes`) —
  Variantes sem o dado não contribuem. A ordenação (`ordenar`, ticket 27) é pura
  e vive aqui: A–Z por Marca de catálogo e modelo por padrão; por coluna, o menor
  valor da lista para crescente e o maior para decrescente, quem não declara o
  dado no fim. A leitura de
  arquivo fica de fora desse entry (separar por entry point é o que impede `fs` de
  entrar no bundle). Ver ADR-0008 e ADR-0018.
- **site** — em `apps/site`, o catálogo Astro como **build estático**: páginas de
  detalhe pré-renderizadas por Aparelho (`getStaticPaths` sobre `aparelhos.json`) +
  **duas ilhas React**: a de consulta (`Consulta.tsx`) baixa `consulta.json` e
  filtra/busca **no cliente** pelo módulo isomórfico (08), com o estado na URL
  (`?marca=&tipo=&btu=&tensao=&funcao=&classe=&ordem=&dir=&q=`); a do Assistente
  está no bullet próprio mais abaixo.
  Em `/aparelhos/` a ilha rende a **tabela** de Aparelhos (ticket 27): uma linha
  por Aparelho, cabeçalhos `<button>` com `aria-sort`, ordenação por `ordenar` do
  entry isomórfico, 50 linhas e "Mostrar mais" (+50); abaixo de 640 px cada linha
  vira um cartão (`data-label`). No celular, onde o cabeçalho da tabela some, um
  botão ao lado de "Ordenar por" inverte a direção. A página usa a variante
  **ampla** do layout e uma coluna central de até 72 rem (ticket 50), sem barra
  lateral: busca em largura total, a linha de **Pesquisa avançada** com os chips
  do recorte efetivo (inclusive o padrão implícito de Tensão 220 V, cujo "×"
  grava `tensao=`), o painel recolhível com Marca, Capacidade, Função, Tensão,
  Tipo e Classe (fechado por padrão e aberto sozinho quando a URL traz um filtro
  avançado), a vitrine de Análises e, acima da tabela, a linha compacta de
  "Ordenar por". Na célula da Marca, ao lado do valor, a linha ganha o selo
  "Análise" — etiqueta de contorno com link para a Análise — só para aparelhos
  que têm Análise publicada; não é uma coluna de dados nem ocupa célula
  própria, então a maioria das linhas fica sem ele. Abaixo de 640 px o cartão
  do Aparelho exibe o selo junto à Marca, na mesma posição. Ao abrir
  sem querystring, o **filtro padrão** — Tensão 220 V — vale como estado inicial
  sem sujar a URL; "Limpar filtros" volta a
  ele. A ordem padrão é A–Z por Marca de catálogo e
  modelo; com busca e sem coluna escolhida, é a relevância. `/` é a **home**
  (ticket 46): um hub gerado no build (módulo puro `src/lib/home.ts`; o bloco de
  capacidades e marcas populares vem de `HomePopulares.astro`) com hero, dois
  cartões de entrada (tabela e
  Assistente, este em destaque de cor), faixa de confiança com contagens
  derivadas do `consulta.json` (Aparelhos, marcas, capacidades) e a Versão da
  tabela, capacidades e marcas populares ligadas à tabela filtrada, Análises em
  destaque (condicional), chamada do Assistente em três passos, FAQ e
  metodologia/INMETRO. O `<head>` publica `WebSite` e `FAQPage`; a home não baixa
  JSON no cliente. Os links antigos
  `/?marca=…` são levados a `/aparelhos/` com a mesma querystring por um script
  curto na home (o `_redirects` não separa a mesma URL por parâmetros), e o menu
  tem Aparelhos, Assistente e, com ≥ 1 Análise, Análises.
  Uma integração copia `data/build/*` para
  `dist/`, então a API estática continua servida nas mesmas URLs
  (`/aparelhos.json`, `/consulta.json`, …). A página de busca do site saiu
  (ticket 30): `/busca/` e `/busca` redirecionam (301) para `/aparelhos/` por
  `apps/site/public/_redirects`. Os **chips de filtro** (marcas conhecidas e as
  seis capacidades comuns) vêm de uma curadoria do site (`apps/site/filtros.json`),
  validada no build:
  viram `<button aria-pressed>` a um clique, o resto fica no `<select>` e um
  valor curado ausente da base é ocultado — site-only, sem tocar em
  `data/build/` nem na semântica da consulta. A **ficha** do Aparelho
  (`src/lib/ficha.ts`) funde as Variantes de `dados` idênticos num bloco só com as
  tensões unidas, omite as vazias e troca as 13 linhas repetidas por um resumo e
  uma grade 2×2 das condições de ensaio (35 °C e 29 °C × carga total e parcial). As **Ofertas** (links comerciais de
  afiliado) vivem só aqui, em
  `apps/site/ofertas.json` (insumo curado do site, nunca na base servida), são
  validadas no build do site (glue `src/conteudo/ofertas.ts`) e renderizadas por
  componentes reutilizáveis (`OfertaCartao`/`OfertaFaixa`, que recebem `Oferta[]`
  ou um `aparelhoId`) na ficha do Aparelho, na Análise e nos destaques da home —
  separadas dos dados técnicos; os cartões de CTA da Análise vêm de `CtaCartao`
  e, quando há Oferta, de `OfertaCta` (ticket 47). A faixa aceita um
  `nivelTitulo` para acompanhar a hierarquia da página que a recebe. `pnpm verificar-links` confere os links sob demanda e imprime
  URL/loja/motivo dos quebrados, sem falhar. Ver ADR-0010 e ADR-0014.
- **Análises (conteúdo editorial)** — também em `apps/site`, uma coleção de
  conteúdo MDX (`src/content/analises/`, com `ANALISES_BASE` para o teste apontar
  uma fixture). Cada Análise é ligada a um Aparelho por `aparelhoId` e renderiza
  em `/analises/<slug>/`, com H1/data/corpo próprios, JSON-LD de `Article` e link
  para a ficha. O módulo puro `src/lib/analises.ts` valida o contrato (obrigatórios,
  formato do id e da data, slug único, uma por Aparelho) e constrói os índices; o
  glue `src/conteudo/analises.ts` lê a coleção. A seção é **condicional**: com zero
  Análises, `/analises/`, o item de menu, o sitemap e o `analises.json` não existem
  e o site segue com as 2.230 páginas (2.227 fichas + `/` + `/aparelhos/` + `/assistente/`). Com ≥ 1, o índice, o menu, o inventário
  `analises.json` (na raiz do site, com slug/url/aparelhoId/título/descrição/data),
  o JSON-LD aparecem automaticamente; a ficha ganha "Leia a análise",
  a Análise abre com o banner de transparência e ganha **3 cartões de CTA**
  (ficha técnica no topo, Assistente depois do corpo e "Continue a pesquisa" no
  fim) ou **4** quando há Oferta ("Ver oferta" no topo e "Onde comprar" no fim);
  sem Oferta, os cartões levam à ficha, ao Assistente e à tabela, e com o
  Aparelho Ausente, à tabela e ao índice de Análises — e a home ganha um bloco
  estático
  de Análises em destaque (`AnalisesDestaque`, montado no build — o cliente não
  baixa `analises.json` nem `ofertas.json`). A ilha da tabela recebe no build o
  mapa `aparelhoId → { titulo, url }`; o selo "Análise" (etiqueta de contorno)
  linka a Análise, as linhas analisadas ganham destaque e a tabela respeita a
  ordenação escolhida — sem promover analisados ao topo. Os analisados viram a
  vitrine "Aparelhos com análise" **fora** da `<table>`, sempre visível quando há
  ao menos uma Análise: primeiro os que passam no recorte (até 6, as capacidades
  mais compradas — 9.000, 12.000 e 18.000 BTU/h — primeiro, depois a recência) e,
  completando as vagas, Aparelhos similares de fora do recorte por capacidade,
  marca conhecida, atributos em comum e recência; cada cartão mostra a Marca, o
  título da Análise, a capacidade e o Tipo, e uma legenda explica quando só há
  similares. O bloco não entra na contagem, na ordenação nem no "Mostrar mais".
  Os cartões repetem os analisados que também aparecem, destacados, na tabela. O
  `/assistente/`
  recebe no build o mapa capacidade → analisados e só consulta o valor
  recomendado, sem busca no cliente (ticket 42).
  Um `aparelhoId` ausente da base servida **não** falha o build: a página degrada
  com aviso, sem bloco de dados e sem CTA. Nada disso entra em `data/build/`, na
  API ou na consulta. Ver ADR-0015.

- **assistente** — em `apps/site/src/lib/assistente.ts`, o motor puro do Assistente de dimensionamento (ticket 41): recebe as respostas das cinco telas do wizard (`/assistente/`) e devolve a Recomendação do Assistente — capacidade comercial recomendada, fatores usados, nível de confiança, explicação curta e orientações. Coeficientes fixos e auditáveis: base por m² conforme incidência solar (600/650/750/800 BTU/h), +600 BTU/h por pessoa adicional (limite superior da faixa), +600 BTU/h por eletrônico, +100 BTU/h por lâmpada, +200 BTU/h por janela a partir da 3ª, arredondamento comercial para cima (9.000 a 60.000 BTU/h), teto de 60.000 com alternativa dividida (2 × metade da capacidade quando for comercial e ≥ 9.000). A ilha React `Assistente.tsx` apenas coleta respostas e renderiza; não calcula. Todo o estado vive na URL, então recarregar e compartilhar preservam o resultado. No build, o mapa capacidade → analisados (ticket 42) é montado a partir das Análises publicadas e das `capacidadesBtu` do `consulta.json`, e só o valor recomendado é consultado — sem busca no cliente. ADR-0020 registra a decisão (heurística de mercado, sem LLM/Worker, Valor calculado nunca oficial, acima de 60.000 BTU/h indica mais de uma unidade e avaliação técnica).

- **comparação** — em `apps/site`, a sessão de Comparação (tickets 49–52): a página `/comparar/` (item "Comparar" no menu, entre Aparelhos e Assistente) e a ilha `Comparar.tsx`. Três campos de busca posicionais (`Modelo 1`, `Modelo 2`, `Modelo 3`) são comboboxes acessíveis sobre o mesmo `consulta.json` e motor MiniSearch da tabela (~8 sugestões com marca, modelo, capacidade e tipo); a escolha vira um cartão com "Trocar"/"Remover" e os campos aproximam ao remover o do meio. A seleção vive em `?ids=id1,id2,id3` — mesmo contrato da tabela, máximo de 3, ordem preservada, ids repetidos/desconhecidos descartados com aviso — separada de `FiltrosConsulta`, então nunca se mistura com filtros, busca ou ordenação. A página abre vazia (estado que explica a ferramenta), mostra um convite com 1 modelo e a matriz neutra de atributos (Tipo, Função, Capacidade, Tensão, Consumo anual, IDRS e Classe, como faixa quando há mais de uma Variante) com 2 ou 3 modelos; sem destaque de "melhor valor". O contrato puro `?ids=` vive em `apps/site/src/lib/comparacao.ts` (`lerIds`, `escreverIds`, `linhasDaComparacao`, `MAXIMO_COMPARACAO`), sem DOM, e a página publica canonical sem `ids` (não indexada). Ver ADR-0021.
- **aparelho:buscar** — `apps/site/src/lib/buscar-aparelho.ts` (busca pura) + `apps/site/scripts/buscar-aparelho.ts` (CLI, `pnpm aparelho:buscar`): procura na base servida por marca ou modelo (trecho, sem caixa nem acento) ou por potência exata em BTU e imprime marca, modelo, potência e `id` — o valor do `aparelhoId` de uma Análise (ticket 16). Só leitura: não cria artefato nem toca no pipeline.

## Interfaces

- **Entrada:** um caminho para uma exportação CSV nova do INMETRO.
- **Saída:** `aparelhos.jsonl`, `aparelhos.json`, `consulta.json`, `schema.json`,
  `registros.jsonl`, `manifest.json`, `anomalias.jsonl`, `excecoes-manuais.jsonl`,
  `vinculos-confirmados.jsonl` e `marcas-catalogo.jsonl` (estes três últimos como
  cópias publicadas) e um Relatório de revisão (Markdown).

## Serviço (fase 2) — API estática

- **JSON estático** (sem servidor, sem quota): consulta por ID, listas e a Versão
  da tabela — servidos como arquivos puros ao lado do site. É a única superfície
  pública de dados.
- **Consulta:** filtros combináveis e busca textual rodam **no cliente** sobre
  `consulta.json` (ADR-0008); o módulo isomórfico de `packages/api` é a definição
  única da semântica.
- **Valor calculado:** não há endpoint. A fórmula (`consumoAnualKwh × tarifa`) e
  as entradas são **documentadas** em `docs/base-consumer-guide.md`; o Agente calcula a partir
  de Valores oficiais e sempre apresenta a fórmula, as entradas e o aviso de que
  **não** é um Valor oficial.
- **Acesso:** aberto e ilimitado — são arquivos estáticos no Cloudflare Pages.
- **Histórico:** o Worker dinâmico (`/api/v1`: busca, comparação e Valor
  calculado) existiu até o ticket 13 e foi **removido** (ADR-0011), revertendo a
  parte dinâmica do ADR-0003 e superando o ADR-0009. O portão da Fase 2
  (2026-10-17) aprovou 10/10, com 9 respostas só pelo estático — o que motivou a
  remoção. Ver `docs/aceitacao/portao-fase-2.md`.

Ver ADR-0003 e ADR-0011.

## Distribuição

- O **dataset embarcado** é canônico: os artefatos JSONL/JSON são a fonte de verdade
  e o site consome uma cópia em build-time — `aparelhos.json` para as páginas de
  detalhe e `consulta.json` para a ilha de consulta.
- **Publicação (fase 1):** o merge em `main` publica o **build do site**
  (`apps/site/dist`) no **Cloudflare Pages** — o `pnpm build:site` roda sobre
  `data/build` e copia a base servida para a raiz do site, então a API estática
  (sem servidor nem cota) continua servida ao lado das páginas. Quando há Análise
  publicada, o build também emite `/analises.json` na raiz do site (o inventário
  editorial, separado da base servida). Setup manual em `docs/agents/ci-cd-setup.md`;
  ver ADR-0004.
- **Repositório público:** desde 2026-11-12, com licença dividida — **MIT** para o
  código (`LICENSE`) e **CC BY-NC 4.0** para o conteúdo editorial
  (`LICENSE-CONTENT`). Secret scanning e push protection ligados (§1.5 do runbook).
- **D1 (SQLite)** é só plano B, derivado do JSONL — nunca fonte de verdade.
- **R2** guarda blobs grandes se os assets estáticos passarem do bundle do site.
- **Caveats do free tier:** o plano gratuito do Cloudflare Pages tem limites de
  build/banda e termos de uso comercial a confirmar antes de monetizar.

## Stack

- **Runtime:** Node 24, **TypeScript**, ESM. Dev em **Windows (Git Bash)** e
  **Linux (bash)** — ordenação e line endings idênticos nos dois; LF forçado via
  `.gitattributes`.
- **Monorepo:** pnpm workspaces.
- **Contrato:** `@sinclair/typebox` → `schema.json`; validado com `ajv`.
- **CSV:** `csv-parse` (`bom: true`), nunca `split(",")`.
- **Testes:** Vitest, incluindo snapshots golden dos JSONL e do relatório.
- **Lint/format:** Biome.
- **Site:** Astro, **build estático**: páginas de detalhe pré-renderizadas para
  cada Aparelho + **duas ilhas React** — `Consulta.tsx` (filtros combináveis e
  busca textual no cliente, estado na URL) e `Assistente.tsx` (wizard de 5
  telas do Assistente, estado na URL, sem cálculo). O
  MiniSearch roda dentro da ilha sobre `data/build/consulta.json`. A consulta é
  100% estática (ADR-0008). As Ofertas (links comerciais) são um insumo curado do
  site (`apps/site/ofertas.json`), validado no build e verificado sob demanda
  (ADR-0010 e ADR-0014); os componentes `OfertaCartao`/`OfertaFaixa` renderizam o
  CTA na ficha, na Análise e nos destaques da home sem tocar na ilha, e os
  cartões de CTA da Análise vêm de `CtaCartao`/`OfertaCta` (ticket 47).
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml` + `publish.yml`), matrix
  Linux + Windows. O Linux é a referência e o Windows é **não-bloqueante**,
  porque falhas específicas de plataforma não devem travar o merge (decisão do
  ticket #06). O CI roda lint, typecheck, build
  (validação Ajv + invariantes) e Vitest, e inclui um gate de reprodutibilidade
  que falha se `data/build`/`reports` divergirem de um `pnpm build` novo. O
  Relatório de revisão só é anexado ao PR quando ele **adiciona** uma nova Versão
  da tabela (`data/raw/*.csv`); PRs de código/site ficam silenciosos (ADR-0012). A
  publicação é via PR (merge = deploy do **site** — `apps/site/dist`, que embute a
  base servida — no Cloudflare Pages). O que
  precisa existir **fora do git** (secrets/variables, proteção de branch, projeto
  Pages) está em `docs/agents/ci-cd-setup.md`. Ver ADR-0002 e ADR-0004.

A verificação de links das Ofertas é **manual** (`pnpm verificar-links`), fora do
CI: imprime URL/loja/motivo dos quebrados e não falha por link quebrado (ADR-0014).

## Observabilidade (Fase 4)

- **Tráfego humano:** Cloudflare Web Analytics no projeto Pages (beacon sem cookies
  nem banner, injetado pela Cloudflare). Habilitado no dashboard; ver
  `docs/agents/ci-cd-setup.md` §2.7. Ver ADR-0013.
- **Links quebrados:** verificação **manual e sob demanda** por
  `pnpm verificar-links`; o relatório (URL/loja/motivo) sai no terminal (ADR-0014).
  Corrigir uma Oferta é um PR comum em `apps/site/ofertas.json`.
- **Acesso do Agente:** o fetch dos `.json` não é medido pelo beacon; exige
  **domínio próprio** + analytics de zona por caminho — adiado (ADR-0013).

## Fora de escopo (MVP)

- Admin (fase 4).
- Cobrança / API paga.
- Código de barras como chave de identidade (guardado no bruto, não usado por ora).
