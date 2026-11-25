# 79 — Comparação: slots, busca e cartões de modelo

**What to build:** a seleção da comparação vira três slots de instrumento, cada um com marca, modelo, capacidade, tipo, custo e ações. O combobox de troca continua com sugestões e teclado; o CTA de Oferta fica na área de ações; o estado vazio convida a escolher modelos ou voltar à tabela.

**Blocked by:** 69 — Ofertas; 68 — Primitivos de interface e ícones.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/cards.md`, `references/copy.md`. `ui-ux-pro-max` — `"combobox autocomplete keyboard" --domain ux`.

**Status:** ready-for-agent

- [ ] Três slots visíveis, com o modelo preenchido mostrando marca em mono, modelo em grotesca, capacidade/tipo, custo (quando houver painel), Oferta, "Trocar" e "Remover".
- [ ] Slot vazio é um campo de busca com `role="combobox"`, sugestões, `aria-expanded`, navegação por setas e `Esc`.
- [ ] O contrato `?ids=` é preservado em todas as operações, com ordem, limite de 3 e descarte de ids inválidos com aviso.
- [ ] O CTA de Oferta aparece só quando há Oferta publicada e mantém o marcador de afiliado; nenhum espaço reservado para modelo sem Oferta.
- [ ] Estados: vazio, um modelo (convite), carregando, erro de rede e ids descartados.
- [ ] No celular, os slots empilham, as ações mantêm 44 px e o combobox abre sem cobrir o campo.
- [ ] Nenhuma linguagem de "melhor", vencedor ou recomendação é introduzida.
- [ ] Testes de ilha da comparação continuam verdes e cobrem teclado, limite e remoção.
