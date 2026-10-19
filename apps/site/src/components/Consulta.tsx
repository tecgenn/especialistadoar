import {
  criarConsulta,
  type FiltrosConsulta,
  type ItemConsulta,
  type Consulta as MotorConsulta,
} from "@especialista-do-ar/api/consulta";
import { useCallback, useEffect, useState } from "react";
import { escreverEstado, lerEstado } from "../lib/estado";
import type { OpcoesConsulta } from "../lib/opcoes";

/**
 * A **única ilha** do site (ADR-0008): a consulta com filtros combináveis e
 * busca textual roda **no cliente**, sobre o `consulta.json` publicado, pelo
 * módulo isomórfico do ticket 08 (`criarConsulta`). O estado vive na URL. A
 * consulta é 100% estática: o dataset é baixado como arquivo.
 */
export interface PropsConsulta {
  /** Opções dos filtros, derivadas do dataset no build do site. */
  opcoes: OpcoesConsulta;
  /** URL do dataset enxuto de consulta (servido ao lado das páginas). */
  consultaUrl?: string;
}

export default function Consulta({
  opcoes,
  consultaUrl = "/consulta.json",
}: PropsConsulta) {
  const [motor, setMotor] = useState<MotorConsulta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [estado, setEstado] = useState<FiltrosConsulta>({});

  useEffect(() => {
    let cancelado = false;
    fetch(consultaUrl)
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }
        return resposta.json() as Promise<ItemConsulta[]>;
      })
      .then((dataset) => {
        if (!cancelado) {
          setMotor(criarConsulta(dataset));
        }
      })
      .catch((causa: unknown) => {
        if (!cancelado) {
          setErro(causa instanceof Error ? causa.message : String(causa));
        }
      });
    return () => {
      cancelado = true;
    };
  }, [consultaUrl]);

  useEffect(() => {
    const lerDaUrl = () => {
      setEstado(lerEstado(new URLSearchParams(window.location.search)));
    };
    lerDaUrl();
    window.addEventListener("popstate", lerDaUrl);
    return () => window.removeEventListener("popstate", lerDaUrl);
  }, []);

  const atualizar = useCallback((parcial: FiltrosConsulta) => {
    setEstado((anterior) => {
      const proximo: FiltrosConsulta = { ...anterior, ...parcial };
      const busca = escreverEstado(proximo).toString();
      const url = `${window.location.pathname}${busca === "" ? "" : `?${busca}`}`;
      window.history.replaceState(null, "", url);
      return proximo;
    });
  }, []);

  const limpar = useCallback(() => {
    window.history.replaceState(null, "", window.location.pathname);
    setEstado({});
  }, []);

  const resultados = motor === null ? [] : motor.filtrar(estado);
  const temFiltro = escreverEstado(estado).toString() !== "";

  return (
    <section className="consulta">
      <form className="filtros" onSubmit={(evento) => evento.preventDefault()}>
        <label>
          <span>Marca</span>
          <select
            value={estado.marca ?? ""}
            onChange={(evento) =>
              atualizar({ marca: evento.target.value || undefined })
            }
          >
            <option value="">Todas</option>
            {opcoes.marcas.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Tipo</span>
          <select
            value={estado.tipo ?? ""}
            onChange={(evento) =>
              atualizar({ tipo: evento.target.value || undefined })
            }
          >
            <option value="">Todos</option>
            {opcoes.tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Capacidade (BTU/h)</span>
          <select
            value={estado.btu === undefined ? "" : String(estado.btu)}
            onChange={(evento) =>
              atualizar({
                btu:
                  evento.target.value === ""
                    ? undefined
                    : Number(evento.target.value),
              })
            }
          >
            <option value="">Todas</option>
            {opcoes.btus.map((btu) => (
              <option key={btu} value={btu}>
                {btu.toLocaleString("pt-BR")}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Tensão (V)</span>
          <select
            value={estado.tensao === undefined ? "" : String(estado.tensao)}
            onChange={(evento) =>
              atualizar({
                tensao:
                  evento.target.value === ""
                    ? undefined
                    : Number(evento.target.value),
              })
            }
          >
            <option value="">Todas</option>
            {opcoes.tensoes.map((tensao) => (
              <option key={tensao} value={tensao}>
                {tensao}
              </option>
            ))}
          </select>
        </label>

        <label className="busca">
          <span>Busca</span>
          <input
            type="search"
            value={estado.q ?? ""}
            placeholder="Marca, modelo ou tipo"
            onChange={(evento) =>
              atualizar({ q: evento.target.value || undefined })
            }
          />
        </label>

        {temFiltro ? (
          <button type="button" onClick={limpar}>
            Limpar filtros
          </button>
        ) : null}
      </form>

      {erro !== null ? (
        <p role="alert">Não foi possível carregar a base: {erro}.</p>
      ) : motor === null ? (
        <p role="status">Carregando a base…</p>
      ) : (
        <>
          <p role="status">
            {resultados.length} aparelho(s) com Dados declarados.
          </p>
          <ul className="resultados">
            {resultados.map((item) => (
              <li key={item.id}>
                <a href={`/aparelhos/${item.id}`}>
                  {item.marca} — {item.modelo}
                </a>
                {item.tipo === null ? null : (
                  <span className="tipo"> · {item.tipo}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
