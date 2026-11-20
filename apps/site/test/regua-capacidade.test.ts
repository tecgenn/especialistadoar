import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import {
  FAIXAS_CAPACIDADE,
  faixaContem,
} from "../src/lib/faixas-capacidade.ts";
import { faixasDaRegua, linkDaFaixa } from "../src/lib/regua-capacidade.ts";

/**
 * A régua de capacidade da home (ticket 70) é a assinatura do site: seis faixas
 * comerciais com as contagens reais do dataset publicado. O teste é puro e lê a
 * base servida, para provar que nenhum número foi escrito à mão e que cada link
 * aponta para o recorte correspondente.
 */
const dataset = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL("../../../data/build/consulta.json", import.meta.url),
    ),
    "utf8",
  ),
) as ItemConsulta[];

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

describe("régua de capacidade", () => {
  it("conta as faixas a partir do dataset publicado, não de números fixos", () => {
    const regua = faixasDaRegua(dataset);
    expect(regua).toHaveLength(FAIXAS_CAPACIDADE.length);

    for (const { faixa, contagem } of regua) {
      const esperada = dataset.filter((aparelho) =>
        aparelho.capacidadesBtu.some((capacidade) =>
          faixaContem(faixa, capacidade),
        ),
      ).length;
      expect(contagem).toBe(esperada);
      expect(contagem).toBeGreaterThan(0);
    }

    // As seis contagens da base atual, na ordem comercial. Se a base mudar, o
    // teste muda com ela — o que importa é que saem do dataset.
    expect(regua.map(({ contagem }) => contagem)).toEqual([
      368, 492, 324, 362, 197, 487,
    ]);
  });

  it("não apresenta a soma das faixas como o total de Aparelhos", () => {
    // Um Aparelho com Variantes em faixas diferentes é contado em cada uma.
    const soma = faixasDaRegua(dataset).reduce(
      (total, { contagem }) => total + contagem,
      0,
    );
    expect(soma).toBeGreaterThanOrEqual(dataset.length);

    const comVariantesEmFaixasDiferentes = dataset.filter((aparelho) => {
      const faixas = new Set(
        FAIXAS_CAPACIDADE.filter((faixa) =>
          aparelho.capacidadesBtu.some((capacidade) =>
            faixaContem(faixa, capacidade),
          ),
        ),
      );
      return faixas.size > 1;
    });
    expect(comVariantesEmFaixasDiferentes.length).toBeGreaterThan(0);
  });

  it("liga cada faixa ao recorte certo do catálogo, sem capacidade exata", () => {
    expect(linkDaFaixa({ max: 9000 })).toBe("/aparelhos/?btuMax=9000");
    expect(linkDaFaixa({ min: 9001, max: 12000 })).toBe(
      "/aparelhos/?btuMin=9001&btuMax=12000",
    );
    expect(linkDaFaixa({ min: 30001 })).toBe("/aparelhos/?btuMin=30001");

    for (const { href } of faixasDaRegua(dataset)) {
      expect(href.startsWith("/aparelhos/?")).toBe(true);
      expect(href).not.toContain("btu=");
    }
  });

  it("rotula a faixa sem unidade no eixo e com unidade no nome acessível", () => {
    const regua = faixasDaRegua(dataset);
    expect(regua.map(({ rotulo }) => rotulo)).toEqual([
      "Até 9.000",
      "9.001–12.000",
      "12.001–18.000",
      "18.001–24.000",
      "24.001–30.000",
      "Acima de 30.000",
    ]);
    expect(regua[0]?.rotuloCompleto).toBe("Até 9.000 BTU/h");
    expect(regua[5]?.rotuloCompleto).toBe("Acima de 30.000 BTU/h");
  });

  it("dá 100% de barra à maior faixa e proporção às demais", () => {
    const regua = faixasDaRegua([
      item({ capacidadesBtu: [9000] }),
      item({ capacidadesBtu: [12000] }),
      item({ capacidadesBtu: [12000] }),
      item({ capacidadesBtu: [12000] }),
      item({ capacidadesBtu: [12000] }),
    ]);
    expect(
      regua.map(({ contagem, proporcao }) => ({ contagem, proporcao })),
    ).toEqual([
      { contagem: 1, proporcao: 25 },
      { contagem: 4, proporcao: 100 },
    ]);
  });

  it("esconde faixa sem nenhum Aparelho na base", () => {
    const regua = faixasDaRegua([
      item({ capacidadesBtu: [9000] }),
      item({ capacidadesBtu: [30001] }),
    ]);
    expect(regua.map(({ rotulo }) => rotulo)).toEqual([
      "Até 9.000",
      "Acima de 30.000",
    ]);
    expect(faixasDaRegua([])).toEqual([]);
  });

  it("conta o Aparelho em cada faixa em que ele aparece, uma vez por faixa", () => {
    const regua = faixasDaRegua([
      item({ capacidadesBtu: [9000, 9001, 9001, 12000] }),
    ]);
    expect(regua.map(({ contagem }) => contagem)).toEqual([1, 1]);
  });
});
