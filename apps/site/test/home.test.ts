import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import {
  capacidadesPopulares,
  contagensPorCapacidade,
  contagensPorMarca,
  contarBase,
  EXPLICACAO_DO_RECORTE,
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
      36000, 9000, 12000,
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

describe("contagens dos populares", () => {
  it("conta cada Aparelho uma vez por capacidade, mesmo com Variantes no mesmo valor", () => {
    const contagens = contagensPorCapacidade([
      item({ id: "a", capacidadesBtu: [9000, 12000] }),
      item({ id: "b", capacidadesBtu: [12000, 12000] }),
      item({ id: "c", capacidadesBtu: [18000] }),
    ]);
    expect(contagens.get(9000)).toBe(1);
    expect(contagens.get(12000)).toBe(2);
    expect(contagens.get(18000)).toBe(1);
  });

  it("conta os Aparelhos por Marca de catálogo, ignorando a Marca vazia", () => {
    const contagens = contagensPorMarca([
      item({ id: "a", marca: "MIDEA", marcaCatalogo: "MIDEA" }),
      item({
        id: "b",
        marca: "SPRINGER MIDEA",
        marcaCatalogo: "MIDEA",
      }),
      item({ id: "c", marca: "LG", marcaCatalogo: "LG" }),
      item({ id: "d", marcaCatalogo: "" }),
    ]);
    expect(contagens.get("MIDEA")).toBe(2);
    expect(contagens.get("LG")).toBe(1);
    expect(contagens.has("")).toBe(false);
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
  it("tem 9–10 perguntas reais com resposta curta", () => {
    expect(PERGUNTAS_FREQUENTES.length).toBeGreaterThanOrEqual(9);
    expect(PERGUNTAS_FREQUENTES.length).toBeLessThanOrEqual(10);
    for (const { pergunta, resposta } of PERGUNTAS_FREQUENTES) {
      expect(pergunta.trim().length).toBeGreaterThan(0);
      expect(resposta.trim().length).toBeGreaterThan(0);
    }
  });

  it("responde o que é BTU/h e como escolher a tensão pela instalação", () => {
    const btu = PERGUNTAS_FREQUENTES.find(
      ({ pergunta }) => pergunta === "O que é BTU/h?",
    );
    expect(btu).toBeDefined();
    expect(btu?.resposta).toContain("capacidade");
    expect(btu?.resposta).toContain("calor");

    const tensao = PERGUNTAS_FREQUENTES.find(
      ({ pergunta }) => pergunta === "Qual tensão escolher: 127 V ou 220 V?",
    );
    expect(tensao).toBeDefined();
    expect(tensao?.resposta).toContain("instalação");
    expect(tensao?.resposta).toContain("127 V");
    expect(tensao?.resposta).toContain("220 V");
  });

  it("explica o recorte da tabela sem confundir linha excluída, ausência e status do Registro", () => {
    const recorte = PERGUNTAS_FREQUENTES.find(
      ({ pergunta }) => pergunta === "Por que um modelo não aparece na tabela?",
    );
    expect(recorte?.resposta).toBe(EXPLICACAO_DO_RECORTE);
    for (const trecho of [
      "descartadas ao montar a tabela",
      "duplicatas",
      "está ausente",
      "Cancelado e Inativo são status do Registro INMETRO",
      "não o removem da tabela",
    ]) {
      expect(EXPLICACAO_DO_RECORTE).toContain(trecho);
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
