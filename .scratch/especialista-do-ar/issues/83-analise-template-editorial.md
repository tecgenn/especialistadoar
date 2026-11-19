# 83 — Análise: template editorial

**What to build:** o artigo de Análise passa a ler como uma publicação técnica: coluna de 68 ch, serifa no corpo, grotesca nos subtítulos, mono na data e nas legendas, aviso de transparência com borda âmbar, figuras com legenda real e CTAs separados por hairline. O texto, as imagens e o `Article` JSON-LD atuais são preservados.

**Blocked by:** 69 — Ofertas.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/copy.md`, `references/moments.md`. `impeccable` — `reference/typeset.md`, `reference/craft.md`.

**Status:** ready-for-agent

- [ ] A coluna de leitura é de 68 ch; o H1 é display; data e tempo de leitura usam mono; breadcrumb presente.
- [ ] O aviso de transparência é um bloco de nota com borda âmbar e o mesmo texto.
- [ ] O corpo MDX usa serifa 1,0625 rem/1,65, H2/H3 em grotesca, listas com marcador de 1 px, links sublinhados e citações em serifa itálica.
- [ ] Figuras usam `<Image>` com dimensões, `loading="lazy"` abaixo da dobra, `decoding="async"` e legenda mono; nenhuma imagem é trocada ou inventada.
- [ ] O CTA de topo (Oferta ou ficha), o CTA do Assistente, o bloco de dados oficiais e o CTA final mantêm a ordem e a transparência.
- [ ] `Article` JSON-LD, canonical e metadata são preservados; o `BreadcrumbList` é tratado no ticket de SEO.
- [ ] Estados: modelo fora da versão, sem Oferta e imagem ausente continuam funcionando.
- [ ] No celular, a coluna é única, figuras ocupam a largura e os CTAs empilham.
- [ ] O teste de build confere a estrutura do artigo, o JSON-LD e as imagens.
