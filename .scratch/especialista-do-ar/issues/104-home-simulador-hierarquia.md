# 104 — Simulador do hero: hierarquia, rótulos e resultado

**What to build:** o simulador deixa de parecer um formulário técnico e passa a ser o primeiro instrumento de decisão da página. O título vira **“Descubra quantos BTUs o seu ambiente precisa”**, em `--texto-secao` (1,5 rem), caixa de frase e fonte de interface — não mais um rótulo mono em caixa alta. “Incidência de sol” sobe para o mesmo peso de interface e ganha o ícone `sol`. O resultado é reestruturado: o rótulo é **“Capacidade recomendada”**, o número continua sendo a leitura grande e a conta aberta vira uma lista de três linhas (área × sol, capacidade calculada, faixa comercial), seguida da contagem de aparelhos numa única linha. As ações mudam: **“Continuar no Assistente →”** leva a `/assistente/` com área e sol preenchidos, e **“Ver aparelhos de 18.000 BTU/h”** leva ao recorte `?btu=`. A nota de estimativa e o link para o Assistente completo permanecem.

**Blocked by:** 102, 103.

**Skills:** `design-taste-frontend` — `references/copy.md`, `references/layout-v4.md` e `references/moments.md`. `impeccable` — `reference/component-review.md`, `reference/clarify.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"range slider result card" --domain ux` e `"segmented control" --domain ux`.

**Status:** ready-for-agent

- [ ] Título exato “Descubra quantos BTUs o seu ambiente precisa”, em 1,5 rem, interface, sem caixa alta
- [ ] Linha de apoio curta sob o título (“A área e o sol já bastam para uma primeira estimativa.”), em 0,875 rem e `--mudo`
- [ ] “Incidência de sol” em interface 0,9375–1 rem, peso 500, com ícone `sol` de 16 px; os quatro chips mantêm `aria-pressed` e alvo de 44 px
- [ ] Resultado com o rótulo “Capacidade recomendada” e a leitura grande intacta (`formatarBtu` + unidade)
- [ ] Conta aberta em `<dl>` de três linhas: “Área × sol”, “Capacidade calculada”, “Faixa comercial”; valores em mono tabular, rótulos em `--mudo`
- [ ] Contagem do catálogo em uma linha: “318 aparelhos de 18.000 BTU/h · 256 com Classe A”
- [ ] Ação primária “Continuar no Assistente →” para `/assistente/?forma=metros&area=<area>&sol=<sol>`
- [ ] Ação secundária “Ver aparelhos de 18.000 BTU/h” para `/aparelhos/?btu=<capacidade>`
- [ ] Nenhum texto “Simule o seu ambiente” ou “Capacidade comercial recomendada” sobra no código ou nos testes
- [ ] Estado padrão (20 m², tarde) continua no HTML sem JavaScript; a ilha só acrescenta a interação
- [ ] HTML sem overflow em 320/390/768/1024/1440 px; o `<dl>` não espreme a leitura grande
- [ ] Testes de build conferem título, rótulo, as duas ações e o preenchimento da URL
- [ ] `DESIGN.md`, seção “Simulador do hero”, atualizado no mesmo commit

## Notas

- A URL do Assistente usa o contrato existente (`forma`, `area`, `sol`) e não inventa chave nova. O Assistente já lê esses parâmetros e mostra a conta fator por fator.
- A lista de três linhas substitui o parágrafo “20 m² × 750 BTU/h/m² = 15.000 BTU/h calculados — arredondados para 18.000”. O mesmo conteúdo, alinhado em coluna de valores, sem a frase corrida.
- O ícone de sol é o único ícone novo deste bloco; os chips continuam texto puro para não virar uma fila de pictogramas.
