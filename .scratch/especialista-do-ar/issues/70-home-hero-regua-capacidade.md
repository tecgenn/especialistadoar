# 70 — Home: hero e a régua de capacidade

**What to build:** a primeira tela que prova a direção. O H1 e o lead atuais permanecem, mas abaixo deles entra a assinatura do site: uma régua de capacidade construída com as contagens reais da base, navegável, que leva cada faixa ao recorte correspondente do catálogo. Em 390 px ela vira uma lista de seis linhas com barra de proporção, sem perder a contagem.

**Blocked by:** 67 — Shell global; 68 — Primitivos de interface e ícones; 91 — Calibração do chão visual.

**Skills:** `impeccable` — `SKILL.md` + `reference/generate.md`, `reference/craft.md`, `reference/animate.md`. `design-taste-frontend` — `references/moments.md`, `references/motion.md`. `ui-ux-pro-max` — `"proportional bar chart accessibility" --domain chart`.

**Status:** done

- [x] O H1 "Ar-condicionado com dados do INMETRO" e o lead atual são preservados.
- [x] A régua exibe as seis faixas comerciais com as contagens reais (368 / 492 / 324 / 362 / 197 / 487), derivadas do dataset no build — nenhum número escrito à mão.
- [x] O rótulo deixa claro que a contagem é de Aparelhos com capacidade na faixa; a interface não apresenta a soma das faixas como o total de 2.227.
- [x] Cada segmento é um link para `/aparelhos/` com o recorte de faixa correto e um rótulo acessível que inclui a contagem.
- [x] A régua é operável por teclado, tem foco visível e não depende de hover para revelar informação.
- [x] No celular, a régua vira lista de seis linhas com barra proporcional, contagem e alvo de 44 px; não há overflow horizontal.
- [x] A entrada dos ticks em sequência de 40 ms acontece uma vez e é removida por `prefers-reduced-motion`.
- [x] A leitura de cobertura (2.227 aparelhos, 70 marcas, 44 capacidades) usa os mesmos dados e mostra a Versão da tabela.
- [x] As duas ações ("Explorar o catálogo" e "Dimensionar meu ambiente") seguem a hierarquia primária/secundária.
- [x] Um teste puro confere que as contagens da régua vêm do dataset e que os links usam as faixas corretas.

## Comments

Implementado em 2026-11-20.

- **Camada pura:** novo `src/lib/regua-capacidade.ts` (`faixasDaRegua`, `linkDaFaixa`) deriva as contagens do `consulta.json` no build — um Aparelho entra em toda faixa em que tem uma Variante —, calcula a proporção para a barra do celular e monta `/aparelhos/?btuMin=…&btuMax=…` (faixa sem piso/teto omite a chave). `faixas-capacidade.ts` ganhou `rotuloDaFaixaCurto` ("9.001–12.000"), e `rotuloDaFaixa` passa a compor com a unidade, sem mudar o texto dos chips.
- **Componente:** novo `src/components/ReguaCapacidade.astro`, sem hidratação. Desktop: seis colunas proporcionais às contagens, hairline de 1 px, tick de 9 px em cada limite, rótulo mono (quebra só no travessão via `<wbr>`) e contagem sempre visível; hover/foco acendem o segmento em âmbar a 12%. Celular (≤ 40 rem): lista de seis linhas com rótulo, contagem e barra de proporção sobre trilho mineral; alvo ≥ 44 px. A nota de rodapé explica que a soma das seis não é o total de Aparelhos.
- **Home:** `src/pages/index.astro` ganhou a fita de calibração (`BASE INMETRO · VERSÃO … · OBTIDA EM …`), o H1 em display com `--texto-display`, o lead em serifa, a régua, as duas ações com `Botao` (primário "Explorar o catálogo", secundário "Dimensionar meu ambiente") e a cobertura da base como leitura com hairline e contagens em mono. Os `.home-cartoes`/`.home-cartao` antigos saíram do `global.css`.
- **Movimento:** a única entrada orquestrada do site — ticks em sequência de 40 ms, uma vez, em `@media (prefers-reduced-motion: no-preference)`; no celular a barra cresce no mesmo compasso. Com movimento reduzido, tudo nasce no lugar.
- **Testes:** novo `test/regua-capacidade.test.ts` (7 puros: contagens do dataset publicado, soma ≥ total, links por faixa, rótulos, proporção, faixa vazia omitida, contagem única por faixa); `analises-build.test.ts` ganhou `conferirReguaDaHome` (seis links, contagens recalculadas da base servida, nota da soma) e passou a conferir as duas ações no lugar dos cartões.
- **Verificação:** `pnpm test` 755/755 (50 arquivos), `pnpm typecheck` OK, `pnpm lint` 0 erros e 23 warnings (abaixo dos 24 anteriores), `pnpm build` reproduz `data/build` e `reports`, `pnpm build:site` 2.236 páginas. No navegador (agent-browser, 320/390/768/1024/1440): foco âmbar de 2 px nos seis links, `aria-label` com contagem, clique em 24.001–30.000 abre `/aparelhos/?btuMin=24001&btuMax=30000` com 197 resultados, 0 px de overflow horizontal, `animation-name` presente no normal e `none` em `reduced-motion`.
