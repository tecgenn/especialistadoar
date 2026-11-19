# 22 — Acessibilidade: auditoria e correções em todas as superfícies

**What to build:** o site inteiro passa a cumprir WCAG 2.2 AA de forma verificável: teclado em todos os fluxos, foco visível, contraste, alvos de 44 px, zoom de 200%, reflow a 320 px, tabelas semanticamente corretas com região de rolagem focável no celular, formulários com erro associado, movimento reduzido e cores forçadas. A auditoria cobre todas as rotas, não uma amostra.

**Blocked by:** 01–20 — fundação e todas as superfícies do site.

**Skills:** `ui-ux-pro-max` — buscas por resultado: `"focus not obscured" --domain ux`, `"target size" --domain ux`, `"reflow zoom" --domain ux`. `design-taste-frontend` — `scripts/gate.mjs` + `references/gate.md`. `impeccable` — `reference/audit.md`, `reference/harden.md`.

**Status:** ready-for-agent

- [ ] Skip link, header, navegação, filtros, tabela, dock, painel mobile, combobox, matriz, Assistente, calculadora e 404 são operáveis só por teclado, na ordem visual.
- [ ] Foco visível em todos os controles, inclusive sobre tinta e dentro de painéis; nenhum `outline: none` sem substituto.
- [ ] Contraste 4,5:1 para texto e 3:1 para limites/ícones; o teste de tokens cobre os pares documentados.
- [ ] Alvos de 44×44 px no celular (checkboxes, chips, setas de ordenação, contadores, links de assunto).
- [ ] Zoom de 200% e reflow a 320 px sem perda de conteúdo nem rolagem horizontal da página.
- [ ] Tabelas mantêm `<caption>`, `scope` e `aria-sort`; no celular continuam tabelas, com o contêiner de rolagem horizontal focável, rotulado e operável por teclado, e as colunas fixas sem sobrepor o conteúdo.
- [ ] Formulários têm `<label>`, ajuda e erro com `aria-describedby`; resultados usam `aria-live` de forma que não repita tudo a cada tecla.
- [ ] `prefers-reduced-motion` remove a entrada da régua e todas as transições; `forced-colors` preserva bordas e foco.
- [ ] A árvore de acessibilidade (agent-browser ou leitor de tela) é revisada nas rotas principais; achados e correções são registrados.
- [ ] Nenhuma correção de acessibilidade altera dados, URLs ou cálculos.
