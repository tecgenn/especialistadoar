# 65 — Fechamento: ADRs, Documentação e Validação Completa da Fase 11

**What to build:** O fechamento da Fase 11: os dois ADRs que registram as decisões estruturais (a calculadora de custo de energia no site e a divulgação de Oferta de afiliado em três níveis), a documentação atualizada com o novo vocabulário e os novos fluxos, e a suíte completa verde com `data/build` e `reports` reproduzíveis byte a byte. A validação manual percorre a calculadora na ficha e na comparação, as faixas de capacidade, o painel em duas faixas, a ficha nova, a segunda linha da listagem, o conteúdo explicativo e as três páginas institucionais.

**Blocked by:** 54 — Calculadora: Motor Puro, Tarifas Curadas e Contrato de URL; 55 — Calculadora na Ficha: Seção "Consumo e custo"; 56 — Calculadora na Comparação; 57 — Institucionais: Contato, Política de Privacidade e Termos de Uso; 58 — Ofertas: Rótulo "Ver oferta" e Divulgação em Três Níveis; 59 — CTA de Oferta nos Cartões da Comparação; 60 — Filtros: Faixas de Capacidade ao Lado da Capacidade Exata; 61 — Painel "Pesquisa Avançada" em Duas Faixas; 62 — Ficha: Etiquetas, Cartões de Destaque, Índice e "Comparar este modelo"; 63 — Listagem: Segunda Linha "Função · Tensão"; 64 — Conteúdo: "Entenda os números", Metodologia da Home e Duas Perguntas no FAQ

**Status:** done

- [x] `docs/adr/0022-calculadora-de-custo-de-energia.md` registra: tarifas curadas no site, fórmula do Valor calculado, contrato de URL com padrões e comparação neutra
- [x] `docs/adr/0023-divulgacao-de-oferta-de-afiliado.md` registra os três níveis de divulgação e revisa o ADR-0010
- [x] `CONTEXT.md` ganha **Custo estimado** e **Tarifa de referência**, e atualiza **Faixa de capacidade** e **Oferta**
- [x] `docs/agents/architecture.md` descreve o motor da calculadora, o insumo de tarifas, o contrato `btuMin`/`btuMax` e as páginas institucionais
- [x] `README.md` cita a calculadora, as institucionais e o comando de validação da fase
- [x] `docs/agents/project-state.md` registra a Fase 11 concluída e o próximo passo
- [x] `pnpm build` reproduz `data/build` e `reports` byte a byte
- [x] `pnpm build:site` gera as três rotas institucionais e o total de páginas esperado
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
- [x] Verificações manuais:
  - [x] A ficha abre com custo por mês calculado no padrão de São Paulo e o aviso de estimativa visível
  - [x] Trocar UF, tarifa, horas e dias atualiza na hora e a URL reflete só o que mudou; recarregar preserva
  - [x] `?horas=99` e tarifa negativa abrem no padrão, sem erro
  - [x] Um Aparelho com duas Variantes mostra o custo como faixa
  - [x] A comparação só mostra o painel com 2 ou 3 modelos, e a matriz não tem ★ nem "melhor"
  - [x] O CTA da Oferta aparece no cartão do modelo que tem Oferta e não na matriz
  - [x] O aviso de afiliado é discreto nos três níveis e o link abre em nova aba
  - [x] As faixas de capacidade filtram pelos limites e convivem com `?btu=`
  - [x] O painel mostra as duas faixas, o contador de resultados e "Limpar filtros" no rodapé
  - [x] A ficha mostra etiquetas, três cartões, índice e "Comparar este modelo"
  - [x] A listagem mostra Função · Tensão sem alterar contagem, ordenação nem "Mostrar mais"
  - [x] "Entenda os números" abre e fecha os quatro explicadores
  - [x] As três institucionais aparecem no rodapé, no sitemap e com o e-mail correto
- [x] Nenhum artefato de `data/build` ou `reports` alterado fora do esperado

## Comments

**2026-11-18 — fechamento.** Documentação: ADR-0022 e ADR-0023 novos; `CONTEXT.md` com
**Custo estimado** e **Tarifa de referência** e com **Oferta** revisada (o verbete
**Faixa de capacidade** não existia — foi criado); `docs/agents/architecture.md` com o
bullet **calculadora de custo** (motor puro, 2.080 h/ano, faixa por Variante, tarifas
validadas no build, contrato de URL), o contrato `btuMin`/`btuMax` no bullet da
consulta, a camada curada `apps/site/tarifas.json` e o bullet **institucionais**;
`README.md` com as seções "Custo estimado de energia" e "Páginas institucionais" e o
total de páginas da fase.

Validação executada: `pnpm build` sem diff em `data/build`/`reports` (`git status`
limpo para os artefatos); `pnpm build:site` com **2.236 páginas** (2.234 base + a
Análise publicada + `/analises/`), as três rotas institucionais no sitemap e a linha de
afiliado no rodapé das 2.236; `pnpm lint` 0 erros (21 warnings pré-existentes de
`noDescendingSpecificity`); `pnpm typecheck` OK; `pnpm test` **663/663** em 46
arquivos.

As verificações interativas (itens marcados em "Verificações manuais") foram
exercitadas pelas ilhas em jsdom (`calculadora.test.tsx`, `comparar-ilha.test.tsx`,
`consulta.test.tsx`) — não há navegador no ambiente — e as estáticas foram conferidas
no HTML de `apps/site/dist`: ficha com `R$ 0,846`, São Paulo, aviso de estimativa,
quatro `<details class="explicador">`, três `data-destaque` (IDRS, consumo,
capacidade), índice, "Comparar este modelo"; ficha de duas Variantes com faixa
(`R$ 42,17 – R$ 57,30`); nenhum ★ em nenhuma página; `/contato/`,
`/politica-de-privacidade/` e `/termos-de-uso/` com canonical e no sitemap, e os
`mailto:` de `/contato/` com o e-mail `tecgenn@gmail.com` vindo da constante única.
