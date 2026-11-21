# 94 — Home: remover a régua de capacidade (desktop e celular)

**What to build:** a régua de capacidade **sai da home nos dois breakpoints**. Depois do #93, a primeira tela é fita de calibração + H1 + lead + **simulador de ambiente**, e o simulador já é uma leitura de escala completa: área e sol viram capacidade comercial, a conta aparece aberta e a base responde com quantos aparelhos existem naquela capacidade e quantos são Classe A. A régua de seis faixas repetia a mesma afirmação num segundo gráfico, com outra unidade de leitura (faixa × capacidade exata), e disputava a atenção do simulador na dobra. Fica o simulador; sai a régua.

A navegação por faixa não se perde: o contrato `?btuMin=&btuMax=` continua vivo e alcançável pelos chips de **Faixa de capacidade** da Pesquisa avançada do catálogo (`/aparelhos/`). Na home, a entrada por faixa — se fizer falta — pertence ao bloco **Aparelhos em destaque por faixa** do ticket #96, como lista editorial de modelos, não como um segundo gráfico de escala. Nada de régua, trilho, tick ou barra de proporção volta à home por outro nome.

**Decisão registrada:** remover. A régua foi a assinatura do #70 enquanto o hero era tipográfico; o #93 trocou a assinatura por um instrumento que responde, e duas leituras de escala na mesma dobra é uma a mais. O que a régua oferecia de único — as contagens reais por faixa — o simulador oferece no recorte que a pessoa acabou de construir, com uma ação que leva a esse recorte.

**Blocked by:** 93 — Hero renovado (done).

**Skills:** `impeccable` — `context`, `craft-floor` antes de editar, `shot` em 320/390/768/1024/1440 e `detect` no fim. `design-taste-frontend` — `references/layout-v4.md` (uma leitura por tela, nada competindo com o hero) e `references/motion.md` (um único momento orquestrado por página; não deixar animação órfã). `ui-ux-pro-max` — diretrizes de hierarquia e de visualização redundante (`"remove redundant chart"`, `"data visualization hierarchy"`).

**Status:** done

- [x] Home sem `ReguaCapacidade` em nenhum breakpoint (nem desktop, nem celular, nem versão compacta)
- [x] O simulador do hero é a única leitura de escala da primeira tela; nenhum gráfico concorrente abaixo dele
- [x] Componente (`ReguaCapacidade.astro`), módulo puro (`regua-capacidade.ts`), teste e CSS da régua removidos; nenhuma classe, keyframe ou token órfão
- [x] Entrada da home sem ticks: resta a entrada do hero (fita → título → lead → simulador), desligada em `prefers-reduced-motion`
- [x] Contrato `?btuMin=&btuMax=` intacto e alcançável pelos chips de Faixa de capacidade do catálogo
- [x] Home sem overflow horizontal em 320/390/768/1024/1440 e sem vão ou buraco onde a régua estava
- [x] Testes de build atualizados: régua ausente do HTML e do CSS; simulador, contagens e links preservados
- [x] `DESIGN.md` atualizado no mesmo commit (Hero, régua removida, rodapé de movimento, 404 e quaisquer termos relacionados revisados; testes doc↔código conferidos)
- [x] Tickets #85 (404) e `docs/agents/architecture.md` alinhados à remoção, para nenhum documento prometer o componente que deixou de existir

## Comments

**Revisão (2026-11-21, antes da implementação):** a versão original deste ticket mandava manter a régua e revisar só a lista mobile; depois, com a primeira entrega do #93, passou a decidir entre manter ou remover a navegação independente. O #93 foi refeito duas vezes: a escala lateral decorativa foi descartada e o hero virou simulador de ambiente. Com isso a decisão ficou simples — não existe segunda escala para integrar, e a régua perdeu a função de assinatura. O ticket foi reescrito para **remover**, não para redesenhar: o escopo é a subtração, com a descoberta por faixa preservada no catálogo e o que era editorial migrando para o #96.

**Implementação (2026-11-21):** removidos `ReguaCapacidade.astro`, `lib/regua-capacidade.ts`, `test/regua-capacidade.test.ts`, o uso em `index.astro` e todo o CSS (`regua-capacidade-*`, a contagem ≥40 rem, a lista mobile dentro de `max-width: 40rem` e os keyframes `regua-tick-entra`/`regua-barra-entra`). O teste de build passou a exigir a ausência (`regua-capacidade`, `btuMin=`/`btuMax=` no HTML da home, `--proporcao` no CSS). `DESIGN.md` (Overview, Mineral, Shapes, Hero, Painel de filtros, 404, Movimento), `architecture.md`, o ticket #85 e a spec da fase foram alinhados; os "ticks" genéricos saíram do vocabulário do `DESIGN.md`.

Verificação no navegador (neo, 1440/1024/768/390/320): `scrollWidth == clientWidth` em todas as faixas, zero nós `regua-capacidade`, simulador em `minmax(0, 7fr) minmax(0, 5fr)` a partir de 64 rem, leitura padrão `18.000 BTU/h`, alvos de 44 px e foco âmbar de 2 px no simulador.

**Correção de passagem:** o fallback do título em ≤22 rem usava `var(--texto-headline)`, token que não existe — em 320 px o H1 caía no tamanho herdado do corpo (17 px). Trocado por `var(--texto-manchete)` (32 px em 320) e coberto por asserção no teste de build. Era o único ponto em que a verificação de 320 px falhava.

`pnpm typecheck`, `pnpm lint` (0 erros), `pnpm test` (751 testes), `pnpm build` e `pnpm build:site` (2.236 páginas) passam; `data/build` e `reports` inalterados.
