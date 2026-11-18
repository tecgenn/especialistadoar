# 57 — Institucionais: Contato, Política de Privacidade e Termos de Uso

**What to build:** As três páginas institucionais que o site não tem, escritas apenas com o que é verdade hoje. O contato mostra um e-mail e três assuntos com `mailto:` e assunto pré-preenchido (dúvida, correção de dado do INMETRO e parceria). A política de privacidade descreve o que **não** coletamos, as métricas do Cloudflare Web Analytics sem cookies, a hospedagem, as Ofertas, a calculadora e o Assistente processados no navegador, e os direitos da LGPD. Os termos de uso separam Valores oficiais de Valores calculados, explicam o papel das Ofertas e dizem o que é permitido fazer com a base — uso livre, inclusive automatizado, com atribuição ao Especialista do Ar. As três entram no rodapé e no sitemap.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `/contato` com o endereço de e-mail vindo de uma constante única do site (`tecgenn@gmail.com` por enquanto)
- [x] Três assuntos com `mailto:` e assunto pré-preenchido: dúvida, correção de dado do INMETRO e parceria
- [x] Nota de que os dados vêm do INMETRO e de que os links podem levar a lojas parceiras
- [x] `/politica-de-privacidade` com: quem somos; independência do INMETRO; o que não coletamos (sem cadastro, login, cookies próprios ou formulário); métricas do Cloudflare Web Analytics sem cookies e hospedagem Cloudflare; Ofertas e lojas parceiras; calculadora e Assistente processados no navegador, com o que é digitado indo apenas para a URL; direitos da LGPD e contato
- [x] A política não menciona GA4 nem AdSense
- [x] `/termos-de-uso` com: finalidade informativa e independência (sem vínculo com INMETRO, fabricantes ou lojas); Valores oficiais × Valores calculados; Ofertas (não vendemos, não exibimos preços, não processamos pedidos, comissão sem custo ao visitante); uso da base (dados oficiais do INMETRO são públicos, a organização em Aparelhos, Variantes, ids, Marca de catálogo e Análises é do site, uso livre com atribuição); limitação de responsabilidade; legislação brasileira
- [x] As três páginas usam o layout de leitura, têm título, descrição e canonical próprios
- [x] As três aparecem no sitemap e nos links do rodapé
- [x] Nenhuma das três promete preço, economia ou recomendação
- [x] `pnpm build:site` gera as três rotas
- [x] `pnpm test`, `pnpm typecheck` e `pnpm lint` verdes
