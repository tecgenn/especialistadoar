import { describe, expect, it } from "vitest";
import {
  type Analise,
  type AnaliseFrontmatter,
  indexarAnalises,
  listaAnalisesJson,
  mapaPorAparelho,
  montarAnalises,
  secaoVisivel,
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
