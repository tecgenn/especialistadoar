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

/** Uma marca nos chips: `valor` é o filtro, `rotulo` o que se lê. */
interface OpcaoChip {
  valor: string;
  rotulo: string;
}

/**
 * Os chips de um filtro (ticket 22): botões com `aria-pressed`, que quebram
 * linha. Clicar no chip ativo limpa; o chamador decide o que "ativo" significa.
 */
function Chips({
  ariaLabel,
  opcoes,
  estaAtivo,
  selecionar,
}: {
  ariaLabel: string;
  opcoes: OpcaoChip[];
  estaAtivo: (valor: string) => boolean;
  selecionar: (valor: string) => void;
}) {
  if (opcoes.length === 0) {
    return null;
  }
  return (
    <fieldset className="chips" aria-label={ariaLabel}>
      {opcoes.map(({ valor, rotulo }) => (
        <button
          key={valor}
          type="button"
          aria-pressed={estaAtivo(valor)}
          onClick={() => selecionar(valor)}
        >
          {rotulo}
        </button>
      ))}
    </fieldset>
  );
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
  // Um link antigo pode trazer a Marca oficial (`?marca=SPRINGER MIDEA`). Ela
  // continua valendo no filtro; sem esta opção extra o `<select>` cairia em
  // "Todas" enquanto a lista estivesse filtrada (ADR-0016).
  const valoresChip = new Set(opcoes.marcasChip.map((marca) => marca.valor));
  const marcasDoFiltro =
    estado.marca !== undefined &&
    !opcoes.marcas.includes(estado.marca) &&
    !valoresChip.has(estado.marca)
      ? [...opcoes.marcas, estado.marca].sort()
      : opcoes.marcas;
  // O chip aceso **é** o valor do filtro: o `<select>` não repete esse valor,
  // então mostra "Todas" enquanto o chip estiver ativo (um valor por vez).
  const marcaDoSelect =
    estado.marca !== undefined && marcasDoFiltro.includes(estado.marca)
      ? estado.marca
      : "";
  const btuDoSelect =
    estado.btu !== undefined && opcoes.btus.includes(estado.btu)
      ? String(estado.btu)
      : "";

  return (
    <section className="consulta">
      <form className="filtros" onSubmit={(evento) => evento.preventDefault()}>
        <div className="campo">
          <Chips
            ariaLabel="Marcas conhecidas"
            opcoes={opcoes.marcasChip}
            estaAtivo={(valor) => estado.marca === valor}
            selecionar={(valor) =>
              atualizar({ marca: estado.marca === valor ? undefined : valor })
            }
          />
          <label>
            <span>Marca</span>
            <select
              value={marcaDoSelect}
              onChange={(evento) =>
                atualizar({ marca: evento.target.value || undefined })
              }
            >
              <option value="">Todas</option>
              {marcasDoFiltro.map((marca) => (
                <option key={marca} value={marca}>
                  {marca}
                </option>
              ))}
            </select>
          </label>
        </div>

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

        <div className="campo">
          <Chips
            ariaLabel="Capacidades comuns"
            opcoes={opcoes.btusChip.map((btu) => ({
              valor: String(btu),
              rotulo: btu.toLocaleString("pt-BR"),
            }))}
            estaAtivo={(valor) => estado.btu === Number(valor)}
            selecionar={(valor) => {
              const btu = Number(valor);
              atualizar({ btu: estado.btu === btu ? undefined : btu });
            }}
          />
          <label>
            <span>Capacidade (BTU/h)</span>
            <select
              value={btuDoSelect}
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
        </div>

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
                  {item.marcaCatalogo} — {item.modelo}
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
