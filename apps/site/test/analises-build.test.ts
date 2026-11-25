import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import type { AnaliseFrontmatter } from "../src/lib/analises.ts";
import { PAGINAS_INSTITUCIONAIS } from "../src/lib/institucionais.ts";
import type { Oferta } from "../src/lib/ofertas.ts";

/**
 * Seam de build (a mais alta) da camada de Análises: um build real do Astro com
 * uma fixture em MDX, fora do conteúdo publicado, e depois o build sem nenhuma
 * Análise. O teste olha só o que sai em `dist/` — página, link bidirecional,
 * sitemap, `analises.json`, JSON-LD, menu e página degradada.
 */

const raizRepo = fileURLToPath(new URL("../../../", import.meta.url));
const siteDir = fileURLToPath(new URL("../", import.meta.url));
const distDir = join(siteDir, "dist");
const dataBuildDir = join(raizRepo, "data", "build");

// Roda o CLI do Astro direto com o Node atual: dispensa shell/pnpm no teste e
// funciona igual em Windows e Linux.
const exigir = createRequire(import.meta.url);
const pacoteAstro = exigir.resolve("astro/package.json");
const binAstro = join(
  dirname(pacoteAstro),
  (JSON.parse(readFileSync(pacoteAstro, "utf8")) as { bin: { astro: string } })
    .bin.astro,
);

interface AparelhoDaBase {
  id: string;
  marca: string;
  modelo: string;
  linhas: number[];
  registros: Array<{ numero: string }>;
}

type AnaliseFixture = AnaliseFrontmatter;

function aparelhosDaBase(): AparelhoDaBase[] {
  return JSON.parse(
    readFileSync(join(dataBuildDir, "aparelhos.json"), "utf8"),
  ) as AparelhoDaBase[];
}

function contarHtml(dir: string): number {
  let total = 0;
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.isDirectory()) {
      total += contarHtml(join(dir, entrada.name));
    } else if (entrada.name.endsWith(".html")) {
      total += 1;
    }
  }
  return total;
}

function lerHtml(...partes: string[]): string {
  return readFileSync(join(distDir, ...partes, "index.html"), "utf8");
}

/** O HTML de uma rota do site a partir do href canônico (`/contato/`). */
function lerHtmlInstitucional(href: string): string {
  return lerHtml(...href.split("/").filter((parte) => parte !== ""));
}

/**
 * Páginas do site sem nenhuma Análise: uma ficha por Aparelho com Dados
 * declarados na Versão atual + `/` + `/aparelhos/` + `/assistente/` (ticket 41)
 * + `/comparar/` (ticket 49) + as três institucionais (ticket 57). Derivado da
 * base publicada para que uma nova exportação não deixe o número parado; a
 * curadoria de Análises pode apontar para um id fora da base, então o build sem
 * Análise é o que o teste conta.
 */
const PAGINAS_BASE = aparelhosDaBase().length + 7;

/**
 * O build não gera mais o Pagefind nem a página `/busca/` (ticket 30) e publica
 * os redirecionamentos dos links antigos para a tabela de Aparelhos.
 */
function esperarSemBuscaAntiga(): void {
  expect(existsSync(join(distDir, "pagefind"))).toBe(false);
  expect(existsSync(join(distDir, "busca"))).toBe(false);
  const redirects = readFileSync(join(distDir, "_redirects"), "utf8");
  expect(redirects).toContain("/busca/ /aparelhos/ 301");
  expect(redirects).toContain("/busca /aparelhos/ 301");
}

/** O texto da página com os espaços colapsados, para comparar frases que o
 *  Astro quebra em linhas no HTML. */
function textoDaPagina(html: string): string {
  return html.replace(/\s+/g, " ");
}

/**
 * O CSS que o build serve: as folhas em `_astro/` (o Astro deixa de embutir a
 * folha quando ela cresce) mais qualquer `<style>` embutido na página.
 */
function cssDaPagina(html: string): string {
  const embutido = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((achado) => achado[1])
    .join("");
  const arquivos = readdirSync(join(distDir, "_astro"))
    .filter((nome) => nome.endsWith(".css"))
    .map((nome) => readFileSync(join(distDir, "_astro", nome), "utf8"))
    .join("");
  return embutido + arquivos;
}

function jsonLdsDaPagina(html: string): Array<Record<string, unknown>> {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ].map((achado) => JSON.parse(achado[1] ?? "{}") as Record<string, unknown>);
}

/** O primeiro bloco JSON-LD da página (o `WebSite` da home, o da própria rota nas demais). */
function jsonLdDaPagina(html: string): Record<string, unknown> {
  const [primeiro] = jsonLdsDaPagina(html);
  expect(primeiro).toBeDefined();
  return primeiro as Record<string, unknown>;
}

type ItemDeNavegacao = "Aparelhos" | "Comparar" | "Assistente" | "Análises";

/**
 * Seam de build do shell global (ticket 67): a mesma moldura em todas as
 * rotas — skip link primeiro, cabeçalho com o item ativo, largura declarada,
 * rodapé em tinta e metadados sociais mínimos. Nenhuma imagem é inventada:
 * `og:image` não existe nestas páginas.
 */
function conferirShell(
  html: string,
  esperado: {
    ativo: ItemDeNavegacao | null;
    largura: "shell" | "leitura" | "ampla";
  },
): void {
  expect(html).toContain(`<body data-largura="${esperado.largura}">`);
  expect(html).toContain(`class="shell principal-${esperado.largura}"`);

  // Skip link: primeiro elemento focável do body, leva ao main.
  const corpo = html.slice(html.indexOf("<body"));
  const posicaoSkip = corpo.indexOf('class="skip-link"');
  const posicaoHeader = corpo.indexOf("<header");
  const posicaoMain = corpo.indexOf('<main id="conteudo"');
  expect(posicaoSkip).toBeGreaterThan(-1);
  expect(posicaoSkip).toBeLessThan(posicaoHeader);
  expect(posicaoHeader).toBeLessThan(posicaoMain);
  expect(corpo).toContain('href="#conteudo"');

  // Header: marca, navegação e exatamente um item ativo.
  expect(html).toContain('<header class="site-header">');
  expect(html).toContain('<a class="marca" href="/">Especialista do Ar</a>');
  const inicioNav = html.indexOf('<nav class="site-nav"');
  const nav = html.slice(inicioNav, html.indexOf("</nav>", inicioNav));
  const ativos = [
    ...nav.matchAll(/aria-current="page"[^>]*>([^<]+)<\/a>/g),
  ].map((achado) => achado[1]);
  expect(ativos).toEqual(esperado.ativo === null ? [] : [esperado.ativo]);

  // Rodapé em azul-frio escuro com proveniência, institucionais e um bloco
  // único de transparência com o leitor. A Versão da tabela é publicada uma
  // vez por página, aqui (tickets 95 e 100).
  const { rodape } = conferirVersaoNoRodape(html);
  expect(rodape).toContain('data-superficie="escura"');
  const textoRodape = textoDaPagina(rodape);
  expect(textoRodape).toContain("Transparência com o Leitor");
  expect(textoRodape).toContain("projeto técnico e editorial independente");
  expect(textoRodape).toContain("Não é filiado ao INMETRO nem ao Procel");
  expect(textoRodape).toContain("não vende produtos diretamente");
  expect(textoRodape).toContain("preços em lojas parceiras");
  expect(textoRodape).toContain("comissão de afiliado");
  expect(textoRodape).toContain("sem custo adicional para o visitante");
  expect(textoRodape).toContain("Alguns links deste site são de afiliado");
  expect(rodape.match(/Transparência com o Leitor/g) ?? []).toHaveLength(1);
  for (const pagina of Object.values(PAGINAS_INSTITUCIONAIS)) {
    expect(rodape).toContain(`href="${pagina.href}"`);
  }

  // Metadados sociais mínimos, iguais ao title/description da página.
  expect(html).toContain('<meta name="theme-color" content="#F2F5F1">');
  expect(html).toContain('<meta property="og:type" content="website">');
  expect(html).toContain(
    '<meta property="og:site_name" content="Especialista do Ar">',
  );
  expect(html).toContain('<meta property="og:locale" content="pt_BR">');
  expect(html).toContain('<meta name="twitter:card" content="summary">');
  const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const ogTitulo = html.match(
    /<meta property="og:title" content="([^"]*)">/,
  )?.[1];
  expect(ogTitulo).toBe(titulo);
  const descricao = html.match(
    /<meta name="description" content="([^"]*)">/,
  )?.[1];
  if (descricao !== undefined) {
    expect(html).toContain(
      `<meta property="og:description" content="${descricao}">`,
    );
  }
  expect(html).not.toContain('property="og:image"');
}

/**
 * Seam de build das páginas institucionais (ticket 57): as três rotas saem no
 * `dist/`, cada uma com título/descrição/canonical próprios no layout de leitura,
 * entram no sitemap e no rodapé e dizem só o que é verdade hoje.
 */
function conferirPaginasInstitucionais(): void {
  const site = "https://especialista-do-ar.pages.dev";
  const paginas = Object.values(PAGINAS_INSTITUCIONAIS);

  for (const pagina of paginas) {
    const html = lerHtmlInstitucional(pagina.href);
    expect(html).toContain(`<title>${pagina.titulo}</title>`);
    expect(html).toContain(
      `<meta name="description" content="${pagina.descricao}">`,
    );
    expect(html).toContain(
      `<link rel="canonical" href="${site}${pagina.href}">`,
    );
    expect(html).toContain('<body data-largura="leitura">');
    expect(html).toContain("<h1>");
    conferirShell(html, { ativo: null, largura: "leitura" });
  }

  const sitemap = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
  const home = lerHtml("");
  for (const pagina of paginas) {
    expect(sitemap).toContain(`<loc>${site}${pagina.href}</loc>`);
    expect(home).toContain(`href="${pagina.href}"`);
  }

  const contato = textoDaPagina(lerHtml("contato"));
  expect(contato).toContain("tecgenn@gmail.com");
  expect(contato).toContain("mailto:tecgenn@gmail.com?subject=D%C3%BAvida");
  expect(contato).toContain(
    "mailto:tecgenn@gmail.com?subject=Corre%C3%A7%C3%A3o%20de%20dado%20do%20INMETRO",
  );
  expect(contato).toContain("mailto:tecgenn@gmail.com?subject=Parceria");
  expect(contato).toContain("INMETRO");
  expect(contato).toContain("lojas parceiras");

  const privacidade = textoDaPagina(lerHtml("politica-de-privacidade"));
  for (const trecho of [
    "Quem somos",
    "independente do INMETRO",
    "não coletamos",
    "sem cadastro",
    "sem cookies próprios",
    "Cloudflare Web Analytics",
    "Cloudflare Pages",
    "lojas parceiras",
    "navegador",
    "URL",
    "LGPD",
    "tecgenn@gmail.com",
  ]) {
    expect(privacidade).toContain(trecho);
  }
  expect(privacidade).not.toContain("GA4");
  expect(privacidade).not.toContain("AdSense");

  const termos = textoDaPagina(lerHtml("termos-de-uso"));
  for (const trecho of [
    "Finalidade e independência",
    "INMETRO",
    "Valores oficiais",
    "Valores calculados",
    "não vendemos",
    "não exibimos preços",
    "não processamos pedidos",
    "comissão",
    "Variantes",
    "Marca de catálogo",
    "Análises",
    "atribuição",
    "responsabilidade",
    "legislação brasileira",
  ]) {
    expect(termos).toContain(trecho);
  }

  // Nenhuma das três promete preço, economia ou um modelo como escolha.
  for (const pagina of paginas) {
    const html = lerHtmlInstitucional(pagina.href);
    expect(html).not.toContain("R$");
    expect(html).not.toContain("economize");
    expect(html).not.toContain("recomendamos");
  }
}

/**
 * As contagens que a home precisa mostrar, calculadas aqui de forma
 * independente a partir do `consulta.json` publicado — se a página escrevesse um
 * número à mão, este teste falharia assim que a base mudasse.
 */
function contagensDoBuild(): {
  aparelhos: string;
  marcas: string;
  capacidades: string;
} {
  const itens = JSON.parse(
    readFileSync(join(distDir, "consulta.json"), "utf8"),
  ) as Array<{ marcaCatalogo: string; capacidadesBtu: number[] }>;
  const numero = new Intl.NumberFormat("pt-BR");
  return {
    aparelhos: numero.format(itens.length),
    marcas: numero.format(
      new Set(itens.map((item) => item.marcaCatalogo).filter((m) => m !== ""))
        .size,
    ),
    capacidades: numero.format(
      new Set(itens.flatMap((item) => item.capacidadesBtu)).size,
    ),
  };
}

/** As capacidades e marcas curadas que existem na base publicada. */
function curadoriaPresente(): {
  btus: number[];
  marcas: Array<{ valor: string; rotulo: string }>;
} {
  const curadoria = JSON.parse(
    readFileSync(join(siteDir, "filtros.json"), "utf8"),
  ) as {
    btus: number[];
    marcas: Array<{ valor: string; rotulo: string }>;
  };
  const itens = JSON.parse(
    readFileSync(join(distDir, "consulta.json"), "utf8"),
  ) as Array<{ marcaCatalogo: string; capacidadesBtu: number[] }>;
  const capacidades = new Set(itens.flatMap((item) => item.capacidadesBtu));
  const marcas = new Set(itens.map((item) => item.marcaCatalogo));
  return {
    btus: curadoria.btus
      .filter((btu) => capacidades.has(btu))
      .sort((a, b) => a - b),
    marcas: curadoria.marcas.filter((marca) => marcas.has(marca.valor)),
  };
}

/** A Versão da tabela atual, como o footer passa a publicá-la (ticket 95). */
function versaoDaTabela(): { hash: string; obtidoEm: string } | undefined {
  const manifest = JSON.parse(
    readFileSync(join(dataBuildDir, "manifest.json"), "utf8"),
  ) as {
    versaoAtual: string | null;
    versoes: Array<{ hash: string; obtidoEm: string }>;
  };
  const versao = manifest.versoes.find(
    (candidata) => candidata.hash === manifest.versaoAtual,
  );
  return versao
    ? { hash: versao.hash.slice(0, 12), obtidoEm: versao.obtidoEm }
    : undefined;
}

/** A linha de versão aparece uma vez por página, no rodapé, em todas as rotas. */
function conferirVersaoNoRodape(html: string): {
  rodape: string;
  inicioRodape: number;
  versao: { hash: string; obtidoEm: string };
} {
  const versao = versaoDaTabela();
  expect(versao).toBeDefined();
  const inicioRodape = html.indexOf('<footer class="site-footer"');
  expect(inicioRodape).toBeGreaterThan(-1);
  const rodape = html.slice(inicioRodape);
  expect(rodape).toContain(
    `Versão da tabela: ${versao?.hash} · obtida em ${versao?.obtidoEm}`,
  );
  expect(html.split("Versão da tabela:")).toHaveLength(2);
  expect(html.split(versao?.hash as string)).toHaveLength(2);
  return {
    rodape,
    inicioRodape,
    versao: versao as { hash: string; obtidoEm: string },
  };
}

/**
 * A home é um hub (ticket 46), e tudo nela é derivado da base publicada: as
 * capacidades em destaque, as Análises e o FAQ. A Versão da tabela saiu da home
 * no ticket 95 e vive só no footer (todas as rotas); a faixa de cobertura da
 * base saiu no ticket 105.
 */
function conferirHomeHub(html: string): void {
  const contagens = contagensDoBuild();
  const curadoria = curadoriaPresente();
  const numero = new Intl.NumberFormat("pt-BR");

  // 1. Hero do ticket 103: o H1 vende a decisão e o lead assume a promessa
  //    funcional exata. "Ar-condicionado" sai do H1 visual, mas continua no
  //    `title` e na description (checados mais abaixo).
  expect(html).toContain('id="home-titulo"');
  expect(html).toContain("Seu conforto começa");
  expect(html).toContain(
    "Descubra quantos BTUs seu ambiente precisa e compare modelos de ar-condicionado por capacidade, consumo e eficiência energética, com base em dados oficiais do INMETRO.",
  );
  // O CTA ancora no simulador, com a seta desenhada pelo ícone do primitivo.
  expect(html).toMatch(
    /<a class="botao botao-primario" href="#simulador">\s*Encontrar meu ar ideal\s*<svg/,
  );

  // 2. Simulador do hero (ticket 104): título de interface, conta aberta em
  //    lista de três linhas e duas ações com a URL preenchida pelo estado
  //    padrão (20 m², sol à tarde).
  const inicioSimulador = html.indexOf('id="simulador"');
  expect(inicioSimulador).toBeGreaterThan(-1);
  expect(html).toContain('class="hero-simulador"');
  const simulador = html.slice(
    inicioSimulador,
    html.indexOf("</section>", inicioSimulador),
  );
  expect(simulador).toContain('id="hero-area"');
  expect(simulador).toContain('type="range"');
  expect(simulador).toContain("Descubra quantos BTUs o seu ambiente precisa");
  expect(simulador).toContain(
    "A área e o sol já bastam para uma primeira estimativa.",
  );
  expect(simulador).toContain("Incidência de sol");
  expect(simulador).toContain("Capacidade recomendada");
  // O texto como o leitor de tela o monta: o React separa nós com comentários.
  const textoSimulador = textoDaPagina(simulador.replace(/<[^>]+>/g, " "));
  expect(textoSimulador).toContain("20 m²");
  expect(textoSimulador).toContain("18.000 BTU/h");
  // A conta aberta é um `<dl>` de três linhas, com os rótulos do ticket.
  expect(simulador).toContain('class="hero-simulador-calculo"');
  expect(simulador.match(/<dt>/g) ?? []).toHaveLength(3);
  expect(simulador).toContain("Área × sol");
  expect(simulador).toContain("Capacidade calculada");
  expect(simulador).toContain("Faixa comercial");
  expect(textoSimulador).toContain("15.000 BTU/h");
  expect(textoSimulador).toMatch(
    /\d+ aparelhos de 18\.000 BTU\/h · \d+ com Classe A/,
  );
  // A ação primária leva ao Assistente com área e sol já preenchidos; a
  // secundária abre o recorte exato da capacidade.
  expect(simulador).toMatch(
    /<a class="botao botao-primario" href="\/assistente\/\?forma=metros&amp;area=20&amp;sol=tarde">/,
  );
  expect(simulador).toContain("Continuar no Assistente");
  expect(simulador).toContain('href="/aparelhos/?btu=18000"');
  expect(textoSimulador).toContain("Ver aparelhos de 18.000 BTU/h");
  expect(simulador.match(/class="hero-sol-opcao"/g) ?? []).toHaveLength(4);
  expect(simulador).toContain('aria-pressed="true">Tarde</button>');
  expect(html).toContain("botao-primario");
  expect(html).toContain("botao-secundario");
  expect(html).not.toContain("Simule o seu ambiente");
  expect(html).not.toContain("Capacidade comercial recomendada");
  expect(html).not.toContain("Ver esses aparelhos");
  expect(html).not.toContain("Explorar o catálogo");
  expect(html).not.toContain("Calcular BTUs");
  expect(html).not.toContain("Dimensionar meu ambiente");

  // 2a. Hero do ticket 93, refeito: o H1 grande é o elemento gráfico da primeira
  //     tela, em duas linhas com mask para a entrada; não há painel de escala
  //     lateral nem linha decorativa animada, e a régua é a única leitura de
  //     escala. O bloco existe até no build sem nenhuma Análise publicada.
  expect(html).toContain('class="home-hero"');
  expect(html).toContain('id="home-titulo"');
  expect(html).toContain('class="home-titulo"');
  expect(html).not.toContain('class="home-escala"');
  expect(html).not.toContain("home-hero-texto");
  const inicioTitulo = html.indexOf('class="home-titulo"');
  const titulo = html.slice(
    html.indexOf(">", inicioTitulo) + 1,
    html.indexOf("</h1>", inicioTitulo),
  );
  expect(titulo.match(/class="home-titulo-linha"/g) ?? []).toHaveLength(2);
  expect(textoDaPagina(titulo.replace(/<[^>]+>/g, " ")).trim()).toBe(
    "Seu conforto começa pela escolha certa",
  );

  // A entrada é opt-in (só com no-preference) e o estado final já vem no CSS:
  // título sobe do mask, leitura e ações entram depois. Foco ciano de 2 px e
  // alvo mínimo de 44 px nos botões.
  const css = cssDaPagina(html);
  expect(css).toMatch(/@keyframes\s+hero-linha-sobe/);
  expect(css).toMatch(/@keyframes\s+hero-entra/);
  expect(css).toMatch(/prefers-reduced-motion:\s*no-preference/);
  // Abaixo de 22 rem o display desce para o token de manchete. Um var() de
  // token inexistente cairia no tamanho herdado do corpo (17 px) em 320 px.
  expect(css).toMatch(
    /@media\s*\(width<=22rem\)\{\.home-titulo\{font-size:var\(--texto-manchete\)\}/,
  );
  expect(css).not.toMatch(/home-escala/);
  expect(css).toMatch(/outline:\s*2px solid var\(--foco\)/);
  expect(css).not.toMatch(/outline:\s*2px solid var\(--primaria\)/);
  // O marcador da linha analisada usa o mesmo ciano de 2 px do foco (ticket
  // 102); o antigo traço de 3 px em azul-frio não pode voltar.
  expect(css).toMatch(/border-left:\s*2px solid var\(--foco\)/);
  expect(css).not.toMatch(/border-left:\s*3px solid var\(--primaria\)/);
  expect(css).toMatch(/min-height:\s*44px/);
  // As duas colunas do desktop começam em minmax(0, …): nenhuma palavra longa
  // do título pode empurrar a página para fora da viewport em 1024/1440 px.
  expect(css).toMatch(
    /grid-template-columns:\s*minmax\(0,\s*7fr\)\s+minmax\(0,\s*5fr\)/,
  );

  // 2b. A régua de capacidade saiu da home (ticket 94): o simulador é a única
  //     leitura de escala, sem segundo gráfico, sem ticks e sem link de faixa
  //     na página. O contrato `btuMin`/`btuMax` segue no catálogo.
  expect(html).not.toContain("regua-capacidade");
  expect(html).not.toMatch(/btuMin=|btuMax=/);
  expect(css).not.toMatch(
    /regua-capacidade|regua-tick-entra|regua-barra-entra|--proporcao/,
  );

  // 3. A faixa "Cobertura da base" saiu do meio da home no ticket 105: nenhuma
  //    contagem de aparelhos, marcas ou capacidades volta como bloco, e a
  //    Versão da tabela segue só no footer (ticket 95), uma vez, em mono.
  expect(html).not.toContain("home-confianca");
  expect(html).not.toContain("Cobertura da base");
  expect(html).not.toContain(`<strong>${contagens.aparelhos}</strong>`);
  expect(html).not.toContain(`<strong>${contagens.marcas}</strong>`);
  expect(html).not.toContain(`<strong>${contagens.capacidades}</strong>`);
  expect(css).not.toMatch(/home-confianca/);
  // A seção seguinte ao hero assume a hairline superior: o respiro entre o
  // simulador e os destaques não dobra.
  expect(css).toMatch(
    /\.home-destaques,[^{]*\{[^}]*border-top:\s*1px solid var\(--linha\)/,
  );
  const { inicioRodape, versao } = conferirVersaoNoRodape(html);
  expect(html.indexOf(versao.hash)).toBeGreaterThan(inicioRodape);
  // A fita de calibração saiu junto: "Base INMETRO" acima do H1 era um kicker
  // e o H1 já diz "dados do INMETRO" (ticket 95).
  expect(html).not.toContain('class="home-fita"');
  const inicioHero = html.indexOf('class="home-hero"');
  const inicioMetodologia = html.indexOf('class="home-metodologia"');
  const trechosSemVersao = [
    html.slice(inicioHero, html.indexOf("</section>", inicioHero)),
    html.slice(
      inicioMetodologia,
      html.indexOf("</section>", inicioMetodologia),
    ),
  ];
  for (const trecho of trechosSemVersao) {
    expect(trecho).not.toContain("Versão da tabela");
    expect(trecho).not.toContain(`Versão ${versao.hash}`);
    expect(trecho).not.toContain("obtida em");
    expect(trecho).not.toContain(versao.hash);
  }
  expect(css).toMatch(
    /\.rodape-versao\s*\{[^}]*font-family:\s*var\(--fonte-mono\)[^}]*font-size:\s*var\(--texto-rotulo\)[^}]*font-variant-numeric:\s*tabular-nums/,
  );
  // Rodapé com três colunas no desktop e alvos de 44 px nos links
  // institucionais; no celular, a grade empilha com a proveniência primeiro
  // (ticket 100).
  expect(css).toMatch(
    /\.site-footer-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
  );
  expect(css).toMatch(/\.rodape-institucional a\s*\{[^}]*min-height:\s*44px/);

  // 4–5. As listas de capacidades e marcas populares deram lugar a uma única
  //      seção de Aparelhos em destaque (tickets 96 e 107), com os modelos em
  //      cartões separados e a capacidade no cabeçalho. As capacidades são
  //      curadas, mas só aparecem quando há Análise ou Oferta na base.
  expect(html).not.toContain("Capacidades populares");
  expect(html).not.toContain("Marcas populares");
  expect(html).not.toContain("home-populares");
  expect(html.match(/class="home-destaques"/g) ?? []).toHaveLength(1);
  expect(html).toContain('id="home-destaques-titulo"');
  expect(html).toContain('aria-labelledby="home-destaques-titulo"');
  const inicioDestaques = html.indexOf('class="home-destaques"');
  const secaoDestaques = html.slice(
    inicioDestaques,
    html.indexOf("</section>", inicioDestaques),
  );
  const textoDestaques = textoDaPagina(secaoDestaques);
  expect(textoDestaques).toContain("Aparelhos em destaque");
  expect(textoDestaques).toContain(
    "Modelos com análise publicada ou oferta, por capacidade.",
  );
  const capacidades = [
    ...html.matchAll(/data-home-destaques-painel[^>]*id="capacidade-(\d+)"/g),
  ].map((achado) => Number(achado[1]));
  expect(capacidades.length).toBeGreaterThan(0);
  expect(capacidades).toContain(12000);
  if (capacidades.length === 1) {
    // Com uma só capacidade, a capacidade é rótulo estático: sem chips e sem
    // botão desabilitado.
    expect(secaoDestaques).not.toContain("data-home-destaques-chip");
    expect(secaoDestaques).not.toContain("aria-pressed");
    expect(secaoDestaques).toContain('class="home-destaques-rotulo"');
    expect(textoDestaques).toContain(
      `${numero.format(capacidades[0] ?? 0)} BTU/h`,
    );
  } else {
    expect(secaoDestaques).toContain("data-home-destaques-chip");
    expect(secaoDestaques).toContain('aria-pressed="true"');
    expect(secaoDestaques).not.toContain('class="home-destaques-rotulo"');
  }
  for (const btu of capacidades) {
    expect(curadoria.btus).toContain(btu);
    const inicio = html.indexOf(`id="capacidade-${btu}"`);
    const bloco = html.slice(inicio, html.indexOf("</section>", inicio));
    const texto = textoDaPagina(bloco);
    const cartoes = bloco.match(/class="home-destaque-cartao"/g) ?? [];
    expect(cartoes.length).toBeGreaterThan(0);
    expect(cartoes.length).toBeLessThanOrEqual(3);
    expect(texto).toContain("IDRS");
    expect(texto).toContain("Consumo anual");
    // O aviso vive no `title` do logo, fora do texto visível (ticket 108).
    expect(bloco).toContain('title="link de afiliado"');
    expect(bloco).toMatch(/href="\/aparelhos\/ap-[^"]+\/"/);
    expect(bloco).toContain("home-destaque-ofertas");
    // A seção é uma entrada editorial: nem contagem, nem atalho para a tabela.
    expect(texto).not.toContain("aparelhos nesta capacidade");
    expect(bloco).not.toMatch(/href="\/aparelhos\/\?btu=/);
  }
  if (secaoDestaques.includes('href="/analises/')) {
    expect(textoDestaques).toContain("Ler análise");
  }
  expect(html).not.toContain("Aparelhos de 12.000 BTUs em destaque");
  expect(html).not.toContain("home-destaques-total");
  expect(css).not.toMatch(/home-destaques-contagem|home-destaques-total/);
  // Cartões separados: 3 colunas a partir de 1024 px, 2 a partir de 640 px, 1
  // abaixo; fundo giz, borda hairline, raio de painel e hover de tinta.
  expect(css).toMatch(
    /@media \((?:min-width:\s*|width>=)64rem\)[^{]*\{[^}]*\.home-destaques-cartoes[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
  );
  expect(css).toMatch(
    /@media \((?:min-width:\s*|width>=)40rem\)[^{]*\{[^}]*\.home-destaques-cartoes[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  );
  const regraCartao = /\.home-destaque-cartao\{[^}]*\}/.exec(css)?.[0] ?? "";
  expect(regraCartao).toContain("background:var(--giz)");
  expect(regraCartao).toContain("border:1px solid var(--linha)");
  expect(regraCartao).toContain("border-radius:var(--raio-sm)");
  expect(regraCartao).toContain("padding:var(--esp-6)");
  expect(css).toMatch(
    /\.home-destaque-cartao:hover\{[^}]*border-color:var\(--tinta\)/,
  );
  // O chip do seletor é botão de 44 px com `aria-pressed`, foco herdado e
  // rolagem horizontal no celular.
  expect(css).toMatch(/\.home-destaques-chip\{[^}]*min-height:\s*44px/);
  expect(css).toMatch(/\.home-destaques-chips\{[^}]*overflow-x:\s*auto/);
  // Entrada estática: nem carrossel automático nem lista de links soltos.
  expect(html).not.toMatch(/home-destaques-carrossel|autoplay/);
  expect(html).not.toContain("home-links");

  // 7. A chamada do Assistente saiu da home no ticket 98: ela repetia a mesma
  //    estimativa de 20 m² do hero sem acrescentar fatores, conta aberta por
  //    fator ou confiança. O caminho para a ferramenta completa fica na nota do
  //    simulador e na metodologia — não num segundo CTA disfarçado de seção.
  for (const trecho of [
    "home-assistente",
    "home-passos",
    "home-passo-numero",
    "Descubra quantos BTUs você precisa",
    "Usar o Assistente",
    "Responda cinco perguntas",
    "Veja a conta aberta",
    "Compare antes de comprar",
  ]) {
    expect(html).not.toContain(trecho);
  }
  expect(css).not.toMatch(
    /\.home-assistente|\.home-passos|\.home-passo-numero/,
  );
  expect(html).toContain(
    '<a href="/assistente/">Ajustar os outros fatores no Assistente</a>',
  );

  // 8. FAQ visível e o mesmo conteúdo no JSON-LD FAQPage. WebSite e canonical
  //    da home sobrevivem à reformulação visual do hero.
  expect(html).toContain("Perguntas frequentes");
  expect(html).toContain(
    '<link rel="canonical" href="https://especialista-do-ar.pages.dev/">',
  );
  const blocos = jsonLdsDaPagina(html);
  expect(blocos.map((bloco) => bloco["@type"])).toContain("WebSite");
  const faq = blocos.find((bloco) => bloco["@type"] === "FAQPage");
  expect(faq).toBeDefined();
  const entidades = (faq as Record<string, unknown>).mainEntity as Array<{
    "@type": string;
    name: string;
    acceptedAnswer: { "@type": string; text: string };
  }>;
  expect(entidades).toHaveLength(8);
  // O FAQ visível é `<details>` nativo, fechado por padrão, com a pergunta no
  // `summary` — a mesma lista que alimenta o JSON-LD (ticket 71).
  expect(html.match(/<details class="home-pergunta">/g) ?? []).toHaveLength(
    entidades.length,
  );
  expect(
    html.match(/<details class="home-pergunta">\s*<summary>/g) ?? [],
  ).toHaveLength(entidades.length);
  expect(html).not.toContain('<details class="home-pergunta" open');

  // 9. Cabeçalho de seção padrão da home (ticket 102): o mesmo primitivo em
  //    Aparelhos em destaque, Análises em destaque, FAQ e Metodologia — ícone
  //    de 20 px num tile hairline de 32 px ao lado do `h2`, com lead opcional.
  // Com zero Análises a seção de Análises não existe: sobram os três
  // cabeçalhos de Aparelhos, FAQ e Metodologia.
  const cabecalhos = html.match(/class="cabecalho-secao-icone"/g) ?? [];
  expect(cabecalhos.length).toBeGreaterThanOrEqual(3);
  const tile = /\.cabecalho-secao-icone\{[^}]*\}/.exec(css)?.[0] ?? "";
  expect(tile).toContain("width:32px");
  expect(tile).toContain("height:32px");
  expect(tile).toContain("border:1px solid var(--linha)");
  expect(html).toContain('id="home-faq-titulo"');
  expect(html).toContain('aria-labelledby="home-faq-titulo"');
  expect(html).toContain('id="home-metodologia-titulo"');
  expect(html).toContain('aria-labelledby="home-metodologia-titulo"');
  if (html.includes('id="analises-destaque-titulo"')) {
    expect(html).toContain('aria-labelledby="analises-destaque-titulo"');
  }
  // O traço de 2 px acima do H1 saiu junto com o acento âmbar (ticket 102).
  expect(css).not.toMatch(/home-titulo::before/);
  expect(css).not.toMatch(/--sinal|--escala-/);
  const nomes = entidades.map((entidade) => entidade.name);
  expect(nomes).toContain("O que é BTU/h?");
  expect(nomes).toContain("Qual tensão escolher: 127 V ou 220 V?");
  expect(nomes).not.toContain("Como comparar o consumo de energia?");
  for (const entidade of entidades) {
    expect(entidade["@type"]).toBe("Question");
    expect(entidade.name.length).toBeGreaterThan(0);
    expect(entidade.acceptedAnswer["@type"]).toBe("Answer");
    expect(entidade.acceptedAnswer.text.length).toBeGreaterThan(0);
    expect(html).toContain(entidade.name);
    expect(html).toContain(entidade.acceptedAnswer.text);
  }

  // 9. Metodologia/INMETRO: origem, IDRS/Classe e caráter oficial dos valores.
  expect(html).toContain("Metodologia e INMETRO");
  expect(html).toContain("exportação oficial de produtos do INMETRO");
  expect(html).toContain("IDRS");
  expect(html).toContain("Classe");
  expect(html).toContain("estimat");
  // As três condições de ensaio, a vigência da classificação e a nota sobre
  // Inverter (ticket 64), no mesmo bloco de metodologia.
  const textoHome = textoDaPagina(html);
  const metodologia = textoHome.slice(
    textoHome.indexOf("Metodologia e INMETRO"),
  );
  for (const trecho of [
    "carga total a 35 °C",
    "carga parcial a 35 °C",
    "carga parcial a 29 °C",
    "1º de janeiro de 2023",
    "Portaria INMETRO 269/2021",
    "Inverter",
    "mesma capacidade",
    "descartadas ao montar a tabela",
    "está ausente",
    "Cancelado e Inativo são status do Registro INMETRO",
  ]) {
    expect(metodologia).toContain(trecho);
  }
  // Com a seção removida, a metodologia explica o que o Assistente completo
  // acrescenta ao simulador do hero e onde ele fica (ticket 98).
  for (const trecho of [
    'href="/assistente/"',
    "pessoas",
    "eletrônicos",
    "lâmpadas",
    "janelas",
    "conta fator por fator",
    "confiança",
  ]) {
    expect(metodologia).toContain(trecho);
  }

  // 10. A metodologia é um `<details>` nativo por tópico (ticket 99): fechado
  //     por padrão, com o tópico como título no `summary` — a mesma interação
  //     do FAQ, sem tirar o texto editorial da página. As fontes seguem em
  //     mono e o conteúdo do `FAQPage` não muda (o bloco acima confere).
  const inicioSecaoMetodologia = html.indexOf('class="home-metodologia"');
  const secaoMetodologia = html.slice(
    inicioSecaoMetodologia,
    html.indexOf("</section>", inicioSecaoMetodologia),
  );
  const temas = secaoMetodologia.match(/<details class="home-tema">/g) ?? [];
  expect(temas).toHaveLength(8);
  expect(secaoMetodologia).not.toContain('<details class="home-tema" open');
  expect(
    secaoMetodologia.match(
      /<summary>\s*<span class="home-item-indice" aria-hidden="true">\d{2}<\/span>\s*<h3>/g,
    ) ?? [],
  ).toHaveLength(8);
  expect(secaoMetodologia.match(/<\/details>/g) ?? []).toHaveLength(8);
  // A nota de fontes saiu da home no ticket 109: a afirmação de proveniência
  // vive no rodapé, junto da Versão da tabela, em um lugar só.
  expect(secaoMetodologia).not.toContain("home-fontes");
  expect(secaoMetodologia).not.toContain("Fontes · exportação");
  expect(css).not.toMatch(/\.home-fontes/);
  expect(css).toMatch(/\.home-tema summary::-webkit-details-marker/);
  for (const titulo of [
    "De onde vêm os dados",
    "O recorte da tabela",
    "IDRS e Classe energética",
    "Condições de ensaio",
    "Vigência da classificação",
    "Aparelhos Inverter",
    "Simulador e Assistente",
    "O que é estimativa",
  ]) {
    expect(secaoMetodologia).toContain(`<h3>${titulo}</h3>`);
  }

  // 11. FAQ e metodologia compactos (ticket 109): grade de duas colunas a
  //     partir de 900 px, índice em mono e `+`/`−` em ciano. A densidade é a
  //     única mudança — `PERGUNTAS_FREQUENTES` e o `FAQPage` continuam iguais
  //     (bloco 8), e a numeração sai da posição na lista.
  const cabecalhosFaq = textoDaPagina(
    html.slice(
      html.indexOf('class="home-faq"'),
      html.indexOf("</section>", html.indexOf('class="home-faq"')),
    ),
  );
  expect(cabecalhosFaq).toContain(
    "Respostas curtas sobre BTUs, consumo e dados do INMETRO.",
  );
  expect(html).toContain(
    "Como os dados do INMETRO viram as fichas e a estimativa do site.",
  );
  const numeros = [
    ...html.matchAll(
      /<span class="home-item-indice" aria-hidden="true">\s*(\d{2})\s*<\/span>/g,
    ),
  ].map((achado) => achado[1]);
  expect(numeros).toHaveLength(entidades.length + temas.length);
  // O FAQ vai de 01 a 08 (oito perguntas) e a metodologia de 01 a 08.
  expect(numeros.slice(0, entidades.length)).toEqual(
    entidades.map((_, indice) => String(indice + 1).padStart(2, "0")),
  );
  expect(numeros.slice(entidades.length)).toEqual([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
  ]);
  // A folha publicada passa pelo minificador, que reescreve a media query como
  // `(width>=56.25rem)` e remove os espaços — o contrato é a declaração, não a
  // grafia do arquivo-fonte.
  const blocoCompacto =
    /@media \(width>=56\.25rem\)\{\.home-faq-lista,\.home-metodologia-lista\{([^}]*)\}\}/.exec(
      css,
    )?.[1] ?? "";
  expect(blocoCompacto).toContain(
    "grid-template-columns:repeat(2,minmax(0,1fr))",
  );
  expect(blocoCompacto).toContain("column-gap:var(--esp-8)");
  // Abaixo de 900 px a grade é uma coluna só: a regra base não declara
  // `grid-template-columns`, e a media query é a única que o faz.
  const gradeBase =
    /\.home-faq-lista,\.home-metodologia-lista\{([^}]*)\}/.exec(css)?.[1] ?? "";
  expect(gradeBase).toContain("display:grid");
  expect(gradeBase).not.toContain("grid-template-columns");
  const resumoItem =
    /\.home-pergunta summary,\s*\.home-tema summary\s*\{[^}]*\}/.exec(
      css,
    )?.[0] ?? "";
  expect(resumoItem).toContain("align-items:start");
  expect(resumoItem).toContain("min-height:56px");
  expect(resumoItem).toContain("padding-block:var(--esp-4)");
  expect(resumoItem).toContain("grid-template-columns:auto minmax(0,1fr) auto");
  expect(css).toMatch(
    /\.home-item-indice\s*\{[^}]*font-family:\s*var\(--fonte-mono\)/,
  );
  expect(css).toMatch(
    /\.home-pergunta summary::?after,\s*\.home-tema summary::?after\s*\{[^}]*color:\s*var\(--foco-texto\)/,
  );
  // O FAQ responde em interface e a metodologia explica na fonte de leitura,
  // que vem do `body` (tokens.test) — a distinção que o `DESIGN.md` descreve.
  expect(css).toMatch(
    /\.home-pergunta p\s*\{[^}]*font-family:\s*var\(--fonte-interface\)/,
  );
  expect(
    /\.home-metodologia-lista p\s*\{([^}]*)\}/.exec(css)?.[1] ?? "",
  ).not.toContain("font-family");

  // 12. A Proveniência do rodapé absorve a linha de fontes: Portaria 269/2021 e
  //     o ciclo de 2.080 h/ano, sem duplicar a Versão da tabela e sem uma
  //     quarta coluna.
  const rodape = textoDaPagina(html.slice(html.indexOf('class="site-footer"')));
  expect(rodape.match(/rodape-bloco rodape-/g) ?? []).toHaveLength(3);
  expect(html.match(/Versão da tabela:/g) ?? []).toHaveLength(1);
  // A frase e a Versão não podem estar soltas em qualquer coluna: as duas
  // pertencem à Proveniência, junto da origem e da transparência.
  const inicioProveniencia = html.indexOf(
    'class="rodape-bloco rodape-proveniencia"',
  );
  const proveniencia = textoDaPagina(
    html.slice(inicioProveniencia, html.indexOf("</div>", inicioProveniencia)),
  );
  expect(proveniencia).toContain(
    "Base construída a partir da exportação oficial de produtos do INMETRO, sob a Portaria INMETRO 269/2021. Os cálculos de custo usam o ciclo de referência de 2.080 h/ano.",
  );
  expect(proveniencia).toContain("Versão da tabela:");

  // A home continua sem baixar JSON no cliente.
  expect(html).not.toContain("consulta.json");
  expect(html).not.toContain("analises.json");
  expect(html).not.toContain("ofertas.json");
}

function mdx(analise: AnaliseFixture, corpo: string): string {
  const imagem =
    analise.imagem === undefined
      ? ""
      : `imagem: ${analise.imagem}\nimagemAlt: "${analise.imagemAlt ?? ""}"\n`;
  return `---
aparelhoId: ${analise.aparelhoId}
slug: ${analise.slug}
titulo: "${analise.titulo}"
descricao: "${analise.descricao}"
data: ${analise.data}
${imagem}---

${corpo}
`;
}

function buildarSite(analisesBase?: string, ofertasJson?: string): void {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.ANALISES_BASE;
  delete env.OFERTAS_JSON;
  if (analisesBase !== undefined) {
    env.ANALISES_BASE = analisesBase;
  }
  if (ofertasJson !== undefined) {
    env.OFERTAS_JSON = ofertasJson;
  }
  // O store da content layer é cache de build; limpar garante que os dois
  // builds enxerguem exatamente o diretório apontado por ANALISES_BASE.
  rmSync(join(siteDir, "node_modules", ".astro"), {
    recursive: true,
    force: true,
  });
  const resultado = spawnSync(process.execPath, [binAstro, "build"], {
    cwd: siteDir,
    env,
    encoding: "utf8",
  });
  if (resultado.status !== 0) {
    throw new Error(
      `build falhou (${resultado.status}):\n${resultado.stdout}\n${resultado.stderr}`,
    );
  }
}

/** Aparelhos da base publicada que têm a capacidade curada pedida. */
function aparelhosNaCapacidade(capacidadeBtu: number): AparelhoDaBase[] {
  const itens = JSON.parse(
    readFileSync(join(dataBuildDir, "consulta.json"), "utf8"),
  ) as Array<{ id: string; capacidadesBtu: number[] }>;
  const ids = new Set(
    itens
      .filter((item) => item.capacidadesBtu.includes(capacidadeBtu))
      .map((item) => item.id),
  );
  return aparelhosDaBase().filter((item) => ids.has(item.id));
}

/** A capacidade que a Análise usa no CTA da tabela filtrada. */
function capacidadeDoAparelho(id: string): number | undefined {
  const itens = JSON.parse(
    readFileSync(join(dataBuildDir, "consulta.json"), "utf8"),
  ) as Array<{ id: string; capacidadesBtu: number[] }>;
  return itens.find((item) => item.id === id)?.capacidadesBtu[0];
}

/**
 * Dois Aparelhos distintos de 12.000 BTU/h: o build de fixture continua
 * exercitando o painel curado de 12.000 mesmo quando a ordem do CSV muda de
 * Versão. O seletor de duas capacidades vem da Oferta em 9.000 abaixo.
 */
const [aparelho, outroAparelho] = aparelhosNaCapacidade(12000);
if (aparelho === undefined || outroAparelho === undefined) {
  throw new Error(
    "data/build/consulta.json precisa de dois Aparelhos de 12.000 BTU/h.",
  );
}
const idsConhecidos = new Set([aparelho.id, outroAparelho.id]);

/**
 * Um Aparelho de uma segunda capacidade curada (9.000 BTU/h) e sem 12.000, para
 * o build de fixture exercitar o seletor de capacidade da home com dois
 * painéis — o dado publicado tem uma capacidade só com destaque.
 */
function idNaCapacidade(capacidadeBtu: number): string {
  const itens = JSON.parse(
    readFileSync(join(dataBuildDir, "consulta.json"), "utf8"),
  ) as Array<{ id: string; capacidadesBtu: number[] }>;
  const encontrado = itens.find(
    (item) =>
      item.capacidadesBtu.includes(capacidadeBtu) &&
      !item.capacidadesBtu.includes(12000) &&
      !idsConhecidos.has(item.id),
  );
  if (encontrado === undefined) {
    throw new Error(
      `Nenhum Aparelho de ${capacidadeBtu} BTU/h fora de 12.000 na base.`,
    );
  }
  return encontrado.id;
}
const valida: AnaliseFixture = {
  aparelhoId: aparelho.id,
  slug: "analise-fixture-decisao",
  titulo: "Vale a pena a análise de fixture?",
  descricao: "Uma leitura editorial do Aparelho de fixture.",
  data: "2026-10-20",
  // A Análise mais recente da fixture tem imagem real; as outras duas
  // exercitam o cartão que abre pela data e pelo título (ticket 108).
  imagem: "analises/samsung-windfree-ai-pro-12000/abertura.webp",
  imagemAlt: "Abertura da análise de fixture",
};
const ausente: AnaliseFixture = {
  aparelhoId: "ap-000000000000",
  slug: "analise-fixture-ausente",
  titulo: "Um modelo fora da tabela atual",
  descricao: "Análise de um Aparelho que não consta na Versão atual.",
  data: "2026-10-19",
  imagem: "analises/samsung-windfree-ai-pro-12000/windfree.webp",
  imagemAlt: "Abertura da segunda análise de fixture",
};
const semOferta: AnaliseFixture = {
  aparelhoId: outroAparelho.id,
  slug: "analise-fixture-sem-oferta",
  titulo: "Um Aparelho sem Oferta",
  descricao: "Análise de um Aparelho que não tem Oferta cadastrada.",
  data: "2026-10-18",
};
const oferta: Oferta = {
  aparelhoId: aparelho.id,
  loja: "Mercado Livre",
  url: "https://www.mercadolivre.com.br/aparelho-fixture",
};
const ofertaAmazon: Oferta = {
  aparelhoId: aparelho.id,
  loja: "Amazon",
  url: "https://www.amazon.com.br/aparelho-fixture",
};
const ofertaOutraCapacidade: Oferta = {
  aparelhoId: idNaCapacidade(9000),
  loja: "Amazon",
  url: "https://www.amazon.com.br/aparelho-fixture-9000",
};
const ofertasFixture: Oferta[] = [oferta, ofertaAmazon];

const diretoriosTemporarios: string[] = [];

function criarDiretorioTemporario(): string {
  const dir = mkdtempSync(join(siteDir, ".analises-fixture-"));
  diretoriosTemporarios.push(dir);
  return dir;
}

const fixtureBase = criarDiretorioTemporario();

afterAll(() => {
  for (const dir of diretoriosTemporarios) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("build com uma Análise de fixture", () => {
  it("publica a seção, o link bidirecional, o CTA de Oferta, o analises.json, o JSON-LD e o estado degradado", () => {
    expect(
      aparelhosDaBase().some((item) => item.id === ausente.aparelhoId),
    ).toBe(false);
    const ofertasJson = join(fixtureBase, "ofertas-fixture.json");
    writeFileSync(
      ofertasJson,
      JSON.stringify([...ofertasFixture, ofertaOutraCapacidade], null, 2),
    );
    writeFileSync(
      join(fixtureBase, "valida.mdx"),
      mdx(
        valida,
        [
          // O MDX não repete o CTA de Oferta: os cartões são garantidos pelo
          // template da Análise (ticket 47).
          "Corpo editorial da fixture, com números próprios.",
        ].join("\n"),
      ),
    );
    writeFileSync(
      join(fixtureBase, "ausente.mdx"),
      mdx(ausente, "O conteúdo editorial continua publicado."),
    );
    writeFileSync(
      join(fixtureBase, "sem-oferta.mdx"),
      mdx(semOferta, "Um Aparelho que não tem Oferta cadastrada."),
    );

    buildarSite(fixtureBase, ofertasJson);

    const htmlValida = lerHtml("analises", valida.slug);
    conferirShell(htmlValida, { ativo: "Análises", largura: "leitura" });
    expect(htmlValida).toContain(`<h1>${valida.titulo}</h1>`);
    expect(htmlValida).toContain("Corpo editorial da fixture");
    expect(htmlValida).toContain(`datetime="${valida.data}"`);
    expect(htmlValida).toContain(`href="/aparelhos/${aparelho.id}/"`);
    expect(htmlValida).toContain("Ver ficha técnica");

    const jsonLd = jsonLdDaPagina(htmlValida);
    expect(jsonLd["@type"]).toBe("Article");
    expect(jsonLd.headline).toBe(valida.titulo);
    expect(jsonLd.datePublished).toBe(valida.data);
    expect(jsonLd.description).toBe(valida.descricao);
    expect(jsonLd.url).toContain(`/analises/${valida.slug}/`);

    // Banner de transparência no topo, antes do corpo do artigo, com o texto
    // exato aprovado (ticket 47).
    const textoValida = textoDaPagina(htmlValida);
    expect(textoValida).toContain("Aviso de transparência");
    expect(textoValida).toContain(
      "Este artigo contém links de afiliados. Podemos receber uma comissão pelas compras realizadas através desses links, sem custo adicional para você.",
    );
    expect(htmlValida.indexOf("Aviso de transparência")).toBeLessThan(
      htmlValida.indexOf("analise-corpo"),
    );

    // Com Oferta: quatro CTAs em cartão (topo, meio e dois no fim). Cada CTA é
    // um cartão, nunca um link solto.
    expect(htmlValida.match(/<section class="cta-cartao/g) ?? []).toHaveLength(
      4,
    );
    expect(htmlValida).toContain("Ver oferta");
    expect(htmlValida).toContain("Calcular os BTUs do meu ambiente");
    expect(htmlValida).toContain('href="/assistente/"');
    expect(htmlValida).toContain("Onde comprar");
    for (const ofertaPublicada of ofertasFixture) {
      expect(htmlValida).toContain(`href="${ofertaPublicada.url}"`);
    }
    expect(htmlValida).toContain('rel="sponsored nofollow noopener"');
    expect(htmlValida).toContain('target="_blank"');
    // As ações do cartão são o botão do sistema (ticket 69): o pill azul
    // antigo (`.cta-acao`) não existe mais no HTML.
    expect(htmlValida).not.toContain('class="cta-acao"');
    expect(htmlValida).toContain('class="botao botao-secundario"');
    // O CTA de Oferta leva ao link afiliado com o logotipo da loja e o nome
    // acessível completo; o aviso visível saiu do cartão (ticket 108) e ficou
    // no `title` do logo. As duas lojas usam o SVG oficial em cartão de marca.
    expect(htmlValida).toContain("link de afiliado");
    const cartoesOferta = htmlValida.match(
      /<a class="oferta-cartao oferta-cta oferta-cta--com-logo"[\s\S]*?<\/a>/g,
    );
    expect(cartoesOferta?.length).toBe(4);
    const cartaoOferta = cartoesOferta?.[0] ?? "";
    expect(cartaoOferta).toContain("Ver oferta");
    expect(cartaoOferta).toContain('class="loja-logo"');
    expect(cartaoOferta).toContain(
      'class="loja-marca loja-marca--mercado-livre"',
    );
    expect(cartaoOferta).toContain('alt="Mercado Livre"');
    expect(cartaoOferta).toMatch(/src="[^"]*mercado-livre[^"]*\.svg"/);
    expect(cartaoOferta).toContain('title="link de afiliado"');
    expect(cartaoOferta).not.toContain(">link de afiliado<");
    expect(cartoesOferta?.[1]).toContain(
      'class="loja-marca loja-marca--amazon"',
    );
    expect(cartoesOferta?.[1]).toContain('alt="Amazon"');
    // O SVG da Amazon é inlinado como data URI; se o Vite parar de inlinar,
    // o caminho termina em `amazon....svg`. As duas formas são oficiais.
    const srcAmazon =
      cartoesOferta?.[1]?.match(/<img class="loja-logo" src="([^"]+)"/)?.[1] ??
      "";
    expect(
      /amazon[^"]*\.svg/.test(srcAmazon) ||
        decodeURIComponent(srcAmazon).includes("<title>Amazon</title>"),
    ).toBe(true);
    expect(cartoesOferta?.[1]).toContain('title="link de afiliado"');
    // Nenhum nome de loja aparece como texto visível: só no nome acessível.
    expect(htmlValida).not.toContain(">Mercado Livre<");
    expect(htmlValida).not.toContain(">Amazon<");
    expect(cartaoOferta).toContain('rel="sponsored nofollow noopener"');
    expect(cartaoOferta).toContain('target="_blank"');
    // O MDX não repete a Oferta: só os dois cartões do template a exibem,
    // cada um com as duas Ofertas do Aparelho (ticket 106).
    expect(htmlValida.match(/rel="sponsored/g) ?? []).toHaveLength(4);
    expect(htmlValida).not.toContain("Oferta no meio do texto");
    // A tabela filtrada pela capacidade do Aparelho.
    const capacidade = capacidadeDoAparelho(aparelho.id);
    expect(capacidade).toBeDefined();
    expect(htmlValida).toContain(
      `Ver outros de ${new Intl.NumberFormat("pt-BR").format(capacidade as number)} BTU/h`,
    );
    expect(htmlValida).toContain(`href="/aparelhos/?btu=${capacidade}"`);

    const htmlFicha = lerHtml("aparelhos", aparelho.id);
    expect(htmlFicha).toContain("Leia a análise");
    expect(htmlFicha).toContain(`href="/analises/${valida.slug}/"`);
    for (const ofertaPublicada of ofertasFixture) {
      expect(htmlFicha).toContain(`href="${ofertaPublicada.url}"`);
    }
    expect(htmlFicha).toContain('rel="sponsored nofollow noopener"');
    // A seção "Ofertas" entra no índice de seções (ticket 62).
    expect(htmlFicha).toContain('href="#ofertas"');
    expect(htmlFicha).toContain('<section class="ofertas" id="ofertas">');
    // A faixa não tem mais parágrafo de apresentação: título e lista de Ofertas.
    // O aviso de afiliado não está no texto visível (ticket 108); ele fica no
    // `title` do logo, no nome acessível e no rodapé.
    expect(textoDaPagina(htmlFicha)).not.toContain("Links comerciais");
    expect(textoDaPagina(htmlFicha)).not.toContain(
      "a compra acontece na loja e a comissão, se houver, não custa nada a você",
    );
    expect(htmlFicha).not.toContain('class="oferta-marcador"');
    expect(htmlFicha).not.toContain(">link de afiliado</span>");
    expect(htmlFicha).toContain('title="link de afiliado"');
    expect(htmlFicha).not.toContain(
      "Não fazem parte dos dados técnicos do INMETRO",
    );

    expect(lerHtml("analises")).toContain(`href="/analises/${valida.slug}/"`);

    // A home exibe a grade estática de Análises em destaque (ticket 108): as
    // três Análises mais recentes, cada uma num cartão, todos no HTML do build.
    const htmlHome = lerHtml("");
    // A home virou um hub (ticket 46): os nove blocos são gerados no build.
    conferirHomeHub(htmlHome);
    expect(htmlHome).toContain(">Aparelhos</a>");
    expect(htmlHome).toContain(">Análises</a>");
    expect(htmlHome).not.toContain("Buscar no site");
    expect(htmlHome).not.toContain('href="/busca/"');
    expect(htmlHome).not.toContain('class="tabela-aparelhos"');
    expect(htmlHome).toContain(
      "<title>Ar-condicionado e BTUs: compare aparelhos com dados do INMETRO — Especialista do Ar</title>",
    );
    expect(htmlHome).toContain(
      '<meta name="description" content="Ar-condicionado e BTUs com os dados oficiais do INMETRO',
    );
    expect(htmlHome).toContain(
      'rel="canonical" href="https://especialista-do-ar.pages.dev/"',
    );
    const jsonLdHome = jsonLdDaPagina(htmlHome);
    expect(jsonLdHome["@type"]).toBe("WebSite");
    expect(jsonLdHome.name).toBe("Especialista do Ar");
    expect(htmlHome).toContain("Análises em destaque");
    expect(htmlHome).toContain('href="/analises/"');
    for (const analise of [valida, ausente, semOferta]) {
      expect(htmlHome).toContain(`href="/analises/${analise.slug}/"`);
      expect(htmlHome).toContain(analise.titulo);
      expect(htmlHome).toContain(analise.descricao);
    }

    // Com três Análises publicadas, a grade tem três cartões — um por Análise,
    // na ordem da mais recente para a mais antiga — e nenhum markup ou script
    // de carrossel. O link “Todas as análises” fica uma vez só, no cabeçalho.
    expect(htmlHome).toContain('class="analises-destaque"');
    expect(htmlHome).not.toContain("data-carrossel");
    expect(htmlHome).not.toContain("aria-roledescription");
    expect(htmlHome).not.toContain("Pausar");
    expect(htmlHome).not.toContain("1 / 3");
    expect(htmlHome).not.toContain("AnalisesCarrossel");
    expect(htmlHome.match(/Todas as análises/g) ?? []).toHaveLength(1);
    const inicioDestaques = htmlHome.indexOf('class="analises-destaque"');
    const destaquesHtml = htmlHome.slice(
      inicioDestaques,
      htmlHome.indexOf("</section>", inicioDestaques),
    );
    expect(destaquesHtml).toContain('class="analises-destaque-grade"');
    expect(destaquesHtml.match(/class="analises-cartao"/g) ?? []).toHaveLength(
      3,
    );
    expect(destaquesHtml).toContain('href="/analises/"');
    expect(destaquesHtml).toContain("Todas as análises");
    // A ordem da grade é a ordem das datas, decrescente.
    const posicoes = [valida, ausente, semOferta].map((analise) =>
      destaquesHtml.indexOf(`href="/analises/${analise.slug}/"`),
    );
    expect(posicoes.every((posicao) => posicao >= 0)).toBe(true);
    expect(posicoes[0]).toBeLessThan(posicoes[1] as number);
    expect(posicoes[1]).toBeLessThan(posicoes[2] as number);
    // Duas Análises com imagem real abrem pelo cartão de imagem (a primeira
    // eager, a segunda lazy); a terceira, sem imagem, abre pela data e título.
    expect(destaquesHtml.match(/analises-cartao-imagem/g) ?? []).toHaveLength(
      2,
    );
    expect(destaquesHtml).toContain('alt="Abertura da análise de fixture"');
    expect(destaquesHtml).toContain(
      'alt="Abertura da segunda análise de fixture"',
    );
    expect(destaquesHtml).toContain('loading="eager"');
    expect(destaquesHtml).toContain('loading="lazy"');
    // A terceira Análise não tem imagem: o cartão abre pela data e pelo
    // título, sem fotografia inventada nem bloco decorativo.
    const cartoesDestaque = [
      ...destaquesHtml.matchAll(
        /<article class="analises-cartao">[\s\S]*?<\/article>/g,
      ),
    ].map((match) => match[0]);
    expect(cartoesDestaque).toHaveLength(3);
    const cartaoSemImagem = cartoesDestaque[2] ?? "";
    expect(cartaoSemImagem).not.toContain("analises-cartao-imagem");
    const dataNoCartao = `<time datetime="${semOferta.data}">${semOferta.data}</time>`;
    const tituloNoCartao = `>${semOferta.titulo}</a>`;
    expect(cartaoSemImagem).toContain(dataNoCartao);
    expect(cartaoSemImagem).toContain(tituloNoCartao);
    expect(cartaoSemImagem.indexOf(dataNoCartao)).toBeLessThan(
      cartaoSemImagem.indexOf(tituloNoCartao),
    );
    // A Oferta é uma linha por loja, com o aviso no tooltip do logo; o título
    // “Onde comprar” e o parágrafo de divulgação não existem mais no cartão.
    expect(destaquesHtml).toContain('title="link de afiliado"');
    expect(destaquesHtml).toContain('rel="sponsored nofollow noopener"');
    expect(destaquesHtml).not.toContain("Onde comprar");

    // O bloco da capacidade (ticket 96) traz o Aparelho da fixture no mesmo
    // cartão: identidade, dados técnicos, link da Análise e link de afiliado.
    const inicioBloco = htmlHome.indexOf('id="capacidade-12000"');
    const blocoCapacidade = htmlHome.slice(
      inicioBloco,
      htmlHome.indexOf("</section>", inicioBloco),
    );
    expect(blocoCapacidade).toContain(`href="/aparelhos/${aparelho.id}/"`);
    expect(blocoCapacidade).toContain(`href="/analises/${valida.slug}/"`);
    for (const ofertaPublicada of ofertasFixture) {
      expect(blocoCapacidade).toContain(`href="${ofertaPublicada.url}"`);
    }
    expect(textoDaPagina(blocoCapacidade)).toContain(aparelho.marca);
    expect(textoDaPagina(blocoCapacidade)).toContain(aparelho.modelo);
    expect(blocoCapacidade).toContain('alt="Mercado Livre"');
    expect(blocoCapacidade).toContain('alt="Amazon"');
    expect(blocoCapacidade).not.toContain(">Mercado Livre<");
    expect(blocoCapacidade).not.toContain(">Amazon<");
    expect(blocoCapacidade).toContain('title="link de afiliado"');

    // Duas capacidades com conteúdo no build de fixture (9.000 e 12.000): o
    // seletor nasce em chips, na ordem da curadoria, com o primeiro painel
    // ativo, e o HTML traz os dois painéis sem `hidden` — o script inline só
    // esconde o inativo depois de inicializar, então sem JavaScript a lista
    // aparece inteira.
    expect(htmlHome).toContain('class="home-destaques-seletor-rotulo"');
    expect(htmlHome).not.toContain('class="home-destaques-rotulo"');
    expect(htmlHome.match(/class="home-destaques-chip"/g) ?? []).toHaveLength(
      2,
    );
    expect(htmlHome).toContain(
      'data-painel="capacidade-9000" aria-pressed="true"',
    );
    expect(htmlHome).toContain(
      'data-painel="capacidade-12000" aria-pressed="false"',
    );
    expect(htmlHome.match(/class="home-destaques-painel"/g) ?? []).toHaveLength(
      2,
    );
    expect(htmlHome).not.toMatch(/class="home-destaques-painel"[^>]*hidden/);
    expect(htmlHome).toContain('id="capacidade-9000"');
    const inicio9000 = htmlHome.indexOf('id="capacidade-9000"');
    const painel9000 = htmlHome.slice(
      inicio9000,
      htmlHome.indexOf('class="home-destaques-painel"', inicio9000),
    );
    expect(painel9000).toContain('class="home-destaque-cartao"');
    expect(painel9000).toContain(`href="${ofertaOutraCapacidade.url}"`);
    expect(painel9000).not.toContain('href="/analises/');

    // Os cards de Aparelhos analisados do Assistente (ticket 42) são montados
    // no build: o mapa capacidade → analisados viaja nas props da ilha, então a
    // página traz a Análise sem baixar analises.json no cliente. O Aparelho
    // Ausente não gera card.
    const htmlAssistente = lerHtml("assistente");
    expect(htmlAssistente).toContain(`/analises/${valida.slug}/`);
    expect(htmlAssistente).toContain(valida.titulo);
    expect(htmlAssistente).not.toContain(`/analises/${ausente.slug}/`);
    expect(htmlAssistente).not.toContain("analises.json");
    expect(htmlAssistente).not.toContain("ofertas.json");

    // A página Aparelhos (ticket 27) mantém o menu e ganha o JSON-LD próprio.
    const htmlTabela = lerHtml("aparelhos");
    expect(htmlTabela).toContain(">Aparelhos</a>");
    expect(htmlTabela).toContain(">Análises</a>");
    expect(htmlTabela).not.toContain("Buscar no site");
    const jsonLdTabela = jsonLdDaPagina(htmlTabela);
    expect(jsonLdTabela["@type"]).toBe("CollectionPage");
    expect(jsonLdTabela.name).toBe("Aparelhos de ar-condicionado");
    expect(jsonLdTabela.url).toBe(
      "https://especialista-do-ar.pages.dev/aparelhos/",
    );

    // Na home, só o Aparelho na Versão atual e com Oferta ganha CTA — o Ausente e
    // o Aparelho sem Oferta não geram link comercial nenhum.
    for (const ofertaPublicada of ofertasFixture) {
      expect(htmlHome).toContain(`href="${ofertaPublicada.url}"`);
    }
    expect(htmlHome).toContain('rel="sponsored nofollow noopener"');
    expect(htmlHome).toContain('target="_blank"');
    // O cartão de Análise não abre uma seção “Onde comprar”: a Oferta é uma
    // linha de loja no rodapé do cartão (ticket 108).
    expect(htmlHome).not.toContain("Onde comprar");
    // Duas Ofertas no destaque da Análise, duas no cartão de 12.000 (que
    // carrega todas as Ofertas do Aparelho, ticket 106) e uma no cartão da
    // segunda capacidade.
    expect(htmlHome.match(/rel="sponsored/g) ?? []).toHaveLength(5);

    // O bloco é gerado no build: o cliente não baixa `ofertas.json` nem
    // `analises.json` para renderizá-lo.
    const scripts = readdirSync(join(distDir, "_astro"))
      .filter((nome) => nome.endsWith(".js"))
      .map((nome) => readFileSync(join(distDir, "_astro", nome), "utf8"));
    expect(htmlHome).not.toContain("analises.json");
    expect(htmlHome).not.toContain("ofertas.json");
    for (const nome of ["analises.json", "ofertas.json"]) {
      expect(scripts.some((texto) => texto.includes(nome))).toBe(false);
    }

    const sitemap = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
    expect(sitemap).toContain(`/analises/${valida.slug}/`);
    expect(sitemap).toContain(`/analises/${ausente.slug}/`);

    const inventario = JSON.parse(
      readFileSync(join(distDir, "analises.json"), "utf8"),
    ) as Array<Record<string, string>>;
    expect(inventario).toEqual([
      {
        slug: valida.slug,
        url: `/analises/${valida.slug}/`,
        aparelhoId: valida.aparelhoId,
        titulo: valida.titulo,
        descricao: valida.descricao,
        data: valida.data,
      },
      {
        slug: ausente.slug,
        url: `/analises/${ausente.slug}/`,
        aparelhoId: ausente.aparelhoId,
        titulo: ausente.titulo,
        descricao: ausente.descricao,
        data: ausente.data,
      },
      {
        slug: semOferta.slug,
        url: `/analises/${semOferta.slug}/`,
        aparelhoId: semOferta.aparelhoId,
        titulo: semOferta.titulo,
        descricao: semOferta.descricao,
        data: semOferta.data,
      },
    ]);

    const htmlAusente = lerHtml("analises", ausente.slug);
    expect(htmlAusente).toContain("não consta na Versão atual");
    for (const trecho of [
      "descartadas ao montar a tabela",
      "está ausente",
      "não o removem da tabela",
    ]) {
      expect(textoDaPagina(htmlAusente)).toContain(trecho);
    }
    expect(htmlAusente).not.toContain("Dados declarados por Variante");
    expect(htmlAusente).not.toContain("Ver ficha técnica");
    expect(htmlAusente).not.toContain("Onde comprar");
    expect(htmlAusente).not.toContain('rel="sponsored');
    // O banner de transparência aparece em toda Análise e o Aparelho Ausente
    // não tem ficha: os CTAs levam à tabela e ao Assistente.
    expect(textoDaPagina(htmlAusente)).toContain("Aviso de transparência");
    expect(htmlAusente.match(/<section class="cta-cartao/g) ?? []).toHaveLength(
      3,
    );
    expect(htmlAusente).toContain("Calcular os BTUs do meu ambiente");
    expect(htmlAusente).toContain('href="/aparelhos/"');

    // Sem Oferta para o Aparelho, não há link comercial — mas continuam os
    // três CTAs em cartão (ficha, Assistente e ficha + tabela).
    const htmlSemOferta = lerHtml("analises", semOferta.slug);
    expect(htmlSemOferta).toContain(
      `href="/aparelhos/${semOferta.aparelhoId}/"`,
    );
    expect(
      htmlSemOferta.match(/<section class="cta-cartao/g) ?? [],
    ).toHaveLength(3);
    expect(htmlSemOferta).toContain("Ver ficha técnica");
    expect(htmlSemOferta).toContain("Calcular os BTUs do meu ambiente");
    const capacidadeSemOferta = capacidadeDoAparelho(semOferta.aparelhoId);
    expect(capacidadeSemOferta).toBeDefined();
    expect(htmlSemOferta).toContain(
      `Ver outros de ${new Intl.NumberFormat("pt-BR").format(capacidadeSemOferta as number)} BTU/h`,
    );
    expect(htmlSemOferta).toContain(
      `href="/aparelhos/?btu=${capacidadeSemOferta}"`,
    );
    expect(htmlSemOferta).not.toContain("Onde comprar");
    expect(htmlSemOferta).not.toContain('rel="sponsored');

    // O rodapé ganha a linha de afiliado ao lado da Versão da tabela, com link
    // para os Termos — e ela aparece mesmo sem Oferta na página (ticket 58).
    const textoSemOferta = textoDaPagina(htmlSemOferta);
    expect(textoSemOferta).toContain("Alguns links deste site são de afiliado");
    expect(textoSemOferta).toContain("saiba mais nos Termos de Uso");
    expect(htmlSemOferta).toContain('href="/termos-de-uso/"');
    const posicaoVersao = textoSemOferta.indexOf("Versão da tabela");
    const posicaoAfiliado = textoSemOferta.indexOf(
      "Alguns links deste site são de afiliado",
    );
    expect(posicaoVersao).toBeGreaterThanOrEqual(0);
    expect(posicaoAfiliado).toBeGreaterThan(posicaoVersao);

    // Ofertas são site-only: não viram arquivo servido. A Comparação (ticket
    // 59) recebe as Ofertas já resolvidas no build, nas props da ilha: o
    // cliente não baixa `ofertas.json` (e os bundles em `_astro` não carregam
    // a URL comercial).
    expect(existsSync(join(distDir, "ofertas.json"))).toBe(false);
    for (const ofertaPublicada of ofertasFixture) {
      expect(scripts.some((texto) => texto.includes(ofertaPublicada.url))).toBe(
        false,
      );
    }
    const htmlComparar = lerHtml("comparar");
    // A ilha não renderiza cartões no SSR: as Ofertas viajam nas props,
    // resolvidas no build, e o cliente não baixa `ofertas.json`.
    for (const ofertaPublicada of ofertasFixture) {
      expect(htmlComparar).toContain(ofertaPublicada.loja);
      expect(htmlComparar).toContain(ofertaPublicada.url);
    }
    expect(htmlComparar).not.toContain("ofertas.json");

    // O Pagefind saiu (ticket 30): nem o índice nem a página /busca/ são gerados,
    // e os links antigos são redirecionados para a tabela de Aparelhos.
    esperarSemBuscaAntiga();
    // As páginas base mais as 3 Análises da fixture e o índice `/analises/`.
    expect(contarHtml(distDir)).toBe(PAGINAS_BASE + 3 + 1);
  }, 600_000);
});

describe("build com Análise inválida", () => {
  it("falha o build com a mensagem do contrato", () => {
    const invalidoBase = criarDiretorioTemporario();
    writeFileSync(
      join(invalidoBase, "a.mdx"),
      mdx({ ...valida, slug: "slug-repetido" }, "Primeira."),
    );
    writeFileSync(
      join(invalidoBase, "b.mdx"),
      mdx(
        {
          ...valida,
          aparelhoId: "ap-bbbbbbbbbbbb",
          slug: "slug-repetido",
        },
        "Segunda.",
      ),
    );

    expect(() => buildarSite(invalidoBase)).toThrow(/slug repetido/);
  }, 600_000);
});

describe("build sem nenhuma Análise (estado zero)", () => {
  it("mantém as páginas base e omite seção, menu e analises.json", () => {
    // Diretório vazio explícito: o conteúdo publicado já pode ter Análises.
    buildarSite(criarDiretorioTemporario());

    conferirPaginasInstitucionais();
    expect(contarHtml(distDir)).toBe(PAGINAS_BASE);
    expect(existsSync(join(distDir, "analises"))).toBe(false);
    expect(existsSync(join(distDir, "analises.json"))).toBe(false);

    const htmlHome = lerHtml("");
    expect(htmlHome).not.toContain('href="/analises/"');
    expect(htmlHome).not.toContain("Análises em destaque");
    // Sem Análise, a seção não renderiza: nem grade, nem cartões, nem script.
    expect(htmlHome).not.toContain('<section class="analises-destaque"');
    expect(htmlHome).not.toContain("analises-destaque-grade");
    expect(htmlHome).not.toContain("data-carrossel");
    // Sem Análise, o único link comercial da home é o do bloco de capacidade,
    // que segue com a Oferta publicada em `ofertas.json` (ticket 96).
    const inicioBlocoSemAnalise = htmlHome.indexOf('id="capacidade-12000"');
    const blocoSemAnalise = htmlHome.slice(
      inicioBlocoSemAnalise,
      htmlHome.indexOf("</section>", inicioBlocoSemAnalise),
    );
    expect(blocoSemAnalise.match(/rel="sponsored/g) ?? []).toHaveLength(1);

    // A home (ticket 46) continua o hub com os nove blocos; só o de Análises em
    // destaque some quando não há nenhuma Análise publicada.
    conferirHomeHub(htmlHome);
    expect(htmlHome).toContain(">Aparelhos</a>");
    expect(htmlHome).not.toContain(">Análises</a>");
    expect(htmlHome).not.toContain("Buscar no site");
    expect(htmlHome).not.toContain('class="tabela-aparelhos"');
    // Sem Análise, os blocos seguem com as Ofertas publicadas (ticket 96).
    expect(htmlHome).toContain('id="capacidade-12000"');
    // A home usa a largura de shell (ticket 67).
    expect(htmlHome).toContain('<body data-largura="shell">');
    conferirShell(htmlHome, { ativo: null, largura: "shell" });
    const jsonLdHome = jsonLdDaPagina(htmlHome);
    expect(jsonLdHome["@type"]).toBe("WebSite");

    const sitemap = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
    expect(sitemap).not.toContain("/analises/");
    expect(sitemap).toContain("/assistente/");
    expect(sitemap).toContain("/comparar/");

    // A Comparação (ticket 49) tem página própria e entra no menu entre
    // Aparelhos e Assistente. O canonical não leva `ids`: a seleção é estado de
    // interface, não uma página a indexar.
    const htmlComparar = lerHtml("comparar");
    expect(htmlComparar).toContain("<h1>Comparar aparelhos</h1>");
    const inicioMenu = htmlComparar.indexOf('<nav class="site-nav"');
    const menu = htmlComparar.slice(
      inicioMenu,
      htmlComparar.indexOf("</nav>", inicioMenu),
    );
    conferirShell(htmlComparar, { ativo: "Comparar", largura: "shell" });
    expect(menu.indexOf(">Aparelhos</a>")).toBeLessThan(
      menu.indexOf(">Comparar</a>"),
    );
    expect(menu.indexOf(">Comparar</a>")).toBeLessThan(
      menu.indexOf(">Assistente</a>"),
    );
    expect(
      htmlComparar.match(/<link rel="canonical" href="([^"]*)"/)?.[1],
    ).toBe("https://especialista-do-ar.pages.dev/comparar/");

    // O Assistente (ticket 41) tem página própria, entra no menu e publica o
    // JSON-LD de aplicação. A ilha renderiza no servidor antes de hidratar: a
    // primeira pergunta e o progresso já vêm no HTML, sem depender de JS.
    const htmlAssistente = lerHtml("assistente");
    conferirShell(htmlAssistente, { ativo: "Assistente", largura: "shell" });
    expect(htmlAssistente).toContain(
      "<title>Calculadora de BTUs: quantos BTUs preciso? — Especialista do Ar</title>",
    );
    expect(htmlAssistente).toContain(
      "<h1>Descubra a capacidade ideal para o seu ambiente</h1>",
    );
    expect(htmlAssistente).toContain("Onde você vai usar o ar-condicionado?");
    expect(htmlAssistente).toContain("Etapa 1 de 5");
    const jsonLdAssistente = jsonLdDaPagina(htmlAssistente);
    expect(jsonLdAssistente["@type"]).toBe("WebApplication");
    expect(jsonLdAssistente.name).toBe("Calculadora de BTUs");
    expect(htmlHome).toContain(">Assistente</a>");
    // Sem nenhuma Análise publicada, o Assistente não tem cards: o resultado
    // continua oferecendo só o caminho para a tabela.
    expect(htmlAssistente).not.toContain("/analises/");

    expect(
      existsSync(join(distDir, "aparelhos", aparelho.id, "index.html")),
    ).toBe(true);

    // O Pagefind e a página /busca/ saíram (ticket 30); o redirecionamento
    // publicado leva os links antigos para a tabela.
    esperarSemBuscaAntiga();

    // Ficha com Marca de catálogo (ADR-0016): o `<h1>`, o título e a URL seguem
    // com a Marca oficial; só a lista de resultados e o link de volta usam a
    // Marca de catálogo. Este é o build real do site — o mesmo seam das Análises.
    const springer = aparelhosDaBase().find(
      (item) => item.marca === "SPRINGER MIDEA",
    );
    expect(springer).toBeDefined();
    const htmlSpringer = lerHtml("aparelhos", springer?.id as string);
    expect(htmlSpringer).toContain("<h1>SPRINGER MIDEA — ");
    expect(htmlSpringer).toContain(
      `rel="canonical" href="https://especialista-do-ar.pages.dev/aparelhos/${springer?.id}/"`,
    );
    expect(htmlSpringer).toContain('href="/aparelhos/?marca=MIDEA"');
    expect(htmlSpringer).toContain("Ver outros aparelhos da marca MIDEA");
    expect(htmlSpringer).not.toContain(
      "Ver outros aparelhos da marca SPRINGER MIDEA",
    );

    // A página /aparelhos/ (ticket 27) é a tabela: o HTML traz o título, o
    // seletor "Ordenar por", os filtros novos e os chips; o CSS ligado esconde
    // o cabeçalho e vira cada linha em cartão abaixo de 640 px.
    const htmlTabela = lerHtml("aparelhos");
    expect(htmlTabela).toContain("<h1>Aparelhos de ar-condicionado</h1>");
    expect(htmlTabela).toContain("<span>Ordenar por</span>");
    // Os filtros do redesign (ticket 34): cada um é um fieldset com legenda.
    for (const filtro of ["Marca", "Capacidade", "Função", "Tipo", "Classe"]) {
      expect(htmlTabela).toContain(`<legend>${filtro}</legend>`);
    }
    expect(htmlTabela).not.toContain("<legend>Rotação</legend>");
    expect(htmlTabela).not.toContain("<legend>Situação</legend>");

    // Os metadados da nova página Aparelhos (ticket 29).
    expect(htmlTabela).toContain(
      "<title>Aparelhos de ar-condicionado — Especialista do Ar</title>",
    );
    // A página de Aparelhos usa a largura ampla (ticket 67); as demais páginas
    // usam shell ou leitura.
    expect(htmlTabela).toContain('<body data-largura="ampla">');
    conferirShell(htmlTabela, { ativo: "Aparelhos", largura: "ampla" });
    expect(htmlTabela).toContain(
      'rel="canonical" href="https://especialista-do-ar.pages.dev/aparelhos/"',
    );
    const jsonLdTabela = jsonLdDaPagina(htmlTabela);
    expect(jsonLdTabela["@type"]).toBe("CollectionPage");
    expect(jsonLdTabela.name).toBe("Aparelhos de ar-condicionado");

    // As 10 marcas conhecidas são chips curados (ticket 22); desde o ticket 61,
    // o antigo `<select>` longo deu lugar ao campo de busca "Outras marcas". A
    // Capacidade, desde o ticket 60, é chip de **faixa** e guarda todas as
    // capacidades exatas no `<select>` do mesmo campo.
    expect(htmlTabela).toContain(">Midea</button>");
    expect(htmlTabela).toContain(">Samsung</button>");
    expect(htmlTabela).toContain(">Até 9.000 BTU/h</button>");
    expect(htmlTabela).toContain(">Acima de 30.000 BTU/h</button>");
    expect(htmlTabela).toContain('aria-label="Capacidade exata"');
    expect(htmlTabela).toContain('<option value="36000">36.000</option>');
    expect(htmlTabela).toContain(">Outras marcas</span>");
    expect(htmlTabela).toContain('placeholder="Digite o nome da marca"');
    expect(htmlTabela).not.toContain('<option value="MIDEA">MIDEA</option>');
    expect(htmlTabela).not.toContain(
      '<option value="SPRINGER MIDEA">SPRINGER MIDEA</option>',
    );
    expect(htmlHome).not.toContain(">Midea</button>");
    expect(htmlHome).not.toContain(">Até 9.000 BTU/h</button>");

    expect(cssDaPagina(htmlTabela)).toMatch(
      /@media \(width<=40rem\)\{[^@]*\.consulta \.tabela-aparelhos td\{[^}]*display:grid/,
    );

    // Ficha nova (ticket 26): resumo no topo, grade 2×2 das condições de ensaio
    // e Variantes de dados idênticos fundidas num bloco com as tensões unidas.
    const gree = aparelhosDaBase().find(
      (item) => item.modelo === "GJC07BK-A3NRND2A",
    );
    expect(gree).toBeDefined();
    const htmlGree = lerHtml("aparelhos", gree?.id as string);
    conferirShell(htmlGree, { ativo: "Aparelhos", largura: "shell" });
    expect(htmlGree).toContain("<h2>Resumo</h2>");
    expect(htmlGree).toContain("7.500 BTU/h (2.197 W)");
    expect(htmlGree).toContain("2,97");
    expect(htmlGree).toContain("15,5 kWh/ano");
    expect(htmlGree.match(/class="variante"/g) ?? []).toHaveLength(1);
    // O ticket 31 passou a descartar as Linhas da tabela com Model Status =
    // "Excluído": a Variante de 127 V saiu e só a de 220 V permanece.
    expect(htmlGree).toContain("Tensão: 220 V · monofásico, bifásico");
    expect(htmlGree).toContain('<th scope="col">Condição</th>');
    expect(htmlGree).toContain('<th scope="col">Carga total</th>');
    expect(htmlGree).not.toContain('<th scope="col">Carga parcial</th>');
    expect(htmlGree).toContain("2.200 / 740 W");
    // A fase acompanha a voltagem: 220 V aceita monofásico e bifásico — as fases
    // não são fundidas numa lista só.
    expect(htmlGree).toContain("Tensão: 220 V · monofásico, bifásico");
    // As 13 linhas repetidas por Variante saíram da ficha.
    expect(htmlGree).not.toContain("Potência — 35 °C total");
    expect(htmlGree).toContain(`Linhas da tabela: ${gree?.linhas.join(", ")}`);
    // `rotacao` saiu do contrato do Aparelho no ticket 31: a ficha não pode
    // renderizar uma linha de Rotação vazia.
    expect(htmlGree).not.toContain("Rotação");

    // A ficha precisa caber em 360 px sem rolagem horizontal: o resumo vira uma
    // coluna e as células da grade podem quebrar.
    const cssDaFicha = cssDaPagina(htmlGree);
    expect(cssDaFicha).toMatch(/@media[^{]*\{[^}]*\.aparelho dl\{[^}]*1fr/);
    expect(cssDaFicha).toContain("overflow-wrap:anywhere");

    // O topo da ficha (ticket 62): etiquetas de Classe, situação e Registros
    // logo abaixo do `<h1>`, antes de qualquer seção.
    const textoGree = textoDaPagina(htmlGree);
    const posicaoH1 = htmlGree.indexOf("</h1>");
    const posicaoEtiquetas = htmlGree.indexOf("ficha-etiquetas");
    const posicaoResumo = htmlGree.indexOf("<h2>Resumo</h2>");
    expect(posicaoEtiquetas).toBeGreaterThan(posicaoH1);
    expect(posicaoEtiquetas).toBeLessThan(posicaoResumo);
    expect(textoGree).toContain("Classe A");
    expect(htmlGree).toContain('data-classe="A"');
    expect(textoGree).toContain("Situação: Ativo");
    expect(textoGree).toContain(
      `Registros ${gree?.registros.map((registro) => registro.numero).join(", ")}`,
    );

    // Três cartões de destaque com unidade e legenda; o de Consumo anual leva
    // à seção "Consumo e custo".
    expect(htmlGree).toContain('data-destaque="idrs"');
    expect(htmlGree).toContain('data-destaque="consumo"');
    expect(htmlGree).toContain('data-destaque="capacidade"');
    expect(htmlGree).toContain('<p class="ficha-destaque-valor">2,97</p>');
    expect(htmlGree).toContain(
      '<p class="ficha-destaque-valor">15,5 kWh/ano</p>',
    );
    expect(htmlGree).toContain(
      '<p class="ficha-destaque-valor">7.500 BTU/h</p>',
    );
    expect(htmlGree).toContain("Ver consumo e custo");

    // O índice só lista seções que existem e leva às âncoras certas; o Gree não
    // tem Oferta, então não há entrada para "Ofertas".
    expect(htmlGree).toContain('<nav class="ficha-indice"');
    for (const ancora of [
      "#resumo",
      "#entenda-os-numeros",
      "#consumo-e-custo",
      "#condicoes-de-ensaio",
      "#especificacoes",
      "#registros",
      "#proveniencia",
    ]) {
      expect(htmlGree).toContain(`href="${ancora}"`);
      expect(htmlGree).toContain(`id="${ancora.slice(1)}"`);
    }
    expect(htmlGree).not.toContain('href="#ofertas"');

    // "Comparar este modelo" é a ação secundária do topo e abre a comparação
    // com o Aparelho já no primeiro campo (`?ids=`).
    expect(htmlGree).toContain(`href="/comparar/?ids=${gree?.id as string}"`);
    expect(textoGree).toContain("Comparar este modelo");

    // "Entenda os números" (ticket 64): quatro explicadores recolhidos por
    // padrão, logo depois do Resumo, sem promessa de economia.
    const posicaoResumoFicha = htmlGree.indexOf('<section id="resumo"');
    const posicaoEntenda = htmlGree.indexOf('id="entenda-os-numeros"');
    const posicaoConsumo = htmlGree.indexOf('id="consumo-e-custo"');
    expect(posicaoEntenda).toBeGreaterThan(posicaoResumoFicha);
    expect(posicaoEntenda).toBeLessThan(posicaoConsumo);
    expect(htmlGree).toContain("<h2>Entenda os números</h2>");
    expect(htmlGree.match(/<details class="explicador"/g) ?? []).toHaveLength(
      4,
    );
    expect(htmlGree).not.toMatch(/<details[^>]*\bopen\b/);
    for (const titulo of [
      "IDRS",
      "Classe energética",
      "Consumo anual",
      "Status do Registro",
    ]) {
      expect(htmlGree).toContain(`<summary>${titulo}</summary>`);
    }
    const secaoEntenda = htmlGree.slice(posicaoEntenda, posicaoConsumo);
    expect(secaoEntenda).toContain("2.080");
    expect(secaoEntenda).toContain("5,7");
    expect(secaoEntenda).toContain("Cancelado");
    expect(secaoEntenda).toContain("Inativo");

    // Etiqueta de Classe em faixa quando as Variantes divergem (ticket 62).
    const vix = aparelhosDaBase().find((item) =>
      item.modelo.includes("AS-24TW2RBBDK03_IDU"),
    );
    expect(vix).toBeDefined();
    const htmlVix = lerHtml("aparelhos", vix?.id as string);
    expect(textoDaPagina(htmlVix)).toContain("Classe A – C");

    // As âncoras não escondem o título atrás do topo da tela e os cartões
    // empilham no celular.
    expect(cssDaFicha).toContain("scroll-margin-top:1.5rem");
    expect(cssDaFicha).toMatch(
      /@media[^{]*\{[^@]*\.ficha-destaques\{[^}]*grid-template-columns:1fr/,
    );

    const consultaPublicada = JSON.parse(
      readFileSync(join(distDir, "consulta.json"), "utf8"),
    ) as Array<{ id: string; marca: string; marcaCatalogo: string }>;
    const itemSpringer = consultaPublicada.find(
      (item) => item.id === springer?.id,
    );
    expect(itemSpringer?.marca).toBe("SPRINGER MIDEA");
    expect(itemSpringer?.marcaCatalogo).toBe("MIDEA");
  }, 600_000);
});
