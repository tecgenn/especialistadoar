// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import CalculadoraCusto from "../src/components/CalculadoraCusto.tsx";
import {
  type TarifasCuradas,
  UFS,
  validarTarifas,
} from "../src/lib/tarifas.ts";

/**
 * A ilha da calculadora de custo (ticket 55) na ficha do Aparelho: campos,
 * resultado e conta aberta, com o estado inteiro na URL. Os testes exercitam o
 * comportamento externo — o que aparece, o que a URL passa a conter e como o
 * padrão volta — em jsdom.
 *
 * A curadoria do teste: SP a R$ 0,85/kWh, RJ a R$ 0,95 e as demais a R$ 0,90.
 */
const tarifas: TarifasCuradas = validarTarifas({
  ufs: UFS.map(({ uf, nome }) => ({
    uf,
    nome,
    tarifa: uf === "SP" ? 0.85 : uf === "RJ" ? 0.95 : 0.9,
    referencia: "2026-11",
    fonte: "ANEEL",
  })),
});

/** Um Aparelho de Variante única: 416 kWh/ano = 0,2 kWh por hora. */
const UM_CONSUMO = [416];

function abrir(consumos: number[] = UM_CONSUMO, url = "/aparelhos/ap-123/") {
  window.history.replaceState(null, "", url);
  render(<CalculadoraCusto consumosAnuaisKwh={consumos} tarifas={tarifas} />);
}

function resultado(): HTMLElement {
  return screen.getByRole("status");
}

function busca(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

function campo(rotulo: string): HTMLInputElement {
  return screen.getByLabelText(rotulo) as HTMLInputElement;
}

beforeEach(() => {
  window.history.replaceState(null, "", "/aparelhos/ap-123/");
});

afterEach(() => {
  cleanup();
});

describe("padrões da calculadora", () => {
  it("abre preenchida com São Paulo, 8 h/dia e 30 dias, sem sujar a URL", () => {
    abrir();

    expect(
      (screen.getByLabelText("Estado (UF)") as HTMLSelectElement).value,
    ).toBe("SP");
    expect(campo("Tarifa (R$/kWh)").value).toBe("0,85");
    expect(campo("Horas por dia").value).toBe("8");
    expect(campo("Dias por mês").value).toBe("30");

    // 416 ÷ 2.080 = 0,2 kWh/h; × 8 × 30 = 48 kWh/mês; × 0,85 = R$ 40,80.
    expect(resultado().textContent).toContain("R$ 40,80");
    expect(resultado().textContent).toContain("R$ 489,60");
    expect(resultado().textContent).toContain("48,00 kWh");
    expect(window.location.search).toBe("");
  });

  it("anuncia o resultado como região viva, com rótulos associados aos campos", () => {
    abrir();

    expect(resultado().getAttribute("aria-live")).toBe("polite");
    expect(resultado().getAttribute("aria-atomic")).toBe("true");
    for (const rotulo of [
      "Estado (UF)",
      "Tarifa (R$/kWh)",
      "Horas por dia",
      "Dias por mês",
    ]) {
      expect(screen.getByLabelText(rotulo)).toBeDefined();
    }
  });

  it("mostra a conta aberta passo a passo", () => {
    abrir();

    const passos = [...resultado().querySelectorAll("li")].map(
      (passo) => passo.textContent ?? "",
    );
    expect(passos).toHaveLength(6);
    expect(passos[0]).toContain("416,00 kWh");
    expect(passos[1]).toContain("0,20 kWh");
    expect(passos[1]).toContain("2.080 h/ano");
    expect(passos[2]).toContain("8 h/dia × 30 dias");
    expect(passos[3]).toContain("48,00 kWh");
    expect(passos[4]).toContain("R$ 0,85/kWh");
    expect(passos[5]).toContain("R$ 40,80");
  });

  it("marca o resultado como estimativa, nunca como Valor oficial", () => {
    abrir();
    expect(resultado().textContent).toContain("Estimativa");
    expect(resultado().textContent).toContain("Não é um Valor oficial");
  });
});

describe("painel de instrumento", () => {
  it("mostra o custo mensal como leitura principal e anual/consumo como fatores", () => {
    abrir();

    const principal = document.querySelector(".calculadora-principal");
    expect(principal?.textContent).toBe("R$ 40,80");

    const fatores = [
      ...document.querySelectorAll(".calculadora-fatores > div"),
    ].map((linha) => linha.textContent ?? "");
    expect(fatores).toHaveLength(2);
    expect(fatores[0]).toContain("Custo estimado por ano");
    expect(fatores[0]).toContain("R$ 489,60");
    expect(fatores[1]).toContain("Consumo estimado por mês");
    expect(fatores[1]).toContain("48,00 kWh");
  });

  it("numera os seis passos da conta aberta em mono", () => {
    abrir();

    const css = readFileSync(
      join(process.cwd(), "apps/site/src/styles/global.css"),
      "utf8",
    );
    expect(css).toMatch(
      /\.calculadora-conta li::before \{[^}]*counter-increment: conta;/,
    );
    expect(document.querySelector(".calculadora-conta")?.tagName).toBe("OL");
    expect(document.querySelectorAll(".calculadora-conta li")).toHaveLength(6);
  });

  it("rotula e sufixa os campos pelo primitivo, com alvo de 44 px", () => {
    abrir();

    expect(campo("Horas por dia").className).toContain("campo-entrada");
    expect(
      document.querySelector(".calculadora-campos .campo-rotulo")?.tagName,
    ).toBe("LABEL");
    const sufixos = [
      ...document.querySelectorAll(".calculadora-campos .campo-sufixo"),
    ].map((sufixo) => sufixo.textContent);
    expect(sufixos).toEqual(["h", "dias"]);

    const primitivos = readFileSync(
      join(process.cwd(), "apps/site/src/styles/primitivos.css"),
      "utf8",
    );
    expect(primitivos).toMatch(/\.campo-entrada \{[^}]*min-height: 44px;/);
  });

  it("sem consumo declarado mantém o painel com travessão e explicação", () => {
    abrir([]);

    expect(document.querySelector(".calculadora-travessao")?.textContent).toBe(
      "—",
    );
    expect(screen.getByText(/não declara consumo anual/)).toBeDefined();
    expect(document.querySelector(".calculadora-campos")).toBeNull();
  });
});

describe("layout da calculadora", () => {
  it("empilha campos e resultado na ordem de leitura no celular", () => {
    // Mesmo caminho do teste da consulta: a suíte roda da raiz do monorepo.
    const css = readFileSync(
      join(process.cwd(), "apps/site/src/styles/global.css"),
      "utf8",
    );
    expect(css).toMatch(
      /@media \(max-width: 40rem\) \{\s*\.calculadora \{\s*grid-template-columns: 1fr;/,
    );
    // Campos vêm antes do resultado no HTML: a ordem de leitura é a mesma.
    abrir();
    const campos = document.querySelector(".calculadora-campos") as HTMLElement;
    expect(
      campos.compareDocumentPosition(resultado()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("campos da calculadora", () => {
  it("trocar a UF atualiza a tarifa do campo, o resultado e a URL", () => {
    abrir();

    fireEvent.change(screen.getByLabelText("Estado (UF)"), {
      target: { value: "RJ" },
    });

    expect(campo("Tarifa (R$/kWh)").value).toBe("0,95");
    // 48 kWh × 0,95 = R$ 45,60.
    expect(resultado().textContent).toContain("R$ 45,60");
    expect(busca().toString()).toBe("uf=RJ");
    expect(resultado().textContent).toContain("R$ 0,95/kWh");
  });

  it("mostra a referência e a fonte da tarifa do estado", () => {
    abrir();
    expect(resultado().textContent).not.toContain("2026-11");

    fireEvent.change(screen.getByLabelText("Estado (UF)"), {
      target: { value: "RJ" },
    });
    expect(screen.getByText(/2026-11/).textContent).toContain("ANEEL");
  });

  it("aceita a tarifa digitada, com vírgula, e ela tem precedência", () => {
    abrir();

    fireEvent.change(campo("Tarifa (R$/kWh)"), {
      target: { value: "1,20" },
    });

    // 48 kWh × 1,20 = R$ 57,60.
    expect(resultado().textContent).toContain("R$ 57,60");
    expect(busca().get("uf")).toBe("SP");
    expect(busca().get("tarifa")).toBe("1.2");
  });

  it('"Tarifa informada" mantém o valor digitado e grava `uf=` vazia', () => {
    abrir();
    fireEvent.change(campo("Tarifa (R$/kWh)"), {
      target: { value: "0,75" },
    });

    fireEvent.change(screen.getByLabelText("Estado (UF)"), {
      target: { value: "" },
    });

    expect(campo("Tarifa (R$/kWh)").value).toBe("0,75");
    // 48 kWh × 0,75 = R$ 36,00.
    expect(resultado().textContent).toContain("R$ 36,00");
    expect(busca().get("uf")).toBe("");
    expect(busca().get("tarifa")).toBe("0.75");
    expect(screen.queryByText(/Tarifa de referência/)).toBeNull();

    // Continuar digitando não religa uma UF.
    fireEvent.change(campo("Tarifa (R$/kWh)"), {
      target: { value: "0.5" },
    });
    expect(busca().get("uf")).toBe("");
    expect(resultado().textContent).toContain("R$ 24,00");
  });

  it("ajusta horas por dia e dias por mês, atualizando na hora", () => {
    abrir();

    fireEvent.change(campo("Horas por dia"), { target: { value: "4" } });
    expect(resultado().textContent).toContain("24,00 kWh");
    expect(busca().get("horas")).toBe("4");

    fireEvent.change(campo("Dias por mês"), { target: { value: "22" } });
    // 0,2 × 4 × 22 = 17,6 kWh; × 0,85 = R$ 14,96.
    expect(resultado().textContent).toContain("17,60 kWh");
    expect(resultado().textContent).toContain("R$ 14,96");
    expect(busca().get("dias")).toBe("22");
  });
});

describe("faixa de Variantes", () => {
  it("com duas Variantes mostra o custo como mínimo–máximo", () => {
    abrir([350, 818]);

    expect(document.querySelector(".calculadora-principal")?.textContent).toBe(
      "R$ 34,33 – R$ 80,23",
    );
    expect(resultado().textContent).toContain("R$ 34,33 – R$ 80,23");
    expect(resultado().textContent).toContain(
      "350,00 kWh – 818,00 kWh por ano",
    );
  });

  it("com uma Variante mostra valor único", () => {
    abrir([416]);
    expect(resultado().textContent).not.toContain("–");
  });

  it("sem consumo declarado explica a ausência em vez de calcular", () => {
    abrir([]);

    expect(screen.getByText(/não declara consumo anual/)).toBeDefined();
    expect(screen.queryByLabelText("Estado (UF)")).toBeNull();
  });
});

describe("contrato de URL da calculadora", () => {
  it("normaliza um link redundante para a URL limpa", () => {
    abrir(UM_CONSUMO, "/aparelhos/ap-123/?uf=SP&horas=8&dias=30");

    expect(window.location.search).toBe("");
    expect(campo("Horas por dia").value).toBe("8");
    expect(resultado().textContent).toContain("R$ 40,80");
  });

  it("restaura tarifa, uso e UF de um link compartilhado", () => {
    abrir(UM_CONSUMO, "/aparelhos/ap-123/?uf=RJ&tarifa=1.2&horas=6&dias=22");

    expect(
      (screen.getByLabelText("Estado (UF)") as HTMLSelectElement).value,
    ).toBe("RJ");
    expect(campo("Tarifa (R$/kWh)").value).toBe("1,2");
    expect(campo("Horas por dia").value).toBe("6");
    expect(campo("Dias por mês").value).toBe("22");
    // 0,2 × 6 × 22 = 26,4 kWh; × 1,20 = R$ 31,68.
    expect(resultado().textContent).toContain("R$ 31,68");
  });

  it('restaura "Tarifa informada" de um link com `uf=` vazia', () => {
    abrir(UM_CONSUMO, "/aparelhos/ap-123/?uf=&tarifa=0.99");

    expect(
      (screen.getByLabelText("Estado (UF)") as HTMLSelectElement).value,
    ).toBe("");
    expect(campo("Tarifa (R$/kWh)").value).toBe("0,99");
  });

  it("cai no padrão em silêncio com UF, tarifa e uso inválidos", () => {
    abrir(UM_CONSUMO, "/aparelhos/ap-123/?uf=XX&tarifa=-1&horas=99&dias=0");

    expect(
      (screen.getByLabelText("Estado (UF)") as HTMLSelectElement).value,
    ).toBe("SP");
    expect(campo("Tarifa (R$/kWh)").value).toBe("0,85");
    expect(campo("Horas por dia").value).toBe("8");
    expect(campo("Dias por mês").value).toBe("30");
    expect(window.location.search).toBe("");
    expect(resultado().textContent).toContain("R$ 40,80");
  });

  it("mantém outras chaves da página ao escrever o estado", () => {
    abrir(UM_CONSUMO, "/aparelhos/ap-123/?de=busca");

    fireEvent.change(campo("Horas por dia"), { target: { value: "4" } });

    expect(busca().get("de")).toBe("busca");
    expect(busca().get("horas")).toBe("4");
  });
});
