# 41 — Assistente: Motor Determinístico e Wizard

**What to build:** O Assistente de dimensionamento em `/assistente/`, ponta a ponta. Um módulo puro (`apps/site/src/lib/assistente.ts`) centraliza os coeficientes e devolve a Recomendação do Assistente; uma ilha React (`apps/site/src/components/Assistente.tsx`) conduz o visitante por 5 telas (ambiente, área, sol, pessoas, equipamentos + lâmpadas + janelas) com progresso, "Voltar" e estado na URL. O resultado mostra a capacidade comercial recomendada (9k…60k), os fatores usados, a explicação, o nível de confiança e as orientações. Inclui a rota, o item de menu, o glossário (`Assistente`, `Recomendação do Assistente`) e o ADR-0020.

**Blocked by:** —

**Status:** done

- [x] Motor puro `calcularAssistente(respostas)` com todos os coeficientes num só lugar
- [x] Base por m²: sem sol 600, manhã 650, tarde 750, dia todo 800 BTU/h
- [x] Pessoas: base cobre 1; +600 BTU/h por pessoa adicional, usando o limite superior da faixa (3–4 → 4, 5–6 → 6, 7+ → 8)
- [x] Eletrônicos: +600 BTU/h por equipamento
- [x] Lâmpadas: +100 BTU/h por lâmpada
- [x] Janelas: base assume até 2; +200 BTU/h a partir da 3ª
- [x] Arredondamento para a capacidade comercial imediatamente acima: 9.000, 12.000, 18.000, 22.000, 24.000, 30.000, 36.000, 48.000, 60.000
- [x] Acima de 60.000 BTU/h: não recomenda um aparelho único; sugere mais de uma unidade e avaliação técnica
- [x] Alternativa dividida quando a capacidade ÷ 2 for comercial e ≥ 9.000 (24.000 → 2 × 12.000; 36.000 → 2 × 18.000; 48.000 → 2 × 24.000; 60.000 → 2 × 30.000; 18.000 → 2 × 9.000)
- [x] Área aceita m² ou largura × comprimento; "não sei as medidas" oferece referências visuais pequeno (~9 m²), médio (~20 m²) e grande (~35 m²), marcadas como estimativa
- [x] Sol "não sei" assume tarde e o resultado declara a suposição
- [x] Confiança alta (área exata e tudo informado), média (área por referência ou alguma suposição) e baixa (comércio, cozinha ou integrado com área estimada)
- [x] O tipo de ambiente não multiplica a conta; define o equipamento indicado (Split Hi-Wall × Piso-teto/Cassete) e personaliza a explicação
- [x] Wizard com 5 telas, uma pergunta por tela, barra de progresso, "Voltar" e cards como botões de verdade
- [x] Estado inteiro na URL (`ambiente`, forma de área, `area`/dimensões, `sol`, `pessoas`, `eletronicos`, `lampadas`, `janelas`), com round-trip ao recarregar e compartilhar
- [x] Resultado com capacidade em destaque, fatores, explicação curta, confiança, orientações (tipo indicado, Inverter, instalação, vedação, limpeza) e aviso de estimativa
- [x] Rota `/assistente/` com item "Assistente" no menu; `<title>` com "Calculadora de BTUs" e H1 sobre descobrir a capacidade ideal
- [x] Acessibilidade: foco no título ao avançar e resultado anunciado em região viva
- [x] `CONTEXT.md` ganha **Assistente** e **Recomendação do Assistente**; **Recomendação** é descrita como Valor calculado, nunca oficial
- [x] `docs/adr/0020-assistente-deterministico.md`: "Assistente determinístico com heurística publicada" (sem LLM/Worker, coeficientes fixos, arredondamento comercial, caráter de estimativa)
- [x] Testes do motor: cada coeficiente, arredondamento, teto de 60.000, alternativa dividida, faixas de pessoas, fallbacks de área/sol, três níveis de confiança e casos de borda (área mínima, zero equipamentos/lâmpadas, 2 janelas sem adicional e 3 janelas com adicional)
- [x] Testes da ilha: 5 telas, progresso, voltar, round-trip de URL e resultado renderizado
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
