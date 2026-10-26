# 27 — Página Aparelhos (tabela com ordenação, filtros e 50 por vez)

**What to build:** `/aparelhos/` passa a ser a tabela de Aparelhos, uma linha por
Aparelho: Marca (de catálogo), Modelo (link para a ficha), BTU/h, Consumo (kWh/ano),
IDRS, Classe, Tipo e Situação. Cabeçalhos clicáveis ordenam (`aria-sort`); a ordem
padrão é A–Z por Marca de catálogo e depois modelo, com números em ordem natural, e
o seletor "Ordenar por" repete as opções. Com texto na busca, a ordem inicial é por
relevância. Os filtros atuais e os chips continuam, e entram **função, Classe,
rotação e Situação** (esta começa em "Todos"). Estado, filtros e ordem ficam na URL
(`ordem`, `dir`; os parâmetros antigos não mudam). A tabela mostra 50 linhas e
"Mostrar mais" acrescenta 50. Faixas aparecem quando há mais de um valor. Suspeitos
(ticket 25) vão para o fim nas ordenações por IDRS e consumo, com ⚠ e texto para
leitor de tela. Abaixo de 640 px cada linha vira um cartão. A ordenação é função
pura no entry isomórfico da API de consulta. `/` mostra a mesma ilha até o ticket 29.

**Blocked by:** 24 — Classe, Situação e campos da tabela; 25 — Sinal de consumo
implausível.

**Status:** done

## Decisões

- **A ordenação é uma função pura do entry isomórfico** (`ordenar`, em
  `@especialista-do-ar/api/consulta`), ao lado dos filtros — a ilha do site e
  qualquer Agente usam a mesma semântica. A lista canônica de colunas é
  `ORDENS_CONSULTA`; o site só carrega os rótulos (`COLUNAS_TABELA`), que
  alimentam o cabeçalho, o seletor "Ordenar por" e o cartão do celular.
- **Coluna = menor/maior valor da lista.** Numa coluna, crescente usa o menor
  valor declarado pelo Aparelho e decrescente o maior; quem não declara o dado
  fica no fim nas duas direções.
- **Suspeitos no fim** nas ordenações por IDRS e consumo, nas duas direções — o
  dado implausível (ticket 25) não domina o topo.
- **A direção tem controle próprio.** Abaixo de 640 px o cabeçalho da tabela
  some (cada linha vira cartão), então o sentido só seria alcançável pelo
  cabeçalho clicável — invisível no celular. Um botão ao lado de "Ordenar por"
  inverte a direção e escreve `dir` na URL.
- **"Limpar filtros" não apaga a ordenação.** A ordem escolhida não é um filtro:
  o botão aparece só com filtro ativo e, ao limpar, a ordenação continua.
- **A coluna Classe mostra a lista** ("A, B"), não faixa — a Classe não é um
  número, é uma letra por Variante.
- **Com busca, a ordem inicial é a relevância** do MiniSearch; A–Z e as colunas
  entram quando a pessoa pede.
- **A página gera 2.463 páginas, não 2.462.** O número do checklist é o do fim da
  Fase 7: enquanto `/busca/` existir (sai no ticket 30), o site tem 2.460 fichas
  + `/` + `/aparelhos/` + `/busca/` = 2.463. `data/build` não muda neste ticket.

- [x] `ordenar` (puro, em `@especialista-do-ar/api/consulta`): A–Z com
      `Intl.Collator("pt-BR", { numeric: true })`; por coluna usa o menor valor da
      lista para crescente e o maior para decrescente; suspeitos no fim.
- [x] `FiltrosConsulta` e a URL aceitam `funcao`, `classe`, `rotacao`, `situacao`,
      `ordem`, `dir`; links antigos (`?marca=SPRINGER MIDEA&btu=12000`) seguem filtrando.
- [x] A ilha renderiza a `<table>`, cabeçalhos com `<button>` e `aria-sort`, "Mostrar
      mais" (+50) e a contagem de resultados.
- [x] A primeira linha, sem filtro, é a primeira em A–Z; MIDEA e SPRINGER MIDEA ficam
      juntos (Marca de catálogo).
- [x] Ordenar por menor consumo não coloca MYSTIC, CONSUL ou MBO no topo.
- [x] Os chips de marca e capacidade e o "Limpar filtros" continuam funcionando.
- [x] Em 360 px não há rolagem horizontal escondida; cada linha é um cartão legível.
- [x] Testes: `ordenar`, estado/URL, `opcoesDe` com os filtros novos e a ilha em jsdom
      (ordenação, filtros, "Mostrar mais", ⚠).
- [x] `pnpm build:site` gera as 2.463 páginas (2.462 só no fim da Fase 7, quando
      `/busca/` sai no ticket 30); `data/build` não muda neste ticket.
