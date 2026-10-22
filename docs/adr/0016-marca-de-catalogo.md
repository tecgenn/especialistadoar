# Marca de catálogo como campo derivado, não reescrita da Marca oficial

**Status:** aceito

O catálogo agrupa 4 Marcas oficiais em 2 **Marcas de catálogo** (ver
`CONTEXT.md`): `SPRINGER MIDEA` e `MIDEA` sob **MIDEA** (97 + 67 Aparelhos), e
`FUJITSU/AIRSTAGE` e `AIRSTAGE` sob **FUJITSU** (14 + 13). Quem filtra "Midea"
perde hoje 67 Aparelhos e não tem como saber; quem busca "fujitsu" não encontra
os 13 Airstage, porque a palavra não existe no valor oficial da Marca.

A decisão é **derivar** a Marca de catálogo num campo novo do dataset de consulta
(`marcaCatalogo`, ao lado de `marca`), alimentado por uma camada curada
(`data/marcas-catalogo.jsonl`, no padrão do ADR-0006), em vez de reescrever a
Marca oficial na base servida.

## Considered Options

- **Campo derivado só no `consulta.json`** (escolhida) — o agrupamento nasce na
  curadoria, com `motivo` e `fonte`, e vive onde a consulta acontece: filtro,
  busca, lista de resultados e link "Ver outros aparelhos da marca". A base
  servida mantém a Marca oficial e toda a proveniência.
- **Reescrever a Marca na base servida** — propagaria o nome comercial para
  `aparelhos.json` e para a ficha. Como `id` é derivado da identidade (que inclui
  a marca), mudaria os `id`s e as **URLs das 80 fichas envolvidas** e apagaria o
  Valor oficial; também exigiria uma Exceção manual por Linha, sem ganho de
  consulta.
- **Alias só na ilha do site** — resolveria a tela, mas criaria duas definições
  de "Midea" (site × Agente) e deixaria `consulta.json` sem o agrupamento.
- **Sem curadoria, por heurística de nome** — `SPRINGER MIDEA` contém `MIDEA`,
  mas `AIRSTAGE` não contém `FUJITSU`; a heurística acertaria metade e não teria
  rastro de quem decidiu o quê.

## Consequences

- O `consulta.json` traz `marcaCatalogo` em todos os itens — igual a `marca`
  quando não há alias —, e a curadoria é republicada em
  `data/build/marcas-catalogo.jsonl` (cópia derivada, nunca editada à mão).
- O filtro por marca casa a Marca de catálogo **e** a Marca oficial, sem
  diferenciar maiúsculas: links antigos (`?marca=SPRINGER MIDEA`) continuam
  funcionando e devolvem a família inteira. A busca textual indexa as duas.
- A lista de resultados e o link "Ver outros aparelhos da marca" usam a Marca de
  catálogo; a ficha mantém a Marca oficial no `<h1>`, no título e na descrição.
  `id`, URL e sitemap não mudam.
- Um alias cuja **marca de origem** não está na Versão da tabela é **ignorado** —
  marcas entram e saem da exportação, e isso não é erro de build. Alias para si
  mesma é recusado. O nome de catálogo não precisa ser uma Marca oficial: é um
  agrupamento editorial (FUJITSU reúne duas Marcas oficiais). A resolução é de um
  nível: `catalogo` é o nome final exibido.
- Um Agente que consome `aparelhos.json` continua vendo a Marca oficial; quem
  quer a semântica do catálogo usa `marcaCatalogo` em `consulta.json`.
- A curadoria é opcional: com zero entradas, o comportamento é o de antes.
