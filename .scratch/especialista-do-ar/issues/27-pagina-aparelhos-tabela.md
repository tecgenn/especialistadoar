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

**Status:** ready-for-agent

- [ ] `ordenar` (puro, em `@especialista-do-ar/api/consulta`): A–Z com
      `Intl.Collator("pt-BR", { numeric: true })`; por coluna usa o menor valor da
      lista para crescente e o maior para decrescente; suspeitos no fim.
- [ ] `FiltrosConsulta` e a URL aceitam `funcao`, `classe`, `rotacao`, `situacao`,
      `ordem`, `dir`; links antigos (`?marca=SPRINGER MIDEA&btu=12000`) seguem filtrando.
- [ ] A ilha renderiza a `<table>`, cabeçalhos com `<button>` e `aria-sort`, "Mostrar
      mais" (+50) e a contagem de resultados.
- [ ] A primeira linha, sem filtro, é a primeira em A–Z; MIDEA e SPRINGER MIDEA ficam
      juntos (Marca de catálogo).
- [ ] Ordenar por menor consumo não coloca MYSTIC, CONSUL ou MBO no topo.
- [ ] Os chips de marca e capacidade e o "Limpar filtros" continuam funcionando.
- [ ] Em 360 px não há rolagem horizontal escondida; cada linha é um cartão legível.
- [ ] Testes: `ordenar`, estado/URL, `opcoesDe` com os filtros novos e a ilha em jsdom
      (ordenação, filtros, "Mostrar mais", ⚠).
- [ ] `pnpm build:site` gera as 2.462 páginas; `data/build` não muda neste ticket.
