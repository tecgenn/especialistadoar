/**
 * Busca de Aparelhos na base servida (`ticket 16`): o mantenedor procura por
 * marca, modelo ou potência para copiar o `id` no `aparelhoId` do frontmatter de
 * uma Análise, sem caçar um hash no JSON. Este módulo é a parte pura — recebe os
 * Aparelhos já lidos e devolve o resultado; a leitura da base fica no script.
 * Não altera a base servida nem o pipeline.
 *
 * É uma busca de **autoria** (trecho, sem caixa nem acento), mais frouxa que a
 * semântica de consulta do site (`@especialista-do-ar/api/consulta`), que compara
 * campos exatos e indexa marca/modelo para busca textual. As duas não precisam
 * coincidir: aqui o objetivo é achar um `id` para o frontmatter.
 */

/**
 * O subconjunto do Aparelho que a busca usa. Um `Aparelho` da base servida é
 * atribuível a esta forma, e os testes podem montar só o que importa.
 */
export interface AparelhoBuscavel {
  id: string;
  marca: string;
  modelo: string;
  variantes: ReadonlyArray<{
    dados: { capacidadeNominalBtu: number | null };
  }>;
}

/** Um Aparelho encontrado, com o que vai para o frontmatter da Análise. */
export interface AparelhoEncontrado
  extends Pick<AparelhoBuscavel, "id" | "marca" | "modelo"> {
  potenciasBtu: number[];
}

/** Minúsculas, sem acento e sem espaços nas pontas, para comparar texto. */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/**
 * Interpreta o termo como potência em BTU quando ele é só um número (aceita
 * separador de milhar e o sufixo "BTU"/"BTUs"): `12000`, `12.000` e `27000 BTU`.
 */
function potenciaPedida(termo: string): number | null {
  const limpo = normalizar(termo)
    .replace(/\s*btus?$/, "")
    .replace(/[.,\s]/g, "");
  return /^\d+$/.test(limpo) ? Number(limpo) : null;
}

function potenciasDeclaradas(aparelho: AparelhoBuscavel): number[] {
  const presentes = aparelho.variantes
    .map((variante) => variante.dados.capacidadeNominalBtu)
    .filter((capacidade): capacidade is number => capacidade !== null);
  return [...new Set(presentes)].sort((a, b) => a - b);
}

/**
 * Busca Aparelhos por marca, modelo ou potência (BTU). O termo casa por trecho
 * de marca/modelo, ignorando caixa e acento, ou por potência exata. Termo em
 * branco devolve lista vazia.
 */
export function buscarAparelhos(
  aparelhos: readonly AparelhoBuscavel[],
  termo: string,
): AparelhoEncontrado[] {
  const alvo = normalizar(termo);
  if (alvo === "") {
    return [];
  }
  const potencia = potenciaPedida(termo);

  return aparelhos
    .map((aparelho) => ({
      aparelho,
      potenciasBtu: potenciasDeclaradas(aparelho),
    }))
    .filter(({ aparelho, potenciasBtu }) => {
      const casaTexto =
        normalizar(aparelho.marca).includes(alvo) ||
        normalizar(aparelho.modelo).includes(alvo);
      const casaPotencia = potencia !== null && potenciasBtu.includes(potencia);
      return casaTexto || casaPotencia;
    })
    .map(({ aparelho, potenciasBtu }) => ({
      id: aparelho.id,
      marca: aparelho.marca,
      modelo: aparelho.modelo,
      potenciasBtu,
    }));
}

/** Formata BTU em pt-BR (12.000 BTU), ou um traço quando não declarada. */
function formatarPotencias(potenciasBtu: readonly number[]): string {
  if (potenciasBtu.length === 0) {
    return "sem BTU declarado";
  }
  return `${potenciasBtu.map((btu) => btu.toLocaleString("pt-BR")).join(" / ")} BTU`;
}

/**
 * Renderiza o resultado da busca para o terminal: uma linha por Aparelho com
 * marca, modelo, potência(s) e `id`, ou uma mensagem clara quando nada casou.
 */
export function renderizarAparelhosEncontrados(
  termo: string,
  encontrados: readonly AparelhoEncontrado[],
): string {
  if (encontrados.length === 0) {
    return `Nenhum Aparelho encontrado para "${termo}". Confira marca, modelo ou potência (BTU).`;
  }

  const cabecalho =
    encontrados.length === 1
      ? `1 Aparelho encontrado para "${termo}":`
      : `${encontrados.length} Aparelhos encontrados para "${termo}":`;
  const linhas = encontrados.map(
    (aparelho) =>
      `${aparelho.marca} — ${aparelho.modelo} — ${formatarPotencias(aparelho.potenciasBtu)} — ${aparelho.id}`,
  );
  const dica = "Copie o `id` para o `aparelhoId` no frontmatter da Análise.";

  return [cabecalho, "", ...linhas, "", dica].join("\n");
}
