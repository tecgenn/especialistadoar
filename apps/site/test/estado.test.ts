import { describe, expect, it } from "vitest";
import { escreverEstado, lerEstado } from "../src/lib/estado.ts";

describe("estado da consulta na URL", () => {
  it("lê todos os parâmetros", () => {
    const estado = lerEstado(
      new URLSearchParams(
        "marca=LG&tipo=Split+Hi-Wall&btu=9000&tensao=220&q=gree",
      ),
    );
    expect(estado).toEqual({
      marca: "LG",
      tipo: "Split Hi-Wall",
      btu: 9000,
      tensao: 220,
      q: "gree",
    });
  });

  it("trata parâmetro em branco como ausência de filtro", () => {
    expect(lerEstado(new URLSearchParams("marca=&tipo=&q="))).toEqual({});
  });

  it("ignora btu e tensão inválidos", () => {
    expect(lerEstado(new URLSearchParams("btu=abc&tensao="))).toEqual({});
  });

  it("apara espaços em volta do termo", () => {
    expect(lerEstado(new URLSearchParams("q=%20gree%20"))).toEqual({
      q: "gree",
    });
  });

  it("escreve só os filtros presentes", () => {
    expect(escreverEstado({ marca: "LG", btu: 9000 }).toString()).toBe(
      "marca=LG&btu=9000",
    );
  });

  it("omite filtros em branco", () => {
    expect(escreverEstado({ marca: "  ", q: "" }).toString()).toBe("");
  });

  it("preserva o estado num round-trip", () => {
    const original = {
      marca: "GREE",
      tipo: "Split Hi-Wall",
      btu: 12000,
      tensao: 127,
      q: "inverter",
    };
    expect(lerEstado(escreverEstado(original))).toEqual(original);
  });
});
