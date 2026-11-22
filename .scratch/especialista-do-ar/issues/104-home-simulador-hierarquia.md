# 104 — Simulador do hero: hierarquia, rótulos e resultado

**What to build:** o simulador deixa de parecer um formulário técnico e passa a ser o primeiro instrumento de decisão da página. O título vira **“Descubra quantos BTUs o seu ambiente precisa”**, em `--texto-secao` (1,5 rem), caixa de frase e fonte de interface — não mais um rótulo mono em caixa alta. “Incidência de sol” sobe para o mesmo peso de interface e ganha o ícone `sol`. O resultado é reestruturado: o rótulo é **“Capacidade recomendada”**, o número continua sendo a leitura grande e a conta aberta vira uma lista de três linhas (área × sol, capacidade calculada, faixa comercial), seguida da contagem de aparelhos numa única linha. As ações mudam: **“Continuar no Assistente →”** leva a `/assistente/` com área e sol preenchidos, e **“Ver aparelhos de 18.000 BTU/h”** leva ao recorte `?btu=`. A nota de estimativa e o link para o Assistente completo permanecem.

**Blocked by:** 102, 103.

**Skills:** `design-taste-frontend` — `references/copy.md`, `references/layout-v4.md` e `references/moments.md`. `impeccable` — `reference/component-review.md`, `reference/clarify.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"range slider result card" --domain ux` e `"segmented control" --domain ux`.

**Status:** done

- [x] Título exato “Descubra quantos BTUs o seu ambiente precisa”, em 1,5 rem, interface, sem caixa alta
- [x] Linha de apoio curta sob o título (“A área e o sol já bastam para uma primeira estimativa.”), em 0,875 rem e `--mudo`
- [x] “Incidência de sol” em interface 0,9375–1 rem, peso 500, com ícone `sol` de 16 px; os quatro chips mantêm `aria-pressed` e alvo de 44 px
- [x] Resultado com o rótulo “Capacidade recomendada” e a leitura grande intacta (`formatarBtu` + unidade)
- [x] Conta aberta em `<dl>` de três linhas: “Área × sol”, “Capacidade calculada”, “Faixa comercial”; valores em mono tabular, rótulos em `--mudo`
- [x] Contagem do catálogo em uma linha: “318 aparelhos de 18.000 BTU/h · 256 com Classe A”
- [x] Ação primária “Continuar no Assistente →” para `/assistente/?forma=metros&area=<area>&sol=<sol>`
- [x] Ação secundária “Ver aparelhos de 18.000 BTU/h” para `/aparelhos/?btu=<capacidade>`
- [x] Nenhum texto “Simule o seu ambiente” ou “Capacidade comercial recomendada” sobra no código ou nos testes
- [x] Estado padrão (20 m², tarde) continua no HTML sem JavaScript; a ilha só acrescenta a interação
- [x] HTML sem overflow em 320/390/768/1024/1440 px; o `<dl>` não espreme a leitura grande
- [x] Testes de build conferem título, rótulo, as duas ações e o preenchimento da URL
- [x] `DESIGN.md`, seção “Simulador do hero”, atualizado no mesmo commit

## Decisão de implementação

O bloco virou três camadas de leitura: um cabeçalho de interface (título em `--texto-secao` e linha de apoio em `--mudo`), os controles com “Incidência de sol” em 1 rem/500 e o ícone `sol`, e o resultado com a leitura grande + `<dl>` de três linhas + contagem. O `<dl>` usa `display: grid` com rótulo à esquerda e valor à direita em mono tabular, com `max-width: 42ch`: em 1440 px ele ocupa 378 px e a leitura grande 540 px, então não espreme o número. A seta do “Continuar no Assistente” é o SVG `seta-direita` desenhado, não um glifo. A URL usa o contrato existente do Assistente (`forma`, `area`, `sol`); como o `ambiente` não faz parte deste bloco, o Assistente abre na pergunta de ambiente com área e sol já guardados — ao responder o ambiente, a área de 40 m² aparece preenchida e `sol=sem` segue na URL. O link secundário continua abrindo `/aparelhos/?btu=<capacidade>` com o valor vivo do controle.

## Notas

- A URL do Assistente usa o contrato existente (`forma`, `area`, `sol`) e não inventa chave nova. O Assistente já lê esses parâmetros e mostra a conta fator por fator.
- A lista de três linhas substitui o parágrafo “20 m² × 750 BTU/h/m² = 15.000 BTU/h calculados — arredondados para 18.000”. O mesmo conteúdo, alinhado em coluna de valores, sem a frase corrida.
- O ícone de sol é o único ícone novo deste bloco; os chips continuam texto puro para não virar uma fila de pictogramas.

## Verificação

- Vitest 774/774 (50 arquivos), `pnpm typecheck` OK, `pnpm lint` 0 erros (28 warnings pré-existentes), `pnpm build` reproduz `data/build` e `reports` e `pnpm build:site` gera 2.236 páginas.
- `impeccable detect` na home: 23 achados, todos `cramped-padding` estruturais já documentados, nenhum no simulador.
- No navegador (agent-browser, preview 127.0.0.1:4321): título em Schibsted Grotesk 24 px sem caixa alta, apoio em 14 px `rgb(95, 111, 112)`, “Incidência de sol” em 16 px/500 com SVG de 16 px, chips de 32 px no desktop e 44 px no celular, ações de 44 px; área 40 m² leva a 30.000 BTU/h, `?area=40&sol=tarde` e `?btu=30000`; “Sem sol” leva a 24.000 BTU/h e `?sol=sem`; o clique na primária abre `/assistente/?forma=metros&area=40&sol=sem` com a área preservada; foco ciano `2px solid rgb(15, 143, 168)` com offset 2 px; `prefers-reduced-motion` com `animation-name: none`; 0 px de overflow horizontal em 320/390/768/1024/1440 px.
