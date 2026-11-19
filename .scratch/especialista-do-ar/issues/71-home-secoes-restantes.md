# 71 — Home: cobertura, populares, destaques, Assistente, FAQ e metodologia

**What to build:** o restante da home no novo sistema, mantendo integralmente o conteúdo editorial e o `FAQPage`. A página deixa de ser uma sequência de cartões genéricos e passa a ser um percurso: cobertura → capacidades → marcas → análises → Assistente → perguntas → metodologia. Cada bloco tem uma razão de existir e um caminho para a próxima decisão.

**Blocked by:** 69 — Ofertas; 70 — Home: hero e a régua de capacidade.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/sections.md`, `references/sections-library.md`. `ui-ux-pro-max` — `"faq accordion heading" --domain ux`.

**Status:** ready-for-agent

- [ ] A cobertura da base é uma leitura de dados com hairlines, não um card; mostra aparelhos, marcas, capacidades e a Versão da tabela com origem.
- [ ] Capacidades e marcas populares são listas de links com contagem e hierarquia tipográfica, sem chips soltos nem grade de cartões iguais.
- [ ] A seção de Análises em destaque usa a imagem real, o título, a data e o CTA de Oferta quando houver; sem Análise publicada, a seção desaparece.
- [ ] O Assistente é apresentado em três passos numerados com régua e CTA; o texto do método permanece.
- [ ] O FAQ mantém as oito perguntas e respostas atuais, em `<details>` nativo, com o mesmo texto no `FAQPage` visível e no JSON-LD.
- [ ] A metodologia e a explicação do INMETRO permanecem em coluna de leitura, com notas de fonte em mono e sem promessa de economia.
- [ ] No celular, todos os blocos empilham em uma coluna, sem carrossel e sem overflow.
- [ ] O JSON-LD `WebSite` + `FAQPage` continua idêntico em conteúdo; o teste de build confere as oito perguntas.
- [ ] Nenhum texto novo promete preço, economia, recomendação ou "melhor aparelho".
