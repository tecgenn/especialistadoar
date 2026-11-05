import { describe, expect, it } from "vitest";
import {
  type Anomalia,
  CAPACIDADE_BTU,
  CONSUMO_ANUAL_KWH,
  detectarAnomalias,
} from "../src/anomalias.ts";
import { COLUNA_IDRS } from "../src/normalize.ts";

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
  it("sinaliza capacidade nominal abaixo de 6.000 BTU/h", () => {
    expect(detectarAnomalias({ [CAPACIDADE_BTU]: "30" }, contexto)).toEqual<
      Anomalia[]
    >([
      {
        linha: 7,
        versao: "abc123",
        campo: CAPACIDADE_BTU,
        valor: "30",
        tipo: "valor_implausivel",
      },
    ]);
  });

  it("sinaliza 1.000 BTU/h — o milhar deixou de escapar do piso", () => {
    expect(detectarAnomalias({ [CAPACIDADE_BTU]: "1.000" }, contexto)).toEqual<
      Anomalia[]
    >([
      {
        linha: 7,
        versao: "abc123",
        campo: CAPACIDADE_BTU,
        valor: "1.000",
        tipo: "valor_implausivel",
      },
    ]);
  });

  it("aceita exatamente 6.000 BTU/h como plausível", () => {
    expect(detectarAnomalias({ [CAPACIDADE_BTU]: "6000" }, contexto)).toEqual(
      [],
    );
    expect(detectarAnomalias({ [CAPACIDADE_BTU]: "6.000" }, contexto)).toEqual(
      [],
    );
  });

  it("não sinaliza capacidade plausível", () => {
    expect(detectarAnomalias({ [CAPACIDADE_BTU]: "12000" }, contexto)).toEqual(
      [],
    );
  });

  it("aplica a regra só à coluna dela", () => {
    expect(
      detectarAnomalias({ "Carga do Fluido Refrigerante (g)": "30" }, contexto),
    ).toEqual([]);
  });

  it("continua sinalizando texto na coluna de capacidade como texto", () => {
    const anomalias = detectarAnomalias({ [CAPACIDADE_BTU]: "abc" }, contexto);
    expect(anomalias[0]?.tipo).toBe("texto_em_campo_numerico");
  });
});

describe("detectarAnomalias — consumo implausível", () => {
  it("sinaliza consumo baixo demais por 1.000 BTU/h", () => {
    expect(
      detectarAnomalias(
        { [CAPACIDADE_BTU]: "9000", [CONSUMO_ANUAL_KWH]: "32,8" },
        contexto,
      ),
    ).toEqual<Anomalia[]>([
      {
        linha: 7,
        versao: "abc123",
        campo: CONSUMO_ANUAL_KWH,
        valor: "32,8",
        tipo: "valor_implausivel",
      },
    ]);
  });

  it("sinaliza consumo alto demais por 1.000 BTU/h", () => {
    expect(
      detectarAnomalias(
        { [CAPACIDADE_BTU]: "18000", [CONSUMO_ANUAL_KWH]: "2534,4" },
        contexto,
      ),
    ).toEqual<Anomalia[]>([
      {
        linha: 7,
        versao: "abc123",
        campo: CONSUMO_ANUAL_KWH,
        valor: "2534,4",
        tipo: "valor_implausivel",
      },
    ]);
  });

  it("aceita consumo plausível de split e de Janela", () => {
    expect(
      detectarAnomalias(
        { [CAPACIDADE_BTU]: "9000", [CONSUMO_ANUAL_KWH]: "818" },
        contexto,
      ),
    ).toEqual([]);
    expect(
      detectarAnomalias(
        { [CAPACIDADE_BTU]: "7500", [CONSUMO_ANUAL_KWH]: "566" },
        contexto,
      ),
    ).toEqual([]);
  });

  it("aceita exatamente os limites da faixa", () => {
    expect(
      detectarAnomalias(
        { [CAPACIDADE_BTU]: "9000", [CONSUMO_ANUAL_KWH]: "90" },
        contexto,
      ),
    ).toEqual([]);
    expect(
      detectarAnomalias(
        { [CAPACIDADE_BTU]: "9000", [CONSUMO_ANUAL_KWH]: "1080" },
        contexto,
      ),
    ).toEqual([]);
  });

  it("não sinaliza consumo sem capacidade na Linha", () => {
    expect(
      detectarAnomalias({ [CONSUMO_ANUAL_KWH]: "32,8" }, contexto),
    ).toEqual([]);
  });

  it("não sinaliza consumo quando a capacidade não é numérica", () => {
    const anomalias = detectarAnomalias(
      { [CAPACIDADE_BTU]: "abc", [CONSUMO_ANUAL_KWH]: "32,8" },
      contexto,
    );
    expect(anomalias).toHaveLength(1);
    expect(anomalias[0]?.campo).toBe(CAPACIDADE_BTU);
  });

  it("não sinaliza consumo quando a capacidade é zero ou negativa", () => {
    expect(
      detectarAnomalias(
        { [CAPACIDADE_BTU]: "0", [CONSUMO_ANUAL_KWH]: "32,8" },
        contexto,
      ),
    ).toEqual([
      {
        linha: 7,
        versao: "abc123",
        campo: CAPACIDADE_BTU,
        valor: "0",
        tipo: "valor_implausivel",
      },
    ]);
  });
});

describe("detectarAnomalias — IDRS implausível", () => {
  it("não sinaliza o inteiro sem separador — a regra de formato o corrige", () => {
    expect(detectarAnomalias({ [COLUNA_IDRS]: "55" }, contexto)).toEqual([]);
    expect(detectarAnomalias({ [COLUNA_IDRS]: "62" }, contexto)).toEqual([]);
    expect(detectarAnomalias({ [COLUNA_IDRS]: "33" }, contexto)).toEqual([]);
  });

  it("sinaliza um decimal realmente acima do teto de 10", () => {
    expect(detectarAnomalias({ [COLUNA_IDRS]: "55.5" }, contexto)).toEqual<
      Anomalia[]
    >([
      {
        linha: 7,
        versao: "abc123",
        campo: COLUNA_IDRS,
        valor: "55.5",
        tipo: "valor_implausivel",
      },
    ]);
  });

  it("aceita o teto de 10 e o decimal legítimo 9,71", () => {
    expect(detectarAnomalias({ [COLUNA_IDRS]: "10" }, contexto)).toEqual([]);
    expect(detectarAnomalias({ [COLUNA_IDRS]: "9.71" }, contexto)).toEqual([]);
  });

  it("continua sinalizando texto na coluna IDRS como texto", () => {
    const anomalias = detectarAnomalias({ [COLUNA_IDRS]: "abc" }, contexto);
    expect(anomalias[0]?.tipo).toBe("texto_em_campo_numerico");
  });
});
