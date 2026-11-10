# 47 — Análise: Banner de Transparência e CTAs em Cartão

**What to build:** Toda página de Análise ganha o banner de transparência no topo, antes do corpo do artigo, com o texto exato aprovado, e passa a ter 3–4 CTAs em cartão (topo, meio e fim) — nunca links soltos como CTA. Com Oferta são quatro CTAs; sem Oferta, três, garantindo sempre ficha técnica, Assistente e tabela filtrada pela capacidade.

**Blocked by:** 41 — Assistente: Motor Determinístico e Wizard

**Status:** done

- [x] Banner de transparência no topo do conteúdo, antes do corpo do artigo
- [x] Texto exato do banner:
  - **Aviso de transparência**
  - Este artigo contém links de afiliados. Podemos receber uma comissão pelas compras realizadas através desses links, sem custo adicional para você.
- [x] CTA 1 no topo, após o lead: "Ver oferta" quando há Oferta; "Ver ficha técnica" quando não há
- [x] CTA 2 no meio do artigo: "Calcular os BTUs do meu ambiente" → `/assistente/`
- [x] CTA 3 no fim: Oferta (quando houver) + "Ver ficha técnica" + "Ver outros de X BTU/h" para a tabela filtrada
- [x] Com Oferta: 4 CTAs; sem Oferta: 3 CTAs (cada CTA é um cartão/bloco; o cartão final pode reunir mais de uma ação)
- [x] Nenhum CTA em formato de link solto; os CTAs são cartões visualmente destacados
- [x] O cartão comercial mantém `rel="sponsored nofollow noopener"` e `target="_blank"`
- [x] O cartão comercial se identifica como link de afiliado, coerente com o ADR-0010
- [x] A Oferta embutida no MDX da Análise atual não é duplicada: o template garante os cartões e o MDX não repete o mesmo CTA
- [x] Links de navegação interna ("Todas as análises", ficha, tabela) podem continuar no texto, mas não contam como CTAs
- [x] Testes de build: banner com texto exato, 3 CTAs sem Oferta, 4 com Oferta, Oferta com `rel`/`target` corretos e ausência de CTA duplicado
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
