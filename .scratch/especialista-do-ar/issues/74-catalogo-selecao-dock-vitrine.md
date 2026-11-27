# 74 — Catálogo: seleção para comparar, dock e vitrine de análises

**What to build:** o visitante marca até três Aparelhos sem perder o recorte, vê a seleção num dock escuro que não atrapalha a leitura e chega à comparação com um link que carrega a ordem escolhida. A vitrine "Aparelhos com análise" continua fora da tabela, sempre visível quando há Análise, e nunca entra na contagem, ordenação ou paginação.

**Blocked by:** 72 — Catálogo: a tabela de instrumento; 73 — Catálogo: barra de ferramentas e pesquisa avançada.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/cards.md`, `references/moments.md`. `ui-ux-pro-max` — `"selection bar sticky action" --domain ux`.

**Status:** done

- [x] Cada linha tem checkbox de 20 px com alvo de 44 px e `aria-label` "Comparar Marca Modelo".
- [x] O dock mostra `N de 3 modelos selecionados`, nomes dos modelos em mono, "Limpar seleção" e "Comparar" (link só com 2–3); com seleção cheia, avisa o limite e desabilita os demais checkboxes.
- [x] O dock aparece só com ao menos um item, fica acima da barra, não cobre a linha em leitura e desaparece no celular quando a seleção está vazia.
- [x] A seleção é preservada em toda mudança de filtro, busca, ordenação e "Limpar filtros"; `?ids=` é reconstruído da URL e ids desconhecidos geram aviso com contagem.
- [x] A vitrine mantém os cartões com imagem real, marca, título, capacidade e tipo; analisados do recorte primeiro e similares até seis, com legenda quando só há alternativas fora do recorte.
- [x] A vitrine não altera contagem, ordenação nem paginação e continua fora da tabela.
- [x] No celular, o dock ocupa a largura toda, mantém 44 px e a vitrine empilha em uma coluna.
- [x] Testes de ilha cobrem limite, remoção, URL, aviso de descarte e presença da vitrine.

## Comments

### Implementação (2026-11-26)

- **Dock.** A `.barra-selecao` saiu de dentro do bloco da tabela e passou a ser renderizada **antes** do `<form>` da barra, e só existe com `selecao.length > 0`: sem seleção não há nó, espaço nem contagem `0 de 3`. Fundo tinta, texto giz, raio de 8 px (`--raio-md`) e a única sombra do sistema; `position: sticky; top: 0; z-index: var(--z-dock)`. O conteúdo é a contagem `N de 3 modelos selecionados` (tabular numa única linha de texto, para leitor de tela anunciar a frase inteira), os nomes em Azeret Mono de 0,75 rem na ordem da seleção (com o nome completo da Marca e do Modelo no `title`), o aviso de limite quando cheio, o aviso de descarte quando a URL trouxe ids repetidos/desconhecidos, "Limpar seleção" como botão de texto giz e "Comparar" como link primário azul-frio (botão desabilitado com um só modelo).
- **Empilhamento medido.** A ilha agora mede o dock além da barra e publica `--altura-dock` (`ResizeObserver` + `resize`, `0px` quando o dock não existe). A barra gruda em `top: var(--altura-dock)` e o `<thead>` em `calc(var(--altura-dock) + var(--altura-barra-catalogo))`: com o dock em 60 px no desktop, a barra fica em 60–181 px e o cabeçalho em 181 px depois da rolagem, sem linha coberta.
- **Celular.** O dock ocupa a largura toda em duas faixas (contagem + ações; nomes rolando na horizontal) e todos os alvos ficam em 44 px. A decisão sobre o risco "dock muito estreito" dispensou a barra fixa no rodapé da viewport: o dock fica no mesmo empilhamento sticky e é medido como a barra; em 320 px não há overflow e os nomes rolam dentro do próprio dock. O estado de seleção cheia acrescenta a linha do limite (136 px de dock em 320 px).
- **Aviso sem dock.** Quando a URL traz só ids desconhecidos, o dock não renderiza, mas o aviso de descarte continua visível numa linha própria, logo acima da barra.
- **Checkbox.** O quadrado caiu de 17,6 px para **20 px** com `min-height: 20px` (a regra genérica de campos impunha 44 px de altura), dentro do alvo de 44 px que já vinha da célula; o `aria-label` "Comparar Marca Modelo" continua.
- **Vitrine.** Cada cartão virou grade horizontal: imagem real de abertura da Análise em 6 rem/16:10 e, à direita, etiqueta "Análise", Marca em mono, título, capacidade e Tipo. A imagem é resolvida no build de `aparelhos/index.astro` com `import.meta.glob` + `getImage` (160 px, webp) e chega à ilha como `{ src, alt }` no mapa de analisados; sem imagem, o cartão não reserva o lugar dela. O painel passou ao material do sistema (giz, hairline, raio de 4 px, sem sombra) e a grade é 1/2/3 colunas (640 px e 1024 px). Contagem, ordenação e "Mostrar mais" não mudaram; a vitrine continua fora da `<table>`.
- **Checks.** Vitest 800/800 (51 arquivos), `pnpm typecheck` OK, `pnpm lint` 0 erros (40 warnings de `noDescendingSpecificity` no `global.css` legado; nenhum novo nas regras do dock), `pnpm build` reproduz `data/build` e `reports` sem alteração e `pnpm build:site` gera 2.433 páginas. No navegador (agent-browser, preview 127.0.0.1:4321) com dois ids reais em `?ids=`: 0 px de overflow em 320/390/768/900/1024/1440; dock 60 px (113 px em 320/390), tinta `rgb(10, 31, 34)`, raio 8 px, sombra do sistema e `z-index: 30`; após 600 px de rolagem, dock 0–60, barra 60–181 e `<thead>` em 181; checkbox 20×20 dentro de célula de 44×44; "Limpar seleção" e "Comparar" com 44 px; três ids → "3 de 3", limite visível, 50 checkboxes não marcados desabilitados e `href` para `/comparar/?ids=…` na ordem da URL; vitrine com 2 cartões, 2 imagens reais (`/_astro/abertura…webp`) e 1/2/3 colunas conforme a largura.
- **Divergência registrada.** O contrato da fase falava em `N aparelhos` na barra e no dock em uma linha no celular; com a seleção cheia o dock usa uma terceira faixa estreita no celular para o aviso de limite (contagem + limite, ações, nomes), e a barra continua em três faixas como no #73. `DESIGN.md` descreve o comportamento entregue.
