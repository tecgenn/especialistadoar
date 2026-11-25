# Como escrever uma Análise

Guia normativo para produzir uma **Análise** editorial (`/analises/<slug>/`) sobre um único Aparelho. Qualquer modelo (humano ou agente) deve seguir este documento ao criar ou reescrever uma Análise.

## O que é uma Análise

Per `CONTEXT.md`, uma Análise é texto editorial sobre **um** Aparelho, publicado numa seção própria e separado dos dados técnicos. Pode trazer números próprios (não são Valores oficiais); a ficha do Aparelho continua sendo a fonte oficial.

Per `ADR-0015`, a Análise é editorial: pode arredondar, comparar e afirmar números próprios, sem reproduzir a ficha e sem aviso de que não são Valores oficiais. Preço não é afirmado no texto — quem mostra preço é a loja, pelo CTA da Oferta.

O ciclo é aditivo: uma Análise nunca é apagada. Se o Aparelho sair da tabela, a página continua no ar em estado degradado (aviso, sem bloco de dados, sem CTA).

## Onde fica

- Arquivo: `apps/site/src/content/analises/<slug>.mdx` (um MDX por Análise)
- Template da página: `apps/site/src/pages/analises/[slug].astro` — já monta banner de transparência, CTAs de oferta/ficha/Assistente, seção de dados oficiais e JSON-LD
- Validador de contrato: `apps/site/src/lib/analises.ts` (`validarAnalises`, `montarAnalises`)

## Frontmatter (obrigatório)

```mdx
---
aparelhoId: ap-<12 hex>
slug: <slug-unico-sem-barras>
titulo: "<H1 editorial>"
descricao: "<meta description / resumo>"
data: 2026-11-06
imagem: analises/<pasta>/abertura.webp   # opcional
imagemAlt: "<alt obrigatório se houver imagem>"  # obrigatório quando há imagem
---
```

Regras:
- `aparelhoId`: obtido com `pnpm aparelho:buscar "<termo>"` (lê `data/build/`, rode `pnpm build` antes se desatualizado). Formato `ap-<12 hex>`. Um id bem formado que não está na base servida não falha o build: é o estado Ausente (página degradada).
- `slug`: vira a URL `/analises/<slug>/`. Deve ser único, sem `/`.
- `data`: `YYYY-MM-DD`. Ordena as análises da mais recente para a mais antiga.
- `imagem`: caminho relativo a `src/assets`. Opcional; se houver, `imagemAlt` é obrigatório.
- Não repita Oferta nem CTA no corpo do MDX: o template já monta todos os cartões comerciais (topo, Assistente após o corpo, fim).

## Imagens

- Guardar em `src/assets/analises/<slug>/`
- Usar o componente `Image` do Astro (`astro:assets`) com `alt`, `widths={[480, 720, 1080, 1440]}`, `sizes="(min-width: 68rem) 60rem, 100vw"`.
- Cada figura deve ter `<figcaption>` descritivo.
- Classe CSS da figura: `analise-figura`.

## O que o template já monta (não repita no MDX)

- Banner de transparência (links de afiliado / aviso de comissão)
- CTA 1 (topo): Oferta quando houver, senão ficha técnica, senão tabela
- CTA 2 (após o corpo): Assistente ("Calcular os BTUs do meu ambiente")
- CTA 3 (fim): Oferta ("Onde comprar") quando houver
- CTA 4 (fim): ficha técnica + links da tabela por capacidade
- Seção "Dados oficiais do INMETRO" (quando o Aparelho está na base)
- JSON-LD de `Article`

## Convenções de afiliado e Oferta

Per `CONTEXT.md` (entidade **Oferta**):
- Rótulo: **"Ver oferta"** — nunca "Ver preço", "Comprar", "Ver preço e comprar" (o site não exibe preço).
- Sem nome de loja em texto: o badge com o logotipo oficial (Mercado Livre, Amazon) identifica a loja e o aviso **"link de afiliado"** fica no `title` do logo e no nome acessível do link — nunca como texto visível do cartão.
- Divulgação em dois níveis: junto do link (tooltip e nome acessível) e institucional (banner de transparência da Análise, Termos de Uso e bloco "Transparência com o Leitor" do rodapé de todas as páginas).
- O CTA fica na ficha, na Análise, nos destaques da home e no cartão do modelo na Comparação — **nunca na matriz de atributos**.
- Não prometer preço, desconto, economia ou prazo no texto editorial.

## Estrutura recomendada do corpo

1. **Lead / resposta direta** — vale a pena? para quem? condições.
2. **O que os dados oficiais mostram** — tabela comparativa INMETRO × fabricante, código comercial vs código de registro, divergências relevantes (fase, tensão).
3. **Principais recursos** — um por seção, com figura e legenda. Diferenciar dado oficial, alegação de fabricante e ensaio independente.
4. **Consumo e energia** — IDRS, Classe, consumo anual do INMETRO, conta aberta (estimativa, não promessa), consumo por 1.000 BTU/h para comparação.
5. **Conectividade / automação** — SmartThings, recursos listados com ressalvas (permissões, conta, dispositivos compatíveis).
6. **Durabilidade, proteção e qualidade do ar** — Blue Fin, Triple Protector, refrigerante, filtro, Auto Clean, garantia (especificar o que a garantia cobre e o que não cobre).
7. **Pontos de atenção antes de comprar** — lista de limitações reais (ciclo frio, tensão, dimensionamento, ruído, recursos ausentes neste SKU, nota de consumidores dinâmica).
8. **Perguntas rápidas (FAQ)** — respostas diretas, depois explicação. Incluir intenções de busca comuns (é quente/frio?, tensão?, consumo?, silencioso?, Wi-Fi?, garantia?).
9. **Veredito** — para quem faz sentido, para quem não faz sentido, próximo passo (link para ficha e para recorte de capacidade).
10. **Fontes** — página oficial consultada com data, registro INMETRO, Versão da tabela.

## Regras editoriais de integridade

- Identificar percentuais de economia e desempenho como alegações da fabricante, nunca como resultado de teste independente.
- Não declarar que o produto foi testado pela equipe se não houve teste real.
- Não afirmar que é o "melhor da categoria" sem comparação documentada com concorrentes equivalentes.
- Não atribuir ao modelo recursos que o fabricante restringe a outro SKU (ex.: Dry Comfort, Freeze Wash).
- Citar o código exato do modelo para evitar misturar versões.
- Não apresentar avaliações agrupadas como se fossem exclusivas desta capacidade.
- Ao falar de economia, explicar que o resultado real depende do ambiente, instalação, temperatura configurada e padrão de uso.
- Ao falar de dimensionamento, não recomendar a capacidade apenas pela metragem sem considerar carga térmica.
- Separar claramente dados oficiais, análise editorial e experiência prática.

## Skills a usar (não precisa decidir cada vez)

O `.agents/skills/` já tem as skills certas para cada etapa de uma Análise. Use este atalho em vez de escolher manualmente:

| Etapa da Análise | Skill | Para quê |
|---|---|---|
| Estratégia de conteúdo e estrutura | `content-strategy` | Definir o ângulo editorial, a hierarquia de informações e o que o comprador precisa saber para decidir. |
| Reescrita do corpo | `copywriting` | Escrever persuasivo sem soar como IA: voz humana, CTA natural, prova social, anti-superlativo vazio. |
| Otimização para busca e IA | `seo-audit` | Verificar intenção de busca, entidades, FAQ, metadados, JSON-LD e legibilidade para LLM. |
| Polimento final | `humanizer` | Remover tom robótico, contrações naturais, fluência brasileira, evitar "não é X, é Y" e listas forçadas. |
| Revisão de qualidade | `impeccable` | Detectar problemas de UX, acessibilidade, contraste, foco, alvos de toque e polimento da página publicada. |
| Descobrir outras skills | `find-skills` | Localizar e instalar skills adicionais quando precisar de uma capacidade que não esteja nesta lista. |
| Forma dos textos | `writing-shape`, `writing-beats`, `writing-fragments` | Ritmo, parágrafos curtos, fragmentos úteis e variação de frase para leitura fácil. |

**Não precisa ficar escrevendo qual skill usar:** este guia já mapeia cada etapa. Quando for criar ou reescrever uma Análise, comece pela `content-strategy`, escreva com `copywriting`, revise com `humanizer`, audite com `seo-audit` e confira o resultado publicado com `impeccable`.

> Para descobrir skills adicionais que não estão nesta lista, use a skill `find-skills` ou liste o diretório `.agents/skills/`. As skills acima são as que se aplicam a Análises editoriais.

## Técnicas de copywriting para Análise

Escreva para o possível comprador, não para a fabricante:

- **Resposta direta primeiro:** comece com "vale a pena?" e diga sim/não com condições logo no lead. O leitor decide nos primeiros parágrafos.
- **Benefício sobre recurso:** não liste apenas "tem Wi-Fi"; diga o que isso resolve (controlar do celular, ligar antes de chegar em casa).
- **Prova social com honestidade:** cite a nota do consumidor (4,1/5, 10 avaliações) com a data da consulta e o aviso de que pode agrupar variantes — nunca invente depoimentos.
- **Contraste, não superlativo:** evite "o melhor", "campeão", "incrível". Use "faz sentido para X, não para Y" e liste para quem não serve (veredito).
- **Economia aberta:** mostre a conta (416 kWh × tarifa = R$/ano), explique que é estimativa e que o comprador deve trocar pela tarifa da própria conta.
- **Ressalvas constroem confiança:** dizer que 30%/77% são alegações da fabricante, que a garantia de 10 anos é só do compressor, que Dry Comfort não existe neste SKU — tudo isso reduz a percepção de "texto de marketing".
- **Uma ideia por parágrafo:** parágrafos curtos, uma frase por ideia, frases de transição claras.
- **CTA sem pressão:** "Ver ficha técnica", "Calcular os BTUs", "Onde comprar" — sem "aproveite agora", "última chance" ou preço prometido.

## SEO / AEO / GEO

- Responder primeiro de forma direta, depois explicar os critérios.
- Diferenciar claramente especificações oficiais, alegações de marketing, avaliações de consumidores e testes independentes.
- Cobrir as intenções de busca típicas: "é bom?", "vale a pena?", "é econômico?", "é silencioso?", "consumo", "quente e frio?", diferença entre tecnologias.
- Incluir entidades e termos relacionados (marca, nome comercial, código do modelo, capacidade, ciclo, conectividade, tecnologias, refrigerante, classificações).
- O JSON-LD de `Article` é gerado automaticamente pelo template.
- Use as perguntas rápidas (FAQ) para capturar featured snippets e respostas de IA: cada resposta começa direta e depois explica.
- Não prometa economia garantida: isso prejudica a confiança e pode configurar alegação não comprovada.

## Validação antes de publicar

- `pnpm build` (valida frontmatter, slug único, formato de id/data, no máximo uma Análise por Aparelho)
- `pnpm build:site` (gera a página e o inventário `analises.json`)
- `pnpm test`, `pnpm typecheck`, `pnpm lint`
- Conferir que a imagem abre e o `alt` está preenchido
- Conferir o `aparelhoId` com `pnpm aparelho:buscar`

## Commit

Mensagem em inglês, com a referência do ticket na última linha: `Ticket: NN` (tracker local markdown, sem `#`). Exemplo de título: `Rewrite Samsung WindFree AI Pro 12.000 analysis body`.

## Exemplo de referência

A Análise publicada `samsung-windfree-ai-pro-12000-analise` sobre o Samsung WindFree AI Pro 12.000 BTUs (`ap-adc70ca55429`) segue este modelo.
