# 95 — Versão da base INMETRO única e resumida no footer

**What to build:** a informação "Base INMETRO · Versão X · obtida em Y" aparece apenas uma vez, no footer, em fonte pequena (mono). Sai da fita do hero, da seção "Cobertura da base" e da seção "Metodologia e INMETRO". O footer fica com esse dado em destaque discreto, junto da proveniência.

**Blocked by:** 93 — Hero renovado; 94 — Régua de capacidade.

**Skills:** `impeccable` — `reference/distill.md` (remover a informação repetida da fita, da cobertura e da metodologia, deixando só o dado no footer) e `reference/typeset.md` + `reference/craft-floor.md` (mono pequeno legível, sem virar ruído). `design-taste-frontend` — `references/system.md` (mono reservado a fonte/unidade, tokens existentes, nenhum estilo novo). `ui-ux-pro-max` — `"redundant information removal" --domain ux` e `"data provenance disclosure" --domain ux`.

**Status:** ready-for-agent

- [ ] Versão da base aparece só no footer, em fonte pequena (mono 0.75rem)
- [ ] Removida da fita do hero, da cobertura e da metodologia
- [ ] Footer mostra proveniência + versão da tabela + nota de afiliado
- [ ] Sem duplicação da informação em nenhuma outra seção
- [ ] Testes de build conferem que a versão aparece só no footer
- [ ] `DESIGN.md` atualizado no mesmo commit (decisão final e termos relacionados revisados; `impeccable detect` e testes doc↔código conferidos)
