# 52 — Vitrine "Aparelhos com análise" sempre visível, com similares

**What to build:** A vitrine acima da tabela nunca mais desaparece quando existe ao menos uma Análise publicada. Ela preenche até 6 cartões: primeiro os Aparelhos analisados que passam no recorte; depois, Aparelhos similares de outras marcas, ordenados por capacidade (correspondência exata, presença no recorte, menor distância relativa), marca conhecida, similaridade de atributos (Tipo, Função, Classe, Tensão) e recência da Análise. Quando não há nenhum compatível, uma legenda explica que os cartões estão fora do recorte e cita a marca filtrada. Cada cartão passa a mostrar capacidade e tipo. A tabela deixa de puxar os analisados para o topo: eles ficam na ordem natural, com o destaque e o selo mantidos.

**Blocked by:** 50 — Tabela Central: Busca, Pesquisa Avançada e Coluna Análise

**Status:** ready-for-agent

- [ ] Com ao menos uma Análise publicada, a vitrine é sempre renderizada, mesmo sem nenhum analisado no recorte
- [ ] Analisados que passam no recorte vêm primeiro
- [ ] Similares completam até 6 cartões quando há Análises suficientes
- [ ] Ordem dos similares: capacidade → marca conhecida → similaridade de atributos → recência da Análise
- [ ] Recorte vazio pula a capacidade e usa marca conhecida → similaridade → recência
- [ ] Com filtro de marca sem Análise, a vitrine mostra analisados de outras marcas, priorizando capacidade próxima
- [ ] Legenda explica quando os cartões estão fora do recorte, citando a marca filtrada
- [ ] Cada cartão mostra Marca, título da Análise, capacidade e tipo
- [ ] A tabela não promove mais analisados ao topo: a ordenação escolhida é sempre respeitada
- [ ] Analisados continuam destacados na tabela e com o selo à direita
- [ ] A vitrine continua sem afetar contagem, ordenação nem "Mostrar mais"
- [ ] `CONTEXT.md` atualiza **Aparelho analisado** (vitrine sempre visível, similares, sem promoção na tabela)
- [ ] Testes puros da ordenação da vitrine (compatíveis, capacidade, marca conhecida, similaridade, recência, recorte vazio) e testes de ilha da vitrine e da ordem da tabela
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
