import {
  type Consulta,
  criarConsulta,
  type FiltrosConsulta,
  type ItemConsulta,
} from "@especialista-do-ar/api/consulta";
import type { Aparelho, Tensao } from "@especialista-do-ar/pipeline";

/**
 * A lógica das rotas dinâmicas (`/api/v1/...`), isolada do runtime do Worker
 * para ser testada na fronteira HTTP (Request → Response) sem `workerd`. É
 * **pura**: não importa Node nem `fs`, e a busca/filtro vêm do módulo isomórfico
 * do ticket 08 (`criarConsulta`), sem lógica duplicada. O entry do Worker
 * (`index.ts`) é só a casca que embute o dataset e liga o `fetch`. Ver ADR-0003.
 */

export interface DependenciasServidor {
  /** A base servida completa — alimenta comparação e Valor calculado. */
  aparelhos: Aparelho[];
  /** O dataset enxuto de consulta — alimenta a busca e os filtros. */
  consulta: ItemConsulta[];
}

/**
 * Limita requisições por uma chave (ex.: o IP do cliente). Resolve `true` quando
 * a requisição é permitida. O entry liga isto ao *Rate Limiting binding* do
 * Workers (`env.LIMITE_POR_IP`, ver `wrangler.jsonc`); os testes passam um stub.
 */
export type Limitador = (chave: string) => Promise<boolean>;

/** Cabeçalho que a Cloudflare injeta com o IP do cliente. */
const CABECALHO_IP = "CF-Connecting-IP";

/** Janela do limite, em segundos — deve casar com o `period` em `wrangler.jsonc`. */
const JANELA_SEGUNDOS = 60;

/** Um Valor calculado de uma Variante: sempre com a fórmula e as entradas usadas. */
export interface ValorCalculado {
  tensao: Tensao | null;
  rotulo: string;
  unidade: string;
  valor: number;
  formula: string;
  entradas: { tarifa: number; consumoAnualKwh: number };
}

export const AVISO_VALOR_CALCULADO =
  "Valor calculado a partir de Valores oficiais e das entradas informadas na consulta — não é um Valor oficial do INMETRO.";

/** Erro que vira uma resposta HTTP com o status indicado. */
class ErroHttp extends Error {
  constructor(
    readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

function json(
  corpo: unknown,
  status = 200,
  cabecalhos: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...cabecalhos,
    },
  });
}

function erro(
  mensagem: string,
  status: number,
  cabecalhos?: Record<string, string>,
): Response {
  return json({ erro: mensagem }, status, cabecalhos);
}

/** Lê um parâmetro textual; valor em branco é ausência. */
function texto(url: URL, nome: string): string | undefined {
  const valor = url.searchParams.get(nome)?.trim();
  return valor === undefined || valor === "" ? undefined : valor;
}

/** Lê um parâmetro numérico; valor em branco é ausência, valor inválido é 400. */
function numero(url: URL, nome: string): number | undefined {
  const bruto = texto(url, nome);
  if (bruto === undefined) {
    return undefined;
  }
  const valor = Number(bruto);
  if (!Number.isFinite(valor)) {
    throw new ErroHttp(400, `Parâmetro ${nome} inválido: ${bruto}`);
  }
  return valor;
}

function buscar(url: URL, consulta: Consulta): Response {
  const filtros: FiltrosConsulta = {
    q: texto(url, "q"),
    marca: texto(url, "marca"),
    tipo: texto(url, "tipo"),
    btu: numero(url, "btu"),
    tensao: numero(url, "tensao"),
  };
  const resultados = consulta.filtrar(filtros);
  return json({ resultados, total: resultados.length });
}

function comparar(url: URL, porId: Map<string, Aparelho>): Response {
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "");
  if (ids.length < 2) {
    throw new ErroHttp(400, "Informe ao menos dois IDs em ids=<id>,<id>.");
  }

  const encontrados: Aparelho[] = [];
  const ausentes: string[] = [];
  for (const id of ids) {
    const aparelho = porId.get(id);
    if (aparelho === undefined) {
      ausentes.push(id);
    } else {
      encontrados.push(aparelho);
    }
  }
  if (ausentes.length > 0) {
    throw new ErroHttp(
      404,
      `Aparelho(s) não encontrado(s): ${ausentes.join(", ")}`,
    );
  }
  return json({ aparelhos: encontrados });
}

function valorCalculado(url: URL, porId: Map<string, Aparelho>): Response {
  const id = texto(url, "id");
  if (id === undefined) {
    throw new ErroHttp(400, "Parâmetro id é obrigatório.");
  }
  const tarifa = numero(url, "tarifa");
  if (tarifa === undefined || tarifa <= 0) {
    throw new ErroHttp(
      400,
      "Parâmetro tarifa deve ser um número positivo (R$/kWh).",
    );
  }
  const tensao = numero(url, "tensao");

  const aparelho = porId.get(id);
  if (aparelho === undefined) {
    throw new ErroHttp(404, `Aparelho não encontrado: ${id}`);
  }

  const resultados: ValorCalculado[] = aparelho.variantes.flatMap(
    (variante) => {
      const porTensao =
        tensao === undefined ||
        (variante.tensao?.voltagens.includes(tensao) ?? false);
      const consumoAnualKwh = variante.dados.consumoAnualKwh;
      if (!porTensao || consumoAnualKwh === null) {
        return [];
      }
      return [
        {
          tensao: variante.tensao,
          rotulo: "Custo anual estimado",
          unidade: "BRL/ano",
          valor: consumoAnualKwh * tarifa,
          formula: "consumoAnualKwh × tarifa",
          entradas: { tarifa, consumoAnualKwh },
        },
      ];
    },
  );
  if (resultados.length === 0) {
    throw new ErroHttp(
      404,
      "Sem Valor calculado para os parâmetros informados — verifique a tensão e se há consumo anual declarado.",
    );
  }

  return json({
    id: aparelho.id,
    marca: aparelho.marca,
    modelo: aparelho.modelo,
    resultados,
    aviso: AVISO_VALOR_CALCULADO,
  });
}

/**
 * Monta o servidor HTTP das rotas dinâmicas: busca, comparação e Valor
 * calculado sob `/api/v1`. O dataset é passado já parseado (o entry embute os
 * artefatos; os testes montam a partir de um build de fixture).
 */
export function criarServidor(
  deps: DependenciasServidor,
): (request: Request) => Response {
  const consulta = criarConsulta(deps.consulta);
  const porId = new Map(
    deps.aparelhos.map((aparelho) => [aparelho.id, aparelho]),
  );

  return (request) => {
    if (request.method !== "GET") {
      return erro("Método não permitido.", 405);
    }
    const url = new URL(request.url);
    try {
      switch (url.pathname) {
        case "/api/v1/search":
          return buscar(url, consulta);
        case "/api/v1/comparar":
          return comparar(url, porId);
        case "/api/v1/valor-calculado":
          return valorCalculado(url, porId);
        default:
          return erro("Rota não encontrada.", 404);
      }
    } catch (causa) {
      if (causa instanceof ErroHttp) {
        return erro(causa.message, causa.status);
      }
      throw causa;
    }
  };
}

/** O IP do cliente visto pela Cloudflare; `undefined` quando não há (fora dela). */
function ipDoCliente(request: Request): string | undefined {
  const ip = request.headers.get(CABECALHO_IP)?.trim();
  return ip === undefined || ip === "" ? undefined : ip;
}

/**
 * Envolve um servidor de rotas com um limite **por IP** (ADR-0003: acesso aberto
 * no MVP, com regra de limite por IP na Cloudflare). A chave é o IP do cliente
 * visto pela Cloudflare (`CF-Connecting-IP`); estourado o limite, responde `429`
 * com `Retry-After`, sem chegar às rotas. O limite de fato fica no binding do
 * Workers — aqui só o ponto de decisão, testável sem `workerd`.
 *
 * Quando não há IP atribuível (fora da Cloudflare, ex.: testes), o limite é
 * dispensado: um balde compartilhado para todos os chamadores sem IP seria pior
 * do que não atribuir, e em produção o cabeçalho sempre vem.
 */
export function comLimitePorIp(
  servidor: (request: Request) => Response,
  limitar: Limitador,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const ip = ipDoCliente(request);
    if (ip !== undefined && !(await limitar(ip))) {
      return erro("Muitas requisições — tente novamente mais tarde.", 429, {
        "retry-after": String(JANELA_SEGUNDOS),
      });
    }
    return servidor(request);
  };
}
