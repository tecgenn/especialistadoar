# Atualização da Análise Samsung WindFree AI Pro 12.000 + guia normativo

**Type:** task
**Status:** claimed

## Contexto

A Análise existente `samsung-windfree-ai-pro-12000-analise` (207 linhas) estava superficial em relação ao dossiê de produto (`/home/gabri/Downloads/dossie-samsung-windfree-ai-pro-12000.md`, 506 linhas). O projeto também não tinha um guia normativo autônomo para escrever Análises.

## Mudanças

1. **Reescrita do corpo da Análise** — `apps/site/src/content/analises/samsung-windfree-ai-pro-12000-analise.mdx` (232 linhas):
   - Mantidas as 6 mesmas imagens (`abertura`, `windfree`, `conectividade`, `durabilidade`, `energia`, `controle`)
   - Lead com resposta direta e para quem faz/não faz sentido
   - Tabela INMETRO × Samsung expandida (capacidade mínima/máxima, consumo em resfriamento, ruído interna/externa)
   - Seção AI Energy Mode (alegação da fabricante, até 30%)
   - Seção WindFree inteligente / AI Auto Cooling
   - Consumo com conta aberta (416 kWh, R$ 374/ano, R$ 31/mês a R$ 0,90/kWh)
   - SmartThings detalhado por recurso com ressalvas
   - Durabilidade: Blue Fin Dura+, Triple Protector Plus, R32, filtro antibacteriano, Auto Clean, garantia de 10 anos (só compressor)
   - Pontos de atenção, FAQ expandido (incluindo IDRS, WindFree elimina vento?), veredito, fontes
   - Não repete CTA nem Oferta (o template monta automaticamente)

2. **Guia normativo novo** — `docs/agents/como-escrever-uma-analise.md`:
   - Onde fica, frontmatter, imagens, o que o template já monta
   - Convenções de afiliado/Oferta ("Ver oferta", "link de afiliado", três níveis)
   - Estrutura recomendada do corpo (10 seções)
   - Regras editoriais de integridade
   - Skills a usar (content-strategy, copywriting, seo-audit, humanizer, impeccable, find-skills, writing-shape/beats/fragments)
   - Técnicas de copywriting e SEO/AEO/GEO
   - Validação e commit

## Validação

- `pnpm build` — OK
- `pnpm build:site` — OK (2.236 páginas, 6 imagens processadas)
- `pnpm lint` — 0 erros
- `pnpm typecheck` — OK
- `pnpm test` — 754/754 passando

## Commit

Mensagem em inglês, última linha: `Ticket: 101`

## Comments
