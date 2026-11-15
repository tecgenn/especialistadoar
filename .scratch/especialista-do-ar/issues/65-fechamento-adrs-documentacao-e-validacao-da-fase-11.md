# 65 — Fechamento: ADRs, Documentação e Validação Completa da Fase 11

**What to build:** O fechamento da Fase 11: os dois ADRs que registram as decisões estruturais (a calculadora de custo de energia no site e a divulgação de Oferta de afiliado em três níveis), a documentação atualizada com o novo vocabulário e os novos fluxos, e a suíte completa verde com `data/build` e `reports` reproduzíveis byte a byte. A validação manual percorre a calculadora na ficha e na comparação, as faixas de capacidade, o painel em duas faixas, a ficha nova, a segunda linha da listagem, o conteúdo explicativo e as três páginas institucionais.

**Blocked by:** 54 — Calculadora: Motor Puro, Tarifas Curadas e Contrato de URL; 55 — Calculadora na Ficha: Seção "Consumo e custo"; 56 — Calculadora na Comparação; 57 — Institucionais: Contato, Política de Privacidade e Termos de Uso; 58 — Ofertas: Rótulo "Ver oferta" e Divulgação em Três Níveis; 59 — CTA de Oferta nos Cartões da Comparação; 60 — Filtros: Faixas de Capacidade ao Lado da Capacidade Exata; 61 — Painel "Pesquisa Avançada" em Duas Faixas; 62 — Ficha: Etiquetas, Cartões de Destaque, Índice e "Comparar este modelo"; 63 — Listagem: Segunda Linha "Função · Tensão"; 64 — Conteúdo: "Entenda os números", Metodologia da Home e Duas Perguntas no FAQ

**Status:** ready-for-agent

- [ ] `docs/adr/0022-calculadora-de-custo-de-energia.md` registra: tarifas curadas no site, fórmula do Valor calculado, contrato de URL com padrões e comparação neutra
- [ ] `docs/adr/0023-divulgacao-de-oferta-de-afiliado.md` registra os três níveis de divulgação e revisa o ADR-0010
- [ ] `CONTEXT.md` ganha **Custo estimado** e **Tarifa de referência**, e atualiza **Faixa de capacidade** e **Oferta**
- [ ] `docs/agents/architecture.md` descreve o motor da calculadora, o insumo de tarifas, o contrato `btuMin`/`btuMax` e as páginas institucionais
- [ ] `README.md` cita a calculadora, as institucionais e o comando de validação da fase
- [ ] `docs/agents/project-state.md` registra a Fase 11 concluída e o próximo passo
- [ ] `pnpm build` reproduz `data/build` e `reports` byte a byte
- [ ] `pnpm build:site` gera as três rotas institucionais e o total de páginas esperado
- [ ] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
- [ ] Verificações manuais:
  - [ ] A ficha abre com custo por mês calculado no padrão de São Paulo e o aviso de estimativa visível
  - [ ] Trocar UF, tarifa, horas e dias atualiza na hora e a URL reflete só o que mudou; recarregar preserva
  - [ ] `?horas=99` e tarifa negativa abrem no padrão, sem erro
  - [ ] Um Aparelho com duas Variantes mostra o custo como faixa
  - [ ] A comparação só mostra o painel com 2 ou 3 modelos, e a matriz não tem ★ nem "melhor"
  - [ ] O CTA da Oferta aparece no cartão do modelo que tem Oferta e não na matriz
  - [ ] O aviso de afiliado é discreto nos três níveis e o link abre em nova aba
  - [ ] As faixas de capacidade filtram pelos limites e convivem com `?btu=`
  - [ ] O painel mostra as duas faixas, o contador de resultados e "Limpar filtros" no rodapé
  - [ ] A ficha mostra etiquetas, três cartões, índice e "Comparar este modelo"
  - [ ] A listagem mostra Função · Tensão sem alterar contagem, ordenação nem "Mostrar mais"
  - [ ] "Entenda os números" abre e fecha os quatro explicadores
  - [ ] As três institucionais aparecem no rodapé, no sitemap e com o e-mail correto
- [ ] Nenhum artefato de `data/build` ou `reports` alterado fora do esperado
