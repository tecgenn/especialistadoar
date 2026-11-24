# 71 — Home: cobertura, populares, destaques, Assistente, FAQ e metodologia

**What to build:** o restante da home no novo sistema, mantendo integralmente o conteúdo editorial e o `FAQPage`. A página deixa de ser uma sequência de cartões genéricos e passa a ser um percurso: cobertura → capacidades → marcas → análises → Assistente → perguntas → metodologia. Cada bloco tem uma razão de existir e um caminho para a próxima decisão.

**Blocked by:** 69 — Ofertas; 70 — Home: hero e a régua de capacidade.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/sections.md`, `references/sections-library.md`. `ui-ux-pro-max` — `"faq accordion heading" --domain ux`.

**Status:** done

- [x] A cobertura da base é uma leitura de dados com hairlines, não um card; mostra aparelhos, marcas, capacidades e a Versão da tabela com origem.
- [x] Capacidades e marcas populares são listas de links com contagem e hierarquia tipográfica, sem chips soltos nem grade de cartões iguais.
- [x] A seção de Análises em destaque usa a imagem real, o título, a data e o CTA de Oferta quando houver; sem Análise publicada, a seção desaparece.
- [x] O Assistente é apresentado em três passos numerados com régua e CTA; o texto do método permanece.
- [x] O FAQ mantém as oito perguntas e respostas atuais, em `<details>` nativo, com o mesmo texto no `FAQPage` visível e no JSON-LD.
- [x] A metodologia e a explicação do INMETRO permanecem em coluna de leitura, com notas de fonte em mono e sem promessa de economia.
- [x] No celular, todos os blocos empilham em uma coluna, sem carrossel e sem overflow.
- [x] O JSON-LD `WebSite` + `FAQPage` continua idêntico em conteúdo; o teste de build confere as oito perguntas.
- [x] Nenhum texto novo promete preço, economia, recomendação ou "melhor aparelho".

## Comments

Implementado em 2026-11-20.

- **Contagens puras:** `lib/home.ts` ganhou `contagensPorCapacidade` (cada Aparelho conta uma vez por capacidade, mesmo com Variantes repetidas no mesmo valor) e `contagensPorMarca` (por Marca de catálogo, ignorando a Marca vazia). A home usa as duas em mono ao lado de cada link popular; nenhum número escrito à mão.
- **Populares:** `HomePopulares.astro` deixou de ser chip pill e virou lista de links com hairline, alvo de 44 px e contagem em mono; capacidades em duas colunas (rótulo grande), marcas em três (rótulo menor). Saíram `.home-links` e o raio 999 px.
- **Análises em destaque:** novo campo opcional `imagem`/`imagemAlt` no frontmatter da Análise (validado em `lib/analises.ts`: alt obrigatório quando há imagem), com caminho relativo a `src/assets`; `AnalisesDestaque.astro` resolve a foto com `import.meta.glob` + `astro:assets` e mostra imagem (alt real), data em mono, título, resumo e o CTA de Oferta. O MDX da Análise publicada aponta a abertura real. Sem imagem, o destaque fica só com o texto; sem Análise, a seção desaparece.
- **Assistente:** os três passos de `PASSOS_ASSISTENTE` ficam numerados `01`–`03` sobre hairline, com o texto do método intacto e uma única ação primária no cabeçalho ("Usar o Assistente").
- **FAQ:** `<details class="home-pergunta">` nativo, fechado por padrão, com a pergunta num `<h3>` dentro do `<summary>` e marcador `+`/`−` desenhado em mono. A lista é a mesma que alimenta o `FAQPage`, então o texto visível e o JSON-LD continuam idênticos.
- **Metodologia:** permanece na coluna de leitura de 68ch, agora com uma nota de fontes em mono (INMETRO, Portaria 269/2021, ciclo de 2.080 h/ano e Versão da tabela). Nenhuma promessa de economia nem recomendação nova.
- **Ritmo:** os cinco blocos compartilham a mesma régua superior de 1 px e o mesmo ritmo vertical; nenhum é um cartão. No celular tudo empilha em uma coluna.
- **Testes:** `home.test.ts` +2 (contagens por capacidade e por marca); `analises.test.ts` +1 (imagem em branco e imagem sem alt); `analises-build.test.ts` passou a conferir as contagens dos populares, a ausência de `home-links`, os passos `01`–`03` e os `<details>` fechados na mesma quantidade do `FAQPage`.

**Verificação:** `pnpm test` 758/758 (50 arquivos), `pnpm typecheck` OK, `pnpm lint` 0 erros e 25 warnings (os 23 pré-existentes e 2 do mesmo falso-positivo de especificidade), `pnpm build` reproduz `data/build` e `reports` byte a byte, `pnpm build:site` 2.236 páginas. No navegador (agent-browser): 0 px de overflow em 1440/1024/768/390/320, imagem real da Análise renderizada com alt, 9 `<details>` fechados que abrem e fecham, 44 px nos alvos e foco âmbar de 2 px.

**Nota histórica da entrega:** na entrega do #71 o ticket falava em "oito perguntas", mas a lista publicada tinha nove desde o #64 ("Por que um modelo não aparece na tabela?" era a nona). Todas foram preservadas naquele ponto, e o teste de build conferia 9–10. O alinhamento pós-revisão de 2026-11-24 removeu "Como comparar o consumo de energia?" e devolveu o contrato a oito perguntas, como descrevem `DESIGN.md`, o #109 e o `project-state.md`.
