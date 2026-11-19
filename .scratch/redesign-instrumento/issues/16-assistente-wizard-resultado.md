# 16 — Assistente: wizard de cinco etapas e leitura do resultado

**What to build:** o Assistente vira um diagnóstico calibrado: trilho de cinco segmentos, uma pergunta por tela, cartões de opção grandes e um resultado com capacidade recomendada em leitura grande, fatores, soma, suposições e orientações. O motor determinístico e as respostas não mudam.

**Blocked by:** 03 — Primitivos de interface e ícones.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/motion.md`, `references/moments.md`. `ui-ux-pro-max` — `"multi step form progress" --domain ux`.

**Status:** ready-for-agent

- [ ] O trilho mostra 5 segmentos, o atual em âmbar e o texto "Etapa N de 5" em mono, com `role="progressbar"` e valores acessíveis.
- [ ] Cada etapa tem uma pergunta, campos/opções com alvo de 56 px, sufixo de unidade e "Voltar"/"Continuar" com hierarquia correta.
- [ ] Contadores +/− têm `aria-label`, `aria-live` no valor e 44 px; o teclado numérico é usado no celular.
- [ ] Erros de campo aparecem junto ao campo, com `aria-describedby` e foco; "Continuar" bloqueado explica o motivo.
- [ ] Ao avançar, o foco vai para o título da etapa; ao voltar, as respostas são preservadas.
- [ ] O resultado mostra capacidade recomendada, rótulo de estimativa, confiança com cor e texto, fatores em lista mono com BTU/h, soma, suposições e orientações.
- [ ] O CTA para o catálogo filtrado usa a capacidade recomendada e os cartões de Aparelhos analisados aparecem só quando existem.
- [ ] No celular, tudo empilha em uma coluna e o resultado vem antes dos cartões.
- [ ] Os testes do motor e da ilha continuam verdes; novos testes cobrem foco por etapa e erro de campo.
