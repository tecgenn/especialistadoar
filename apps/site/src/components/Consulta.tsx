import {
  criarConsulta,
  type FiltrosConsulta,
  type ItemConsulta,
  type Consulta as MotorConsulta,
  ORDENS_CONSULTA,
  type OrdemConsulta,
  ordenar,
} from "@especialista-do-ar/api/consulta";
import { useCallback, useEffect, useState } from "react";
import { escreverEstado, lerEstado } from "../lib/estado";
import type { OpcoesConsulta } from "../lib/opcoes";
import { COLUNAS_TABELA, valorDaColuna } from "../lib/tabela";

/**
 * A **única ilha** do site (ADR-0008): a tabela de Aparelhos com filtros
 * combináveis, busca textual e ordenação rodam **no cliente**, sobre o
 * `consulta.json` publicado, pelo módulo isomórfico do ticket 08
 * (`criarConsulta`/`ordenar`). O estado vive na URL. A consulta é 100% estática:
 * o dataset é baixado como arquivo.
 *
 * O layout (ticket 34) é uma grade de duas colunas no desktop — filtros numa
 * barra lateral `sticky` à esquerda, resultados à direita — e empilhado no
 * celular. Cada filtro é um `fieldset.campo-chips` com legenda, chips acima e,
 * quando sobra valor fora dos chips, um `<select>` "Outras…" abaixo.
 */
export interface PropsConsulta {
  /** Opções dos filtros, derivadas do dataset no build do site. */
  opcoes: OpcoesConsulta;
  /** URL do dataset enxuto de consulta (servido ao lado das páginas). */
  consultaUrl?: string;
  /** Mapa de Aparelhos analisados: aparelhoId → { titulo, url, temLinkAfiliado }. */
  analisados?: Map<
    string,
    { titulo: string; url: string; temLinkAfiliado: boolean }
  >;
}

/** Quantas linhas aparecem por vez na tabela. */
const TAMANHO_PAGINA = 50;

/** Os campos que a tabela sabe ordenar (as colunas ordenáveis do ticket 31). */
const CAMPOS_ORDENAVEIS = new Set<string>(ORDENS_CONSULTA);

/** Uma marca nos chips: `valor` é o filtro, `rotulo` o que se lê. */
interface OpcaoChip {
  valor: string;
  rotulo: string;
}

/** Uma classe nos chips: além do rótulo, a cor curada (opcional). */
interface OpcaoClasseChip extends OpcaoChip {
  cor?: string;
}

/** Só os filtros contam para "Limpar filtros"; a ordenação não conta. */
function temFiltroAtivo(estado: FiltrosConsulta): boolean {
  const algumTexto = (["marca", "tipo", "funcao", "classe", "q"] as const).some(
    (campo) => (estado[campo] ?? "").trim() !== "",
  );
  return algumTexto || estado.btu !== undefined || estado.tensao !== undefined;
}

/** Só a ordenação sobrevive a "Limpar filtros". */
function somenteOrdem(estado: FiltrosConsulta): FiltrosConsulta {
  return {
    ...(estado.ordem === undefined ? {} : { ordem: estado.ordem }),
    ...(estado.dir === undefined ? {} : { dir: estado.dir }),
  };
}

/**
 * Os chips de um filtro (ticket 22): botões com `aria-pressed`, que quebram
 * linha. Clicar no chip ativo limpa; o chamador decide o que "ativo" significa.
 */
function Chips({
  opcoes,
  estaAtivo,
  selecionar,
}: {
  opcoes: OpcaoChip[];
  estaAtivo: (valor: string) => boolean;
  selecionar: (valor: string) => void;
}) {
  if (opcoes.length === 0) {
    return null;
  }
  return (
    <div className="chips">
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
    </div>
  );
}

/**
 * Os chips de Classe (ticket 34): como os demais, mas cada botão carrega
 * `data-classe` para o CSS pintar a classe energética (A–F) e a cor curada.
 */
function ChipsClass({
  opcoes,
  estaAtivo,
  selecionar,
}: {
  opcoes: OpcaoClasseChip[];
  estaAtivo: (valor: string) => boolean;
  selecionar: (valor: string) => void;
}) {
  if (opcoes.length === 0) {
    return null;
  }
  return (
    <div className="chips classes-chips">
      {opcoes.map(({ valor, rotulo, cor }) => (
        <button
          key={valor}
          type="button"
          aria-pressed={estaAtivo(valor)}
          data-classe={valor}
          style={
            cor === undefined
              ? undefined
              : ({ "--cor-classe": cor } as React.CSSProperties)
          }
          onClick={() => selecionar(valor)}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

/** Um cabeçalho ordenável: o botão alterna a direção; `aria-sort` fica no `th`. */
function Cabecalho({
  campo,
  rotulo,
  estado,
  alternar,
}: {
  campo: OrdemConsulta;
  rotulo: string;
  estado: FiltrosConsulta;
  alternar: (campo: OrdemConsulta) => void;
}) {
  const ativa = estado.ordem === campo;
  const direcao = ativa ? (estado.dir ?? "asc") : null;
  const ariaSort =
    direcao === "asc"
      ? "ascending"
      : direcao === "desc"
        ? "descending"
        : "none";
  return (
    <th scope="col" aria-sort={ariaSort}>
      <button type="button" onClick={() => alternar(campo)}>
        {rotulo}
        {direcao === "asc" ? " ↑" : direcao === "desc" ? " ↓" : null}
      </button>
    </th>
  );
}

export default function Consulta({
  opcoes,
  consultaUrl = "/consulta.json",
  analisados = new Map(),
}: PropsConsulta) {
  const [motor, setMotor] = useState<MotorConsulta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [estado, setEstado] = useState<FiltrosConsulta>({});
  const [paginacao, setPaginacao] = useState({
    chave: "",
    quantidade: TAMANHO_PAGINA,
  });

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
    // "Limpar filtros" limpa os filtros e mantém a ordenação — a ordem escolhida
    // não é um filtro (e o botão só aparece com filtro ativo).
    const restante = somenteOrdem(estado);
    const busca = escreverEstado(restante).toString();
    const url = `${window.location.pathname}${busca === "" ? "" : `?${busca}`}`;
    window.history.replaceState(null, "", url);
    setEstado(restante);
  }, [estado]);

  const alternar = (campo: OrdemConsulta) => {
    const direcaoAtual = estado.ordem === campo ? (estado.dir ?? "asc") : null;
    atualizar({
      ordem: campo,
      dir: direcaoAtual === "asc" ? "desc" : "asc",
    });
  };

  const trocarOrdem = (valor: string) => {
    if (valor === "") {
      atualizar({ ordem: undefined, dir: undefined });
      return;
    }
    const campo = valor as OrdemConsulta;
    atualizar({
      ordem: campo,
      dir: estado.ordem === campo ? (estado.dir ?? "asc") : "asc",
    });
  };

  /** Inverte o sentido da ordenação — o caminho do celular, onde o cabeçalho
   *  da tabela some e o cabeçalho clicável não está à mão. */
  const alternarDirecao = () => {
    if (estado.ordem === undefined) {
      return;
    }
    atualizar({ dir: (estado.dir ?? "asc") === "asc" ? "desc" : "asc" });
  };

  const filtrados = motor === null ? [] : motor.filtrar(estado);
  // Com busca e sem coluna escolhida, a ordem inicial é a relevância do
  // MiniSearch; A–Z e as colunas só entram quando a pessoa pede.
  const usarOrdenacao =
    estado.ordem !== undefined || (estado.q ?? "").trim() === "";
  const resultadosOrdenados = usarOrdenacao
    ? ordenar(filtrados, estado)
    : filtrados;

  // Divide em dois grupos: analisados primeiro (ordenados dentro do grupo), depois demais.
  const analisadosIds = new Set(analisados.keys());
  const grupoAnalisados: ItemConsulta[] = [];
  const grupoDemais: ItemConsulta[] = [];
  for (const item of resultadosOrdenados) {
    if (analisadosIds.has(item.id)) {
      grupoAnalisados.push(item);
    } else {
      grupoDemais.push(item);
    }
  }
  const resultados = [...grupoAnalisados, ...grupoDemais];

  // Mudar filtro ou ordem volta para o início; "Mostrar mais" só cresce a
  // quantidade dentro do mesmo estado.
  const chaveEstado = escreverEstado(estado).toString();
  const mostrados =
    paginacao.chave === chaveEstado ? paginacao.quantidade : TAMANHO_PAGINA;
  const exibidos = resultados.slice(0, mostrados);
  const temFiltro = temFiltroAtivo(estado);
  const temAnalisadosVisiveis = grupoAnalisados.length > 0;
  const analisadosComLinkAfiliado = grupoAnalisados.some(
    (item) => analisados.get(item.id)?.temLinkAfiliado,
  );

  // O chip aceso **é** o valor do filtro: o `<select>` "Outras…" não repete esse
  // valor, então mostra o placeholder enquanto o chip estiver ativo (um valor
  // por vez). Um link antigo pode trazer a Marca oficial (`?marca=SPRINGER
  // MIDEA`), fora dos chips: ela continua valendo e ganha uma opção própria no
  // `<select>` (ADR-0016).
  const valoresChip = new Set(opcoes.marcasChip.map((marca) => marca.valor));
  const marcasDoSelect =
    estado.marca !== undefined &&
    !valoresChip.has(estado.marca) &&
    !opcoes.marcas.includes(estado.marca)
      ? [...opcoes.marcas, estado.marca].sort()
      : opcoes.marcas;
  const marcaDoSelect =
    estado.marca !== undefined && marcasDoSelect.includes(estado.marca)
      ? estado.marca
      : "";
  const btuDoSelect =
    estado.btu !== undefined && opcoes.btus.includes(estado.btu)
      ? String(estado.btu)
      : "";

  const funcoes: OpcaoChip[] = opcoes.funcoes.map((funcao) => ({
    valor: funcao,
    rotulo: funcao,
  }));
  const tipos: OpcaoChip[] = opcoes.tipos.map((tipo) => ({
    valor: tipo,
    rotulo: tipo,
  }));
  const classesExtras = opcoes.classes;

  return (
    <section className="consulta">
      <div className="consulta-layout">
        <aside className="filtros-sidebar">
          <form
            className="filtros"
            onSubmit={(evento) => evento.preventDefault()}
          >
            <label className="busca campo-full">
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

            <fieldset className="campo-chips">
              <legend>Marca</legend>
              <Chips
                opcoes={opcoes.marcasChip}
                estaAtivo={(valor) => estado.marca === valor}
                selecionar={(valor) =>
                  atualizar({
                    marca: estado.marca === valor ? undefined : valor,
                  })
                }
              />
              <label className="select-outras">
                <select
                  aria-label="Outras marcas"
                  value={marcaDoSelect}
                  onChange={(evento) =>
                    atualizar({ marca: evento.target.value || undefined })
                  }
                >
                  <option value="" disabled hidden>
                    Outras Marcas
                  </option>
                  {marcasDoSelect.map((marca) => (
                    <option key={marca} value={marca}>
                      {marca}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset className="campo-chips">
              <legend>Capacidade</legend>
              <Chips
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
              <label className="select-outras">
                <select
                  aria-label="Outras capacidades"
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
                  <option value="" disabled hidden>
                    Outras Capacidades
                  </option>
                  {opcoes.btus.map((btu) => (
                    <option key={btu} value={btu}>
                      {btu.toLocaleString("pt-BR")}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset className="campo-chips">
              <legend>Função</legend>
              <Chips
                opcoes={funcoes}
                estaAtivo={(valor) => estado.funcao === valor}
                selecionar={(valor) =>
                  atualizar({
                    funcao: estado.funcao === valor ? undefined : valor,
                  })
                }
              />
            </fieldset>

            <fieldset className="campo-chips">
              <legend>Tipo</legend>
              <Chips
                opcoes={tipos}
                estaAtivo={(valor) => estado.tipo === valor}
                selecionar={(valor) =>
                  atualizar({ tipo: estado.tipo === valor ? undefined : valor })
                }
              />
            </fieldset>

            <fieldset className="campo-chips">
              <legend>Classe</legend>
              <ChipsClass
                opcoes={opcoes.classesChip}
                estaAtivo={(valor) => estado.classe === valor}
                selecionar={(valor) =>
                  atualizar({
                    classe: estado.classe === valor ? undefined : valor,
                  })
                }
              />
              {classesExtras.length > 0 ? (
                <label className="select-outras">
                  <select
                    aria-label="Outras classes"
                    value={
                      estado.classe !== undefined &&
                      classesExtras.includes(estado.classe)
                        ? estado.classe
                        : ""
                    }
                    onChange={(evento) =>
                      atualizar({ classe: evento.target.value || undefined })
                    }
                  >
                    <option value="" disabled hidden>
                      Outras Classes
                    </option>
                    {classesExtras.map((classe) => (
                      <option key={classe} value={classe}>
                        {classe}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </fieldset>

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

            <label>
              <span>Ordenar por</span>
              <select
                value={estado.ordem ?? ""}
                onChange={(evento) => trocarOrdem(evento.target.value)}
              >
                <option value="">
                  {estado.q === undefined || estado.q.trim() === ""
                    ? "Padrão (A–Z)"
                    : "Padrão (relevância)"}
                </option>
                {COLUNAS_TABELA.filter((coluna) =>
                  CAMPOS_ORDENAVEIS.has(coluna.campo),
                ).map((coluna) => (
                  <option key={coluna.campo} value={coluna.campo}>
                    {coluna.rotulo}
                  </option>
                ))}
              </select>
            </label>

            {/* Abaixo de 640 px o cabeçalho da tabela some (a linha vira cartão), então
                a direção precisa de um controle próprio — sem ele, o celular só
                ordenaria crescente. */}
            {estado.ordem !== undefined ? (
              <button
                type="button"
                className="ordem-direcao"
                aria-label={
                  estado.dir === "desc"
                    ? "Ordenar de forma crescente"
                    : "Ordenar de forma decrescente"
                }
                onClick={alternarDirecao}
              >
                {estado.dir === "desc" ? "Decrescente ↓" : "Crescente ↑"}
              </button>
            ) : null}

            {temFiltro ? (
              <button type="button" onClick={limpar}>
                Limpar filtros
              </button>
            ) : null}
          </form>
        </aside>

        <div className="consulta-resultados">
          {erro !== null ? (
            <p role="alert">Não foi possível carregar a base: {erro}.</p>
          ) : motor === null ? (
            <p role="status">Carregando a base…</p>
          ) : (
            <>
              <p role="status">
                {resultados.length} aparelho(s) com Dados declarados.
              </p>
              <table className="tabela-aparelhos">
                <caption className="sr-only">
                  Aparelhos de ar-condicionado, uma linha por Aparelho
                </caption>
                <thead>
                  <tr>
                    {COLUNAS_TABELA.map((coluna) =>
                      CAMPOS_ORDENAVEIS.has(coluna.campo) ? (
                        <Cabecalho
                          key={coluna.campo}
                          campo={coluna.campo as OrdemConsulta}
                          rotulo={coluna.rotulo}
                          estado={estado}
                          alternar={alternar}
                        />
                      ) : (
                        <th key={coluna.campo} scope="col">
                          {coluna.rotulo}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const linhas: React.ReactNode[] = [];
                    let grupoAtual: "analisados" | "demais" | null = null;

                    for (const item of exibidos) {
                      const ehAnalisado = analisadosIds.has(item.id);
                      const grupo = ehAnalisado ? "analisados" : "demais";

                      // Cabeçalho do grupo quando muda de grupo
                      if (grupo !== grupoAtual) {
                        if (grupo === "analisados") {
                          linhas.push(
                            <tr
                              key="grupo-analisados"
                              className="grupo-cabecalho"
                            >
                              <td colSpan={COLUNAS_TABELA.length}>
                                <strong>Analisados por nós</strong>
                                {analisadosComLinkAfiliado && (
                                  <span className="aviso-afiliado">
                                    {" "}
                                    · contém links de afiliado
                                  </span>
                                )}
                              </td>
                            </tr>,
                          );
                        } else if (
                          grupo === "demais" &&
                          temAnalisadosVisiveis
                        ) {
                          linhas.push(
                            <tr key="grupo-demais" className="grupo-cabecalho">
                              <td colSpan={COLUNAS_TABELA.length}>
                                <strong>Demais aparelhos</strong>
                              </td>
                            </tr>,
                          );
                        }
                        grupoAtual = grupo;
                      }

                      const analise = ehAnalisado
                        ? analisados.get(item.id)
                        : undefined;

                      linhas.push(
                        <tr key={item.id}>
                          {COLUNAS_TABELA.map((coluna) => {
                            const valor = valorDaColuna(item, coluna.campo);
                            return (
                              <td key={coluna.campo} data-label={coluna.rotulo}>
                                {coluna.campo === "marca" && analise ? (
                                  <>
                                    {valor}
                                    <span
                                      className="analisado-selo"
                                      id={`analisado-tooltip-${item.id}`}
                                    >
                                      <a
                                        href={analise.url}
                                        className="analisado-link"
                                      >
                                        Analisado
                                      </a>
                                      <span
                                        className="analisado-tooltip"
                                        role="tooltip"
                                      >
                                        Análise completa: {analise.titulo}.
                                        Contém links de afiliado.
                                      </span>
                                    </span>
                                  </>
                                ) : coluna.campo === "modelo" ? (
                                  <a href={`/aparelhos/${item.id}`}>{valor}</a>
                                ) : (
                                  valor
                                )}
                              </td>
                            );
                          })}
                        </tr>,
                      );
                    }
                    return linhas;
                  })()}
                </tbody>
              </table>
              {resultados.length > mostrados ? (
                <button
                  type="button"
                  className="mostrar-mais"
                  onClick={() =>
                    setPaginacao({
                      chave: chaveEstado,
                      quantidade: mostrados + TAMANHO_PAGINA,
                    })
                  }
                >
                  Mostrar mais
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
