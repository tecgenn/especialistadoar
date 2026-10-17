import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Aparelho, ItemConsulta } from "@especialista-do-ar/pipeline";
import { runBuild } from "@especialista-do-ar/pipeline";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { comLimitePorIp, criarServidor } from "../src/rotas.ts";

const fixtureAparelhos = fileURLToPath(
  new URL(
    "../../pipeline/test/fixtures/amostra-aparelhos.csv",
    import.meta.url,
  ),
);

const GREE = "ap-4e985f48c99e";
const KENNEDY = "ap-3db0d78621d7";
const LG = "ap-97ddaad7049d";

let dataDir: string;
let buildDir: string;
let atender: (request: Request) => Response;

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), "especialista-worker-"));
  buildDir = join(dataDir, "build");
  runBuild({
    dataDir,
    source: fixtureAparelhos,
    origem: "teste",
    obtidoEm: "2026-10-12",
    reportsDir: join(dataDir, "reports"),
  });
  const aparelhos = JSON.parse(
    readFileSync(join(buildDir, "aparelhos.json"), "utf8"),
  ) as Aparelho[];
  const consulta = JSON.parse(
    readFileSync(join(buildDir, "consulta.json"), "utf8"),
  ) as ItemConsulta[];
  atender = criarServidor({ aparelhos, consulta });
});

afterEach(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

const pegar = (caminho: string) =>
  atender(new Request(`https://api.test${caminho}`));

const ids = (aparelhos: Array<{ id: string }>) =>
  aparelhos.map((item) => item.id).sort();

interface CorpoBusca {
  resultados: Array<{ id: string }>;
  total: number;
}

interface CorpoComparar {
  aparelhos: Aparelho[];
}

interface CorpoValor {
  id: string;
  marca: string;
  modelo: string;
  resultados: Array<{
    tensao: { voltagens: number[] } | null;
    rotulo: string;
    unidade: string;
    valor: number;
    formula: string;
    entradas: { tarifa: number; consumoAnualKwh: number };
  }>;
  aviso: string;
}

interface CorpoErro {
  erro: string;
}

describe("Worker /api/v1 — busca textual e filtros", () => {
  it("encontra Aparelhos por busca textual", async () => {
    const resposta = pegar("/api/v1/search?q=kenne");
    expect(resposta.status).toBe(200);
    const corpo = (await resposta.json()) as CorpoBusca;
    expect(ids(corpo.resultados)).toEqual([KENNEDY]);
    expect(corpo.total).toBe(1);
  });

  it("filtra por campo (tensão), sem busca textual", async () => {
    const corpo = (await (
      await pegar("/api/v1/search?tensao=127")
    ).json()) as CorpoBusca;
    expect(ids(corpo.resultados)).toEqual([GREE]);
  });

  it("combina busca textual e filtro de campo (interseção)", async () => {
    const corpo = (await (
      await pegar("/api/v1/search?q=split&tensao=220")
    ).json()) as CorpoBusca;
    expect(ids(corpo.resultados)).toEqual([GREE, LG].sort());
  });

  it("sem filtros devolve todo o dataset de consulta", async () => {
    const corpo = (await (await pegar("/api/v1/search")).json()) as CorpoBusca;
    expect(corpo.total).toBe(3);
  });

  it("recusa BTU não numérico", async () => {
    const resposta = pegar("/api/v1/search?btu=abc");
    expect(resposta.status).toBe(400);
    const corpo = (await resposta.json()) as CorpoErro;
    expect(corpo.erro).toMatch(/btu/i);
  });
});

describe("Worker /api/v1 — comparação entre Aparelhos", () => {
  it("devolve os Aparelhos lado a lado, na ordem pedida", async () => {
    const resposta = pegar(`/api/v1/comparar?ids=${GREE},${KENNEDY}`);
    expect(resposta.status).toBe(200);
    const corpo = (await resposta.json()) as CorpoComparar;
    expect(corpo.aparelhos.map((aparelho) => aparelho.id)).toEqual([
      GREE,
      KENNEDY,
    ]);
    expect(corpo.aparelhos[0]?.variantes).toHaveLength(2);
    expect(corpo.aparelhos[1]?.variantes).toHaveLength(1);
  });

  it("exige pelo menos dois IDs", async () => {
    const resposta = pegar(`/api/v1/comparar?ids=${GREE}`);
    expect(resposta.status).toBe(400);
  });

  it("devolve 404 quando um ID não existe", async () => {
    const resposta = pegar(`/api/v1/comparar?ids=${GREE},ap-000000000000`);
    expect(resposta.status).toBe(404);
    const corpo = (await resposta.json()) as CorpoErro;
    expect(corpo.erro).toMatch(/ap-000000000000/);
  });
});

describe("Worker /api/v1 — Valor calculado", () => {
  it("calcula o custo anual a partir da tarifa, com fórmula e entradas", async () => {
    const resposta = pegar(`/api/v1/valor-calculado?id=${KENNEDY}&tarifa=0.95`);
    expect(resposta.status).toBe(200);
    const corpo = (await resposta.json()) as CorpoValor;
    expect(corpo.id).toBe(KENNEDY);
    expect(corpo.resultados).toHaveLength(1);
    const [resultado] = corpo.resultados;
    expect(resultado?.valor).toBeCloseTo(818 * 0.95);
    expect(resultado?.formula).toMatch(/consumoAnualKwh/);
    expect(resultado?.entradas).toEqual({ tarifa: 0.95, consumoAnualKwh: 818 });
  });

  it("calcula por Variante (um Aparelho bivolt rende dois resultados)", async () => {
    const corpo = (await (
      await pegar(`/api/v1/valor-calculado?id=${GREE}&tarifa=0.95`)
    ).json()) as CorpoValor;
    expect(corpo.resultados).toHaveLength(2);
    const voltagens = corpo.resultados
      .flatMap((resultado) => resultado.tensao?.voltagens ?? [])
      .sort((a, b) => a - b);
    expect(voltagens).toEqual([127, 220]);
  });

  it("restringe o cálculo à tensão pedida", async () => {
    const corpo = (await (
      await pegar(`/api/v1/valor-calculado?id=${GREE}&tarifa=0.95&tensao=220`)
    ).json()) as CorpoValor;
    expect(corpo.resultados).toHaveLength(1);
    expect(corpo.resultados[0]?.tensao?.voltagens).toEqual([220]);
  });

  it("nunca apresenta o Valor calculado como um Valor oficial", async () => {
    const corpo = (await (
      await pegar(`/api/v1/valor-calculado?id=${KENNEDY}&tarifa=0.95`)
    ).json()) as CorpoValor & Record<string, unknown>;
    expect(corpo.aviso).toBeTruthy();
    expect(corpo).not.toHaveProperty("oficial");
    for (const resultado of corpo.resultados) {
      expect(resultado).not.toHaveProperty("oficial");
      expect(resultado).not.toHaveProperty("valorOficial");
    }
  });

  it("recusa tarifa ausente ou inválida", async () => {
    expect(pegar(`/api/v1/valor-calculado?id=${KENNEDY}`).status).toBe(400);
    expect(
      pegar(`/api/v1/valor-calculado?id=${KENNEDY}&tarifa=abc`).status,
    ).toBe(400);
    expect(
      pegar(`/api/v1/valor-calculado?id=${KENNEDY}&tarifa=-1`).status,
    ).toBe(400);
  });

  it("devolve 404 para um ID que não existe", async () => {
    const resposta = pegar(
      "/api/v1/valor-calculado?id=ap-000000000000&tarifa=0.95",
    );
    expect(resposta.status).toBe(404);
  });

  it("devolve 404 quando nenhuma Variante casa com a tensão pedida", async () => {
    const resposta = pegar(
      `/api/v1/valor-calculado?id=${KENNEDY}&tarifa=0.95&tensao=999`,
    );
    expect(resposta.status).toBe(404);
  });
});

describe("Worker /api/v1 — roteamento", () => {
  it("devolve 404 para uma rota desconhecida", () => {
    expect(pegar("/api/v1/desconhecida").status).toBe(404);
  });

  it("recusa métodos que não sejam GET", () => {
    const resposta = atender(
      new Request("https://api.test/api/v1/search", { method: "POST" }),
    );
    expect(resposta.status).toBe(405);
  });
});

describe("Worker /api/v1 — limite por IP", () => {
  it("deixa passar a requisição quando o limite permite", async () => {
    const atendido = comLimitePorIp(atender, async () => true);
    const resposta = await atendido(
      new Request("https://api.test/api/v1/search", {
        headers: { "CF-Connecting-IP": "203.0.113.7" },
      }),
    );
    expect(resposta.status).toBe(200);
  });

  it("responde 429 (com Retry-After) quando estoura, sem tocar nas rotas", async () => {
    const atendido = comLimitePorIp(atender, async () => false);
    const resposta = await atendido(
      new Request("https://api.test/api/v1/search", {
        headers: { "CF-Connecting-IP": "203.0.113.9" },
      }),
    );
    expect(resposta.status).toBe(429);
    expect(resposta.headers.get("retry-after")).toBe("60");
    const corpo = (await resposta.json()) as CorpoErro;
    expect(corpo.erro).toMatch(/requisições/i);
  });

  it("não limita quando não há IP atribuível (fora da Cloudflare)", async () => {
    let consultou = false;
    const atendido = comLimitePorIp(atender, async () => {
      consultou = true;
      return false;
    });
    const resposta = await atendido(
      new Request("https://api.test/api/v1/search"),
    );
    expect(resposta.status).toBe(200);
    expect(consultou).toBe(false);
  });

  it("usa o IP do cliente (CF-Connecting-IP) como chave", async () => {
    const chaves: string[] = [];
    const atendido = comLimitePorIp(atender, async (chave) => {
      chaves.push(chave);
      return true;
    });
    await atendido(
      new Request("https://api.test/api/v1/search", {
        headers: { "CF-Connecting-IP": "198.51.100.42" },
      }),
    );
    expect(chaves).toEqual(["198.51.100.42"]);
  });
});

describe("Worker /api/v1 — guarda arquitetural", () => {
  it("a lógica de rotas é pura: sem Node nem `fs`", () => {
    const fonte = readFileSync(
      new URL("../src/rotas.ts", import.meta.url),
      "utf8",
    );
    const especificadores = [
      ...fonte.matchAll(/(?:from|import)\s+["']([^"']+)["']/g),
    ].map((match) => match[1] as string);
    expect(especificadores).not.toContain("fs");
    expect(especificadores).not.toContain("path");
    expect(especificadores.some((nome) => nome.startsWith("node:"))).toBe(
      false,
    );
    expect(fonte).not.toMatch(
      /import\s+\{[^}]*\}\s+from\s+["']@especialista-do-ar\/pipeline["']/,
    );
    // O contrato do pipeline entra só como tipo (apagado na compilação).
    expect(fonte).toMatch(
      /import type\s+\{[^}]*\}\s+from\s+["']@especialista-do-ar\/pipeline["']/,
    );
  });
});
