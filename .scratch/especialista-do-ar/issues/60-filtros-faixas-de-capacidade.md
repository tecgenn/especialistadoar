# 60 — Filtros: Faixas de Capacidade ao Lado da Capacidade Exata

**What to build:** O filtro de Capacidade deixa de ser uma lista de 44 valores exatos e passa a oferecer seis faixas em chips — até 9.000, 9.001–12.000, 12.001–18.000, 18.001–24.000, 24.001–30.000 e acima de 30.000 —, com a capacidade exata preservada no select do mesmo campo. Quem não sabe quantos BTUs precisa começa por uma faixa; quem sabe mantém a precisão. Faixa e capacidade exata são mutuamente exclusivas, a URL carrega o recorte (`btuMin`/`btuMax`) e `?btu=` continua funcionando.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] O contrato de consulta aceita `btuMin` e `btuMax` (números opcionais; `btuMax` ausente significa sem teto)
- [ ] A faixa casa qualquer Variante do Aparelho cuja capacidade esteja no intervalo, incluindo os limites
- [ ] Quando `btu` está presente, as faixas são ignoradas; escolher faixa limpa `btu`
- [ ] Escolher capacidade exata limpa `btuMin` e `btuMax`
- [ ] As seis faixas aparecem como chips na ordem comercial, e uma faixa sem nenhum Aparelho na base não é renderizada
- [ ] O select de capacidade exata continua no mesmo campo dos chips, sem repetir as faixas
- [ ] O resumo do recorte mostra a faixa como chip legível ("12.001–18.000 BTU/h") com "×" que a desfaz
- [ ] O chip de faixa aceso reflete o recorte vindo da URL, e desligar por "×" limpa as duas chaves
- [ ] `?btu=12000` continua abrindo o recorte antigo, com o select marcado e nenhum chip de faixa aceso
- [ ] O contador de resultados continua coerente ao trocar de faixa para exata e vice-versa
- [ ] Testes cobrem os limites (9.000 entra em "até 9.000", 9.001 entra na faixa seguinte), a exclusividade entre faixa e exata, o `?btu=` preservado e o chip de resumo
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
