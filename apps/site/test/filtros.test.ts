import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import { type FiltrosCurados, validarFiltros } from "../src/lib/filtros.ts";
import { opcoesDe } from "../src/lib/opcoes.ts";

/**
 * A curadoria dos filtros é um insumo do site (`apps/site/filtros.json`):
 * validação do contrato (rótulo, sem duplicata, capacidade inteira positiva) e
 * derivação das opções — chips na ordem curada, resto alfabético, valor curado
 * ausente da base oculto em silêncio.
 */
function item(over: Partial<ItemConsulta> = {}): ItemConsulta {
  return {
    id: "x",
    modelo: "M",
    tipo: null,
    capacidadesBtu: [],
    tensoes: [],
    ...over,
    marca: over.marca ?? "X",
    marcaCatalogo: over.marcaCatalogo ?? over.marca ?? "X",
  };
}

const dataset = [
  item({ id: "a", marcaCatalogo: "SAMSUNG", capacidadesBtu: [12000] }),
  item({ id: "b", marcaCatalogo: "LG", capacidadesBtu: [9000] }),
  item({ id: "c", marcaCatalogo: "MIDEA", capacidadesBtu: [18000] }),
  item({ id: "d", marcaCatalogo: "GREE", capacidadesBtu: [36000] }),
  item({ id: "e", marcaCatalogo: "BRITÂNIA", capacidadesBtu: [7000] }),
  item({ id: "f", marcaCatalogo: "ELGIN", capacidadesBtu: [24000] }),
];

const curadoria: FiltrosCurados = {
  marcas: [
    { valor: "MIDEA", rotulo: "Midea" },
    { valor: "LG", rotulo: "LG" },
    { valor: "SAMSUNG", rotulo: "Samsung" },
    // Curada, mas fora da base: aparece em nenhum lugar, sem quebrar o build.
    { valor: "AUSENTE", rotulo: "Ausente" },
  ],
  btus: [24000, 9000, 12000],
};

describe("validação da curadoria dos filtros", () => {
  it("aceita o contrato com marcas rotuladas e capacidades", () => {
    expect(validarFiltros(curadoria)).toEqual({
      marcas: [
        { valor: "MIDEA", rotulo: "Midea" },
        { valor: "LG", rotulo: "LG" },
        { valor: "SAMSUNG", rotulo: "Samsung" },
        { valor: "AUSENTE", rotulo: "Ausente" },
      ],
      btus: [24000, 9000, 12000],
    });
  });

  it("aceita listas vazias (curadoria opcional)", () => {
    expect(validarFiltros({ marcas: [], btus: [] })).toEqual({
      marcas: [],
      btus: [],
    });
  });

  it("recusa rótulo ou valor em branco", () => {
    expect(() =>
      validarFiltros({ marcas: [{ valor: "MIDEA", rotulo: " " }], btus: [] }),
    ).toThrow(/rotulo/);
    expect(() =>
      validarFiltros({ marcas: [{ valor: "", rotulo: "Midea" }], btus: [] }),
    ).toThrow(/valor/);
  });

  it("recusa marca duplicada, inclusive por caixa", () => {
    expect(() =>
      validarFiltros({
        marcas: [
          { valor: "MIDEA", rotulo: "Midea" },
          { valor: "midea", rotulo: "Midea (2)" },
        ],
        btus: [],
      }),
    ).toThrow(/duplicada/i);
  });

  it("recusa dois chips com o mesmo rótulo", () => {
    expect(() =>
      validarFiltros({
        marcas: [
          { valor: "MIDEA", rotulo: "Midea" },
          { valor: "SPRINGER MIDEA", rotulo: "midea" },
        ],
        btus: [],
      }),
    ).toThrow(/rótulo/i);
  });

  it("recusa capacidade que não seja inteiro positivo e capacidade repetida", () => {
    for (const btu of [0, -12000, 12000.5, Number.NaN]) {
      expect(() => validarFiltros({ marcas: [], btus: [btu] })).toThrow(
        /capacidade/i,
      );
    }
    expect(() => validarFiltros({ marcas: [], btus: [9000, 9000] })).toThrow(
      /duplicada/i,
    );
  });

  it("recusa uma lista que não seja lista", () => {
    expect(() =>
      validarFiltros({ marcas: "MIDEA", btus: [] } as unknown),
    ).toThrow(/lista/i);
  });
});

describe("opções com a curadoria dos chips", () => {
  it("põe as marcas conhecidas na ordem curada e o resto alfabético", () => {
    const opcoes = opcoesDe(dataset, curadoria);

    expect(opcoes.marcasChip).toEqual([
      { valor: "MIDEA", rotulo: "Midea" },
      { valor: "LG", rotulo: "LG" },
      { valor: "SAMSUNG", rotulo: "Samsung" },
    ]);
    expect(opcoes.marcas).toEqual(["BRITÂNIA", "ELGIN", "GREE"]);
  });

  it("separa as capacidades comuns (crescentes) das demais (crescentes)", () => {
    const opcoes = opcoesDe(dataset, curadoria);

    expect(opcoes.btusChip).toEqual([9000, 12000, 24000]);
    expect(opcoes.btus).toEqual([7000, 18000, 36000]);
  });

  it("esconde em silêncio o valor curado que não existe na base", () => {
    const opcoes = opcoesDe(dataset, curadoria);
    expect(opcoes.marcasChip.map((marca) => marca.valor)).not.toContain(
      "AUSENTE",
    );
    expect(opcoes.marcas).not.toContain("AUSENTE");
    expect(opcoes.btusChip).not.toContain(22000);
  });

  it("sem curadoria, o filtro é o de hoje: tudo no select, nenhum chip", () => {
    const opcoes = opcoesDe(dataset);

    expect(opcoes.marcasChip).toEqual([]);
    expect(opcoes.btusChip).toEqual([]);
    expect(opcoes.marcas).toEqual([
      "BRITÂNIA",
      "ELGIN",
      "GREE",
      "LG",
      "MIDEA",
      "SAMSUNG",
    ]);
    expect(opcoes.btus).toEqual([7000, 9000, 12000, 18000, 24000, 36000]);
  });
});
