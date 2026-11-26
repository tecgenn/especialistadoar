# 73 — Catálogo: barra de ferramentas e pesquisa avançada

**What to build:** a barra do catálogo vira um instrumento de recorte: busca, filtros ativos, contagem e ordenação no mesmo lugar, sticky ao rolar. A Pesquisa avançada mantém as duas faixas (Aparelho e Desempenho), os chips de marca, as faixas de capacidade, a Classe e a Tensão — e no celular abre como painel sobreposto, com foco preso, `Esc` para fechar e um rodapé que mostra quantos resultados o recorte tem.

**Blocked by:** 72 — Catálogo: a tabela de instrumento.

**Skills:** `ui-ux-pro-max` — `"filter panel focus trap" --domain ux` e `"form search results count" --domain ux`. `design-taste-frontend` — `SKILL.md` + `references/cards.md`.

**Status:** done

- [x] A barra é sticky, não cobre a linha em leitura e tem contraste e hairline próprios; no celular empilha em duas linhas sem overflow.
- [x] Busca, chips do recorte efetivo (incluindo o padrão implícito de 220 V), contagem e ordenação mantêm os contratos de URL atuais.
- [x] O painel avançado mantém as faixas **Aparelho** (Marca, Tipo, Função) e **Desempenho** (Capacidade, Classe, Tensão), com chips que quebram linha e campos em largura total.
- [x] O campo "Outras marcas" continua escrevendo `?marca=` na hora e não repete um valor já ativo num chip.
- [x] Faixa de capacidade e capacidade exata continuam exclusivas nos dois sentidos; links com `?btu=` e `?btuMin=&btuMax=` abrem o recorte correto.
- [x] "Limpar filtros" só aparece fora do padrão, preserva a ordenação e a seleção, e o painel começa fechado (abrindo sozinho com filtro avançado na URL).
- [x] No celular, o painel é uma sobreposição com rolagem interna, foco preso, `Esc`, retorno de foco e botão "Ver N resultados"; no desktop é embutido.
- [x] O filtro padrão continua resultando em 2.116 linhas e a contagem do recorte reage a cada mudança.
- [x] Testes de ilha cobrem abertura/fechamento, `Esc`, foco e o rodapé de contagem; nenhum teste existente quebra.

## Comments

### Implementação (2026-11-26)

- **Barra.** O `<form class="filtros barra-ferramentas">` é `position: sticky; top: 0; z-index: var(--z-barra)`, fundo giz e hairline inferior. Junta busca (rótulo só para leitor de tela), botão, chips do recorte (220 V implícito incluído), contagem em mono tabular e ordenação. A ilha mede a altura da barra (`ResizeObserver` + `resize`) e publica `--altura-barra-catalogo` no contêiner; o `<thead>` sticky usa esse valor em `top` (121 px no desktop, 173 px no celular), então o cabeçalho da tabela para abaixo da barra em vez de sumir atrás dela.
- **Divergência registrada — celular.** A barra fica em **três faixas compactas** (busca + botão; chips; contagem + ordenação), todas de 44 px e sem overflow em 320/390/640/768. Duas faixas não caberiam com chips, contagem e ordenação juntos no mesmo instrumento; o rótulo "Ordenar por" sai da vista (continua no nome acessível) e a contagem encurta com reticências. `DESIGN.md` foi atualizado para o comportamento entregue.
- **Painel.** Desktop: embutido, fundo giz, hairline, raio de 4 px, faixas com rótulo mono e hairline superior. Abaixo de 900 px (`matchMedia`, o mesmo corte da tabela): `position: fixed; inset: 0`, `--z-painel`, rolagem interna com `overscroll-behavior: contain`, `role="dialog"` + `aria-modal` + `aria-label="Pesquisa avançada"`, foco no primeiro focável ao abrir, `Tab`/`Shift+Tab` presos, `Esc` fecha e devolve o foco ao botão, rodapé sticky com a contagem e "Ver N resultados" (que fecha e devolve o foco).
- **Chips.** Passam ao primitivo do sistema: 32 px e raio de 2 px (44 px abaixo de 640 px), fundo papel, texto grafite; o aceso vira tinta com texto giz. As cores de Classe salvas no CSS viraram os tokens `--classe-*` (nenhum hex no CSS); a cor curada de `filtros.json` continua por cima via `--cor-classe`.
- **Contagem.** Divergência com o texto do ticket: a base de 2026-11-25 tem **2.294** Aparelhos com Tensão 220 V (e 2.423 na base), não 2.116 — o número do ticket é anterior à troca da exportação. O comportamento do recorte padrão não mudou.
- **Checks.** Vitest 794/794 (51 arquivos), `pnpm typecheck` OK, `pnpm lint` 0 erros (30 warnings de `noDescendingSpecificity`, os mesmos do baseline), `pnpm build` reproduz `data/build` e `reports` sem alteração, `pnpm build:site` gera 2.433 páginas. No navegador (agent-browser, preview 127.0.0.1:4321): 0 px de overflow em 320/390/640/768/900/1024/1440; barra em 0–121 px com o `<thead>` em 121 px após 600 px de rolagem; chip de 32 px e raio de 2 px; painel desktop estático de 1344 px, sem role; no celular, sobreposição 390×844 com foco no primeiro chip, `Tab` do último voltando ao primeiro, `Esc` fechando com foco no botão, "Ver 2294 resultados" → 1.853 ao acender Classe A e o rodapé fechando o painel com foco devolvido.
