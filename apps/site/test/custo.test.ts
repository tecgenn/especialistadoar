import { describe, expect, it } from "vitest";
import {
  calcularCusto,
  DIAS_MES_PADRAO,
  type EstadoCusto,
  ehFaixa,
  escreverEstadoCusto,
  formatarFaixa,
  formatarKwh,
  formatarReais,
  HORAS_ANO,
  HORAS_DIA_PADRAO,
  lerEstadoCusto,
} from "../src/lib/custo.ts";
import {
  type TarifasCuradas,
  UFS,
  validarTarifas,
} from "../src/lib/tarifas.ts";

/**
 * Motor puro da calculadora de custo: aritmética do ciclo de 2.080 h/ano, faixa
 * de Variantes, formatação pt-BR e o contrato de URL (padrões em SP, 8 h/dia e
 * 30 dias, sem sujar o link).
 */
const tarifas: TarifasCuradas = validarTarifas({
  ufs: UFS.map(({ uf, nome }) => ({
    uf,
    nome,
    tarifa: uf === "SP" ? 0.85 : uf === "RJ" ? 0.95 : 0.9,
    referencia: "2026-11",
    fonte: "ANEEL",
  })),
});

function ler(query: string): EstadoCusto {
  return lerEstadoCusto(new URLSearchParams(query), tarifas);
}

function escrever(estado: EstadoCusto): string {
  return escreverEstadoCusto(estado, tarifas).toString();
}

describe("aritmética do custo", () => {
  it("aplica consumo anual ÷ 2.080, o uso informado e a tarifa", () => {
    const resultado = calcularCusto({
      consumosAnuaisKwh: [416],
      tarifa: 0.9,
      horas: 8,
      dias: 30,
    });

    expect(HORAS_ANO).toBe(2080);
    expect(resultado).not.toBeNull();
    // 416 ÷ 2.080 = 0,2 kWh/h; × 8 h × 30 dias = 48 kWh/mês.
    expect(resultado?.consumoPorHoraKwh).toEqual({
      minimo: 0.2,
      maximo: 0.2,
    });
    expect(resultado?.consumoMensalKwh).toEqual({
      minimo: 48,
      maximo: 48,
    });
    expect(resultado?.custoMensal.minimo).toBeCloseTo(43.2, 10);
    expect(resultado?.custoMensal.maximo).toBeCloseTo(43.2, 10);
    expect(resultado?.custoAnual.minimo).toBeCloseTo(518.4, 10);
    expect(resultado?.custoAnual.maximo).toBeCloseTo(518.4, 10);
    expect(ehFaixa(resultado?.custoMensal ?? { minimo: 0, maximo: 0 })).toBe(
      false,
    );
  });

  it("leva as entradas usadas para a conta aberta", () => {
    const resultado = calcularCusto({
      consumosAnuaisKwh: [303],
      tarifa: 1.05,
      horas: 6,
      dias: 22,
    });

    expect(resultado?.entradas).toEqual({
      consumosAnuaisKwh: [303],
      tarifa: 1.05,
      horas: 6,
      dias: 22,
    });
  });

  it("com mais de uma Variante devolve faixa sobre o menor e o maior consumo", () => {
    const resultado = calcularCusto({
      consumosAnuaisKwh: [818, 350],
      tarifa: 0.95,
      horas: 8,
      dias: 30,
    });

    const porHora350 = 350 / HORAS_ANO;
    const porHora818 = 818 / HORAS_ANO;
    expect(resultado?.consumoPorHoraKwh).toEqual({
      minimo: porHora350,
      maximo: porHora818,
    });
    expect(resultado?.consumoMensalKwh.minimo).toBeCloseTo(
      porHora350 * 8 * 30,
      10,
    );
    expect(resultado?.custoMensal.maximo).toBeCloseTo(
      porHora818 * 8 * 30 * 0.95,
      10,
    );
    expect(resultado?.custoAnual.maximo).toBeCloseTo(
      porHora818 * 8 * 30 * 0.95 * 12,
      10,
    );
    expect(ehFaixa(resultado?.custoMensal ?? { minimo: 0, maximo: 0 })).toBe(
      true,
    );
  });

  it("ignora consumo não utilizável e devolve null sem nenhum", () => {
    expect(
      calcularCusto({
        consumosAnuaisKwh: [Number.NaN, 0, -12, 416],
        tarifa: 0.9,
        horas: 8,
        dias: 30,
      })?.entradas.consumosAnuaisKwh,
    ).toEqual([416]);

    expect(
      calcularCusto({
        consumosAnuaisKwh: [],
        tarifa: 0.9,
        horas: 8,
        dias: 30,
      }),
    ).toBeNull();
    expect(
      calcularCusto({
        consumosAnuaisKwh: [Number.NaN, 0],
        tarifa: 0.9,
        horas: 8,
        dias: 30,
      }),
    ).toBeNull();
  });

  it("devolve null quando uma entrada está fora do contrato", () => {
    for (const entrada of [
      { tarifa: 0 },
      { tarifa: -1 },
      { tarifa: Number.NaN },
      { horas: 25 },
      { horas: -1 },
      { dias: 0 },
      { dias: 32 },
      { dias: Number.NaN },
    ]) {
      expect(
        calcularCusto({
          consumosAnuaisKwh: [416],
          tarifa: 0.9,
          horas: 8,
          dias: 30,
          ...entrada,
        }),
      ).toBeNull();
    }
  });

  it("aceita zero horas de uso (custo zero)", () => {
    const resultado = calcularCusto({
      consumosAnuaisKwh: [416],
      tarifa: 0.9,
      horas: 0,
      dias: 30,
    });
    expect(resultado?.custoMensal).toEqual({ minimo: 0, maximo: 0 });
    expect(resultado?.custoAnual).toEqual({ minimo: 0, maximo: 0 });
  });
});

describe("formatação pt-BR", () => {
  it("formata reais com duas casas e a unidade", () => {
    expect(formatarReais(45.6)).toBe("R$ 45,60");
    expect(formatarReais(1234.5)).toBe("R$ 1.234,50");
    expect(formatarReais(0)).toBe("R$ 0,00");
  });

  it("formata kWh com duas casas e a unidade", () => {
    expect(formatarKwh(60)).toBe("60,00 kWh");
    expect(formatarKwh(1234.567)).toBe("1.234,57 kWh");
  });

  it("formata faixa só quando o mínimo e o máximo diferem", () => {
    expect(formatarFaixa({ minimo: 43.2, maximo: 43.2 }, formatarReais)).toBe(
      "R$ 43,20",
    );
    expect(formatarFaixa({ minimo: 43.2, maximo: 60 }, formatarReais)).toBe(
      "R$ 43,20 – R$ 60,00",
    );
    expect(formatarFaixa({ minimo: 30, maximo: 48 }, formatarKwh)).toBe(
      "30,00 kWh – 48,00 kWh",
    );
  });
});

describe("contrato de URL da calculadora", () => {
  it("sem parâmetros, abre no padrão: SP, 8 h/dia e 30 dias", () => {
    expect(ler("")).toEqual({
      uf: "SP",
      tarifa: 0.85,
      horas: HORAS_DIA_PADRAO,
      dias: DIAS_MES_PADRAO,
    });
  });

  it("o padrão não aparece na URL e um link redundante é normalizado", () => {
    expect(escrever(ler(""))).toBe("");
    expect(ler("uf=SP&horas=8&dias=30")).toEqual(ler(""));
    expect(escrever(ler("uf=SP&horas=8"))).toBe("");
  });

  it("trocar a UF traz a tarifa de referência daquele estado", () => {
    expect(ler("uf=RJ").tarifa).toBe(0.95);
    expect(escrever(ler("uf=RJ"))).toBe("uf=RJ");
  });

  it("normaliza a UF digitada em minúsculas", () => {
    expect(ler("uf=rj")).toMatchObject({ uf: "RJ", tarifa: 0.95 });
    expect(ler("uf=sp").uf).toBe("SP");
  });

  it('`uf=` vazia representa "Tarifa informada" e desliga a tarifa por estado', () => {
    const estado = ler("uf=");
    expect(estado.uf).toBeNull();
    expect(estado.tarifa).toBe(0.85);
    expect(escrever(estado)).toBe("uf=&tarifa=0.85");
  });

  it("a tarifa digitada tem precedência sobre a da UF", () => {
    const estado = ler("uf=RJ&tarifa=1.2");
    expect(estado.tarifa).toBe(1.2);
    expect(escrever(estado)).toBe("uf=RJ&tarifa=1.2");

    expect(ler("tarifa=1.2")).toMatchObject({ uf: "SP", tarifa: 1.2 });
    expect(escrever(ler("tarifa=1.2"))).toBe("uf=SP&tarifa=1.2");
  });

  it("tarifa igual à da UF não é escrita", () => {
    expect(escrever(ler("uf=RJ&tarifa=0.95"))).toBe("uf=RJ");
  });

  it("horas e dias fora do padrão vão para a URL", () => {
    expect(escrever({ uf: "SP", tarifa: 0.85, horas: 0, dias: 1 })).toBe(
      "horas=0&dias=1",
    );
    expect(escrever({ uf: "SP", tarifa: 0.85, horas: 7.5, dias: 22 })).toBe(
      "horas=7.5&dias=22",
    );
  });

  it("faz round-trip do estado completo", () => {
    const estado: EstadoCusto = {
      uf: "RJ",
      tarifa: 1.2,
      horas: 6,
      dias: 22,
    };
    const url = escrever(estado);
    expect(url).toBe("uf=RJ&tarifa=1.2&horas=6&dias=22");
    expect(ler(url)).toEqual(estado);
  });

  it('faz round-trip de "Tarifa informada"', () => {
    const estado: EstadoCusto = {
      uf: null,
      tarifa: 0.99,
      horas: 8,
      dias: 30,
    };
    const url = escrever(estado);
    expect(url).toBe("uf=&tarifa=0.99");
    expect(ler(url)).toEqual(estado);
  });

  it("UF inexistente cai no padrão em silêncio", () => {
    expect(ler("uf=XX")).toEqual(ler(""));
    expect(escrever(ler("uf=XX"))).toBe("");
  });

  it("valores inválidos caem no padrão sem erro", () => {
    for (const query of [
      "tarifa=abc",
      "tarifa=0",
      "tarifa=-1",
      "tarifa=Infinity",
      "horas=99",
      "horas=-1",
      "horas=abc",
      "dias=0",
      "dias=32",
      "dias=abc",
    ]) {
      expect(ler(query)).toEqual(ler(""));
    }
  });

  it("`horas` e `dias` aceitam os limites do contrato", () => {
    expect(ler("horas=24").horas).toBe(24);
    expect(ler("dias=31").dias).toBe(31);
  });
});
