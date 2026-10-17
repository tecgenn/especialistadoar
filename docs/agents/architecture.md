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
2. **API, docs, teste com agente** — JSON estático + Worker dinâmico; o teste de
   aceitação com um agente é o **portão de decisão** antes de construir o site.
3. **Site (Astro), Ofertas, job de verificação de links.**
4. **Admin** (pós-MVP).

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
  build/
    aparelhos.jsonl                   # base servida (Aparelhos com Dados declarados)
    aparelhos.json                    # espelho em array do acima
    consulta.json                     # dataset enxuto de consulta (~350 KB) p/ site + Worker
    registros.jsonl                   # Linhas normalizadas (proveniência)
    schema.json                       # contrato JSON Schema
    manifest.json                     # metadados de versão (hash, data, contagens)
    anomalias.jsonl                   # Anomalias por Linha
    excecoes-manuais.jsonl            # cópia publicada da Camada curada
    vinculos-confirmados.jsonl        # cópia publicada da Camada curada
reports/revisao-YYYY-MM-DD.md         # Relatório de revisão por nova versão (fase 1)
packages/pipeline/                    # o pipeline de build (CLI)
packages/api/                         # a API estática (leitura Node) + módulo de consulta isomórfico
packages/worker/                      # o Worker dinâmico /api/v1 (busca, comparação, Valor calculado)
apps/site/                            # catálogo Astro (fase 3)
```

1. **Bruto (versionado).** Cada exportação nova é guardada intacta em `data/raw/`,
   identificada por hash de conteúdo + data de obtenção. Preserva *toda* Linha,
   inclusive as sem Dados declarados — necessário para o diff.
2. **Camada curada.** As duas formas sancionadas de alterar conteúdo além de regra
   de formato, editadas à mão e **canônicas** na raiz de `data/`: a **Exceção
   manual** (correção de um campo de uma Linha, com motivo + fonte) e o **Vínculo
   confirmado** (fusão de identidade aprovada por uma pessoa). São *insumos* do
   build, não derivados. Ver ADR-0006.
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
    -> validação: schema.json + invariantes           (falha dura)
    -> data/build/aparelhos.jsonl (+ .json)           (só Aparelhos com Dados declarados)
    -> data/build/consulta.json                       (dataset enxuto p/ a ilha de consulta)
    -> data/build/{excecoes-manuais,vinculos-confirmados}.jsonl   (cópias publicadas)
    -> reports/revisao-<data>.md                      (novos / alterados / Ausentes / Anomalias / Vínculos)
    -> revisão humana (PR) antes de publicar
```

## Módulos principais

- **ingest** — registra um snapshot bruto (hash, data, origem); idempotente por
  conteúdo.
- **parse** — CSV em RFC 4180 com `bom: true`; cabeçalho aparado.
- **normalize** — padronização só de formato (BOM, casing, unidades-no-texto,
  parsing de tensão, coerção numérica, `º`/`°`); o texto de origem é preservado para
  proveniência.
- **anomalias** — sinaliza valores fora do padrão (não-numérico em campo numérico,
  colunas desalinhadas); o valor original é preservado, não corrigido.
- **excecoes** — lê e valida a Exceção manual; aplica-a sobre o Valor original
  *antes* da normalização; recusa correção só-de-formato, campo inexistente e
  exceção órfã (que não casa com nenhuma Linha desta Versão da tabela).
- **vinculos** — lê e valida o Vínculo confirmado; a identidade histórica
  (`anterior`) é canônica e absorve o Aparelho novo; guarda contra ciclos.
- **jsonl** — leitura/escrita de JSON Lines (writer único, também usado para
  republicar a curadoria).
- **group** — dobra Linhas em Aparelhos. A identidade é marca + unid. interna +
  unid. externa (ou Modelo quando as unidades não vêm separadas); a tensão fica fora
  da identidade (bivolt é um só Aparelho). Aceita um remapeamento canônico de
  identidade vindo dos Vínculos.
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
  listas de Aparelhos e a Versão da tabela, sem Worker. É o consumo estático da
  base servida; o módulo de consulta com filtros (fase 2) e o Worker dinâmico o
  reutilizam. O pipeline expõe seu contrato pelo entry point
  (`packages/pipeline/src/index.ts`) — o `api` nunca importa os internos.
- **consulta** — mesmo pacote `packages/api`, mas num *entry point* **isomórfico**
  (lógica pura, **sem** dependências de Node): filtros por campo e busca textual
  sobre o `data/build/consulta.json`. É importado pela **ilha do site** (navegador)
  e pelo **Worker** (Agente), uma só definição nos dois ambientes. A leitura de
  arquivo fica de fora desse entry (separar por entry point é o que impede `fs`
  de entrar no bundle). Ver ADR-0008.
- **worker** — em `packages/worker`, o Worker dinâmico de `.github/workflows/publish.yml`
  que serve `/api/v1/...` **só para o Agente**: `search` (delega ao módulo de
  consulta), `comparar` (Aparelhos lado a lado) e `valor-calculado` (conta
  determinística a partir de Valores oficiais + entradas da consulta, sempre com
  fórmula e entradas, nunca como Valor oficial). O dataset é **embutido** no
  bundle (importa `aparelhos.json` e `consulta.json`), sem D1. A lógica das rotas
  (`src/rotas.ts`) é pura e testável na fronteira HTTP; o entry só liga o `fetch`
  e o *Rate Limiting binding* (`env.LIMITE_POR_IP`, ver `ratelimits` no
  `wrangler.jsonc`). Acesso aberto com **limite por IP** na Cloudflare. Ver ADR-0003.

## Interfaces

- **Entrada:** um caminho para uma exportação CSV nova do INMETRO.
- **Saída:** `aparelhos.jsonl`, `aparelhos.json`, `consulta.json`, `schema.json`,
  `registros.jsonl`, `manifest.json`, `anomalias.jsonl`, `excecoes-manuais.jsonl` e
  `vinculos-confirmados.jsonl` (estes dois últimos como cópias publicadas) e um
  Relatório de revisão (Markdown).

## Serviço (fase 2) — API híbrida

- **JSON estático** (sem Worker, sem quota): busca por ID, endpoints de listagem e a
  versão da tabela — servidos como arquivos puros.
- **Worker dinâmico** (`/api/v1/...`): só busca textual, comparação e Valor calculado.
- **Consumidor do Worker:** somente o **Agente (consumidor)**. O **site não chama
  estas rotas** — a consulta dele roda no cliente (ADR-0008), então a cota gratuita
  fica reservada aos Agentes.
- **Acesso:** aberto no MVP, com **limite por IP** — hoje um *Rate Limiting
  binding* do Workers (`env.LIMITE_POR_IP`, 60 req/60 s por `CF-Connecting-IP`),
  best-effort e por localidade da Cloudflare; a regra de WAF (limite firme por
  zona) é a alternativa quando houver domínio próprio. Plano B se a quota
  gratuita apertar: Workers Paid.
- **Cobrança:** adiada; um gate de pagamento ficaria na frente da parte dinâmica sem
  mudar as respostas.
- **Portão da Fase 2 (2026-10-17):** aprovado **10/10** (critério ≥ 8/10). Nove das
  dez perguntas foram respondidas **só com o estático**; apenas o **Valor
  calculado** usou o Worker. A fase 3 (site) segue, e o Worker fica rebaixado a
  *calculadora determinística + fallback* — `/search` e `/comparar` sem evidência
  de necessidade. Ver ADR-0009 e `docs/aceitacao/portao-fase-2.md`.

Ver ADR-0003.

## Distribuição

- O **dataset embarcado** é canônico: os artefatos JSONL/JSON são a fonte de verdade
  e o site consome uma cópia em build-time — `aparelhos.json` para as páginas de
  detalhe e `consulta.json` para a ilha de consulta.
- **Publicação (fase 1):** o merge em `main` publica `data/build/` como arquivos
  estáticos no **Cloudflare Pages** (é a parte estática da API, sem Worker nem
  cota). O merge também faz `wrangler deploy` do Worker dinâmico
  (`packages/worker`). Setup manual em `docs/agents/ci-cd-setup.md`; ver
  ADR-0004.
- **D1 (SQLite)** é só plano B, derivado do JSONL — nunca fonte de verdade.
- **R2** guarda blobs grandes se os assets estáticos passarem do bundle do site.
- **Caveats do free tier:** o plano gratuito do Workers tem tetos de requisição/CPU e
  termos de uso comercial a confirmar antes de monetizar.

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
  cada Aparelho + **uma ilha React** de consulta (filtros combináveis e busca
  textual rodam no cliente, com o estado na URL). O Pagefind indexa o conteúdo; o
  MiniSearch roda dentro da ilha sobre `data/build/consulta.json`. O site **não**
  chama o Worker (ADR-0008).
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml` + `publish.yml`), matrix
  Linux + Windows. O Linux é a referência e o Windows é **não-bloqueante**; o
  repositório é público, então minutos de runner não são cobrados (a regra foi
  mantida por decisão do ticket #06). O CI roda lint, typecheck, build
  (validação Ajv + invariantes) e Vitest, e inclui um gate de reprodutibilidade
  que falha se `data/build`/`reports` divergirem de um `pnpm build` novo. A
  publicação é via PR (merge = deploy de `data/build` no Cloudflare Pages). O que
  precisa existir **fora do git** (secrets/variables, proteção de branch, projeto
  Pages) está em `docs/agents/ci-cd-setup.md`. Ver ADR-0002 e ADR-0004.

## Fora de escopo (MVP)

- Admin (fase 4).
- Cobrança / API paga.
- Código de barras como chave de identidade (guardado no bruto, não usado por ora).
