import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import {
  capacidadesDiferem,
  escreverIds,
  fraseDiferencaCustoAnual,
  lerIds,
  lerIdsBrutos,
  linhasDaComparacao,
  linhasDeCustoComparacao,
  MAXIMO_COMPARACAO,
  resumoDaSugestao,
  valorDaComparacao,
} from "../src/lib/comparacao.ts";
import { calcularCusto, type ResultadoCusto } from "../src/lib/custo.ts";

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

  it("lê os ids crus sem validar contra a base, para não perder a seleção antes do dataset", () => {
    expect(
      lerIdsBrutos(
        new URLSearchParams(
          "ids=ap-aaaaaaaaaaaa,ap-aaaaaaaaaaaa,ap-zzzzzzzzzzzz,ap-bbbbbbbbbbbb,ap-cccccccccccc",
        ),
      ),
    ).toEqual(["ap-aaaaaaaaaaaa", "ap-zzzzzzzzzzzz", "ap-bbbbbbbbbbbb"]);
    expect(lerIdsBrutos(new URLSearchParams(""))).toEqual([]);
    expect(lerIdsBrutos(new URLSearchParams("ids="))).toEqual([]);
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

/** O cenário padrão da ficha, para os testes do custo na comparação. */
function custo(itemComparado: ItemConsulta): ResultadoCusto | null {
  return calcularCusto({
    consumosAnuaisKwh: itemComparado.consumosKwh,
    tarifa: 0.85,
    horas: 8,
    dias: 30,
  });
}

describe("linhas de custo estimado da matriz de Comparação", () => {
  it("são três — consumo mensal, custo mensal e custo anual — no formato da ficha", () => {
    const linhas = linhasDeCustoComparacao([custo(item())]);

    expect(linhas.map((linha) => linha.campo)).toEqual([
      "consumoMensal",
      "custoMensal",
      "custoAnual",
    ]);
    expect(linhas.map((linha) => linha.rotulo)).toEqual([
      "Consumo mensal",
      "Custo mensal",
      "Custo anual",
    ]);
    // 300 kWh/ano ÷ 2.080 × 8 × 30 = 34,62 kWh/mês; × 0,85 = R$ 29,42; × 12.
    expect(linhas.map((linha) => linha.valores[0])).toEqual([
      "34,62 kWh",
      "R$ 29,42",
      "R$ 353,08",
    ]);
  });

  it("um valor por Aparelho, na ordem das colunas, com travessão sem consumo", () => {
    const semConsumo = item({ consumosKwh: [] });
    const linhas = linhasDeCustoComparacao([
      custo(item({ consumosKwh: [416] })),
      custo(semConsumo),
    ]);

    expect(linhas.every((linha) => linha.valores.length === 2)).toBe(true);
    expect(linhas[2]?.valores).toEqual(["R$ 489,60", "—"]);
  });

  it("faixa de Variantes aparece nas três linhas", () => {
    const [consumo, mensal, anual] = linhasDeCustoComparacao([
      custo(item({ consumosKwh: [350, 818] })),
    ]);

    expect(consumo?.valores[0]).toBe("40,38 kWh – 94,38 kWh");
    expect(mensal?.valores[0]).toBe("R$ 34,33 – R$ 80,23");
    expect(anual?.valores[0]).toBe("R$ 411,92 – R$ 962,72");
  });
});

describe("frase factual da diferença de custo anual", () => {
  it("dá o menor, o maior e a diferença, sem eleger um vencedor", () => {
    const frase = fraseDiferencaCustoAnual([
      custo(item({ consumosKwh: [300] })),
      custo(item({ consumosKwh: [350] })),
    ]);

    expect(frase).toBe(
      "Neste cenário, o custo anual estimado varia de R$ 353,08 a R$ 411,92 entre os modelos — diferença de R$ 58,85/ano.",
    );
    expect(frase).not.toMatch(/melhor/i);
    expect(frase).not.toMatch(/vencedor/i);
    expect(frase).not.toContain("★");
  });

  it("com um modelo só, ou sem consumo, não há diferença a mostrar", () => {
    expect(fraseDiferencaCustoAnual([custo(item())])).toBeNull();
    expect(fraseDiferencaCustoAnual([custo(item()), null])).toBeNull();
    expect(fraseDiferencaCustoAnual([])).toBeNull();
  });
});

describe("aviso de capacidades diferentes", () => {
  it("dispara quando as capacidades não coincidem", () => {
    expect(
      capacidadesDiferem([
        item({ capacidadesBtu: [12000] }),
        item({ capacidadesBtu: [30000] }),
      ]),
    ).toBe(true);
    expect(
      capacidadesDiferem([
        item({ capacidadesBtu: [12000] }),
        item({ capacidadesBtu: [9000, 12000] }),
      ]),
    ).toBe(true);
  });

  it("não dispara com capacidades iguais, na ordem que vierem", () => {
    expect(
      capacidadesDiferem([
        item({ capacidadesBtu: [12000] }),
        item({ capacidadesBtu: [12000] }),
      ]),
    ).toBe(false);
    expect(
      capacidadesDiferem([
        item({ capacidadesBtu: [9000, 12000] }),
        item({ capacidadesBtu: [12000, 9000] }),
      ]),
    ).toBe(false);
    expect(capacidadesDiferem([item()])).toBe(false);
  });
});
