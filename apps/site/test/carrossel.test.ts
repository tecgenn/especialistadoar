import { describe, expect, it } from "vitest";
import {
  deveAvancarAutomaticamente,
  INTERVALO_CARROSSEL_MS,
  indiceAnterior,
  modoDaSecaoDeAnalises,
  normalizarIndice,
  proximoIndice,
} from "../src/lib/carrossel.ts";

describe("modoDaSecaoDeAnalises", () => {
  it("oculta a seção sem Análise publicada", () => {
    expect(modoDaSecaoDeAnalises(0)).toBe("oculta");
  });

  it("mostra uma Análise sozinha sem carrossel", () => {
    expect(modoDaSecaoDeAnalises(1)).toBe("unica");
  });

  it("liga o carrossel a partir de duas Análises", () => {
    expect(modoDaSecaoDeAnalises(2)).toBe("carrossel");
    expect(modoDaSecaoDeAnalises(5)).toBe("carrossel");
  });
});

describe("proximoIndice e indiceAnterior", () => {
  it("avança e dá a volta no último", () => {
    expect(proximoIndice(0, 3)).toBe(1);
    expect(proximoIndice(2, 3)).toBe(0);
  });

  it("volta e dá a volta no primeiro", () => {
    expect(indiceAnterior(2, 3)).toBe(1);
    expect(indiceAnterior(0, 3)).toBe(2);
  });

  it("normaliza um índice fora da lista", () => {
    expect(normalizarIndice(-1, 3)).toBe(2);
    expect(normalizarIndice(4, 3)).toBe(1);
    expect(normalizarIndice(7, 3)).toBe(1);
  });

  it("não devolve NaN com lista vazia", () => {
    expect(normalizarIndice(2, 0)).toBe(0);
    expect(proximoIndice(0, 0)).toBe(0);
    expect(indiceAnterior(0, 0)).toBe(0);
  });
});

describe("deveAvancarAutomaticamente", () => {
  const base = { total: 3, reduzido: false, pausado: false, visivel: true };

  it("gira com mais de um quadro visível e sem pausa", () => {
    expect(deveAvancarAutomaticamente(base)).toBe(true);
  });

  it("não gira com um único quadro", () => {
    expect(deveAvancarAutomaticamente({ ...base, total: 1 })).toBe(false);
  });

  it("respeita prefers-reduced-motion", () => {
    expect(deveAvancarAutomaticamente({ ...base, reduzido: true })).toBe(false);
  });

  it("respeita a pausa explícita e a interação", () => {
    expect(deveAvancarAutomaticamente({ ...base, pausado: true })).toBe(false);
  });

  it("não gira fora da tela nem com a aba escondida", () => {
    expect(deveAvancarAutomaticamente({ ...base, visivel: false })).toBe(false);
  });

  it("o intervalo é de 7 segundos", () => {
    expect(INTERVALO_CARROSSEL_MS).toBe(7000);
  });
});
