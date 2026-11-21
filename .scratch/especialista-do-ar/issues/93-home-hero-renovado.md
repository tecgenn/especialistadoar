# 93 — Hero da home: título em display e simulador de ambiente

**What to build:** o hero da home precisa ser o elemento mais chamativo da primeira tela e fazer a promessa do produto, não só anunciá-la. A direção é tipográfica e funcional: fita de calibração em largura total, H1 em display grande (acima do token, só aqui) em duas linhas no desktop, lead em serifa e, logo abaixo, um **simulador de ambiente** — área e incidência de sol viram capacidade comercial pelo motor puro do Assistente, com a conta aberta, a quantidade real de aparelhos naquela capacidade e quantos deles são Classe A. Duas ações contextuais: o recorte exato (`/aparelhos/?btu=`) e o catálogo. A régua de capacidade segue abaixo como única leitura de escala. A entrada é leve: título sobe linha a linha do próprio mask, o resto chega depois; desligada em `prefers-reduced-motion`. Sem Análise, a seção continua existindo.

> **Revisões (2026-11-21):** a primeira entrega criou uma escala decorativa de linhas animada ao lado do texto — recusada pelo produto. A segunda tirou as linhas, mas ficou só tipográfica — recusada por ser "uma hero sem efeito e sem informação própria". Esta é a terceira: o hero vira instrumento interativo.

**Blocked by:** None.

**Status:** done

- [x] H1 em display grande, com duas linhas fixas no desktop e fluxo natural no celular
- [x] Simulador de ambiente no hero: área (8–60 m²) e sol viram capacidade comercial
- [x] Conta aberta, contagem real por capacidade (`?btu=`) e quantos são Classe A
- [x] Estado padrão no HTML (funciona sem JavaScript); ilha só acrescenta a interação
- [x] Entrada leve: título sobe do mask, simulador chega depois; nada se move em `prefers-reduced-motion`
- [x] Sem escala lateral, sem linha decorativa animada — a régua é a única leitura de escala
- [x] H1 e lead em serifa preservados, conteúdo editorial inalterado
- [x] 0 px de overflow horizontal em 320/390/768/1024/1440 px
- [x] Foco visível (âmbar 2px) e alvos de 44 px nos controles
- [x] JSON-LD (WebSite + FAQPage) e canonical preservados
- [x] Testes de build atualizados (simulador, links e contagem)

## Comments

**Entrega 1 (descartada):** painel de duas colunas com `<aside aria-hidden>` de seis traços proporcionais e destaque âmbar, entrada em quatro degraus. Competia com a régua e a animação de linhas não era o que o produto queria.

**Entrega 2 (descartada):** hero tipográfico, sem linhas. Correto, mas o produto pediu efeito e informação própria.

**Entrega atual:** o hero é um instrumento. No desktop a fita ocupa a largura toda, o H1 em `clamp(2.75rem, 6.4vw, 5.25rem)` (abaixo de 22 rem desce para o token headline, para "Ar-condicionado" caber em 320 px) tem duas linhas fixas com mask, o lead vem na sequência e o simulador fecha o topo numa faixa de duas colunas (controles 7fr, resultado 5fr). No celular os spans do título são `inline` — quebra natural, sem palavra órfã — e o simulador empilha.

O simulador (`SimuladorHero.tsx`, ilha React com `client:load`) não calcula nada por conta própria: chama `calcularAssistente` do módulo puro do Assistente (ADR-0020) e recebe do build o resumo por capacidade comercial — total de aparelhos e quantos têm Classe A. O padrão é 20 m² e sol à tarde: `20 × 750 = 15.000 → 18.000 BTU/h`, `318 aparelhos, 256 com Classe A`, botão para `?btu=18000`. A conta aparece aberta e a nota declara que é estimativa de mercado. As contagens saem de `consulta.json` no build; o HTML já vem com o estado padrão, então sem JavaScript o bloco continua legível e o link funciona.

Movimento: fita 440 ms; cada linha do título 700 ms subindo 110% do próprio mask, 80 ms entre elas; lead e simulador 520 ms com 12 px de subida; no simulador, o trilho acompanha o controle em 120 ms e o número entra de novo em 240 ms a cada mudança. Tudo só sob `prefers-reduced-motion: no-preference`; o estado final já está no CSS.

Skills usadas em conjunto: `impeccable` (`context`, `craft-floor` antes de editar, `shot` em 1440/1024/390/320 e `detect`), `design-taste-frontend` (`motion.md`: entrada por mask, ~1,1 s, no máximo duas ações no hero) e `ui-ux-pro-max` (padrão "Minimal Single Column": tipografia grande, muito branco, CTA com contraste conferido).

Verificação: 758/758 testes, `pnpm typecheck`, `pnpm lint` (0 erros) e `pnpm build:site` (2.236 páginas) verdes; `data/build` e `reports` inalterados. No navegador: 1440×900, 1024×768, 390×844 e 320×568 sem overflow; slider de 20 → 40 m² muda a leitura para 30.000 BTU/h e o link para `?btu=30000`; chip "Sem sol" leva a 24.000 BTU/h e marca `aria-pressed` corretamente.
