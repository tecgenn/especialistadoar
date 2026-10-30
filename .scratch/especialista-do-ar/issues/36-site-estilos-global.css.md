# 36 — Site: Estilos Globais (global.css)

**What to build:** CSS para suportar o novo layout: grid `.consulta-layout` (280px/1fr desktop, 1fr mobile), sidebar sticky `.filtros-sidebar`, campo-chips com chips acima e select abaixo, chips de classe coloridos (A=#16a34a, B=#2563eb, C=#ca8a04, D=#ea580c, E/F=#dc2626), selects "Outras…" com placeholder vazio, botão "Mostrar mais" centralizado, responsividade mobile (≤64rem: stack; ≤40rem: tabela em cards já existe).

**Blocked by:** 34 — Site: UI Filtros Redesign (Consulta.tsx); 35 — Site: Tabela e "Mostrar mais"

**Status:** ready-for-agent

- [ ] `.consulta-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }`
- [ ] `@media (max-width: 64rem) { .consulta-layout { grid-template-columns: 1fr; } }`
- [ ] `.filtros-sidebar { position: sticky; top: 1rem; max-height: calc(100vh - 2rem); overflow-y: auto; }`
- [ ] `.campo-chips { display: flex; flex-direction: column; gap: 0.5rem; }`
- [ ] `.select-outras select { width: 100%; }`
- [ ] `.select-outras select:invalid { color: var(--texto-suave); }`
- [ ] `.select-outras option[value=""][disabled][hidden] { display: none; }`
- [ ] `.chips.classes-chips button[aria-pressed="true"][data-classe="A"] { background: #16a34a; border-color: #16a34a; color: white; }`
- [ ] `.chips.classes-chips button[aria-pressed="true"][data-classe="B"] { background: #2563eb; border-color: #2563eb; color: white; }`
- [ ] `.chips.classes-chips button[aria-pressed="true"][data-classe="C"] { background: #ca8a04; border-color: #ca8a04; color: white; }`
- [ ] `.chips.classes-chips button[aria-pressed="true"][data-classe="D"] { background: #ea580c; border-color: #ea580c; color: white; }`
- [ ] `.chips.classes-chips button[aria-pressed="true"][data-classe="E"], .chips.classes-chips button[aria-pressed="true"][data-classe="F"] { background: #dc2626; border-color: #dc2626; color: white; }`
- [ ] `.mostrar-mais { display: block; width: 100%; max-width: 300px; margin: 1.5rem auto 0; padding: 0.75rem 1rem; }`
- [ ] `.mostrar-mais:focus { outline: 2px solid var(--primaria); outline-offset: 2px; }`
- [ ] `@media (max-width: 40rem) { .mostrar-mais { max-width: 100%; } }`
- [ ] Tabela: cores na coluna Classe (reuso das mesmas variáveis)
- [ ] `pnpm build:site` gera CSS sem erros
- [ ] Verificação visual: desktop (sidebar + tabela), mobile (stack), botão "Mostrar mais" centralizado e funcional