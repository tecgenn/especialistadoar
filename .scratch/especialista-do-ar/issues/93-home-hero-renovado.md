# 93 — Hero renovado com animação e efeito de linhas (desktop)

**What to build:** o hero da home fica visualmente bonito, com uma animação de entrada (uma vez, respeita `prefers-reduced-motion`). Ao lado do texto do hero (desktop) entra um efeito de linhas inspirado na régua de capacidade, como elemento gráfico decorativo. O botão secundário muda de "Dimensionar meu ambiente" para algo como "Calcular BTUs" (não copiar fielmente o concorrente). O H1 e o lead em serifa são preservados. Sem Análise, a seção continua existindo.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Hero com animação de entrada em desktop e mobile, desligada em `prefers-reduced-motion`
- [ ] Efeito de linhas ao lado do texto do hero (desktop), inspirado na régua de capacidade
- [ ] Botão secundário renomeado (ex: "Calcular BTUs") mantendo hierarquia primária/secundária
- [ ] H1 e lead em serifa preservados, conteúdo editorial inalterado
- [ ] 0 px de overflow horizontal em 320/390/768/1024/1440 px
- [ ] Foco visível (âmbar 2px) e alvos de 44 px nos botões
- [ ] JSON-LD (WebSite + FAQPage) e canonical preservados
- [ ] Testes puros e de build atualizados para o novo hero
