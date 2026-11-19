# 77 — Ficha: calculadora de custo como painel de instrumento

**What to build:** a calculadora deixa de ser um formulário e vira um painel de medição: campos à esquerda, custo mensal em leitura grande à direita, conta aberta em mono e o aviso de estimativa visível. O visitante entende de onde vem cada real sem sair da página. O contrato de URL e o motor puro não mudam.

**Blocked by:** 68 — Primitivos de interface e ícones; 75 — Ficha: topo de datasheet, leituras e índice.

**Skills:** `ui-ux-pro-max` — `"inline validation numeric input" --domain ux` e `"form error summary" --domain ux`. `design-taste-frontend` — `SKILL.md` + `references/copy.md`.

**Status:** ready-for-agent

- [ ] O painel usa os campos UF, tarifa, horas e dias com rótulos mono, sufixos de unidade e alvos de 44 px.
- [ ] O resultado mostra custo mensal como número principal, custo anual e consumo mensal, com faixa quando houver Variantes e travessão explicado quando não houver consumo.
- [ ] A conta aberta lista os seis passos em mono numerado, com unidades e formatação pt-BR.
- [ ] O aviso de estimativa (não é Valor oficial, não é promessa de economia) e a referência/fonte da tarifa permanecem visíveis.
- [ ] O resultado é uma região viva (`aria-live="polite"`, `aria-atomic`), e os campos continuam associados aos rótulos.
- [ ] O contrato `uf`/`tarifa`/`horas`/`dias`, os padrões fora da URL e a normalização de valores inválidos continuam idênticos.
- [ ] No celular, os campos vêm antes do resultado; nada estoura a viewport.
- [ ] Testes existentes da calculadora continuam verdes; novos testes cobrem a faixa de Variantes e o estado sem consumo.
