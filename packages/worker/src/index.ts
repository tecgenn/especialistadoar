import type { Aparelho, ItemConsulta } from "@especialista-do-ar/pipeline";
import aparelhosJson from "../../../data/build/aparelhos.json" with {
  type: "json",
};
import consultaJson from "../../../data/build/consulta.json" with {
  type: "json",
};
import { criarServidor } from "./rotas.ts";

/**
 * O entry do Worker dinâmico (Cloudflare). O **dataset é embutido**: os
 * artefatos publicados (`aparelhos.json` para comparação/Valor calculado e
 * `consulta.json` para busca) são empacotados no bundle pelo Wrangler — não há
 * D1 nem leitura de arquivo em runtime. Toda a lógica vive em `rotas.ts`; aqui
 * só ligamos o `fetch`. Ver ADR-0003.
 */
const atender = criarServidor({
  aparelhos: aparelhosJson as Aparelho[],
  consulta: consultaJson as ItemConsulta[],
});

export default {
  fetch(request: Request): Response {
    return atender(request);
  },
};
