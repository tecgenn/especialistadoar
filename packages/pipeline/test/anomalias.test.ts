import { describe, expect, it } from "vitest";
import { type Anomalia, detectarAnomalias } from "../src/anomalias.ts";

const contexto = { linha: 7, versao: "abc123" };

describe("detectarAnomalias", () => {
  it("sinaliza múltiplos valores num campo numérico", () => {
    const anomalias = detectarAnomalias(
      { "Carga do Fluido Refrigerante (g)": "640g / 600g / 690g" },
      contexto,
    );
    expect(anomalias).toEqual<Anomalia[]>([
      {
        linha: 7,
        versao: "abc123",
        campo: "Carga do Fluido Refrigerante (g)",
        valor: "640g / 600g / 690g",
        tipo: "valor_multiplo",
      },
    ]);
  });

  it("sinaliza texto em campo numérico", () => {
    const anomalias = detectarAnomalias({ "IDRS (Wh/Wh)": "abc" }, contexto);
    expect(anomalias).toHaveLength(1);
    expect(anomalias[0]?.tipo).toBe("texto_em_campo_numerico");
    expect(anomalias[0]?.valor).toBe("abc");
  });

  it("não sinaliza unidade no texto (isso é regra de formato)", () => {
    expect(
      detectarAnomalias(
        { "Carga do Fluido Refrigerante (g)": "290G" },
        contexto,
      ),
    ).toEqual([]);
  });

  it("não sinaliza campo numérico vazio", () => {
    expect(
      detectarAnomalias({ "Carga do Fluido Refrigerante (g)": "" }, contexto),
    ).toEqual([]);
  });

  it("não sinaliza texto em campo textual", () => {
    expect(
      detectarAnomalias({ "Fluido Refrigerante": "Outro" }, contexto),
    ).toEqual([]);
  });
});

describe("detectarAnomalias — valores implausíveis", () => {
  const CAPACIDADE = "Capacidade de Refrigeração Nominal (Btu/h)";

  it("sinaliza capacidade nominal abaixo de 1.000 BTU/h", () => {
    expect(detectarAnomalias({ [CAPACIDADE]: "30" }, contexto)).toEqual<
      Anomalia[]
    >([
      {
        linha: 7,
        versao: "abc123",
        campo: CAPACIDADE,
        valor: "30",
        tipo: "valor_implausivel",
      },
    ]);
  });

  it("aceita exatamente 1.000 BTU/h como plausível", () => {
    expect(detectarAnomalias({ [CAPACIDADE]: "1000" }, contexto)).toEqual([]);
  });

  it("não sinaliza capacidade plausível", () => {
    expect(detectarAnomalias({ [CAPACIDADE]: "12000" }, contexto)).toEqual([]);
  });

  it("aplica a regra só à coluna dela", () => {
    expect(
      detectarAnomalias({ "Carga do Fluido Refrigerante (g)": "30" }, contexto),
    ).toEqual([]);
  });

  it("continua sinalizando texto na coluna de capacidade como texto", () => {
    const anomalias = detectarAnomalias({ [CAPACIDADE]: "abc" }, contexto);
    expect(anomalias[0]?.tipo).toBe("texto_em_campo_numerico");
  });
});
