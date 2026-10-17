import type { Aparelho, ItemConsulta } from "@especialista-do-ar/pipeline";
import aparelhosJson from "../../../data/build/aparelhos.json" with {
  type: "json",
};
import consultaJson from "../../../data/build/consulta.json" with {
  type: "json",
};
import { comLimitePorIp, criarServidor, type Limitador } from "./rotas.ts";

/**
 * O entry do Worker dinâmico (Cloudflare). O **dataset é embutido**: os
 * artefatos publicados (`aparelhos.json` para comparação/Valor calculado e
 * `consulta.json` para busca) são empacotados no bundle pelo Wrangler — não há
 * D1 nem leitura de arquivo em runtime. Toda a lógica vive em `rotas.ts`; aqui
 * só ligamos o `fetch` e o *Rate Limiting binding* (`LIMITE_POR_IP`, o limite
 * por IP do ADR-0003). Ver ADR-0003.
 */

/** O *Rate Limiting binding* do Workers (ver `ratelimits` no `wrangler.jsonc`). */
export interface BindingLimite {
  limit(opcoes: { key: string }): Promise<{ success: boolean }>;
}

/** Bindings disponíveis para o Worker. */
export interface Env {
  LIMITE_POR_IP: BindingLimite;
}

const servidor = criarServidor({
  aparelhos: aparelhosJson as Aparelho[],
  consulta: consultaJson as ItemConsulta[],
});

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const limitar: Limitador = async (chave) => {
      const { success } = await env.LIMITE_POR_IP.limit({ key: chave });
      return success;
    };
    return comLimitePorIp(servidor, limitar)(request);
  },
};
