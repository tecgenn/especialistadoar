import { type ItemConsulta, ordenar } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";

/**
 * A ordenação da tabela é pura e vive no entry isomórfico, para a ilha do site e
 * qualquer Agente usarem a mesma semântica (ticket 27). Os testes olham só a
 * ordem devolvida — nunca a implementação.
 */
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

const ids = (itens: ItemConsulta[]) => itens.map((entrada) => entrada.id);

describe("ordenação da tabela — padrão", () => {
  it("ordena A–Z pela Marca de catálogo e depois pelo modelo, com número natural", () => {
    const itens = [
      item({ id: "z", marcaCatalogo: "SAMSUNG", modelo: "Modelo 10" }),
      item({ id: "a", marcaCatalogo: "GREE", modelo: "Modelo 2" }),
      item({ id: "b", marcaCatalogo: "GREE", modelo: "Modelo 10" }),
      item({ id: "m", marcaCatalogo: "MIDEA", modelo: "Xtreme" }),
    ];
    expect(ids(ordenar(itens))).toEqual(["a", "b", "m", "z"]);
  });

  it("mantém MIDEA e SPRINGER MIDEA juntos pela Marca de catálogo", () => {
    const itens = [
      item({ id: "springer", marcaCatalogo: "MIDEA", modelo: "Springer" }),
      item({ id: "lg", marcaCatalogo: "LG", modelo: "Dual" }),
      item({ id: "midea", marcaCatalogo: "MIDEA", modelo: "Xtreme" }),
      item({ id: "gree", marcaCatalogo: "GREE", modelo: "G-Top" }),
    ];
    expect(ids(ordenar(itens))).toEqual(["gree", "lg", "springer", "midea"]);
  });
});

describe("ordenação da tabela — colunas", () => {
  it("ordena texto em ordem natural, crescente e decrescente", () => {
    const itens = [
      item({ id: "b", modelo: "Modelo 10" }),
      item({ id: "a", modelo: "Modelo 2" }),
    ];
    expect(ids(ordenar(itens, { ordem: "modelo" }))).toEqual(["a", "b"]);
    expect(ids(ordenar(itens, { ordem: "modelo", dir: "desc" }))).toEqual([
      "b",
      "a",
    ]);
  });

  it("usa o menor valor da lista para crescente e o maior para decrescente", () => {
    const itens = [
      item({ id: "faixa", capacidadesBtu: [9000, 12000] }),
      item({ id: "meio", capacidadesBtu: [10000] }),
    ];
    expect(ids(ordenar(itens, { ordem: "btu" }))).toEqual(["faixa", "meio"]);
    expect(ids(ordenar(itens, { ordem: "btu", dir: "desc" }))).toEqual([
      "faixa",
      "meio",
    ]);
  });

  it("coloca quem não declara o valor no fim, nas duas direções", () => {
    const itens = [
      item({ id: "vazio", consumosKwh: [] }),
      item({ id: "alto", consumosKwh: [900] }),
      item({ id: "baixo", consumosKwh: [100] }),
    ];
    expect(ids(ordenar(itens, { ordem: "consumo" }))).toEqual([
      "baixo",
      "alto",
      "vazio",
    ]);
    expect(ids(ordenar(itens, { ordem: "consumo", dir: "desc" }))).toEqual([
      "alto",
      "baixo",
      "vazio",
    ]);
  });

  it("ordena Classe pela lista, crescendo pela menor e decrescendo pela maior", () => {
    const itens = [
      item({ id: "ab", classes: ["A", "B"] }),
      item({ id: "b", classes: ["B"] }),
      item({ id: "c", classes: ["C"] }),
    ];
    expect(ids(ordenar(itens, { ordem: "classe" }))).toEqual(["ab", "b", "c"]);
    expect(ids(ordenar(itens, { ordem: "classe", dir: "desc" }))).toEqual([
      "c",
      "ab",
      "b",
    ]);
  });

  it("coloca os suspeitos no fim nas ordenações por IDRS e consumo", () => {
    const porConsumo = [
      item({ id: "suspeito", consumosKwh: [1], suspeito: true }),
      item({ id: "alto", consumosKwh: [900] }),
      item({ id: "baixo", consumosKwh: [100] }),
    ];
    expect(ids(ordenar(porConsumo, { ordem: "consumo" }))).toEqual([
      "baixo",
      "alto",
      "suspeito",
    ]);
    expect(ids(ordenar(porConsumo, { ordem: "consumo", dir: "desc" }))).toEqual(
      ["alto", "baixo", "suspeito"],
    );

    const porIdrs = [
      item({ id: "suspeito", idrs: [9], suspeito: true }),
      item({ id: "alto", idrs: [5] }),
      item({ id: "baixo", idrs: [1] }),
    ];
    expect(ids(ordenar(porIdrs, { ordem: "idrs" }))).toEqual([
      "baixo",
      "alto",
      "suspeito",
    ]);
  });

  it("ordena Tipo e Situação como texto", () => {
    const itens = [
      item({ id: "janela", tipo: "Janela", situacao: "inativo" }),
      item({ id: "split", tipo: "Split Hi-Wall", situacao: "ativo" }),
    ];
    expect(ids(ordenar(itens, { ordem: "tipo" }))).toEqual(["janela", "split"]);
    expect(ids(ordenar(itens, { ordem: "situacao" }))).toEqual([
      "split",
      "janela",
    ]);
  });
});
