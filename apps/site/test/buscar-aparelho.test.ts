import { describe, expect, it } from "vitest";
import {
  type AparelhoBuscavel,
  buscarAparelhos,
  renderizarAparelhosEncontrados,
} from "../src/lib/buscar-aparelho.ts";

function aparelho(
  id: string,
  marca: string,
  modelo: string,
  ...capacidadesBtu: Array<number | null>
): AparelhoBuscavel {
  return {
    id,
    marca,
    modelo,
    variantes: capacidadesBtu.map((capacidadeNominalBtu) => ({
      dados: { capacidadeNominalBtu },
    })),
  };
}

const base: AparelhoBuscavel[] = [
  aparelho("ap-000000000001", "BRITÂNIA", "FBN12", 12000, 12000, null),
  aparelho("ap-000000000002", "GREE", "GJC07BK-A3NRND2A", 7500),
  aparelho("ap-000000000003", "MIDEA", "M-27000", 27000),
];

describe("buscarAparelhos", () => {
  it("casa por marca, ignorando caixa e acento", () => {
    expect(buscarAparelhos(base, "britania").map((a) => a.id)).toEqual([
      "ap-000000000001",
    ]);
    expect(buscarAparelhos(base, "BRITÂNIA").map((a) => a.id)).toEqual([
      "ap-000000000001",
    ]);
  });

  it("casa por modelo (trecho, sem caixa)", () => {
    expect(buscarAparelhos(base, "gjc07").map((a) => a.id)).toEqual([
      "ap-000000000002",
    ]);
  });

  it("casa por potência em BTU, com ou sem separador de milhar", () => {
    expect(buscarAparelhos(base, "12000").map((a) => a.id)).toEqual([
      "ap-000000000001",
    ]);
    expect(buscarAparelhos(base, "12.000").map((a) => a.id)).toEqual([
      "ap-000000000001",
    ]);
    expect(buscarAparelhos(base, "27000 BTU").map((a) => a.id)).toEqual([
      "ap-000000000003",
    ]);
    expect(buscarAparelhos(base, "27000 BTUs").map((a) => a.id)).toEqual([
      "ap-000000000003",
    ]);
  });

  it("devolve lista vazia quando nada casa", () => {
    expect(buscarAparelhos(base, "samsung")).toEqual([]);
  });

  it("projeta potências únicas e ordenadas, descartando ausentes", () => {
    const [britania] = buscarAparelhos(base, "britania");
    expect(britania).toEqual({
      id: "ap-000000000001",
      marca: "BRITÂNIA",
      modelo: "FBN12",
      potenciasBtu: [12000],
    });
  });

  it("ignora termo em branco", () => {
    expect(buscarAparelhos(base, "   ")).toEqual([]);
  });
});

describe("renderizarAparelhosEncontrados", () => {
  it("lista marca, modelo, potência e id de cada Aparelho", () => {
    const saida = renderizarAparelhosEncontrados(
      "12000",
      buscarAparelhos(base, "12000"),
    );
    expect(saida).toContain("1 Aparelho encontrado");
    expect(saida).toContain("BRITÂNIA");
    expect(saida).toContain("FBN12");
    expect(saida).toContain("12.000 BTU");
    expect(saida).toContain("ap-000000000001");
  });

  it("imprime mensagem clara quando não há resultado", () => {
    const saida = renderizarAparelhosEncontrados("samsung", []);
    expect(saida).toContain('Nenhum Aparelho encontrado para "samsung"');
  });
});
