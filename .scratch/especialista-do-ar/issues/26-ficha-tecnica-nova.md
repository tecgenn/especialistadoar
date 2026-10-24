# 26 — Ficha técnica nova (resumo, grade 2×2 e Variantes fundidas)

**What to build:** a ficha de cada Aparelho deixa de ter 13 linhas repetidas por
Variante. No topo, um **resumo**: capacidade em BTU/h com W entre parênteses, IDRS,
Classe, consumo anual e potência em espera. Depois, uma **grade 2×2** das condições
de ensaio (35 °C e 29 °C × carga total e parcial) em que cada célula mostra
"capacidade / potência" em W, com uma frase curta explicando o que são as
condições; linhas e colunas sem nenhum dado ficam ocultas. **Variantes** com `dados`
idênticos viram um bloco só com as tensões unidas ("127 / 220 V"), e Variantes sem
nenhum dado deixam de aparecer. A Proveniência continua listando todas as Linhas da
tabela; a base servida não muda.

**Blocked by:** 24 — Classe, Situação e campos da tabela.

**Status:** ready-for-agent

- [ ] Função pura `agruparVariantes` (em `apps/site/src/lib/`): funde idênticas,
      omite vazias, preserva divergentes; testada sem I/O.
- [ ] O resumo mostra Classe e os demais valores; valor ausente aparece como "—".
- [ ] A grade omite linha/coluna vazia e traz a explicação das condições de ensaio.
- [ ] A ficha de `GREE GJC07BK-A3NRND2A` (3 Variantes: uma vazia e duas idênticas
      em 127 V e 220 V) mostra um só bloco com as duas tensões.
- [ ] A Proveniência lista todas as Linhas; Ofertas, "Leia a análise" e o link da
      marca ficam como estão.
- [ ] Leitura em tela de 360 px sem rolagem horizontal; a grade é uma `<table>` com
      cabeçalhos.
- [ ] Nenhum artefato de `data/build` muda neste ticket; `pnpm build:site` gera as
      2.462 páginas.
