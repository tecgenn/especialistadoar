// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Assistente from "../src/components/Assistente.tsx";

/**
 * A ilha do Assistente (ticket 41) conduz cinco telas e guarda o estado na URL.
 * Os testes exercitam o comportamento externo — o que aparece, para onde o
 * wizard avança, o que fica na URL e o resultado renderizado — em jsdom.
 */
function iniciar(url = "/assistente/") {
  window.history.replaceState(null, "", url);
  render(<Assistente />);
}

function botao(nome: RegExp | string): HTMLElement {
  return screen.getByRole("button", { name: nome });
}

function progresso(): HTMLElement {
  return screen.getByRole("progressbar");
}

async function avancarParaArea() {
  fireEvent.click(botao(/^Sala/));
  await screen.findByText("Qual é o tamanho do ambiente?");
}

async function preencherArea(area = "24") {
  fireEvent.change(screen.getByLabelText("Área em metros quadrados"), {
    target: { value: area },
  });
  fireEvent.click(botao("Continuar"));
  await screen.findByText("Como é a incidência de sol?");
}

async function avancarParaSol(area = "24") {
  await avancarParaArea();
  await preencherArea(area);
}

async function avancarParaPessoas() {
  await avancarParaSol();
  fireEvent.click(botao(/^Sol à tarde/));
  await screen.findByText("Quantas pessoas usam o ambiente?");
}

async function avancarParaEquipamentos() {
  await avancarParaPessoas();
  fireEvent.click(botao(/^1 pessoa$/));
  await screen.findByText("O que mais gera calor no ambiente?");
}

async function verResultado() {
  await avancarParaEquipamentos();
  fireEvent.click(botao("Ver resultado"));
  await screen.findByRole("status");
}

beforeEach(() => {
  window.history.replaceState(null, "", "/assistente/");
});

afterEach(() => {
  cleanup();
});

describe("wizard do Assistente", () => {
  it("abre na primeira das cinco telas, com barra de progresso rotulada", () => {
    iniciar();

    expect(
      screen.getByText("Onde você vai usar o ar-condicionado?"),
    ).toBeDefined();
    expect(progresso().getAttribute("aria-valuenow")).toBe("1");
    expect(progresso().getAttribute("aria-valuemin")).toBe("1");
    expect(progresso().getAttribute("aria-valuemax")).toBe("5");
    expect(progresso().getAttribute("aria-valuetext")).toBe("Etapa 1 de 5");
  });

  it("conduz as cinco telas, uma pergunta por tela", async () => {
    iniciar();

    await avancarParaArea();
    expect(progresso().getAttribute("aria-valuenow")).toBe("2");

    await preencherArea();
    expect(progresso().getAttribute("aria-valuenow")).toBe("3");

    fireEvent.click(botao(/^Sol à tarde/));
    await screen.findByText("Quantas pessoas usam o ambiente?");
    expect(progresso().getAttribute("aria-valuenow")).toBe("4");

    fireEvent.click(botao(/^1 pessoa$/));
    await screen.findByText("O que mais gera calor no ambiente?");
    expect(progresso().getAttribute("aria-valuenow")).toBe("5");

    fireEvent.click(botao("Ver resultado"));
    await screen.findByText("Sua capacidade recomendada");
    expect(progresso().getAttribute("aria-valuetext")).toBe("Resultado");
  });

  it("move o foco para o título ao avançar", async () => {
    iniciar();
    await avancarParaArea();

    await waitFor(() =>
      expect(document.activeElement?.textContent).toContain(
        "Qual é o tamanho do ambiente?",
      ),
    );
  });

  it("volta e mantém a resposta anterior", async () => {
    iniciar();
    await avancarParaArea();
    fireEvent.change(screen.getByLabelText("Área em metros quadrados"), {
      target: { value: "24" },
    });
    fireEvent.click(botao("Continuar"));
    await screen.findByText("Como é a incidência de sol?");

    fireEvent.click(botao("Voltar"));
    await screen.findByText("Qual é o tamanho do ambiente?");
    expect(
      (screen.getByLabelText("Área em metros quadrados") as HTMLInputElement)
        .value,
    ).toBe("24");

    fireEvent.click(botao("Continuar"));
    await screen.findByText("Como é a incidência de sol?");
  });

  it("aceita largura × comprimento", async () => {
    iniciar();
    await avancarParaArea();
    fireEvent.click(botao("Tenho largura × comprimento"));
    fireEvent.change(screen.getByLabelText("Largura (m)"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Comprimento (m)"), {
      target: { value: "4" },
    });
    fireEvent.click(botao("Continuar"));
    await screen.findByText("Como é a incidência de sol?");

    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("forma")).toBe("dimensoes");
    expect(busca.get("largura")).toBe("5");
    expect(busca.get("comprimento")).toBe("4");
  });

  it("oferece referências visuais para quem não sabe as medidas", async () => {
    iniciar();
    await avancarParaArea();
    fireEvent.click(botao("Não sei as medidas"));

    expect(screen.getByText("Pequeno (~9 m²)")).toBeDefined();
    expect(screen.getByText("Médio (~20 m²)")).toBeDefined();
    expect(screen.getByText("Grande (~35 m²)")).toBeDefined();

    fireEvent.click(botao(/^Médio/));
    await screen.findByText("Como é a incidência de sol?");

    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("forma")).toBe("referencia");
    expect(busca.get("referencia")).toBe("medio");
  });

  it("assume sol à tarde quando a pessoa responde 'não sei'", async () => {
    iniciar();
    await avancarParaSol();
    fireEvent.click(botao(/^Não sei/));
    await screen.findByText("Quantas pessoas usam o ambiente?");

    expect(new URLSearchParams(window.location.search).get("sol")).toBe(
      "nao-sei",
    );
  });
});

describe("resultado do Assistente", () => {
  it("mostra a capacidade comercial, os fatores, a confiança e as orientações", async () => {
    iniciar();
    await verResultado();

    const resultado = screen.getByRole("status");
    expect(resultado.textContent).toContain("18.000 BTU/h");
    expect(resultado.textContent).toContain("Confiança alta");
    expect(resultado.textContent).toContain("Ambiente");
    expect(resultado.textContent).toContain("Incidência de sol");
    expect(resultado.textContent).toContain("Pessoas");
    expect(resultado.textContent).toContain("Eletrônicos");
    expect(resultado.textContent).toContain("Lâmpadas");
    expect(resultado.textContent).toContain("Janelas");
    expect(resultado.textContent).toContain("Inverter");
    expect(resultado.textContent).toContain("Limpe os filtros");
    expect(resultado.textContent).toContain("estimativa");
    expect(resultado.textContent).not.toContain("Valor oficial");
  });

  it("declara a suposição de área estimada e a confiança média", async () => {
    iniciar();
    await avancarParaArea();
    fireEvent.click(botao("Não sei as medidas"));
    fireEvent.click(botao(/^Grande/));
    await screen.findByText("Como é a incidência de sol?");
    fireEvent.click(botao(/^Sem sol/));
    await screen.findByText("Quantas pessoas usam o ambiente?");
    fireEvent.click(botao(/^2 pessoas$/));
    await screen.findByText("O que mais gera calor no ambiente?");
    fireEvent.click(botao("Ver resultado"));

    const resultado = await screen.findByRole("status");
    expect(resultado.textContent).toContain("referência visual");
    expect(resultado.textContent).toContain("Confiança média");
  });

  it("soma eletrônicos, lâmpadas e janelas no resultado", async () => {
    iniciar();
    await avancarParaEquipamentos();

    fireEvent.click(botao("Mais eletrônicos"));
    fireEvent.click(botao("Mais eletrônicos"));
    fireEvent.click(botao("Mais lâmpadas"));
    fireEvent.click(botao("Mais janelas"));
    fireEvent.click(botao("Mais janelas"));
    fireEvent.click(botao("Mais janelas"));
    fireEvent.click(botao("Ver resultado"));

    // 24 m² × 750 = 18.000; + 1.200 (2 eletrônicos) + 100 (1 lâmpada)
    // + 200 (1 janela acima de 2) = 19.500 → 22.000.
    const resultado = await screen.findByRole("status");
    expect(resultado.textContent).toContain("22.000 BTU/h");
    expect(resultado.textContent).toContain("19.500 BTU/h");
  });

  it("volta do resultado para a última pergunta", async () => {
    iniciar();
    await verResultado();

    fireEvent.click(botao("Voltar"));
    await screen.findByText("O que mais gera calor no ambiente?");
  });

  it("recomeça e limpa a URL", async () => {
    iniciar();
    await verResultado();

    fireEvent.click(botao("Recomeçar"));
    await screen.findByText("Onde você vai usar o ar-condicionado?");
    expect(window.location.search).toBe("");
  });
});

describe("estado do Assistente na URL", () => {
  it("grava as respostas na URL enquanto o wizard avança", async () => {
    iniciar();
    await verResultado();

    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("ambiente")).toBe("sala");
    expect(busca.get("forma")).toBe("metros");
    expect(busca.get("area")).toBe("24");
    expect(busca.get("sol")).toBe("tarde");
    expect(busca.get("pessoas")).toBe("1");
    expect(busca.get("eletronicos")).toBe("0");
    expect(busca.get("lampadas")).toBe("0");
    expect(busca.get("janelas")).toBe("0");
  });

  it("abre direto no resultado ao recarregar um link completo", async () => {
    iniciar(
      "/assistente/?ambiente=sala&forma=metros&area=24&sol=tarde&pessoas=1&eletronicos=0&lampadas=0&janelas=0",
    );

    const resultado = await screen.findByRole("status");
    expect(resultado.textContent).toContain("18.000 BTU/h");
    expect(progresso().getAttribute("aria-valuetext")).toBe("Resultado");
  });

  it("restaura a etapa em que o link parou", async () => {
    iniciar("/assistente/?ambiente=quarto&forma=metros&area=20");

    await screen.findByText("Como é a incidência de sol?");
    expect(progresso().getAttribute("aria-valuenow")).toBe("3");
  });
});
