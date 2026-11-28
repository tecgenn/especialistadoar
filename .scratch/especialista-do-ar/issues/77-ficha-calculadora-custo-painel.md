# 77 — Ficha: calculadora de custo como painel de instrumento

**What to build:** a calculadora deixa de ser um formulário e vira um painel de medição: campos à esquerda, custo mensal em leitura grande à direita, conta aberta em mono e o aviso de estimativa visível. O visitante entende de onde vem cada real sem sair da página. O contrato de URL e o motor puro não mudam.

**Blocked by:** 68 — Primitivos de interface e ícones; 75 — Ficha: topo de datasheet, leituras e índice.

**Skills:** `ui-ux-pro-max` — `"inline validation numeric input" --domain ux` e `"form error summary" --domain ux`. `design-taste-frontend` — `SKILL.md` + `references/copy.md`.

**Status:** done

- [x] O painel usa os campos UF, tarifa, horas e dias com rótulos mono, sufixos de unidade e alvos de 44 px.
- [x] O resultado mostra custo mensal como número principal, custo anual e consumo mensal, com faixa quando houver Variantes e travessão explicado quando não houver consumo.
- [x] A conta aberta lista os seis passos em mono numerado, com unidades e formatação pt-BR.
- [x] O aviso de estimativa (não é Valor oficial, não é promessa de economia) e a referência/fonte da tarifa permanecem visíveis.
- [x] O resultado é uma região viva (`aria-live="polite"`, `aria-atomic`), e os campos continuam associados aos rótulos.
- [x] O contrato `uf`/`tarifa`/`horas`/`dias`, os padrões fora da URL e a normalização de valores inválidos continuam idênticos.
- [x] No celular, os campos vêm antes do resultado; nada estoura a viewport.
- [x] Testes existentes da calculadora continuam verdes; novos testes cobrem a faixa de Variantes e o estado sem consumo.

**Implementação (2026-11-28):** a calculadora da ficha deixou de ser um
formulário e virou painel de instrumento. Em `CalculadoraCusto.tsx` o custo
mensal é a leitura principal (mono `clamp(2rem, 4vw, 2.5rem)`), com custo anual
e consumo mensal como fatores num `<dl>` de hairlines; a conta aberta é um `<ol>`
de seis passos numerados por contador `01`–`06` em mono, com o valor alinhado à
direita; o aviso de estimativa fecha o painel. O estado sem consumo mantém a
forma do painel, com a leitura em travessão e a explicação no lugar dos campos,
e o resultado segue `role="status"` com `aria-live="polite"` e
`aria-atomic="true"`. `CamposCusto.tsx` passou a usar o primitivo de campo do
ticket 68 (`campo`, `campo-rotulo`, `campo-entrada`, `campo-sufixo`) com a seta
desenhada do `seta-baixo`, sufixos `h` e `dias` decorativos e 44 px de alvo — os
mesmos campos da comparação, sem mudança de comportamento. `global.css`
reescreveu o bloco no sistema da Fase 12 (giz, hairline, raio 4 px, mono
tabular) e alinhou o "Como calculamos" abaixo do painel como nota de datasheet.
O motor puro e o contrato de URL não mudaram. `DESIGN.md` (Calculadora de custo
e Estado vazio) registrou a decisão no mesmo commit.

**Checks:** Vitest 806/806 (51 arquivos), `pnpm typecheck` OK, `pnpm lint` 0
erros (56 warnings de `noDescendingSpecificity`, pré-existentes), `pnpm build:site`
gera 2.433 páginas e `data/build`/`reports` seguem intocados. No navegador
(agent-browser, preview 127.0.0.1:4321 na ficha `ap-03be1a749866`): 0 px de
overflow horizontal em 320/390/640/768/1024/1440; uma coluna até 640 px (campos
em 2153 px e resultado em 2634 px em 320) e duas colunas a partir de 768
(256 px de campos + 392,56 px de resultado); campos de 44 px com rótulo Azeret
Mono de 12 px e sufixos `h`/`dias`; leitura principal em 32 px (40 px a partir
de 1024) em tinta; seis linhas de 32 px com contador `01`–`06` em `rgb(95, 111,
112)`; painel giz `rgb(253, 253, 251)` com raio de 4 px. Trocar a UF para RJ
reescreve `?uf=RJ` e atualiza a leitura (R$ 30,38 → R$ 34,87) sem sujar a URL;
o foco do campo mostra `2px solid rgb(15, 143, 168)` com offset de 2 px. `axe`
4.12.1 em `#consumo-e-custo`: 0 violações e 0 inconclusivos. Divergência
registrada: nenhum Aparelho publicado sem consumo anual, então o estado com
travessão só é exercido no teste de ilha, não no build.
