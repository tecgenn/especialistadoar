export type {
  Aparelho,
  DadosDeclarados,
  RegistroInmetro,
  Tensao,
  Variante,
} from "./aparelho.ts";
export { type BuildOptions, type BuildResult, runBuild } from "./build.ts";
export type { ItemConsulta } from "./consulta.ts";
export type { Manifest, VersaoDaTabela } from "./ingest.ts";
export { versaoAtualDo } from "./ingest.ts";
