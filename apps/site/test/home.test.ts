import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import {
  capacidadesPopulares,
  contarBase,
  formatarCapacidade,
  formatarNumero,
  jsonLdPerguntasFrequentes,
  linkDaTabela,
  marcasPopulares,
  PASSOS_ASSISTENTE,
  PERGUNTAS_FREQUENTES,
} from "../src/lib/home.ts";

function item(over: Partial<ItemConsulta> = {}): ItemConsulta {
  return {
    id: "x",
    modelo: "M",
    tipo: null,
    funcao: null,
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

const curadoria = {
  marcas: [
    { valor: "MIDEA", rotulo: "Midea" },
    { valor: "SAMSUNG", rotulo: "Samsung" },
    { valor: "DAIKIN", rotulo: "Daikin" },
  ],
  btus: [36000, 9000, 12000],
  classes: [],
};

describe("contagens da base", () => {
  it("conta Aparelhos, Marcas de catálogo e capacidades distintas", () => {
    const contagens = contarBase([
      item({
        id: "a",
        marca: "MIDEA",
        marcaCatalogo: "MIDEA",
        capacidadesBtu: [9000, 12000],
      }),
      item({
        id: "b",
        marca: "SPRINGER MIDEA",
        marcaCatalogo: "MIDEA",
        capacidadesBtu: [12000],
      }),
      item({ id: "c", marca: "LG", capacidadesBtu: [18000] }),
    ]);
    expect(contagens).toEqual({ aparelhos: 3, marcas: 2, capacidades: 3 });
  });

  it("não conta Marca de catálogo vazia nem capacidade duplicada", () => {
    const contagens = contarBase([
      item({ id: "a", marcaCatalogo: "", capacidadesBtu: [9000, 9000] }),
      item({ id: "b", marcaCatalogo: "", capacidadesBtu: [9000] }),
    ]);
    expect(contagens.aparelhos).toBe(2);
    expect(contagens.marcas).toBe(0);
    expect(contagens.capacidades).toBe(1);
  });
});

describe("capacidades e marcas populares", () => {
  it("mantém a ordem curada e esconde o valor ausente da base", () => {
    const dataset = [
      item({ id: "a", capacidadesBtu: [9000, 12000] }),
      item({ id: "b", capacidadesBtu: [36000] }),
    ];
    expect(capacidadesPopulares(dataset, curadoria)).toEqual([
      9000, 12000, 36000,
    ]);
  });

  it("resolve as marcas curadas presentes na base, com o rótulo", () => {
    const dataset = [
      item({ id: "a", marca: "SAMSUNG" }),
      item({ id: "b", marca: "SPRINGER MIDEA", marcaCatalogo: "MIDEA" }),
    ];
    expect(marcasPopulares(dataset, curadoria)).toEqual([
      { valor: "MIDEA", rotulo: "Midea" },
      { valor: "SAMSUNG", rotulo: "Samsung" },
    ]);
  });
});

describe("links da tabela", () => {
  it("aponta para a tabela sem filtro quando não há recorte", () => {
    expect(linkDaTabela({})).toBe("/aparelhos/");
  });

  it("filtra por capacidade e por Marca de catálogo", () => {
    expect(linkDaTabela({ btu: 12000 })).toBe("/aparelhos/?btu=12000");
    expect(linkDaTabela({ marca: "MIDEA" })).toBe("/aparelhos/?marca=MIDEA");
  });
});

describe("formatação pt-BR", () => {
  it("usa o separador de milhar", () => {
    expect(formatarNumero(2227)).toBe("2.227");
    expect(formatarCapacidade(9000)).toBe("9.000 BTU/h");
  });
});

describe("FAQ e JSON-LD", () => {
  it("tem 5–6 perguntas reais com resposta curta", () => {
    expect(PERGUNTAS_FREQUENTES.length).toBeGreaterThanOrEqual(5);
    expect(PERGUNTAS_FREQUENTES.length).toBeLessThanOrEqual(6);
    for (const { pergunta, resposta } of PERGUNTAS_FREQUENTES) {
      expect(pergunta.trim().length).toBeGreaterThan(0);
      expect(resposta.trim().length).toBeGreaterThan(0);
    }
  });

  it("publica um FAQPage válido com as mesmas perguntas e respostas", () => {
    const jsonLd = jsonLdPerguntasFrequentes();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("FAQPage");

    const entidades = jsonLd.mainEntity as Array<Record<string, unknown>>;
    expect(entidades).toHaveLength(PERGUNTAS_FREQUENTES.length);
    entidades.forEach((entidade, indice) => {
      const esperada = PERGUNTAS_FREQUENTES[indice];
      expect(entidade["@type"]).toBe("Question");
      expect(entidade.name).toBe(esperada?.pergunta);
      expect(entidade.acceptedAnswer).toEqual({
        "@type": "Answer",
        text: esperada?.resposta,
      });
    });
  });

  it("descreve o Assistente em três passos", () => {
    expect(PASSOS_ASSISTENTE).toHaveLength(3);
  });
});
