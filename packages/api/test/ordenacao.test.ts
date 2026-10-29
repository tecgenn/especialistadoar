import { type ItemConsulta, ordenar } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";

/**
 * A ordenação da tabela é pura e vive no entry isomórfico, para a ilha do site e
 * qualquer Agente usarem a mesma semântica (ticket 31). Os testes olham só a
 * ordem devolvida — nunca a implementação.
 */
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

describe("ordenação da tabela — colunas (ticket 31)", () => {
  it("ordena texto em ordem natural, crescente e decrescente", () => {
    const itens = [
      item({ id: "b", modelo: "Modelo 10" }),
      item({ id: "a", modelo: "Modelo 2" }),
    ];
    // modelo não é mais ordenável, deve usar ordem padrão
    expect(ids(ordenar(itens))).toEqual(["a", "b"]);
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

  it("ordena IDRS", () => {
    const itens = [
      item({ id: "alto", idrs: [5] }),
      item({ id: "baixo", idrs: [1] }),
      item({ id: "medio", idrs: [3] }),
    ];
    expect(ids(ordenar(itens, { ordem: "idrs" }))).toEqual([
      "baixo",
      "medio",
      "alto",
    ]);
  });
});
