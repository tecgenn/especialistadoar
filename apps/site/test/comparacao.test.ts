import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import {
  escreverIds,
  lerIds,
  linhasDaComparacao,
  MAXIMO_COMPARACAO,
  resumoDaSugestao,
  valorDaComparacao,
} from "../src/lib/comparacao.ts";

function item(over: Partial<ItemConsulta> = {}): ItemConsulta {
  return {
    id: "ap-aaaaaaaaaaaa",
    marca: "MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Xtreme Save",
    tipo: "Split Hi-Wall",
    funcao: "Frio",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["A"],
    idrs: [5.5],
    consumosKwh: [300],
    ...over,
  };
}

const conhecidos = new Set([
  "ap-aaaaaaaaaaaa",
  "ap-bbbbbbbbbbbb",
  "ap-cccccccccccc",
  "ap-dddddddddddd",
]);

describe("contrato `ids` da Comparação", () => {
  it("preserva a ordem da URL", () => {
    const lidos = lerIds(
      new URLSearchParams("ids=ap-cccccccccccc,ap-aaaaaaaaaaaa"),
      conhecidos,
    );
    expect(lidos).toEqual({
      ids: ["ap-cccccccccccc", "ap-aaaaaaaaaaaa"],
      descartados: 0,
    });
  });

  it("aplica o limite de 3 e conta o que passa dele", () => {
    const lidos = lerIds(
      new URLSearchParams(
        "ids=ap-aaaaaaaaaaaa,ap-bbbbbbbbbbbb,ap-cccccccccccc,ap-dddddddddddd",
      ),
      conhecidos,
    );
    expect(lidos.ids).toHaveLength(MAXIMO_COMPARACAO);
    expect(lidos.descartados).toBe(1);
  });

  it("descarta repetidos e desconhecidos, contando cada descarte", () => {
    const lidos = lerIds(
      new URLSearchParams(
        "ids=ap-aaaaaaaaaaaa,ap-aaaaaaaaaaaa,ap-ffffffffffff,ap-bbbbbbbbbbbb",
      ),
      conhecidos,
    );
    expect(lidos.ids).toEqual(["ap-aaaaaaaaaaaa", "ap-bbbbbbbbbbbb"]);
    expect(lidos.descartados).toBe(2);
  });

  it("ignora item vazio e ids ausente ou em branco", () => {
    expect(lerIds(new URLSearchParams(""), conhecidos)).toEqual({
      ids: [],
      descartados: 0,
    });
    expect(lerIds(new URLSearchParams("ids="), conhecidos)).toEqual({
      ids: [],
      descartados: 0,
    });
    expect(
      lerIds(
        new URLSearchParams("ids=ap-aaaaaaaaaaaa,,ap-bbbbbbbbbbbb"),
        conhecidos,
      ),
    ).toEqual({
      ids: ["ap-aaaaaaaaaaaa", "ap-bbbbbbbbbbbb"],
      descartados: 0,
    });
  });

  it("escreve a chave separada dos filtros, com ordem, limite e sem vazios", () => {
    expect(escreverIds(["ap-bbbbbbbbbbbb", "ap-aaaaaaaaaaaa"]).toString()).toBe(
      "ids=ap-bbbbbbbbbbbb%2Cap-aaaaaaaaaaaa",
    );
    expect(escreverIds([]).toString()).toBe("");
    expect(
      escreverIds([
        "ap-aaaaaaaaaaaa",
        "ap-aaaaaaaaaaaa",
        "",
        "ap-bbbbbbbbbbbb",
        "ap-cccccccccccc",
        "ap-dddddddddddd",
      ]).toString(),
    ).toBe("ids=ap-aaaaaaaaaaaa%2Cap-bbbbbbbbbbbb%2Cap-cccccccccccc");
  });

  it("reconstrói a seleção a partir do que escreveu", () => {
    const ids = ["ap-cccccccccccc", "ap-aaaaaaaaaaaa"];
    expect(lerIds(escreverIds(ids), conhecidos).ids).toEqual(ids);
  });
});

describe("linhas da matriz de Comparação", () => {
  it("compara Tipo, Função, Capacidade, Tensão, Consumo anual, IDRS e Classe", () => {
    const linhas = linhasDaComparacao([item()]);
    expect(linhas.map((linha) => linha.rotulo)).toEqual([
      "Tipo",
      "Função",
      "Capacidade",
      "Tensão",
      "Consumo anual",
      "IDRS",
      "Classe",
    ]);
  });

  it("mostra marca, modelo e tipo como vieram, e faixa quando há mais de uma Variante", () => {
    const a = item({
      capacidadesBtu: [9000, 12000],
      tensoes: [127, 220],
      consumosKwh: [200, 300],
      idrs: [4.5, 5.5],
      classes: ["A", "B"],
    });
    expect(valorDaComparacao(a, "tipo")).toBe("Split Hi-Wall");
    expect(valorDaComparacao(a, "funcao")).toBe("Frio");
    expect(valorDaComparacao(a, "capacidade")).toBe("9.000 – 12.000 BTU/h");
    expect(valorDaComparacao(a, "tensao")).toBe("127 – 220 V");
    expect(valorDaComparacao(a, "consumo")).toBe("200 – 300 kWh");
    expect(valorDaComparacao(a, "idrs")).toBe("4,5 – 5,5");
    expect(valorDaComparacao(a, "classe")).toBe("Classe A, Classe B");
  });

  it("marca dado ausente com travessão e não muda a forma da matriz", () => {
    const vazio = item({
      tipo: null,
      funcao: null,
      capacidadesBtu: [],
      tensoes: [],
      consumosKwh: [],
      idrs: [],
      classes: [],
    });
    expect(
      linhasDaComparacao([vazio]).map((linha) => linha.valores[0]),
    ).toEqual(["—", "—", "—", "—", "—", "—", "—"]);
  });

  it("alinha um valor por Aparelho, na ordem das colunas", () => {
    const linhas = linhasDaComparacao([
      item({ id: "ap-bbbbbbbbbbbb", modelo: "Dual Inverter", idrs: [3.2] }),
      item({ id: "ap-aaaaaaaaaaaa" }),
    ]);
    const [tipo, , , , , idrs] = linhas;
    expect(tipo?.valores).toEqual(["Split Hi-Wall", "Split Hi-Wall"]);
    expect(idrs?.valores).toEqual(["3,2", "5,5"]);
    expect(linhas.every((linha) => linha.valores.length === 2)).toBe(true);
  });
});

describe("sugestão do combobox", () => {
  it("traz marca, modelo, capacidade e tipo", () => {
    expect(resumoDaSugestao(item())).toEqual({
      marca: "MIDEA",
      modelo: "Xtreme Save",
      capacidade: "12.000 BTU/h",
      tipo: "Split Hi-Wall",
    });
  });

  it("usa a Marca de catálogo e marca o que falta", () => {
    const resumo = resumoDaSugestao(
      item({
        marca: "SPRINGER MIDEA",
        marcaCatalogo: "MIDEA",
        capacidadesBtu: [9000, 12000],
        tipo: null,
      }),
    );
    expect(resumo.marca).toBe("MIDEA");
    expect(resumo.capacidade).toBe("9.000 – 12.000 BTU/h");
    expect(resumo.tipo).toBe("—");
  });
});
