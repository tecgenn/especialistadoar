# 91 — Calibração do chão visual: branco quase puro

**What to build:** ajustar a família clara do sistema **antes** que os tickets `#69`–`#90` a apliquem. O chão deixa de ser o papel mineral esverdeado (`#F2F5F1`) e passa a giz/papel quase brancos e neutros; tinta, petróleo, âmbar, frio e as cores de Classe não mudam, porque já são dados ou acento. Este ticket mexe no contrato (tokens, `DESIGN.md`, testes e capturas), não reescreve páginas: as superfícies claras herdam a mudança na hora e os tickets de página removem os hex legados quando tocarem em cada superfície.

**Blocked by:** None — pode começar agora (`68` está `done`). **Executar antes de `#69`.**

**Skills:** `impeccable` — `SKILL.md` + `reference/new-work-world.md`, `reference/colorize.md`, `reference/craft-floor.md`. `design-taste-frontend` — `references/system.md`. `ui-ux-pro-max` — `"accessible neutral palette contrast" --domain ux`. `agent-browser` — capturas antes/depois em 390 e 1440 px.

**Status:** done

- [x] `--giz` passa a `#FDFDFB` (quase branco) e `--papel` a `#F8F8F7` (branco quase puro, neutro, sem viés mineral esverdeado); nenhum fundo de página fica mais escuro que isso.
- [x] A família neutra acompanha a mudança: `--mineral` e `--linha` são recalibrados para a mesma temperatura (`#ECEDEB` e `#D5D8D5`), e `--escala-neutro` deixa `#D9DED7` e passa a `#E2E4E1`. Os aliases legados (`--fundo`, `--superficie`, `--borda`) continuam apontando para os tokens novos.
- [x] Tinta (`#0A1F22`), petróleo (`#123F45`), âmbar (`#E8A33D`), frio (`#2F7F8C`) e Classes A–F permanecem intactos: a correção é do chão, não do sinal nem do dado.
- [x] Superfícies escuras continuam restritas ao que o contrato já prevê — rodapé, linhas de seção da matriz e dock de seleção — e nenhuma vira fundo de página.
- [x] `DESIGN.md` é atualizado no frontmatter e nas seções Colors, Elevation & Depth e Do's and Don's: a descrição "papel mineral frio" dá lugar a "chão quase branco e neutro"; a paleta documentada passa a bater com `tokens.css` valor por valor.
- [x] `apps/site/test/tokens.test.ts` recalcula os pares de contraste com os valores novos sem enfraquecer nenhuma asserção; o CSS continua sendo a fonte normativa lida pelo teste.
- [x] Nenhuma cor é escrita à mão em componente novo. A lista de resíduos antigos em `apps/site/src/styles/global.css` (`#16a34a`, `#2563eb`, `#ca8a04`, `#ea580c`, `#dc2626`, `#e0f2fe`, `#fffbeb`, `border-radius: 999px`) está inventariada em `spec-fase12.md` (Riscos e questões abertas), com o ticket dono de cada superfície; `#91` não duplica essa remoção.
- [x] Capturas com `agent-browser` em 390 e 1440 px, antes e depois, de `/`, `/aparelhos/` e de uma ficha, feitas em arquivo temporário e descartadas ao fim da validação: o fundo lê branco quase puro, o contraste do texto continua AA e nenhuma página ganhou superfície escura nova.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build:site` permanecem verdes; `data/build`, `reports`, URLs, canonical, JSON-LD e contagem de páginas não mudam.

## Comments

Criado em 2026-11-20 a pedido do produto, depois da revisão dos tickets `#66`–`#68`. A direção "instrumento de climatização" continua a mesma; o que muda é a temperatura do chão, que no contrato atual (`#F2F5F1`) tem viés verde suficiente para ler como uma paleta genérica de dashboard. Como `tokens.css` é a camada normativa, a mudança é global e barata agora; executar o ticket depois de `#70`–`#84` exigiria revisar cada superfície já construída e reabrir o `DESIGN.md` no `#89`.
