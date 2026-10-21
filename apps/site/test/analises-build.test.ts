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

/**
 * Seam de build (a mais alta) da camada de Análises: um build real do Astro com
 * uma fixture em MDX, fora do conteúdo publicado, e depois o build sem nenhuma
 * Análise. O teste olha só o que sai em `dist/` — página, link bidirecional,
 * sitemap, `analises.json`, JSON-LD, menu, página degradada e Pagefind.
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

function pageCountDoPagefind(): number {
  const entrada = JSON.parse(
    readFileSync(join(distDir, "pagefind", "pagefind-entry.json"), "utf8"),
  ) as { languages: Record<string, { page_count: number }> };
  const contagens = Object.values(entrada.languages).map(
    (idioma) => idioma.page_count,
  );
  return Math.max(...contagens);
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

function buildarSite(analisesBase?: string): void {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.ANALISES_BASE;
  if (analisesBase !== undefined) {
    env.ANALISES_BASE = analisesBase;
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

const aparelho = primeiroAparelho();
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
  it("publica a seção, o link bidirecional, o analises.json, o JSON-LD e o estado degradado", () => {
    expect(
      aparelhosDaBase().some((item) => item.id === ausente.aparelhoId),
    ).toBe(false);
    writeFileSync(
      join(fixtureBase, "valida.mdx"),
      mdx(valida, "Corpo editorial da fixture, com números próprios."),
    );
    writeFileSync(
      join(fixtureBase, "ausente.mdx"),
      mdx(ausente, "O conteúdo editorial continua publicado."),
    );

    buildarSite(fixtureBase);

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

    const htmlFicha = lerHtml("aparelhos", aparelho.id);
    expect(htmlFicha).toContain("Leia a análise");
    expect(htmlFicha).toContain(`href="/analises/${valida.slug}/"`);

    expect(lerHtml("analises")).toContain(`href="/analises/${valida.slug}/"`);
    expect(lerHtml("")).toContain('href="/analises/"');

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
    ]);

    const htmlAusente = lerHtml("analises", ausente.slug);
    expect(htmlAusente).toContain("não consta na Versão atual");
    expect(htmlAusente).not.toContain("Dados declarados por Variante");
    expect(htmlAusente).not.toContain("Ver ficha técnica");

    expect(existsSync(join(distDir, "pagefind"))).toBe(true);
    expect(pageCountDoPagefind()).toBe(contarHtml(distDir));
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
  it("mantém as 2462 páginas e omite seção, menu e analises.json", () => {
    buildarSite();

    expect(contarHtml(distDir)).toBe(2462);
    expect(existsSync(join(distDir, "analises"))).toBe(false);
    expect(existsSync(join(distDir, "analises.json"))).toBe(false);

    const htmlHome = lerHtml("");
    expect(htmlHome).not.toContain('href="/analises/"');

    const sitemap = readFileSync(join(distDir, "sitemap-0.xml"), "utf8");
    expect(sitemap).not.toContain("/analises/");

    expect(
      existsSync(join(distDir, "aparelhos", aparelho.id, "index.html")),
    ).toBe(true);
    expect(pageCountDoPagefind()).toBe(2462);
  }, 600_000);
});
