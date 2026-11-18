# 61 — Painel "Pesquisa Avançada" em Duas Faixas

**What to build:** O painel de filtros ganha hierarquia. Os seis campos deixam a grade de três colunas iguais e passam a viver em duas faixas nomeadas — **Aparelho** (Marca, Tipo, Função) e **Desempenho** (Capacidade, Classe, Tensão) —, cada campo em largura total, com os chips quebrando linha naturalmente. A Marca vira um bloco de chips da curadoria com um campo de busca para as demais; a Classe vira seis letras grandes com a cor da curadoria; o rodapé do painel recebe o contador de resultados e "Limpar filtros". O comportamento não muda: aplica na hora, escreve na URL, abre sozinho quando a URL traz filtro avançado.

**Blocked by:** 60 — Filtros: Faixas de Capacidade ao Lado da Capacidade Exata

**Status:** done

- [x] O painel tem duas faixas com título: "Aparelho" (Marca, Tipo, Função) e "Desempenho" (Capacidade, Classe, Tensão)
- [x] Cada campo ocupa a largura do painel, e os chips quebram linha sem espremer
- [x] A Marca mostra as dez marcas curadas num bloco de chips e um campo de busca para "Outras marcas"
- [x] O campo de busca de marca filtra a lista sem lista longa aberta e mantém o valor na URL como os demais
- [x] A Classe aparece como seis letras grandes com a cor da curadoria, com o mesmo comportamento de seleção atual
- [x] A Capacidade mostra os chips de faixa e o select de capacidade exata no mesmo campo (do ticket 60)
- [x] O rodapé do painel mostra a contagem de resultados do recorte efetivo e "Limpar filtros"
- [x] A contagem reage a cada mudança de filtro, sem fechar o painel
- [x] "Limpar filtros" continua com a regra atual (só aparece quando o estado difere do padrão) e preserva a ordenação
- [x] O painel continua começando fechado e abrindo sozinho quando a URL traz filtro avançado
- [x] Os chips de resumo do recorte continuam fora do painel, incluindo o do padrão implícito de 220 V
- [x] No celular, as duas faixas empilham e os chips quebram linha
- [x] Testes de ilha cobrem a ordem das duas faixas, o contador refletindo o recorte, "Limpar filtros" no rodapé e a abertura pela URL
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
