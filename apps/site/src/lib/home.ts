/**
 * A home como hub (ticket 46): tudo o que ela mostra é derivado no build — as
 * contagens da base, as capacidades e marcas populares, o FAQ e o JSON-LD
 * `FAQPage`. Este módulo é a parte pura (sem I/O e sem Astro), para o build e os
 * testes usarem a mesma definição.
 *
 * Nenhuma contagem é escrita à mão: `contarBase` lê o dataset de consulta
 * publicado. As capacidades e marcas populares saem da curadoria do site
 * (`filtros.json`), escondendo em silêncio o valor que não existe na base — a
 * mesma regra dos chips da tabela.
 */
import type { ItemConsulta } from "@especialista-do-ar/api/consulta";
import type { FiltrosCurados, MarcaCurada } from "./filtros.ts";

/** As contagens reais da base servida, exibidas na faixa de confiança. */
export interface ContagensDaBase {
  aparelhos: number;
  marcas: number;
  capacidades: number;
}

/**
 * Conta Aparelhos, Marcas de catálogo e capacidades distintas do dataset de
 * consulta. A Marca de catálogo (ADR-0016) evita contar a mesma família duas
 * vezes sob nomes oficiais diferentes.
 */
export function contarBase(dataset: readonly ItemConsulta[]): ContagensDaBase {
  const marcas = new Set<string>();
  const capacidades = new Set<number>();
  for (const item of dataset) {
    if (item.marcaCatalogo !== "") {
      marcas.add(item.marcaCatalogo);
    }
    for (const capacidade of item.capacidadesBtu) {
      capacidades.add(capacidade);
    }
  }
  return {
    aparelhos: dataset.length,
    marcas: marcas.size,
    capacidades: capacidades.size,
  };
}

/** Uma pergunta do FAQ da home; a mesma lista alimenta o texto e o JSON-LD. */
export interface PerguntaFrequente {
  pergunta: string;
  resposta: string;
}

/**
 * O critério de recorte da tabela, num só texto: a pergunta do FAQ, a
 * metodologia da home e o aviso das Análises dizem a mesma coisa. Separa a
 * Linha excluída (nunca entra na base) do Aparelho ausente (sumiu entre
 * Versões) e dos status do Registro, que não removem ninguém da tabela.
 */
export const EXPLICACAO_DO_RECORTE =
  "A tabela é um recorte da exportação do INMETRO. Linhas marcadas como excluídas são descartadas ao montar a tabela, para evitar duplicatas e versões antigas de um mesmo modelo. Um aparelho que constava em uma Versão anterior e não aparece na atual está ausente, sem que a tabela diga o motivo. Já Cancelado e Inativo são status do Registro INMETRO — quando o aparelho está na base, a ficha os mostra; eles não o removem da tabela.";

/**
 * Perguntas reais de quem procura ar-condicionado, com respostas curtas. O FAQ
 * é conteúdo de busca: as respostas explicam os conceitos do site sem prometer
 * economia nem substituir o Valor oficial do INMETRO.
 */
export const PERGUNTAS_FREQUENTES: readonly PerguntaFrequente[] = [
  {
    pergunta: "Quantos BTUs preciso para o meu ambiente?",
    resposta:
      "Como referência de mercado, um ambiente residencial pede cerca de 600 a 800 BTU/h por m², conforme a incidência de sol, mais um adicional por pessoa, eletrônicos e janelas. Use o Assistente para responder cinco perguntas e chegar à capacidade comercial mais próxima.",
  },
  {
    pergunta: "O que é BTU/h?",
    resposta:
      "BTU/h é a unidade de capacidade de refrigeração: quanto calor o aparelho consegue remover do ambiente em uma hora. Quanto maior o número de BTU/h, maior o ambiente que ele atende. É capacidade, não consumo de energia — o consumo vem em kWh na ficha de cada aparelho.",
  },
  {
    pergunta: "O que é o IDRS?",
    resposta:
      "É o Índice de Desempenho de Refrigeração Sazonal: a razão entre o calor removido e a energia elétrica consumida (Wh/Wh) que o INMETRO declara para cada aparelho. Quanto maior, mais eficiente — e o valor é sempre o oficial, nunca recalculado pelo site.",
  },
  {
    pergunta: "O que é a Classe energética?",
    resposta:
      "É a faixa de classificação de eficiência (A a F) declarada pelo INMETRO na coluna “Faixa de Classificação”. A Classe é um Valor oficial e não é recalculada a partir do IDRS, porque as duas medidas não andam juntas entre os tipos de aparelho.",
  },
  {
    pergunta: "Split ou ar-condicionado de janela?",
    resposta:
      "O Split Hi-Wall costuma ser mais eficiente e silencioso, e é a primeira escolha para quartos, salas e escritórios. O modelo de janela atende casos específicos de instalação; compare sempre capacidade, consumo e IDRS na tabela antes de decidir.",
  },
  {
    pergunta: "Qual tensão escolher: 127 V ou 220 V?",
    resposta:
      "Escolha a tensão da instalação disponível no local: se a tomada é de 127 V, use um aparelho de 127 V; se é de 220 V, use um de 220 V. Muitos modelos são bivolt (127/220 V) e atendem às duas. Não escolha pela conta de luz — o critério é a rede elétrica do imóvel. Em caso de dúvida, confirme com um eletricista.",
  },
  {
    pergunta: "Como comparar o consumo de energia?",
    resposta:
      "O INMETRO declara o consumo anual em kWh para um ciclo de 2.080 horas por ano. Compare aparelhos de capacidade parecida pelo consumo e pelo IDRS: dois modelos de 12.000 BTU/h podem ter consumos bem diferentes.",
  },
  {
    pergunta: "Os dados do site são oficiais?",
    resposta:
      "Os dados técnicos vêm da exportação oficial de produtos do INMETRO e são reproduzidos como Valores oficiais. Já a recomendação do Assistente é uma estimativa calculada por heurística, não um cálculo de carga térmica nem um Valor oficial.",
  },
  {
    pergunta: "Por que um modelo não aparece na tabela?",
    resposta: EXPLICACAO_DO_RECORTE,
  },
];

/** Os três passos do Assistente, na chamada do meio da home. */
export const PASSOS_ASSISTENTE: readonly { titulo: string; texto: string }[] = [
  {
    titulo: "Responda cinco perguntas",
    texto:
      "Ambiente, área, incidência de sol, pessoas e equipamentos — uma pergunta por tela.",
  },
  {
    titulo: "Veja a conta aberta",
    texto:
      "A capacidade recomendada aparece com os fatores usados, a fórmula resumida e o nível de confiança.",
  },
  {
    titulo: "Compare antes de comprar",
    texto:
      "O resultado leva aos aparelhos analisados daquela capacidade e à tabela já filtrada.",
  },
];

/**
 * O JSON-LD `FAQPage` do FAQ visível. Cada pergunta vira uma `Question` com a
 * resposta aceita; o texto é o mesmo que a pessoa lê na página.
 */
export function jsonLdPerguntasFrequentes(
  perguntas: readonly PerguntaFrequente[] = PERGUNTAS_FREQUENTES,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "pt-BR",
    mainEntity: perguntas.map(({ pergunta, resposta }) => ({
      "@type": "Question",
      name: pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: resposta,
      },
    })),
  };
}

/** As capacidades populares que existem na base, na ordem curada. */
export function capacidadesPopulares(
  dataset: readonly ItemConsulta[],
  curadoria: FiltrosCurados,
): number[] {
  const presentes = new Set(dataset.flatMap((item) => item.capacidadesBtu));
  return curadoria.btus.filter((capacidade) => presentes.has(capacidade));
}

/**
 * Aparelhos por capacidade: cada Aparelho conta uma vez em cada capacidade que
 * declara, mesmo quando tem mais de uma Variante no mesmo valor. Alimenta a
 * contagem das capacidades populares (ticket 71).
 */
export function contagensPorCapacidade(
  dataset: readonly ItemConsulta[],
): Map<number, number> {
  const contagens = new Map<number, number>();
  for (const item of dataset) {
    for (const capacidade of new Set(item.capacidadesBtu)) {
      contagens.set(capacidade, (contagens.get(capacidade) ?? 0) + 1);
    }
  }
  return contagens;
}

/** Aparelhos por Marca de catálogo (ADR-0016), para a contagem das marcas. */
export function contagensPorMarca(
  dataset: readonly ItemConsulta[],
): Map<string, number> {
  const contagens = new Map<string, number>();
  for (const item of dataset) {
    if (item.marcaCatalogo === "") {
      continue;
    }
    contagens.set(
      item.marcaCatalogo,
      (contagens.get(item.marcaCatalogo) ?? 0) + 1,
    );
  }
  return contagens;
}

/** As marcas populares que existem na base, na ordem curada. */
export function marcasPopulares(
  dataset: readonly ItemConsulta[],
  curadoria: FiltrosCurados,
): MarcaCurada[] {
  const presentes = new Set(
    dataset.map((item) => item.marcaCatalogo).filter((marca) => marca !== ""),
  );
  return curadoria.marcas
    .filter((marca) => presentes.has(marca.valor))
    .map(({ valor, rotulo }) => ({ valor, rotulo }));
}

/**
 * O link para a tabela já recortada. A presença de uma chave de filtro desliga
 * os filtros padrão (ADR-0019), então `?btu=` e `?marca=` mostram todos os
 * aparelhos daquele recorte.
 */
export function linkDaTabela(filtro: { marca?: string; btu?: number }): string {
  const busca = new URLSearchParams();
  if (filtro.marca !== undefined) {
    busca.set("marca", filtro.marca);
  }
  if (filtro.btu !== undefined) {
    busca.set("btu", String(filtro.btu));
  }
  const querystring = busca.toString();
  return querystring === "" ? "/aparelhos/" : `/aparelhos/?${querystring}`;
}

/** Número no formato pt-BR (2.227), para as contagens da faixa de confiança. */
export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

/** Capacidade legível: 9.000 BTU/h. */
export function formatarCapacidade(btu: number): string {
  return `${formatarNumero(btu)} BTU/h`;
}
