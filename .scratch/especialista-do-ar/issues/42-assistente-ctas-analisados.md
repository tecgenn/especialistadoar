# 42 — Assistente: CTAs com Aparelhos Analisados

**What to build:** O resultado do Assistente passa a levar a pessoa aos Aparelhos analisados. Na capacidade recomendada, mostra cartões dos analisados daquela capacidade (montados no build) com link para a Análise; abaixo, o botão "Ver todos os aparelhos de X BTU/h" para a tabela filtrada; e, quando a alternativa dividida existe, um segundo CTA "Duas unidades de Y BTU/h" apontando para os analisados dessa capacidade e para a tabela em Y. Sempre existe um caminho visível para os analisados, mesmo com zero Análises.

**Blocked by:** 41 — Assistente: Motor Determinístico e Wizard

**Status:** done

- [x] Mapa build-time de Aparelhos analisados por capacidade, derivado do conteúdo publicado
- [x] Cartões dos analisados com a capacidade exata recomendada, com selo "Análise" e link para a página da Análise
- [x] Botão "Ver todos os aparelhos de X BTU/h" para `/aparelhos/?btu=X`
- [x] O link `?btu=X` desliga os filtros padrão (ADR-0019), então a tabela mostra todos os aparelhos da capacidade
- [x] Quando a alternativa dividida existe: CTA "Duas unidades de Y BTU/h" com link para os analisados de Y e para a tabela filtrada em Y
- [x] A alternativa dividida aparece mesmo quando existe analisado na capacidade exata
- [x] Com zero analisados na capacidade: mantém o botão da tabela e a alternativa aplicável, sem bloco vazio
- [x] Sem nenhuma Análise publicada: o resultado continua com o caminho para a tabela, sem cards órfãos
- [x] Nenhuma chamada de rede no cliente para montar os cards; tudo gerado no build
- [x] Testes: capacidade com analisado exato, capacidade sem analisado, alternativa dividida, zero Análises
- [x] Testes de build conferem os links e a presença/ausência dos cards
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
