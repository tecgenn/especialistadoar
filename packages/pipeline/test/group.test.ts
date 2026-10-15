import { describe, expect, it } from "vitest";
import { chaveIdentidade, temDadosDeclarados } from "../src/group.ts";

describe("chaveIdentidade", () => {
  it("usa marca + unid. interna + unid. externa quando as unidades vêm separadas", () => {
    expect(chaveIdentidade("GREE", "GREE-09-I", "GREE-09-E", "GREE-09")).toBe(
      chaveIdentidade("GREE", "GREE-09-I", "GREE-09-E", "SEM-UNIDADE"),
    );
  });

  it("usa o Modelo quando as unidades não vêm separadas", () => {
    expect(chaveIdentidade("GREE", null, null, "GREE-09")).toBe(
      chaveIdentidade("GREE", null, null, "GREE-09"),
    );
    expect(chaveIdentidade("GREE", null, null, "GREE-09")).not.toBe(
      chaveIdentidade("GREE", null, null, "GREE-12"),
    );
  });

  it("trata a marca sem diferenciar maiúsculas de minúsculas", () => {
    expect(chaveIdentidade("gree", null, null, "GREE-09")).toBe(
      chaveIdentidade("GREE", null, null, "GREE-09"),
    );
  });

  it("distingue marcas diferentes com o mesmo modelo", () => {
    expect(chaveIdentidade("GREE", null, null, "X")).not.toBe(
      chaveIdentidade("LG", null, null, "X"),
    );
  });
});

describe("temDadosDeclarados", () => {
  it("é falso quando todos os campos são nulos", () => {
    expect(
      temDadosDeclarados({
        capacidadeNominalBtu: null,
        capacidadeNominalW: null,
        potenciaEsperaW: null,
        capacidade35TotalW: null,
        potencia35TotalW: null,
        capacidade35ParcialW: null,
        potencia35ParcialW: null,
        capacidade29ParcialW: null,
        potencia29ParcialW: null,
        capacidade29TotalW: null,
        potencia29TotalW: null,
        idrs: null,
        consumoAnualKwh: null,
      }),
    ).toBe(false);
  });

  it("é verdadeiro quando algum campo tem valor", () => {
    expect(
      temDadosDeclarados({
        capacidadeNominalBtu: 9000,
        capacidadeNominalW: null,
        potenciaEsperaW: null,
        capacidade35TotalW: null,
        potencia35TotalW: null,
        capacidade35ParcialW: null,
        potencia35ParcialW: null,
        capacidade29ParcialW: null,
        potencia29ParcialW: null,
        capacidade29TotalW: null,
        potencia29TotalW: null,
        idrs: null,
        consumoAnualKwh: null,
      }),
    ).toBe(true);
  });
});
