import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import {
  capacidadesComDestaque,
  contagensPorCapacidade,
  contarBase,
  destaquesPorCapacidade,
  EXPLICACAO_DO_RECORTE,
  formatarCapacidade,
  formatarNumero,
  jsonLdPerguntasFrequentes,
  linkDaTabela,
  PERGUNTAS_FREQUENTES,
} from "../src/lib/home.ts";
import type { Oferta } from "../src/lib/ofertas.ts";

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

describe("contagens por capacidade", () => {
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
});

describe("destaques por capacidade (ticket 96)", () => {
  function oferta(
    aparelhoId: string,
    titulo?: string,
    loja = "Loja Fixture",
    indice = 1,
  ): Oferta {
    return {
      aparelhoId,
      loja,
      url: `https://loja.example.com/${aparelhoId}${indice === 1 ? "" : `/${indice}`}`,
      ...(titulo === undefined ? {} : { titulo }),
    };
  }

  it("só inclui Aparelhos da capacidade com Análise publicada ou Oferta", () => {
    const dataset = [
      item({ id: "sem", capacidadesBtu: [9000] }),
      item({ id: "analisado", capacidadesBtu: [9000] }),
      item({ id: "ofertado", capacidadesBtu: [9000] }),
      item({ id: "outra", capacidadesBtu: [12000] }),
    ];
    const cartoes = destaquesPorCapacidade(
      {
        dataset,
        analisesPorAparelho: new Map([
          ["analisado", { titulo: "Análise A", url: "/analises/a/" }],
        ]),
        ofertasPorAparelho: new Map([["ofertado", [oferta("ofertado")]]]),
      },
      9000,
    );
    expect(cartoes.map((cartao) => cartao.aparelhoId)).toEqual([
      "analisado",
      "ofertado",
    ]);
  });

  it("limita a três cartões e não repete um Aparelho com Análise e Oferta", () => {
    const dataset = ["a", "b", "c", "d", "e"].map((id) =>
      item({ id, capacidadesBtu: [12000] }),
    );
    const cartoes = destaquesPorCapacidade(
      {
        dataset,
        analisesPorAparelho: new Map([
          ["a", { titulo: "Análise A", url: "/analises/a/" }],
        ]),
        ofertasPorAparelho: new Map(
          ["a", "b", "c", "d", "e"].map((id) => [id, [oferta(id)]]),
        ),
      },
      12000,
    );
    expect(cartoes.map((cartao) => cartao.aparelhoId)).toEqual(["a", "b", "c"]);
  });

  it("abre com os analisados e depois mantém a ordem da base", () => {
    const dataset = [
      item({ id: "ofertado-1", capacidadesBtu: [9000] }),
      item({ id: "analisado", capacidadesBtu: [9000] }),
      item({ id: "ofertado-2", capacidadesBtu: [9000] }),
    ];
    const cartoes = destaquesPorCapacidade(
      {
        dataset,
        analisesPorAparelho: new Map([
          ["analisado", { titulo: "Análise A", url: "/analises/a/" }],
        ]),
        ofertasPorAparelho: new Map([
          ["ofertado-1", [oferta("ofertado-1")]],
          ["ofertado-2", [oferta("ofertado-2")]],
        ]),
      },
      9000,
    );
    expect(cartoes.map((cartao) => cartao.aparelhoId)).toEqual([
      "analisado",
      "ofertado-1",
      "ofertado-2",
    ]);
  });

  it("expõe marca, modelo, capacidade, tipo, IDRS, consumo e os links", () => {
    const [cartao] = destaquesPorCapacidade(
      {
        dataset: [
          item({
            id: "a",
            marca: "MIDEA",
            modelo: "Modelo A",
            capacidadesBtu: [12000],
            tipo: "Split Hi-Wall",
            idrs: [3.5, 4.2],
            consumosKwh: [300, 420],
          }),
        ],
        analisesPorAparelho: new Map([
          ["a", { titulo: "Análise A", url: "/analises/a/" }],
        ]),
        ofertasPorAparelho: new Map([["a", [oferta("a", "Comprar na Loja")]]]),
      },
      12000,
    );
    expect(cartao).toEqual({
      aparelhoId: "a",
      marca: "MIDEA",
      modelo: "Modelo A",
      capacidadeBtu: 12000,
      tipo: "Split Hi-Wall",
      idrs: [3.5, 4.2],
      consumoAnualKwh: [300, 420],
      analise: { titulo: "Análise A", url: "/analises/a/" },
      ofertas: [
        {
          url: "https://loja.example.com/a",
          loja: "Loja Fixture",
          rotulo: "Comprar na Loja",
        },
      ],
    });
  });

  it("entrega uma única Oferta como uma lista de um, sem descartá-la", () => {
    const [cartao] = destaquesPorCapacidade(
      {
        dataset: [item({ id: "a", capacidadesBtu: [12000] })],
        analisesPorAparelho: new Map(),
        ofertasPorAparelho: new Map([
          ["a", [oferta("a", undefined, "Mercado Livre")]],
        ]),
      },
      12000,
    );
    expect(cartao?.ofertas).toEqual([
      {
        url: "https://loja.example.com/a",
        loja: "Mercado Livre",
        rotulo: "Ver oferta",
      },
    ]);
  });

  it("mantém as duas Ofertas na ordem do arquivo, sem escolher a melhor loja", () => {
    const [cartao] = destaquesPorCapacidade(
      {
        dataset: [item({ id: "a", capacidadesBtu: [12000] })],
        analisesPorAparelho: new Map(),
        ofertasPorAparelho: new Map([
          [
            "a",
            [
              oferta("a", undefined, "Mercado Livre", 1),
              oferta("a", undefined, "Amazon", 2),
            ],
          ],
        ]),
      },
      12000,
    );
    expect(cartao?.ofertas).toEqual([
      {
        url: "https://loja.example.com/a",
        loja: "Mercado Livre",
        rotulo: "Ver oferta",
      },
      {
        url: "https://loja.example.com/a/2",
        loja: "Amazon",
        rotulo: "Ver oferta",
      },
    ]);
  });

  it("escolhe só capacidades curadas com destaque, na ordem da curadoria e sem teto", () => {
    const dataset = [
      item({ id: "a", capacidadesBtu: [9000] }),
      item({ id: "b", capacidadesBtu: [12000] }),
      item({ id: "c", capacidadesBtu: [18000] }),
      item({ id: "d", capacidadesBtu: [36000] }),
    ];
    const analisesPorAparelho = new Map<
      string,
      { titulo: string; url: string }
    >();
    const ofertasPorAparelho = new Map<string, Oferta[]>([
      ["a", [oferta("a")]],
      ["b", [oferta("b")]],
      ["c", [oferta("c")]],
      ["d", [oferta("d")]],
    ]);
    const blocos = capacidadesComDestaque(
      { dataset, analisesPorAparelho, ofertasPorAparelho },
      curadoria,
    );
    expect(blocos.map((bloco) => bloco.capacidadeBtu)).toEqual([
      36000, 9000, 12000,
    ]);
    expect(
      blocos.map((bloco) => bloco.cartoes.map((cartao) => cartao.aparelhoId)),
    ).toEqual([["d"], ["a"], ["b"]]);
  });
});
