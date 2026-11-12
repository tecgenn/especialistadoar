# 50 — Tabela Central: Busca, Pesquisa Avançada e Coluna Análise

**What to build:** A tabela deixa de ter barra lateral e passa a ocupar uma coluna central de no máximo 72 rem, mais compacta. A busca fica em largura total no topo; abaixo dela, "Pesquisa avançada" abre um painel com Marca, Capacidade, Função, Tensão, Tipo e Classe, enquanto uma linha de chips resume o recorte efetivo — incluindo o padrão implícito de 220 V, cujo "×" desliga o padrão — e oferece "Limpar filtros". O painel abre sozinho quando a URL traz filtro avançado. A ordenação sai do painel e fica numa linha compacta acima da tabela. A tabela ganha a coluna "Análise" como última, com o selo que hoje mora dentro da célula de Marca, e a coluna só existe quando há ao menos uma Análise publicada. No celular, o selo vira a última linha do cartão.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Sem barra lateral: busca e filtros numa coluna centralizada, tabela com teto de 72 rem
- [ ] Busca em largura total no topo, acima da vitrine de Aparelhos analisados
- [ ] "Pesquisa avançada" abre e fecha o painel com Marca, Capacidade, Função, Tensão, Tipo e Classe
- [ ] O painel começa fechado e abre automaticamente quando a URL traz um filtro avançado
- [ ] Chips do recorte efetivo, cada um com "×"; o resumo inclui o 220 V implícito e o "×" dele grava `tensao=`
- [ ] "Limpar filtros" mantém a regra atual (só aparece quando o estado difere do padrão) e preserva a ordenação
- [ ] A ordenação fica fora do painel, numa linha compacta acima da tabela
- [ ] A tabela tem a coluna "Análise" como última, com o selo e link para a Análise
- [ ] O selo sai da célula de Marca
- [ ] A coluna "Análise" só é renderizada quando existe ao menos uma Análise publicada
- [ ] Tipografia e espaçamento menores; larguras fixas para seleção e Análise, proporcionais para o resto
- [ ] No celular, o cartão termina com o selo "Análise"
- [ ] Testes da ilha cobrem painel fechado/aberto pela URL, resumo com o 220 V padrão, "×" gravando `tensao=`, ordem das colunas e ausência da coluna Análise sem Análise
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
