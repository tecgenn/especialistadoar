import { describe, expect, it } from "vitest";
import {
  ASSUNTOS_CONTATO,
  canonicalInstitucional,
  EMAIL_CONTATO,
  linkMailto,
  PAGINAS_INSTITUCIONAIS,
} from "../src/lib/institucionais.ts";

/**
 * Seam puro das páginas institucionais (ticket 57): o endereço de contato é
 * uma constante única, os três assuntos de e-mail vêm da mesma definição que a
 * página usa e os metadados alimentam o `<head>` e o rodapé.
 */

describe("contato", () => {
  it("usa um único endereço de e-mail", () => {
    expect(EMAIL_CONTATO).toBe("tecgenn@gmail.com");
  });

  it("oferece dúvida, correção de dado do INMETRO e parceria", () => {
    expect(ASSUNTOS_CONTATO.map((assunto) => assunto.rotulo)).toEqual([
      "Dúvida",
      "Correção de dado do INMETRO",
      "Parceria",
    ]);
  });

  it("preenche o assunto do mailto com o endereço único e codificação pt-BR", () => {
    expect(linkMailto(ASSUNTOS_CONTATO[0]?.assunto ?? "")).toBe(
      "mailto:tecgenn@gmail.com?subject=D%C3%BAvida",
    );
    expect(linkMailto(ASSUNTOS_CONTATO[1]?.assunto ?? "")).toBe(
      "mailto:tecgenn@gmail.com?subject=Corre%C3%A7%C3%A3o%20de%20dado%20do%20INMETRO",
    );
    expect(linkMailto(ASSUNTOS_CONTATO[2]?.assunto ?? "")).toBe(
      "mailto:tecgenn@gmail.com?subject=Parceria",
    );
  });
});

describe("metadados das três páginas", () => {
  it("define título, descrição e rota próprios para cada uma", () => {
    expect(PAGINAS_INSTITUCIONAIS.contato).toEqual({
      href: "/contato/",
      titulo: "Contato — Especialista do Ar",
      rotuloRodape: "Contato",
      descricao: `Fale com o Especialista do Ar: dúvidas, correção de dado do INMETRO e parcerias pelo e-mail ${EMAIL_CONTATO}.`,
    });
    expect(PAGINAS_INSTITUCIONAIS.privacidade).toEqual({
      href: "/politica-de-privacidade/",
      titulo: "Política de Privacidade — Especialista do Ar",
      rotuloRodape: "Política de Privacidade",
      descricao:
        "Como o Especialista do Ar trata dados: sem cadastro, sem cookies próprios, métricas do Cloudflare Web Analytics e direitos da LGPD.",
    });
    expect(PAGINAS_INSTITUCIONAIS.termos).toEqual({
      href: "/termos-de-uso/",
      titulo: "Termos de Uso — Especialista do Ar",
      rotuloRodape: "Termos de Uso",
      descricao:
        "Regras de uso do Especialista do Ar: dados oficiais do INMETRO, Valores calculados, Ofertas de afiliado e uso livre da base com atribuição.",
    });
  });

  it("gera o canonical da própria página a partir do site", () => {
    const site = new URL("https://especialista-do-ar.pages.dev/");
    expect(
      canonicalInstitucional(PAGINAS_INSTITUCIONAIS.privacidade, site),
    ).toBe("https://especialista-do-ar.pages.dev/politica-de-privacidade/");
    expect(
      canonicalInstitucional(PAGINAS_INSTITUCIONAIS.termos, undefined),
    ).toBe("/termos-de-uso/");
  });
});
