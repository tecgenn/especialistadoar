import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import type { FiltrosCurados } from "../src/lib/filtros.ts";
import { opcoesDe } from "../src/lib/opcoes.ts";
import { resumoDosFiltros } from "../src/lib/resumo-filtros.ts";

const itens: ItemConsulta[] = [
  {
    id: "midea",
    marca: "SPRINGER MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Xtreme Save",
    tipo: "Split Hi-Wall",
    funcao: "Quente/Frio",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["A"],
    idrs: [4],
    consumosKwh: [200],
  },
];

const curadoria: FiltrosCurados = {
  marcas: [{ valor: "MIDEA", rotulo: "Midea" }],
  btus: [12000],
  classes: [{ valor: "A", rotulo: "Classe A" }],
};

const opcoes = opcoesDe(itens, curadoria);

describe("resumo do recorte efetivo (ticket 50)", () => {
  it("mostra o padrão implícito de Tensão 220 V", () => {
    expect(resumoDosFiltros({ tensao: 220 }, opcoes)).toEqual([
      {
        campo: "tensao",
        rotulo: "Tensão: 220 V",
        remover: "Remover filtro Tensão: 220 V",
      },
    ]);
  });

  it("devolve lista vazia quando o padrão está desligado e não há filtro", () => {
    expect(resumoDosFiltros({}, opcoes)).toEqual([]);
  });

  it("resume todos os filtros na ordem de leitura, com rótulos legíveis", () => {
    expect(
      resumoDosFiltros(
        {
          q: "inverter",
          marca: "MIDEA",
          btu: 12000,
          funcao: "Quente/Frio",
          tensao: 220,
          tipo: "Split Hi-Wall",
          classe: "A",
        },
        opcoes,
      ).map((filtro) => filtro.rotulo),
    ).toEqual([
      "Busca: inverter",
      "Marca: Midea",
      "Capacidade: 12.000 BTU/h",
      "Função: Quente/Frio",
      "Tensão: 220 V",
      "Tipo: Split Hi-Wall",
      "Classe: A",
    ]);
  });

  it("usa o valor oficial da Marca quando ela está fora da curadoria", () => {
    expect(
      resumoDosFiltros({ marca: "SPRINGER MIDEA" }, opcoes)[0]?.rotulo,
    ).toBe("Marca: SPRINGER MIDEA");
  });

  it("ignora valores em branco (ausência de filtro)", () => {
    expect(
      resumoDosFiltros({ q: "  ", marca: "", tipo: "  " }, opcoes),
    ).toEqual([]);
  });
});
