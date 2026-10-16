import type { Anomalia } from "./anomalias.ts";
import type { Aparelho } from "./aparelho.ts";
import { aparelhoTemDadosDeclarados, chaveDoAparelho } from "./group.ts";
import type { VinculoSugerido } from "./vinculos.ts";

/**
 * Classificação do diff entre duas Versões da tabela. É a matéria-prima do
 * Relatório de revisão: o que apareceu, o que mudou, o que sumiu, que Anomalias
 * são novas e que Vínculos sugeridos merecem uma pessoa olhar.
 */

/** Campos comparados entre dois Aparelhos da mesma identidade. */
const CAMPOS_COMPARADOS = [
  "marca",
  "modelo",
  "unidadeInterna",
  "unidadeExterna",
  "tipo",
  "funcao",
  "rotacao",
  "fluidoRefrigerante",
  "fluidoEspecificado",
  "registros",
  "variantes",
] as const;

type CampoComparado = (typeof CAMPOS_COMPARADOS)[number];

/** Um Aparelho presente nas duas Versões, mas com algum campo alterado. */
export interface AparelhoAlterado {
  anterior: Aparelho;
  atual: Aparelho;
  campos: CampoComparado[];
}

/**
 * Um Vínculo sugerido junto dos Aparelhos que o originaram, para o relatório
 * poder nomeá-los. A confirmação de uma pessoa o transforma em
 * `VinculoSugerido` (par de identidades) — ver `comoVinculoSugerido`.
 */
export interface VinculoSugeridoDetalhado {
  anterior: Aparelho;
  novo: Aparelho;
}

export interface ClassificacaoRevisao {
  novos: Aparelho[];
  alterados: AparelhoAlterado[];
  ausentes: Aparelho[];
  semDadosDeclarados: Aparelho[];
  anomaliasNovas: Anomalia[];
  vinculosSugeridos: VinculoSugeridoDetalhado[];
}

export interface EntradaRevisao {
  atuais: Aparelho[];
  /** `null` quando ainda não há Versão anterior (primeira Versão da tabela). */
  anteriores: Aparelho[] | null;
  anomaliasAtuais?: Anomalia[];
  anomaliasAnteriores?: Anomalia[];
}

/**
 * Indexa Aparelhos pela sua identidade canônica. O `id` já é derivado da chave
 * de agrupamento (pós-Vínculos confirmados), então correlaciona corretamente
 * mesmo quando um Vínculo remapeou a identidade.
 */
function porId(aparelhos: Aparelho[]): Map<string, Aparelho> {
  const mapa = new Map<string, Aparelho>();
  for (const aparelho of aparelhos) {
    mapa.set(aparelho.id, aparelho);
  }
  return mapa;
}

function assinaturaAnomalia(anomalia: Anomalia): string {
  return `${anomalia.campo}\u0000${anomalia.tipo}\u0000${anomalia.valor}`;
}

/**
 * Representação comparável de um Aparelho: sem `id` nem números de Linha da
 * tabela (que mudam a cada Versão e não são uma alteração de conteúdo).
 * Coleções são ordenadas para que uma mera reordenação do CSV não vire
 * "alterado".
 */
function comparavel(aparelho: Aparelho): Record<CampoComparado, unknown> {
  return {
    marca: aparelho.marca,
    modelo: aparelho.modelo,
    unidadeInterna: aparelho.unidadeInterna,
    unidadeExterna: aparelho.unidadeExterna,
    tipo: aparelho.tipo,
    funcao: aparelho.funcao,
    rotacao: aparelho.rotacao,
    fluidoRefrigerante: aparelho.fluidoRefrigerante,
    fluidoEspecificado: aparelho.fluidoEspecificado,
    registros: [...aparelho.registros].sort(
      (a, b) =>
        a.numero.localeCompare(b.numero) || a.status.localeCompare(b.status),
    ),
    variantes: [...aparelho.variantes]
      .map((variante) => ({ tensao: variante.tensao, dados: variante.dados }))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  };
}

function camposAlterados(
  anterior: Aparelho,
  atual: Aparelho,
): CampoComparado[] {
  const antes = comparavel(anterior);
  const depois = comparavel(atual);
  return CAMPOS_COMPARADOS.filter(
    (campo) => JSON.stringify(antes[campo]) !== JSON.stringify(depois[campo]),
  );
}

function assinaturaTecnica(aparelho: Aparelho): string {
  return aparelho.variantes
    .map((variante) =>
      JSON.stringify({ tensao: variante.tensao, dados: variante.dados }),
    )
    .sort()
    .join("|");
}

function compartilhaRegistro(a: Aparelho, b: Aparelho): boolean {
  const numeros = new Set(b.registros.map((registro) => registro.numero));
  return a.registros.some((registro) => numeros.has(registro.numero));
}

/**
 * Sugere um Vínculo quando um Aparelho novo pode ser um Aparelho Ausente com o
 * texto do modelo corrigido: mesma marca, mesmo Registro e mesmos Dados
 * declarados e tensão. É só uma indicação — nunca vale como identidade sozinha.
 */
function sugerirVinculos(
  novos: Aparelho[],
  ausentes: Aparelho[],
): VinculoSugeridoDetalhado[] {
  const sugestoes: VinculoSugeridoDetalhado[] = [];
  const vistos = new Set<string>();

  for (const novo of novos) {
    for (const ausente of ausentes) {
      if (
        novo.marca.trim().toUpperCase() !== ausente.marca.trim().toUpperCase()
      ) {
        continue;
      }
      if (assinaturaTecnica(novo) !== assinaturaTecnica(ausente)) {
        continue;
      }
      if (!compartilhaRegistro(novo, ausente)) {
        continue;
      }
      const chave = `${chaveDoAparelho(ausente)}\u0000${chaveDoAparelho(novo)}`;
      if (vistos.has(chave)) {
        continue;
      }
      vistos.add(chave);
      sugestoes.push({ anterior: ausente, novo });
    }
  }

  return sugestoes;
}

/** O par de identidades que a confirmação de uma pessoa registra. */
export function comoVinculoSugerido(
  detalhado: VinculoSugeridoDetalhado,
): VinculoSugerido {
  return {
    anterior: chaveDoAparelho(detalhado.anterior),
    novo: chaveDoAparelho(detalhado.novo),
  };
}

function ordenar(aparelhos: Aparelho[]): Aparelho[] {
  return [...aparelhos].sort((a, b) =>
    `${a.marca}\u0000${a.modelo}\u0000${a.id}`.localeCompare(
      `${b.marca}\u0000${b.modelo}\u0000${b.id}`,
    ),
  );
}

export function classificarRevisao({
  atuais,
  anteriores,
  anomaliasAtuais = [],
  anomaliasAnteriores = [],
}: EntradaRevisao): ClassificacaoRevisao {
  if (anteriores === null) {
    return {
      novos: [],
      alterados: [],
      ausentes: [],
      semDadosDeclarados: [],
      anomaliasNovas: [],
      vinculosSugeridos: [],
    };
  }

  const mapaAtual = porId(atuais);
  const mapaAnterior = porId(anteriores);

  const novos = atuais.filter((aparelho) => !mapaAnterior.has(aparelho.id));
  const ausentes = anteriores.filter((aparelho) => !mapaAtual.has(aparelho.id));

  const alterados: AparelhoAlterado[] = [];
  const semDadosDeclarados: Aparelho[] = [];

  for (const [id, atual] of mapaAtual) {
    const anterior = mapaAnterior.get(id);
    if (anterior === undefined) {
      continue;
    }
    if (
      aparelhoTemDadosDeclarados(anterior) &&
      !aparelhoTemDadosDeclarados(atual)
    ) {
      semDadosDeclarados.push(atual);
      continue;
    }
    const campos = camposAlterados(anterior, atual);
    if (campos.length > 0) {
      alterados.push({ anterior, atual, campos });
    }
  }

  const assinaturasAnteriores = new Set(
    anomaliasAnteriores.map(assinaturaAnomalia),
  );
  const anomaliasNovas = anomaliasAtuais.filter(
    (anomalia) => !assinaturasAnteriores.has(assinaturaAnomalia(anomalia)),
  );

  alterados.sort((a, b) =>
    `${a.anterior.marca}\u0000${a.anterior.modelo}`.localeCompare(
      `${b.anterior.marca}\u0000${b.anterior.modelo}`,
    ),
  );

  const vinculosSugeridos = sugerirVinculos(novos, ausentes).sort((a, b) =>
    `${a.anterior.marca}\u0000${a.anterior.modelo}\u0000${a.novo.modelo}`.localeCompare(
      `${b.anterior.marca}\u0000${b.anterior.modelo}\u0000${b.novo.modelo}`,
    ),
  );

  return {
    novos: ordenar(novos),
    alterados,
    ausentes: ordenar(ausentes),
    semDadosDeclarados: ordenar(semDadosDeclarados),
    anomaliasNovas: [...anomaliasNovas].sort(
      (a, b) => a.linha - b.linha || a.campo.localeCompare(b.campo),
    ),
    vinculosSugeridos,
  };
}
