import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  chaveDaLoja,
  dadosDoLogoDaLoja,
  LOGOS_DAS_LOJAS,
  nomeDaLojaParaLeitura,
} from "../src/lib/lojas.ts";

describe("chaveDaLoja", () => {
  it("reconhece Mercado Livre sem acento, em minúsculas e sem espaço", () => {
    for (const nome of [
      "Mercado Livre",
      "MERCADO LIVRE",
      "mercadolivre",
      "MercadoLivre",
      "  Mercado   Livre  ",
    ]) {
      expect(chaveDaLoja(nome)).toBe("mercado-livre");
    }
  });

  it("reconhece Amazon em qualquer caixa e com espaço à volta", () => {
    for (const nome of ["Amazon", "AMAZON", " amazon "]) {
      expect(chaveDaLoja(nome)).toBe("amazon");
    }
  });

  it("devolve null para loja desconhecida ou vazia", () => {
    for (const nome of ["", "   ", "Loja do teste", "Mercado Livre Official"]) {
      expect(chaveDaLoja(nome)).toBeNull();
    }
  });
});

describe("dados do logo da loja", () => {
  it("usa o arquivo oficial do Mercado Livre", () => {
    expect(dadosDoLogoDaLoja("mercadolivre")).toEqual({
      chave: "mercado-livre",
      nome: "Mercado Livre",
      largura: 79,
      altura: 20,
    });
    const svg = readFileSync(
      new URL("../src/assets/lojas/mercado-livre.svg", import.meta.url),
      "utf8",
    );
    expect(svg).toContain('viewBox="0 0 920.12 233.88"');
    expect(svg).toContain('fill="#f7d032"');
    expect(svg).toContain("<path");
    expect(svg).not.toContain("<text");
  });

  it("usa o arquivo oficial da Amazon com o wordmark em branco", () => {
    expect(dadosDoLogoDaLoja("AMAZON")).toEqual({
      chave: "amazon",
      nome: "Amazon",
      largura: 66,
      altura: 20,
    });
    const svg = readFileSync(
      new URL("../src/assets/lojas/amazon.svg", import.meta.url),
      "utf8",
    );
    expect(svg).toContain('viewBox="0 0 603 182"');
    expect(svg).toContain('fill="#fff"');
    expect(svg).toContain('fill="#ff9900"');
    expect(svg).not.toContain("<text");
  });

  it("devolve null para loja sem logotipo — o chamador cai para texto", () => {
    expect(dadosDoLogoDaLoja("Loja do teste")).toBeNull();
  });

  it("usa o nome canônico no nome acessível e preserva o texto desconhecido", () => {
    expect(nomeDaLojaParaLeitura(" MercadoLivre ")).toBe("Mercado Livre");
    expect(nomeDaLojaParaLeitura("AMAZON")).toBe("Amazon");
    expect(nomeDaLojaParaLeitura("  Loja do teste  ")).toBe("Loja do teste");
    expect(nomeDaLojaParaLeitura(null)).toBe("");
  });

  it("reserva a proporção dos dois SVGs oficiais", () => {
    const mercadoLivre = LOGOS_DAS_LOJAS["mercado-livre"];
    const amazon = LOGOS_DAS_LOJAS.amazon;
    expect(mercadoLivre.largura / mercadoLivre.altura).toBeCloseTo(
      920.12 / 233.88,
      1,
    );
    expect(amazon.largura / amazon.altura).toBeCloseTo(603 / 182, 1);
  });
});
