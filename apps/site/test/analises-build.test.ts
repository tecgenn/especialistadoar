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
 * Páginas do site sem nenhuma Análise: 2.227 fichas + `/` + `/aparelhos/` +
 * `/assistente/` (ticket 41) + `/comparar/` (ticket 49) + as três institucionais
 * (ticket 57). Caiu de 2.460 fichas quando a pipeline passou a excluir Model
 * Status = "Excluído" (ticket 31); a curadoria de Análises pode apontar para um
 * id fora da base, então o número é o que o build realmente gera.
 */
const PAGINAS_BASE = 2234;

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

  // Rodapé em tinta com proveniência, institucionais e nota de afiliado.
  const rodape = html.slice(html.indexOf('<footer class="site-footer"'));
  expect(rodape).toContain('data-superficie="escura"');
  expect(rodape).toContain("Versão da tabela");
  expect(rodape).toContain("Alguns links deste site são de afiliado");
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

/** O hash (12 primeiros caracteres) da Versão da tabela atual, como a home publica. */
function versaoDaTabela(): string | undefined {
  const manifest = JSON.parse(
    readFileSync(join(dataBuildDir, "manifest.json"), "utf8"),
  ) as {
    versaoAtual: string | null;
    versoes: Array<{ hash: string; obtidoEm: string }>;
  };
  return manifest.versoes
    .find((versao) => versao.hash === manifest.versaoAtual)
    ?.hash.slice(0, 12);
}

/**
 * A régua de capacidade (ticket 70) é o contrato do topo da home: seis faixas
 * comerciais com as contagens reais da base publicada, cada uma um link para o
 * recorte correspondente. As contagens e os hrefs são recalculados aqui, sem
 * importar o módulo da página.
 */
function conferirReguaDaHome(html: string): void {
  const itens = JSON.parse(
    readFileSync(join(distDir, "consulta.json"), "utf8"),
  ) as Array<{ capacidadesBtu: number[] }>;
  const numero = new Intl.NumberFormat("pt-BR");
  const faixas = [
    {
      min: Number.NEGATIVE_INFINITY,
      max: 9000,
      rotulo: "Até 9.000",
      href: "/aparelhos/?btuMax=9000",
    },
    {
      min: 9001,
      max: 12000,
      rotulo: "9.001–12.000",
      href: "/aparelhos/?btuMin=9001&amp;btuMax=12000",
    },
    {
      min: 12001,
      max: 18000,
      rotulo: "12.001–18.000",
      href: "/aparelhos/?btuMin=12001&amp;btuMax=18000",
    },
    {
      min: 18001,
      max: 24000,
      rotulo: "18.001–24.000",
      href: "/aparelhos/?btuMin=18001&amp;btuMax=24000",
    },
    {
      min: 24001,
      max: 30000,
      rotulo: "24.001–30.000",
      href: "/aparelhos/?btuMin=24001&amp;btuMax=30000",
    },
    {
      min: 30001,
      max: Number.POSITIVE_INFINITY,
      rotulo: "Acima de 30.000",
      href: "/aparelhos/?btuMin=30001",
    },
  ];

  const inicio = html.indexOf('class="regua-capacidade"');
  expect(inicio).toBeGreaterThan(-1);
  const regua = html.slice(inicio, html.indexOf("</nav>", inicio));
  // O texto como o leitor de tela o monta: sem tags e com espaços colapsados.
  // O `<wbr>` que deixa o rótulo quebrar depois do travessão conta como um
  // espaço no texto, então a comparação ignora esse espaço.
  const texto = textoDaPagina(regua.replace(/<[^>]+>/g, " ")).replace(
    /– /g,
    "–",
  );
  expect(regua).toContain('aria-label="Navegar por faixa de capacidade"');
  expect(regua.match(/class="regua-capacidade-link"/g) ?? []).toHaveLength(
    faixas.length,
  );

  for (const faixa of faixas) {
    const contagem = itens.filter((item) =>
      item.capacidadesBtu.some((btu) => btu >= faixa.min && btu <= faixa.max),
    ).length;
    expect(contagem).toBeGreaterThan(0);
    expect(regua).toContain(`href="${faixa.href}"`);
    expect(texto).toContain(faixa.rotulo);
    expect(texto).toContain(
      `${numero.format(contagem)} aparelhos com capacidade nesta faixa`,
    );
  }

  // A régua não apresenta a soma das seis como o total de Aparelhos.
  expect(texto).toContain("a soma das seis não é o total de Aparelhos da base");
}

/**
 * A home é um hub (ticket 46) com os nove blocos, e tudo nela é derivado da
 * base publicada: contagens, capacidades e marcas populares, Versão da tabela.
 */
function conferirHomeHub(html: string): void {
  const contagens = contagensDoBuild();
  const curadoria = curadoriaPresente();
  const numero = new Intl.NumberFormat("pt-BR");

  // 1. Hero com H1 e subtítulo de ar-condicionado + INMETRO + comparação.
  expect(html).toContain('id="home-titulo"');
  expect(html).toContain("Ar-condicionado com");
  expect(html).toContain("capacidade, consumo e eficiência");

  // 2. Simulador do hero: slider de área, chips de sol e o estado padrão já no
  //    HTML (20 m² × 750 BTU/h/m² = 15.000 → 18.000 comercial), com o recorte
  //    daquela capacidade e a contagem de Classe A.
  const inicioSimulador = html.indexOf('class="hero-simulador"');
  expect(inicioSimulador).toBeGreaterThan(-1);
  const simulador = html.slice(
    inicioSimulador,
    html.indexOf("</section>", inicioSimulador),
  );
  expect(simulador).toContain('id="hero-area"');
  expect(simulador).toContain('type="range"');
  expect(simulador).toContain('href="/aparelhos/?btu=18000"');
  expect(simulador).toContain('href="/assistente/"');
  expect(simulador.match(/class="hero-sol-opcao"/g) ?? []).toHaveLength(4);
  expect(simulador).toContain('aria-pressed="true">Tarde</button>');
  // O texto como o leitor de tela o monta: o React separa nós com comentários.
  const textoSimulador = textoDaPagina(simulador.replace(/<[^>]+>/g, " "));
  expect(textoSimulador).toContain("20 m²");
  expect(textoSimulador).toContain("18.000 BTU/h");
  expect(textoSimulador).toContain("Explorar o catálogo");
  expect(textoSimulador).toMatch(
    /\d+ aparelhos de 18\.000 BTU\/h no catálogo, \d+ com Classe A\./,
  );
  expect(html).toContain("botao-primario");
  expect(html).toContain("botao-secundario");
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
    "Ar-condicionado com dados do INMETRO",
  );

  // A entrada é opt-in (só com no-preference) e o estado final já vem no CSS:
  // título sobe do mask, leitura e ações entram depois. Foco âmbar de 2 px e
  // alvo mínimo de 44 px nos botões.
  const css = cssDaPagina(html);
  expect(css).toMatch(/@keyframes\s+hero-linha-sobe/);
  expect(css).toMatch(/@keyframes\s+hero-entra/);
  expect(css).toMatch(/prefers-reduced-motion:\s*no-preference/);
  expect(css).not.toMatch(/home-escala/);
  expect(css).toMatch(/outline:\s*2px solid var\(--sinal\)/);
  expect(css).not.toMatch(/outline:\s*2px solid var\(--primaria\)/);
  // O marcador da linha analisada usa o mesmo âmbar de 2 px do hero (spec da
  // fase); o antigo traço de 3 px em azul-frio não pode voltar.
  expect(css).toMatch(/border-left:\s*2px solid var\(--sinal\)/);
  expect(css).not.toMatch(/border-left:\s*3px solid var\(--primaria\)/);
  expect(css).toMatch(/min-height:\s*44px/);
  // As duas colunas do desktop começam em minmax(0, …): nenhuma palavra longa
  // do título pode empurrar a página para fora da viewport em 1024/1440 px.
  expect(css).toMatch(
    /grid-template-columns:\s*minmax\(0,\s*7fr\)\s+minmax\(0,\s*5fr\)/,
  );

  // 2b. Régua de capacidade: seis faixas, contagens do dataset e link para o
  //     recorte de cada faixa no catálogo.
  conferirReguaDaHome(html);

  // 3. Faixa de confiança com contagens reais e a Versão da tabela.
  expect(html).toContain(`<strong>${contagens.aparelhos}</strong> aparelhos`);
  expect(html).toContain(`<strong>${contagens.marcas}</strong> marcas`);
  expect(html).toContain(
    `<strong>${contagens.capacidades}</strong> capacidades`,
  );
  const versao = versaoDaTabela();
  expect(versao).toBeDefined();
  expect(html).toContain(`Versão da tabela: ${versao}`);

  // 4. Capacidades populares ligadas à tabela filtrada (9.000 a 36.000), cada
  //    uma com a contagem de Aparelhos daquela capacidade (ticket 71).
  const itens = JSON.parse(
    readFileSync(join(distDir, "consulta.json"), "utf8"),
  ) as Array<{ marcaCatalogo: string; capacidadesBtu: number[] }>;
  expect(html).toContain("Capacidades populares");
  expect(curadoria.btus.length).toBeGreaterThan(0);
  for (const btu of curadoria.btus) {
    expect(html).toContain(`href="/aparelhos/?btu=${btu}"`);
    expect(html).toContain(`${numero.format(btu)} BTU/h`);
    const contagem = itens.filter((item) =>
      item.capacidadesBtu.includes(btu),
    ).length;
    expect(html).toContain(
      `<span class="home-populares-contagem">${numero.format(contagem)} aparelhos</span>`,
    );
  }

  // 5. Marcas populares (as curadas em filtros.json) ligadas à tabela, também
  //    com a contagem de Aparelhos da Marca de catálogo.
  expect(html).toContain("Marcas populares");
  expect(curadoria.marcas.length).toBeGreaterThan(0);
  for (const marca of curadoria.marcas) {
    expect(html).toContain(`href="/aparelhos/?marca=${marca.valor}"`);
    expect(html).toContain(`>${marca.rotulo}</span>`);
    const contagem = itens.filter(
      (item) => item.marcaCatalogo === marca.valor,
    ).length;
    expect(html).toContain(
      `<span class="home-populares-contagem">${numero.format(contagem)} aparelhos</span>`,
    );
  }
  // Os populares são listas de links com hairline, não chips pill.
  expect(html).not.toContain("home-links");

  // 7. Chamada do Assistente com "como funciona em 3 passos", os passos
  //    numerados sobre a régua e uma única ação.
  expect(html).toContain("Descubra quantos BTUs você precisa");
  expect(html.match(/class="home-passos"/g) ?? []).toHaveLength(1);
  for (const passo of [
    "Responda cinco perguntas",
    "Veja a conta aberta",
    "Compare antes de comprar",
  ]) {
    expect(html).toContain(passo);
  }
  for (const numeroDoPasso of ["01", "02", "03"]) {
    expect(html).toContain(
      `<span class="home-passo-numero">${numeroDoPasso}</span>`,
    );
  }

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
  expect(entidades.length).toBeGreaterThanOrEqual(9);
  expect(entidades.length).toBeLessThanOrEqual(10);
  // O FAQ visível é `<details>` nativo, fechado por padrão, com a pergunta no
  // `summary` — a mesma lista que alimenta o JSON-LD (ticket 71).
  expect(html.match(/<details class="home-pergunta">/g) ?? []).toHaveLength(
    entidades.length,
  );
  expect(html.match(/<summary>/g) ?? []).toHaveLength(entidades.length);
  expect(html).not.toContain('<details class="home-pergunta" open');
  const nomes = entidades.map((entidade) => entidade.name);
  expect(nomes).toContain("O que é BTU/h?");
  expect(nomes).toContain("Qual tensão escolher: 127 V ou 220 V?");
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

  // A home continua sem baixar JSON no cliente.
  expect(html).not.toContain("consulta.json");
  expect(html).not.toContain("analises.json");
  expect(html).not.toContain("ofertas.json");
}

function mdx(analise: AnaliseFixture, corpo: string): string {
  return `---
aparelhoId: ${analise.aparelhoId}
slug: ${analise.slug}
titulo: "${analise.titulo}"
descricao: "${analise.descricao}"
data: ${analise.data}
---

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

function primeiroAparelho(): AparelhoDaBase {
  const [primeiro] = aparelhosDaBase();
  if (primeiro === undefined) {
    throw new Error("data/build/aparelhos.json está vazio.");
  }
  return primeiro;
}

/** A capacidade que a Análise usa no CTA da tabela filtrada. */
function capacidadeDoAparelho(id: string): number | undefined {
  const itens = JSON.parse(
    readFileSync(join(dataBuildDir, "consulta.json"), "utf8"),
  ) as Array<{ id: string; capacidadesBtu: number[] }>;
  return itens.find((item) => item.id === id)?.capacidadesBtu[0];
}

function aparelhoDiferente(id: string): AparelhoDaBase {
  const encontrado = aparelhosDaBase().find((item) => item.id !== id);
  if (encontrado === undefined) {
    throw new Error(
      "data/build/aparelhos.json precisa de mais de um Aparelho.",
    );
  }
  return encontrado;
}

const aparelho = primeiroAparelho();
const outroAparelho = aparelhoDiferente(aparelho.id);
const valida: AnaliseFixture = {
  aparelhoId: aparelho.id,
  slug: "analise-fixture-decisao",
  titulo: "Vale a pena a análise de fixture?",
  descricao: "Uma leitura editorial do Aparelho de fixture.",
  data: "2026-10-20",
};
const ausente: AnaliseFixture = {
  aparelhoId: "ap-000000000000",
  slug: "analise-fixture-ausente",
  titulo: "Um modelo fora da tabela atual",
  descricao: "Análise de um Aparelho que não consta na Versão atual.",
  data: "2026-10-19",
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
  loja: "Loja Fixture",
  url: "https://loja.example.com/aparelho-fixture",
};

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
    writeFileSync(ofertasJson, JSON.stringify([oferta], null, 2));
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
    expect(htmlValida).toContain(`href="${oferta.url}"`);
    expect(htmlValida).toContain('rel="sponsored nofollow noopener"');
    expect(htmlValida).toContain('target="_blank"');
    // As ações do cartão são o botão do sistema (ticket 69): o pill azul
    // antigo (`.cta-acao`) não existe mais no HTML.
    expect(htmlValida).not.toContain('class="cta-acao"');
    expect(htmlValida).toContain('class="botao botao-secundario"');
    // O cartão comercial se identifica como link de afiliado (ADR-0010): o
    // marcador discreto fica na mesma linha da loja e o rótulo padrão é
    // "Ver oferta" — sem promessa de preço (ticket 58).
    expect(htmlValida).toContain("Link de afiliado");
    const cartaoOferta =
      htmlValida.match(/<a class="oferta-cartao"[\s\S]*?<\/a>/)?.[0] ?? "";
    expect(cartaoOferta).toContain("Ver oferta");
    expect(cartaoOferta).toContain(oferta.loja);
    // O separador "·" é decoração de CSS (só aparece na linha larga); o HTML
    // guarda o rótulo que identifica o link de afiliado.
    expect(cartaoOferta).toContain(">link de afiliado</span>");
    expect(cartaoOferta).toContain('rel="sponsored nofollow noopener"');
    expect(cartaoOferta).toContain('target="_blank"');
    // O MDX não repete a Oferta: só os dois cartões do template a exibem.
    expect(htmlValida.match(/rel="sponsored/g) ?? []).toHaveLength(2);
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
    expect(htmlFicha).toContain(`href="${oferta.url}"`);
    expect(htmlFicha).toContain('rel="sponsored nofollow noopener"');
    expect(htmlFicha).toContain("Links comerciais");
    // A seção "Ofertas" entra no índice de seções (ticket 62).
    expect(htmlFicha).toContain('href="#ofertas"');
    expect(htmlFicha).toContain('<section class="ofertas" id="ofertas">');
    // A faixa troca o parágrafo longo por uma frase curta: link comercial,
    // compra na loja e comissão sem custo ao visitante (ticket 58).
    expect(textoDaPagina(htmlFicha)).toContain(
      "a compra acontece na loja e a comissão, se houver, não custa nada a você",
    );
    expect(htmlFicha).not.toContain(
      "Não fazem parte dos dados técnicos do INMETRO",
    );

    expect(lerHtml("analises")).toContain(`href="/analises/${valida.slug}/"`);

    // A home exibe o bloco estático de Análises em destaque: título, descrição e
    // link de cada Análise publicada.
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
    expect(htmlHome).toContain(`href="${oferta.url}"`);
    expect(htmlHome).toContain('rel="sponsored nofollow noopener"');
    expect(htmlHome).toContain('target="_blank"');
    expect(htmlHome).toContain("Onde comprar");
    expect(htmlHome.match(/rel="sponsored/g) ?? []).toHaveLength(1);

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
    expect(scripts.some((texto) => texto.includes(oferta.url))).toBe(false);
    const htmlComparar = lerHtml("comparar");
    expect(htmlComparar).toContain(oferta.loja);
    expect(htmlComparar).not.toContain("ofertas.json");

    // O Pagefind saiu (ticket 30): nem o índice nem a página /busca/ são gerados,
    // e os links antigos são redirecionados para a tabela de Aparelhos.
    esperarSemBuscaAntiga();
    // As 2.234 páginas base mais as 3 Análises da fixture e o índice `/analises/`.
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
  it("mantém as 2.234 páginas e omite seção, menu e analises.json", () => {
    // Diretório vazio explícito: o conteúdo publicado já pode ter Análises.
    buildarSite(criarDiretorioTemporario());

    conferirPaginasInstitucionais();
    expect(contarHtml(distDir)).toBe(PAGINAS_BASE);
    expect(existsSync(join(distDir, "analises"))).toBe(false);
    expect(existsSync(join(distDir, "analises.json"))).toBe(false);

    const htmlHome = lerHtml("");
    expect(htmlHome).not.toContain('href="/analises/"');
    expect(htmlHome).not.toContain("Análises em destaque");
    expect(htmlHome).not.toContain('rel="sponsored');

    // A home (ticket 46) continua o hub com os nove blocos; só o de Análises em
    // destaque some quando não há nenhuma Análise publicada.
    conferirHomeHub(htmlHome);
    expect(htmlHome).toContain(">Aparelhos</a>");
    expect(htmlHome).not.toContain(">Análises</a>");
    expect(htmlHome).not.toContain("Buscar no site");
    expect(htmlHome).not.toContain('class="tabela-aparelhos"');
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
    expect(htmlGree).toContain("Linhas da tabela: 784");
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
    expect(textoGree).toContain("Registros 000377/2021, 004629/2020");

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
