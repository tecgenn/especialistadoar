import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  criarConsulta,
  type ItemConsulta,
} from "@especialista-do-ar/api/consulta";
import { runBuild } from "@especialista-do-ar/pipeline";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const fixtureAparelhos = fileURLToPath(
  new URL(
    "../../pipeline/test/fixtures/amostra-aparelhos.csv",
    import.meta.url,
  ),
);

const GREE = "ap-4e985f48c99e";
const KENNEDY = "ap-3db0d78621d7";
const LG = "ap-97ddaad7049d";

/** A Marca de catálogo, do insumo curado real (ADR-0016). */
function lerCuradoriaReal(): ItemConsulta[] {
  return JSON.parse(
    readFileSync(
      new URL("../../../data/build/consulta.json", import.meta.url),
      "utf8",
    ),
  ) as ItemConsulta[];
}

describe("marca de catálogo — fixture do pipeline", () => {
  let dataDir: string;
  let dataset: ItemConsulta[];

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), "especialista-marca-catalogo-"));
    // No fixture, KENNEDY é a marca que o catálogo agrupa sob LG.
    writeFileSync(
      join(dataDir, "marcas-catalogo.jsonl"),
      `${JSON.stringify({
        marca: "KENNEDY",
        catalogo: "LG",
        motivo: "família comercial de teste",
        fonte: "fixture",
      })}\n`,
    );
    runBuild({
      dataDir,
      source: fixtureAparelhos,
      origem: "teste",
      obtidoEm: "2026-10-12",
      reportsDir: join(dataDir, "reports"),
    });
    dataset = JSON.parse(
      readFileSync(join(dataDir, "build", "consulta.json"), "utf8"),
    ) as ItemConsulta[];
  });

  afterEach(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("filtra pela Marca de catálogo e traz a família inteira", () => {
    const resultado = criarConsulta(dataset).filtrar({ marca: "lg" });
    expect(resultado.map((item) => item.id).sort()).toEqual(
      [KENNEDY, LG].sort(),
    );
  });

  it("continua aceitando o valor oficial antigo", () => {
    const resultado = criarConsulta(dataset).filtrar({ marca: "KENNEDY" });
    expect(resultado.map((item) => item.id)).toEqual([KENNEDY]);
  });

  it("não muda o filtro das marcas sem alias", () => {
    const resultado = criarConsulta(dataset).filtrar({ marca: "GREE" });
    expect(resultado.map((item) => item.id)).toEqual([GREE]);
  });

  it("intersecta a Marca de catálogo com a busca textual", () => {
    const resultado = criarConsulta(dataset).filtrar({
      marca: "LG",
      q: "janela",
    });
    expect(resultado.map((item) => item.id)).toEqual([KENNEDY]);
  });
});

describe("marca de catálogo — base publicada real", () => {
  const dataset = lerCuradoriaReal();
  const consulta = criarConsulta(dataset);

  it("mantém a Marca oficial ao lado da Marca de catálogo", () => {
    const springer = dataset.find((item) => item.marca === "SPRINGER MIDEA");
    expect(springer?.marcaCatalogo).toBe("MIDEA");
    // Toda marca oficial tem uma Marca de catálogo, mesmo sem alias.
    expect(dataset.every((item) => item.marcaCatalogo !== "")).toBe(true);
  });

  it("filtra MIDEA com Midea e Springer Midea (164)", () => {
    expect(consulta.filtrar({ marca: "MIDEA" })).toHaveLength(164);
  });

  it("filtra SPRINGER MIDEA (valor oficial) pelos 67 da família", () => {
    expect(consulta.filtrar({ marca: "SPRINGER MIDEA" })).toHaveLength(67);
  });

  it("filtra e busca FUJITSU com Fujitsu/Airstage e Airstage (27)", () => {
    expect(consulta.filtrar({ marca: "FUJITSU" })).toHaveLength(27);
    expect(consulta.filtrar({ q: "fujitsu" })).toHaveLength(27);
  });

  it("intersecta filtro e busca também na família de marca", () => {
    const resultado = consulta.filtrar({ marca: "MIDEA", q: "midea" });
    expect(resultado.length).toBeGreaterThan(0);
    expect(
      resultado.every(
        (item) => item.marca === "MIDEA" || item.marca === "SPRINGER MIDEA",
      ),
    ).toBe(true);
  });
});
