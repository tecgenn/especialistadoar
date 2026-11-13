// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Consulta from "../src/components/Consulta.tsx";
import type { FiltrosCurados } from "../src/lib/filtros.ts";
import { opcoesDe } from "../src/lib/opcoes.ts";

/**
 * A ilha de consulta do site (ADR-0008) baixa o `consulta.json` publicado e aplica
 * filtros, busca e ordenação **no cliente**, refletindo o estado na URL. Aqui
 * mockamos o `fetch` do dataset e exercitamos a ilha no DOM (jsdom).
 *
 * O redesign (ticket 34) troca os `<select>` de marca/capacidade/função/tipo por
 * chips visíveis e deixa só um `<select>` "Outras…" para os valores fora da
 * curadoria. Os testes abaixo cobrem o comportamento externo: o que aparece, o
 * que filtra e o que vai parar na URL.
 */
const itens: ItemConsulta[] = [
  {
    id: "lg-split",
    marca: "LG",
    marcaCatalogo: "LG",
    modelo: "Dual Inverter",
    tipo: "Split Hi-Wall",
    funcao: "Frio",
    capacidadesBtu: [9000],
    tensoes: [220],
    classes: ["A"],
    idrs: [5],
    consumosKwh: [300],
  },
  {
    id: "lg-janela",
    marca: "LG",
    marcaCatalogo: "LG",
    modelo: "Janela",
    tipo: "Janela",
    funcao: "Frio",
    capacidadesBtu: [12000],
    tensoes: [127, 220],
    classes: ["B"],
    idrs: [3],
    consumosKwh: [50],
  },
  {
    id: "midea-oficial",
    marca: "MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Xtreme Save",
    tipo: "Split Hi-Wall",
    funcao: "Quente/Frio",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["A"],
    idrs: [4],
    consumosKwh: [200],
  },
  {
    id: "midea-springer",
    marca: "SPRINGER MIDEA",
    marcaCatalogo: "MIDEA",
    modelo: "Springer Inverter",
    tipo: "Split Hi-Wall",
    funcao: "Quente/Frio",
    capacidadesBtu: [18000],
    tensoes: [220],
    classes: ["A"],
    idrs: [4.5],
    consumosKwh: [400],
  },
  {
    id: "gree-split",
    marca: "GREE",
    marcaCatalogo: "GREE",
    modelo: "G-Top Inverter",
    tipo: "Split Hi-Wall",
    funcao: "Frio",
    capacidadesBtu: [12000],
    tensoes: [220],
    classes: ["C"],
    idrs: [3.5],
    consumosKwh: [100],
  },
  {
    id: "elgin-d",
    marca: "ELGIN",
    marcaCatalogo: "ELGIN",
    modelo: "Classe D",
    tipo: "Split Piso-teto",
    funcao: "Frio",
    capacidadesBtu: [30000],
    tensoes: [220],
    classes: ["D"],
    idrs: [2],
    consumosKwh: [150],
  },
  {
    id: "hitachi-e",
    marca: "HITACHI",
    marcaCatalogo: "HITACHI",
    modelo: "Classe E",
    tipo: "Split Cassete",
    funcao: "Frio",
    capacidadesBtu: [18000],
    tensoes: [220],
    classes: ["E"],
    idrs: [3],
    consumosKwh: [250],
  },
  {
    id: "daikin-f",
    marca: "DAIKIN",
    marcaCatalogo: "DAIKIN",
    modelo: "Classe F",
    tipo: "Split Hi-Wall",
    funcao: "Frio",
    capacidadesBtu: [30000],
    tensoes: [220],
    classes: ["F"],
    idrs: [2.5],
    consumosKwh: [350],
  },
];

/** Marcas, capacidades e classes conhecidas que viram chips na ilha. */
const curadoria: FiltrosCurados = {
  marcas: [
    { valor: "MIDEA", rotulo: "Midea" },
    { valor: "LG", rotulo: "LG" },
    // Curada mas ausente da base: não aparece.
    { valor: "SAMSUNG", rotulo: "Samsung" },
  ],
  btus: [12000, 9000, 24000],
  classes: [
    { valor: "A", rotulo: "Classe A", cor: "#16a34a" },
    { valor: "B", rotulo: "Classe B", cor: "#2563eb" },
    { valor: "C", rotulo: "Classe C", cor: "#ca8a04" },
    { valor: "D", rotulo: "Classe D", cor: "#ea580c" },
    { valor: "E", rotulo: "Classe E", cor: "#dc2626" },
    { valor: "F", rotulo: "Classe F", cor: "#dc2626" },
  ],
};

/** Serve o dataset no `fetch` da ilha, como o navegador faria com `/consulta.json`. */
function servirConsulta(dataset: ItemConsulta[] = itens) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => dataset })),
  );
}

/**
 * Um link que desliga explicitamente o filtro padrão (ticket 38, revisto no 44):
 * a URL sem chaves de filtro aplicaria Tensão 220 V. Os testes que exercitam a
 * tabela inteira partem daqui.
 */
const TODOS = "/?tensao=";

/** Abre o painel "Pesquisa avançada" (fechado por padrão no ticket 50). */
function abrirPesquisaAvancada() {
  const botao = screen.getByRole("button", { name: "Pesquisa avançada" });
  if (botao.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(botao);
  }
}

/**
 * Renderiza a ilha e espera o dataset carregar (fim do estado "Carregando").
 * Por padrão abre a Pesquisa avançada, porque a maioria dos testes manipula os
 * campos do painel; os testes do próprio painel passam `abrir: false`.
 */
async function montar(
  entrada?: FiltrosCurados,
  url = TODOS,
  { abrir = true }: { abrir?: boolean } = {},
) {
  window.history.replaceState(null, "", url);
  render(<Consulta opcoes={opcoesDe(itens, entrada)} />);
  await screen.findByText(/aparelho\(s\) com Dados declarados/);
  if (abrir) {
    abrirPesquisaAvancada();
  }
}

/** Os modelos de cada linha de dados, na ordem renderizada. */
function modelosVisiveis(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((linha) => linha.querySelector("a")?.textContent ?? "");
}

function cabecalho(nome: RegExp): HTMLElement {
  return screen.getByRole("columnheader", { name: nome });
}

/** Os textos das `<option>` de um `<select>`. */
function opcoesDoSelect(rotulo: string): string[] {
  const select = screen.getByLabelText(rotulo) as HTMLSelectElement;
  return [...select.querySelectorAll("option")].map(
    (opcao) => opcao.textContent ?? "",
  );
}

/** O CSS do site, para conferir regras de layout que o jsdom não calcula. */
function cssDaConsulta(): string {
  return readFileSync(
    join(process.cwd(), "apps/site/src/styles/global.css"),
    "utf8",
  );
}

beforeEach(() => {
  servirConsulta();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ilha de consulta (ADR-0008)", () => {
  it("carrega o consulta.json e ordena A–Z por Marca de catálogo e modelo", async () => {
    await montar();
    expect(modelosVisiveis()).toEqual([
      "Classe F",
      "Classe D",
      "G-Top Inverter",
      "Classe E",
      "Dual Inverter",
      "Janela",
      "Springer Inverter",
      "Xtreme Save",
    ]);
  });

  it("mostra uma linha por Aparelho com as 7 colunas da tabela", async () => {
    await montar();
    const [primeira] = screen.getAllByRole("row").slice(1);
    expect(primeira?.textContent).toContain("DAIKIN");
    expect(primeira?.textContent).toContain("Classe F");
    expect(primeira?.textContent).toContain("Split Hi-Wall");
    expect(primeira?.textContent).toContain("30.000");
    expect(primeira?.textContent).toContain("350");
    expect(primeira?.textContent).toContain("2,5");
    expect(primeira?.textContent).toContain("Classe F");
  });

  it("marca cada célula com o rótulo da coluna, para o cartão no celular", async () => {
    await montar();
    const [primeira] = screen.getAllByRole("row").slice(1);
    const rotulos = [...(primeira?.querySelectorAll("td") ?? [])].map(
      (celula) => celula.getAttribute("data-label"),
    );
    expect(rotulos).toEqual([
      "Marca",
      "Modelo",
      "Tipo",
      "BTU/h",
      "Consumo (kWh)",
      "IDRS",
      "Classe",
    ]);
  });

  it("filtra por marca pelo select 'Outras marcas'", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Outras marcas"), {
      target: { value: "GREE" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("G-Top Inverter")).toBeDefined();
  });

  it("mostra a Marca de catálogo e filtra pela família (ADR-0016)", async () => {
    await montar();
    // As Marcas oficiais são MIDEA e SPRINGER MIDEA; o catálogo exibe o grupo.
    expect(screen.getByText("Springer Inverter")).toBeDefined();
    expect(screen.getByText("Xtreme Save")).toBeDefined();
    expect(screen.getByRole("option", { name: "MIDEA" })).toBeDefined();
    expect(screen.queryByRole("option", { name: "SPRINGER MIDEA" })).toBeNull();

    fireEvent.change(screen.getByLabelText("Outras marcas"), {
      target: { value: "MIDEA" },
    });
    // O filtro da família traz a marca oficial e o alias, não um só.
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(screen.getByText("Springer Inverter")).toBeDefined();
    expect(screen.getByText("Xtreme Save")).toBeDefined();
  });

  it("mantém um link antigo com o valor oficial visível no filtro", async () => {
    window.history.replaceState(null, "", "/?marca=SPRINGER%20MIDEA");
    render(<Consulta opcoes={opcoesDe(itens)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    // O filtro continua valendo (67 na base real) e o `<select>` não mente.
    expect(
      (screen.getByLabelText("Outras marcas") as HTMLSelectElement).value,
    ).toBe("SPRINGER MIDEA");
    expect(screen.getByText("Springer Inverter")).toBeDefined();
  });

  it("filtra por tipo pelo chip", async () => {
    await montar();
    fireEvent.click(screen.getByRole("button", { name: "Janela" }));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Janela" })).toBeDefined();
  });

  it("filtra por capacidade pelo select 'Outras capacidades'", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Outras capacidades"), {
      target: { value: "9000" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("Dual Inverter")).toBeDefined();
  });

  it("filtra por tensão", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Tensão (V)"), {
      target: { value: "127" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Janela" })).toBeDefined();
  });

  it("filtra por função e Classe pelos chips", async () => {
    await montar(curadoria);

    fireEvent.click(screen.getByRole("button", { name: "Quente/Frio" }));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.click(screen.getByRole("button", { name: "Quente/Frio" }));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));

    fireEvent.click(screen.getByRole("button", { name: "Classe B" }));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Janela" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Classe B" }));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
  });

  it("combina filtro por campo com a busca textual (MiniSearch)", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Outras capacidades"), {
      target: { value: "12000" },
    });
    fireEvent.change(screen.getByLabelText("Busca"), {
      target: { value: "inverter" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByText("G-Top Inverter")).toBeDefined();
  });

  it("só mostra 'Limpar filtros' fora do padrão", async () => {
    await montar(undefined, "/");
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
    fireEvent.change(screen.getByLabelText("Outras marcas"), {
      target: { value: "LG" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(
      screen.getByRole("button", { name: "Limpar filtros" }),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });

  it("reflete o estado na URL ao filtrar", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Outras marcas"), {
      target: { value: "LG" },
    });
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("marca")).toBe(
        "LG",
      ),
    );
  });

  it("restaura o estado da URL ao abrir o link", async () => {
    window.history.replaceState(null, "", "/?marca=GREE");
    render(<Consulta opcoes={opcoesDe(itens)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(
      (screen.getByLabelText("Outras marcas") as HTMLSelectElement).value,
    ).toBe("GREE");
  });
});

describe("ordenação da tabela", () => {
  it("começa sem coluna ordenada e ordena ao clicar no cabeçalho", async () => {
    await montar();
    expect(cabecalho(/Consumo/).getAttribute("aria-sort")).toBe("none");

    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));
    await waitFor(() =>
      expect(modelosVisiveis()).toEqual([
        "Janela",
        "G-Top Inverter",
        "Classe D",
        "Xtreme Save",
        "Classe E",
        "Dual Inverter",
        "Classe F",
        "Springer Inverter",
      ]),
    );
    expect(cabecalho(/Consumo/).getAttribute("aria-sort")).toBe("ascending");
    expect(cabecalho(/Consumo/).querySelector("button")?.textContent).toContain(
      "↑",
    );
    expect(new URLSearchParams(window.location.search).get("ordem")).toBe(
      "consumo",
    );
    expect(new URLSearchParams(window.location.search).get("dir")).toBe("asc");
  });

  it("clicar de novo inverte a direção", async () => {
    await montar();
    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));
    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));

    await waitFor(() =>
      expect(modelosVisiveis()).toEqual([
        "Springer Inverter",
        "Classe F",
        "Dual Inverter",
        "Classe E",
        "Xtreme Save",
        "Classe D",
        "G-Top Inverter",
        "Janela",
      ]),
    );
    expect(cabecalho(/Consumo/).getAttribute("aria-sort")).toBe("descending");
    expect(new URLSearchParams(window.location.search).get("dir")).toBe("desc");
  });

  it("restaura a ordem da URL ao abrir o link", async () => {
    window.history.replaceState(null, "", `${TODOS}&ordem=idrs&dir=desc`);
    render(<Consulta opcoes={opcoesDe(itens)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    await waitFor(() =>
      expect(modelosVisiveis()).toEqual([
        "Dual Inverter",
        "Springer Inverter",
        "Xtreme Save",
        "G-Top Inverter",
        "Classe E",
        "Janela",
        "Classe F",
        "Classe D",
      ]),
    );
    expect(cabecalho(/IDRS/).getAttribute("aria-sort")).toBe("descending");
  });

  it("o seletor 'Ordenar por' repete só as 4 colunas ordenáveis", async () => {
    await montar();
    expect(opcoesDoSelect("Ordenar por")).toEqual([
      "Padrão (A–Z)",
      "BTU/h",
      "Consumo (kWh)",
      "IDRS",
      "Classe",
    ]);

    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "idrs" },
    });
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("ordem")).toBe(
        "idrs",
      ),
    );
    expect(cabecalho(/IDRS/).getAttribute("aria-sort")).toBe("ascending");

    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "" },
    });
    await waitFor(() =>
      expect(
        new URLSearchParams(window.location.search).get("ordem"),
      ).toBeNull(),
    );
    expect(modelosVisiveis()[0]).toBe("Classe F");
  });

  it("inverte a direção pelo botão, sem depender do cabeçalho da tabela", async () => {
    await montar();
    // Sem coluna escolhida não há direção para inverter.
    expect(
      screen.queryByRole("button", { name: /Ordenar de forma/ }),
    ).toBeNull();

    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "consumo" },
    });
    const inverter = await screen.findByRole("button", {
      name: "Ordenar de forma decrescente",
    });
    fireEvent.click(inverter);

    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("dir")).toBe(
        "desc",
      ),
    );
    expect(cabecalho(/Consumo/).getAttribute("aria-sort")).toBe("descending");
    expect(
      screen.getByRole("button", { name: "Ordenar de forma crescente" }),
    ).toBeDefined();
  });

  it("'Limpar filtros' volta ao padrão e mantém a ordenação", async () => {
    await montar(curadoria);
    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "consumo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "LG" }));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("marca")).toBeNull();
    expect(busca.get("tipo")).toBeNull();
    expect(busca.get("classe")).toBeNull();
    expect(busca.get("ordem")).toBe("consumo");
    expect(
      (screen.getByLabelText("Tensão (V)") as HTMLSelectElement).value,
    ).toBe("220");
  });

  it("o seletor 'Ordenar por' não oferece a coluna Tipo", async () => {
    await montar();
    expect(opcoesDoSelect("Ordenar por")).not.toContain("Tipo");
  });
});

/**
 * Ticket 43: a coluna Tipo é somente leitura e todo cabeçalho ordenável anuncia
 * as duas direções de uma vez — não só a ativa.
 */
describe("colunas e setas de ordenação (ticket 43)", () => {
  const ORDENAVEIS = ["BTU/h", "Consumo (kWh)", "IDRS", "Classe"];

  it("mostra Tipo após Modelo, sem botão, setas nem aria-sort", async () => {
    await montar();

    expect(
      screen
        .getAllByRole("columnheader")
        .map((th) => th.getAttribute("data-campo")),
    ).toEqual(["marca", "modelo", "tipo", "btu", "consumo", "idrs", "classe"]);

    const tipo = cabecalho(/^Tipo$/);
    expect(tipo.querySelector("button")).toBeNull();
    expect(tipo.querySelector(".seta")).toBeNull();
    expect(tipo.hasAttribute("aria-sort")).toBe(false);
    expect(tipo.textContent).toBe("Tipo");
  });

  it("mostra ↑ e ↓ em todo cabeçalho ordenável, apagadas sem ordem ativa", async () => {
    await montar();

    for (const rotulo of ORDENAVEIS) {
      const th = screen.getByRole("columnheader", { name: rotulo });
      expect(
        [...th.querySelectorAll(".seta")].map((seta) => seta.textContent),
      ).toEqual(["↑", "↓"]);
      expect(th.getAttribute("aria-sort")).toBe("none");
      expect(th.querySelector(".seta-ativa")).toBeNull();
    }
  });

  it("destaca só a direção ativa e alterna a cada clique", async () => {
    await montar();
    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));

    const th = cabecalho(/Consumo/);
    expect(th.getAttribute("aria-sort")).toBe("ascending");
    expect(
      th.querySelector(".seta-asc")?.classList.contains("seta-ativa"),
    ).toBe(true);
    expect(
      th.querySelector(".seta-desc")?.classList.contains("seta-ativa"),
    ).toBe(false);
    // As demais ordenáveis seguem com as duas setas apagadas.
    expect(cabecalho(/IDRS/).querySelector(".seta-ativa")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));
    expect(th.getAttribute("aria-sort")).toBe("descending");
    expect(
      th.querySelector(".seta-desc")?.classList.contains("seta-ativa"),
    ).toBe(true);
    expect(
      th.querySelector(".seta-asc")?.classList.contains("seta-ativa"),
    ).toBe(false);
  });
});

describe("'Mostrar mais'", () => {
  it("mostra 50 linhas e 'Mostrar mais' acrescenta 50", async () => {
    const muitos: ItemConsulta[] = Array.from({ length: 60 }, (_, indice) => ({
      ...(itens[0] as ItemConsulta),
      id: `aparelho-${indice}`,
      modelo: `Modelo ${indice}`,
    }));
    servirConsulta(muitos);
    render(<Consulta opcoes={opcoesDe(muitos)} />);
    await screen.findByText("60 aparelho(s) com Dados declarados.");

    expect(screen.getAllByRole("link")).toHaveLength(50);
    fireEvent.click(screen.getByRole("button", { name: "Mostrar mais" }));
    expect(screen.getAllByRole("link")).toHaveLength(60);
    expect(screen.queryByRole("button", { name: "Mostrar mais" })).toBeNull();
  });
});

describe("filtro padrão (ticket 38, revisto no 44)", () => {
  it("aplica só a Tensão 220 V na carga limpa, com URL limpa", async () => {
    await montar(curadoria, "/");

    expect(
      screen.getByText("8 aparelho(s) com Dados declarados."),
    ).toBeDefined();
    expect(window.location.search).toBe("");
    expect(
      (screen.getByLabelText("Tensão (V)") as HTMLSelectElement).value,
    ).toBe("220");
    // Tipo e Classe não entram mais no padrão: só a tensão restringe.
    expect(
      screen
        .getByRole("button", { name: "Split Hi-Wall" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(
      screen
        .getByRole("button", { name: "Classe A" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });

  it("não sobrepõe o padrão a um link com filtro próprio", async () => {
    await montar(curadoria, "/?marca=LG");

    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    // O link traz só a marca: nada de 220 V por cima.
    expect(screen.getAllByText("Janela").length).toBeGreaterThan(0);
    expect(
      (screen.getByLabelText("Tensão (V)") as HTMLSelectElement).value,
    ).toBe("");
    expect(
      screen.getByRole("button", { name: "Limpar filtros" }),
    ).toBeDefined();
  });

  it("compartilha o estado sem filtros quando a pessoa desliga o padrão", async () => {
    await montar(curadoria, "/");
    fireEvent.change(screen.getByLabelText("Tensão (V)"), {
      target: { value: "" },
    });

    await waitFor(() => expect(window.location.search).toBe("?tensao="));
    expect(
      screen.getByRole("button", { name: "Limpar filtros" }),
    ).toBeDefined();

    // O link reconstrói o mesmo estado, sem o padrão voltar por cima.
    cleanup();
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    expect(
      (screen.getByLabelText("Tensão (V)") as HTMLSelectElement).value,
    ).toBe("");
  });
});

/**
 * Os chips são a curadoria do site (ticket 22): marcas e capacidades conhecidas
 * a um clique, com o resto no `<select>`. O chip aceso **é** o valor do filtro —
 * sem dois valores de marca ao mesmo tempo.
 */
describe("chips de marca, capacidade, função, tipo e classe", () => {
  function chip(nome: string): HTMLElement {
    return screen.getByRole("button", { name: nome });
  }

  function pressionado(nome: string): string | null {
    return chip(nome).getAttribute("aria-pressed");
  }

  it("mostra as marcas e capacidades conhecidas como chips, sem as repetir no select", async () => {
    await montar(curadoria);

    expect(chip("Midea")).toBeDefined();
    expect(chip("LG")).toBeDefined();
    expect(chip("12.000")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Samsung" })).toBeNull();
    expect(screen.queryByRole("button", { name: "24.000" })).toBeNull();

    // O `<select>` "Outras…" guarda só o resto, sem duplicar o chip nem "Todas".
    const marcas = opcoesDoSelect("Outras marcas");
    expect(marcas).not.toContain("MIDEA");
    expect(marcas).not.toContain("Todas");
    expect(marcas).toContain("GREE");
    const capacidades = opcoesDoSelect("Outras capacidades");
    expect(capacidades).not.toContain("12.000");
    expect(capacidades).not.toContain("Todas");
    expect(capacidades).toContain("18.000");

    expect(pressionado("Midea")).toBe("false");
  });

  it("mostra função, tipo e classe como chips (classe com data-classe)", async () => {
    await montar(curadoria);

    expect(chip("Frio")).toBeDefined();
    expect(chip("Quente/Frio")).toBeDefined();
    expect(chip("Split Hi-Wall")).toBeDefined();
    expect(chip("Janela")).toBeDefined();
    for (const classe of ["A", "B", "C", "D", "E", "F"]) {
      const botao = chip(`Classe ${classe}`);
      expect(botao.getAttribute("data-classe")).toBe(classe);
    }
  });

  it("filtra ao clicar no chip, acende o chip e escreve a URL", async () => {
    await montar(curadoria);
    fireEvent.click(chip("Midea"));

    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(screen.getByText("Xtreme Save")).toBeDefined();
    expect(screen.getByText("Springer Inverter")).toBeDefined();
    expect(pressionado("Midea")).toBe("true");
    expect(new URLSearchParams(window.location.search).get("marca")).toBe(
      "MIDEA",
    );
  });

  it("clicar de novo no chip ativo limpa o filtro", async () => {
    await montar(curadoria);
    fireEvent.click(chip("Midea"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.click(chip("Midea"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    expect(pressionado("Midea")).toBe("false");
    expect(new URLSearchParams(window.location.search).get("marca")).toBeNull();
    // A base do teste é "todos os aparelhos", que difere do padrão — o botão
    // continua à mão para voltar ao recorte inicial.
    expect(
      screen.getByRole("button", { name: "Limpar filtros" }),
    ).toBeDefined();
  });

  it("escolher no select desliga o chip (um valor de marca por vez)", async () => {
    await montar(curadoria);
    fireEvent.click(chip("Midea"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.change(screen.getByLabelText("Outras marcas"), {
      target: { value: "GREE" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(pressionado("Midea")).toBe("false");
    expect(new URLSearchParams(window.location.search).get("marca")).toBe(
      "GREE",
    );
  });

  it("restaura da URL o chip aceso", async () => {
    window.history.replaceState(null, "", "/?marca=MIDEA&btu=12000");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    expect(pressionado("Midea")).toBe("true");
    expect(pressionado("12.000")).toBe("true");
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
  });

  it("filtra por capacidade no chip e limpa no segundo clique", async () => {
    await montar(curadoria);
    fireEvent.click(chip("12.000"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(3));
    expect(pressionado("12.000")).toBe("true");
    expect(new URLSearchParams(window.location.search).get("btu")).toBe(
      "12000",
    );

    fireEvent.click(chip("12.000"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    expect(pressionado("12.000")).toBe("false");
  });

  it("um link antigo com o valor oficial não acende nem some do select", async () => {
    window.history.replaceState(null, "", "/?marca=SPRINGER%20MIDEA");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));

    expect(pressionado("Midea")).toBe("false");
    expect(
      (screen.getByLabelText("Outras marcas") as HTMLSelectElement).value,
    ).toBe("SPRINGER MIDEA");
  });

  it("acende o chip e filtra com a marca em minúsculas na URL", async () => {
    window.history.replaceState(null, "", "/?marca=midea");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    expect(pressionado("Midea")).toBe("true");
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(screen.queryByRole("option", { name: "midea" })).toBeNull();
    expect(
      (screen.getByLabelText("Outras marcas") as HTMLSelectElement).value,
    ).toBe("");
  });

  it("os selects 'Outras…' não têm a opção 'Todas'", async () => {
    await montar(curadoria);
    for (const rotulo of ["Outras marcas", "Outras capacidades"]) {
      const select = screen.getByLabelText(rotulo) as HTMLSelectElement;
      expect(
        within(select).queryByRole("option", { name: "Todas" }),
      ).toBeNull();
    }
  });
});

describe("layout central (ticket 50)", () => {
  it("não tem barra lateral e usa a coluna de até 72 rem", async () => {
    await montar(curadoria, "/", { abrir: false });
    expect(document.querySelector(".filtros-sidebar")).toBeNull();
    expect(document.querySelector(".consulta-layout")).toBeNull();

    const css = cssDaConsulta();
    expect(css).toMatch(/\.pagina-aparelhos\s*\{[^}]*max-width:\s*72rem/);
    expect(css).not.toMatch(/\.filtros-sidebar/);
  });

  it("ordena a leitura: busca, Pesquisa avançada, vitrine, ordenação e tabela", async () => {
    window.history.replaceState(null, "", TODOS);
    render(
      <Consulta
        opcoes={opcoesDe(itens, curadoria)}
        analisados={
          new Map([
            ["lg-split", { titulo: "Análise LG", url: "/analises/lg/" }],
          ])
        }
      />,
    );
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    const busca = document.querySelector(".busca") as HTMLElement;
    const avancon = screen.getByRole("button", { name: "Pesquisa avançada" });
    const vitrine = document.querySelector(".com-analise") as HTMLElement;
    const ordenacao = document.querySelector(".linha-ordenacao") as HTMLElement;
    const tabela = screen.getByRole("table");
    const antes = (a: Node, b: Node) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(antes(busca, avancon)).toBe(true);
    expect(antes(avancon, vitrine)).toBe(true);
    expect(antes(vitrine, ordenacao)).toBe(true);
    expect(antes(ordenacao, tabela)).toBe(true);
  });
});

describe("Pesquisa avançada (ticket 50)", () => {
  function painel(): HTMLElement {
    return document.getElementById("pesquisa-avancada") as HTMLElement;
  }

  it("começa fechada, com os campos fora da árvore acessível", async () => {
    await montar(curadoria, "/", { abrir: false });

    const botao = screen.getByRole("button", { name: "Pesquisa avançada" });
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(painel().hidden).toBe(true);
    expect(screen.queryByRole("group", { name: "Marca" })).toBeNull();
  });

  it("abre e fecha pelo botão", async () => {
    await montar(curadoria, "/", { abrir: false });
    const botao = screen.getByRole("button", { name: "Pesquisa avançada" });

    fireEvent.click(botao);
    expect(botao.getAttribute("aria-expanded")).toBe("true");
    expect(painel().hidden).toBe(false);
    expect(screen.getByRole("group", { name: "Marca" })).toBeDefined();

    fireEvent.click(botao);
    expect(botao.getAttribute("aria-expanded")).toBe("false");
    expect(painel().hidden).toBe(true);
  });

  it("abre sozinha quando a URL traz um filtro avançado", async () => {
    await montar(curadoria, "/?marca=LG", { abrir: false });

    const botao = screen.getByRole("button", { name: "Pesquisa avançada" });
    expect(botao.getAttribute("aria-expanded")).toBe("true");
    expect(painel().hidden).toBe(false);
    expect(screen.getByRole("group", { name: "Marca" })).toBeDefined();
  });

  it("não abre com a carga limpa nem com o padrão desligado", async () => {
    for (const url of ["/", "/?tensao="]) {
      cleanup();
      await montar(curadoria, url, { abrir: false });
      const botao = screen.getByRole("button", {
        name: "Pesquisa avançada",
      });
      expect(botao.getAttribute("aria-expanded")).toBe("false");
      expect(painel().hidden).toBe(true);
    }
  });
});

describe("chips do recorte efetivo (ticket 50)", () => {
  function grupo(): HTMLElement {
    return screen.getByRole("group", { name: "Filtros ativos" });
  }

  function chips(): HTMLElement[] {
    return within(grupo()).queryAllByRole("button");
  }

  it("mostra o 220 V implícito, e o × desliga o padrão gravando tensao=", async () => {
    await montar(curadoria, "/", { abrir: false });

    expect(chips()).toHaveLength(1);
    expect(chips()[0]?.textContent).toBe("Tensão: 220 V×");
    expect(chips()[0]?.getAttribute("aria-label")).toBe(
      "Remover filtro Tensão: 220 V",
    );

    fireEvent.click(chips()[0] as HTMLElement);
    await waitFor(() => expect(window.location.search).toBe("?tensao="));
    expect(screen.getAllByRole("link")).toHaveLength(8);
    expect(chips()).toHaveLength(0);
    expect(within(grupo()).getByText("Nenhum filtro ativo.")).toBeDefined();
    // A URL sem o padrão mostra todos; o painel continua fechado.
    expect(
      screen
        .getByRole("button", { name: "Pesquisa avançada" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("resume todos os filtros efetivos, inclusive a busca", async () => {
    await montar(
      curadoria,
      "/?marca=LG&btu=9000&funcao=Frio&tensao=220&tipo=Split+Hi-Wall&classe=A&q=inverter",
      { abrir: false },
    );

    expect(chips().map((chip) => chip.textContent)).toEqual([
      "Busca: inverter×",
      "Marca: LG×",
      "Capacidade: 9.000 BTU/h×",
      "Função: Frio×",
      "Tensão: 220 V×",
      "Tipo: Split Hi-Wall×",
      "Classe: A×",
    ]);
  });

  it("o × remove só aquele filtro e mantém a ordenação", async () => {
    await montar(curadoria, "/?marca=LG&ordem=consumo", { abrir: false });

    fireEvent.click(
      screen.getByRole("button", { name: "Remover filtro Marca: LG" }),
    );

    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("marca")).toBeNull();
    expect(busca.get("ordem")).toBe("consumo");
  });
});

describe("layout compacto dos filtros (ticket 45)", () => {
  it("mostra só a letra nos chips de Classe, com aria-label e cor curada", async () => {
    await montar(curadoria);

    // As cores vêm da curadoria (mesma fonte da ilha), não são redeclaradas.
    const cores = Object.fromEntries(
      curadoria.classes.map((classe) => [classe.valor, classe.cor ?? ""]),
    );
    for (const [classe, cor] of Object.entries(cores)) {
      const botao = screen.getByRole("button", { name: `Classe ${classe}` });
      expect(botao.textContent).toBe(classe);
      expect(botao.getAttribute("aria-label")).toBe(`Classe ${classe}`);
      expect(botao.getAttribute("data-classe")).toBe(classe);
      expect(botao.style.getPropertyValue("--cor-classe")).toBe(cor);
    }
  });

  it("mantém os seis chips de Classe numa única fileira (grade de 6)", async () => {
    await montar(curadoria);

    const grupo = screen.getByRole("group", { name: "Classe" });
    expect(within(grupo).getAllByRole("button")).toHaveLength(6);
    expect(cssDaConsulta()).toMatch(
      /\.consulta \.campo-classe \.chips\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/,
    );
  });
});

describe("Aparelhos analisados na tabela (ticket 44)", () => {
  const analisadosMap = new Map<string, { titulo: string; url: string }>([
    [
      "lg-split",
      {
        titulo: "Análise do LG Dual Inverter",
        url: "/analises/lg-dual-inverter/",
      },
    ],
    [
      "midea-oficial",
      {
        titulo: "Análise do Midea Xtreme Save",
        url: "/analises/midea-xtreme-save/",
      },
    ],
  ]);

  async function montarComAnalisados(url = TODOS) {
    window.history.replaceState(null, "", url);
    render(<Consulta opcoes={opcoesDe(itens)} analisados={analisadosMap} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
  }

  it("mostra o selo 'Análise' com link para a Análise, fora da célula de Marca", async () => {
    await montarComAnalisados();
    const tabela = screen.getByRole("table");
    const links = within(tabela).getAllByRole("link", { name: "Análise" });
    expect(links).toHaveLength(2);
    // O texto "Análise" está dentro do <a> da etiqueta de contorno.
    expect(links[0]?.getAttribute("href")).toBe("/analises/lg-dual-inverter/");
    expect(links[0]?.classList.contains("analisado-etiqueta")).toBe(true);
    // O selo saiu da primeira coluna (Marca) e vive na última (Análise).
    const linha = links[0]?.closest("tr") as HTMLElement;
    const celulas = [...linha.querySelectorAll("td")];
    expect(celulas[0]?.querySelector(".analisado-selo")).toBeNull();
    expect(celulas.at(-1)?.getAttribute("data-campo")).toBe("analise");
    expect(celulas.at(-1)?.querySelector(".analisado-selo")).not.toBeNull();
  });

  it("o tooltip do selo traz apenas o título da Análise", async () => {
    await montarComAnalisados();
    const tabela = screen.getByRole("table");
    const selo = within(tabela)
      .getAllByRole("link", { name: "Análise" })[0]
      ?.closest(".analisado-selo");
    expect(selo).not.toBeNull();
    const tooltip = selo?.querySelector('[role="tooltip"]');
    expect(tooltip?.textContent).toBe("Análise do LG Dual Inverter");
    expect(tooltip?.textContent).not.toContain("afiliado");
    const link = selo?.querySelector("a");
    expect(link?.getAttribute("aria-describedby")).toBe(tooltip?.id);
  });

  it("destaca as linhas dos analisados", async () => {
    await montarComAnalisados();
    const linhas = screen.getAllByRole("row").slice(1);
    // Sem filtros, os dois analisados são as primeiras linhas de dados.
    expect(linhas[0]?.classList.contains("linha-analisado")).toBe(true);
    expect(linhas[1]?.classList.contains("linha-analisado")).toBe(true);
    expect(linhas[2]?.classList.contains("linha-analisado")).toBe(false);
  });

  it("não mostra mais os cabeçalhos de grupo nem o aviso de afiliado", async () => {
    await montarComAnalisados();
    expect(screen.queryByText("Analisados por nós")).toBeNull();
    expect(screen.queryByText("Demais aparelhos")).toBeNull();
    expect(screen.queryByText(/links de afiliado/)).toBeNull();
  });

  it("analisados aparecem antes dos demais, qualquer que seja a ordenação", async () => {
    await montarComAnalisados();
    // Ordena por consumo: dentro dos analisados, o Xtreme Save (200)
    // vem antes do Dual Inverter (300).
    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));
    await waitFor(() => {
      const linhas = screen.getAllByRole("row").slice(1);
      expect(linhas[0]?.textContent).toContain("Xtreme Save");
      expect(linhas[1]?.textContent).toContain("Dual Inverter");
    });
  });

  it("no recorte inicial, a vitrine mostra os analisados do recorte, fora da tabela", async () => {
    // A carga limpa ("/") é o padrão (só Tensão 220 V), sem filtro "ativo".
    await montarComAnalisados("/");

    const bloco = document.querySelector(".com-analise") as HTMLElement;
    expect(bloco).not.toBeNull();
    expect(bloco.closest("table")).toBeNull();
    const tabela = screen.getByRole("table");
    expect(
      bloco.compareDocumentPosition(tabela) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Título único e direto — sem a linha explicativa repetida.
    expect(within(bloco).getByText("Aparelhos com análise")).toBeDefined();
    expect(bloco.textContent).not.toMatch(/não passam nos filtros atuais/);

    // O item mostra a Marca e o **título da Análise**, como no tooltip.
    const links = within(bloco).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]?.textContent).toContain("LG");
    expect(links[0]?.textContent).toContain("Análise do LG Dual Inverter");
    expect(links[1]?.textContent).toContain("Análise do Midea Xtreme Save");
  });

  it("com filtro ativo, a vitrine acompanha o recorte e repete o analisado da tabela", async () => {
    await montarComAnalisados("/?marca=LG");

    // O bloco mostra o analisado que passa no filtro...
    const bloco = document.querySelector(".com-analise") as HTMLElement;
    expect(bloco).not.toBeNull();
    const links = within(bloco).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]?.textContent).toContain("Análise do LG Dual Inverter");

    // ...e ele também aparece, destacado, na tabela: a repetição é intencional.
    const linha = screen
      .getAllByRole("row")
      .find((row) => row.textContent?.includes("Dual Inverter"));
    expect(linha?.classList.contains("linha-analisado")).toBe(true);
  });

  it("esconde a vitrine quando nenhum analisado passa no filtro", async () => {
    await montarComAnalisados("/?marca=GREE");

    // O filtro é GREE e os analisados são LG e MIDEA: não há o que vitrinear.
    expect(document.querySelector(".com-analise")).toBeNull();
    expect(screen.queryByText("Aparelhos com análise")).toBeNull();
    // O bloco não entra na contagem: só o GREE passou nos filtros.
    expect(
      screen.getByText("1 aparelho(s) com Dados declarados."),
    ).toBeDefined();
  });

  it("limita a vitrine a 6 e abre com as capacidades mais compradas", async () => {
    const mapaAmplo = new Map<string, { titulo: string; url: string }>([
      ["elgin-d", { titulo: "Análise Elgin", url: "/analises/elgin/" }],
      ["daikin-f", { titulo: "Análise Daikin", url: "/analises/daikin/" }],
      ["lg-split", { titulo: "Análise LG", url: "/analises/lg/" }],
      ["midea-oficial", { titulo: "Análise Midea", url: "/analises/midea/" }],
      [
        "midea-springer",
        { titulo: "Análise Springer", url: "/analises/springer/" },
      ],
      ["gree-split", { titulo: "Análise Gree", url: "/analises/gree/" }],
      ["hitachi-e", { titulo: "Análise Hitachi", url: "/analises/hitachi/" }],
    ]);
    // TODOS desliga o filtro padrão: os sete analisados passam no recorte.
    window.history.replaceState(null, "", TODOS);
    render(<Consulta opcoes={opcoesDe(itens)} analisados={mapaAmplo} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    const bloco = document.querySelector(".com-analise") as HTMLElement;
    expect(bloco).not.toBeNull();
    const links = within(bloco).getAllByRole("link");
    expect(links).toHaveLength(6);
    // O primeiro analisado do mapa é o Elgin (30.000 BTU/h), mas as capacidades
    // mais compradas abrem a vitrine: o LG (9.000) vem primeiro.
    expect(links[0]?.textContent).toContain("Análise LG");
    // O 6º slot é o primeiro "demais" na ordem das Análises: o Elgin.
    expect(links[5]?.textContent).toContain("Análise Elgin");
    // O corte de 6 deixa o Daikin de fora.
    expect(within(bloco).queryByText(/Análise Daikin/)).toBeNull();
    // A tabela continua com os oito Aparelhos do dataset.
    expect(
      screen.getByText("8 aparelho(s) com Dados declarados."),
    ).toBeDefined();
  });

  it("o bloco não altera a contagem nem o 'Mostrar mais'", async () => {
    const muitos: ItemConsulta[] = Array.from({ length: 55 }, (_, indice) => ({
      id: `lg-${indice}`,
      marca: "LG",
      marcaCatalogo: "LG",
      modelo: `Modelo ${indice}`,
      tipo: "Split Hi-Wall",
      funcao: "Frio",
      capacidadesBtu: [9000],
      tensoes: [220],
      classes: ["A"],
      idrs: [5],
      consumosKwh: [100 + indice],
    }));
    muitos.push({
      id: "fora-do-filtro",
      marca: "GREE",
      marcaCatalogo: "GREE",
      modelo: "Fora do filtro",
      tipo: "Split Hi-Wall",
      funcao: "Frio",
      capacidadesBtu: [9000],
      tensoes: [220],
      classes: ["A"],
      idrs: [5],
      consumosKwh: [500],
    });
    servirConsulta(muitos);
    window.history.replaceState(null, "", "/?marca=LG");
    render(
      <Consulta
        opcoes={opcoesDe(muitos)}
        analisados={
          new Map([
            ["lg-0", { titulo: "Análise LG 0", url: "/analises/lg-0/" }],
          ])
        }
      />,
    );
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    expect(
      screen.getByText("55 aparelho(s) com Dados declarados."),
    ).toBeDefined();
    expect(screen.getAllByRole("row").slice(1)).toHaveLength(50);
    expect(document.querySelector(".com-analise")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Mostrar mais" }));
    await waitFor(() =>
      expect(screen.getAllByRole("row").slice(1)).toHaveLength(55),
    );
    expect(document.querySelector(".com-analise")).not.toBeNull();
  });

  it("sem analisados, não há selo nem bloco", async () => {
    render(<Consulta opcoes={opcoesDe(itens)} analisados={new Map()} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    expect(screen.queryByText("Análise")).toBeNull();
    expect(screen.queryByText("Aparelhos com análise")).toBeNull();
    expect(document.querySelector(".com-analise")).toBeNull();
  });
});

describe("coluna Análise (ticket 50)", () => {
  const analisadosMap = new Map<string, { titulo: string; url: string }>([
    [
      "lg-split",
      {
        titulo: "Análise do LG Dual Inverter",
        url: "/analises/lg-dual-inverter/",
      },
    ],
  ]);

  function camposDoCabecalho(): (string | null)[] {
    return screen
      .getAllByRole("columnheader")
      .map((th) => th.getAttribute("data-campo"));
  }

  async function montarComAnalise(url = TODOS) {
    window.history.replaceState(null, "", url);
    render(<Consulta opcoes={opcoesDe(itens)} analisados={analisadosMap} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
  }

  it("é a última coluna quando há ao menos uma Análise publicada", async () => {
    await montarComAnalise();

    expect(camposDoCabecalho()).toEqual([
      "marca",
      "modelo",
      "tipo",
      "btu",
      "consumo",
      "idrs",
      "classe",
      "analise",
    ]);
    const ultimo = screen.getAllByRole("columnheader").at(-1);
    expect(ultimo?.textContent).toBe("Análise");
    expect(ultimo?.querySelector("button")).toBeNull();
  });

  it("não existe sem Análise publicada", async () => {
    await montar();

    expect(camposDoCabecalho()).toEqual([
      "marca",
      "modelo",
      "tipo",
      "btu",
      "consumo",
      "idrs",
      "classe",
    ]);
    expect(screen.queryByRole("columnheader", { name: "Análise" })).toBeNull();
  });

  it("marca a célula vazia para o cartão do celular esconder a linha", async () => {
    await montarComAnalise();

    const linha = screen
      .getAllByRole("row")
      .find((row) => row.textContent?.includes("Dual Inverter"));
    const celulas = [...(linha?.querySelectorAll("td") ?? [])];
    expect(celulas.at(-1)?.getAttribute("data-campo")).toBe("analise");
    expect(celulas.at(-1)?.classList.contains("celula-analise-vazia")).toBe(
      false,
    );

    const outra = screen
      .getAllByRole("row")
      .find((row) => row.textContent?.includes("Classe E"));
    const ultimaOutra = [...(outra?.querySelectorAll("td") ?? [])].at(-1);
    expect(ultimaOutra?.classList.contains("celula-analise-vazia")).toBe(true);
    expect(ultimaOutra?.textContent).toBe("—");
  });
});
