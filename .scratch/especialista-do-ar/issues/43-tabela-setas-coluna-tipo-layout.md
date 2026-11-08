# 43 — Tabela: Setas, Coluna Tipo e Layout

**What to build:** A tabela de `/aparelhos/` ganha a coluna **Tipo** após Modelo, sem ordenação, e todo cabeçalho ordenável passa a mostrar as duas setas (↑ e ↓) sempre visíveis, com a direção ativa destacada. O layout fica estável: larguras fixas, números à direita, Classe ao centro, modelos longos quebrando linha e cabeçalho preso no topo. Abaixo de 40 rem, continua em cartões.

**Blocked by:** —

**Status:** ready-for-agent

- [ ] Colunas na ordem: Marca · Modelo · **Tipo** · BTU/h · Consumo (kWh) · IDRS · Classe
- [ ] `Tipo` é somente leitura: sem setas e fora de `ORDENS_CONSULTA` e do seletor "Ordenar por"
- [ ] Todo cabeçalho ordenável mostra ↑ e ↓ em cinza claro, sempre visíveis
- [ ] A direção ativa fica em cor primária e negrito; a outra permanece apagada
- [ ] `aria-sort` continua refletindo o estado (asc/desc/none) e o clique alterna a direção
- [ ] Colunas não ordenáveis (Tipo) não mostram setas
- [ ] Larguras fixas em 100% da área útil: Marca 12%, Modelo 30%, Tipo 14%, BTU 10%, Consumo 12%, IDRS 8%, Classe 8%
- [ ] Marca/Modelo/Tipo à esquerda; BTU/Consumo/IDRS à direita; Classe centralizada
- [ ] Modelos longos quebram linha sem estourar a coluna
- [ ] Cabeçalho sticky ao rolar a tabela
- [ ] Abaixo de 40 rem a tabela continua em cartões com `data-label` e "Mostrar mais" funcional
- [ ] Faixa de valores (ex.: "9.000 – 12.000") continua formatada corretamente nas colunas numéricas
- [ ] Testes: Tipo presente e não ordenável, duas setas em todas as ordenáveis, nenhuma em Tipo, `aria-sort` correto e alternância de direção
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
