# 21 — Marca de catálogo (Midea e Fujitsu)

**What to build:** filtrar "Midea" passa a trazer os 164 Aparelhos da família (97 Midea
+ 67 Springer Midea) e filtrar ou buscar "Fujitsu" traz os 27 (14 Fujitsu/Airstage + 13
Airstage) — sem que a Marca oficial da tabela do INMETRO mude em lugar nenhum. Um
insumo curado novo define a **Marca de catálogo** (marca oficial → marca sob a qual o
catálogo agrupa), validado no build e republicado como cópia derivada; alias que aponta
para uma marca ausente da Versão é ignorado. O dataset enxuto de consulta ganha
`marcaCatalogo` ao lado de `marca`; o filtro por marca e a busca textual passam a usar a
marca de catálogo (aceitando o valor oficial, para links antigos); a lista de resultados
e o link "Ver outros aparelhos da marca" adotam a marca de catálogo, enquanto a ficha
mantém a Marca oficial no título e no `<h1>`. `id`, URL e sitemap das fichas permanecem
idênticos e a base servida completa não muda.

**Blocked by:** 20 — Capacidades impossíveis corrigidas e sinalizadas.

**Status:** ready-for-agent

- [ ] Insumo curado com os três aliases (SPRINGER MIDEA → MIDEA; FUJITSU/AIRSTAGE e
      AIRSTAGE → FUJITSU), cada um com `motivo` e `fonte`, validado no build (campos
      obrigatórios, alias para si mesma recusado) e com cópia publicada; alias órfão é
      ignorado sem quebrar o build.
- [ ] O `consulta.json` traz `marcaCatalogo` em todos os itens (igual à `marca` quando
      não há alias), e o `aparelhos.json` mantém a Marca oficial e nenhuma identidade
      alterada.
- [ ] A consulta devolve 164 para "MIDEA", 67 para "SPRINGER MIDEA" (valor oficial
      antigo), 27 para "FUJITSU" e 27 na busca por "fujitsu"; filtro e busca continuam
      se intersectando.
- [ ] A lista de resultados do catálogo e o link "Ver outros aparelhos da marca" usam a
      marca de catálogo; a ficha segue com a Marca oficial no `<h1>`, no título e na
      descrição, e a URL não mudou.
- [ ] `docs/agentes.md` documenta o campo e a semântica; `CONTEXT.md` ganha **Marca de
      catálogo**; o ADR-0016 registra a escolha (campo derivado, não reescrita da Marca
      oficial).
- [ ] `pnpm build` reproduz `data/build` e `reports` byte a byte.
