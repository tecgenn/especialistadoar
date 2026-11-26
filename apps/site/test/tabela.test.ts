import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import {
  COLUNAS_TABELA,
  detalheDoAparelho,
  unidadeDaColuna,
  valorDaColuna,
} from "../src/lib/tabela.ts";

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
  it("lista as colunas na ordem do instrumento (tickets 43 e 72)", () => {
    expect(COLUNAS_TABELA.map((coluna) => coluna.rotulo)).toEqual([
      "Marca",
      "Modelo",
      "Capacidade",
      "Consumo",
      "IDRS",
      "Classe",
      "Tipo",
    ]);
  });

  it("dá unidade só às colunas medidas e a escreve uma vez por célula", () => {
    expect(unidadeDaColuna("btu")).toBe("BTU/h");
    expect(unidadeDaColuna("consumo")).toBe("kWh/ano");
    for (const campo of [
      "marca",
      "modelo",
      "idrs",
      "classe",
      "tipo",
    ] as const) {
      expect(unidadeDaColuna(campo)).toBeNull();
    }
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

describe("segunda linha da célula do Modelo (ticket 63)", () => {
  it("mostra Função e Tensão do Aparelho simples", () => {
    expect(
      detalheDoAparelho(item({ funcao: "Quente/Frio", tensoes: [220] })),
    ).toBe("Quente/Frio · 220 V");
  });

  it("lista as duas tensões do bivolt em ordem", () => {
    expect(
      detalheDoAparelho(item({ funcao: "Frio", tensoes: [220, 127] })),
    ).toBe("Frio · 127 · 220 V");
  });

  it("sem Função ou sem Tensão não deixa separador solto", () => {
    expect(detalheDoAparelho(item({ tensoes: [220] }))).toBe("220 V");
    expect(detalheDoAparelho(item({ funcao: "Frio" }))).toBe("Frio");
    expect(detalheDoAparelho(item({ funcao: "  ", tensoes: [] }))).toBeNull();
    expect(detalheDoAparelho(item())).toBeNull();
  });
});
