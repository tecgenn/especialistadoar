# Especialista do Ar

Base estruturada e versionada de aparelhos de ar-condicionado, construída a partir
da exportação oficial de produtos do INMETRO (um CSV) e consumida por agentes de
IA e por um site. O objetivo é que ninguém precise interpretar a exportação bruta.

- **Vocabulário e conceitos do domínio:** `CONTEXT.md`
- **Como um Agente consome a base (arquivos JSON estáticos):** `docs/agentes.md`
- **Como o código está estruturado:** `docs/agents/architecture.md`
- **O que já está pronto e o que vem a seguir:** `docs/agents/project-state.md`
- **Decisões e porquês:** `docs/adr/`
- **Setup manual de CI e publicação (GitHub + Cloudflare):** `docs/agents/ci-cd-setup.md`

## Requisitos

- Node 24 (`node -v`)
- pnpm 10 (`corepack enable`, que passa a ler a versão de `packageManager`)

## Comandos

```bash
pnpm install

pnpm build       # CSV bruto + curadoria -> data/build/ + reports/
pnpm build:site  # site Astro (apps/site/dist), sobre data/build/ — rode pnpm build antes
pnpm dev:site    # Astro em modo dev (site)
pnpm preview:site # pré-visualiza o build do site
pnpm verificar-links # verifica os links das Ofertas e lista os quebrados (manual, sem CI)
pnpm aparelho:buscar "termo" # busca Aparelho por marca/modelo/potência e imprime o id
pnpm test        # suíte Vitest (uma passada)
pnpm test:watch  # Vitest em watch
pnpm typecheck   # tsc --noEmit
pnpm lint        # Biome (check, não altera)
pnpm lint:fix    # Biome (corrige)
pnpm format      # Biome format
```

## Verificar links quebrados das Ofertas

A verificação é **manual e sob demanda** — não há workflow agendado nem job de CI
(ADR-0014):

```bash
pnpm verificar-links
```

O comando lê `apps/site/ofertas.json`, faz uma requisição a cada URL e imprime um
relatório no terminal. Com tudo certo:

```
## Relatório de links quebrados

0 Oferta(s) verificada(s), nenhum link quebrado.
```

Se algum link estiver quebrado, aparece a loja, a URL e o motivo — e o comando
**não falha**:

```
## Relatório de links quebrados

3 Oferta(s) verificada(s), 1 link(s) quebrado(s).

| Loja | URL | Motivo |
| --- | --- | --- |
| Loja X | https://lojax.com/produto | HTTP 404 |
```

Para corrigir, atualize a Oferta em `apps/site/ofertas.json` e abra um PR normal.
`ofertas.json` inválido (fora do schema) ainda faz o comando falhar — é erro de
configuração, não link quebrado.

## Buscar o `id` de um Aparelho para o frontmatter

Uma Análise é ligada ao Aparelho pelo `aparelhoId` do frontmatter. Para achar esse
`id` sem caçar no JSON:

```bash
pnpm aparelho:buscar "britania"
pnpm aparelho:buscar "12.000"
pnpm aparelho:buscar "gjc07"
```

A busca é por marca, modelo (trecho, sem diferenciar caixa nem acento) ou potência
em BTU (valor exato), e lê a base servida publicada em `data/build/` — rode
`pnpm build` antes se ela estiver desatualizada. A saída lista um Aparelho por linha:

```
32 Aparelhos encontrados para "britania":

BRITÂNIA — BAC24FC — 24.000 BTU — ap-c8637455a11e
BRITÂNIA — BAC12FC — 12.000 BTU — ap-a14e9894ce8e
...

Copie o `id` para o `aparelhoId` no frontmatter da Análise.
```

Sem resultado, o comando imprime uma mensagem clara em vez de saída vazia. Ele só
lê a base: não altera `data/build/` nem cria artefato.

## Escrever uma Análise

Uma **Análise** é uma peça editorial em MDX sobre **um** Aparelho, publicada em
`/analises/<slug>/` e ligada à ficha pelo `aparelhoId` (ADR-0015). Os arquivos
vivem em `apps/site/src/content/analises/` — nada dela entra em `data/build/`:

```mdx
---
aparelhoId: ap-c8637455a11e
slug: britania-bac24fc-vale-a-pena
titulo: "Britânia BAC24FC: vale a pena para 24.000 BTU?"
descricao: "Uma leitura editorial do Britânia BAC24FC."
data: 2026-10-20
---

## O que os dados mostram

Texto editorial, com números próprios...
```

- `aparelhoId` é o `id` do Aparelho — obtenha com `pnpm aparelho:buscar "termo"`.
- `slug` vira a URL e precisa ser único, sem `/`.
- `data` pode ficar sem aspas; o build normaliza para `YYYY-MM-DD`.
- Imagens entram pelo componente de imagem do Astro (`astro:assets`), com `alt`.
- O **CTA da Oferta** aparece sozinho no fim da Análise quando o Aparelho tem
  Oferta em `apps/site/ofertas.json`; sem Oferta (ou com o Aparelho fora da
  tabela), nada é renderizado. No meio do texto, use o mesmo componente:
  importe `../../components/OfertaFaixa.astro` no MDX e passe
  `<OfertaFaixa aparelhoId="ap-..." />` — sem estilo inline.
- Com **zero** Análises o site fica exatamente como hoje: sem `/analises/`, sem
  menu, sem `analises.json` e sem entrada no sitemap. A primeira Análise liga
  tudo automaticamente, inclusive o "Leia a análise" na ficha do Aparelho.
- O build valida o contrato e **falha** em campo obrigatório vazio, `aparelhoId`
  fora do formato, `slug` repetido ou mais de uma Análise para o mesmo Aparelho.
- Se o Aparelho sair da tabela, a Análise continua publicada em estado degradado:
  aviso de que ele não consta na Versão atual, sem bloco de dados e sem CTA.

## ⚠️ Antes de dar push

Rode a suíte completa **e** o build antes de enviar qualquer mudança:

```bash
pnpm build && pnpm build:site && pnpm lint && pnpm typecheck && pnpm test
```

E **commite os artefatos gerados junto com a mudança** sempre que ela tocar o CSV
bruto (`data/raw/`) ou a camada curada (`data/excecoes-manuais.jsonl`,
`data/vinculos-confirmados.jsonl`). O `pnpm build` regenera `data/build/` e
`reports/revisao-<data>.md`; esses arquivos são **commitados** e o CI falha se
divergirem de um build novo (o gate *"Published artifacts match a fresh build"*).

**Nunca edite `data/build/` à mão** — ele é derivado. Alterações de conteúdo
passam só pela camada curada (Exceção manual, Vínculo confirmado); o resto é regra
de formato no pipeline.

## Contribuição

Trabalhe em uma branch e abra um Pull Request para `main` (a branch é protegida por
PR + check do CI). O merge é a publicação (ADR-0004). Detalhes do fluxo e das ações
manuais necessárias em `docs/agents/ci-cd-setup.md` e `AGENTS.md`.
