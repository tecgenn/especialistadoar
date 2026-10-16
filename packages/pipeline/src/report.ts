import type { Aparelho } from "./aparelho.ts";
import type { ClassificacaoRevisao } from "./diff.ts";
import type { VersaoDaTabela } from "./ingest.ts";

/**
 * Relatório de revisão em Markdown. É o que uma pessoa lê (via Pull Request)
 * antes de publicar uma nova Versão da tabela. Só descreve o que mudou — nunca
 * presume a causa de uma Ausência.
 */

export interface ContextoRelatorio {
  versao: VersaoDaTabela;
  versaoAnterior?: VersaoDaTabela;
  totalLinhas: number;
  totalAparelhos: number;
  classificacao: ClassificacaoRevisao;
}

const AVISO_AUSENTE =
  "A causa da ausência não é presumida: a tabela não diz se o modelo foi " +
  "descontinuado, cancelado ou omitido por engano.";

const AVISO_SEM_DADOS =
  "Estes Aparelhos tinham Dados declarados na Versão anterior e continuam na " +
  "tabela, mas perderam os Dados declarados nesta Versão. Não são Ausentes; o " +
  "histórico registra que já tiveram dados.";

const AVISO_VINCULO =
  "Nunca são aplicados automaticamente: um Vínculo sugerido só passa a valer " +
  "como identidade depois que uma pessoa o confirma.";

function linha(aparelho: Aparelho): string {
  const partes = [`**${aparelho.marca}** ${aparelho.modelo}`];
  if (aparelho.unidadeInterna !== null || aparelho.unidadeExterna !== null) {
    partes.push(
      `(interna \`${aparelho.unidadeInterna ?? "—"}\`, externa \`${aparelho.unidadeExterna ?? "—"}\`)`,
    );
  }
  partes.push(`— \`${aparelho.id}\``);
  return `- ${partes.join(" ")}`;
}

function secaoAparelhos(titulo: string, aparelhos: Aparelho[]): string {
  const corpo =
    aparelhos.length === 0
      ? "_Nenhum._"
      : aparelhos.map((aparelho) => linha(aparelho)).join("\n");
  return `## ${titulo}\n\n${corpo}`;
}

export function renderizarRelatorio({
  versao,
  versaoAnterior,
  totalLinhas,
  totalAparelhos,
  classificacao,
}: ContextoRelatorio): string {
  const {
    novos,
    alterados,
    ausentes,
    semDadosDeclarados,
    anomaliasNovas,
    vinculosSugeridos,
  } = classificacao;

  const cabecalho = [
    `# Relatório de revisão — Versão da tabela ${versao.obtidoEm}`,
    "",
    `- **Versão da tabela:** \`${versao.hash.slice(0, 12)}\` (obtida em ${versao.obtidoEm})`,
    versaoAnterior === undefined
      ? "- **Versão anterior:** —"
      : `- **Versão anterior:** \`${versaoAnterior.hash.slice(0, 12)}\` (obtida em ${versaoAnterior.obtidoEm})`,
    `- **Linhas da tabela:** ${totalLinhas}`,
    `- **Aparelhos com Dados declarados:** ${totalAparelhos}`,
  ].join("\n");

  const primeiraVersao =
    versaoAnterior === undefined
      ? "_Primeira Versão da tabela: não há Versão anterior para comparar._"
      : "";

  const resumo = [
    "## Resumo",
    "",
    "| Classe | Quantidade |",
    "| --- | --- |",
    `| Aparelhos novos | ${novos.length} |`,
    `| Aparelhos alterados | ${alterados.length} |`,
    `| Aparelhos Ausentes | ${ausentes.length} |`,
    `| Aparelhos sem dados declarados | ${semDadosDeclarados.length} |`,
    `| Anomalias novas | ${anomaliasNovas.length} |`,
    `| Vínculos sugeridos | ${vinculosSugeridos.length} |`,
  ].join("\n");

  const secaoNovos = secaoAparelhos("Aparelhos novos", novos);

  const secaoAlteradosCorpo =
    alterados.length === 0
      ? "_Nenhum._"
      : alterados
          .map(
            ({ anterior, campos }) =>
              `### ${anterior.marca} ${anterior.modelo} — \`${anterior.id}\`\n\n- campos: ${campos
                .map((campo) => `\`${campo}\``)
                .join(", ")}`,
          )
          .join("\n\n");

  const secaoAusentes = `## Aparelhos Ausentes\n\n> ${AVISO_AUSENTE}\n\n${
    ausentes.length === 0
      ? "_Nenhum._"
      : ausentes.map((aparelho) => linha(aparelho)).join("\n")
  }`;

  const secaoSemDados = `## Aparelhos sem dados declarados\n\n> ${AVISO_SEM_DADOS}\n\n${
    semDadosDeclarados.length === 0
      ? "_Nenhum._"
      : semDadosDeclarados.map((aparelho) => linha(aparelho)).join("\n")
  }`;

  const secaoAnomalias = `## Anomalias novas\n\n${
    anomaliasNovas.length === 0
      ? "_Nenhuma._"
      : anomaliasNovas
          .map(
            (anomalia) =>
              `- Linha ${anomalia.linha} — \`${anomalia.campo}\`: \`${anomalia.valor}\` (${anomalia.tipo})`,
          )
          .join("\n")
  }`;

  const secaoVinculos = `## Vínculos sugeridos\n\n> ${AVISO_VINCULO}\n\n${
    vinculosSugeridos.length === 0
      ? "_Nenhum._"
      : vinculosSugeridos
          .map(
            ({ anterior, novo }) =>
              `- **${novo.marca}** ${novo.modelo} (novo) ↔ **${anterior.marca}** ${anterior.modelo} (Ausente)`,
          )
          .join("\n")
  }`;

  return `${[
    cabecalho,
    primeiraVersao,
    resumo,
    secaoNovos,
    `## Aparelhos alterados\n\n${secaoAlteradosCorpo}`,
    secaoAusentes,
    secaoSemDados,
    secaoAnomalias,
    secaoVinculos,
  ]
    .filter((parte) => parte !== "")
    .join("\n\n")}\n`;
}
