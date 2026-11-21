# 98 — Assistente na home: reposicionar ou remover

**What to build:** a seção "Descubra quantos BTUs você precisa" (Assistente) está fraca e mal dimensionada. Decidir se fica abaixo do hero com apelo visual muito melhor (ação direta, fácil de usar) ou se sai da home. O hero já não tem mais o botão "Calcular BTUs": o simulador de ambiente do #93 faz a estimativa ali mesmo e liga ao Assistente na nota de rodapé, então a saída da seção não deixa a home sem caminho para a ferramenta. Se ficar, precisa de hierarquia clara e destaque visual sem repetir o simulador.

**Critério de decisão (fixado agora, para não ser resolvido por gosto na execução):** a seção fica **só se** oferecer algo que o simulador do hero não oferece — os fatores que ele não pergunta (pessoas, eletrônicos, lâmpadas, janelas), o resultado com a conta aberta fator por fator e a confiança. A seção sai **se** o conteúdo for uma segunda chamada para a mesma estimativa de 20 m², porque aí ela é um CTA disfarçado de seção, e o Assistente completo já mora em `/assistente/`. Qualquer que seja a escolha, o texto de metodologia (`SECOES`/metodologia) e os testes de build da home precisam ser ajustados no mesmo commit. O impacto de tamanho é conhecido: ficar = reprojetar a seção e seus passos; sair = remover o bloco, a constante `PASSOS_ASSISTENTE` se não tiver outro uso, e as asserções.

**Blocked by:** 93 — Hero renovado.

**Skills:** `impeccable` — `reference/distill.md` (critério para a saída) e `reference/new-work-world.md` + `reference/craft-floor.md` (se ficar, hierarquia e apelo visual sem repetir o simulador). `design-taste-frontend` — `references/copy.md`, `references/moments.md` e `references/cards.md`. `ui-ux-pro-max` — `"redundant cta removal" --domain ux` e `"cta visual hierarchy" --domain ux`.

**Status:** ready-for-agent

- [ ] Decisão tomada: Assistente fica abaixo do hero com apelo visual, ou sai da home
- [ ] Se ficar: mostra os fatores que o hero não pergunta e não repete a estimativa dele
- [ ] Se ficar: ação direta, fácil de usar, visualmente atraente
- [ ] Se sair: o simulador do hero e a nota dele continuam sendo o caminho para o Assistente
- [ ] 0 px de overflow em todos os breakpoints
- [ ] Alvos de 44 px, foco visível
- [ ] Testes atualizados para o novo estado da seção
- [ ] `DESIGN.md` atualizado no mesmo commit (decisão final e termos relacionados revisados; `impeccable detect` e testes doc↔código conferidos)
