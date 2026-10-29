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
    funcao: null,
    capacidadesBtu: [],
    tensoes: [],
    classes: [],
    idrs: [],
    consumosKwh: [],
    ...over,
  };
}

describe("colunas da tabela de Aparelhos", () => {
  it("lista as colunas na ordem da tabela (ticket 31)", () => {
    expect(COLUNAS_TABELA.map((coluna) => coluna.rotulo)).toEqual([
      "Marca",
      "Modelo",
      "BTU/h",
      "Consumo (kWh)",
      "IDRS",
      "Classe",
    ]);
  });

  it("mostra a Marca de catálogo", () => {
    const aparelho = item({
      marca: "SPRINGER MIDEA",
      marcaCatalogo: "MIDEA",
    });
    expect(valorDaColuna(aparelho, "marca")).toBe("MIDEA");
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

  it("junta as Classes com rótulo amigável e marca dado ausente com travessão", () => {
    expect(valorDaColuna(item({ classes: ["A", "B"] }), "classe")).toBe(
      "Classe A, Classe B",
    );
    expect(valorDaColuna(item(), "classe")).toBe("—");
    expect(valorDaColuna(item(), "btu")).toBe("—");
    expect(valorDaColuna(item(), "tipo")).toBe("—");
    expect(valorDaColuna(item(), "funcao")).toBe("—");
  });
});
