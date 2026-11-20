# 92 — Paleta: azul frio / gelo para climatização (substitui petróleo)

**What to build:** a cor primária do sistema deixa de ser o petróleo esverdeado (`--petroleo: #123F45`) e passa a uma família azul-frio/gelo, coerente com "instrumento de climatização" (ar condicionado, refrigeração, tons neutros frios). O rodapé, botões primários, focos, links e acentos que hoje herdam `--primaria` (petróleo) passam a usar a nova família azul-frio, mantendo contraste AA em todas as superfícies (giz, papel, tinta). O ticket mexe no contrato (`tokens.css`, `DESIGN.md`, testes) e remove os resíduos de petróleo das páginas que já tocarem nessas superfícies; não reescreve páginas que ainda não foram migradas.

**Blocked by:** 91 — Calibração do chão visual (pronto); 69 — Ofertas no novo sistema (pronto). Pode começar agora.

**Skills:** `impeccable` — `SKILL.md` + `reference/colorize.md`, `reference/craft-floor.md`. `design-taste-frontend` — `references/system.md`, `references/color.md`. `ui-ux-pro-max` — `"accessible cool blue palette" --domain ux`, `"brand color temperature shift" --domain brand`. `agent-browser` — capturas antes/depois em 390 e 1440 px de `/`, `/aparelhos/`, ficha, análise, comparação, rodapé.

**Status:** done

- [x] `--primaria` aponta para um novo token `--azul-frio` (família gelo/climatização, ex.: `#0E6B8A` / `#087F9B` / `#065E7A` para estados) em vez de `--petroleo`; `--petroleo` e `--petroleo-profundo` permanecem no contrato como "dado legado" mas não são mais a cor de ação primária.
- [x] A família azul-frio tem tokens explícitos: `--azul-frio` (base), `--azul-frio-hover`, `--azul-frio-ativo`, `--azul-frio-texto` (branco sobre base), `--azul-frio-lavado` (fundo 6–10% para chips/badges). Todos com contraste ≥ 4.5:1 sobre giz/papel e ≥ 3:1 em não-texto.
- [x] Rodapé (`.site-footer`) usa a nova família: fundo `--azul-frio-escuro` (ou `--tinta` com viés azul), links e bordas na nova cor; o rodapé deixa de ler "verde-petróleo".
- [x] Botão primário (`.botao-primario`), foco global (`outline: 2px solid var(--primaria)`), links, chips ativos, badges de Classe que usam `--primaria` como acento herdam a mudança automaticamente via token.
- [x] `DESIGN.md` atualizado: seção Colors, Elevation & Depth, Do's and Don's; a descrição "petróleo" dá lugar a "azul-frio / gelo / climatização"; a paleta documentada bate com `tokens.css` valor por valor.
- [x] `apps/site/test/tokens.test.ts` recalcula pares de contraste com os valores novos sem enfraquecer asserções; o CSS continua sendo a fonte normativa lida pelo teste.
- [x] Nenhuma cor escrita à mão em componente novo; a lista de resíduos antigos em `global.css` (`#075985`, `#e0f2fe`, `border-radius: 999px`, etc.) está inventariada em `spec-fase12.md` — este ticket não duplica a remoção, mas as páginas que ele tocar (rodapé, botões primários, CTA de análise, faixa de ofertas, comparar) removem os hex legados no mesmo commit.
- [x] Capturas com `agent-browser` em 390 e 1440 px, antes e depois, de `/` (rodapé + hero), `/aparelhos/` (tabela + filtros), ficha (CTA primário), análise (cartão CTA), comparação (slots + ações), rodapé isolado: o visual lê "climatização/gelo", contraste AA mantido, nenhuma superfície ganhou tom esverdeado novo.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build:site` verdes; `data/build`, `reports`, URLs, canonical, JSON-LD e contagem de páginas (2236) não mudam.

## Comments

Solicitado pelo produto em 2026-11-20 junto com o ticket `#69`. A direção "instrumento de climatização" já existia; o petróleo (`#123F45`) tem viés verde suficiente para ler como dashboard genérico, não como ar condicionado. O token `--frio` (`#2F7F8C`) já existe no contrato como "assinatura térmica" mas não era a cor de ação. Este ticket promove a família azul-frio a cor primária do sistema. Como `tokens.css` é a camada normativa, a mudança é global e barata; executar depois de `#70`–`#84` exigiria revisar cada superfície já construída e reabrir o `DESIGN.md` no `#89`.