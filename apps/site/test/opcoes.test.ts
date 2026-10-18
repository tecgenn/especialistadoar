import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import { opcoesDe } from "../src/lib/opcoes.ts";

function item(over: Partial<ItemConsulta>): ItemConsulta {
  return {
    id: "x",
    marca: "X",
    modelo: "M",
    tipo: null,
    capacidadesBtu: [],
    tensoes: [],
    ...over,
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
    const opcoes = opcoesDe([item({ marca: "", tipo: null })]);
    expect(opcoes.marcas).toEqual([]);
    expect(opcoes.tipos).toEqual([]);
  });
});
