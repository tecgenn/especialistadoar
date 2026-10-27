# 29 — Home, menu e redirecionamento dos links antigos

**What to build:** `/` deixa de ser o catálogo e volta a ser a **home**: um texto
curto sobre o site, o bloco de Análises em destaque (ticket 19, com os Aparelhos
analisados e o aviso de afiliado) e um botão **"Ver todos os aparelhos"** para
`/aparelhos/`. O menu passa a ter **Aparelhos** e **Análises** (esta só com ao menos
uma Análise). Os links antigos que traziam filtros (`/?marca=…`, `?tipo=`, `?btu=`,
`?tensao=`, `?q=`) levam a `/aparelhos/` com os mesmos parâmetros, por um script
curto na home (o `_redirects` do Cloudflare Pages não separa a mesma URL por
parâmetros); sem JavaScript a pessoa vê a home, com o botão.

**Blocked by:** 27 — Página Aparelhos; 28 — Aparelhos analisados.

**Status:** done

- [x] A home tem H1, texto curto, o bloco de destaques (só com Análises) e o botão.
- [x] O menu mostra "Aparelhos" e, condicionalmente, "Análises"; "Buscar no site" sai
      do menu (a página é removida no ticket 30).
- [x] Abrir `/?marca=MIDEA&btu=12000` redireciona para `/aparelhos/?marca=MIDEA&btu=12000`;
      abrir `/` sem parâmetros continua na home.
- [x] O redirecionamento preserva a ordem dos parâmetros e funciona com a Marca oficial
      antiga (`?marca=SPRINGER MIDEA`).
- [x] `<title>`, descrição, canonical e o JSON-LD refletem a home e a nova página
      Aparelhos.
- [x] Testes: home no build (com fixture e no estado zero) e o script de redirect em jsdom.
- [x] `pnpm build:site` gera as 2.463 páginas (2.462 só no fim da Fase 7, quando
      `/busca/` sai no ticket 30; mesma ressalva do ticket 27).

## Answer

A home (`apps/site/src/pages/index.astro`) deixou de hospedar a ilha de consulta:
agora traz H1, texto curto, o bloco `AnalisesDestaque` (condicional) e o botão
"Ver todos os aparelhos" para `/aparelhos/`, com JSON-LD de `WebSite`. O menu
(`Base.astro`) mostra Aparelhos e, com ≥ 1 Análise, Análises — "Buscar no site"
saiu. A página `/aparelhos/` ganhou JSON-LD de `CollectionPage` e os metadados
próprios; a ficha e a página de busca apontam para `/aparelhos/` em vez de `/`.

O redirect dos links antigos é `apps/site/src/lib/redirect.ts` (puro, testável):
`destinoDosFiltrosAntigos` monta `/aparelhos/` + a querystring literal (ordem e
`%20` preservados) e `redirecionarFiltrosAntigos` só chama o redirecionamento
quando há parâmetros. A home usa um `<script>` de módulo curto, então sem
JavaScript a pessoa continua vendo a home com o botão. Teste em
`apps/site/test/redirect.test.ts` (jsdom) e o build ponta a ponta em
`analises-build.test.ts` (fixture e estado zero).

`data/build` e `reports` não mudam; `pnpm build:site` gera 2.463 páginas enquanto
`/busca/` existir.

