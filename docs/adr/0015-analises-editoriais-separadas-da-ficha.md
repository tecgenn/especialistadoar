# Análises editoriais separadas da ficha oficial

**Status:** aceito

A partir da Fase 5 o site passa a ter **Análises** (ver `CONTEXT.md`): textos
editoriais sobre um único Aparelho, com objetivo de aquisição (SEO e marketing),
publicados numa seção própria (`/analises/<slug>`) e ligados ao Aparelho por
`aparelhoId`. A ficha do Aparelho continua sendo a página dos **Valores oficiais**
do INMETRO. As duas seguem indexadas, com títulos e intenções distintos e links
cruzados: a ficha aponta para a Análise e a Análise aponta para a ficha.

A Análise é **editorial**: pode arredondar, comparar e afirmar números próprios,
sem reproduzir a ficha e **sem aviso** de que não são Valores oficiais. Preço não é
afirmado no texto — quem mostra preço é a loja, pelo CTA da Oferta.

O ciclo de vida é **aditivo**: uma Análise nunca é apagada, e "duas por potência" é
meta de conteúdo, não invariante do build. Se o Aparelho ficar **Ausente** da Versão
da tabela, a página continua no ar com aviso de que não consta na versão atual, sem
bloco de dados e sem CTA se a Oferta morrer; o build **não** falha. Com zero
Análises o site é válido, e a seção não aparece no menu, no sitemap nem no
`analises.json`.

## Considered Options

- **Análise dentro da ficha** — zero duplicação de URL, mas não cria a seção
  editorial pedida e mistura opinião com dado oficial na mesma página.
- **`noindex` na ficha dos modelos com Análise** — garante que a Análise ganhe a
  busca, mas tira do índice páginas de dados únicas e a cauda longa. Adiado: revisão
  em 60–90 dias pelo Search Console, quando houver impressões para comparar.
- **Números só oficiais na Análise** — elimina qualquer divergência, mas engessa a
  redação, porque a própria tabela do INMETRO não é precisa o suficiente.
- **Análise editorial sem aviso** (escolhida) — liberdade de marketing e de
  redação; o custo é que o site pode exibir dois números diferentes para o mesmo
  modelo, e o leitor não é avisado de qual é oficial.

## Consequences

- Nova camada de conteúdo do site (MDX), fora do pipeline e de `data/build/`.
- O build do site valida o formato do `aparelhoId`, o slug único e no máximo uma
  Análise por Aparelho. Um id que não está na base servida não falha o build: a
  página é renderizada degradada (Aparelho Ausente), o que também expõe um id
  digitado errado.
- O link bidirecional depende de um mapa `aparelhoId → Análise` construído no build.
- O Agente descobre as Análises por `analises.json` e JSON-LD; a base servida
  permanece intocada.
- Uma Análise pode envelhecer com números que já não batem com a Versão atual da
  tabela; isso é aceito e não é corrigido automaticamente.
- Publicar uma Análise continua sendo um PR comum; o merge é a publicação
  (ADR-0004). O endereço segue em `especialista-do-ar.pages.dev` até a fase de
  domínio próprio.
