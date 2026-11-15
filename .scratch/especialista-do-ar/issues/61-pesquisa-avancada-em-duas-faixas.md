# 61 — Painel "Pesquisa Avançada" em Duas Faixas

**What to build:** O painel de filtros ganha hierarquia. Os seis campos deixam a grade de três colunas iguais e passam a viver em duas faixas nomeadas — **Aparelho** (Marca, Tipo, Função) e **Desempenho** (Capacidade, Classe, Tensão) —, cada campo em largura total, com os chips quebrando linha naturalmente. A Marca vira um bloco de chips da curadoria com um campo de busca para as demais; a Classe vira seis letras grandes com a cor da curadoria; o rodapé do painel recebe o contador de resultados e "Limpar filtros". O comportamento não muda: aplica na hora, escreve na URL, abre sozinho quando a URL traz filtro avançado.

**Blocked by:** 60 — Filtros: Faixas de Capacidade ao Lado da Capacidade Exata

**Status:** ready-for-agent

- [ ] O painel tem duas faixas com título: "Aparelho" (Marca, Tipo, Função) e "Desempenho" (Capacidade, Classe, Tensão)
- [ ] Cada campo ocupa a largura do painel, e os chips quebram linha sem espremer
- [ ] A Marca mostra as dez marcas curadas num bloco de chips e um campo de busca para "Outras marcas"
- [ ] O campo de busca de marca filtra a lista sem lista longa aberta e mantém o valor na URL como os demais
- [ ] A Classe aparece como seis letras grandes com a cor da curadoria, com o mesmo comportamento de seleção atual
- [ ] A Capacidade mostra os chips de faixa e o select de capacidade exata no mesmo campo (do ticket 60)
- [ ] O rodapé do painel mostra a contagem de resultados do recorte efetivo e "Limpar filtros"
- [ ] A contagem reage a cada mudança de filtro, sem fechar o painel
- [ ] "Limpar filtros" continua com a regra atual (só aparece quando o estado difere do padrão) e preserva a ordenação
- [ ] O painel continua começando fechado e abrindo sozinho quando a URL traz filtro avançado
- [ ] Os chips de resumo do recorte continuam fora do painel, incluindo o do padrão implícito de 220 V
- [ ] No celular, as duas faixas empilham e os chips quebram linha
- [ ] Testes de ilha cobrem a ordem das duas faixas, o contador refletindo o recorte, "Limpar filtros" no rodapé e a abertura pela URL
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
