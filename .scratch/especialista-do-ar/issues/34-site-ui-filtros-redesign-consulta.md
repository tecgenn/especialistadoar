# 34 — Site: UI Filtros Redesign (Consulta.tsx)

**What to build:** Reescrita do `Consulta.tsx` com novo layout em grid (desktop: sidebar esquerda 280px sticky + tabela direita; mobile: empilhado). Ordem dos filtros: Busca (topo, full-width) → Marca (chips + select "Outras Marcas" vazio) → Capacidade (chips + select "Outras Capacidades" vazio) → Função (chips) → Tipo (chips) → Classe (chips coloridos) → Tensão (select) → Ordenar (4 opções) → Limpar filtros. Selects "Outras…" usam `<option value="" disabled hidden>` como placeholder vazio.

**Blocked by:** 32 — API Isomórfica: Tipos, Filtros e Ordenação Atualizados; 33 — Site: Camada de Dados (filtros.json, opcoes.ts, tabela.ts, glue)

**Status:** ready-for-agent

- [ ] Novo layout CSS Grid em `Consulta.tsx` (JSX) + estilos em `global.css`
- [ ] Componente `ChipsClass` para classes coloridas (usa `data-classe` para CSS)
- [ ] Campo Busca: `<label className="busca campo-full">` no topo
- [ ] Campo Marca: `<fieldset className="campo-chips">` com `<Chips>` (marcasChip) + `<label className="select-outras">` com select vazio (marcas não-chip)
- [ ] Campo Capacidade: mesma estrutura com `btusChip` + select "Outras Capacidades"
- [ ] Campo Função: apenas `<Chips>` (2 valores: Frio, Quente/Frio)
- [ ] Campo Tipo: apenas `<Chips>` (4 valores)
- [ ] Campo Classe: `<ChipsClass>` com `classesChip` (6 valores coloridos)
- [ ] Campo Tensão: `<label>` simples (select)
- [ ] Campo Ordenar: `<label>` com select de 4 opções (btu, consumo, idrs, classe)
- [ ] Botão "Limpar filtros" só aparece com filtro ativo (mantém ordenação)
- [ ] Estado de paginação resetado ao mudar filtro/ordem
- [ ] Mobile: layout empilhado via CSS (`@media max-width: 64rem`)
- [ ] Testes em `apps/site/test/consulta.test.tsx`:
  - Renderiza chips de marca, capacidade, função, tipo, classe
  - Selects "Outras…" abrem vazios (sem "Todas")
  - Clique em chip altera URL e filtra
  - Select "Outras…" altera URL e filtra
  - Ordenação só mostra 4 opções
  - Busca no topo funciona
  - "Limpar filtros" limpa só filtros, mantém ordenação
  - Mobile: layout empilhado
- [ ] `pnpm test` passa
- [ ] `pnpm typecheck` passa