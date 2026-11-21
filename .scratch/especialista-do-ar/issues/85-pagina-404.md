# 85 — Página 404

**What to build:** uma página de erro que recupera o visitante sem humor forçado: "Fora da escala", uma frase curta e links para Aparelhos, Assistente, Comparar e Home. Ela usa a mesma moldura do site e não entra no sitemap. Sem gráfico de recuperação: a régua de capacidade saiu do site no ticket 94, e a página não a recria em versão compacta.

**Blocked by:** 67 — Shell global; 68 — Primitivos de interface e ícones.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/copy.md`, `references/moments.md`. `ui-ux-pro-max` — `"404 error recovery navigation" --domain ux`.

**Status:** ready-for-agent

- [ ] A rota `404.html` é gerada no build com a mesma moldura (header, footer, skip link).
- [ ] O título é "Fora da escala", com uma frase curta e sem culpa; nenhum texto de marketing.
- [ ] Nenhum gráfico de escala na página; o caminho de volta é uma lista de destinos, não uma segunda régua.
- [ ] Há links claros para Aparelhos, Assistente, Comparar e Home, com alvos de 44 px.
- [ ] A página tem `noindex` e não aparece no sitemap.
- [ ] No celular, os links empilham sem overflow horizontal em 320 e 390 px.
- [ ] O teste de build confere o arquivo, o `noindex` e a ausência no sitemap; a expectativa de contagem de páginas do build é ajustada para incluir o 404.
