# 46 — Home Nova

**What to build:** A home vira um hub com nove blocos, todos gerados no build: hero; dois cartões grandes ("Ver aparelhos" e "Usar assistente", com o Assistente em destaque de cor); faixa de confiança com contagens reais da base e a Versão da tabela; capacidades populares; marcas populares; Análises em destaque; chamada do Assistente com "como funciona em 3 passos"; FAQ com JSON-LD `FAQPage`; e metodologia/INMETRO. A home continua sem baixar JSON no cliente.

**Blocked by:** 41 — Assistente: Motor Determinístico e Wizard

**Status:** ready-for-agent

- [ ] Hero com H1 e subtítulo citando ar-condicionado, dados do INMETRO e comparação de capacidade, consumo e eficiência
- [ ] Dois cartões grandes de mesmo peso visual: "Ver aparelhos" → `/aparelhos/` e "Usar assistente" → `/assistente/`
- [ ] O cartão do Assistente tem destaque de cor
- [ ] Faixa de confiança com contagens reais derivadas da base (aparelhos, marcas, capacidades) e a Versão da tabela
- [ ] Nenhuma contagem escrita à mão
- [ ] Capacidades populares (9.000 a 36.000) como links para a tabela filtrada
- [ ] Marcas populares (as curadas em `filtros.json`) como links para a tabela filtrada
- [ ] Bloco de Análises em destaque mantido
- [ ] Com zero Análises, o bloco de destaques não é renderizado
- [ ] Chamada do Assistente no meio da home, com "como funciona em 3 passos"
- [ ] FAQ com 5–6 perguntas reais (BTUs, IDRS, Classe, Split × Janela, consumo) e respostas curtas
- [ ] JSON-LD `FAQPage` válido, somado ao `WebSite` existente
- [ ] Metodologia/INMETRO explicando a origem dos dados, o que são IDRS e Classe, e o caráter oficial dos valores
- [ ] `<title>` e descrição focados em ar-condicionado, BTUs e INMETRO
- [ ] A home não baixa `consulta.json`, `analises.json` nem `ofertas.json` no cliente
- [ ] Testes de build: os nove blocos presentes, contagens derivadas da base, links de capacidades/marcas, dois cartões, FAQ visível e JSON-LD `FAQPage` válido
- [ ] Teste do estado zero de Análises sem bloco de destaques
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
