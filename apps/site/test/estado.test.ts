import { describe, expect, it } from "vitest";
import {
  escreverEstado,
  FILTROS_PADRAO,
  lerEstado,
  temFiltroAtivo,
} from "../src/lib/estado.ts";

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

  it("normaliza a marca para maiúsculas (o filtro não diferencia caixa)", () => {
    expect(lerEstado(new URLSearchParams("marca=springer+midea"))).toEqual({
      marca: "SPRINGER MIDEA",
    });
  });

  it("escreve só os filtros presentes", () => {
    expect(escreverEstado({ marca: "LG", btu: 9000 }).toString()).toBe(
      "marca=LG&btu=9000",
    );
  });

  it("registra explicitamente um estado sem filtros", () => {
    expect(escreverEstado({ marca: "  ", q: "" }).toString()).toBe(
      "tipo=&tensao=&classe=",
    );
  });

  it("preserva o estado num round-trip", () => {
    const original = {
      marca: "GREE",
      tipo: "Split Hi-Wall",
      btu: 12000,
      tensao: 127,
      funcao: "Frio",
      classe: "A",
      q: "inverter",
      ordem: "idrs",
      dir: "desc",
    } as const;
    expect(lerEstado(escreverEstado(original))).toEqual(original);
  });

  it("lê os filtros novos e a ordenação", () => {
    expect(
      lerEstado(
        new URLSearchParams("funcao=Frio&classe=a&ordem=consumo&dir=desc"),
      ),
    ).toEqual({
      funcao: "Frio",
      classe: "A",
      ordem: "consumo",
      dir: "desc",
    });
  });

  it("ignora ordenação inválida, sem quebrar a consulta", () => {
    expect(
      lerEstado(new URLSearchParams("tipo=Janela&ordem=preco&dir=subindo")),
    ).toEqual({ tipo: "Janela" });
  });

  it("não escreve filtros novos vazios", () => {
    expect(
      escreverEstado({
        funcao: " ",
        classe: "",
      }).toString(),
    ).toBe("tipo=&tensao=&classe=");
  });
});

describe("filtros padrão (ticket 38)", () => {
  it("aplica o padrão quando a URL não traz nenhum filtro", () => {
    expect(lerEstado(new URLSearchParams(""))).toEqual(FILTROS_PADRAO);
  });

  it("aplica o padrão quando a URL só traz ordenação", () => {
    expect(lerEstado(new URLSearchParams("ordem=idrs&dir=desc"))).toEqual({
      ...FILTROS_PADRAO,
      ordem: "idrs",
      dir: "desc",
    });
  });

  it("não sobrepõe o padrão a um link com filtro próprio", () => {
    expect(lerEstado(new URLSearchParams("marca=LG"))).toEqual({ marca: "LG" });
  });

  it("respeita uma URL que esvaziou os filtros do padrão", () => {
    expect(lerEstado(new URLSearchParams("tipo=&tensao=&classe="))).toEqual({});
  });

  it("não escreve o padrão na URL", () => {
    expect(escreverEstado(FILTROS_PADRAO).toString()).toBe("");
  });

  it("escreve só a ordenação quando o estado é o padrão ordenado", () => {
    expect(
      escreverEstado({
        ...FILTROS_PADRAO,
        ordem: "consumo",
        dir: "desc",
      }).toString(),
    ).toBe("ordem=consumo&dir=desc");
  });

  it("escreve o estado sem filtros de forma explícita", () => {
    expect(escreverEstado({}).toString()).toBe("tipo=&tensao=&classe=");
  });

  it("preserva o round-trip do padrão, do vazio e de um estado misto", () => {
    const estados = [
      FILTROS_PADRAO,
      { ...FILTROS_PADRAO, ordem: "btu" as const },
      {},
      { ...FILTROS_PADRAO, marca: "LG" },
      { tipo: "Split Hi-Wall" },
    ];
    for (const estado of estados) {
      expect(lerEstado(escreverEstado(estado))).toEqual(estado);
    }
  });

  it("só considera filtro ativo o que difere do padrão (a ordenação não conta)", () => {
    expect(temFiltroAtivo(FILTROS_PADRAO)).toBe(false);
    expect(temFiltroAtivo({ ...FILTROS_PADRAO, ordem: "consumo" })).toBe(false);
    expect(temFiltroAtivo({})).toBe(true);
    expect(temFiltroAtivo({ ...FILTROS_PADRAO, marca: "LG" })).toBe(true);
    expect(temFiltroAtivo({ tipo: "Split Hi-Wall" })).toBe(true);
  });
});
