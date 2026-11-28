# 75 — Ficha: topo de datasheet, leituras e índice

**What to build:** a ficha passa a se apresentar como um datasheet: breadcrumb, marca/modelo, etiquetas de Classe/Situação/Registro, três leituras grandes (IDRS, consumo anual, capacidade) e um índice sticky que mostra onde o visitante está. A hierarquia permite decidir em cinco segundos se o modelo interessa antes de rolar.

**Blocked by:** 68 — Primitivos de interface e ícones.

**Skills:** `design-taste-frontend` — `SKILL.md` + `references/layout-v4.md`, `references/system.md`. `ui-ux-pro-max` — `"breadcrumb tabs sticky index" --domain ux`.

**Status:** done

- [x] Breadcrumb "Aparelhos / Marca / Modelo" com `nav` e `aria-label`, sem mudar URLs.
- [x] H1 `Marca — Modelo` preservado; etiquetas de Classe (faixa quando as Variantes divergem), Situação e Registro(s) com os mesmos dados.
- [x] As três leituras mostram IDRS, Consumo anual e Capacidade com unidade, legenda e faixa quando houver mais de uma Variante; a de consumo linka para `#consumo-e-custo`.
- [x] Ações "Comparar este modelo" (secundária, `?ids=<id>`) e "Imprimir ficha" (texto) com alvos de 44 px.
- [x] O índice lista só as seções existentes, com âncoras, `scroll-margin-top`, foco no alvo e indicação da seção atual por barra ciano de 2 px (`--foco`, ticket 102).
- [x] No desktop o índice é uma faixa horizontal sticky; no celular quebra em lista sem overflow e sem cobrir o conteúdo.
- [x] Nenhum valor é recalculado ou arredondado de forma diferente; todos continuam vindo do dataset.
- [x] O teste de build confere breadcrumb, etiquetas, leituras e âncoras numa ficha real de uma e de duas Variantes.

## Comments

- **Implementação (2026-11-28):** `leiturasDaFicha` substitui `cartoesDeDestaque` em `lib/ficha.ts` e devolve `valor` separado de `unidade` para o primitivo `Leitura` (o teste puro cobre uma e duas Variantes). A página usa `Trilha` (Marca de catálogo no link de recorte), `EtiquetaClasse` na Classe e etiquetas hairline com rótulo mono para Situação e Registro(s); as ações são `.botao-secundario` e `.botao-texto` (44 px), a segunda com o ícone `impressora` e `window.print()`. O índice é `nav` com `data-secao`, já sai com a primeira seção em `aria-current="location"` e um `<script is:inline>` corrige a marcação pela posição da rolagem (rAF, listeners passivos de `scroll`/`resize`/`hashchange`) e liga o botão de imprimir. As etiquetas antigas (pill de 999 px e hex de Classe) e os cartões de destaque foram removidos; `.aparelho dl` passou a `.aparelho section dl` para não atingir a `<dl>` do primitivo.
- **Divergência:** "Imprimir ficha" é um `<button>` (ação de página), não link; o rótulo segue o ticket. A barra ciano é embaixo do link na faixa do desktop e à esquerda na lista do celular — o ticket não fixa o lado.
- **Checks:** Vitest 802/802 (51 arquivos); `pnpm typecheck` OK; `pnpm lint` 0 erros (52 warnings de `noDescendingSpecificity` no CSS legado, 2 deles dos seletores `a` novos, mesma família); `pnpm build:site` gera 2.433 páginas; `data/build` e `reports` intocados. No navegador (agent-browser, preview 127.0.0.1:4321) na ficha do LG `ap-03be1a749866`: 0 px de overflow em 320/390/768/899/900/1024/1440; índice `static` de 122–260 px abaixo de 900 px (lista quebrada, sem sticky) e `sticky` de 46 px a partir de 900 px, com fundo papel e hairline; após 1.800 px de rolagem a faixa fica em 0–46 px e o link "Consumo e custo" recebe `aria-current` com `border-bottom: 2px solid rgb(15, 143, 168)`; `#proveniencia` para a 49,7 px, abaixo da faixa, com contorno ciano de 2 px; as duas ações medem 44 px e o clique em "Imprimir ficha" chama `window.print()`; no celular (390) a barra migra para `border-left` de 2 px e a seção atual acompanha a rolagem; a ficha de duas Variantes (`ap-50bd04d14145`, Classe A – C) mostra IDRS `5,5 – 7,88` e Consumo `749 – 1.010 kWh/ano` com a unidade em corpo menor e 0 px de overflow. O H1 ganhou `overflow-wrap: anywhere` porque o Modelo (`S3NQ09AA31F+S3UQ09AA31F`) esticava a página em 320/390 px.
