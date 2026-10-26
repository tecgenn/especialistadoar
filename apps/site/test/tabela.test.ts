import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import { COLUNAS_TABELA, valorDaColuna } from "../src/lib/tabela.ts";

function item(over: Partial<ItemConsulta> = {}): ItemConsulta {
  return {
    id: "x",
    marca: "X",
    marcaCatalogo: "X",
    modelo: "M",
    tipo: null,
    situacao: "ativo",
    funcao: null,
    rotacao: null,
    capacidadesBtu: [],
    tensoes: [],
    classes: [],
    idrs: [],
    consumosKwh: [],
    suspeito: false,
    ...over,
  };
}

describe("colunas da tabela de Aparelhos", () => {
  it("lista as colunas na ordem da tabela, com os mesmos campos da ordenação", () => {
    expect(COLUNAS_TABELA.map((coluna) => coluna.rotulo)).toEqual([
      "Marca",
      "Modelo",
      "BTU/h",
      "Consumo (kWh/ano)",
      "IDRS",
      "Classe",
      "Tipo",
      "Situação",
    ]);
  });

  it("mostra a Marca de catálogo e a Situação legível", () => {
    const aparelho = item({
      marca: "SPRINGER MIDEA",
      marcaCatalogo: "MIDEA",
      situacao: "inativo",
    });
    expect(valorDaColuna(aparelho, "marca")).toBe("MIDEA");
    expect(valorDaColuna(aparelho, "situacao")).toBe("Inativo");
  });

  it("mostra faixa quando a lista tem mais de um valor", () => {
    const aparelho = item({
      capacidadesBtu: [9000, 12000],
      consumosKwh: [100, 200],
      idrs: [3.5],
    });
    expect(valorDaColuna(aparelho, "btu")).toBe("9.000 – 12.000");
    expect(valorDaColuna(aparelho, "consumo")).toBe("100 – 200");
    expect(valorDaColuna(aparelho, "idrs")).toBe("3,5");
  });

  it("junta as Classes e marca dado ausente com travessão", () => {
    expect(valorDaColuna(item({ classes: ["A", "B"] }), "classe")).toBe("A, B");
    expect(valorDaColuna(item(), "classe")).toBe("—");
    expect(valorDaColuna(item(), "btu")).toBe("—");
    expect(valorDaColuna(item(), "tipo")).toBe("—");
  });
});
