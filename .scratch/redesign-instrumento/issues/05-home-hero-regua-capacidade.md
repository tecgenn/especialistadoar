# 05 — Home: hero e a régua de capacidade

**What to build:** a primeira tela que prova a direção. O H1 e o lead atuais permanecem, mas abaixo deles entra a assinatura do site: uma régua de capacidade construída com as contagens reais da base, navegável, que leva cada faixa ao recorte correspondente do catálogo. Em 390 px ela vira uma lista de seis linhas com barra de proporção, sem perder a contagem.

**Blocked by:** 02 — Shell global; 03 — Primitivos de interface e ícones.

**Skills:** `impeccable` — `SKILL.md` + `reference/generate.md`, `reference/craft.md`, `reference/animate.md`. `design-taste-frontend` — `references/moments.md`, `references/motion.md`. `ui-ux-pro-max` — `"proportional bar chart accessibility" --domain chart`.

**Status:** ready-for-agent

- [ ] O H1 "Ar-condicionado com dados do INMETRO" e o lead atual são preservados.
- [ ] A régua exibe as seis faixas comerciais com as contagens reais (368 / 492 / 324 / 362 / 197 / 487), derivadas do dataset no build — nenhum número escrito à mão.
- [ ] O rótulo deixa claro que a contagem é de Aparelhos com capacidade na faixa; a interface não apresenta a soma das faixas como o total de 2.227.
- [ ] Cada segmento é um link para `/aparelhos/` com o recorte de faixa correto e um rótulo acessível que inclui a contagem.
- [ ] A régua é operável por teclado, tem foco visível e não depende de hover para revelar informação.
- [ ] No celular, a régua vira lista de seis linhas com barra proporcional, contagem e alvo de 44 px; não há overflow horizontal.
- [ ] A entrada dos ticks em sequência de 40 ms acontece uma vez e é removida por `prefers-reduced-motion`.
- [ ] A leitura de cobertura (2.227 aparelhos, 70 marcas, 44 capacidades) usa os mesmos dados e mostra a Versão da tabela.
- [ ] As duas ações ("Explorar o catálogo" e "Dimensionar meu ambiente") seguem a hierarquia primária/secundária.
- [ ] Um teste puro confere que as contagens da régua vêm do dataset e que os links usam as faixas corretas.
