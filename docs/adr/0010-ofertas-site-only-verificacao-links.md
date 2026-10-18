# Ofertas vivem só no site; um job agendado verifica os links

**Status:** aceito

Uma **Oferta** é um link comercial de afiliado para um Aparelho — exibido
**apenas no site** e nunca misturado aos dados técnicos (ver `CONTEXT.md`). Ela
vive em `apps/site/ofertas.json`, um insumo **curado do site**, fora do pipeline e
fora de `data/build/`. A base servida (`aparelhos.jsonl`/`.json`) não ganha nenhum
campo de Oferta: o Agente que consome a API estática ou o Worker nunca vê Ofertas.
Um job agendado (`.github/workflows/verificar-links.yml`) faz uma requisição a cada
URL e **reporta as quebradas**, para o site não exibir links mortos.

## Considered Options

- **Oferta como campo de Aparelho** (recusada) — misturaria dado comercial a dado
  do INMETRO na base servida, justo o que a definição de Oferta proíbe.
- **Oferta como artefato do pipeline** em `data/build/ofertas.json` (recusada) —
  publicaria o material comercial na mesma superfície da API, e o pipeline passaria
  a conhecer um conceito que é do site.
- **Arquivo curado do site** (escolhida) — `apps/site/ofertas.json` é lido só no
  build do site; separa a responsabilidade, garante que nada vaze e mantém o
  pipeline indiferente ao comercial.

## Consequences

- Novo insumo `apps/site/ofertas.json` (array de `{ aparelhoId, loja, titulo,
  url }`), validado no build do site: campo em branco, URL não-http(s), Oferta
  órfã (Aparelho inexistente) e duplicata **falham o build**.
- O módulo puro `apps/site/src/lib/ofertas.ts` (validação/indexação) e o
  `apps/site/src/lib/verificacao-links.ts` (verificação com a busca injetada) são
  testáveis sem rede; a página de detalhe renderiza as Ofertas do Aparelho numa
  seção própria, marcada como comercial e separada dos dados técnicos.
- Um job **agendado** (diário) e disparável à mão (`pnpm verificar-links`) reporta
  links quebrados e sai com código 1 quando há algum. Não bloqueia PRs — a rede é
  instável e não deve derrubar merges alheios.
- `data/build/` e `reports/` permanecem inalterados; o pipeline não conhece
  Ofertas. Uma guarda de teste confere que nenhum Aparelho publicado traz campo de
  Oferta.
