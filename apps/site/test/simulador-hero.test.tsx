// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SimuladorHero from "../src/components/SimuladorHero.tsx";

/**
 * A ilha do simulador do hero (tickets 104 e 110) exercitada em jsdom. O HTML
 * servido já traz o estado padrão; a ilha acrescenta a interação e o foco do
 * CTA. O contrato do cálculo e das contagens é conferido no seam de build
 * (`analises-build.test.ts`), então aqui só o que o HTML estático não prova: o
 * resultado padrão renderizado pela ilha e o foco depois do fragmento.
 */

/** Contagens de fixture: uma por capacidade comercial usada nos testes. */
const RESUMOS = {
  "18000": { total: 318, classeA: 256 },
  "24000": { total: 210, classeA: 150 },
};

function abrir(hash = "") {
  window.history.replaceState(null, "", `/${hash}`);
  render(<SimuladorHero resumos={RESUMOS} />);
}

function area(): HTMLElement {
  return screen.getByLabelText("Área");
}

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("simulador do hero", () => {
  it("abre com 20 m² e sol à tarde, devolvendo 18.000 BTU/h", () => {
    abrir();

    expect((area() as HTMLInputElement).value).toBe("20");
    expect(screen.getByText("Tarde").getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector(".hero-simulador-leitura")?.textContent).toBe(
      "18.000BTU/h",
    );
    expect(
      screen
        .getByRole("link", { name: /Continuar no Assistente/ })
        .getAttribute("href"),
    ).toBe("/assistente/?forma=metros&area=20&sol=tarde");
    expect(
      screen
        .getByRole("link", { name: /Ver aparelhos de 18.000 BTU\/h/ })
        .getAttribute("href"),
    ).toBe("/aparelhos/?btu=18000");
  });

  it("leva o foco ao controle de área quando o CTA abre #simulador", () => {
    abrir();

    window.history.replaceState(null, "", "/#simulador");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(document.activeElement).toBe(area());
  });

  it("não rouba o foco para outro fragmento nem no carregamento sem hash", () => {
    abrir();

    window.history.replaceState(null, "", "/#aparelhos");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(document.activeElement).toBe(document.body);
  });
});
