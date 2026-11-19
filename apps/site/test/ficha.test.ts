import type {
  DadosDeclarados,
  RegistroInmetro,
  Tensao,
  Variante,
} from "@especialista-do-ar/pipeline";
import { describe, expect, it } from "vitest";
import {
  agruparVariantes,
  cartoesDeDestaque,
  descreverCapacidade,
  EXPLICADORES_DA_FICHA,
  etiquetasDaFicha,
  formatarCelula,
  formatarFaixa,
  type GradeCondicoes,
  gradeDeCondicoes,
  indiceDaFicha,
  type LinhaCondicoes,
  resumoDaFicha,
  situacaoDosRegistros,
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

function registro(numero: string, status: string): RegistroInmetro {
  return { numero, status };
}

describe("etiquetasDaFicha", () => {
  it("mostra a Classe única e a situação Ativo quando um Registro está Ativo", () => {
    const resumo = resumoDaFicha([
      { tensao: null, dados: dadosCheios, linhas: [] },
    ]);
    const etiquetas = etiquetasDaFicha(resumo, [
      registro("000377/2021", "Ativo"),
      registro("004629/2020", "Inativo"),
    ]);

    expect(etiquetas.classe).toBe("A");
    expect(etiquetas.classes).toEqual(["A"]);
    expect(etiquetas.situacao).toBe("Ativo");
    expect(etiquetas.registros).toEqual(["000377/2021", "004629/2020"]);
  });

  it("mostra a Classe em faixa quando as Variantes divergem", () => {
    const resumo = resumoDaFicha([
      { tensao: null, dados: dadosCheios, linhas: [] },
      {
        tensao: null,
        dados: dados({ ...dadosCheios, classe: "C" }),
        linhas: [],
      },
    ]);

    expect(etiquetasDaFicha(resumo, []).classe).toBe("A – C");
  });

  it("mostra Inativo quando nenhum Registro está Ativo e — sem Classe", () => {
    const resumo = resumoDaFicha([
      { tensao: null, dados: dados({ classe: null }), linhas: [] },
    ]);
    const etiquetas = etiquetasDaFicha(resumo, [
      registro("000945/2021", "Inativo"),
    ]);

    expect(etiquetas.situacao).toBe("Inativo");
    expect(etiquetas.classe).toBe("—");
    expect(etiquetas.registros).toEqual(["000945/2021"]);
  });

  it("não inventa situação nem Registro quando não há Registro", () => {
    const resumo = resumoDaFicha([
      { tensao: null, dados: dadosCheios, linhas: [] },
    ]);

    expect(situacaoDosRegistros([])).toBe("—");
    expect(etiquetasDaFicha(resumo, []).registros).toEqual([]);
  });
});

describe("cartoesDeDestaque", () => {
  it("traz IDRS, Consumo anual e Capacidade com unidade e legenda", () => {
    const resumo = resumoDaFicha([
      { tensao: null, dados: dadosCheios, linhas: [] },
    ]);
    const cartoes = cartoesDeDestaque(resumo);

    expect(cartoes.map((cartao) => cartao.chave)).toEqual([
      "idrs",
      "consumo",
      "capacidade",
    ]);
    expect(cartoes[0]?.valor).toBe("2,97");
    expect(cartoes[0]?.legenda).toContain("eficiência");
    expect(cartoes[1]?.valor).toBe("15,5 kWh/ano");
    expect(cartoes[1]?.legenda).toContain("2.080 h/ano");
    expect(cartoes[1]?.ancora).toBe("#consumo-e-custo");
    expect(cartoes[2]?.valor).toBe("7.500 BTU/h");
  });

  it("vira faixa quando o Aparelho tem mais de uma Variante", () => {
    const resumo = resumoDaFicha([
      { tensao: null, dados: dadosCheios, linhas: [] },
      {
        tensao: null,
        dados: dados({
          ...dadosCheios,
          idrs: 3.5,
          consumoAnualKwh: 18,
          capacidadeNominalBtu: 9000,
        }),
        linhas: [],
      },
    ]);
    const cartoes = cartoesDeDestaque(resumo);

    expect(cartoes[0]?.valor).toBe("2,97 – 3,5");
    expect(cartoes[1]?.valor).toBe("15,5 – 18 kWh/ano");
    expect(cartoes[2]?.valor).toBe("7.500 – 9.000 BTU/h");
  });
});

describe("indiceDaFicha", () => {
  it("lista apenas as seções que existem, na ordem de leitura", () => {
    const indice = indiceDaFicha(
      new Set([
        "resumo",
        "entenda-os-numeros",
        "consumo-e-custo",
        "proveniencia",
      ]),
    );

    expect(indice).toEqual([
      { id: "resumo", rotulo: "Resumo" },
      { id: "entenda-os-numeros", rotulo: "Entenda os números" },
      { id: "consumo-e-custo", rotulo: "Consumo e custo" },
      { id: "proveniencia", rotulo: "Proveniência" },
    ]);
  });

  it("inclui Ofertas e Registros só quando presentes", () => {
    const completo = indiceDaFicha(
      new Set([
        "resumo",
        "entenda-os-numeros",
        "consumo-e-custo",
        "condicoes-de-ensaio",
        "especificacoes",
        "registros",
        "proveniencia",
        "ofertas",
      ]),
    );

    expect(completo.map((secao) => secao.id)).toEqual([
      "resumo",
      "entenda-os-numeros",
      "consumo-e-custo",
      "condicoes-de-ensaio",
      "especificacoes",
      "registros",
      "proveniencia",
      "ofertas",
    ]);
    expect(indiceDaFicha(new Set(["resumo"]))).toEqual([
      { id: "resumo", rotulo: "Resumo" },
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

describe("EXPLICADORES_DA_FICHA", () => {
  function textoDe(
    explicador: (typeof EXPLICADORES_DA_FICHA)[number] | undefined,
  ): string {
    return explicador?.paragrafos.join(" ") ?? "";
  }

  it("explica IDRS, Classe, Consumo anual e status do Registro", () => {
    expect(
      EXPLICADORES_DA_FICHA.map((explicador) => explicador.titulo),
    ).toEqual([
      "IDRS",
      "Classe energética",
      "Consumo anual",
      "Status do Registro",
    ]);
    for (const explicador of EXPLICADORES_DA_FICHA) {
      expect(explicador.paragrafos.length).toBeGreaterThan(0);
      for (const paragrafo of explicador.paragrafos) {
        expect(paragrafo.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("traz os fatos que cada número pede", () => {
    const [idrs, classe, consumo, registro] = EXPLICADORES_DA_FICHA;

    expect(textoDe(idrs)).toContain("eficiência");
    expect(textoDe(idrs)).toContain("maior");
    expect(textoDe(idrs)).toContain("Valor oficial");

    expect(textoDe(classe)).toContain("A a F");
    expect(textoDe(classe)).toContain("INMETRO");
    expect(textoDe(classe)).toContain("não é recalculada");

    expect(textoDe(consumo)).toContain("2.080");
    expect(textoDe(consumo)).toContain("5,7");

    expect(textoDe(registro)).toContain("Ativo");
    expect(textoDe(registro)).toContain("Cancelado");
    expect(textoDe(registro)).toContain("Inativo");
    expect(textoDe(registro)).toContain("ao menos um");
  });

  it("não promete economia nem recomenda compra", () => {
    for (const explicador of EXPLICADORES_DA_FICHA) {
      const texto = explicador.paragrafos.join(" ").toLowerCase();
      for (const termo of [
        "economize",
        "economia",
        "recomenda",
        "melhor",
        "mais barato",
        "menor preço",
        "r$",
      ]) {
        expect(texto).not.toContain(termo);
      }
    }
  });
});
