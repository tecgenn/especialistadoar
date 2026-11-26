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
    .map((linha) => {
      const linkModelo = linha.querySelector<HTMLAnchorElement>(
        'a[href^="/aparelhos/"]',
      );
      return linkModelo?.textContent ?? "";
    });
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

/**
 * Simula a faixa estreita (ticket 73): a ilha lê `matchMedia` para decidir se o
 * painel é a sobreposição modal ou o painel embutido do desktop.
 */
function simularCelular() {
  vi.stubGlobal("matchMedia", (consulta: string) => ({
    matches: consulta.includes("max-width"),
    media: consulta,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));
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

  it("mostra uma linha por Aparelho com as colunas da tabela", async () => {
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

  it("renderiza uma célula por coluna, na ordem do cabeçalho", async () => {
    await montar();
    const [primeira] = screen.getAllByRole("row").slice(1);
    const rotulos = [...(primeira?.querySelectorAll("td") ?? [])].map(
      (celula) => celula.getAttribute("data-label"),
    );
    // Sem Análise publicada no fixture, a coluna "Análise" não existe; a
    // leitura vai da identificação à qualificação (ticket 72). O
    // `data-label` acompanha cada célula mesmo sem cartão: a tabela é a mesma
    // em todas as larguras.
    expect(rotulos).toEqual([
      "Comparar",
      "Marca",
      "Modelo",
      "Capacidade",
      "Consumo",
      "IDRS",
      "Classe",
      "Tipo",
    ]);
  });

  describe("segunda linha Função · Tensão (ticket 63)", () => {
    /** O texto da segunda linha do Aparelho de dado modelo. */
    function detalheDaLinha(modelo: string): string | null {
      const link = screen.getByRole("link", { name: modelo });
      const celula = link.closest("td");
      return celula?.querySelector(".modelo-detalhe")?.textContent ?? null;
    }

    it("mostra Função e Tensão sob o modelo, na mesma célula", async () => {
      await montar();
      const link = screen.getByRole("link", { name: "Classe F" });
      expect(link.closest("td")?.getAttribute("data-campo")).toBe("modelo");
      expect(detalheDaLinha("Classe F")).toBe("Frio · 220 V");
    });

    it("lista as duas tensões do Aparelho bivolt", async () => {
      await montar();
      expect(detalheDaLinha("Janela")).toBe("Frio · 127 · 220 V");
    });

    it("não deixa separador solto quando falta Função ou Tensão", async () => {
      const base: ItemConsulta = {
        id: "sem-detalhe",
        marca: "LG",
        marcaCatalogo: "LG",
        modelo: "Sem Detalhe",
        tipo: "Split Hi-Wall",
        funcao: null,
        capacidadesBtu: [9000],
        tensoes: [],
        classes: ["A"],
        idrs: [5],
        consumosKwh: [300],
      };
      servirConsulta([
        base,
        { ...base, id: "so-funcao", modelo: "Só Função", funcao: "Frio" },
      ]);
      await montar();

      expect(
        screen
          .getByRole("link", { name: "Sem Detalhe" })
          .closest("td")
          ?.querySelector(".modelo-detalhe"),
      ).toBeNull();
      expect(detalheDaLinha("Só Função")).toBe("Frio");
    });
  });

  it("filtra por marca pelo campo de busca 'Outras marcas'", async () => {
    await montar();
    fireEvent.change(screen.getByRole("searchbox", { name: "Outras marcas" }), {
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

    fireEvent.change(screen.getByRole("searchbox", { name: "Outras marcas" }), {
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
    // O filtro continua valendo (67 na base real) e o campo de busca não mente.
    expect(
      (
        screen.getByRole("searchbox", {
          name: "Outras marcas",
        }) as HTMLInputElement
      ).value,
    ).toBe("SPRINGER MIDEA");
    expect(screen.getByText("Springer Inverter")).toBeDefined();
  });

  it("filtra por tipo pelo chip", async () => {
    await montar();
    fireEvent.click(screen.getByRole("button", { name: "Janela" }));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Janela" })).toBeDefined();
  });

  it("filtra por capacidade exata pelo select do campo Capacidade", async () => {
    await montar();
    fireEvent.change(screen.getByLabelText("Capacidade exata"), {
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
    fireEvent.change(screen.getByLabelText("Capacidade exata"), {
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
      (screen.getByLabelText("Outras marcas") as HTMLInputElement).value,
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
    expect(
      cabecalho(/Consumo/)
        .querySelector(".seta-asc")
        ?.classList.contains("seta-ativa"),
    ).toBe(true);
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
      "Capacidade",
      "Consumo",
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
  const ORDENAVEIS = ["Capacidade", "Consumo", "IDRS", "Classe"];

  it("mostra Tipo por último, sem botão, setas nem aria-sort", async () => {
    await montar();

    expect(
      screen
        .getAllByRole("columnheader")
        .map((th) => th.getAttribute("data-campo")),
    ).toEqual([
      "selecao",
      "marca",
      "modelo",
      "btu",
      "consumo",
      "idrs",
      "classe",
      "tipo",
    ]);

    const tipo = cabecalho(/^Tipo$/);
    expect(tipo.querySelector("button")).toBeNull();
    expect(tipo.querySelector(".seta")).toBeNull();
    expect(tipo.hasAttribute("aria-sort")).toBe(false);
    expect(tipo.textContent).toBe("Tipo");
  });

  it("mostra as duas setas desenhadas em todo cabeçalho ordenável, apagadas sem ordem ativa", async () => {
    await montar();

    for (const rotulo of ORDENAVEIS) {
      const th = screen.getByRole("columnheader", { name: rotulo });
      expect(th.querySelectorAll(".seta svg")).toHaveLength(2);
      expect(th.getAttribute("aria-sort")).toBe("none");
      expect(th.querySelector(".seta-ativa")).toBeNull();
    }
  });

  it("não usa glifo de seta: as setas são chevrons desenhados", async () => {
    await montar();
    const th = cabecalho(/Consumo/);
    expect(th.querySelector("button")?.textContent).not.toMatch(/[↑↓]/);
    expect(th.querySelectorAll(".seta svg")).toHaveLength(2);
  });

  it("dá 44 px de alvo ao botão de ordenação", async () => {
    await montar();
    expect(cssDaConsulta()).toMatch(
      /\.consulta \.tabela-aparelhos thead button\s*\{[^}]*min-height:\s*44px/,
    );
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
    // O botão informa quantos Aparelhos ainda restam (ticket 72).
    const mais = screen.getByRole("button", { name: /Mostrar mais/ });
    expect(mais.textContent).toContain("10 restantes");

    fireEvent.click(mais);
    expect(screen.getAllByRole("link")).toHaveLength(60);
    expect(screen.queryByRole("button", { name: /Mostrar mais/ })).toBeNull();
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

  it("mostra as faixas de capacidade como chips e todas as exatas no select", async () => {
    await montar(curadoria);

    expect(chip("Midea")).toBeDefined();
    expect(chip("LG")).toBeDefined();
    // As quatro faixas com Aparelho na base; as vazias não são renderizadas.
    for (const faixa of [
      "Até 9.000 BTU/h",
      "9.001–12.000 BTU/h",
      "12.001–18.000 BTU/h",
      "24.001–30.000 BTU/h",
    ]) {
      expect(chip(faixa)).toBeDefined();
    }
    expect(
      screen.queryByRole("button", { name: "18.001–24.000 BTU/h" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Acima de 30.000 BTU/h" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Samsung" })).toBeNull();

    // A Marca fora da curadoria é um campo de busca (ticket 61), sem a lista
    // longa do `<select>` antigo; o `<select>` do campo Capacidade guarda todas
    // as exatas — inclusive as que antes eram chips —, sem repetir as faixas.
    expect(
      screen.getByRole("searchbox", { name: "Outras marcas" }).tagName,
    ).toBe("INPUT");
    const capacidades = opcoesDoSelect("Capacidade exata");
    expect(capacidades).toEqual([
      "Todas as capacidades",
      "9.000",
      "12.000",
      "18.000",
      "30.000",
    ]);

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

  it("buscar outra marca desliga o chip (um valor de marca por vez)", async () => {
    await montar(curadoria);
    fireEvent.click(chip("Midea"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    fireEvent.change(screen.getByRole("searchbox", { name: "Outras marcas" }), {
      target: { value: "GREE" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(pressionado("Midea")).toBe("false");
    expect(new URLSearchParams(window.location.search).get("marca")).toBe(
      "GREE",
    );
  });

  it("restaura da URL a capacidade exata no select, sem acender faixa", async () => {
    window.history.replaceState(null, "", "/?marca=MIDEA&btu=12000");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    expect(pressionado("Midea")).toBe("true");
    expect(
      (screen.getByLabelText("Capacidade exata") as HTMLSelectElement).value,
    ).toBe("12000");
    for (const faixa of [
      "Até 9.000 BTU/h",
      "9.001–12.000 BTU/h",
      "12.001–18.000 BTU/h",
    ]) {
      expect(pressionado(faixa)).toBe("false");
    }
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
  });

  it("filtra pela faixa de capacidade e limpa no segundo clique", async () => {
    await montar(curadoria);
    fireEvent.click(chip("9.001–12.000 BTU/h"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(3));
    expect(pressionado("9.001–12.000 BTU/h")).toBe("true");
    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("btuMin")).toBe("9001");
    expect(busca.get("btuMax")).toBe("12000");
    expect(busca.get("btu")).toBeNull();

    fireEvent.click(chip("9.001–12.000 BTU/h"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    expect(pressionado("9.001–12.000 BTU/h")).toBe("false");
    const depois = new URLSearchParams(window.location.search);
    expect(depois.get("btuMin")).toBeNull();
    expect(depois.get("btuMax")).toBeNull();
  });

  it("faixa e capacidade exata são exclusivas nos dois sentidos", async () => {
    await montar(curadoria);

    fireEvent.click(chip("12.001–18.000 BTU/h"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));

    // Escolher a exata limpa as duas chaves da faixa.
    fireEvent.change(screen.getByLabelText("Capacidade exata"), {
      target: { value: "9000" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    const comExata = new URLSearchParams(window.location.search);
    expect(comExata.get("btu")).toBe("9000");
    expect(comExata.get("btuMin")).toBeNull();
    expect(comExata.get("btuMax")).toBeNull();
    expect(pressionado("12.001–18.000 BTU/h")).toBe("false");

    // E escolher a faixa limpa a exata.
    fireEvent.click(chip("9.001–12.000 BTU/h"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(3));
    const comFaixa = new URLSearchParams(window.location.search);
    expect(comFaixa.get("btu")).toBeNull();
    expect(comFaixa.get("btuMin")).toBe("9001");
    expect(comFaixa.get("btuMax")).toBe("12000");
    expect(
      (screen.getByLabelText("Capacidade exata") as HTMLSelectElement).value,
    ).toBe("");
  });

  it("o contador de resultados é coerente ao trocar faixa por exata e vice-versa", async () => {
    await montar(curadoria);

    // Sem filtro: todos os 8 aparelhos da base.
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));

    // Abre a faixa 9.001–12.000: 3 aparelhos entram (12.000 x3).
    fireEvent.click(chip("9.001–12.000 BTU/h"));
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(3));
    expect(pressionado("9.001–12.000 BTU/h")).toBe("true");

    // Escolhe a exata 9.000: o contador desce para 1 e a faixa se apaga.
    fireEvent.change(screen.getByLabelText("Capacidade exata"), {
      target: { value: "9000" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));
    expect(pressionado("9.001–12.000 BTU/h")).toBe("false");
    expect(
      (screen.getByLabelText("Capacidade exata") as HTMLSelectElement).value,
    ).toBe("9000");

    // Volta a "Todas as capacidades": o contador volta para 8.
    fireEvent.change(screen.getByLabelText("Capacidade exata"), {
      target: { value: "" },
    });
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    expect(pressionado("9.001–12.000 BTU/h")).toBe("false");
  });

  it("o chip de faixa acende quando a URL traz btuMin/btuMax", async () => {
    window.history.replaceState(null, "", "/?btuMin=12001&btuMax=18000");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    abrirPesquisaAvancada();

    // O useEffect de leitura da URL roda no mount e define btuMin/btuMax;
    // o chip deve refletir o recorte.
    await new Promise((resolve) => setTimeout(resolve, 50));
    const chipFaixa = screen.getByRole("button", {
      name: "12.001–18.000 BTU/h",
    });
    expect(chipFaixa.getAttribute("aria-pressed")).toBe("true");
    // As outras faixas renderizadas na base não estão pressionadas.
    for (const faixa of [
      "Até 9.000 BTU/h",
      "9.001–12.000 BTU/h",
      "24.001–30.000 BTU/h",
    ]) {
      expect(pressionado(faixa)).toBe("false");
    }
    // Faixas sem aparelho na base não são renderizadas.
    expect(
      screen.queryByRole("button", { name: "18.001–24.000 BTU/h" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Acima de 30.000 BTU/h" }),
    ).toBeNull();
    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("btuMin")).toBe("12001");
    expect(busca.get("btuMax")).toBe("18000");
  });

  it("um link antigo com o valor oficial não acende nem some do select", async () => {
    window.history.replaceState(null, "", "/?marca=SPRINGER%20MIDEA");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(1));

    expect(pressionado("Midea")).toBe("false");
    expect(
      (screen.getByLabelText("Outras marcas") as HTMLInputElement).value,
    ).toBe("SPRINGER MIDEA");
  });

  it("acende o chip e filtra com a marca em minúsculas na URL", async () => {
    window.history.replaceState(null, "", "/?marca=midea");
    render(<Consulta opcoes={opcoesDe(itens, curadoria)} />);
    await screen.findByText(/aparelho\(s\) com Dados declarados/);

    expect(pressionado("Midea")).toBe("true");
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(2));
    expect(
      (
        screen.getByRole("searchbox", {
          name: "Outras marcas",
        }) as HTMLInputElement
      ).value,
    ).toBe("");
  });

  it("o select de capacidade não tem a opção 'Todas'", async () => {
    await montar(curadoria);
    const select = screen.getByLabelText(
      "Capacidade exata",
    ) as HTMLSelectElement;
    expect(within(select).queryByRole("option", { name: "Todas" })).toBeNull();
    // 'Outras marcas' é busca, não select (ticket 61): não há opção alguma.
    expect(
      screen.queryByRole("combobox", { name: "Outras marcas" }),
    ).toBeNull();
  });
});

describe("layout central (tickets 50 e 67)", () => {
  it("não tem barra lateral e acompanha a largura da página ampla", async () => {
    await montar(curadoria, "/", { abrir: false });
    expect(document.querySelector(".filtros-sidebar")).toBeNull();
    expect(document.querySelector(".consulta-layout")).toBeNull();

    const css = cssDaConsulta();
    // A coluna central acompanha o shell (ticket 67): sem o teto antigo de
    // 72 rem, a tabela alinha às bordas do cabeçalho e do rodapé.
    expect(css).not.toMatch(/\.pagina-aparelhos\s*\{[^}]*max-width/);
    expect(css).not.toMatch(/\.filtros-sidebar/);
  });

  it("ordena a leitura: busca, Pesquisa avançada, ordenação, vitrine e tabela", async () => {
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

    // Ticket 73: contagem e ordenação entram na barra, antes da vitrine.
    expect(antes(busca, avancon)).toBe(true);
    expect(antes(avancon, ordenacao)).toBe(true);
    expect(antes(ordenacao, vitrine)).toBe(true);
    expect(antes(vitrine, tabela)).toBe(true);
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

/**
 * Ticket 61: o painel deixa a grade de três colunas iguais e passa a duas
 * faixas nomeadas, com os campos em largura total e o rodapé próprio. O
 * comportamento (aplicar na hora, escrever na URL, abrir sozinho) é o mesmo.
 */
describe("Pesquisa avançada em duas faixas (ticket 61)", () => {
  function painel(): HTMLElement {
    return document.getElementById("pesquisa-avancada") as HTMLElement;
  }

  function faixas(): HTMLElement[] {
    return [...painel().querySelectorAll<HTMLElement>(".faixa-filtros")];
  }

  function rodape(): HTMLElement {
    return painel().querySelector(".rodape-filtros") as HTMLElement;
  }

  function nomesDosCampos(faixa: HTMLElement): string[] {
    return [
      ...faixa.querySelectorAll<HTMLElement>(
        ".campo-chips > legend, .campo-tensao > span",
      ),
    ].map((rotulo) => rotulo.textContent ?? "");
  }

  it("tem duas faixas nomeadas, na ordem Aparelho e Desempenho", async () => {
    await montar(curadoria, "/", { abrir: false });
    fireEvent.click(screen.getByRole("button", { name: "Pesquisa avançada" }));

    expect(
      faixas().map((faixa) => faixa.querySelector("legend")?.textContent),
    ).toEqual(["Aparelho", "Desempenho"]);
    expect(nomesDosCampos(faixas()[0] as HTMLElement)).toEqual([
      "Marca",
      "Tipo",
      "Função",
    ]);
    expect(nomesDosCampos(faixas()[1] as HTMLElement)).toEqual([
      "Capacidade",
      "Classe",
      "Tensão (V)",
    ]);
  });

  it("dá largura total aos campos e deixa os chips quebrarem linha", () => {
    const css = cssDaConsulta();
    expect(css).toMatch(
      /\.consulta \.filtros-avancados\s*\{[^}]*flex-direction:\s*column/,
    );
    expect(css).toMatch(/\.consulta \.faixa-filtros\s*\{[^}]*width:\s*100%/);
    expect(css).toMatch(/\.consulta \.campo-chips\s*\{[^}]*width:\s*100%/);
    expect(css).toMatch(/\.consulta \.chips\s*\{[^}]*flex-wrap:\s*wrap/);
    // As faixas empilham em qualquer largura, inclusive no celular: não voltam
    // a uma grade de colunas — cada campo ocupa a largura do painel.
    expect(css).not.toMatch(
      /\.consulta \.filtros-avancados\s*\{[^}]*grid-template-columns/,
    );
  });

  it("busca 'Outras marcas' num campo de busca, sem select longo, e escreve na URL", async () => {
    await montar(curadoria, TODOS, { abrir: false });
    fireEvent.click(screen.getByRole("button", { name: "Pesquisa avançada" }));

    const buscaMarca = screen.getByRole("searchbox", { name: "Outras marcas" });
    expect(buscaMarca.tagName).toBe("INPUT");
    expect(
      screen.queryByRole("combobox", { name: "Outras marcas" }),
    ).toBeNull();

    fireEvent.change(buscaMarca, { target: { value: "GREE" } });
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("marca")).toBe(
        "GREE",
      ),
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect((buscaMarca as HTMLInputElement).value).toBe("GREE");
  });

  it("deixa o campo de busca vazio quando a marca ativa vem dos chips", async () => {
    await montar(curadoria, "/?marca=MIDEA", { abrir: false });

    expect(
      (
        screen.getByRole("searchbox", {
          name: "Outras marcas",
        }) as HTMLInputElement
      ).value,
    ).toBe("");
    expect(
      screen
        .getByRole("button", { name: "Midea" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("mantém o valor de um link antigo no campo de busca", async () => {
    await montar(curadoria, "/?marca=SPRINGER%20MIDEA", { abrir: false });

    expect(
      (
        screen.getByRole("searchbox", {
          name: "Outras marcas",
        }) as HTMLInputElement
      ).value,
    ).toBe("SPRINGER MIDEA");
  });

  it("mostra a Classe como seis letras grandes com a cor da curadoria", async () => {
    await montar(curadoria, TODOS, { abrir: false });
    fireEvent.click(screen.getByRole("button", { name: "Pesquisa avançada" }));

    const grupo = screen.getByRole("group", { name: "Classe" });
    const letras = within(grupo).getAllByRole("button");

    expect(letras.map((letra) => letra.textContent)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
    ]);
    for (const [indice, letra] of letras.entries()) {
      expect(letra.getAttribute("aria-label")).toBe(
        `Classe ${letras[indice]?.textContent}`,
      );
      expect(letra.style.getPropertyValue("--cor-classe")).toBe(
        curadoria.classes[indice]?.cor ?? "",
      );
    }
    expect(cssDaConsulta()).toMatch(
      /\.consulta \.campo-classe \.chips button\s*\{[^}]*font-size:\s*1\.1rem/,
    );
  });

  it("mostra a contagem do recorte no rodapé e reage sem fechar o painel", async () => {
    await montar(curadoria, TODOS, { abrir: false });
    fireEvent.click(screen.getByRole("button", { name: "Pesquisa avançada" }));

    expect(
      within(rodape()).getByText(/resultado\(s\) no recorte/).textContent,
    ).toBe("8 resultado(s) no recorte");
    fireEvent.click(screen.getByRole("button", { name: "Classe B" }));
    await waitFor(() =>
      expect(
        within(rodape()).getByText(/resultado\(s\) no recorte/).textContent,
      ).toBe("1 resultado(s) no recorte"),
    );
    expect(painel().hidden).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Classe B" }));
    await waitFor(() =>
      expect(
        within(rodape()).getByText(/resultado\(s\) no recorte/).textContent,
      ).toBe("8 resultado(s) no recorte"),
    );
    expect(painel().hidden).toBe(false);
  });

  it("coloca 'Limpar filtros' no rodapé, só fora do padrão, e preserva a ordenação", async () => {
    await montar(curadoria, "/?marca=LG&ordem=consumo", { abrir: false });
    expect(painel().hidden).toBe(false);

    fireEvent.click(
      within(rodape()).getByRole("button", { name: "Limpar filtros" }),
    );
    await waitFor(() => {
      const busca = new URLSearchParams(window.location.search);
      expect(busca.get("marca")).toBeNull();
      expect(busca.get("ordem")).toBe("consumo");
    });
    expect(
      within(rodape()).queryByRole("button", { name: "Limpar filtros" }),
    ).toBeNull();
  });

  it("abre sozinha com filtro avançado na URL, com as duas faixas", async () => {
    await montar(curadoria, "/?classe=A", { abrir: false });

    expect(painel().hidden).toBe(false);
    expect(faixas()).toHaveLength(2);
  });

  it("mantém os chips do recorte efetivo fora do painel", async () => {
    await montar(curadoria, "/", { abrir: false });
    const resumo = screen.getByRole("group", { name: "Filtros ativos" });

    expect(resumo.textContent).toContain("Tensão: 220 V");
    expect(painel().contains(resumo)).toBe(false);
    expect(
      within(painel()).queryByRole("group", { name: "Filtros ativos" }),
    ).toBeNull();
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

  it("resume a faixa de capacidade e o × limpa as duas chaves", async () => {
    await montar(curadoria, "/?btuMin=12001&btuMax=18000", { abrir: false });

    expect(chips().map((chip) => chip.textContent)).toEqual([
      "Capacidade: 12.001–18.000 BTU/h×",
    ]);
    expect(screen.getAllByRole("link")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remover filtro Capacidade: 12.001–18.000 BTU/h",
      }),
    );
    await waitFor(() => expect(screen.getAllByRole("link")).toHaveLength(8));
    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("btuMin")).toBeNull();
    expect(busca.get("btuMax")).toBeNull();
    expect(chips()).toHaveLength(0);
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

  it("mantém as seis letras de Classe juntas, quebrando linha sem espremer", async () => {
    await montar(curadoria);

    const grupo = screen.getByRole("group", { name: "Classe" });
    expect(within(grupo).getAllByRole("button")).toHaveLength(6);
    expect(cssDaConsulta()).toMatch(
      /\.consulta \.campo-classe \.chips\s*\{[^}]*\}/,
    );
    expect(cssDaConsulta()).not.toMatch(
      /\.consulta \.campo-classe \.chips\s*\{[^}]*grid-template-columns/,
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

  it("mostra o selo 'Análise' na última coluna, ao lado do Tipo", async () => {
    await montarComAnalisados();
    const tabela = screen.getByRole("table");
    const links = within(tabela).getAllByRole("link", { name: "Análise" });
    expect(links).toHaveLength(2);
    // O texto "Análise" está dentro do <a> da etiqueta de contorno.
    expect(links[0]?.getAttribute("href")).toBe("/analises/lg-dual-inverter/");
    expect(links[0]?.classList.contains("analisado-etiqueta")).toBe(true);
    // O selo tem coluna própria, depois de Tipo (ticket 72).
    const linha = links[0]?.closest("tr") as HTMLElement;
    const celulas = [...linha.querySelectorAll("td")];
    expect(celulas[0]?.getAttribute("data-campo")).toBe("selecao");
    const ultima = celulas.at(-1);
    expect(ultima?.getAttribute("data-campo")).toBe("analise");
    expect(ultima?.querySelector(".analisado-selo")).not.toBeNull();
    // E o cabeçalho nomeia a coluna, porque há Análise publicada.
    expect(screen.getByRole("columnheader", { name: "Análise" })).toBeDefined();
  });

  it("a célula da Marca não tem selo para aparelhos sem Análise", async () => {
    await montarComAnalisados();
    const linhas = screen.getAllByRole("row").slice(1);
    const primeira = linhas[0]; // Daikin (Classe F): não tem Análise
    const celulas = [...(primeira?.querySelectorAll("td") ?? [])];
    expect(celulas[1]?.getAttribute("data-campo")).toBe("marca");
    expect(celulas[1]?.querySelector(".analisado-selo")).toBeNull();
    expect(celulas[1]?.textContent?.trim()).toBe("DAIKIN");
    const colunaAnalise = celulas.find(
      (celula) => celula.getAttribute("data-campo") === "analise",
    );
    expect(colunaAnalise?.textContent).toBe("");
    expect(colunaAnalise?.querySelector(".analisado-selo")).toBeNull();
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

  it("destaca as linhas dos analisados onde quer que a ordenação os ponha", async () => {
    await montarComAnalisados();
    const linhas = screen.getAllByRole("row").slice(1);

    // A ordem padrão é A–Z de Marca: o Daikin abre a tabela, não um analisado
    // (ticket 52: a tabela deixou de puxar os analisados para o topo).
    expect(linhas[0]?.textContent).toContain("Classe F");
    expect(linhas[0]?.classList.contains("linha-analisado")).toBe(false);

    const dual = linhas.find((linha) =>
      linha.textContent?.includes("Dual Inverter"),
    );
    const xtreme = linhas.find((linha) =>
      linha.textContent?.includes("Xtreme Save"),
    );
    expect(dual?.classList.contains("linha-analisado")).toBe(true);
    expect(xtreme?.classList.contains("linha-analisado")).toBe(true);
  });

  it("não mostra mais os cabeçalhos de grupo nem o aviso de afiliado", async () => {
    await montarComAnalisados();
    expect(screen.queryByText("Analisados por nós")).toBeNull();
    expect(screen.queryByText("Demais aparelhos")).toBeNull();
    expect(screen.queryByText(/links de afiliado/)).toBeNull();
  });

  it("respeita a ordenação escolhida em vez de promover os analisados", async () => {
    await montarComAnalisados();
    // Consumo crescente: a ordem vem do motor de consulta, e o Dual Inverter
    // (300 kWh) fica no meio da tabela, atrás de cinco aparelhos.
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
    const linhas = screen.getAllByRole("row").slice(1);
    expect(linhas[0]?.classList.contains("linha-analisado")).toBe(false);
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

    // Cada cartão traz capacidade e Tipo: dá para avaliar sem abrir a ficha.
    expect(links[0]?.textContent).toContain("9.000 BTU/h · Split Hi-Wall");
    expect(links[1]?.textContent).toContain("12.000 BTU/h · Split Hi-Wall");
    // Nenhum cartão está fora do recorte, então não há legenda de similares.
    expect(bloco.querySelector(".com-analise-legenda")).toBeNull();
  });

  it("com filtro ativo, completa a vitrine com similares fora do recorte", async () => {
    await montarComAnalisados("/?marca=LG");

    const bloco = document.querySelector(".com-analise") as HTMLElement;
    expect(bloco).not.toBeNull();
    const links = within(bloco).getAllByRole("link");
    // O LG passa no recorte e abre a vitrine; o Midea, de outra marca, entra
    // como similar (mesma capacidade do recorte: 12.000 BTU/h).
    expect(links).toHaveLength(2);
    expect(links[0]?.textContent).toContain("Análise do LG Dual Inverter");
    expect(links[1]?.textContent).toContain("Análise do Midea Xtreme Save");

    // Como há ao menos um compatível, não é preciso explicar a exceção.
    expect(bloco.querySelector(".com-analise-legenda")).toBeNull();

    // ...e o analisado compatível continua, destacado, na tabela.
    const linha = screen
      .getAllByRole("row")
      .find((row) => row.textContent?.includes("Dual Inverter"));
    expect(linha?.classList.contains("linha-analisado")).toBe(true);
  });

  it("com filtro de marca sem Análise, mostra similares e cita a marca na legenda", async () => {
    await montarComAnalisados("/?marca=GREE");

    // Os analisados são LG e MIDEA: nenhum passa no filtro GREE, mas a vitrine
    // continua visível como alternativa.
    const bloco = document.querySelector(".com-analise") as HTMLElement;
    expect(bloco).not.toBeNull();
    expect(within(bloco).getByText("Aparelhos com análise")).toBeDefined();

    const links = within(bloco).getAllByRole("link");
    expect(links).toHaveLength(2);
    // A capacidade do recorte (12.000 BTU/h do GREE) puxa o Midea para cima.
    expect(links[0]?.textContent).toContain("Análise do Midea Xtreme Save");
    expect(links[1]?.textContent).toContain("Análise do LG Dual Inverter");

    // A legenda explica que os cartões estão fora do recorte e nomeia o GREE,
    // para a exceção não parecer um erro de filtro.
    const legenda = bloco.querySelector(".com-analise-legenda");
    expect(legenda?.textContent).toContain("fora do recorte");
    expect(legenda?.textContent).toContain("GREE");

    // O bloco não entra na contagem: só o GREE passou nos filtros.
    expect(
      screen.getByText("1 aparelho(s) com Dados declarados."),
    ).toBeDefined();
    const linhas = screen.getAllByRole("row").slice(1);
    expect(linhas).toHaveLength(1);
    expect(linhas[0]?.classList.contains("linha-analisado")).toBe(false);
  });

  it("num recorte vazio sem marca, explica os cartões sem citar marca", async () => {
    // A busca sem resultado esvazia o recorte sem apontar uma marca: a legenda
    // genérica ainda explica por que os cartões estão ali.
    await montarComAnalisados("/?q=zzzzzz");

    const bloco = document.querySelector(".com-analise") as HTMLElement;
    expect(bloco).not.toBeNull();
    expect(within(bloco).getAllByRole("link")).toHaveLength(2);
    const legenda = bloco.querySelector(".com-analise-legenda");
    expect(legenda?.textContent).toContain("fora do recorte");
    expect(legenda?.textContent).not.toContain("marca");
    expect(
      screen.getByText("0 aparelho(s) com Dados declarados."),
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

    fireEvent.click(screen.getByRole("button", { name: /Mostrar mais/ }));
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

/**
 * Ticket 51: a tabela ganha a coluna de seleção à esquerda e a barra de ação
 * acima da vitrine. A seleção é o mesmo contrato `?ids=` de `/comparar/`
 * (ADR-0021), separado dos filtros, e sobrevive a qualquer mudança de recorte.
 */
describe("seleção para comparar (ticket 51)", () => {
  function caixas(): HTMLInputElement[] {
    return screen.getAllByRole("checkbox") as HTMLInputElement[];
  }

  function caixa(modelo: string): HTMLInputElement {
    return screen.getByRole("checkbox", {
      name: new RegExp(modelo),
    }) as HTMLInputElement;
  }

  function idsDaUrl(): string | null {
    return new URLSearchParams(window.location.search).get("ids");
  }

  it("mostra a coluna Comparar como a primeira, com cabeçalho vazio", async () => {
    await montar();

    const cabecalhos = screen.getAllByRole("columnheader");
    expect(cabecalhos[0]?.getAttribute("data-campo")).toBe("selecao");
    // Cabeçalho intencionalmente em branco: cada checkbox já anuncia
    // "Comparar <marca> <modelo>" no aria-label (ticket 54).
    expect(cabecalhos[0]?.textContent).toBe("");

    const [primeira] = screen.getAllByRole("row").slice(1);
    const primeiraCelula = primeira?.querySelector("td");
    expect(primeiraCelula?.getAttribute("data-campo")).toBe("selecao");
    // O rótulo é o que o cartão do celular mostra na primeira linha.
    expect(primeiraCelula?.getAttribute("data-label")).toBe("Comparar");

    expect(caixas()).toHaveLength(itens.length);
    expect(screen.queryByRole("checkbox", { name: /todos/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /selecionar todos/i }),
    ).toBeNull();
  });

  it("marca e desmarca, atualizando `ids` na ordem de seleção", async () => {
    await montar();

    fireEvent.click(caixa("Classe F"));
    expect(idsDaUrl()).toBe("daikin-f");
    expect(caixa("Classe F").checked).toBe(true);

    fireEvent.click(caixa("Classe E"));
    expect(idsDaUrl()).toBe("daikin-f,hitachi-e");

    fireEvent.click(caixa("Classe F"));
    expect(idsDaUrl()).toBe("hitachi-e");
    expect(caixa("Classe F").checked).toBe(false);
  });

  it("mostra a contagem e só habilita Comparar com 2 ou 3", async () => {
    await montar();

    expect(screen.getByText("0 de 3 modelos selecionados")).toBeDefined();
    expect(
      (screen.getByRole("button", { name: "Comparar" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    fireEvent.click(caixa("Classe F"));
    expect(screen.getByText("1 de 3 modelos selecionados")).toBeDefined();
    expect(
      (screen.getByRole("button", { name: "Comparar" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    fireEvent.click(caixa("Classe E"));
    expect(screen.getByText("2 de 3 modelos selecionados")).toBeDefined();
    const comparar = screen.getByRole("link", { name: "Comparar" });
    expect(comparar.getAttribute("href")).toBe(
      "/comparar/?ids=daikin-f%2Chitachi-e",
    );
  });

  it("com 3 selecionados desabilita os demais e explica o limite", async () => {
    await montar(undefined, "/?ids=daikin-f,hitachi-e,elgin-d");

    await waitFor(() =>
      expect(screen.getByText("3 de 3 modelos selecionados")).toBeDefined(),
    );
    expect(caixa("Classe F").checked).toBe(true);
    expect(caixa("Classe F").disabled).toBe(false);
    expect(caixa("Classe E").disabled).toBe(false);
    expect(caixa("Classe D").disabled).toBe(false);

    // Os não selecionados ficam desabilitados, com a explicação à vista.
    expect(caixa("G-Top Inverter").disabled).toBe(true);
    expect(caixa("Dual Inverter").disabled).toBe(true);
    expect(
      screen.getByText("Limite de 3 modelos por comparação."),
    ).toBeDefined();
  });

  it("preserva `ids` ao mudar filtro, busca e ordenação", async () => {
    await montar(undefined, "/?ids=daikin-f,hitachi-e");

    await waitFor(() =>
      expect(screen.getByText("2 de 3 modelos selecionados")).toBeDefined(),
    );

    fireEvent.change(screen.getByLabelText("Outras marcas"), {
      target: { value: "LG" },
    });
    await waitFor(() => expect(idsDaUrl()).toBe("daikin-f,hitachi-e"));

    fireEvent.change(screen.getByLabelText("Busca"), {
      target: { value: "dual" },
    });
    await waitFor(() => expect(idsDaUrl()).toBe("daikin-f,hitachi-e"));

    fireEvent.click(screen.getByRole("button", { name: /Consumo/ }));
    await waitFor(() => expect(idsDaUrl()).toBe("daikin-f,hitachi-e"));

    // O "×" do chip desliga um filtro por outro caminho: a seleção continua.
    fireEvent.click(
      screen.getByRole("button", { name: /Remover filtro Marca/ }),
    );
    await waitFor(() => expect(idsDaUrl()).toBe("daikin-f,hitachi-e"));
    expect(new URLSearchParams(window.location.search).get("marca")).toBeNull();

    // Inverter a direção da ordenação também é uma mudança de estado.
    fireEvent.click(screen.getByRole("button", { name: /Ordenar de forma/ }));
    await waitFor(() => expect(idsDaUrl()).toBe("daikin-f,hitachi-e"));

    const busca = new URLSearchParams(window.location.search);
    expect(busca.get("marca")).toBeNull();
    expect(busca.get("q")).toBe("dual");
    expect(busca.get("ordem")).toBe("consumo");
    expect(busca.get("dir")).toBe("desc");
  });

  it("reconstrói a seleção ao voltar ou avançar no navegador", async () => {
    await montar(undefined, "/?ids=daikin-f");

    await waitFor(() => expect(caixa("Classe F").checked).toBe(true));

    window.history.pushState(null, "", "/?ids=hitachi-e");
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => expect(caixa("Classe E").checked).toBe(true));
    expect(caixa("Classe F").checked).toBe(false);
    expect(idsDaUrl()).toBe("hitachi-e");
  });

  it("preserva `ids` mesmo quando a base ainda não terminou de carregar", async () => {
    window.history.replaceState(null, "", "/?ids=daikin-f,hitachi-e");
    render(<Consulta opcoes={opcoesDe(itens)} />);

    // A busca pode ser usada antes do `consulta.json` chegar; a seleção da URL
    // não pode ser apagada só porque ainda não foi validada contra a base.
    fireEvent.change(screen.getByLabelText("Busca"), {
      target: { value: "dual" },
    });
    expect(idsDaUrl()).toBe("daikin-f,hitachi-e");

    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    await waitFor(() =>
      expect(screen.getByText("2 de 3 modelos selecionados")).toBeDefined(),
    );
    expect(idsDaUrl()).toBe("daikin-f,hitachi-e");
    expect(new URLSearchParams(window.location.search).get("q")).toBe("dual");
  });

  it("'Limpar filtros' não apaga a seleção; 'Limpar seleção' remove só `ids`", async () => {
    await montar(undefined, "/?ids=daikin-f,hitachi-e&marca=LG");

    await waitFor(() =>
      expect(screen.getByText("2 de 3 modelos selecionados")).toBeDefined(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    await waitFor(() =>
      expect(
        new URLSearchParams(window.location.search).get("marca"),
      ).toBeNull(),
    );
    expect(idsDaUrl()).toBe("daikin-f,hitachi-e");

    fireEvent.click(screen.getByRole("button", { name: "Limpar seleção" }));
    await waitFor(() => expect(idsDaUrl()).toBeNull());
    expect(window.location.search).toBe("");
    // O recorte voltou ao padrão, sem a seleção levar os filtros junto.
    expect(
      (screen.getByLabelText("Tensão (V)") as HTMLSelectElement).value,
    ).toBe("220");
  });

  it("reconstrói a seleção da URL e avisa quantos ids foram descartados", async () => {
    await montar(undefined, "/?ids=daikin-f,ap-desconhecido,daikin-f");

    await waitFor(() =>
      expect(screen.getByText("1 de 3 modelos selecionados")).toBeDefined(),
    );
    expect(caixa("Classe F").checked).toBe(true);
    expect(
      screen.getByText(
        "2 ids repetidos ou desconhecidos foram descartados do link.",
      ),
    ).toBeDefined();
  });
});

/**
 * Ticket 72: a tabela como instrumento — hierarquia entre identificação, medida
 * e qualificação; densidade; e, abaixo de 900 px, rolagem horizontal com
 * seleção e Modelo fixos, sem virar cartões.
 */
describe("tabela de instrumento (ticket 72)", () => {
  it("envolve a tabela num contêiner de rolagem focável, com nome e aviso", async () => {
    await montar();

    const regiao = screen.getByRole("region", {
      name: /Tabela de Aparelhos/,
    });
    expect(regiao.classList.contains("tabela-rolagem")).toBe(true);
    expect(regiao.getAttribute("tabindex")).toBe("0");
    expect(regiao.querySelector("table")).not.toBeNull();
    expect(regiao.textContent).toContain("Deslize para ver as colunas");
  });

  it("fixa seleção e Modelo e contém a rolagem, sem converter linhas em cartões", () => {
    const css = cssDaConsulta();

    expect(css).toMatch(
      /\.consulta \.tabela-rolagem\s*\{[^}]*overflow-x:\s*auto/,
    );
    expect(css).toMatch(/overscroll-behavior-x:\s*contain/);
    expect(css).toMatch(
      /\[data-campo="selecao"\],[\s\S]*?\[data-campo="modelo"\]\s*\{[^}]*position:\s*sticky/,
    );
    expect(css).toMatch(
      /\[data-campo="modelo"\]\s*\{[^}]*left:\s*var\(--col-selecao\)/,
    );
    // O contêiner é o único que rola: a tabela mantém a largura mínima.
    expect(css).toMatch(
      /@media \(width\s*<\s*56\.25rem\)\s*\{[^}]*\.consulta \.tabela-aparelhos\s*\{[^}]*min-width:\s*60rem/,
    );
    // Nada de cartão: nenhuma célula vira bloco/grade no celular.
    expect(css).not.toMatch(
      /\.consulta \.tabela-aparelhos td\{[^}]*display:\s*grid/,
    );
    expect(css).not.toMatch(
      /\.consulta \.tabela-aparelhos thead\{[^}]*display:\s*none/,
    );
  });

  it("mostra a unidade uma vez por célula, em mono, com números à direita", async () => {
    await montar();

    const linha = screen.getAllByRole("row")[1] as HTMLElement;
    const capacidade = linha.querySelector('td[data-campo="btu"]');
    const consumo = linha.querySelector('td[data-campo="consumo"]');

    expect(capacidade?.textContent).toBe("30.000 BTU/h");
    expect(consumo?.textContent).toBe("350 kWh/ano");
    expect(capacidade?.querySelector(".celula-unidade")?.textContent).toBe(
      "BTU/h",
    );

    const css = cssDaConsulta();
    expect(css).toMatch(
      /\.consulta \.tabela-aparelhos td\[data-campo="btu"\][\s\S]*?font-family:\s*var\(--fonte-mono\)/,
    );
    expect(css).toMatch(
      /td\[data-campo="idrs"\][\s\S]{0,300}?text-align:\s*right/,
    );
  });

  it("mostra a Classe como etiqueta com letra e cor, não só cor", async () => {
    await montar();

    const linha = screen.getAllByRole("row")[1] as HTMLElement;
    const etiqueta = linha.querySelector(
      'td[data-campo="classe"] .etiqueta-classe',
    );
    expect(etiqueta?.getAttribute("data-classe")).toBe("F");
    expect(etiqueta?.textContent).toContain("F");
    expect(etiqueta?.textContent).toContain("Classe energética F");
  });

  it("troca o texto solto do carregamento por um esqueleto de linhas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );
    window.history.replaceState(null, "", TODOS);
    render(<Consulta opcoes={opcoesDe(itens)} />);

    expect(await screen.findByText("Carregando a base…")).toBeDefined();
    expect(document.querySelectorAll(".esqueleto-linha").length).toBe(8);
    expect(
      document
        .querySelector(".consulta-esqueleto")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("oferece 'Tentar de novo' quando a rede falha e recarrega a base", async () => {
    let falhar = true;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        if (falhar) {
          throw new Error("rede fora");
        }
        return { ok: true, json: async () => itens };
      }),
    );
    window.history.replaceState(null, "", TODOS);
    render(<Consulta opcoes={opcoesDe(itens)} />);

    const alerta = await screen.findByRole("alert");
    expect(alerta.textContent).toContain("Não foi possível carregar a base");

    falhar = false;
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    await screen.findByText(/aparelho\(s\) com Dados declarados/);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
  });

  it("mostra um estado vazio com ação quando o recorte não tem Aparelho", async () => {
    await montar(undefined, TODOS);

    fireEvent.change(screen.getByRole("searchbox", { name: "Busca" }), {
      target: { value: "modelo que não existe" },
    });

    await waitFor(() =>
      expect(document.querySelector(".consulta-vazio")).not.toBeNull(),
    );
    expect(screen.getByText("Nenhum Aparelho neste recorte")).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();

    const acao = document.querySelector(
      ".consulta-vazio-acao button",
    ) as HTMLElement;
    fireEvent.click(acao);
    await waitFor(() => expect(screen.queryByRole("table")).not.toBeNull());
  });
});

/**
 * Ticket 73: a barra de ferramentas junta busca, recorte, contagem e ordenação
 * num instrumento sticky; no celular a Pesquisa avançada vira sobreposição modal
 * com foco preso, `Esc`, retorno de foco e "Ver N resultados".
 */
describe("barra de ferramentas e painel mobile (ticket 73)", () => {
  function barra(): HTMLElement {
    return document.querySelector(".barra-ferramentas") as HTMLElement;
  }

  function painel(): HTMLElement {
    return document.getElementById("pesquisa-avancada") as HTMLElement;
  }

  function focaveisDoPainel(): HTMLElement[] {
    return [
      ...painel().querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
  }

  it("junta busca, botão, chips, contagem e ordenação na barra sticky", async () => {
    await montar(curadoria, "/", { abrir: false });

    const elemento = barra();
    expect(elemento.tagName).toBe("FORM");
    expect(
      elemento.contains(screen.getByRole("searchbox", { name: "Busca" })),
    ).toBe(true);
    expect(
      elemento.contains(
        screen.getByRole("button", { name: "Pesquisa avançada" }),
      ),
    ).toBe(true);
    expect(
      elemento.contains(screen.getByRole("group", { name: "Filtros ativos" })),
    ).toBe(true);
    expect(
      elemento.contains(screen.getByRole("combobox", { name: "Ordenar por" })),
    ).toBe(true);
    expect(
      elemento.contains(
        screen.getByText("8 aparelho(s) com Dados declarados."),
      ),
    ).toBe(true);
    // O recorte efetivo inclui o padrão implícito de 220 V.
    expect(elemento.textContent).toContain("Tensão: 220 V");

    const css = cssDaConsulta();
    const regra =
      css.match(/\n\.consulta \.barra-ferramentas \{([^}]*)\}/)?.[1] ?? "";
    expect(regra).toMatch(/position:\s*sticky/);
    expect(regra).toMatch(/top:\s*0/);
    expect(regra).toMatch(/background:\s*var\(--giz\)/);
    expect(regra).toMatch(/border-bottom:\s*1px solid var\(--linha\)/);
    expect(regra).toMatch(/z-index:\s*var\(--z-barra\)/);
  });

  it("deixa o cabeçalho da tabela abaixo da barra e usa o chip do sistema", () => {
    const css = cssDaConsulta();

    // A altura medida da barra empurra o <thead> sticky para baixo dela.
    expect(css).toMatch(
      /thead th\s*\{[^}]*top:\s*var\(--altura-barra-catalogo/,
    );
    // Chips de 32 px e raio de 2 px — nenhum pill, nenhum hex de Classe.
    const chip = css.match(/\n\.consulta \.chip-filtro \{([^}]*)\}/)?.[1] ?? "";
    expect(chip).toMatch(/min-height:\s*32px/);
    expect(chip).toMatch(/border-radius:\s*var\(--raio-xs\)/);
    expect(css).not.toMatch(/\.consulta \.chip-filtro \{[^}]*999px/);
    expect(css).not.toMatch(/\.consulta \.chips button \{[^}]*999px/);
    expect(css).not.toMatch(/classes-chips[^}]*#16a34a/);
    expect(css).not.toMatch(/classes-chips[^}]*#2563eb/);
  });

  it("a contagem da barra reage a cada mudança de recorte", async () => {
    await montar(curadoria, "/", { abrir: true });
    expect(barra().textContent).toContain(
      "8 aparelho(s) com Dados declarados.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Classe B" }));
    await waitFor(() =>
      expect(barra().textContent).toContain(
        "1 aparelho(s) com Dados declarados.",
      ),
    );
  });

  it("no desktop o painel continua embutido, sem role de diálogo", async () => {
    await montar(curadoria, "/", { abrir: false });
    fireEvent.click(screen.getByRole("button", { name: "Pesquisa avançada" }));

    expect(painel().hidden).toBe(false);
    expect(painel().hasAttribute("role")).toBe(false);
    expect(screen.queryByRole("dialog")).toBeNull();

    const css = cssDaConsulta();
    const celular = css.slice(css.indexOf("@media (max-width: 55.999rem)"));
    // Abaixo de 900 px a barra empilha e o painel vira sobreposição com rolagem
    // própria e a saída no rodapé.
    expect(celular).toMatch(
      /\.consulta \.barra-ferramentas \{[^}]*grid-template-areas/,
    );
    expect(celular).toMatch(
      /\.consulta \.filtros-avancados \{[^}]*position:\s*fixed/,
    );
    expect(celular).toMatch(
      /\.consulta \.filtros-avancados \{[^}]*overflow-y:\s*auto/,
    );
    expect(celular).toMatch(
      /\.consulta \.aplicar-filtros \{[^}]*display:\s*inline-flex/,
    );
  });

  it("no celular abre como diálogo modal, com o foco dentro do painel", async () => {
    simularCelular();
    await montar(curadoria, "/", { abrir: false });

    fireEvent.click(screen.getByRole("button", { name: "Pesquisa avançada" }));

    const dialogo = screen.getByRole("dialog", { name: "Pesquisa avançada" });
    expect(dialogo).toBe(painel());
    expect(dialogo.getAttribute("aria-modal")).toBe("true");
    expect(dialogo.hidden).toBe(false);
    expect(dialogo.contains(document.activeElement)).toBe(true);
  });

  it("prende o foco, fecha com Esc e devolve o foco ao botão", async () => {
    simularCelular();
    await montar(curadoria, "/", { abrir: false });
    const botao = screen.getByRole("button", { name: "Pesquisa avançada" });
    fireEvent.click(botao);

    const dialogo = screen.getByRole("dialog", { name: "Pesquisa avançada" });
    const focaveis = focaveisDoPainel();
    const primeiro = focaveis[0] as HTMLElement;
    const ultimo = focaveis.at(-1) as HTMLElement;
    expect(ultimo.classList.contains("aplicar-filtros")).toBe(true);

    // Tab no último volta ao primeiro; Shift+Tab no primeiro vai ao último.
    ultimo.focus();
    fireEvent.keyDown(dialogo, { key: "Tab" });
    expect(document.activeElement).toBe(primeiro);

    primeiro.focus();
    fireEvent.keyDown(dialogo, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(ultimo);

    fireEvent.keyDown(dialogo, { key: "Escape" });
    expect(painel().hidden).toBe(true);
    expect(document.activeElement).toBe(botao);
    expect(botao.getAttribute("aria-expanded")).toBe("false");
  });

  it("mostra 'Ver N resultados' no rodapé e fecha o painel ao aplicá-lo", async () => {
    simularCelular();
    await montar(curadoria, "/", { abrir: false });
    fireEvent.click(screen.getByRole("button", { name: "Pesquisa avançada" }));

    const rodape = document.querySelector(".rodape-filtros") as HTMLElement;
    expect(within(rodape).getByText("8 resultado(s) no recorte")).toBeDefined();

    fireEvent.click(
      within(rodape).getByRole("button", { name: "Ver 8 resultados" }),
    );
    expect(painel().hidden).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Pesquisa avançada" }));
    fireEvent.click(screen.getByRole("button", { name: "Classe B" }));
    await waitFor(() =>
      expect(
        within(rodape).getByText("1 resultado(s) no recorte"),
      ).toBeDefined(),
    );
    expect(
      within(rodape).getByRole("button", { name: "Ver 1 resultado" }),
    ).toBeDefined();
  });
});
