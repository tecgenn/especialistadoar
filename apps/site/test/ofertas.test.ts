import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Aparelho } from "@especialista-do-ar/pipeline";
import { describe, expect, it } from "vitest";
import {
  indexarOfertas,
  type Oferta,
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
    expect(() => validarOfertas([oferta({ titulo: "" })])).toThrow(/titulo/);
    expect(() => validarOfertas([oferta({ url: "" })])).toThrow(/url/);
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
});

/**
 * A ilha de consulta (filtros + busca, ADR-0008) roda no cliente sobre
 * `consulta.json` e **não** conhece Oferta (ADR-0010): nada de anúncio no
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
