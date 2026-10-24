import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import { opcoesDe } from "../src/lib/opcoes.ts";

function item(over: Partial<ItemConsulta> = {}): ItemConsulta {
  return {
    id: "x",
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
    ...over,
    marca: over.marca ?? "X",
    marcaCatalogo: over.marcaCatalogo ?? over.marca ?? "X",
  };
}

describe("opções da consulta", () => {
  it("deduplica e ordena os valores distintos de cada campo", () => {
    const opcoes = opcoesDe([
      item({
        id: "a",
        marca: "LG",
        tipo: "Split Hi-Wall",
        capacidadesBtu: [12000, 9000],
        tensoes: [220],
      }),
      item({
        id: "b",
        marca: "LG",
        tipo: "Janela",
        capacidadesBtu: [9000],
        tensoes: [127, 220],
      }),
      item({ id: "c", marca: "GREE", capacidadesBtu: [12000] }),
    ]);

    expect(opcoes.marcas).toEqual(["GREE", "LG"]);
    expect(opcoes.tipos).toEqual(["Janela", "Split Hi-Wall"]);
    expect(opcoes.btus).toEqual([9000, 12000]);
    expect(opcoes.tensoes).toEqual([127, 220]);
  });

  it("ignora tipo ausente e marca vazia", () => {
    const opcoes = opcoesDe([
      item({ marca: "", marcaCatalogo: "", tipo: null }),
    ]);
    expect(opcoes.marcas).toEqual([]);
    expect(opcoes.tipos).toEqual([]);
  });

  it("lista a Marca de catálogo, sem repetir a mesma família", () => {
    const opcoes = opcoesDe([
      item({ id: "a", marca: "MIDEA", marcaCatalogo: "MIDEA" }),
      item({ id: "b", marca: "SPRINGER MIDEA", marcaCatalogo: "MIDEA" }),
      item({ id: "c", marca: "AIRSTAGE", marcaCatalogo: "FUJITSU" }),
    ]);
    expect(opcoes.marcas).toEqual(["FUJITSU", "MIDEA"]);
  });
});
