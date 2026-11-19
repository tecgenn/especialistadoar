# 72 — Catálogo: a tabela de instrumento

**What to build:** a tabela de Aparelhos deixa de ser uma grade uniforme e passa a ter hierarquia de leitura: marca e modelo identificam, capacidade e consumo comparam, IDRS e Classe qualificam. O cabeçalho ordenável, a linha analisada, o selo de Análise e a segunda linha `Função · Tensão` continuam funcionando. **A tabela continua tabela em todas as larguras**: no celular ela rola na horizontal dentro de um contêiner próprio, com seleção e Modelo fixas, sem virar cartões e sem esconder colunas.

**Blocked by:** 68 — Primitivos de interface e ícones.

**Skills:** `ui-ux-pro-max` — `"data table sticky column horizontal scroll" --domain ux` e `"table density" --stack astro`. `design-taste-frontend` — `SKILL.md` + `references/system.md`, `references/layout-v4.md`. `impeccable` — `reference/craft-floor.md`.

**Status:** ready-for-agent

- [ ] As colunas mantêm os mesmos dados e a ordem atual (seleção, Marca, Modelo com `Função · Tensão`, Capacidade, Consumo, IDRS, Classe, Tipo, Análise), com hierarquia visual clara entre identificação, medida e qualificação.
- [ ] Cabeçalhos ordenáveis têm seta, `aria-sort` correto e alvo de 44 px; a ordenação por clique continua igual.
- [ ] Valores numéricos usam mono tabular e alinhamento à direita; unidades aparecem de forma consistente.
- [ ] A Classe é uma etiqueta com letra A–F e cor; a cor nunca é o único sinal.
- [ ] A linha de Aparelho analisado tem marcador âmbar de 2 px e selo "Análise" discreto, sem puxar a linha para o topo.
- [ ] Abaixo de 900 px a tabela permanece uma `<table>` sem conversão para cartões: um contêiner de rolagem horizontal (`role="region"`, `aria-label`, `tabindex="0"`) mantém todas as colunas; as colunas de seleção e Modelo ficam `position: sticky; left: 0` com fundo opaco; o cabeçalho acompanha a rolagem vertical, com `z-index` em camadas para nada se sobrepor.
- [ ] A página nunca rola na horizontal; só o contêiner da tabela rola (`overscroll-behavior-x: contain`). O aviso "Deslize para ver as colunas" aparece abaixo de 900 px e desaparece após a primeira rolagem onde houver suporte a animação dirigida por rolagem; sem suporte, permanece.
- [ ] Nenhuma coluna, segunda linha `Função · Tensão`, ordenação ou estado é perdido no mobile; o comportamento é feito só com CSS, sem JS novo.
- [ ] Estados de carregamento (esqueleto de linhas), erro de rede (alerta com "Tentar de novo") e recorte vazio (estado vazio com ação) estão implementados.
- [ ] "Mostrar mais" continua em blocos de 50 e informa quantos restam.
- [ ] Nenhuma mudança em filtros, seleção, URL, contagem ou dados; os testes de ilha da consulta continuam verdes.
