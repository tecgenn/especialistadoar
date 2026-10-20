# 17 — Camada de Análises ponta a ponta

**What to build:** a capacidade de publicar uma **Análise** — uma peça editorial em
MDX sobre um único Aparelho, numa seção própria (`/analises/<slug>`), ligada à ficha
do Aparelho por `aparelhoId`. Com zero Análises, o site continua exatamente como
hoje; a seção, o menu, o sitemap e o `analises.json` só aparecem quando existir pelo
menos uma.

O build valida o contrato (campos obrigatórios, slug único, uma Análise por
Aparelho) e falha em violação. Um `aparelhoId` que não está na base servida **não**
falha: é um Aparelho **Ausente**, e a página degrada com aviso, sem bloco de dados e
sem CTA (ADR-0015).

A camada é do site: nada muda em `data/build/`, `reports/`, na API estática ou na
consulta.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] O site renderiza MDX numa coleção de conteúdo, com frontmatter obrigatório:
      `aparelhoId`, `slug`, `titulo`, `descricao` e `data`.
- [ ] O build falha com mensagem clara para campo obrigatório vazio, `slug` repetido
      e mais de uma Análise para o mesmo `aparelhoId`.
- [ ] Com uma Análise de fixture, o build gera `/analises/<slug>/` com H1/título
      próprios (distintos da ficha), data e corpo renderizado, e link para a ficha
      do Aparelho.
- [ ] A ficha do Aparelho passa a exibir "Leia a análise" quando existe Análise para
      aquele `aparelhoId`, num mapa construído no build.
- [ ] A Análise entra no sitemap e no índice do Pagefind.
- [ ] O build publica `analises.json` na raiz do site com `slug`, `url`,
      `aparelhoId`, `titulo`, `descricao` e `data`.
- [ ] A página traz JSON-LD de `Article` (sem nota/`Review` inventada), `title`,
      meta description e canonical a partir do frontmatter.
- [ ] Com zero Análises, a rota `/analises/` não é gerada, não há item de menu nem
      `analises.json`, e o site continua com as 2.462 páginas.
- [ ] Estado degradado: Análise de Aparelho ausente da base continua publicada, com
      aviso de que não consta na Versão atual, sem dados técnicos e sem CTA; o build
      não falha.
- [ ] Teste de build ponta a ponta com fixture cobre página, link bidirecional,
      sitemap, `analises.json` e JSON-LD; o mesmo teste cobre o estado zero.
- [ ] Testes do módulo puro cobrem validação, indexação, mapa `aparelhoId → Análise`,
      lista do `analises.json` e visibilidade condicional.
- [ ] `data/build/` e `reports/` reproduzidos byte a byte; `pnpm build`,
      `pnpm build:site`, `pnpm lint`, `pnpm typecheck` e `pnpm test` verdes.

## Origin

Sessão de `grill-with-docs` de 2026-10-20 (Fase 5). Ver
`.scratch/especialista-do-ar/spec-fase-5.md`, ADR-0015 e `CONTEXT.md` (Análise).
