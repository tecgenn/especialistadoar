import { describe, expect, it } from "vitest";
import {
  CAMINHOS_DO_LOGO,
  chaveDaLoja,
  dadosDoLogoDaLoja,
  GRADE_DO_LOGO,
  nomeDaLoja,
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
  it("devolve a chave, o nome canônico e os caminhos para lojas conhecidas", () => {
    expect(dadosDoLogoDaLoja("mercadolivre")).toEqual({
      chave: "mercado-livre",
      nome: "Mercado Livre",
      caminhos: CAMINHOS_DO_LOGO["mercado-livre"],
    });
    expect(dadosDoLogoDaLoja("AMAZON")).toEqual({
      chave: "amazon",
      nome: "Amazon",
      caminhos: CAMINHOS_DO_LOGO.amazon,
    });
    expect(nomeDaLoja("amazon")).toBe("Amazon");
  });

  it("devolve null para loja sem desenho — o chamador cai para texto", () => {
    expect(dadosDoLogoDaLoja("Loja do teste")).toBeNull();
  });

  it("usa o nome canônico no nome acessível e preserva o texto desconhecido", () => {
    expect(nomeDaLojaParaLeitura(" MercadoLivre ")).toBe("Mercado Livre");
    expect(nomeDaLojaParaLeitura("AMAZON")).toBe("Amazon");
    expect(nomeDaLojaParaLeitura("  Loja do teste  ")).toBe("Loja do teste");
    expect(nomeDaLojaParaLeitura(null)).toBe("");
  });

  it("desenha marcas de linha na grade de 24 px, sem cor própria", () => {
    expect(GRADE_DO_LOGO).toBe("0 0 24 24");
    for (const [chave, caminhos] of Object.entries(CAMINHOS_DO_LOGO)) {
      expect(caminhos.length, chave).toBeGreaterThanOrEqual(2);
      for (const caminho of caminhos) {
        expect(caminho).toMatch(/^[mM]/);
        expect(caminho).not.toMatch(/#[0-9a-f]{3,8}|fill/i);
      }
    }
  });
});
