# 100 — Footer com transparência do leitor única e restante do footer melhorado

**What to build:** o footer ganha um bloco único de "Transparência com o Leitor" (projeto técnico e editorial independente, não filiado ao INMETRO ou Procel, não vende produtos diretamente, monitora preços em lojas parceiras, pode receber comissão de afiliados sem custo adicional para o visitante) — com as palavras do projeto, não cópia fiel do concorrente. A versão da base INMETRO (ticket #95) fica aqui em fonte pequena. O restante do footer (proveniência, navegação institucional, nota de afiliado) é melhorado baseado na referência explorada via agent-browser.

**Blocked by:** 95 — Versão da base única no footer.

**Status:** ready-for-agent

- [ ] Bloco único de "Transparência com o Leitor" no footer
- [ ] Versão da base INMETRO no footer, fonte pequena (mono)
- [ ] Proveniência, navegação institucional e nota de afiliado preservadas
- [ ] Rodapé em azul-frio escuro (`--azul-frio-escuro`), texto giz
- [ ] 3 colunas no desktop, empilhado no mobile (proveniência primeiro)
- [ ] Foco visível, alvos de 44 px, sem overflow
- [ ] Testes de build conferem o bloco de transparência e a versão no footer
- [ ] `DESIGN.md` atualizado no mesmo commit (decisão final e termos relacionados revisados; `impeccable detect` e testes doc↔código conferidos)
