# 20 — Página 404

**What to build:** uma página de erro que recupera o visitante sem humor forçado: "Fora da escala", uma frase curta, a régua de capacidade como caminho de volta e links para Aparelhos, Assistente, Comparar e Home. Ela usa a mesma moldura do site e não entra no sitemap.

**Blocked by:** 02 — Shell global; 03 — Primitivos de interface e ícones.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/copy.md`, `references/moments.md`. `ui-ux-pro-max` — `"404 error recovery navigation" --domain ux`.

**Status:** ready-for-agent

- [ ] A rota `404.html` é gerada no build com a mesma moldura (header, footer, skip link).
- [ ] O título é "Fora da escala", com uma frase curta e sem culpa; nenhum texto de marketing.
- [ ] A régua de capacidade aparece em versão compacta e leva aos recortes reais do catálogo.
- [ ] Há links claros para Aparelhos, Assistente, Comparar e Home, com alvos de 44 px.
- [ ] A página tem `noindex` e não aparece no sitemap.
- [ ] No celular, a régua vira lista e os links empilham sem overflow.
- [ ] O teste de build confere o arquivo, o `noindex` e a ausência no sitemap; a expectativa de contagem de páginas do build é ajustada para incluir o 404.
