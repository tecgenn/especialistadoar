# 64 — Conteúdo: "Entenda os números", Metodologia da Home e Duas Perguntas no FAQ

**What to build:** O site passa a explicar os próprios números onde eles aparecem. Na ficha, uma seção "Entenda os números" com quatro explicadores recolhíveis — IDRS, Classe, Consumo anual (2.080 horas/ano, cerca de 5,7 h/dia) e situação do Registro. Na home, a seção de metodologia ganha as três condições de ensaio do INMETRO, a data e a portaria da classificação vigente e uma nota sobre Inverter. E o FAQ ganha duas perguntas que o site nunca respondeu: o que é BTU/h e como escolher entre 127 V e 220 V.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Seção "Entenda os números" na ficha, depois do Resumo, com quatro blocos recolhíveis (`<details>`) fechados por padrão
- [ ] Explicador de IDRS: o que mede, que quanto maior mais eficiente e que é Valor oficial
- [ ] Explicador de Classe: faixa A–F declarada pelo INMETRO, não recalculada a partir do IDRS
- [ ] Explicador de Consumo anual: as 2.080 horas/ano de referência e o que isso significa em horas por dia
- [ ] Explicador da situação do Registro: o que significam Ativo, Cancelado e Inativo e como a situação do Aparelho é derivada deles
- [ ] Nenhum explicador promete economia, recomenda compra ou contradiz o Valor oficial
- [ ] Home: "Metodologia e INMETRO" ganha as três condições de ensaio (carga total a 35 °C, carga parcial a 35 °C, carga parcial a 29 °C)
- [ ] Home: a seção informa que a classificação vigente entrou em vigor em 1º de janeiro de 2023, pela Portaria INMETRO 269/2021
- [ ] Home: a seção ganha a nota sobre tecnologia Inverter e por que dois modelos de mesma capacidade consomem diferente
- [ ] FAQ: pergunta "O que é BTU/h?" respondida em linguagem de quem está começando
- [ ] FAQ: pergunta "Qual tensão escolher: 127 V ou 220 V?" respondida com o critério da instalação disponível
- [ ] As duas perguntas entram no `FAQPage` do JSON-LD da home, com o mesmo texto visível
- [ ] As perguntas existentes e o tom do FAQ são preservados
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
