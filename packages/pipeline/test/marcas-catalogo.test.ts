import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import type { Aparelho } from "../src/aparelho.ts";
import { runBuild } from "../src/build.ts";
import type { ItemConsulta } from "../src/consulta.ts";
import {
  ARQUIVO_MARCAS_CATALOGO,
  lerMarcasCatalogo,
  type MarcaCatalogo,
  montarMarcaCatalogo,
  validarMarcasCatalogo,
} from "../src/marcas-catalogo.ts";

const fixtureAparelhos = fileURLToPath(
  new URL("./fixtures/amostra-aparelhos.csv", import.meta.url),
);

function entrada(overrides: Partial<MarcaCatalogo> = {}): MarcaCatalogo {
  return {
    marca: "SPRINGER MIDEA",
    catalogo: "MIDEA",
    motivo: "família comercial Midea",
    fonte: "coluna Marca da exportação do INMETRO",
    ...overrides,
  };
}

describe("validarMarcasCatalogo", () => {
  it("aceita uma Marca de catálogo com motivo e fonte", () => {
    expect(() => validarMarcasCatalogo([entrada()])).not.toThrow();
  });

  it("exige motivo registrado", () => {
    expect(() => validarMarcasCatalogo([entrada({ motivo: "  " })])).toThrow(
      /motivo/,
    );
  });

  it("exige fonte registrada", () => {
    expect(() => validarMarcasCatalogo([entrada({ fonte: "" })])).toThrow(
      /fonte/,
    );
  });

  it("exige marca e catálogo não vazios", () => {
    expect(() => validarMarcasCatalogo([entrada({ marca: " " })])).toThrow(
      /não vazios/,
    );
    expect(() => validarMarcasCatalogo([entrada({ catalogo: "" })])).toThrow(
      /não vazios/,
    );
  });

  it("recusa alias para a própria marca", () => {
    expect(() =>
      validarMarcasCatalogo([entrada({ catalogo: "SPRINGER MIDEA" })]),
    ).toThrow(/si mesma/);
  });

  it("recusa duas entradas para a mesma Marca oficial", () => {
    expect(() =>
      validarMarcasCatalogo([entrada(), entrada({ catalogo: "FUJITSU" })]),
    ).toThrow(/repetida/);
  });

  it("recusa registro que viola o contrato", () => {
    expect(() =>
      validarMarcasCatalogo([entrada({ marca: 1 as unknown as string })]),
    ).toThrow(/contrato/);
  });
});

describe("montarMarcaCatalogo — a projeção da Marca de catálogo", () => {
  const marcas = ["MIDEA", "SPRINGER MIDEA", "LG"];

  it("agrupa a marca oficial sob a Marca de catálogo", () => {
    const resolver = montarMarcaCatalogo([entrada()], marcas);
    expect(resolver("SPRINGER MIDEA")).toBe("MIDEA");
  });

  it("mantém a própria marca quando não há alias", () => {
    const resolver = montarMarcaCatalogo([entrada()], marcas);
    expect(resolver("MIDEA")).toBe("MIDEA");
    expect(resolver("LG")).toBe("LG");
  });

  it("ignora alias cuja marca não está na Versão da tabela", () => {
    const resolver = montarMarcaCatalogo(
      [entrada({ marca: "AIRSTAGE", catalogo: "FUJITSU" })],
      marcas,
    );
    expect(resolver("AIRSTAGE")).toBe("AIRSTAGE");
  });

  it("aceita uma Marca de catálogo que não é marca oficial da tabela", () => {
    const resolver = montarMarcaCatalogo(
      [entrada({ marca: "AIRSTAGE", catalogo: "FUJITSU" })],
      ["AIRSTAGE", "FUJITSU/AIRSTAGE"],
    );
    expect(resolver("AIRSTAGE")).toBe("FUJITSU");
  });

  it("não segue cadeia: o catálogo é o nome final exibido", () => {
    const resolver = montarMarcaCatalogo(
      [
        entrada({ marca: "SPRINGER MIDEA", catalogo: "MIDEA" }),
        entrada({ marca: "MIDEA", catalogo: "LG" }),
      ],
      marcas,
    );
    expect(resolver("SPRINGER MIDEA")).toBe("MIDEA");
    expect(resolver("MIDEA")).toBe("LG");
  });
});

describe("runBuild — Marca de catálogo", () => {
  let dataDir: string;

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

  it("projeta a Marca de catálogo no consulta.json sem tocar na base servida", () => {
    dataDir = mkdtempSync(join(tmpdir(), "especialista-marcas-"));
    // No fixture, KENNEDY é a marca que o catálogo agrupa sob LG.
    writeFileSync(
      join(dataDir, ARQUIVO_MARCAS_CATALOGO),
      `${JSON.stringify(entrada({ marca: "KENNEDY", catalogo: "LG" }))}\n`,
    );

    const { aparelhos } = build();
    const consulta = JSON.parse(
      readFileSync(join(dataDir, "build", "consulta.json"), "utf8"),
    ) as ItemConsulta[];
    const servida = JSON.parse(
      readFileSync(join(dataDir, "build", "aparelhos.json"), "utf8"),
    ) as Aparelho[];

    const kennedy = consulta.find((item) => item.marca === "KENNEDY");
    expect(kennedy?.marcaCatalogo).toBe("LG");
    // A projeção é a única superfície com a Marca de catálogo.
    expect(consulta.every((item) => item.marcaCatalogo !== undefined)).toBe(
      true,
    );
    expect(servida.map((aparelho) => aparelho.marca)).toEqual(
      aparelhos.map((aparelho) => aparelho.marca),
    );
    expect(servida.some((aparelho) => aparelho.marca === "KENNEDY")).toBe(true);
  });

  it("republica a curadoria como cópia derivada em data/build", () => {
    dataDir = mkdtempSync(join(tmpdir(), "especialista-marcas-"));
    const curadoria = entrada({ marca: "KENNEDY", catalogo: "LG" });
    writeFileSync(
      join(dataDir, ARQUIVO_MARCAS_CATALOGO),
      `${JSON.stringify(curadoria)}\n`,
    );

    const { marcasCatalogo } = build();

    expect(marcasCatalogo).toEqual([curadoria]);
    expect(lerMarcasCatalogo(join(dataDir, "build"))).toEqual([curadoria]);
  });

  it("ignora alias órfão sem quebrar o build", () => {
    dataDir = mkdtempSync(join(tmpdir(), "especialista-marcas-"));
    const linhas = [
      entrada({ marca: "KENNEDY", catalogo: "LG" }),
      entrada({ marca: "NAO EXISTE", catalogo: "GREE" }),
    ];
    writeFileSync(
      join(dataDir, ARQUIVO_MARCAS_CATALOGO),
      `${linhas.map((linha) => JSON.stringify(linha)).join("\n")}\n`,
    );

    const { consulta } = build();
    const catalogoPorMarca = new Map(
      consulta.map((item) => [item.marca, item.marcaCatalogo]),
    );

    // A entrada válida continua valendo; a órfã não cria marca nenhuma.
    expect(catalogoPorMarca.get("KENNEDY")).toBe("LG");
    expect(catalogoPorMarca.get("GREE")).toBe("GREE");
    expect(
      [...new Set(consulta.map((item) => item.marcaCatalogo))].sort(),
    ).toEqual(["GREE", "LG"]);
  });
});
