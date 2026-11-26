# 72 — Catálogo: a tabela de instrumento

**What to build:** a tabela de Aparelhos deixa de ser uma grade uniforme e passa a ter hierarquia de leitura: marca e modelo identificam, capacidade e consumo comparam, IDRS e Classe qualificam. O cabeçalho ordenável, a linha analisada, o selo de Análise e a segunda linha `Função · Tensão` continuam funcionando. **A tabela continua tabela em todas as larguras**: no celular ela rola na horizontal dentro de um contêiner próprio, com seleção e Modelo fixas, sem virar cartões e sem esconder colunas.

**Blocked by:** 68 — Primitivos de interface e ícones; 91 — Calibração do chão visual.

**Skills:** `ui-ux-pro-max` — `"data table sticky column horizontal scroll" --domain ux` e `"table density" --stack astro`. `design-taste-frontend` — `SKILL.md` + `references/system.md`, `references/layout-v4.md`. `impeccable` — `reference/craft-floor.md`.

**Status:** done

- [x] As colunas mantêm os mesmos dados e a ordem atual (seleção, Marca, Modelo com `Função · Tensão`, Capacidade, Consumo, IDRS, Classe, Tipo, Análise), com hierarquia visual clara entre identificação, medida e qualificação.
- [x] Cabeçalhos ordenáveis têm seta, `aria-sort` correto e alvo de 44 px; a ordenação por clique continua igual.
- [x] Valores numéricos usam mono tabular e alinhamento à direita; unidades aparecem de forma consistente.
- [x] A Classe é uma etiqueta com letra A–F e cor; a cor nunca é o único sinal.
- [x] A linha de Aparelho analisado tem marcador ciano de 2 px (`--foco`, ticket 102) e selo "Análise" discreto, sem puxar a linha para o topo.
- [x] Abaixo de 900 px a tabela permanece uma `<table>` sem conversão para cartões: um contêiner de rolagem horizontal (`role="region"`, `aria-label`, `tabindex="0"`) mantém todas as colunas; as colunas de seleção e Modelo ficam `position: sticky; left: 0` com fundo opaco; o cabeçalho acompanha a rolagem vertical, com `z-index` em camadas para nada se sobrepor.
- [x] A página nunca rola na horizontal; só o contêiner da tabela rola (`overscroll-behavior-x: contain`). O aviso "Deslize para ver as colunas" aparece abaixo de 900 px e desaparece após a primeira rolagem onde houver suporte a animação dirigida por rolagem; sem suporte, permanece.
- [x] Nenhuma coluna, segunda linha `Função · Tensão`, ordenação ou estado é perdido no mobile; o comportamento é feito só com CSS, sem JS novo.
- [x] Estados de carregamento (esqueleto de linhas), erro de rede (alerta com "Tentar de novo") e recorte vazio (estado vazio com ação) estão implementados.
- [x] "Mostrar mais" continua em blocos de 50 e informa quantos restam.
- [x] Nenhuma mudança em filtros, seleção, URL, contagem ou dados; os testes de ilha da consulta continuam verdes.
- [x] **Densidade e centralização:** a tabela reduz o espaçamento horizontal entre colunas (gaps internos de `th`/`td` e `gap` do contêiner) para uma leitura mais compacta; o contêiner da tabela fica centralizado na shell quando a tabela não ocupa a largura total, sem folga excessiva nas laterais. O comportamento mobile (rolagem horizontal, colunas fixas) permanece idêntico.

## Comments

**Entrega (2026-11-26).** A tabela passou a ser um instrumento: a ordem da leitura é identificação (Marca em mono de 0,75 rem e `--mudo`; Modelo como único link e único peso 500, com `Função · Tensão` abaixo), medida (Capacidade, Consumo e IDRS em mono tabular à direita, com a unidade uma vez por célula — `12.000 BTU/h`, `416 kWh/ano`) e qualificação (Classe com o `EtiquetaClasse` do primitivo, letra em mono e tom da Classe com a explicação no `title`/leitor de tela; Tipo em `--grafite`). O selo "Análise" ganhou **coluna própria**, a última, criada só quando há Análise publicada; a linha analisada mantém o marcador ciano de 2 px no fio esquerdo, agora na célula fixa, e o fundo lavado a 6%.

**Rolagem e colunas fixas.** Abaixo de 900 px a tabela mantém `min-width: 60 rem` dentro de um `<section>` focável com `aria-label`, `overflow-x: auto` e `overflow-y: clip` — o `clip` no eixo vertical é o que mantém o `<thead>` grudado no topo da página em vez de criar um scrollport vertical. Seleção e Modelo são `sticky` à esquerda (o Modelo deslocado pela largura da seleção) e a Marca viaja entre as duas, passando por baixo do Modelo; as camadas são corpo (1) < cabeçalho (2) < canto do cabeçalho (3). O aviso "Deslize para ver as colunas" aparece abaixo de 900 px e some com `animation-timeline: scroll()` + `animation-range: 0 24px`; `animation-timeline` e `animation-range` ficam em uma regra própria porque o minificador fundia a linha do tempo no atalho `animation`, que o Chrome rejeita. Nenhum JS novo para a rolagem.

**Estados e densidade.** "Carregando a base…" virou um esqueleto de oito linhas (região viva para o anúncio); o erro de rede ganhou "Tentar de novo" que refaz o `fetch`; o recorte vazio virou um estado com título, frase e "Limpar filtros". "Mostrar mais" informa quantos restam (hoje 2.244 no recorte padrão). O respiro horizontal de `th`/`td` caiu para 0,4 rem, a linha fecha em ~52 px no desktop e o contêiner é centralizado na shell (`--largura-shell`); a injeção de `font-size` do cabeçalho, a Classe e os números saem dos tokens do `DESIGN.md`.

**Navegador (agent-browser, preview 127.0.0.1:4321).** Em 320/390/768/899/900/1024/1440 px a página fecha em `scrollWidth === innerWidth`; a tabela rola dentro do contêiner (960 px de conteúdo contra 320/390/828/942/1344 de viewport útil) e o aviso só existe abaixo de 900 px (visível em 899, `display: none` em 900). A 240 px de rolagem horizontal, a seleção fica em 0–48 px, o Modelo em 48–301 px e a Marca sai para −192 px, sob o Modelo; com a página rolada em 1400 px o `<thead>` fica em `top: 0`. Densidade medida: `padding` de 6,4 px nas células, linha de 50 px no celular e 52 px no desktop, cabeçalho de 44 px. Classe "B" em `rgb(70,117,54)` sobre fundo tonal; selo "Análise" em `rgb(11,111,131)`; unidade a 11 px em `rgb(95,111,112)`; marca em Azeret Mono 12 px. `axe` 4.12.1 (`wcag2a,wcag2aa`): 0 violações e 0 inconclusivos; `impeccable detect` na página publicada (1440 e 390): nenhum achado.

**Divergência registrada.** O ticket pede seleção e Modelo fixas; na ordem do próprio ticket a Marca fica **entre** as duas, então só seria possível fixar o Modelo com `left` se a Marca também estivesse no fluxo fixo. A implementação mantém a Marca rolando por baixo do Modelo (não a esconde nem a remove), o que preserva a leitura das três colunas de identificação com o bloco fixo em ~259 px no celular. `data-label` permanece em cada célula como anotação da coluna, agora sem a regra de cartão do celular.

**Checks.** Vitest 787/787 (51 arquivos), `pnpm typecheck` OK, `pnpm lint` 0 erros (33 warnings; os 29 pré-existentes e quatro avisos de cascata/estrutura da própria reforma do `global.css`), `pnpm build` reproduz `data/build` e `reports` sem alteração, `pnpm build:site` gera 2.433 páginas. `DESIGN.md` (seção "Tabela de Aparelhos"), `docs/agents/architecture.md`, a seção 3 da `spec-fase12.md` e o `project-state.md` foram sincronizados no mesmo commit.
