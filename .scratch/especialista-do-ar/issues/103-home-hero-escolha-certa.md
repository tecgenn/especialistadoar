# 103 — Hero: “Seu conforto começa pela escolha certa”

**What to build:** o H1 passa a vender a decisão, não o banco de dados. O título exato é **“Seu conforto começa pela escolha certa”**, em duas linhas fixas no desktop (“Seu conforto começa” / “pela escolha certa”) e fluxo natural no celular, mantendo a escala display e a entrada por mask do #93. O lead assume a promessa funcional exata: **“Descubra quantos BTUs seu ambiente precisa e compare modelos de ar-condicionado por capacidade, consumo e eficiência energética, com base em dados oficiais do INMETRO.”** Abaixo do lead entra o CTA **“Encontrar meu ar ideal →”**, que ancora no simulador (`#simulador`): a primeira pergunta do visitante é quantos BTUs ele precisa, e a resposta começa ali, sem sair da página. O `title` de SEO continua com “Ar-condicionado e BTUs… INMETRO”; o H1 deixa de repetir a palavra-chave.

**Blocked by:** 102 (acento e remoção do traço acima do H1).

**Skills:** `design-taste-frontend` — `references/copy.md` e `references/moments.md` (uma entrada orquestrada, CTA único). `impeccable` — `reference/clarify.md` e `reference/craft-floor.md`. `ui-ux-pro-max` — `"hero headline CTA anchor" --domain ux`.

**Status:** done

- [x] H1 exato, em duas linhas fixas no desktop e fluxo natural abaixo de 22 rem
- [x] Lead exato, em serifa, com no máximo 56ch
- [x] CTA “Encontrar meu ar ideal →” logo abaixo do lead, alvo de 44 px, com `href="#simulador"` e seta desenhada (não emoji)
- [x] O simulador do hero recebe `id="simulador"` e `scroll-margin-top` para não ficar sob o cabeçalho
- [x] Sem kicker, sem fita de versão e sem traço acima do H1
- [x] `title`, `description`, canonical e JSON-LD (`WebSite` + `FAQPage`) preservados; a description continua citando INMETRO e BTUs
- [x] Entrada por mask preservada, com o estado final no HTML e `prefers-reduced-motion` desligando tudo
- [x] 0 px de overflow horizontal em 320/390/768/1024/1440 px
- [x] Testes de build conferem H1, lead, CTA e ausência de `.home-titulo::before`
- [x] `DESIGN.md`, seção “Hero da home”, atualizado no mesmo commit

## Decisão de implementação

O CTA usa o primitivo `Botao` na variante primária com `icone="seta-direita"`: a seta é o SVG de linha do conjunto do site, não um glifo. O alvo de 44 px e o foco ciano vêm do primitivo, e o respiro até o simulador fica em `.home-hero-acao`. O `scroll-margin-top` do `#simulador` já vem da regra global `:where([id])` de `base.css` (72 px do cabeçalho + 16 px de respiro = 88 px medidos no navegador), então não há regra duplicada. O H1 mantém a estrutura de duas `.home-titulo-linha`, o que preserva a entrada por mask do #93 e a quebra natural fora do desktop.

## Notas

- O CTA ancora no simulador em vez de pular direto para `/assistente/` porque o simulador entrega uma capacidade em um gesto e o Assistente completo é o passo seguinte, oferecido no resultado do #104 com área e sol já preenchidos. Duas promessas iguais na mesma dobra competiriam.
- “Ar-condicionado” sai do H1 visual, mas não do título da aba, da description, do `WebSite` nem do texto da página. A intenção de busca continua coberta.
