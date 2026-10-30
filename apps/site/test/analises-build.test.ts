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
 * Páginas do site sem nenhuma Análise: 2.227 fichas + `/` + `/aparelhos/`.
 * Caiu de 2.460 fichas quando a pipeline passou a excluir Model Status =
 * "Excluído" (ticket 31); a curadoria de Análises pode apontar para um id fora
 * da base, então o número é o que o build realmente gera.
 */
const PAGINAS_BASE = 2229;

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

function jsonLdDaPagina(html: string): Record<string, unknown> {
  const encontrado = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  expect(encontrado).not.toBeNull();
  return JSON.parse(encontrado?.[1] ?? "{}") as Record<string, unknown>;
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
          'import OfertaFaixa from "../src/components/OfertaFaixa.astro";',
          "",
          "Corpo editorial da fixture, com números próprios.",
          "",
          `<OfertaFaixa aparelhoId="${aparelho.id}" titulo="Oferta no meio do texto" />`,
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

    // O CTA da Oferta do Aparelho entra na Análise e o mesmo componente pode
    // ser usado no meio do MDX (sem estilo inline).
    expect(htmlValida).toContain("Onde comprar");
    expect(htmlValida).toContain("Oferta no meio do texto");
    expect(htmlValida).toContain(`href="${oferta.url}"`);
    expect(htmlValida).toContain('rel="sponsored nofollow noopener"');
    expect(htmlValida).toContain('target="_blank"');
    expect(htmlValida).toContain("Links comerciais");

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
    // A home (ticket 29) é uma home de verdade: H1, texto curto, o botão para a
    // tabela e o menu com Aparelhos/Análises — sem a ilha e sem a busca do site.
    expect(htmlHome).toContain("<h1>Especialista do Ar</h1>");
    expect(htmlHome).toContain("Ver todos os aparelhos");
    expect(htmlHome).toContain('href="/aparelhos/"');
    expect(htmlHome).toContain(">Aparelhos</a>");
    expect(htmlHome).toContain(">Análises</a>");
    expect(htmlHome).not.toContain("Buscar no site");
    expect(htmlHome).not.toContain('href="/busca/"');
    expect(htmlHome).not.toContain('class="tabela-aparelhos"');
    expect(htmlHome).toContain(
      "<title>Especialista do Ar — aparelhos de ar-condicionado com dados do INMETRO</title>",
    );
    expect(htmlHome).toContain(
      '<meta name="description" content="Base estruturada dos aparelhos de ar-condicionado',
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

    // Sem Oferta para o Aparelho, não há CTA — nem link comercial vazio.
    const htmlSemOferta = lerHtml("analises", semOferta.slug);
    expect(htmlSemOferta).toContain(
      `href="/aparelhos/${semOferta.aparelhoId}/"`,
    );
    expect(htmlSemOferta).not.toContain("Onde comprar");
    expect(htmlSemOferta).not.toContain('rel="sponsored');

    // Ofertas são site-only: não viram arquivo servido nem entram na ilha.
    expect(existsSync(join(distDir, "ofertas.json"))).toBe(false);
    expect(scripts.some((texto) => texto.includes(oferta.url))).toBe(false);

    // O Pagefind saiu (ticket 30): nem o índice nem a página /busca/ são gerados,
    // e os links antigos são redirecionados para a tabela de Aparelhos.
    esperarSemBuscaAntiga();
    // As 2.229 páginas base mais as 3 Análises da fixture e o índice `/analises/`.
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
  it("mantém as 2229 páginas e omite seção, menu e analises.json", () => {
    buildarSite();

    expect(contarHtml(distDir)).toBe(PAGINAS_BASE);
    expect(existsSync(join(distDir, "analises"))).toBe(false);
    expect(existsSync(join(distDir, "analises.json"))).toBe(false);

    const htmlHome = lerHtml("");
    expect(htmlHome).not.toContain('href="/analises/"');
    expect(htmlHome).not.toContain("Análises em destaque");
    expect(htmlHome).not.toContain('rel="sponsored');

    // A home (ticket 29): H1, texto curto e botão para a tabela; o menu tem só
    // Aparelhos (Análises é condicional) e a busca do site saiu.
    expect(htmlHome).toContain("<h1>Especialista do Ar</h1>");
    expect(htmlHome).toContain("Ver todos os aparelhos");
    expect(htmlHome).toContain('href="/aparelhos/"');
    expect(htmlHome).toContain(">Aparelhos</a>");
    expect(htmlHome).not.toContain(">Análises</a>");
    expect(htmlHome).not.toContain("Buscar no site");
    expect(htmlHome).not.toContain('class="tabela-aparelhos"');
    const jsonLdHome = jsonLdDaPagina(htmlHome);
    expect(jsonLdHome["@type"]).toBe("WebSite");

    const sitemap = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
    expect(sitemap).not.toContain("/analises/");

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
