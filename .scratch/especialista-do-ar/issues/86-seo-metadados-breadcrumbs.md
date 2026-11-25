# 86 — SEO e metadados: Open Graph, breadcrumbs e preservação

**What to build:** todas as páginas passam a ter metadados sociais completos e dados estruturados de navegação, sem perder nada do SEO atual. O canonical continua limpo, o `FAQPage` continua idêntico ao FAQ visível, a ficha e a Análise ganham `BreadcrumbList`, o 404 é `noindex` e o sitemap continua correto.

**Blocked by:** 67 — Shell global; 75 — Ficha: topo; 82 — Análises: índice; 83 — Análise: template; 85 — Página 404.

**Skills:** Nenhuma das três é fonte de SEO técnico. Validar com o checklist deste ticket e o seam de build; usar `context7` apenas para conferir a API do Astro se necessário.

**Status:** ready-for-agent

- [ ] `og:type`, `og:title`, `og:description`, `og:site_name`, `og:locale` e `twitter:card` estão presentes em todas as rotas.
- [ ] `og:image` é emitido apenas onde há imagem real (Análise), com URL absoluta; nenhuma imagem fictícia é criada.
- [ ] Ficha e Análise emitem `BreadcrumbList` coerente com o breadcrumb visível.
- [ ] `WebSite`, `FAQPage`, `CollectionPage`, `WebApplication` e `Article` continuam com o mesmo conteúdo e validade.
- [ ] Canonical permanece igual à URL servida em todas as rotas; `/comparar/` continua sem `ids` e não indexa comparações específicas.
- [ ] O 404 tem `noindex` e não entra no sitemap; as demais rotas continuam no sitemap.
- [ ] Nenhum conteúdo indexável é movido para o cliente; o HTML inicial do catálogo e da ficha continua semântico.
- [ ] Um teste de build confere as tags sociais, os JSON-LD e a ausência do 404 no sitemap.
