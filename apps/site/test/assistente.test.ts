import { describe, expect, it } from "vitest";
import {
  areaDe,
  calcularAssistente,
  capacidadeComercialAcima,
  escreverEstadoAssistente,
  etapaInicial,
  type Fator,
  lerEstadoAssistente,
  type RecomendacaoAssistente,
  type RespostasAssistente,
  respostasDe,
} from "../src/lib/assistente.ts";

/**
 * O motor do Assistente (ticket 41) é a costura nova da Fase 9: uma heurística
 * pura, com todos os coeficientes num só lugar. Os testes exercitam entrada →
 * saída (capacidade calculada, arredondamento comercial, fatores, confiança,
 * suposições e alternativa dividida), nunca detalhes internos.
 */
const BASE: RespostasAssistente = {
  ambiente: "sala",
  area: { forma: "metros", area: 10 },
  sol: "sem",
  pessoas: "1",
  eletronicos: 0,
  lampadas: 0,
  janelas: 0,
};

function cenario(
  parcial: Partial<RespostasAssistente>,
): RecomendacaoAssistente {
  return calcularAssistente({ ...BASE, ...parcial });
}

function metros(area: number): RespostasAssistente["area"] {
  return { forma: "metros", area };
}

function fator(
  recomendacao: RecomendacaoAssistente,
  chave: Fator["chave"],
): Fator | undefined {
  return recomendacao.fatores.find((item) => item.chave === chave);
}

describe("motor do Assistente — coeficientes", () => {
  it("usa a base por m² de cada incidência solar", () => {
    const valores = {
      sem: 6000,
      manha: 6500,
      tarde: 7500,
      "dia-todo": 8000,
    } as const;

    for (const [sol, esperado] of Object.entries(valores)) {
      const recomendacao = cenario({
        sol: sol as RespostasAssistente["sol"],
      });
      expect(recomendacao.capacidadeCalculadaBtu).toBe(esperado);
      expect(fator(recomendacao, "sol")?.btu).toBe(esperado);
    }
  });

  it("assume sol à tarde quando a resposta é 'não sei' e declara a suposição", () => {
    const recomendacao = cenario({ sol: "nao-sei" });

    expect(recomendacao.capacidadeCalculadaBtu).toBe(7500);
    expect(
      recomendacao.suposicoes.some((texto) => texto.includes("sol à tarde")),
    ).toBe(true);
    expect(recomendacao.confianca).toBe("media");
  });

  it("cobre 1 pessoa e soma 600 BTU/h por pessoa adicional, pelo limite superior da faixa", () => {
    const esperados: Array<[RespostasAssistente["pessoas"], number, number]> = [
      ["1", 0, 6000],
      ["2", 600, 6600],
      ["3-4", 1800, 7800],
      ["5-6", 3000, 9000],
      ["7+", 4200, 10200],
    ];

    for (const [pessoas, adicional, total] of esperados) {
      const recomendacao = cenario({ pessoas });
      expect(fator(recomendacao, "pessoas")?.btu).toBe(adicional);
      expect(recomendacao.capacidadeCalculadaBtu).toBe(total);
    }
  });

  it("soma 600 BTU/h por eletrônico", () => {
    const recomendacao = cenario({ eletronicos: 3 });
    expect(fator(recomendacao, "eletronicos")?.btu).toBe(1800);
    expect(recomendacao.capacidadeCalculadaBtu).toBe(7800);
  });

  it("soma 100 BTU/h por lâmpada", () => {
    const recomendacao = cenario({ lampadas: 5 });
    expect(fator(recomendacao, "lampadas")?.btu).toBe(500);
    expect(recomendacao.capacidadeCalculadaBtu).toBe(6500);
  });

  it("assume até 2 janelas e soma 200 BTU/h a partir da 3ª", () => {
    expect(fator(cenario({ janelas: 2 }), "janelas")?.btu).toBe(0);
    expect(fator(cenario({ janelas: 3 }), "janelas")?.btu).toBe(200);
    expect(fator(cenario({ janelas: 5 }), "janelas")?.btu).toBe(600);
  });

  it("não aplica nenhum fator duas vezes", () => {
    const recomendacao = cenario({
      area: metros(20),
      sol: "tarde",
      pessoas: "2",
      eletronicos: 2,
      lampadas: 3,
      janelas: 3,
    });

    // 15.000 (20 m² × 750) + 600 (1 pessoa adicional) + 1.200 (2 eletrônicos)
    // + 300 (3 lâmpadas) + 200 (1 janela acima de 2) = 17.300.
    expect(recomendacao.capacidadeCalculadaBtu).toBe(17300);
    expect(
      recomendacao.fatores.reduce((soma, item) => soma + item.btu, 0),
    ).toBe(17300);
  });
});

describe("motor do Assistente — arredondamento comercial", () => {
  it("arredonda sempre para a capacidade comercial imediatamente acima", () => {
    expect(capacidadeComercialAcima(9000)).toBe(9000);
    expect(capacidadeComercialAcima(9001)).toBe(12000);
    expect(capacidadeComercialAcima(12000)).toBe(12000);
    expect(capacidadeComercialAcima(12001)).toBe(18000);
    expect(capacidadeComercialAcima(18000)).toBe(18000);
    expect(capacidadeComercialAcima(22000)).toBe(22000);
    expect(capacidadeComercialAcima(22001)).toBe(24000);
    expect(capacidadeComercialAcima(60000)).toBe(60000);
  });

  it("usa a capacidade comercial no resultado", () => {
    // 12,1 m² × 750 = 9.075 → 12.000.
    const recomendacao = cenario({ area: metros(12.1), sol: "tarde" });
    expect(recomendacao.capacidadeCalculadaBtu).toBe(9075);
    expect(recomendacao.capacidadeRecomendadaBtu).toBe(12000);
  });

  it("não recomenda um único aparelho acima de 60.000 BTU/h", () => {
    const recomendacao = cenario({ area: metros(100), sol: "dia-todo" });

    expect(recomendacao.capacidadeCalculadaBtu).toBe(80000);
    expect(recomendacao.excedeTeto).toBe(true);
    expect(recomendacao.capacidadeRecomendadaBtu).toBeNull();
    expect(recomendacao.alternativaDividida).toBeNull();
    expect(recomendacao.avaliacaoTecnica).toBe(true);
    expect(recomendacao.explicacao).toContain("mais de uma unidade");
  });
});

describe("motor do Assistente — alternativa dividida", () => {
  it("oferece duas unidades quando metade da capacidade é comercial e ≥ 9.000", () => {
    const casos: Array<[number, number]> = [
      [24, 9000],
      [32, 12000],
      [48, 18000],
      [64, 24000],
      [80, 30000],
    ];

    for (const [area, esperado] of casos) {
      const recomendacao = cenario({ area: metros(area), sol: "tarde" });
      expect(recomendacao.alternativaDividida).toEqual({
        unidades: 2,
        capacidadeBtu: esperado,
      });
    }
  });

  it("não oferece a alternativa quando metade não é uma capacidade comercial", () => {
    // 10 m² × 750 = 7.500 → 9.000; metade 4.500, abaixo do piso.
    expect(cenario({ sol: "tarde" }).alternativaDividida).toBeNull();
    // 40 m² × 750 = 30.000; metade 15.000, fora da tabela comercial.
    expect(
      cenario({ area: metros(40), sol: "tarde" }).alternativaDividida,
    ).toBeNull();
  });
});

describe("motor do Assistente — área e ambiente", () => {
  it("aceita largura × comprimento", () => {
    const recomendacao = cenario({
      area: { forma: "dimensoes", largura: 5, comprimento: 4 },
      sol: "tarde",
    });
    expect(recomendacao.areaM2).toBe(20);
    expect(recomendacao.capacidadeCalculadaBtu).toBe(15000);
  });

  it("usa as referências visuais e marca a área como estimada", () => {
    const casos: Array<[RespostasAssistente["area"], number, number]> = [
      [{ forma: "referencia", referencia: "pequeno" }, 9, 5400],
      [{ forma: "referencia", referencia: "medio" }, 20, 12000],
      [{ forma: "referencia", referencia: "grande" }, 35, 21000],
    ];

    for (const [area, areaM2, calculado] of casos) {
      const recomendacao = cenario({ area });
      expect(recomendacao.areaM2).toBe(areaM2);
      expect(recomendacao.capacidadeCalculadaBtu).toBe(calculado);
      expect(
        recomendacao.suposicoes.some((texto) =>
          texto.includes("referência visual"),
        ),
      ).toBe(true);
    }
  });

  it("não multiplica a conta pelo tipo de ambiente, só muda o tipo indicado", () => {
    const quarto = cenario({ ambiente: "quarto" });
    const comercio = cenario({ ambiente: "comercio" });

    expect(comercio.capacidadeCalculadaBtu).toBe(quarto.capacidadeCalculadaBtu);
    expect(quarto.tipoIndicado).toBe("Split Hi-Wall");
    expect(comercio.tipoIndicado).toBe("Split Piso-teto");
  });

  it("indica Cassete em ambientes residenciais maiores", () => {
    const recomendacao = cenario({ area: metros(65), sol: "sem" });
    expect(recomendacao.areaM2).toBe(65);
    expect(recomendacao.tipoIndicado).toBe("Split Cassete");
  });

  it("trata a área mínima sem quebrar", () => {
    const recomendacao = cenario({ area: metros(1), sol: "sem" });
    expect(recomendacao.capacidadeCalculadaBtu).toBe(600);
    expect(recomendacao.capacidadeRecomendadaBtu).toBe(9000);
  });

  it("recusa área inválida", () => {
    expect(() => cenario({ area: metros(0) })).toThrow();
    expect(() =>
      cenario({ area: { forma: "dimensoes", largura: 0, comprimento: 4 } }),
    ).toThrow();
  });
});

describe("motor do Assistente — confiança", () => {
  it("é alta com área exata, sol informado e ambiente residencial", () => {
    const recomendacao = cenario({
      ambiente: "sala",
      area: { forma: "dimensoes", largura: 5, comprimento: 4 },
      sol: "manha",
    });
    expect(recomendacao.confianca).toBe("alta");
  });

  it("é média com área vinda de referência visual", () => {
    const recomendacao = cenario({
      area: { forma: "referencia", referencia: "medio" },
    });
    expect(recomendacao.confianca).toBe("media");
  });

  it("é baixa em comércio, cozinha e ambiente integrado com área estimada", () => {
    expect(cenario({ ambiente: "comercio" }).confianca).toBe("baixa");
    expect(cenario({ ambiente: "cozinha" }).confianca).toBe("baixa");
    expect(
      cenario({
        ambiente: "integrado",
        area: { forma: "referencia", referencia: "grande" },
      }).confianca,
    ).toBe("baixa");
  });

  it("não rebaixa um ambiente integrado com área exata", () => {
    const recomendacao = cenario({ ambiente: "integrado" });
    expect(recomendacao.confianca).toBe("alta");
    expect(recomendacao.avaliacaoTecnica).toBe(false);
  });

  it("recomenda avaliação técnica quando a confiança é baixa", () => {
    const recomendacao = cenario({ ambiente: "comercio" });
    expect(recomendacao.avaliacaoTecnica).toBe(true);
    expect(recomendacao.explicacao.toLowerCase()).toContain("avaliação");
  });
});

describe("motor do Assistente — resultado", () => {
  it("traz os fatores, as orientações e o aviso de estimativa", () => {
    const recomendacao = cenario({ area: metros(24), sol: "tarde" });

    expect(recomendacao.capacidadeRecomendadaBtu).toBe(18000);
    expect(recomendacao.fatores.map((item) => item.chave)).toEqual([
      "ambiente",
      "area",
      "sol",
      "pessoas",
      "eletronicos",
      "lampadas",
      "janelas",
    ]);
    expect(recomendacao.orientacoes).toEqual({
      tipo: expect.any(String),
      inverter: expect.any(String),
      instalacao: expect.any(String),
      vedacao: expect.any(String),
      limpeza: expect.any(String),
    });
    expect(recomendacao.explicacao).toContain("18.000 BTU/h");
    expect(recomendacao.avaliacaoTecnica).toBe(false);
  });

  it("mantém a confiança e a explicação curtas, sem prometer economia", () => {
    const recomendacao = cenario({ area: metros(24), sol: "tarde" });
    expect(recomendacao.explicacao.length).toBeLessThan(400);
    expect(recomendacao.explicacao.toLowerCase()).not.toContain("economia");
  });
});

describe("estado do Assistente na URL", () => {
  it("lê uma querystring vazia como estado vazio", () => {
    expect(lerEstadoAssistente(new URLSearchParams(""))).toEqual({});
  });

  it("lê e ignora valores inválidos", () => {
    const estado = lerEstadoAssistente(
      new URLSearchParams(
        "ambiente=quarto&forma=metros&area=20&sol=manha&pessoas=3-4&eletronicos=0&lampadas=2&janelas=abc",
      ),
    );
    expect(estado).toEqual({
      ambiente: "quarto",
      forma: "metros",
      area: 20,
      sol: "manha",
      pessoas: "3-4",
      eletronicos: 0,
      lampadas: 2,
    });
  });

  it("lê as três formas de área", () => {
    expect(
      lerEstadoAssistente(
        new URLSearchParams("forma=dimensoes&largura=5&comprimento=4"),
      ),
    ).toEqual({
      forma: "dimensoes",
      largura: 5,
      comprimento: 4,
    });
    expect(
      lerEstadoAssistente(
        new URLSearchParams("forma=referencia&referencia=medio"),
      ),
    ).toEqual({
      forma: "referencia",
      referencia: "medio",
    });
  });

  it("preserva zero nas contagens e decimais na área", () => {
    const estado = lerEstadoAssistente(
      new URLSearchParams(
        "forma=metros&area=12.5&eletronicos=0&lampadas=0&janelas=0",
      ),
    );
    expect(estado).toEqual({
      forma: "metros",
      area: 12.5,
      eletronicos: 0,
      lampadas: 0,
      janelas: 0,
    });
  });

  it("faz round-trip do estado completo em cada forma de área", () => {
    const estados = [
      {
        ambiente: "quarto" as const,
        forma: "metros" as const,
        area: 20,
        sol: "manha" as const,
        pessoas: "2" as const,
        eletronicos: 1,
        lampadas: 2,
        janelas: 3,
      },
      {
        ambiente: "sala" as const,
        forma: "dimensoes" as const,
        largura: 5,
        comprimento: 4,
        sol: "tarde" as const,
        pessoas: "3-4" as const,
        eletronicos: 0,
        lampadas: 0,
        janelas: 0,
      },
      {
        ambiente: "integrado" as const,
        forma: "referencia" as const,
        referencia: "grande" as const,
        sol: "nao-sei" as const,
        pessoas: "7+" as const,
        eletronicos: 4,
        lampadas: 10,
        janelas: 5,
      },
    ];

    for (const estado of estados) {
      expect(lerEstadoAssistente(escreverEstadoAssistente(estado))).toEqual(
        estado,
      );
    }
  });

  it("grava zero nas contagens quando a pessoa respondeu zero", () => {
    expect(
      escreverEstadoAssistente({
        ambiente: "sala",
        forma: "metros",
        area: 24,
        sol: "tarde",
        pessoas: "1",
        eletronicos: 0,
        lampadas: 0,
        janelas: 0,
      }).toString(),
    ).toBe(
      "ambiente=sala&forma=metros&area=24&sol=tarde&pessoas=1&eletronicos=0&lampadas=0&janelas=0",
    );
  });
});

describe("estado do Assistente — área e respostas completas", () => {
  it("deriva a área da forma escolhida", () => {
    expect(areaDe({ forma: "metros", area: 20 })).toEqual({
      forma: "metros",
      area: 20,
    });
    expect(areaDe({ forma: "dimensoes", largura: 5, comprimento: 4 })).toEqual({
      forma: "dimensoes",
      largura: 5,
      comprimento: 4,
    });
    expect(areaDe({ forma: "referencia", referencia: "medio" })).toEqual({
      forma: "referencia",
      referencia: "medio",
    });
  });

  it("só devolve respostas completas quando não falta nada", () => {
    const completo = {
      ambiente: "sala" as const,
      forma: "metros" as const,
      area: 24,
      sol: "tarde" as const,
      pessoas: "1" as const,
      eletronicos: 0,
      lampadas: 0,
      janelas: 0,
    };
    expect(respostasDe(completo)).not.toBeNull();
    expect(respostasDe({ ...completo, janelas: undefined })).toBeNull();
    expect(respostasDe({ ...completo, area: undefined })).toBeNull();
  });

  it("aponta a etapa inicial pela primeira resposta que falta", () => {
    expect(etapaInicial({})).toBe(0);
    expect(etapaInicial({ ambiente: "sala" })).toBe(1);
    expect(etapaInicial({ ambiente: "sala", forma: "metros", area: 20 })).toBe(
      2,
    );
    expect(
      etapaInicial({
        ambiente: "sala",
        forma: "metros",
        area: 20,
        sol: "tarde",
      }),
    ).toBe(3);
    expect(
      etapaInicial({
        ambiente: "sala",
        forma: "metros",
        area: 20,
        sol: "tarde",
        pessoas: "1",
      }),
    ).toBe(4);
    expect(
      etapaInicial({
        ambiente: "sala",
        forma: "metros",
        area: 20,
        sol: "tarde",
        pessoas: "1",
        eletronicos: 0,
        lampadas: 0,
        janelas: 0,
      }),
    ).toBe(5);
  });
});
