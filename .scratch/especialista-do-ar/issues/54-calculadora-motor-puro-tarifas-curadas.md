# 54 — Calculadora: Motor Puro, Tarifas Curadas e Contrato de URL

**What to build:** O motor determinístico da calculadora de custo de energia, com o insumo de tarifas curado e validado no build do site. O motor recebe o consumo anual do Aparelho (um valor, ou vários quando há mais de uma Variante), a tarifa, as horas por dia e os dias por mês, e devolve consumo por hora, consumo mensal, custo mensal e custo anual — sempre junto das entradas que produziram o resultado. Ele também lê e escreve o estado na URL, com os padrões de São Paulo, 8 horas e 30 dias, sem escrever o padrão e sem quebrar quando um parâmetro vem inválido. Nenhuma tela ainda: este ticket é a pré-fatoração que a ficha e a comparação consomem.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Módulo puro (sem DOM e sem Astro), no mesmo formato do motor do Assistente, com fórmula explícita: consumo por hora = consumo anual ÷ 2.080; consumo mensal = consumo por hora × horas × dias; custo mensal = consumo mensal × tarifa; custo anual = custo mensal × 12
- [ ] Uma Variante devolve valor único; mais de uma devolve faixa (mínimo–máximo) sobre o menor e o maior consumo
- [ ] `apps/site/tarifas.json` com as 27 UFs, cada uma com `uf`, `nome`, `tarifa`, `referencia` e `fonte`
- [ ] Validação no build recusa UF repetida, UF desconhecida, tarifa não numérica, tarifa ≤ 0 ou não finita, e `referencia` ou `fonte` em branco — com mensagem que diz qual UF falhou
- [ ] Contrato de URL com as chaves `uf`, `tarifa`, `horas` e `dias`; padrões `SP`, tarifa de SP da curadoria, `8` e `30`
- [ ] O padrão não aparece na URL; um link com `?uf=SP&horas=8` é normalizado para URL limpa
- [ ] `uf` vazia (`?uf=`) representa "Tarifa informada" e desliga a tarifa por estado; `tarifa` digitada tem precedência sobre a da UF
- [ ] UF inexistente, tarifa ≤ 0 ou não numérica, `horas` fora de 0–24 e `dias` fora de 1–31 caem no padrão em silêncio, sem erro na página
- [ ] Formatação em pt-BR: R$ com duas casas e kWh com duas casas, sempre com unidade
- [ ] Os resultados carregam as entradas usadas (tarifa, horas, dias e consumo) para a interface poder exibir a conta aberta
- [ ] Testes puros cobrem a aritmética, a faixa de Variantes, os padrões, a normalização da URL, a chave vazia e cada caso de valor inválido
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
