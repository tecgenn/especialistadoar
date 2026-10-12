# PRD — Especialista do Ar

Documento de produto reconstruído a partir das decisões da sessão de
`grill-with-docs`. É a fonte que o `/to-tickets` usa para fatiar o trabalho.

## Objetivo

Uma base estruturada e versionada de aparelhos de ar-condicionado, construída a
partir da exportação oficial de produtos do INMETRO, consumida por **agentes de
IA (foco principal)** e por um site, para que ninguém precise interpretar o CSV
bruto.

## Fases de entrega

Uma **fase** é uma etapa de entrega vertical: um pedaço completo que já funciona
sozinho. **MVP = Fases 1–3.** Admin (Fase 4) é pós-MVP.

Ordem de entrega: **pipeline → API → site → admin**. Há um **portão de decisão**
após a Fase 2: se a API não bater "agente + web", reavalia antes de investir no
site. O custo do portão é adiar a receita de afiliado até a Fase 3; o benefício
é descobrir cedo se a API compete.

### Fase 1 — Pipeline, dataset, relatório e testes

O caminho completo: CSV bruto → base servida → Relatório de revisão.

- **Ingest:** registrar um snapshot raw imutável em `data/raw/<data>.csv`, com
  sha256 e manifesto (data de obtenção, origem); idempotente por conteúdo.
- **Parse:** CSV em RFC 4180 com `bom: true`; header com campo entre aspas
  contendo vírgula e espaço à direita — aparar nomes de colunas.
- **Normalizar (só formato):** casing, unidades-no-texto, parsing de tensão
  (bivolt `127-220`), `º`/`°`, coerção numérica. Preservar o Valor original e a
  proveniência (Versão da tabela).
- **Anomalias:** detectar valores fora do padrão (texto em campo numérico, coluna
  desalinhada) e mantê-los visíveis. É um sinal, não um erro fatal.
- **Exceção manual** e **Vínculo confirmado:** artefatos com motivo e fonte
  registrados; são a única forma de alterar conteúdo.
- **Agrupar em Aparelho:** identidade = marca + unid. interna + unid. externa (ou
  Modelo quando as unidades não vêm separadas); tensão fora da identidade. A base
  servida só inclui Aparelhos **com** Dados declarados; os demais ficam no
  histórico.
- **Artefatos:** `aparelhos.jsonl` + `aparelhos.json`, `registros.jsonl`,
  `schema.json` (gerado por TypeBox), `manifest.json`, `anomalias.jsonl`,
  `excecoes-manuais.jsonl`, `vinculos-confirmados.jsonl`.
- **Validação:** JSON Schema (Ajv) + invariantes de domínio (identidade única,
  só Aparelhos com Dados declarados na base servida, proveniência presente);
  violação falha o build.
- **Relatório de revisão:** comparar com a Versão anterior e classificar novos,
  alterados, Ausentes, Anomalias novas e Vínculos sugeridos.
- **Orquestrador `build`:** encadear ingest → normalize → group → validate →
  diff/report; só publica após revisão humana.
- **Publicação:** por Pull Request (merge é a publicação) — ver ADR-0004.
- **Testes:** Vitest com snapshots golden dos artefatos e do relatório.

### Fase 2 — API, docs e teste com agente  (PORTÃO)

- **Parte estática (sem Worker/cota):** consulta por ID, listas e a Versão da
  tabela, como arquivos JSON.
- **Parte dinâmica (Worker, `/api/v1/...`):** busca, comparação e Valor calculado.
- **Módulo de consulta compartilhado:** filtros por campo (BTU, tensão); MiniSearch
  só para busca textual (Pagefind fica para o conteúdo do site).
- **Documentação para agentes:** como consumir a base.
- **Teste de aceitação com um agente (portão):** ver abaixo.

#### Teste de aceitação com agente (portão da Fase 2)

- **O que prova:** um agente responde sozinho, sem humano no meio, usando só a
  base.
- **Acesso:** começa pelos arquivos **estáticos**; libera `/search` só como
  fallback. O caminho usado é logado — é o que revela se o Worker se justifica.
- **Critério de aprovação:** conjunto de ~10 perguntas reais com gabarito; acerto
  **≥ 8/10**, sem intervenção humana.
- **Decisão:** se passar, segue para o site; se não, reavalia a API antes de
  investir no site (e o Worker encolhe se o estático sozinho bastar).

### Fase 3 — Site, Ofertas e verificação de links

- **Catálogo em Astro** (estático + islands para interatividade).
- **Ofertas** (links de afiliado) exibidas **apenas no site**, nunca misturadas ao
  dataset técnico.
- **Job de verificação de links.**

### Fase 4 — Admin (pós-MVP)

- Interface administrativa para revisão/publicação.

## Decisões registradas

- ADR-0001 — CSV como fonte canônica (não o PDF).
- ADR-0002 — Stack (TypeScript, Node, pnpm, Vitest, csv-parse, TypeBox+Ajv, Biome).
- ADR-0003 — API híbrida (JSON estático + Worker) sobre dataset embutido.
- ADR-0004 — Publicação via PR.

## Perguntas abertas

- **Termos de uso comercial** do plano gratuito da Cloudflare: confirmar antes de
  qualquer monetização.
