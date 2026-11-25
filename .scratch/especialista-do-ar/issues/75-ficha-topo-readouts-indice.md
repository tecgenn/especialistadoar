# 75 — Ficha: topo de datasheet, leituras e índice

**What to build:** a ficha passa a se apresentar como um datasheet: breadcrumb, marca/modelo, etiquetas de Classe/Situação/Registro, três leituras grandes (IDRS, consumo anual, capacidade) e um índice sticky que mostra onde o visitante está. A hierarquia permite decidir em cinco segundos se o modelo interessa antes de rolar.

**Blocked by:** 68 — Primitivos de interface e ícones.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/layout-v4.md`, `references/system.md`. `ui-ux-pro-max` — `"breadcrumb tabs sticky index" --domain ux`.

**Status:** ready-for-agent

- [ ] Breadcrumb "Aparelhos / Marca / Modelo" com `nav` e `aria-label`, sem mudar URLs.
- [ ] H1 `Marca — Modelo` preservado; etiquetas de Classe (faixa quando as Variantes divergem), Situação e Registro(s) com os mesmos dados.
- [ ] As três leituras mostram IDRS, Consumo anual e Capacidade com unidade, legenda e faixa quando houver mais de uma Variante; a de consumo linka para `#consumo-e-custo`.
- [ ] Ações "Comparar este modelo" (secundária, `?ids=<id>`) e "Imprimir ficha" (texto) com alvos de 44 px.
- [ ] O índice lista só as seções existentes, com âncoras, `scroll-margin-top`, foco no alvo e indicação da seção atual por barra ciano de 2 px (`--foco`, ticket 102).
- [ ] No desktop o índice é uma faixa horizontal sticky; no celular quebra em lista sem overflow e sem cobrir o conteúdo.
- [ ] Nenhum valor é recalculado ou arredondado de forma diferente; todos continuam vindo do dataset.
- [ ] O teste de build confere breadcrumb, etiquetas, leituras e âncoras numa ficha real de uma e de duas Variantes.
