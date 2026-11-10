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

/**
 * Páginas do site sem nenhuma Análise: 2.227 fichas + `/` + `/aparelhos/` +
 * `/assistente/` (ticket 41). Caiu de 2.460 fichas quando a pipeline passou a
 * excluir Model Status = "Excluído" (ticket 31); a curadoria de Análises pode
 * apontar para um id fora da base, então o número é o que o build realmente gera.
 */
const PAGINAS_BASE = 2230;

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
 * A home é um hub (ticket 46) com os nove blocos, e tudo nela é derivado da
 * base publicada: contagens, capacidades e marcas populares, Versão da tabela.
 */
function conferirHomeHub(html: string): void {
  const contagens = contagensDoBuild();
  const curadoria = curadoriaPresente();
  const numero = new Intl.NumberFormat("pt-BR");

  // 1. Hero com H1 e subtítulo de ar-condicionado + INMETRO + comparação.
  expect(html).toContain("<h1>Ar-condicionado com dados do INMETRO</h1>");
  expect(html).toContain("capacidade, consumo e eficiência");

  // 2. Dois cartões grandes, o do Assistente com destaque de cor.
  expect(html).toContain('class="home-cartoes"');
  expect(html).toContain("<strong>Ver aparelhos</strong>");
  expect(html).toContain('href="/aparelhos/"');
  expect(html).toContain("<strong>Usar assistente</strong>");
  expect(html).toContain('href="/assistente/"');
  expect(html).toContain("home-cartao home-cartao-destaque");

  // 3. Faixa de confiança com contagens reais e a Versão da tabela.
  expect(html).toContain(`<strong>${contagens.aparelhos}</strong> aparelhos`);
  expect(html).toContain(`<strong>${contagens.marcas}</strong> marcas`);
  expect(html).toContain(
    `<strong>${contagens.capacidades}</strong> capacidades`,
  );
  const versao = versaoDaTabela();
  expect(versao).toBeDefined();
  expect(html).toContain(`Versão da tabela: ${versao}`);

  // 4. Capacidades populares ligadas à tabela filtrada (9.000 a 36.000).
  expect(html).toContain("Capacidades populares");
  expect(curadoria.btus.length).toBeGreaterThan(0);
  for (const btu of curadoria.btus) {
    expect(html).toContain(`href="/aparelhos/?btu=${btu}"`);
    expect(html).toContain(`${numero.format(btu)} BTU/h`);
  }

  // 5. Marcas populares (as curadas em filtros.json) ligadas à tabela.
  expect(html).toContain("Marcas populares");
  expect(curadoria.marcas.length).toBeGreaterThan(0);
  for (const marca of curadoria.marcas) {
    expect(html).toContain(`href="/aparelhos/?marca=${marca.valor}"`);
    expect(html).toContain(`>${marca.rotulo}</a>`);
  }

  // 7. Chamada do Assistente com "como funciona em 3 passos".
  expect(html).toContain("Descubra quantos BTUs você precisa");
  expect(html.match(/class="home-passos"/g) ?? []).toHaveLength(1);
  for (const passo of [
    "Responda cinco perguntas",
    "Veja a conta aberta",
    "Compare antes de comprar",
  ]) {
    expect(html).toContain(passo);
  }

  // 8. FAQ visível e o mesmo conteúdo no JSON-LD FAQPage.
  expect(html).toContain("Perguntas frequentes");
  const blocos = jsonLdsDaPagina(html);
  const faq = blocos.find((bloco) => bloco["@type"] === "FAQPage");
  expect(faq).toBeDefined();
  const entidades = (faq as Record<string, unknown>).mainEntity as Array<{
    "@type": string;
    name: string;
    acceptedAnswer: { "@type": string; text: string };
  }>;
  expect(entidades.length).toBeGreaterThanOrEqual(5);
  expect(entidades.length).toBeLessThanOrEqual(6);
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
  titulo: "Comprar o aparelho de fixture",
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
    expect(htmlValida.match(/<aside class="cta-cartao/g) ?? []).toHaveLength(4);
    expect(htmlValida).toContain("Ver oferta");
    expect(htmlValida).toContain("Calcular os BTUs do meu ambiente");
    expect(htmlValida).toContain('href="/assistente/"');
    expect(htmlValida).toContain("Onde comprar");
    expect(htmlValida).toContain(`href="${oferta.url}"`);
    expect(htmlValida).toContain('rel="sponsored nofollow noopener"');
    expect(htmlValida).toContain('target="_blank"');
    // O cartão comercial se identifica como link de afiliado (ADR-0010).
    expect(htmlValida).toContain("Link de afiliado");
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
    expect(htmlAusente).not.toContain("Dados declarados por Variante");
    expect(htmlAusente).not.toContain("Ver ficha técnica");
    expect(htmlAusente).not.toContain("Onde comprar");
    expect(htmlAusente).not.toContain('rel="sponsored');
    // O banner de transparência aparece em toda Análise e o Aparelho Ausente
    // não tem ficha: os CTAs levam à tabela e ao Assistente.
    expect(textoDaPagina(htmlAusente)).toContain("Aviso de transparência");
    expect(htmlAusente.match(/<aside class="cta-cartao/g) ?? []).toHaveLength(
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
    expect(htmlSemOferta.match(/<aside class="cta-cartao/g) ?? []).toHaveLength(
      3,
    );
    expect(htmlSemOferta).toContain("Ver ficha técnica");
    expect(htmlSemOferta).toContain("Calcular os BTUs do meu ambiente");
    expect(htmlSemOferta).toContain("Ver outros de ");
    expect(htmlSemOferta).not.toContain("Onde comprar");
    expect(htmlSemOferta).not.toContain('rel="sponsored');

    // Ofertas são site-only: não viram arquivo servido nem entram na ilha.
    expect(existsSync(join(distDir, "ofertas.json"))).toBe(false);
    expect(scripts.some((texto) => texto.includes(oferta.url))).toBe(false);

    // O Pagefind saiu (ticket 30): nem o índice nem a página /busca/ são gerados,
    // e os links antigos são redirecionados para a tabela de Aparelhos.
    esperarSemBuscaAntiga();
    // As 2.230 páginas base mais as 3 Análises da fixture e o índice `/analises/`.
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
  it("mantém as 2.230 páginas e omite seção, menu e analises.json", () => {
    // Diretório vazio explícito: o conteúdo publicado já pode ter Análises.
    buildarSite(criarDiretorioTemporario());

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
    // A home (e as demais páginas de leitura) mantém o teto de 64 rem.
    expect(htmlHome).not.toContain('<body class="ampla">');
    const jsonLdHome = jsonLdDaPagina(htmlHome);
    expect(jsonLdHome["@type"]).toBe("WebSite");

    const sitemap = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
    expect(sitemap).not.toContain("/analises/");
    expect(sitemap).toContain("/assistente/");

    // O Assistente (ticket 41) tem página própria, entra no menu e publica o
    // JSON-LD de aplicação. A ilha renderiza no servidor antes de hidratar: a
    // primeira pergunta e o progresso já vêm no HTML, sem depender de JS.
    const htmlAssistente = lerHtml("assistente");
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
    // A página de Aparelhos usa o layout amplo; as demais páginas mantêm o teto.
    expect(htmlTabela).toContain('<body class="ampla">');
    expect(htmlTabela).toContain(
      'rel="canonical" href="https://especialista-do-ar.pages.dev/aparelhos/"',
    );
    const jsonLdTabela = jsonLdDaPagina(htmlTabela);
    expect(jsonLdTabela["@type"]).toBe("CollectionPage");
    expect(jsonLdTabela.name).toBe("Aparelhos de ar-condicionado");

    // As opções do filtro trazem a Marca de catálogo (uma por família); as 10
    // marcas conhecidas e as 6 capacidades comuns são chips curados (ticket 22)
    // e não se repetem no `<select>`. Eles vivem na tabela, não na home.
    expect(htmlTabela).toContain(">Midea</button>");
    expect(htmlTabela).toContain(">Samsung</button>");
    expect(htmlTabela).toContain(">36.000</button>");
    expect(htmlTabela).not.toContain('<option value="MIDEA">MIDEA</option>');
    expect(htmlTabela).not.toContain(
      '<option value="SPRINGER MIDEA">SPRINGER MIDEA</option>',
    );
    expect(htmlTabela).toContain('<option value="BRITÂNIA">BRITÂNIA</option>');
    expect(htmlHome).not.toContain(">Midea</button>");
    expect(htmlHome).not.toContain(">36.000</button>");

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
