import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import { describe, expect, it } from "vitest";
import {
  type AnalisadoVitrine,
  type Analise,
  type AnaliseFrontmatter,
  type AparelhoComCapacidades,
  agruparAnalisadosPorCapacidade,
  indexarAnalises,
  linksDaTabelaPorCapacidade,
  listaAnalisesJson,
  mapaPorAparelho,
  montarAnalises,
  montarVitrine,
  secaoVisivel,
  VITRINE_MAXIMO,
  validarAnalises,
} from "../src/lib/analises.ts";

function analise(over: Partial<AnaliseFrontmatter> = {}): AnaliseFrontmatter {
  return {
    aparelhoId: "ap-aaaaaaaaaaaa",
    slug: "marca-modelo-decisao",
    titulo: "Vale a pena o modelo?",
    descricao: "Uma leitura editorial do modelo.",
    data: "2026-10-20",
    ...over,
  };
}

function montada(over: Partial<AnaliseFrontmatter> = {}): Analise {
  const [primeira] = montarAnalises([analise(over)]);
  if (primeira === undefined) {
    throw new Error("esperava uma Análise montada");
  }
  return primeira;
}

describe("linksDaTabelaPorCapacidade", () => {
  it("liga uma capacidade à tabela filtrada, com separador de milhar", () => {
    expect(linksDaTabelaPorCapacidade([12000])).toEqual([
      { rotulo: "Ver outros de 12.000 BTU/h", href: "/aparelhos/?btu=12000" },
    ]);
  });

  it("devolve uma ação por capacidade distinta, em ordem crescente", () => {
    expect(linksDaTabelaPorCapacidade([12000, 9000, 12000])).toEqual([
      { rotulo: "Ver outros de 9.000 BTU/h", href: "/aparelhos/?btu=9000" },
      { rotulo: "Ver outros de 12.000 BTU/h", href: "/aparelhos/?btu=12000" },
    ]);
  });

  it("sem capacidade, manda para a tabela inteira", () => {
    expect(linksDaTabelaPorCapacidade([])).toEqual([
      { rotulo: "Ver todos os aparelhos", href: "/aparelhos/" },
    ]);
  });
});

describe("validarAnalises", () => {
  it("aceita Análises bem formadas", () => {
    expect(() => validarAnalises([analise()])).not.toThrow();
    expect(() =>
      validarAnalises([
        analise(),
        analise({
          aparelhoId: "ap-bbbbbbbbbbbb",
          slug: "outro-modelo-decisao",
        }),
      ]),
    ).not.toThrow();
  });

  it("aceita lista vazia (zero Análises é um site válido)", () => {
    expect(() => validarAnalises([])).not.toThrow();
  });

  it("recusa lista que não é array", () => {
    expect(() =>
      validarAnalises({} as unknown as AnaliseFrontmatter[]),
    ).toThrow(/lista/);
  });

  it("recusa campo obrigatório em branco", () => {
    expect(() => validarAnalises([analise({ aparelhoId: " " })])).toThrow(
      /aparelhoId/,
    );
    expect(() => validarAnalises([analise({ slug: "" })])).toThrow(/slug/);
    expect(() => validarAnalises([analise({ titulo: "  " })])).toThrow(
      /titulo/,
    );
    expect(() => validarAnalises([analise({ descricao: "" })])).toThrow(
      /descricao/,
    );
    expect(() => validarAnalises([analise({ data: "" })])).toThrow(/data/);
  });

  it("recusa aparelhoId fora do formato ap-<12 hex>", () => {
    expect(() => validarAnalises([analise({ aparelhoId: "ap-123" })])).toThrow(
      /aparelhoId/,
    );
    expect(() =>
      validarAnalises([analise({ aparelhoId: "ap-zzzzzzzzzzzz" })]),
    ).toThrow(/aparelhoId/);
    expect(() => validarAnalises([analise({ aparelhoId: "123" })])).toThrow(
      /aparelhoId/,
    );
  });

  it("recusa slug com barra", () => {
    expect(() => validarAnalises([analise({ slug: "marca/modelo" })])).toThrow(
      /slug/,
    );
  });

  it("recusa data fora do formato YYYY-MM-DD", () => {
    expect(() => validarAnalises([analise({ data: "20/10/2026" })])).toThrow(
      /data/,
    );
    expect(() => validarAnalises([analise({ data: "2026-1-1" })])).toThrow(
      /data/,
    );
  });

  it("recusa slug repetido", () => {
    expect(() =>
      validarAnalises([analise(), analise({ aparelhoId: "ap-bbbbbbbbbbbb" })]),
    ).toThrow(/slug/);
  });

  it("recusa mais de uma Análise para o mesmo Aparelho", () => {
    expect(() =>
      validarAnalises([analise(), analise({ slug: "outro-modelo-decisao" })]),
    ).toThrow(/Aparelho/);
  });

  it("não recusa aparelhoId ausente da base servida (degradação)", () => {
    expect(() =>
      validarAnalises([analise({ aparelhoId: "ap-000000000000" })]),
    ).not.toThrow();
  });
});

describe("montarAnalises", () => {
  it("acrescenta a url da seção e ordena por data (mais recente primeiro)", () => {
    const antiga = analise({
      aparelhoId: "ap-bbbbbbbbbbbb",
      slug: "antiga",
      data: "2026-01-02",
    });
    const recente = analise({ slug: "recente", data: "2026-10-20" });
    const montadas = montarAnalises([antiga, recente]);
    expect(montadas.map((item) => item.slug)).toEqual(["recente", "antiga"]);
    expect(montadas[0]).toEqual({
      ...recente,
      url: "/analises/recente/",
    });
  });

  it("não altera a lista de entrada", () => {
    const original = [analise()];
    const copia = structuredClone(original);
    montarAnalises(original);
    expect(original).toEqual(copia);
  });

  it("valida antes de montar", () => {
    expect(() => montarAnalises([analise({ titulo: "" })])).toThrow(/titulo/);
  });
});

describe("indexarAnalises", () => {
  it("indexa por slug", () => {
    const a = montada({ slug: "a" });
    const b = montada({ slug: "b", aparelhoId: "ap-bbbbbbbbbbbb" });
    const mapa = indexarAnalises([a, b]);
    expect(mapa.get("a")).toEqual(a);
    expect(mapa.get("b")).toEqual(b);
    expect(mapa.get("z")).toBeUndefined();
  });
});

describe("mapaPorAparelho", () => {
  it("indexa por aparelhoId", () => {
    const a = montada();
    const mapa = mapaPorAparelho([a]);
    expect(mapa.get("ap-aaaaaaaaaaaa")).toEqual(a);
    expect(mapa.get("ap-bbbbbbbbbbbb")).toBeUndefined();
  });
});

describe("listaAnalisesJson", () => {
  it("projeta só os campos publicados no analises.json", () => {
    const analiseMontada = montada();
    expect(listaAnalisesJson([analiseMontada])).toEqual([
      {
        slug: "marca-modelo-decisao",
        url: "/analises/marca-modelo-decisao/",
        aparelhoId: "ap-aaaaaaaaaaaa",
        titulo: "Vale a pena o modelo?",
        descricao: "Uma leitura editorial do modelo.",
        data: "2026-10-20",
      },
    ]);
  });
});

describe("secaoVisivel", () => {
  it("só é visível com pelo menos uma Análise", () => {
    expect(secaoVisivel([])).toBe(false);
    expect(secaoVisivel(montarAnalises([analise()]))).toBe(true);
  });
});

describe("agruparAnalisadosPorCapacidade", () => {
  function aparelho(
    over: Partial<AparelhoComCapacidades> = {},
  ): AparelhoComCapacidades {
    return {
      id: "ap-aaaaaaaaaaaa",
      marca: "SAMSUNG",
      modelo: "AR60H12D1CWNAZ",
      capacidadesBtu: [12000],
      ...over,
    };
  }

  it("indexa o analisado pela capacidade exata da base servida", () => {
    const mapa = agruparAnalisadosPorCapacidade([montada()], [aparelho()]);

    expect(mapa.get(12000)).toEqual([
      {
        aparelhoId: "ap-aaaaaaaaaaaa",
        titulo: "Vale a pena o modelo?",
        url: "/analises/marca-modelo-decisao/",
        marca: "SAMSUNG",
        modelo: "AR60H12D1CWNAZ",
        capacidadeBtu: 12000,
      },
    ]);
    expect(mapa.get(9000)).toBeUndefined();
  });

  it("entra em todas as capacidades declaradas pelo Aparelho, sem repetir", () => {
    const mapa = agruparAnalisadosPorCapacidade(
      [montada()],
      [aparelho({ capacidadesBtu: [12000, 18000, 12000] })],
    );

    expect(mapa.get(12000)).toHaveLength(1);
    expect(mapa.get(18000)).toHaveLength(1);
    expect(mapa.size).toBe(2);
  });

  it("ignora Análise de Aparelho ausente da Versão atual", () => {
    const mapa = agruparAnalisadosPorCapacidade([montada()], []);
    expect(mapa.size).toBe(0);
  });

  it("com zero Análises devolve mapa vazio", () => {
    expect(agruparAnalisadosPorCapacidade([], [aparelho()]).size).toBe(0);
  });

  it("mantém a ordem das Análises na mesma capacidade", () => {
    const recente = montada({ slug: "recente", data: "2026-10-20" });
    const antiga = montada({
      slug: "antiga",
      data: "2026-10-18",
      aparelhoId: "ap-bbbbbbbbbbbb",
    });
    const mapa = agruparAnalisadosPorCapacidade(
      [recente, antiga],
      [aparelho(), aparelho({ id: "ap-bbbbbbbbbbbb", modelo: "Outro modelo" })],
    );

    expect(mapa.get(12000)?.map((item) => item.titulo)).toEqual([
      "Vale a pena o modelo?",
      "Vale a pena o modelo?",
    ]);
    expect(mapa.get(12000)?.map((item) => item.url)).toEqual([
      "/analises/recente/",
      "/analises/antiga/",
    ]);
  });
});

/**
 * Ticket 52: a vitrine "Aparelhos com análise" nunca some quando há ao menos
 * uma Análise. Os compatíveis (passam no recorte) vêm primeiro; os similares
 * completam até seis cartões, ordenados por capacidade → marca conhecida →
 * atributos em comum → recência. Recorte vazio pula a capacidade.
 */
describe("montarVitrine", () => {
  function item(over: Partial<ItemConsulta> = {}): ItemConsulta {
    return {
      id: "ap-aaaaaaaaaaaa",
      marca: "SAMSUNG",
      marcaCatalogo: "SAMSUNG",
      modelo: "Modelo",
      tipo: "Split Hi-Wall",
      funcao: "Frio",
      capacidadesBtu: [12000],
      tensoes: [220],
      classes: ["A"],
      idrs: [5],
      consumosKwh: [200],
      ...over,
    };
  }

  function analisado(
    over: Partial<ItemConsulta> = {},
    titulo = "Uma análise",
  ): AnalisadoVitrine {
    const consulta = item(over);
    return {
      item: consulta,
      titulo,
      url: `/analises/${consulta.id}/`,
    };
  }

  function ids(cartoes: ReturnType<typeof montarVitrine>): string[] {
    return cartoes.map((cartao) => cartao.item.id);
  }

  it("põe os compatíveis primeiro, mesmo quando o similar tem a capacidade exata", () => {
    const compativel = analisado({
      id: "ap-aaaaaaaaaaaa",
      capacidadesBtu: [30000],
    });
    const similar = analisado({
      id: "ap-bbbbbbbbbbbb",
      capacidadesBtu: [12000],
    });

    const cartoes = montarVitrine([similar, compativel], {
      filtrados: [compativel.item],
      recorte: { btu: 12000 },
    });

    expect(ids(cartoes)).toEqual(["ap-aaaaaaaaaaaa", "ap-bbbbbbbbbbbb"]);
    expect(cartoes.map((cartao) => cartao.foraDoRecorte)).toEqual([
      false,
      true,
    ]);
  });

  it("entre compatíveis, abre pelas capacidades mais compradas e depois pela recência", () => {
    const grande = analisado({
      id: "ap-aaaaaaaaaaaa",
      capacidadesBtu: [30000],
    });
    const pequeno = analisado({
      id: "ap-bbbbbbbbbbbb",
      capacidadesBtu: [9000],
    });

    const cartoes = montarVitrine([grande, pequeno], {
      filtrados: [grande.item, pequeno.item],
      recorte: {},
    });

    expect(ids(cartoes)).toEqual(["ap-bbbbbbbbbbbb", "ap-aaaaaaaaaaaa"]);
  });

  it("ordena os similares por capacidade exata, depois distância relativa", () => {
    const exato = analisado({ id: "ap-aaaaaaaaaaaa", capacidadesBtu: [12000] });
    const abaixo = analisado({ id: "ap-bbbbbbbbbbbb", capacidadesBtu: [9000] });
    const acima = analisado({ id: "ap-cccccccccccc", capacidadesBtu: [18000] });
    const distante = analisado({
      id: "ap-dddddddddddd",
      capacidadesBtu: [24000],
    });

    const cartoes = montarVitrine([distante, acima, abaixo, exato], {
      filtrados: [item({ id: "ap-eeeeeeeeeeee", capacidadesBtu: [12000] })],
      recorte: { btu: 12000 },
    });

    expect(ids(cartoes)).toEqual([
      "ap-aaaaaaaaaaaa",
      "ap-bbbbbbbbbbbb",
      "ap-cccccccccccc",
      "ap-dddddddddddd",
    ]);
  });

  it("sem BTU no recorte, a capacidade presente no conjunto filtrado vem antes", () => {
    const presente = analisado({
      id: "ap-aaaaaaaaaaaa",
      capacidadesBtu: [18000],
    });
    const distante = analisado({
      id: "ap-bbbbbbbbbbbb",
      capacidadesBtu: [22000],
    });

    const cartoes = montarVitrine([distante, presente], {
      filtrados: [
        item({
          id: "ap-eeeeeeeeeeee",
          marcaCatalogo: "LG",
          capacidadesBtu: [12000, 18000],
        }),
      ],
      recorte: { marca: "LG" },
    });

    expect(ids(cartoes)).toEqual(["ap-aaaaaaaaaaaa", "ap-bbbbbbbbbbbb"]);
  });

  it("desempata pela Marca de catálogo conhecida", () => {
    const conhecida = analisado({
      id: "ap-aaaaaaaaaaaa",
      marcaCatalogo: "SAMSUNG",
    });
    const desconhecida = analisado({
      id: "ap-bbbbbbbbbbbb",
      marcaCatalogo: "MARCA NOVA",
    });

    const cartoes = montarVitrine([desconhecida, conhecida], {
      filtrados: [item({ id: "ap-eeeeeeeeeeee" })],
      recorte: {},
      marcasConhecidas: ["SAMSUNG"],
    });

    expect(ids(cartoes)).toEqual(["ap-aaaaaaaaaaaa", "ap-bbbbbbbbbbbb"]);
  });

  it("desempata por atributos em comum com o recorte", () => {
    const completo = analisado({ id: "ap-aaaaaaaaaaaa" });
    const parcial = analisado({
      id: "ap-bbbbbbbbbbbb",
      tipo: "Janela",
      funcao: "Quente/Frio",
      classes: ["C"],
    });

    const cartoes = montarVitrine([parcial, completo], {
      filtrados: [
        item({
          id: "ap-eeeeeeeeeeee",
          marcaCatalogo: "LG",
          tipo: "Split Hi-Wall",
          funcao: "Frio",
          classes: ["A"],
          tensoes: [220],
        }),
      ],
      recorte: { marca: "LG" },
      marcasConhecidas: ["SAMSUNG"],
    });

    expect(ids(cartoes)).toEqual(["ap-aaaaaaaaaaaa", "ap-bbbbbbbbbbbb"]);
  });

  it("usa a ordem recebida (recência da Análise) como desempate final", () => {
    const recente = analisado({ id: "ap-aaaaaaaaaaaa" });
    const antiga = analisado({ id: "ap-bbbbbbbbbbbb" });

    const cartoes = montarVitrine([recente, antiga], {
      filtrados: [item({ id: "ap-eeeeeeeeeeee" })],
      recorte: {},
      marcasConhecidas: ["SAMSUNG"],
    });

    expect(ids(cartoes)).toEqual(["ap-aaaaaaaaaaaa", "ap-bbbbbbbbbbbb"]);
  });

  it("com recorte vazio, pula a capacidade e usa a marca conhecida", () => {
    const conhecidaLonge = analisado({
      id: "ap-aaaaaaaaaaaa",
      marcaCatalogo: "SAMSUNG",
      capacidadesBtu: [30000],
    });
    const desconhecidaPerto = analisado({
      id: "ap-bbbbbbbbbbbb",
      marcaCatalogo: "MARCA NOVA",
      capacidadesBtu: [12000],
    });

    const cartoes = montarVitrine([desconhecidaPerto, conhecidaLonge], {
      filtrados: [],
      recorte: { marca: "LG", btu: 12000 },
      marcasConhecidas: ["SAMSUNG"],
    });

    expect(ids(cartoes)).toEqual(["ap-aaaaaaaaaaaa", "ap-bbbbbbbbbbbb"]);
  });

  it("joga para o fim o similar sem capacidade declarada", () => {
    const semCapacidade = analisado({
      id: "ap-aaaaaaaaaaaa",
      capacidadesBtu: [],
    });
    const distante = analisado({
      id: "ap-bbbbbbbbbbbb",
      capacidadesBtu: [30000],
    });

    const cartoes = montarVitrine([semCapacidade, distante], {
      filtrados: [item({ id: "ap-eeeeeeeeeeee", capacidadesBtu: [12000] })],
      recorte: { btu: 12000 },
    });

    expect(ids(cartoes)).toEqual(["ap-bbbbbbbbbbbb", "ap-aaaaaaaaaaaa"]);
  });

  it("preenche até seis cartões e marca os similares como fora do recorte", () => {
    const analisados = Array.from({ length: 8 }, (_, indice) =>
      analisado({
        id: `ap-${indice.toString(16).padStart(12, "0")}`,
      }),
    );

    const cartoes = montarVitrine(analisados, {
      filtrados: [item({ id: "ap-eeeeeeeeeeee" })],
      recorte: {},
      marcasConhecidas: ["SAMSUNG"],
    });

    expect(cartoes).toHaveLength(VITRINE_MAXIMO);
    expect(cartoes.every((cartao) => cartao.foraDoRecorte)).toBe(true);
  });

  it("sem Análises publicadas devolve lista vazia", () => {
    expect(montarVitrine([], { filtrados: [item()], recorte: {} })).toEqual([]);
  });

  it("respeita um teto menor que o padrão", () => {
    const analisados = Array.from({ length: 4 }, (_, indice) =>
      analisado({ id: `ap-${indice.toString(16).padStart(12, "0")}` }),
    );

    expect(
      montarVitrine(analisados, {
        filtrados: analisados.map(({ item: consulta }) => consulta),
        recorte: {},
        maximo: 2,
      }),
    ).toHaveLength(2);
  });
});
