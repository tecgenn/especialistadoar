import { describe, expect, it } from "vitest";
import {
  normalizarEspacos,
  normalizarGrau,
  normalizarValores,
  parseNumero,
  parseTensao,
} from "../src/normalize.ts";

describe("normalizarGrau", () => {
  it("troca o ordinal º pelo grau °", () => {
    expect(normalizarGrau("29 ºC")).toBe("29 °C");
  });

  it("deixa o grau ° inalterado", () => {
    expect(normalizarGrau("35 °C")).toBe("35 °C");
  });

  it("troca todas as ocorrências", () => {
    expect(normalizarGrau("a º b º")).toBe("a ° b °");
  });
});

describe("normalizarEspacos", () => {
  it("apara as pontas e colapsa espaços internos", () => {
    expect(normalizarEspacos("  R-32, mistura  ")).toBe("R-32, mistura");
  });

  it("trata tabulação como espaço", () => {
    expect(normalizarEspacos("AUF-09COQG-IDU\t")).toBe("AUF-09COQG-IDU");
  });

  it("devolve string vazia para entrada só de espaços", () => {
    expect(normalizarEspacos("   ")).toBe("");
  });
});

describe("parseNumero — coerção numérica", () => {
  it("converte inteiro", () => {
    expect(parseNumero("9000")).toBe(9000);
  });

  it("converte decimal com ponto", () => {
    expect(parseNumero("3.50")).toBe(3.5);
    expect(parseNumero("818.0")).toBe(818);
  });

  it("converte decimal com vírgula", () => {
    expect(parseNumero("3,50")).toBe(3.5);
  });

  it("remove a unidade embutida no texto", () => {
    expect(parseNumero("290G")).toBe(290);
    expect(parseNumero("380 g")).toBe(380);
    expect(parseNumero("0.31G")).toBe(0.31);
    expect(parseNumero("3.14Wh/Wh")).toBe(3.14);
  });

  it("devolve null para valor vazio", () => {
    expect(parseNumero("")).toBeNull();
    expect(parseNumero("   ")).toBeNull();
  });

  it("devolve null para texto sem número", () => {
    expect(parseNumero("abc")).toBeNull();
  });

  it("devolve null para múltiplos valores", () => {
    expect(parseNumero("500/480")).toBeNull();
    expect(parseNumero("640g / 600g / 690g")).toBeNull();
    expect(parseNumero("340 / 370")).toBeNull();
  });
});

describe("parseNumero — separador de milhar pt-BR", () => {
  it("lê ponto entre grupos de três dígitos como milhar", () => {
    expect(parseNumero("1.000")).toBe(1000);
    expect(parseNumero("12.000")).toBe(12000);
    expect(parseNumero("1.234.567")).toBe(1234567);
  });

  it("aplica a regra também com unidade embutida", () => {
    expect(parseNumero("1.000 BTU/h")).toBe(1000);
    expect(parseNumero("1.160 g")).toBe(1160);
    expect(parseNumero("10.500 W")).toBe(10500);
    expect(parseNumero("1.234,5 kWh")).toBe(1234.5);
    expect(parseNumero("3.500Wh/Wh")).toBe(3500);
  });

  it("lê 3.500 como 3500 (o significado em pt-BR)", () => {
    expect(parseNumero("3.500")).toBe(3500);
  });

  it("combina milhar por ponto com decimal por vírgula", () => {
    expect(parseNumero("1.000,50")).toBe(1000.5);
  });

  it("nunca trata a parte inteira 0 como milhar", () => {
    expect(parseNumero("0.351")).toBe(0.351);
    expect(parseNumero("0,351")).toBe(0.351);
    expect(parseNumero("00.351")).toBe(0.351);
  });

  it("só trata como milhar o agrupamento pt-BR (inicial de até 3 dígitos)", () => {
    expect(parseNumero("1234.567")).toBe(1234.567);
  });

  it("continua lendo 1 ou 2 dígitos após o ponto como decimal", () => {
    expect(parseNumero("3.50")).toBe(3.5);
    expect(parseNumero("1.16")).toBe(1.16);
  });

  it("devolve null para o formato en-US", () => {
    expect(parseNumero("1,000.50")).toBeNull();
  });

  it("devolve null para milhar malformado", () => {
    expect(parseNumero("1.00.0")).toBeNull();
  });
});

describe("parseTensao — parsing de bivolt", () => {
  it("parseia 127-220 como uma só tensão, com duas voltagens", () => {
    expect(parseTensao("127-220 (monofásico/bifásico)")).toEqual({
      voltagens: [127, 220],
      fases: ["monofásico", "bifásico"],
    });
  });

  it("parseia tensão única com fase", () => {
    expect(parseTensao("220 (trifásico)")).toEqual({
      voltagens: [220],
      fases: ["trifásico"],
    });
  });

  it("parseia tensão sem fase", () => {
    expect(parseTensao("127-220")).toEqual({
      voltagens: [127, 220],
      fases: [],
    });
  });

  it("devolve null para valor vazio", () => {
    expect(parseTensao("")).toBeNull();
    expect(parseTensao("   ")).toBeNull();
  });
});

describe("normalizarValores — oficial só difere do original por formato", () => {
  it("preserva o original e padroniza casing, espaços, grau, número e tensão", () => {
    const original = {
      Marca: "  samsung ",
      Modelo: "AR09MV",
      "Tensão (V)": "127-220 (monofásico/bifásico)",
      "Carga do Fluido Refrigerante (g)": "290G",
      "IDRS (Wh/Wh)": "3,50",
      "Se outro fluido refrigerante, especificar": " R-32, mistura ",
    };

    const { valores, oficial } = normalizarValores(original);

    expect(valores).toStrictEqual(original);
    expect(oficial.Marca).toBe("SAMSUNG");
    expect(oficial.Modelo).toBe("AR09MV");
    expect(oficial["Tensão (V)"]).toEqual({
      voltagens: [127, 220],
      fases: ["monofásico", "bifásico"],
    });
    expect(oficial["Carga do Fluido Refrigerante (g)"]).toBe(290);
    expect(oficial["IDRS (Wh/Wh)"]).toBe(3.5);
    expect(oficial["Se outro fluido refrigerante, especificar"]).toBe(
      "R-32, mistura",
    );
  });

  it("devolve null para campo numérico ou tensão sem dado", () => {
    const { oficial } = normalizarValores({
      "Carga do Fluido Refrigerante (g)": "",
      "Tensão (V)": "",
    });
    expect(oficial["Carga do Fluido Refrigerante (g)"]).toBeNull();
    expect(oficial["Tensão (V)"]).toBeNull();
  });

  it("padroniza º e ° nos nomes de coluna", () => {
    const { valores, oficial } = normalizarValores({
      "Capacidade a 29 ºC e Carga Total (W)": "2637",
    });
    const coluna = "Capacidade a 29 °C e Carga Total (W)";
    expect(valores[coluna]).toBe("2637");
    expect(oficial[coluna]).toBe(2637);
  });
});
