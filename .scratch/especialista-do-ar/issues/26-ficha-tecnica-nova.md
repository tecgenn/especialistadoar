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

**Status:** done

## Decisões

- **O resumo é do Aparelho inteiro.** Quando as Variantes divergem (261 Aparelhos
  na Versão atual), o resumo mostra **faixa** ("2,88 – 2,95", "7.500 BTU/h
  (2.197 – 2.638 W)") em vez de escolher um valor: nenhuma Variante é descartada
  em silêncio, e quem quiser o valor exato de uma declaração vê a grade logo
  abaixo.
- **A Classe entra no resumo como lista**, não como faixa: "A" ou "A, B".
- **Variantes sem Dado declarado somem** — a Classe não conta como Dado declarado
  (ADR-0018), igual ao `group` do pipeline.
- **Tensões repetidas são numeradas.** Quando o mesmo Aparelho declara dados
  divergentes sob a mesma tensão, os blocos teriam títulos idênticos: eles
  ganham "declaração N de M" para ficar claro que são declarações distintas.
- **A ordem das tensões unidas é numérica crescente** ("127 / 220 V") e as Linhas
  da tabela do bloco são a união das Variantes fundidas, em ordem crescente.
- **A fase acompanha a voltagem.** Fundir as tensões não pode fundir as fases
  numa lista só: "220 V · monofásico, bifásico" + "380 V · trifásico" viraria
  "220 / 380 V · bifásico, monofásico, trifásico", associando trifásico aos
  220 V. Quando as voltagens aceitam as mesmas fases, elas vêm juntas
  ("127 / 220 V · monofásico"); quando diferem, cada voltagem vem com as suas
  ("127 / 220 V · 127 V: monofásico · 220 V: monofásico, bifásico").
- **A célula da grade mostra sempre o par** "capacidade / potência", com "—" no
  valor que a Linha não declara ("245 / — W", "— / 8.680 W"), para o par não
  mudar de forma entre as células.
- A ficha é **site-only**: nada muda em `data/build/`, na base servida, nos `id`s
  nem nas URLs.

- [x] Função pura `agruparVariantes` (em `apps/site/src/lib/`): funde idênticas,
      omite vazias, preserva divergentes; testada sem I/O.
- [x] O resumo mostra Classe e os demais valores; valor ausente aparece como "—".
- [x] A grade omite linha/coluna vazia e traz a explicação das condições de ensaio.
- [x] A ficha de `GREE GJC07BK-A3NRND2A` (3 Variantes: uma vazia e duas idênticas
      em 127 V e 220 V) mostra um só bloco com as duas tensões.
- [x] A Proveniência lista todas as Linhas; Ofertas, "Leia a análise" e o link da
      marca ficam como estão.
- [x] Leitura em tela de 360 px sem rolagem horizontal; a grade é uma `<table>` com
      cabeçalhos.
- [x] Nenhum artefato de `data/build` muda neste ticket; `pnpm build:site` gera as
      2.462 páginas.
