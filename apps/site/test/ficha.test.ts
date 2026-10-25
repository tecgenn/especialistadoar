import type {
  DadosDeclarados,
  Tensao,
  Variante,
} from "@especialista-do-ar/pipeline";
import { describe, expect, it } from "vitest";
import {
  agruparVariantes,
  descreverCapacidade,
  formatarCelula,
  formatarFaixa,
  type GradeCondicoes,
  gradeDeCondicoes,
  type LinhaCondicoes,
  resumoDaFicha,
  titulosDosBlocos,
} from "../src/lib/ficha.ts";

function dados(over: Partial<DadosDeclarados> = {}): DadosDeclarados {
  return {
    capacidadeNominalBtu: null,
    capacidadeNominalW: null,
    potenciaEsperaW: null,
    capacidade35TotalW: null,
    potencia35TotalW: null,
    capacidade35ParcialW: null,
    potencia35ParcialW: null,
    capacidade29ParcialW: null,
    potencia29ParcialW: null,
    capacidade29TotalW: null,
    potencia29TotalW: null,
    idrs: null,
    consumoAnualKwh: null,
    classe: null,
    ...over,
  };
}

function tensao(voltagens: number[], fases: string[] = ["monofásico"]): Tensao {
  return { voltagens, fases };
}

function variante(over: Partial<Variante> = {}): Variante {
  return {
    tensao: null,
    dados: dados(),
    linhas: [],
    ...over,
  };
}

const dadosCheios = dados({
  capacidadeNominalBtu: 7500,
  capacidadeNominalW: 2197,
  potenciaEsperaW: 1,
  capacidade35TotalW: 2200,
  potencia35TotalW: 740,
  idrs: 2.97,
  consumoAnualKwh: 15.5,
  classe: "A",
});

describe("agruparVariantes", () => {
  it("funde Variantes de dados idênticos e une as tensões", () => {
    const blocos = agruparVariantes([
      variante({ tensao: tensao([220]), dados: dadosCheios, linhas: [784] }),
      variante({ tensao: tensao([127]), dados: dadosCheios, linhas: [5867] }),
    ]);

    expect(blocos).toHaveLength(1);
    expect(blocos[0]?.tensao?.voltagens).toEqual([127, 220]);
    expect(blocos[0]?.linhas).toEqual([784, 5867]);
  });

  it("omite as Variantes sem nenhum dado", () => {
    const blocos = agruparVariantes([
      variante({ linhas: [1, 2] }),
      variante({ tensao: tensao([220]), dados: dadosCheios, linhas: [3] }),
    ]);

    expect(blocos).toHaveLength(1);
    expect(blocos[0]?.linhas).toEqual([3]);
  });

  it("preserva as Variantes divergentes, na ordem da primeira aparição", () => {
    const outro = dados({ ...dadosCheios, idrs: 3.12, classe: "B" });
    const blocos = agruparVariantes([
      variante({ tensao: tensao([220]), dados: dadosCheios, linhas: [10] }),
      variante({ tensao: tensao([127]), dados: outro, linhas: [20] }),
    ]);

    expect(blocos.map((bloco) => bloco.dados.idrs)).toEqual([2.97, 3.12]);
  });

  it("mantém a tensão quando só um dos lados a declara", () => {
    const blocos = agruparVariantes([
      variante({ tensao: null, dados: dadosCheios, linhas: [10] }),
      variante({ tensao: tensao([220]), dados: dadosCheios, linhas: [11] }),
    ]);

    expect(blocos[0]?.tensao?.voltagens).toEqual([220]);
  });

  it("preserva a correspondência entre voltagem e fase", () => {
    const blocos = agruparVariantes([
      variante({
        tensao: tensao([380], ["trifásico"]),
        dados: dadosCheios,
        linhas: [3562],
      }),
      variante({
        tensao: tensao([220], ["monofásico", "bifásico"]),
        dados: dadosCheios,
        linhas: [4314],
      }),
    ]);

    expect(blocos[0]?.tensao?.fasesPorVoltagem).toEqual([
      { voltagem: 220, fases: ["monofásico", "bifásico"] },
      { voltagem: 380, fases: ["trifásico"] },
    ]);
  });
});

describe("resumoDaFicha", () => {
  it("reduz o Aparelho a valores únicos e ordenados", () => {
    const outro = dados({
      ...dadosCheios,
      capacidadeNominalBtu: 9000,
      classe: "B",
    });
    const resumo = resumoDaFicha(
      agruparVariantes([
        variante({ dados: outro }),
        variante({ dados: dadosCheios }),
      ]),
    );

    expect(resumo.capacidadesBtu).toEqual([7500, 9000]);
    expect(resumo.classes).toEqual(["A", "B"]);
    expect(resumo.idrs).toEqual([2.97]);
    expect(resumo.consumosKwh).toEqual([15.5]);
    expect(resumo.potenciasEsperaW).toEqual([1]);
  });

  it("mostra faixa quando os valores divergem e mantém um só quando iguais", () => {
    const resumo = resumoDaFicha([
      { tensao: null, dados: dadosCheios, linhas: [] },
      {
        tensao: null,
        dados: dados({ ...dadosCheios, capacidadeNominalW: 2638 }),
        linhas: [],
      },
    ]);

    expect(descreverCapacidade(resumo)).toBe("7.500 BTU/h (2.197 – 2.638 W)");
    expect(formatarFaixa(resumo.idrs)).toBe("2,97");
    expect(formatarFaixa(resumo.consumosKwh, " kWh/ano")).toBe("15,5 kWh/ano");
  });

  it("usa — para valor ausente", () => {
    const resumo = resumoDaFicha([
      { tensao: null, dados: dados({ classe: "A" }), linhas: [] },
    ]);

    expect(descreverCapacidade(resumo)).toBe("—");
    expect(formatarFaixa(resumo.idrs)).toBe("—");
    expect(formatarFaixa(resumo.consumosKwh)).toBe("—");
    expect(resumo.classes).toEqual(["A"]);
  });
});

function linha(grade: GradeCondicoes, indice: number): LinhaCondicoes {
  const encontrada = grade.linhas[indice];
  if (encontrada === undefined) {
    throw new Error(`esperava a linha ${indice} da grade`);
  }
  return encontrada;
}

describe("titulosDosBlocos", () => {
  it("numera as declarações só quando a mesma tensão se repete", () => {
    const titulos = titulosDosBlocos([
      { tensao: null, dados: dadosCheios, linhas: [] },
    ]);
    expect(titulos).toEqual(["Tensão: —"]);

    const repetidos = titulosDosBlocos([
      { tensao: null, dados: dadosCheios, linhas: [] },
      { tensao: null, dados: { ...dadosCheios, idrs: 3 }, linhas: [] },
    ]);
    expect(repetidos[0]).toContain("declaração 1 de 2");
    expect(repetidos[1]).toContain("declaração 2 de 2");
  });

  it("não associa a fase de uma voltagem à outra", () => {
    const blocos = agruparVariantes([
      variante({
        tensao: tensao([380], ["trifásico"]),
        dados: dadosCheios,
        linhas: [3562],
      }),
      variante({
        tensao: tensao([220], ["monofásico", "bifásico"]),
        dados: dadosCheios,
        linhas: [4314],
      }),
    ]);

    expect(titulosDosBlocos(blocos)).toEqual([
      "Tensão: 220 / 380 V · 220 V: monofásico, bifásico · 380 V: trifásico",
    ]);
  });

  it("une as fases quando todas as voltagens aceitam as mesmas", () => {
    const blocos = agruparVariantes([
      variante({
        tensao: tensao([127], ["monofásico"]),
        dados: dadosCheios,
        linhas: [5867],
      }),
      variante({
        tensao: tensao([220], ["monofásico"]),
        dados: dadosCheios,
        linhas: [784],
      }),
    ]);

    expect(titulosDosBlocos(blocos)).toEqual([
      "Tensão: 127 / 220 V · monofásico",
    ]);
  });
});

describe("gradeDeCondicoes", () => {
  it("monta a grade 2×2 com capacidade e potência por condição", () => {
    const grade = gradeDeCondicoes(
      dados({
        capacidade35TotalW: 2200,
        potencia35TotalW: 740,
        capacidade29ParcialW: 1200,
        potencia29ParcialW: 300,
      }),
    );

    expect(grade.linhas.map((linha) => linha.temperatura)).toEqual([35, 29]);
    expect(grade.mostrarTotal).toBe(true);
    expect(grade.mostrarParcial).toBe(true);
    expect(formatarCelula(linha(grade, 0).total)).toBe("2.200 / 740 W");
    expect(formatarCelula(linha(grade, 1).parcial)).toBe("1.200 / 300 W");
    expect(formatarCelula(linha(grade, 0).parcial)).toBe("—");
  });

  it("mantém o par capacidade / potência quando falta um dos valores", () => {
    expect(formatarCelula({ capacidadeW: null, potenciaW: 8680 })).toBe(
      "— / 8.680 W",
    );
    expect(formatarCelula({ capacidadeW: 245, potenciaW: null })).toBe(
      "245 / — W",
    );
    expect(formatarCelula({ capacidadeW: null, potenciaW: null })).toBe("—");
  });

  it("oculta a coluna sem nenhum dado", () => {
    const grade = gradeDeCondicoes(
      dados({ capacidade35TotalW: 2200, potencia35TotalW: 740 }),
    );

    expect(grade.linhas.map((linha) => linha.temperatura)).toEqual([35]);
    expect(grade.mostrarTotal).toBe(true);
    expect(grade.mostrarParcial).toBe(false);
  });

  it("devolve grade vazia quando não há condições de ensaio", () => {
    const grade = gradeDeCondicoes(dados({ capacidadeNominalBtu: 12000 }));

    expect(grade.linhas).toEqual([]);
    expect(grade.mostrarTotal).toBe(false);
    expect(grade.mostrarParcial).toBe(false);
  });
});
