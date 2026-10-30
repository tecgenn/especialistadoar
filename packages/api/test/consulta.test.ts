import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  criarConsulta,
  type FiltrosConsulta,
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

let dataDir: string;
let buildDir: string;
let dataset: ItemConsulta[];

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-consulta-"));
  buildDir = join(dataDir, "build");
  runBuild({
    dataDir,
    source: fixtureAparelhos,
    origem: "teste",
    obtidoEm: "2026-10-12",
    reportsDir: join(dataDir, "reports"),
  });
  // O consumo no navegador (ilha do site) carrega o mesmo artefato e entrega o
  // array já parseado ao módulo — é o que fazemos aqui.
  dataset = JSON.parse(
    readFileSync(join(buildDir, "consulta.json"), "utf8"),
  ) as ItemConsulta[];
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

const ids = (itens: ItemConsulta[]) => itens.map((item) => item.id).sort();

describe("módulo de consulta — filtros por campo", () => {
  it("sem filtros devolve todo o dataset", () => {
    expect(criarConsulta(dataset).filtrar()).toHaveLength(dataset.length);
  });

  it("filtra por capacidade (BTU)", () => {
    const consulta = criarConsulta(dataset);
    expect(ids(consulta.filtrar({ btu: 9000 }))).toEqual(
      [GREE, KENNEDY, LG].sort(),
    );
    expect(consulta.filtrar({ btu: 12000 })).toEqual([]);
  });

  it("filtra por tensão, incluindo bivolt", () => {
    const consulta = criarConsulta(dataset);
    expect(ids(consulta.filtrar({ tensao: 127 }))).toEqual([GREE]);
    expect(ids(consulta.filtrar({ tensao: 220 }))).toEqual(
      [GREE, KENNEDY, LG].sort(),
    );
    expect(consulta.filtrar({ tensao: 110 })).toEqual([]);
  });

  it("filtra por marca e por tipo, sem diferenciar caixa", () => {
    const consulta = criarConsulta(dataset);
    expect(ids(consulta.filtrar({ marca: "lg" }))).toEqual([LG]);
    expect(ids(consulta.filtrar({ tipo: "Janela" }))).toEqual([KENNEDY]);
  });

  it("filtra por função", () => {
    const consulta = criarConsulta(dataset);
    // No fixture, todos os Aparelhos com Dados declarados são de Frio.
    expect(ids(consulta.filtrar({ funcao: "Frio" }))).toEqual(
      [GREE, KENNEDY, LG].sort(),
    );
    expect(consulta.filtrar({ funcao: "Quente/Frio" })).toEqual([]);
  });

  it("filtra por Classe oficial, sem diferenciar caixa", () => {
    const consulta = criarConsulta(dataset);
    expect(ids(consulta.filtrar({ classe: "A" }))).toEqual([GREE]);
    expect(ids(consulta.filtrar({ classe: "b" }))).toEqual([KENNEDY]);
    expect(consulta.filtrar({ classe: "F" })).toEqual([]);
  });

  it("ignora os filtros removidos (rotação e situação) de links antigos", () => {
    const consulta = criarConsulta(dataset);
    const antigos = {
      rotacao: "Velocidade Variável",
      situacao: "ativo",
    } as unknown as FiltrosConsulta;
    expect(consulta.filtrar(antigos)).toHaveLength(dataset.length);
  });

  it("trata filtro textual em branco como ausência de filtro", () => {
    const consulta = criarConsulta(dataset);
    expect(consulta.filtrar({ marca: "", tipo: "  " })).toHaveLength(
      dataset.length,
    );
  });
});

describe("módulo de consulta — busca textual", () => {
  it("encontra Aparelhos por marca", () => {
    expect(ids(criarConsulta(dataset).filtrar({ q: "kenne" }))).toEqual([
      KENNEDY,
    ]);
  });

  it("encontra Aparelhos por tipo, com prefixo", () => {
    expect(ids(criarConsulta(dataset).filtrar({ q: "spl" }))).toEqual(
      [GREE, LG].sort(),
    );
  });

  it("combina busca textual com filtro de campo (interseção)", () => {
    const resultado = criarConsulta(dataset).filtrar({
      q: "split",
      tensao: 127,
    });
    expect(ids(resultado)).toEqual([GREE]);
  });
});

describe("módulo de consulta — consumo isomórfico (ilha do site)", () => {
  it("não importa Node nem `fs`: o entry é seguro para o bundle do site", () => {
    // A ausência de Node aqui é um invariante arquitetural (ADR-0008) que não se
    // observa na saída do módulo — por isso a guarda sobre o texto-fonte.
    const fonte = readFileSync(
      new URL("../src/consulta.ts", import.meta.url),
      "utf8",
    );
    const especificadores = [
      ...fonte.matchAll(/(?:from|import)\s+["']([^"']+)["']/g),
    ].map((match) => match[1] as string);
    expect(especificadores).not.toContain("fs");
    expect(especificadores).not.toContain("path");
    expect(especificadores.some((nome) => nome.startsWith("node:"))).toBe(
      false,
    );
    // O contrato do pipeline entra só como tipo (apagado na compilação).
    expect(fonte).not.toMatch(
      /import\s+\{[^}]*\}\s+from\s+["']@especialista-do-ar\/pipeline["']/,
    );
    expect(fonte).toMatch(
      /import type\s+\{[^}]*\}\s+from\s+["']@especialista-do-ar\/pipeline["']/,
    );
  });
});
