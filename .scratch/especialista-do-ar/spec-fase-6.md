# Spec — Fase 6: Filtros do catálogo, Marca de catálogo e capacidades corrigidas

**Status:** ready-for-agent

## Problem Statement

O catálogo tem 2.460 Aparelhos e 2.462 páginas, mas o primeiro contato com os
filtros ainda é uma lista crua — e começa por dados errados:

1. **Marcas.** O filtro é uma lista alfabética única de 73 marcas oficiais, em
   caixa alta, sem distinção entre o que as pessoas procuram e o que é obscuro.
   Pior: a mesma marca comercial aparece partida em duas na tabela — `MIDEA` (97
   Aparelhos) e `SPRINGER MIDEA` (67); `FUJITSU/AIRSTAGE` (14) e `AIRSTAGE` (13).
   Quem filtra "Midea" perde 67 Aparelhos e não tem como saber; quem digita
   "fujitsu" na busca não encontra os 13 Airstage, porque a palavra não existe no
   nome da marca oficial.
2. **Capacidade.** O menu abre em `12`, `30` e `120` BTU/h — valores que não
   existem, digitados errados na própria exportação do INMETRO (a Gree omitiu os
   zeros em três Linhas; a AGRATTO trouxe BTU e W trocados, o que produz um
   quarto valor impossível, `16115`). As seis capacidades que concentram o
   catálogo (9.000 a 36.000 BTU/h, 1.961 dos 2.460 Aparelhos) ficam misturadas a
   46 outras, e a primeira coisa que o visitante lê são números absurdos.
3. **Operação.** A Exceção manual é presa à Versão da tabela. Quando chegar a
   próxima exportação, as correções de hoje serão ignoradas e os valores
   truncados voltariam em silêncio — um número truncado é numericamente válido e
   hoje não vira Anomalia, então o Relatório de revisão não diria nada.

## Solution

Três entregas, independentes, nesta ordem:

1. **Corrigir as capacidades por curadoria.** As 5 Linhas afetadas recebem 6
   Exceções manuais com motivo e fonte (nenhum Aparelho é excluído). Em paralelo,
   a detecção de Anomalias ganha o tipo `valor_implausivel` — regra de
   plausibilidade por coluna, estreando com "capacidade nominal abaixo de 1.000
   BTU/h". A Anomalia **não** corrige nada: ela sinaliza, e a próxima Versão da
   tabela que trouxer o erro de novo o mostrará no Relatório de revisão.
2. **Marca de catálogo.** Uma camada curada que agrupa marcas oficiais sob o nome
   que as pessoas procuram — **Midea** (Midea + Springer Midea) e **Fujitsu**
   (Fujitsu/Airstage + Airstage). Ela é projetada no dataset de consulta como
   `marcaCatalogo`, usada pelo filtro e pela busca, e não altera a Marca oficial
   da base servida, o `id` nem a URL de nenhuma ficha.
3. **Menus de filtro.** As 10 marcas conhecidas e as 6 capacidades comuns viram
   **chips** visíveis (um clique, sem abrir lista); o `<select>` de cada filtro
   guarda "Todas…" + o resto. O estado continua na URL (`?marca=&btu=`).

O resultado: o filtro abre pelas marcas e capacidades que importam, "Midea" e
"Fujitsu" trazem todos os Aparelhos da família, e nenhuma capacidade impossível
aparece como opção.

## User Stories

1. Como visitante, quero ver as marcas mais conhecidas como botões logo no
   filtro, para escolher em um clique sem abrir uma lista de 73 nomes.
2. Como visitante, quero ver as capacidades mais comuns como botões, para achar
   em um clique o 12.000 BTU que quase todo mundo procura.
3. Como visitante, quero que as marcas e capacidades conhecidas venham **antes**
   do resto, para não ter que rolar uma lista inteira.
4. Como visitante, quero que o resto das marcas e capacidades continue
   disponível, para não perder acesso a nenhum Aparelho.
5. Como visitante, quero filtrar "Midea" e ver também os Aparelhos vendidos como
   Springer Midea, para não perder 67 modelos por causa do nome.
6. Como visitante, quero filtrar "Fujitsu" e ver também os Airstage, para não
   precisar saber que Airstage é uma linha Fujitsu.
7. Como visitante, quero digitar "fujitsu" na busca e encontrar os Airstage, pelo
   mesmo motivo.
8. Como visitante, quero que a ficha continue mostrando a marca que está na
   tabela do INMETRO, para saber exatamente qual produto estou vendo.
9. Como visitante, quero que o link "Ver outros aparelhos da marca" da ficha me
   leve a todos os Aparelhos da marca de catálogo (164 Midea, 27 Fujitsu), e não
   só a uma parte.
10. Como visitante, não quero ver `12`, `30`, `120` ou `16115` BTU/h como opções,
    para não desconfiar do catálogo.
11. Como visitante, quero que a ficha de um Aparelho afetado mostre a
    capacidade corrigida (12.000 / 30.000 / 55.000 BTU/h), para o dado exibido
    ser o real.
12. Como visitante no celular, quero que os chips quebrem linha, para todos
    ficarem visíveis sem rolagem horizontal escondida.
13. Como visitante, quero que clicar de novo no chip ativo limpe o filtro, para
    não precisar procurar o botão "Limpar filtros".
14. Como visitante, quero que escolher uma marca no `<select>` desligue o chip e
    vice-versa, para nunca ficar com dois valores de marca ao mesmo tempo.
15. Como visitante que compartilha links, quero que a URL com o filtro continue
    funcionando ao abrir, inclusive com os nomes oficiais antigos.
16. Como visitante que usa leitor de tela, quero que o chip ativo seja anunciado
    como pressionado, para saber o que está filtrado.
17. Como visitante que usa só teclado, quero alcançar e acionar os chips com Tab
    e Enter/Espaço.
18. Como mantenedor, quero corrigir as capacidades por Exceção manual com motivo
    e fonte, para nunca alterar conteúdo sem rastro.
19. Como mantenedor, quero que as correções não excluam nenhum Aparelho, para não
    criar "Ausentes" fantasma na próxima Versão da tabela.
20. Como mantenedor, quero que uma Versão futura com capacidade impossível
    apareça como Anomalia nova no Relatório de revisão, para ser avisado na hora
    em que reviso a nova exportação.
21. Como mantenedor, quero que a regra de implausibilidade seja uma tabela por
    coluna, para acrescentar outras inconsistências depois sem mexer no detector.
22. Como mantenedor, quero editar as listas de marcas e capacidades num arquivo
    de curadoria, sem tocar em código.
23. Como mantenedor, quero que um valor curado que não existe na base seja
    escondido em silêncio, para o build não quebrar quando uma marca sair da
    tabela.
24. Como mantenedor, quero que a curadoria de marca de catálogo seja validada
    (motivo, fonte, valor não vazio, sem alias para si mesma), para o insumo não
    apodrecer.
25. Como Agente (consumidor da base), quero `marcaCatalogo` ao lado de `marca` no
    `consulta.json`, para filtrar pela mesma marca que o site mostra.
26. Como Agente, quero que a busca e o filtro por marca tenham a mesma semântica
    do site, para não ter duas definições de "Midea".
27. Como Agente, quero que o novo tipo de Anomalia esteja documentado, para não
    interpretar `valor_implausivel` como erro fatal.
28. Como revisora de PR, quero que `aparelhos.json` mude apenas nos 4 Aparelhos
    corrigidos, e que `id`s e URLs de fichas permaneçam idênticos, para revisar
    uma mudança pequena e segura.
29. Como revisora, quero que `data/build` continue reproduzível byte a byte por
    um `pnpm build` novo, para o portão de reprodutibilidade do CI valer.
30. Como mantenedor, quero que a decisão de criar a Marca de catálogo fique
    registrada em ADR, para o próximo leitor entender por que o site diz "Midea"
    num produto cuja Marca oficial é "Springer Midea".

## Implementation Decisions

- **Correção de conteúdo por Exceção manual**, a única forma sancionada de alterar
  conteúdo (ADR-0006). São 5 Linhas e 6 Exceções: `5278` (BTU 30 → 30000), `7133`
  (BTU 12 → 12000), `7200` (BTU 120 → 12000), `7428` (BTU 12 → 12000) e `3709`
  (BTU 16115 → 55000 **e** W 55000 → 16115). `motivo` e `fonte` apontam para a
  própria coluna de capacidade/potência da mesma Linha, que desmente o valor
  truncado. Nenhum Aparelho é excluído: seguem 2.460.
- **Anomalia `valor_implausivel`**: o detector ganha uma tabela de regras de
  plausibilidade por coluna, extensível; a primeira regra é "Capacidade de
  Refrigeração Nominal (Btu/h) < 1.000 BTU/h". A detecção continua rodando
  **depois** das Exceções — logo, na Versão atual o total permanece 15 Anomalias,
  e o `anomalias.jsonl` não muda. A Anomalia é sinal, nunca correção.
- **Marca de catálogo como camada curada nova** (JSONL com `marca`, `catalogo`,
  `motivo`, `fonte`), validada no build e republicada como cópia derivada, no
  mesmo padrão das Exceções e dos Vínculos (ADR-0006). Aliases que apontam para
  uma marca ausente da Versão atual são **ignorados** (marcas entram e saem da
  tabela; não é erro de build). Alias para si mesma é recusado. Entradas iniciais:
  `SPRINGER MIDEA → MIDEA`, `FUJITSU/AIRSTAGE → FUJITSU`, `AIRSTAGE → FUJITSU`.
- **Projeção só no dataset de consulta.** A base servida mantém a Marca oficial; o
  dataset enxuto ganha um campo derivado, sempre presente:

  ```ts
  interface ItemConsulta {
    id: string;
    marca: string;          // Marca oficial, do INMETRO
    marcaCatalogo: string;  // agrupamento; igual a `marca` quando não há alias
    modelo: string;
    tipo: string | null;
    capacidadesBtu: number[];
    tensoes: number[];
  }
  ```

- **Semântica do filtro**: `marca` casa com `marcaCatalogo` (sem diferenciar
  maiúsculas/minúsculas) e **também** aceita o valor oficial, para links
  compartilhados antigos (`?marca=SPRINGER MIDEA`) não morrerem. A busca textual
  indexa `marca` **e** `marcaCatalogo`.
- **O que o site mostra**: a lista de resultados e o link "Ver outros aparelhos
  da marca" usam a Marca de catálogo; a ficha mantém a Marca oficial no `<h1>`,
  no título e na descrição. `id`, URL e sitemap não mudam.
- **Chips**: curadoria do site (JSON com marcas `{ valor, rótulo }` e as 6
  capacidades), validada no build do site; rótulos curados só para os chips, e o
  `<select>` do resto continua exibindo o valor oficial. Ordem: as marcas na
  ordem curada (Samsung, LG, Midea, TCL, Elgin, Hisense, Daikin, Fujitsu,
  Hitachi, Gree), as capacidades em ordem crescente. Chips quebram linha também
  no celular. Estado único: o chip aceso **é** o valor do filtro; clicar de novo
  limpa; escolher no `<select>` apaga o chip. Chips são `<button aria-pressed>`.
- **Valor curado ausente da base** é escondido em silêncio (a lista é curadoria, o
  dado manda); o build não falha por isso.
- **Documentação**: novo termo **Marca de catálogo** no glossário, **ADR-0016**
  registrando a escolha (campo derivado, não reescrita da Marca oficial), e
  `docs/agentes.md` atualizado com `marcaCatalogo`, a nova semântica do filtro e o
  tipo de Anomalia.
- **Nada muda** em Ofertas, Análises, Worker (inexistente), `schema.json` da base
  servida ou na identidade do Aparelho.

## Testing Decisions

Um bom teste aqui observa **comportamento externo**: os artefatos emitidos, a
semântica do módulo de consulta, as listas derivadas das opções e o DOM da ilha.
Nada de testar função interna de formatação ou estrutura de implementação.

1. **`runBuild` com fixture CSV + curadoria em diretório temporário** (costura já
   usada por pipeline e api). Cobre: a Exceção muda a capacidade projetada; a
   Exceção órfã continua recusada; `marcaCatalogo` aparece no `consulta.json` e a
   `marca` oficial **não** muda no `aparelhos.json`; alias de marca ausente é
   ignorado. Prior art: `build.test.ts`, `excecoes.test.ts`,
   `api/test/consulta.test.ts`.
2. **`criarConsulta(dataset).filtrar(...)`** (puro). Cobre: `marca: "MIDEA"` traz
   Midea + Springer Midea; `marca: "SPRINGER MIDEA"` (valor oficial) continua
   trazendo os Springer Midea; `q: "fujitsu"` traz os Airstage; filtro + busca
   continuam se intersectando. Prior art: `api/test/consulta.test.ts`.
3. **`opcoesDe(dataset, curadoria)`** (puro, com a curadoria injetada). Cobre:
   chips na ordem curada, resto alfabético, valor curado ausente oculto,
   capacidades crescentes e as comuns separadas. Prior art: `opcoes.test.ts`.
4. **Ilha em jsdom**. Cobre: clicar no chip filtra e escreve `?marca=`; clicar de
   novo limpa; escolher no `<select>` apaga o chip; estado restaurado da URL;
   "Limpar filtros" segue aparecendo só com filtro ativo; a lista mostra a Marca
   de catálogo. Prior art: `consulta.test.tsx`.
5. **Build do site com fixture**. Cobre: a ficha de um Aparelho Springer Midea
   mantém a Marca oficial no título e tem o link com `?marca=MIDEA`; `id` e URL
   inalterados. Prior art: `analises-build.test.ts`.
6. **Detector de Anomalias** (puro e via `runBuild` sobre a exportação real).
   Cobre: BTU abaixo de 1.000 gera `valor_implausivel`; um valor corrigido não
   gera; o build real continua com 15 Anomalias e o golden de
   `anomalias.jsonl` não muda. Prior art: `anomalias.test.ts`, `build.test.ts`.
7. **Portão de reprodutibilidade do CI** continua valendo: `data/build` e
   `reports` precisam sair idênticos de um `pnpm build` novo.

## Out of Scope

- As ~26 Linhas com inconsistência na coluna de **Watts** (não afetam o menu;
  precisam de análise caso a caso).
- Canonicalizar outras famílias de marca (`TECHFRIO POP`, `SPRINGER`,
  `MODERNITÁ`) — evidência fraca; o insumo aceita inclusão futura sem código.
- Rótulos curados para as 61 marcas fora dos chips.
- Combobox com digitação/autocomplete na marca.
- Alterar a Marca oficial na base servida, ou o esquema de `id`/URL das fichas.
- Exibir Anomalias na ficha ou no site.
- Qualquer mudança na camada editorial de Análises ou nas Ofertas.

## Further Notes

- **Números de referência** (Versão da tabela de 2026-10-12): 2.460 Aparelhos;
  15 Anomalias; 73 marcas oficiais → **71 marcas de catálogo** (10 chips + 61 no
  `<select>`); 52 capacidades distintas → **48** depois da correção (6 chips + 42
  no `<select>`); **164** Aparelhos sob Midea e **27** sob Fujitsu; 1.961
  Aparelhos nas seis capacidades comuns.
- **As Exceções são presas à Versão.** Quando entrar um `inmetro-export-<data>.csv`
  novo, elas serão ignoradas (por desenho) e as Linhas truncadas voltarão como
  `valor_implausivel` no Relatório de revisão — o lembrete para recadastrá-las com
  os novos números de Linha. Vale dizer isso no corpo do PR do ticket de correção.
- **Divisão em tickets** (um por PR, nesta ordem):
  `20` — corrigir as capacidades (Exceções + Anomalia `valor_implausivel`);
  `21` — Marca de catálogo (insumo, projeção, filtro, busca, ficha);
  `22` — chips dos filtros (curadoria do site, `opcoesDe`, ilha, CSS).
- O ADR-0016 fecha a decisão de a Marca de catálogo ser **derivada** e não uma
  reescrita da Marca oficial: reescrever mudaria os `id`s das 80 fichas
  envolvidas e apagaria o Valor oficial.
- Com zero marcas curadas presentes na base, o comportamento é o de hoje (todas
  no `<select>`): a curadoria é opcional, não um requisito.
