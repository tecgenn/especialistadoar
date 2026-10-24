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

**Status:** ready-for-agent

- [ ] A home tem H1, texto curto, o bloco de destaques (só com Análises) e o botão.
- [ ] O menu mostra "Aparelhos" e, condicionalmente, "Análises"; "Buscar no site" sai
      do menu (a página é removida no ticket 30).
- [ ] Abrir `/?marca=MIDEA&btu=12000` redireciona para `/aparelhos/?marca=MIDEA&btu=12000`;
      abrir `/` sem parâmetros continua na home.
- [ ] O redirecionamento preserva a ordem dos parâmetros e funciona com a Marca oficial
      antiga (`?marca=SPRINGER MIDEA`).
- [ ] `<title>`, descrição, canonical e o JSON-LD refletem a home e a nova página
      Aparelhos.
- [ ] Testes: home no build (com fixture e no estado zero) e o script de redirect em jsdom.
- [ ] `pnpm build:site` gera as 2.462 páginas.
