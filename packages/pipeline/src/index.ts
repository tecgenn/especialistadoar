export type {
  Aparelho,
  DadosDeclarados,
  RegistroInmetro,
  Situacao,
  Tensao,
  Variante,
} from "./aparelho.ts";
export { type BuildOptions, type BuildResult, runBuild } from "./build.ts";
export type { ItemConsulta } from "./consulta.ts";
export type { Manifest, VersaoDaTabela } from "./ingest.ts";
export { versaoAtualDo } from "./ingest.ts";
export type { MarcaCatalogo } from "./marcas-catalogo.ts";
