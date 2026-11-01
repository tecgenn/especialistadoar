# 34 — Site: UI Filtros Redesign (Consulta.tsx)

**What to build:** Reescrita do `Consulta.tsx` com novo layout em grid (desktop: sidebar esquerda 280px sticky + tabela direita; mobile: empilhado). Ordem dos filtros: Busca (topo, full-width) → Marca (chips + select "Outras Marcas" vazio) → Capacidade (chips + select "Outras Capacidades" vazio) → Função (chips) → Tipo (chips) → Classe (chips coloridos) → Tensão (select) → Ordenar (4 opções) → Limpar filtros. Selects "Outras…" usam `<option value="" disabled hidden>` como placeholder vazio.

**Blocked by:** 32 — API Isomórfica: Tipos, Filtros e Ordenação Atualizados; 33 — Site: Camada de Dados (filtros.json, opcoes.ts, tabela.ts, glue)

**Status:** done

- [x] Novo layout CSS Grid em `Consulta.tsx` (JSX) + estilos em `global.css`
- [x] Componente `ChipsClass` para classes coloridas (usa `data-classe` para CSS)
- [x] Campo Busca: `<label className="busca campo-full">` no topo
- [x] Campo Marca: `<fieldset className="campo-chips">` com `<Chips>` (marcasChip) + `<label className="select-outras">` com select vazio (marcas não-chip)
- [x] Campo Capacidade: mesma estrutura com `btusChip` + select "Outras Capacidades"
- [x] Campo Função: apenas `<Chips>` (2 valores: Frio, Quente/Frio)
- [x] Campo Tipo: apenas `<Chips>` (4 valores)
- [x] Campo Classe: `<ChipsClass>` com `classesChip` (6 valores coloridos)
- [x] Campo Tensão: `<label>` simples (select)
- [x] Campo Ordenar: `<label>` com select de 4 opções (btu, consumo, idrs, classe)
- [x] Botão "Limpar filtros" só aparece com filtro ativo (mantém ordenação)
- [x] Estado "Mostrar mais" resetado ao mudar filtro/ordem
- [x] Mobile: layout empilhado via CSS (`@media max-width: 64rem`)
- [x] Testes em `apps/site/test/consulta.test.tsx`:
  - Renderiza chips de marca, capacidade, função, tipo, classe
  - Selects "Outras…" abrem vazios (sem "Todas")
  - Clique em chip altera URL e filtra
  - Select "Outras…" altera URL e filtra
  - Ordenação só mostra 4 opções
  - Busca no topo funciona
  - "Limpar filtros" limpa só filtros, mantém ordenação
  - Mobile: layout empilhado
- [x] `pnpm test` passa
- [x] `pnpm typecheck` passa

## Comments

- 2026-10-30: Item 20 alterado — "Estado de paginação resetado" → "Estado 'Mostrar mais' resetado ao mudar filtro/ordem" (decisão de manter 'Mostrar mais' em vez de paginação numerada).