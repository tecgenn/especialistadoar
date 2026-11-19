# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing Astro static site in a pnpm monorepo. Pages are prerendered; interaction lives in four React islands (the Aparelho table, the comparison, the BTU assistant and the energy-cost calculator). The published base is a build-time copy of `data/build/`; there is no runtime server for the site. The redesign must stay inside this architecture. No new frontend framework, no runtime API dependency, no URL changes without redirects.

## Users

- **Brazilian buyer researching an air conditioner before purchase.** Often on a phone, often arriving from a search for a specific model, a capacity ("12.000 BTUs") or a brand. Wants to know whether a model is efficient, how much it consumes, what fits the room, and how it compares with two or three alternatives. Not an HVAC engineer.
- **Technically minded researcher, installer or salesperson.** Uses the table as a reference, sorts and filters, opens the datasheet, checks test conditions, provenance and INMETRO registration. Values density and precision over marketing.
- **Reader of an editorial analysis.** Arrives at a single review, wants a judgement grounded in official numbers, and needs to know what is editorial opinion and what is declared data.

## Product Purpose

Turn the official INMETRO air-conditioner export into a readable, comparable, trustworthy research surface: find a model, understand its numbers, size a room, estimate energy cost, compare alternatives and reach an informed decision. Success means a visitor can move from a vague need ("my room is hot") to a shortlist with reasons, without the site inventing data or hiding uncertainty.

## Positioning

The only Brazilian air-conditioner research platform that shows the full INMETRO declared dataset as a first-class, queryable catalogue and pairs it with transparent tools: a BTU assistant with an open formula, an energy-cost estimate with its inputs in the URL, a neutral comparison and editorial analysis that always links back to the official datasheet. No marketplace, no price claims, no ranking by commercial interest.

## Operating Context

- The catalogue is a **Versão da tabela** of the INMETRO export; every value is official and reproduced without editorial correction. The version hash and date are part of the product's credibility and appear in the interface.
- Affiliate **Ofertas** exist, are clearly marked, and never enter the technical comparison matrix.
- The **Análise** is editorial content written in MDX, tied to one Aparelho.
- The **Assistente** is a deterministic heuristic, not a thermal-load calculation; its recommendation is a Valor calculado.
- The **Custo estimado** uses 2.080 h/ano and a curated reference tariff per UF; it is an estimate, never an official value.
- The audience reads Portuguese (pt-BR). All product language is Portuguese; code and commits are English.

## Capabilities and Constraints

- 2,227 Aparelhos with declared data at the time of writing, 70 catalogue brands, 44 capacities; the site also exposes the JSON artefacts as a static API.
- Routes: `/`, `/aparelhos/`, `/aparelhos/[id]/` (one page per Aparelho), `/comparar/`, `/assistente/`, `/analises/` (conditional), `/analises/[slug]/`, `/contato/`, `/politica-de-privacidade/`, `/termos-de-uso/`, plus the generated JSON endpoints and redirects.
- Interaction state lives in the URL (`q`, `marca`, `tipo`, `btu`, `btuMin`, `btuMax`, `funcao`, `classe`, `tensao`, `ordem`, `dir`, `ids`, `uf`, `tarifa`, `horas`, `dias`, assistant answers). Links must keep working.
- SEO is a product constraint: canonical URLs, metadata, JSON-LD (`WebSite`, `FAQPage`, `CollectionPage`, `WebApplication`, `Article`), sitemap, semantic HTML and crawlable content. No content may move behind client-only rendering for aesthetic reasons.
- Performance is a product constraint: static HTML first, minimal hydration, no heavy animation library, self-hosted subset fonts, no layout shift.
- Domain vocabulary is defined in `CONTEXT.md`: Aparelho, Variante, Linha da tabela, Registro INMETRO, Marca de catálogo, Oferta, Análise, Comparação, Assistente, Recomendação do Assistente, Faixa de capacidade, IDRS, Classe, Situação, Valor oficial, Valor calculado, Custo estimado, Tarifa de referência, Versão da tabela.
- Data/build and reports are committed, derived artefacts; the redesign must not hand-edit them.

## Brand Commitments

- **Independence from INMETRO and from commerce.** The site is not INMETRO; it reproduces official values and never presents an estimate as official.
- **No price, discount or savings promise.** Offers may say where to buy; they may not claim a price, the lowest price, or a saving.
- **Neutral comparison.** No winner, star rating, "best" badge or commercial ordering inside the technical matrix.
- **Affiliate transparency at three levels:** beside the link, in the Terms and in the footer.
- **Plain, credible Portuguese.** No hype, no fake urgency, no invented testimonials, statistics or products.
- The name **Especialista do Ar** is fixed.

## Evidence on Hand

- `data/build/aparelhos.json` and `consulta.json`: the real catalogue, counts, IDs, capacities, classes, consumption and registrations.
- `apps/site/filtros.json`: curated brands and capacities.
- `apps/site/ofertas.json`: one live affiliate offer (Mercado Livre) for the Samsung WindFree AI Pro 12.000.
- `apps/site/tarifas.json`: reference tariffs for the 27 UFs with month and source.
- `apps/site/src/content/analises/`: one published editorial analysis, with real product photography.
- `reports/revisao-2026-10-12.md` and `data/build/manifest.json`: provenance, version hash and row counts.
- There are no customer logos, testimonials, press mentions, team photographs or commercial photography beyond the analysis image. Future work must not fabricate them.

## Product Principles

1. **Show the number, then explain it.** Every figure carries its unit, its origin and, when calculated, its formula.
2. **Official and calculated are different materials.** The interface must make the distinction visible without a legend the reader has to hunt for.
3. **Density is a feature.** The catalogue is the product; do not trade rows, columns or scanability for decoration.
4. **One path from curiosity to a shortlist.** Search, size, compare, read, decide — each step leads to the next without a dead end.
5. **Calm authority.** The tone is technical and direct; confidence comes from provenance and consistency, not from visual noise.

## Accessibility & Inclusion

- WCAG 2.2 AA: semantic landmarks, visible focus, 4.5:1 body contrast, 3:1 non-text contrast, keyboard-operable comboboxes, filters, dialogs and wizard, labelled form controls, error messages tied to fields.
- Responsive from 320 px to wide desktop; touch targets at least 44 px; tables must remain usable on phones through a deliberate card/scroll strategy.
- `prefers-reduced-motion` respected; no content hidden behind animation.
- Portuguese reading level: short sentences, technical terms explained on first use.
