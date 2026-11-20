import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Aparelho } from "@especialista-do-ar/pipeline";
import { describe, expect, it } from "vitest";
import {
  ATRIBUTOS_OFERTA,
  indexarOfertas,
  MARCADOR_OFERTA,
  type Oferta,
  ROTULO_OFERTA_PADRAO,
  rotuloDaOferta,
  validarOfertas,
} from "../src/lib/ofertas.ts";

function oferta(over: Partial<Oferta> = {}): Oferta {
  return {
    aparelhoId: "ap-aaaaaaaaaaaa",
    loja: "Loja",
    titulo: "Comprar",
    url: "https://loja.example.com/aparelho",
    ...over,
  };
}

describe("validarOfertas", () => {
  it("aceita Ofertas bem formadas", () => {
    expect(() => validarOfertas([oferta()])).not.toThrow();
  });

  it("recusa lista que não é array", () => {
    expect(() => validarOfertas({} as unknown as Oferta[])).toThrow(/lista/);
  });

  it("recusa campo obrigatório em branco", () => {
    expect(() => validarOfertas([oferta({ aparelhoId: " " })])).toThrow(
      /aparelhoId/,
    );
    expect(() => validarOfertas([oferta({ loja: "" })])).toThrow(/loja/);
    expect(() => validarOfertas([oferta({ url: "" })])).toThrow(/url/);
  });

  it("aceita Oferta sem titulo — o rótulo padrão cobre", () => {
    const semTitulo = { ...oferta() };
    delete semTitulo.titulo;
    expect(() => validarOfertas([semTitulo])).not.toThrow();
  });

  it("recusa titulo em branco quando informado", () => {
    expect(() => validarOfertas([oferta({ titulo: "  " })])).toThrow(/titulo/);
  });

  it("recusa url que não seja http(s)", () => {
    expect(() => validarOfertas([oferta({ url: "ftp://x/y" })])).toThrow(
      /http/,
    );
    expect(() => validarOfertas([oferta({ url: "não é url" })])).toThrow(
      /http/,
    );
  });

  it("recusa Oferta apontando para Aparelho inexistente", () => {
    const ids = new Set(["ap-bbbbbbbbbbbb"]);
    expect(() => validarOfertas([oferta()], ids)).toThrow(/inexistente/);
  });

  it("recusa Oferta duplicada para o mesmo Aparelho", () => {
    expect(() => validarOfertas([oferta(), oferta()])).toThrow(/duplicada/);
  });
});

describe("rotuloDaOferta", () => {
  it("usa 'Ver oferta' como rótulo padrão e não promete preço", () => {
    expect(ROTULO_OFERTA_PADRAO).toBe("Ver oferta");
    expect(rotuloDaOferta({})).toBe("Ver oferta");
    expect(rotuloDaOferta({ titulo: "  " })).toBe("Ver oferta");
  });

  it("respeita o rótulo próprio quando informado", () => {
    expect(rotuloDaOferta({ titulo: "Ver oferta na loja" })).toBe(
      "Ver oferta na loja",
    );
  });
});

/**
 * Os atributos e o marcador do link comercial ficam num lugar só (ticket 59),
 * para a ficha, a Análise e a Comparação não divergirem.
 */
describe("constantes do link de Oferta", () => {
  it("exige `sponsored nofollow noopener` e abre em outra aba", () => {
    expect(ATRIBUTOS_OFERTA.rel).toBe("sponsored nofollow noopener");
    expect(ATRIBUTOS_OFERTA.target).toBe("_blank");
  });

  it("identifica o link como de afiliado, sem prometer preço", () => {
    expect(MARCADOR_OFERTA).toBe("link de afiliado");
    expect(MARCADOR_OFERTA).not.toMatch(/pre[çc]o|desconto/i);
  });
});

describe("indexarOfertas", () => {
  const a = oferta({ aparelhoId: "ap-a", url: "https://a" });
  const b = oferta({ aparelhoId: "ap-b", url: "https://b" });
  const c = oferta({ aparelhoId: "ap-a", url: "https://c" });

  it("agrupa por Aparelho preservando a ordem", () => {
    const mapa = indexarOfertas([a, b, c]);
    expect(mapa.get("ap-a")).toEqual([a, c]);
    expect(mapa.get("ap-b")).toEqual([b]);
    expect(mapa.get("ap-z")).toBeUndefined();
  });
});

/**
 * As Ofertas são **site-only** (ADR-0010): nunca podem aparecer na base servida.
 * A guarda confere os artefatos publicados de verdade (`data/build/`) — a base
 * que o Agente consome, tanto em `.json` quanto em `.jsonl`.
 */
describe("Ofertas nunca vazam para a base servida", () => {
  const raiz = fileURLToPath(new URL("../../../", import.meta.url));
  const aparelhos = JSON.parse(
    readFileSync(`${raiz}data/build/aparelhos.json`, "utf8"),
  ) as Aparelho[];
  const linhasJsonl = readFileSync(`${raiz}data/build/aparelhos.jsonl`, "utf8")
    .trimEnd()
    .split("\n")
    .map((linha) => JSON.parse(linha) as Aparelho);

  it("nenhum Aparelho da base servida (json ou jsonl) traz campo de Oferta", () => {
    for (const aparelho of [...aparelhos, ...linhasJsonl]) {
      const chaves = Object.keys(aparelho);
      expect(chaves.some((chave) => /oferta/i.test(chave))).toBe(false);
    }
  });

  it("o texto publicado de aparelhos.jsonl não menciona oferta", () => {
    expect(
      readFileSync(`${raiz}data/build/aparelhos.jsonl`, "utf8"),
    ).not.toMatch(/oferta/i);
  });

  it("o ofertas.json existe, valida e aponta só para Aparelhos reais", () => {
    const ofertas = JSON.parse(
      readFileSync(
        fileURLToPath(new URL("../ofertas.json", import.meta.url)),
        "utf8",
      ),
    ) as Oferta[];
    validarOfertas(ofertas, new Set(aparelhos.map((aparelho) => aparelho.id)));
  });

  it("a Oferta de produção usa 'Ver oferta' e não promete preço", () => {
    const ofertas = JSON.parse(
      readFileSync(
        fileURLToPath(new URL("../ofertas.json", import.meta.url)),
        "utf8",
      ),
    ) as Oferta[];
    // A Oferta de produção pode omitir `titulo`: o rótulo padrão cobre.
    expect(ofertas.map(rotuloDaOferta)).toContain(ROTULO_OFERTA_PADRAO);
    for (const oferta of ofertas) {
      expect(rotuloDaOferta(oferta)).not.toMatch(/pre[çc]o|desconto/i);
    }
  });
});

/**
 * A divulgação da Oferta é discreta e não promete preço (ticket 58): os
 * componentes do CTA e o texto das Análises não podem trazer "Ver preço",
 * "preço do dia", "menor preço" nem desconto.
 */
describe("a divulgação da Oferta não promete preço", () => {
  const textosComOferta = [
    "../src/components/OfertaCartao.astro",
    "../src/components/OfertaFaixa.astro",
    "../src/components/OfertaCta.astro",
    "../src/pages/aparelhos/[id].astro",
    "../src/pages/analises/[slug].astro",
  ];
  const diretorioAnalises = fileURLToPath(
    new URL("../src/content/analises/", import.meta.url),
  );
  const analises = readdirSync(diretorioAnalises)
    .filter((nome) => nome.endsWith(".mdx"))
    .map((nome) => `../src/content/analises/${nome}`);

  it("nenhum texto do CTA ou das Análises promete preço, desconto ou economia", () => {
    for (const caminho of [...textosComOferta, ...analises]) {
      expect(
        readFileSync(new URL(caminho, import.meta.url), "utf8"),
      ).not.toMatch(
        /ver pre[çc]o|menor pre[çc]o|pre[çc]o do dia|valor do dia|desconto/i,
      );
    }
  });
});

/**
 * Ofertas ficam fora da ilha de consulta (ADR-0010): nada de anúncio no
 * resultado da busca.
 */
describe("Ofertas ficam fora da ilha de consulta", () => {
  const modulosDaIlha = [
    "../src/components/Consulta.tsx",
    "../src/lib/estado.ts",
    "../src/lib/opcoes.ts",
  ];

  it("nenhum módulo da ilha menciona Oferta", () => {
    for (const caminho of modulosDaIlha) {
      expect(
        readFileSync(new URL(caminho, import.meta.url), "utf8"),
      ).not.toMatch(/oferta/i);
    }
  });

  it("ofertas.json não é um arquivo público servido pelo site", () => {
    expect(existsSync(new URL("../public/ofertas.json", import.meta.url))).toBe(
      false,
    );
  });
});

/**
 * O ticket 69 tira a caixa azul de promoção e o pill da apresentação comercial
 * e a coloca no sistema visual: hairline, tokens de cor, raio de 2 px e alvo de
 * 44 px. O teste lê o CSS normativo (como `tokens.test.ts`) para a superfície
 * não voltar a ter cor hard-coded ou alvo pequeno.
 */
describe("a apresentação da Oferta segue o sistema visual", () => {
  const css = readFileSync(
    fileURLToPath(new URL("../src/styles/global.css", import.meta.url)),
    "utf8",
  );

  function regra(seletor: string): string {
    const escapado = seletor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const encontrada = css.match(
      new RegExp(`^${escapado} \\{([\\s\\S]*?)\\n\\}`, "m"),
    );
    expect(encontrada, `regra ${seletor} ausente`).not.toBeNull();
    return encontrada?.[1] ?? "";
  }

  it("não usa hex de promoção nem raio de pill", () => {
    for (const seletor of [
      ".oferta-cartao",
      ".ofertas .oferta-cartao",
      ".cta-ofertas .oferta-cartao",
      ".cta-cartao",
    ]) {
      const texto = regra(seletor);
      expect(texto).not.toMatch(/#[0-9a-f]{3,8}/i);
      expect(texto).not.toMatch(/999px/);
    }
  });

  it("garante alvo de 44 px e separação por hairline", () => {
    expect(regra(".oferta-cartao")).toContain("min-height: 44px");
    expect(regra(".ofertas")).toContain("border-top: 1px solid var(--linha)");
    expect(regra(".cta-ofertas .oferta-cartao")).toContain("min-height: 44px");
  });

  it("mantém o marcador de afiliado em mono e cor secundária", () => {
    const marcador = regra(".oferta-marcador");
    expect(marcador).toContain("var(--fonte-mono)");
    expect(marcador).toContain("var(--mudo)");
    expect(marcador).toContain("white-space: nowrap");
  });

  it("deixa o separador no CSS e empilha o marcador no celular", () => {
    // O "·" é decoração: em tela estreita ele some para o marcador inteiro
    // descer uma linha, sem separador órfão no começo da linha.
    expect(regra(".oferta-marcador::before")).toContain('content: "·"');
    const estreito = css.match(
      /@media \(max-width: 30rem\) \{([\s\S]*?)\n\}/,
    )?.[1];
    expect(estreito, "regra de tela estreita ausente").toBeDefined();
    expect(estreito).toContain(".oferta-marcador");
    expect(estreito).toContain("flex-basis: 100%");
    expect(estreito).toContain("content: none");
  });
});
