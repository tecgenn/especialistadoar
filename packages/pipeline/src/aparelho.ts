import { type Static, Type } from "@sinclair/typebox";

/**
 * Contrato da base servida (`aparelhos.jsonl`/`aparelhos.json`).
 *
 * Os tipos são a fonte única: o `schema.json` é derivado deste objeto, nunca
 * mantido à mão (ADR-0002). Um Aparelho é um kit identificado por marca +
 * unid. interna + unid. externa (ou Modelo quando as unidades não vêm
 * separadas); a tensão fica fora da identidade, então as variações de tensão —
 * e qualquer divergência de Dados declarados — viram `variantes`.
 */

const Nullable = <T extends Parameters<typeof Type.Union>[0][number]>(
  schema: T,
) => Type.Union([schema, Type.Null()]);

export const TensaoSchema = Type.Object({
  voltagens: Type.Array(Type.Number()),
  fases: Type.Array(Type.String()),
});
export type Tensao = Static<typeof TensaoSchema>;

export const RegistroInmetroSchema = Type.Object({
  numero: Type.String(),
  status: Type.String(),
});
export type RegistroInmetro = Static<typeof RegistroInmetroSchema>;

export const DadosDeclaradosSchema = Type.Object({
  capacidadeNominalBtu: Nullable(Type.Number()),
  capacidadeNominalW: Nullable(Type.Number()),
  potenciaEsperaW: Nullable(Type.Number()),
  capacidade35TotalW: Nullable(Type.Number()),
  potencia35TotalW: Nullable(Type.Number()),
  capacidade35ParcialW: Nullable(Type.Number()),
  potencia35ParcialW: Nullable(Type.Number()),
  capacidade29ParcialW: Nullable(Type.Number()),
  potencia29ParcialW: Nullable(Type.Number()),
  capacidade29TotalW: Nullable(Type.Number()),
  potencia29TotalW: Nullable(Type.Number()),
  idrs: Nullable(Type.Number()),
  consumoAnualKwh: Nullable(Type.Number()),
  /**
   * Faixa de Classificação declarada pelo INMETRO (A a F), por Linha. É sempre
   * o Valor oficial: nunca recalculada a partir do IDRS (ADR-0018).
   */
  classe: Nullable(Type.String()),
});
export type DadosDeclarados = Static<typeof DadosDeclaradosSchema>;

export const VarianteSchema = Type.Object({
  tensao: Nullable(TensaoSchema),
  dados: DadosDeclaradosSchema,
  linhas: Type.Array(Type.Number()),
});
export type Variante = Static<typeof VarianteSchema>;

export const SituacaoSchema = Type.Union([
  Type.Literal("ativo"),
  Type.Literal("inativo"),
]);
export type Situacao = Static<typeof SituacaoSchema>;

export const AparelhoSchema = Type.Object({
  id: Type.String(),
  marca: Type.String(),
  modelo: Type.String(),
  unidadeInterna: Nullable(Type.String()),
  unidadeExterna: Nullable(Type.String()),
  tipo: Nullable(Type.String()),
  funcao: Nullable(Type.String()),
  rotacao: Nullable(Type.String()),
  /**
   * `ativo` quando ao menos um dos Registros INMETRO está Ativo; derivada dos
   * status dos Registros, nunca um dado novo (ADR-0018).
   */
  situacao: SituacaoSchema,
  fluidoRefrigerante: Nullable(Type.String()),
  fluidoEspecificado: Nullable(Type.String()),
  linhas: Type.Array(Type.Number()),
  registros: Type.Array(RegistroInmetroSchema),
  variantes: Type.Array(VarianteSchema),
});
export type Aparelho = Static<typeof AparelhoSchema>;

/** O contrato serializado como `schema.json`. */
export const SCHEMA_APARELHO = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://especialista-do-ar/schema/aparelho.json",
  ...AparelhoSchema,
};
