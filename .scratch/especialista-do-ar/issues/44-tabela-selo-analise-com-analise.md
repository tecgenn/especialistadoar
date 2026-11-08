# 44 — Tabela: Selo "Análise" e Bloco "Com análise"

**What to build:** O selo "Analisado" vira **"Análise"**, numa etiqueta de contorno distinta dos chips de filtro, com tooltip contendo apenas o título da Análise. As linhas analisadas ganham destaque sutil. Saem os cabeçalhos de grupo e o aviso de afiliado da tabela. Analisados que passam nos filtros continuam como primeiras linhas do resultado; os que não passam aparecem num bloco compacto **"Com análise"** acima da tabela, sem alterar contagem, ordenação ou "Mostrar mais".

**Blocked by:** 43 — Tabela: Setas, Coluna Tipo e Layout

**Status:** ready-for-agent

- [ ] O rótulo visível passa de "Analisado" para "Análise"
- [ ] O selo é uma etiqueta de contorno, visualmente diferente da pílula azul dos chips de filtro
- [ ] Tooltip do selo contém apenas o título da Análise
- [ ] Linha do analisado com fundo levemente destacado e borda de acento à esquerda
- [ ] Removidas as linhas de cabeçalho de grupo ("Analisados por nós · contém links de afiliado", "Demais aparelhos")
- [ ] Nenhum aviso de afiliado na tabela
- [ ] Analisados que passam nos filtros aparecem antes dos demais, qualquer que seja a ordenação
- [ ] Bloco "Com análise" acima da tabela lista até 3 analisados que **não** passam nos filtros atuais, com selo e link para a Análise
- [ ] O bloco deixa explícito que está fora dos filtros atuais
- [ ] Analisado que passa nos filtros não é duplicado no bloco "Com análise"
- [ ] Com zero analisados fora do filtro, o bloco não é renderizado
- [ ] Contagem de resultados segue refletindo só o que passou nos filtros
- [ ] "Mostrar mais" continua paginando o resultado filtrado, sem os itens do bloco
- [ ] Ordenação não é afetada pelo bloco "Com análise"
- [ ] Testes: selo e tooltip, destaque de linha, ausência dos textos removidos, bloco com/sem analisados fora do filtro, contagem e paginação intactas
- [ ] Testes em jsdom conferem que o bloco fica fora do elemento `<table>` e não interfere na contagem
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
