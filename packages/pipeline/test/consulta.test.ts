import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Aparelho } from "../src/aparelho.ts";
import { runBuild } from "../src/build.ts";
import { projetarConsulta } from "../src/consulta.ts";
import { dadosVazios } from "./support.ts";

const fixtureAparelhos = fileURLToPath(
  new URL("./fixtures/amostra-aparelhos.csv", import.meta.url),
);

function aparelho(
  overrides: Partial<Aparelho> & Pick<Aparelho, "id">,
): Aparelho {
  return {
    marca: "MARCA",
    modelo: "MODELO",
    unidadeInterna: null,
    unidadeExterna: null,
    tipo: null,
    funcao: null,
    fluidoRefrigerante: null,
    fluidoEspecificado: null,
    linhas: [1],
    registros: [],
    variantes: [],
    ...overrides,
  };
}

describe("projetarConsulta — dataset enxuto", () => {
  it("projeta a identidade de cada Aparelho", () => {
    const itens = projetarConsulta(
      [
        aparelho({
          id: "ap-1",
          marca: "GREE",
          modelo: "GREE-09",
          tipo: "Split Hi-Wall",
        }),
      ],
      (marca) => marca,
    );
    expect(itens).toEqual([
      {
        id: "ap-1",
        marca: "GREE",
        marcaCatalogo: "GREE",
        modelo: "GREE-09",
        tipo: "Split Hi-Wall",
        funcao: null,
        capacidadesBtu: [],
        tensoes: [],
        classes: [],
        idrs: [],
        consumosKwh: [],
      },
    ]);
  });

  it("projeta Função do Aparelho", () => {
    const [item] = projetarConsulta(
      [
        aparelho({
          id: "ap-1",
          funcao: "Frio",
        }),
      ],
      (marca) => marca,
    );
    expect(item?.funcao).toBe("Frio");
  });

  it("deduplica e ordena Classes, IDRS e consumos, ignorando Variantes sem dado", () => {
    const [item] = projetarConsulta(
      [
        aparelho({
          id: "ap-1",
          variantes: [
            {
              tensao: { voltagens: [220], fases: ["monofásico"] },
              dados: dadosVazios({
                classe: "B",
                idrs: 4.5,
                consumoAnualKwh: 2000,
              }),
              linhas: [1],
            },
            {
              tensao: { voltagens: [127], fases: ["monofásico"] },
              dados: dadosVazios({
                classe: "A",
                idrs: 3.5,
                consumoAnualKwh: 1100,
              }),
              linhas: [2],
            },
            {
              tensao: { voltagens: [220], fases: ["monofásico"] },
              dados: dadosVazios({
                classe: "A",
                idrs: 3.5,
                consumoAnualKwh: 1100,
              }),
              linhas: [3],
            },
            {
              tensao: null,
              dados: dadosVazios(),
              linhas: [4],
            },
          ],
        }),
      ],
      (marca) => marca,
    );
    expect(item?.classes).toEqual(["A", "B"]);
    expect(item?.idrs).toEqual([3.5, 4.5]);
    expect(item?.consumosKwh).toEqual([1100, 2000]);
  });

  it("projeta a Marca de catálogo sem tocar na Marca oficial", () => {
    const itens = projetarConsulta(
      [aparelho({ id: "ap-1", marca: "SPRINGER MIDEA" })],
      (marca) => (marca === "SPRINGER MIDEA" ? "MIDEA" : marca),
    );
    expect(itens[0]?.marca).toBe("SPRINGER MIDEA");
    expect(itens[0]?.marcaCatalogo).toBe("MIDEA");
  });

  it("deduplica e ordena capacidades e tensões de todas as Variantes", () => {
    const itens = projetarConsulta(
      [
        aparelho({
          id: "ap-1",
          variantes: [
            {
              tensao: { voltagens: [220], fases: ["monofásico"] },
              dados: dadosVazios({ capacidadeNominalBtu: 10000 }),
              linhas: [1],
            },
            {
              tensao: { voltagens: [127, 220], fases: ["monofásico"] },
              dados: dadosVazios({ capacidadeNominalBtu: 9000 }),
              linhas: [2],
            },
            {
              tensao: null,
              dados: dadosVazios({ capacidadeNominalBtu: 9000 }),
              linhas: [3],
            },
          ],
        }),
      ],
      (marca) => marca,
    );
    expect(itens[0]?.capacidadesBtu).toEqual([9000, 10000]);
    expect(itens[0]?.tensoes).toEqual([127, 220]);
  });
});

describe("runBuild — artefato consulta.json", () => {
  let dataDir: string;
  let buildDir: string;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), "especialista-consulta-"));
    buildDir = join(dataDir, "build");
  });

  afterEach(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  function build() {
    return runBuild({
      dataDir,
      source: fixtureAparelhos,
      origem: "teste",
      obtidoEm: "2026-10-12",
      reportsDir: join(dataDir, "reports"),
    });
  }

  it("emite consulta.json enxuto, casando com a projeção da base servida", () => {
    const { aparelhos, consulta } = build();
    const conteudo = readFileSync(join(buildDir, "consulta.json"), "utf8");
    expect(consulta).toHaveLength(aparelhos.length);
    expect(conteudo).toBe(
      `${JSON.stringify(projetarConsulta(aparelhos, (marca) => marca))}\n`,
    );
    expect(conteudo.trimEnd().split("\n")).toHaveLength(1);
  });

  it("bate com o snapshot golden de consulta.json", () => {
    build();
    expect(
      readFileSync(join(buildDir, "consulta.json"), "utf8"),
    ).toMatchSnapshot();
  });
});
