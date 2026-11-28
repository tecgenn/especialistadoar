import {
  criarConsulta,
  type FiltrosConsulta,
  type ItemConsulta,
  type Consulta as MotorConsulta,
  ORDENS_CONSULTA,
  type OrdemConsulta,
  ordenar,
} from "@especialista-do-ar/api/consulta";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalisadoDaTabela } from "../conteudo/analises.ts";
import { type AnalisadoVitrine, montarVitrine } from "../lib/analises";
import {
  escreverIds,
  lerIds,
  lerIdsBrutos,
  MAXIMO_COMPARACAO,
  textoDescartes,
} from "../lib/comparacao";
import {
  escreverEstado,
  FILTROS_PADRAO,
  lerEstado,
  temFiltroAtivo,
  temFiltroAvancado,
} from "../lib/estado";
import {
  estadoNaFaixa,
  type FaixaCapacidade,
  faixasDeCapacidade,
  rotuloDaFaixa,
} from "../lib/faixas-capacidade";
import { formatarFaixa } from "../lib/ficha";
import type { OpcoesConsulta } from "../lib/opcoes";
import { etiquetaDaClasse } from "../lib/primitivos";
import {
  type CampoResumoFiltro,
  resumoDosFiltros,
} from "../lib/resumo-filtros";
import {
  colunasDaTabela,
  detalheDoAparelho,
  unidadeDaColuna,
  valorDaColuna,
} from "../lib/tabela";

/**
 * A ilha de consulta do site (ADR-0008): a tabela de Aparelhos com filtros
 * combináveis, busca textual e ordenação rodam **no cliente**, sobre o
 * `consulta.json` publicado, pelo módulo isomórfico do ticket 08
 * (`criarConsulta`/`ordenar`). O estado vive na URL. A consulta é 100% estática:
 * o dataset é baixado como arquivo.
 *
 * O layout (tickets 50 e 73) é uma coluna central sem barra lateral: a **barra
 * de ferramentas** junta busca, botão "Pesquisa avançada", chips do recorte
 * efetivo (inclusive o padrão implícito de 220 V), contagem e ordenação, e gruda
 * no topo ao rolar. A altura medida da barra vira `--altura-barra-catalogo` no
 * contêiner, para o cabeçalho da tabela (também sticky) parar logo abaixo dela
 * em vez de sumir atrás. O painel (ticket 61) tem duas faixas nomeadas —
 * Aparelho (Marca, Tipo, Função) e Desempenho (Capacidade, Classe, Tensão) —,
 * campos em largura total e rodapé com contagem e "Limpar filtros". No desktop
 * ele é embutido; abaixo de 900 px vira uma sobreposição de tela cheia com foco
 * preso, `Esc`, retorno de foco ao botão e "Ver N resultados" no rodapé.
 *
 * A tabela é um instrumento (ticket 72): identificação, medida e qualificação em
 * hierarquia, números em mono tabular alinhados à direita, Classe como etiqueta
 * com letra e cor e o selo "Análise" na última coluna. Abaixo de 900 px ela
 * **continua tabela**: rola na horizontal dentro do próprio contêiner (focável,
 * `role="region"`), com a seleção e o Modelo fixos à esquerda e o cabeçalho
 * acompanhando a rolagem vertical. Nenhum JS foi acrescentado para isso.
 *
 * A seleção para comparar (tickets 51 e 74) vira um **dock** escuro acima da
 * barra: só existe com ao menos um Aparelho marcado, mostra a contagem `N de 3`,
 * os modelos escolhidos em mono e as ações "Limpar seleção" e "Comparar".
 * Dock e barra formam o mesmo bloco colado no topo — a altura do dock também é
 * medida e publicada (`--altura-dock`), para a barra e o `<thead>` descerem por
 * baixo dele. A vitrine "Aparelhos com análise" (ticket 44, revisto no 52 e no
 * 74) fica fora da tabela e usa a imagem real de abertura da Análise.
 */
export interface PropsConsulta {
  /** Opções dos filtros, derivadas do dataset no build do site. */
  opcoes: OpcoesConsulta;
  /** URL do dataset enxuto de consulta (servido ao lado das páginas). */
  consultaUrl?: string;
  /**
   * Mapa de Aparelhos analisados: aparelhoId → `AnalisadoDaTabela` (título, URL
   * e, quando a Análise tem imagem de abertura, a versão otimizada da imagem —
   * ticket 74).
   */
  analisados?: Map<string, AnalisadoDaTabela>;
}

/** Quantas linhas aparecem por vez na tabela. */
const TAMANHO_PAGINA = 50;

/** As linhas do esqueleto de carregamento — chaves estáveis, sem índice. */
const LINHAS_ESQUELETO = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"];

/** Os campos que a tabela sabe ordenar (as colunas ordenáveis do ticket 31). */
const CAMPOS_ORDENAVEIS = new Set<string>(ORDENS_CONSULTA);

/** O corte do painel sobreposto (ticket 73): o mesmo 900 px da tabela. */
const CONSULTA_CELULAR = "(max-width: 55.999rem)";

/** Os focáveis que entram na armadilha de foco do painel mobile (ticket 73). */
const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Os elementos focáveis e visíveis de um contêiner, na ordem do DOM. */
function focaveisDe(raiz: HTMLElement): HTMLElement[] {
  return [...raiz.querySelectorAll<HTMLElement>(FOCAVEIS)].filter(
    (elemento) => !elemento.closest("[hidden]"),
  );
}

/** Uma marca nos chips: `valor` é o filtro, `rotulo` o que se lê. */
interface OpcaoChip {
  valor: string;
  rotulo: string;
}

/** Uma classe nos chips: além do rótulo, a cor curada (opcional). */
interface OpcaoClasseChip extends OpcaoChip {
  cor?: string;
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
 * Os chips de Classe (ticket 34, compactados no 45): como os demais, mas cada
 * botão carrega `data-classe` para o CSS pintar a classe energética (A–F) e a
 * cor curada. O rótulo visível é só a letra — a legenda do grupo já diz que é
 * Classe —, e o `aria-label` mantém o nome completo para leitores de tela.
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
      {opcoes.map(({ valor, cor }) => (
        <button
          key={valor}
          type="button"
          aria-label={`Classe ${valor}`}
          aria-pressed={estaAtivo(valor)}
          data-classe={valor}
          style={
            cor === undefined
              ? undefined
              : ({ "--cor-classe": cor } as React.CSSProperties)
          }
          onClick={() => selecionar(valor)}
        >
          {valor}
        </button>
      ))}
    </div>
  );
}

/**
 * "Outras marcas" (ticket 61): um campo de busca no lugar do `<select>` com a
 * lista longa. O valor digitado é o próprio filtro `marca` — escrito na URL e
 * aplicado pelo motor na hora, como a busca principal escreve `q`. Quando a
 * marca ativa vem dos chips curados, o campo fica vazio: um valor por vez.
 */
function BuscaMarca({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="campo-busca-marca">
      <span>Outras marcas</span>
      <input
        type="search"
        value={valor}
        placeholder="Digite o nome da marca"
        onChange={(evento) => onChange(evento.target.value)}
      />
    </label>
  );
}

/**
 * Uma seta de ordenação desenhada (ticket 72): chevron de 8 px em traço, no
 * lugar do glifo ↑/↓ — o sistema não usa caractere no papel de ícone. A ativa
 * herda a cor de ação, a outra fica na hairline.
 */
function SetaDeOrdenacao({
  direcao,
  ativa,
}: {
  direcao: "asc" | "desc";
  ativa: boolean;
}) {
  return (
    <span
      className={`seta seta-${direcao}${ativa ? " seta-ativa" : ""}`}
      data-direcao={direcao}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={
            direcao === "asc" ? "M1.5 5.5 4 3l2.5 2.5" : "M1.5 2.5 4 5l2.5-2.5"
          }
        />
      </svg>
    </span>
  );
}

/**
 * Um cabeçalho ordenável (ticket 43): as duas setas ficam **sempre visíveis**,
 * a direção ativa em destaque e a outra apagada — assim se descobre que o
 * cabeçalho é clicável. O botão alterna a direção; `aria-sort` fica no `th`.
 * Desde o ticket 72 o alvo do botão tem 44 px de altura.
 */
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
    <th scope="col" aria-sort={ariaSort} data-campo={campo}>
      <button type="button" onClick={() => alternar(campo)}>
        {rotulo}
        <span className="setas" aria-hidden="true">
          <SetaDeOrdenacao direcao="asc" ativa={direcao === "asc"} />
          <SetaDeOrdenacao direcao="desc" ativa={direcao === "desc"} />
        </span>
      </button>
    </th>
  );
}

/** O filtro desligado pelos "×" dos chips: um parcial por campo. */
const FILTRO_DESLIGADO: Record<CampoResumoFiltro, FiltrosConsulta> = {
  q: { q: undefined },
  marca: { marca: undefined },
  btu: { btu: undefined },
  // A faixa vive em duas chaves: o "×" limpa as duas de uma vez.
  btuFaixa: { btuMin: undefined, btuMax: undefined },
  funcao: { funcao: undefined },
  tensao: { tensao: undefined },
  tipo: { tipo: undefined },
  classe: { classe: undefined },
};

/**
 * O selo "Análise" (ticket 44, movido para a coluna própria no 50): etiqueta de
 * contorno — não a pílula azul dos chips — com link para a Análise e tooltip
 * contendo **apenas** o título. O `aria-describedby` leva o título a leitores de
 * tela.
 */
function SeloAnalise({
  itemId,
  analise,
}: {
  itemId: string;
  analise: { titulo: string; url: string };
}) {
  const tooltipId = `analise-tooltip-${itemId}`;
  return (
    <span className="analisado-selo">
      <a
        href={analise.url}
        className="analisado-link analisado-etiqueta"
        aria-describedby={tooltipId}
      >
        Análise
      </a>
      <span className="analisado-tooltip" role="tooltip" id={tooltipId}>
        {analise.titulo}
      </span>
    </span>
  );
}

/**
 * O esqueleto de linhas do carregamento (ticket 72): a forma da tabela antes de
 * o `consulta.json` chegar, sem texto solto no lugar do conteúdo. É decorativo —
 * o estado real é anunciado pela região viva ao lado.
 */
function EsqueletoTabela() {
  return (
    <div className="consulta-carregando">
      <p className="sr-only" role="status">
        Carregando a base…
      </p>
      <div className="consulta-esqueleto" aria-hidden="true">
        {LINHAS_ESQUELETO.map((linha) => (
          <div className="esqueleto-linha" key={linha}>
            <span className="esqueleto-celula esqueleto-selecao" />
            <span className="esqueleto-celula esqueleto-marca" />
            <span className="esqueleto-celula esqueleto-modelo" />
            <span className="esqueleto-celula esqueleto-numero" />
            <span className="esqueleto-celula esqueleto-numero" />
            <span className="esqueleto-celula esqueleto-numero" />
            <span className="esqueleto-celula esqueleto-classe" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** O `<select>` "Outras…" de um filtro: o resto fora dos chips curados. */
function SelectOutras({
  rotulo,
  valor,
  opcoes,
  onChange,
  vazio,
}: {
  rotulo: string;
  valor: string;
  opcoes: { valor: string; rotulo: string }[];
  onChange: (valor: string) => void;
  /** Rótulo de uma opção vazia **selecionável**, para limpar o filtro aqui mesmo. */
  vazio?: string;
}) {
  return (
    <label className="select-outras">
      <select
        aria-label={rotulo}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
      >
        {vazio === undefined ? (
          <option value="" disabled hidden>
            {rotulo}
          </option>
        ) : (
          <option value="">{vazio}</option>
        )}
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Consulta({
  opcoes,
  consultaUrl = "/consulta.json",
  analisados = new Map(),
}: PropsConsulta) {
  const [motor, setMotor] = useState<MotorConsulta | null>(null);
  /** O dataset como veio do `consulta.json`, para o bloco "Com análise". */
  const [itens, setItens] = useState<ItemConsulta[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  /** Quantas vezes a base já foi pedida: "Tentar de novo" incrementa e refaz o
   *  `fetch` (ticket 72). */
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState<FiltrosConsulta>(FILTROS_PADRAO);
  const [paginacao, setPaginacao] = useState({
    chave: "",
    quantidade: TAMANHO_PAGINA,
  });
  /** O painel "Pesquisa avançada" começa fechado e abre sozinho quando a URL
   *  traz um filtro avançado (ticket 50). */
  const [painelAberto, setPainelAberto] = useState(false);
  /** A seleção para comparar (ticket 51): o mesmo contrato `?ids=` da página
   *  `/comparar/` (ADR-0021), separado dos filtros. */
  const [selecao, setSelecao] = useState<string[]>([]);
  /** Quantos ids da URL caíram na leitura: repetidos, desconhecidos ou além do limite. */
  const [descartadosSelecao, setDescartadosSelecao] = useState(0);
  /** Abaixo de 900 px o painel vira sobreposição modal (ticket 73). */
  const [ehCelular, setEhCelular] = useState(false);
  const raizRef = useRef<HTMLElement>(null);
  const barraRef = useRef<HTMLFormElement>(null);
  const tabelaRef = useRef<HTMLElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLElement>(null);
  const botaoAvancadaRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `tentativa` não é lida no corpo; ela refaz o pedido em "Tentar de novo".
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
          setErro(null);
          setItens(dataset);
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
  }, [consultaUrl, tentativa]);

  // O painel só é modal no celular: aqui o componente sabe em que faixa está,
  // para alternar `role="dialog"`, a armadilha de foco e o retorno de foco.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }
    const consulta = window.matchMedia(CONSULTA_CELULAR);
    const atualizar = () => setEhCelular(consulta.matches);
    atualizar();
    consulta.addEventListener("change", atualizar);
    return () => consulta.removeEventListener("change", atualizar);
  }, []);

  // Atalho "/" para focar o campo de busca (spec da Fase 12: busca com ícone
  // e atalho de teclado). Só foca quando ninguém está digitando num input.
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== "/") {
        return;
      }
      const ativo = document.activeElement;
      if (
        ativo instanceof HTMLInputElement ||
        ativo instanceof HTMLTextAreaElement
      ) {
        return;
      }
      evento.preventDefault();
      buscaRef.current?.focus();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, []);

  // A barra gruda no topo; o cabeçalho da tabela gruda logo abaixo dela. A
  // altura de uma barra que quebra linha não é fixa, então medimos e publicamos
  // em `--altura-barra-catalogo` (ticket 73). Sem `ResizeObserver`, o evento de
  // `resize` cobre a troca de faixa. O dock (ticket 74), quando existe, fica
  // acima da barra e entra na mesma conta: `--altura-dock` desce a barra e o
  // `<thead>` na medida dele.
  const temSelecao = selecao.length > 0;
  // biome-ignore lint/correctness/useExhaustiveDependencies: `temSelecao` não é lida no corpo; ela refaz a medida quando o dock entra ou sai.
  useEffect(() => {
    const barra = barraRef.current;
    const raiz = raizRef.current;
    if (barra === null || raiz === null) {
      return;
    }
    const medir = () => {
      raiz.style.setProperty(
        "--altura-barra-catalogo",
        `${Math.round(barra.getBoundingClientRect().height)}px`,
      );
      raiz.style.setProperty(
        "--altura-dock",
        `${Math.round(dockRef.current?.getBoundingClientRect().height ?? 0)}px`,
      );
    };
    medir();
    window.addEventListener("resize", medir);
    const observador =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(medir);
    observador?.observe(barra);
    if (dockRef.current !== null) {
      observador?.observe(dockRef.current);
    }
    return () => {
      window.removeEventListener("resize", medir);
      observador?.disconnect();
    };
  }, [temSelecao]);

  // `overflow-x: auto` ao lado de `overflow-y: clip` vira um scrollport
  // vertical em navegadores que resolvem `clip` como `hidden` (Firefox e
  // Safari). Neles o `<thead>` sticky mede o `top` a partir do topo da tabela,
  // não da viewport, e aparece entre a 2ª e a 3ª linha. Quando esse é o caso,
  // publicamos em `--deslocamento-cabecalho` a distância que falta até a
  // posição correta (logo abaixo da barra), recalculada na rolagem da página.
  const temTabela = motor !== null;
  // biome-ignore lint/correctness/useExhaustiveDependencies: as refs só existem depois que o motor carrega e o dock entra; as mudanças de `temTabela`/`temSelecao` refazem a medida.
  useEffect(() => {
    const raiz = raizRef.current;
    const tabela = tabelaRef.current;
    if (raiz === null || tabela === null) {
      return;
    }
    const emScrollport = getComputedStyle(tabela).overflowY !== "clip";
    raiz.classList.toggle("consulta-cabecalho-em-scrollport", emScrollport);
    if (!emScrollport) {
      return;
    }
    const atualizar = () => {
      const estilos = getComputedStyle(raiz);
      const altura =
        (Number.parseFloat(estilos.getPropertyValue("--altura-dock")) || 0) +
        (Number.parseFloat(
          estilos.getPropertyValue("--altura-barra-catalogo"),
        ) || 0);
      const deslocamento = altura - tabela.getBoundingClientRect().top;
      raiz.style.setProperty("--deslocamento-cabecalho", `${deslocamento}px`);
    };
    atualizar();
    window.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      window.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
      raiz.classList.remove("consulta-cabecalho-em-scrollport");
    };
  }, [temSelecao, temTabela]);

  // Abrir o painel no celular leva o foco para dentro dele; o foco nunca sai
  // enquanto ele estiver aberto (ticket 73).
  useEffect(() => {
    if (!ehCelular || !painelAberto) {
      return;
    }
    const painel = painelRef.current;
    if (painel === null) {
      return;
    }
    const [primeiro] = focaveisDe(painel);
    (primeiro ?? painel).focus();
  }, [ehCelular, painelAberto]);

  /** Fecha o painel e devolve o foco ao botão que o abriu (ticket 73). */
  const fecharPainel = useCallback(() => {
    setPainelAberto(false);
    if (ehCelular) {
      botaoAvancadaRef.current?.focus();
    }
  }, [ehCelular]);

  /** `Esc` fecha; `Tab` não escapa do painel modal (ticket 73). */
  const aoTeclarNoPainel = useCallback(
    (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        fecharPainel();
        return;
      }
      if (!ehCelular || evento.key !== "Tab") {
        return;
      }
      const painel = painelRef.current;
      if (painel === null) {
        return;
      }
      const focaveis = focaveisDe(painel);
      const primeiro = focaveis[0];
      const ultimo = focaveis.at(-1);
      if (primeiro === undefined || ultimo === undefined) {
        return;
      }
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    },
    [ehCelular, fecharPainel],
  );

  // O teclado é tratado no DOM, e só enquanto a sobreposição está aberta: o
  // painel embutido do desktop não prende foco nem reage a `Esc`.
  useEffect(() => {
    if (!ehCelular || !painelAberto) {
      return;
    }
    const painel = painelRef.current;
    if (painel === null) {
      return;
    }
    painel.addEventListener("keydown", aoTeclarNoPainel);
    return () => painel.removeEventListener("keydown", aoTeclarNoPainel);
  }, [ehCelular, painelAberto, aoTeclarNoPainel]);

  /** "Tentar de novo" volta ao esqueleto e pede a base outra vez. */
  const tentarDeNovo = () => {
    setErro(null);
    setItens(null);
    setMotor(null);
    setTentativa((atual) => atual + 1);
  };

  useEffect(() => {
    const lerDaUrl = () => {
      const busca = new URLSearchParams(window.location.search);
      const proximo = lerEstado(busca);
      setEstado(proximo);
      // O painel abre para não esconder um recorte vindo de um link. O padrão
      // implícito de 220 V não conta: a URL limpa abre com o painel fechado.
      if (temFiltroAvancado(busca)) {
        setPainelAberto(true);
      }
    };
    lerDaUrl();
    window.addEventListener("popstate", lerDaUrl);
    return () => window.removeEventListener("popstate", lerDaUrl);
  }, []);

  // A seleção só pode ser validada depois que o dataset chega: ids fora da base
  // são descartados com aviso (ticket 51), como em `/comparar/`.
  useEffect(() => {
    if (itens === null) {
      return;
    }
    const conhecidos = new Set(itens.map((item) => item.id));
    const lerSelecao = () => {
      const lidos = lerIds(
        new URLSearchParams(window.location.search),
        conhecidos,
      );
      setSelecao(lidos.ids);
      setDescartadosSelecao(lidos.descartados);
    };
    lerSelecao();
    window.addEventListener("popstate", lerSelecao);
    return () => window.removeEventListener("popstate", lerSelecao);
  }, [itens]);

  /**
   * Escreve o estado na URL preservando a seleção: `ids` é um eixo separado dos
   * filtros (ADR-0021), então toda mudança de recorte, busca ou ordenação — e o
   * "Limpar filtros" — carrega a seleção atual junto.
   */
  const escreverUrl = useCallback(
    (filtros: FiltrosConsulta, ids: readonly string[]) => {
      const busca = escreverEstado(filtros);
      // Antes de a base chegar a seleção ainda não foi validada: preserva os ids
      // que já estão na URL em vez de apagar o `?ids=` de um link compartilhado.
      const idsDaSelecao = escreverIds(
        itens === null
          ? lerIdsBrutos(new URLSearchParams(window.location.search))
          : ids,
      ).get("ids");
      if (idsDaSelecao !== null) {
        busca.set("ids", idsDaSelecao);
      }
      const texto = busca.toString();
      const url = `${window.location.pathname}${texto === "" ? "" : `?${texto}`}`;
      window.history.replaceState(null, "", url);
    },
    [itens],
  );

  const atualizar = useCallback(
    (parcial: FiltrosConsulta) => {
      const proximo: FiltrosConsulta = { ...estado, ...parcial };
      // Um campo passado como `undefined` desliga o filtro — o merge sozinho
      // manteria o valor antigo (é assim que o "×" dos chips funciona).
      for (const campo of Object.keys(parcial) as (keyof FiltrosConsulta)[]) {
        if (proximo[campo] === undefined) {
          delete proximo[campo];
        }
      }
      setEstado(proximo);
      escreverUrl(proximo, selecao);
    },
    [estado, selecao, escreverUrl],
  );

  type CampoChip = "marca" | "tipo" | "funcao" | "classe";

  /** Liga ou desliga um chip de texto: ativo limpa, inativo define o valor. */
  const toggleCampo = (campo: CampoChip, valor: string) => {
    atualizar({ [campo]: estado[campo] === valor ? undefined : valor });
  };

  const limpar = useCallback(() => {
    // "Limpar filtros" volta ao recorte padrão (ticket 38) e mantém a ordenação
    // — a ordem escolhida não é um filtro (e o botão só aparece fora do padrão).
    // A seleção para comparar também fica (ticket 51).
    const restante: FiltrosConsulta = {
      ...FILTROS_PADRAO,
      ...(estado.ordem === undefined ? {} : { ordem: estado.ordem }),
      ...(estado.dir === undefined ? {} : { dir: estado.dir }),
    };
    escreverUrl(restante, selecao);
    setEstado(restante);
  }, [estado, selecao, escreverUrl]);

  /** Marca ou desmarca um Aparelho, respeitando o limite de 3. */
  const alternarSelecao = (id: string) => {
    const selecionado = selecao.includes(id);
    if (!selecionado && selecao.length >= MAXIMO_COMPARACAO) {
      return;
    }
    const proximo = selecionado
      ? selecao.filter((atual) => atual !== id)
      : [...selecao, id];
    setSelecao(proximo);
    setDescartadosSelecao(0);
    escreverUrl(estado, proximo);
  };

  /** "Limpar seleção" remove só `ids`; filtros, busca e ordenação continuam. */
  const limparSelecao = () => {
    setSelecao([]);
    setDescartadosSelecao(0);
    escreverUrl(estado, []);
  };

  /** O "×" de um chip: desliga só aquele filtro. Sem a Tensão do padrão, o
   *  estado vazio grava `tensao=` e a URL reconstrói o recorte sem o padrão. */
  const removerFiltro = (campo: CampoResumoFiltro) => {
    atualizar(FILTRO_DESLIGADO[campo]);
  };

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

  // A tabela respeita sempre a ordenação escolhida: os analisados não são mais
  // puxados para o topo (ticket 52), só destacados e com o selo à direita.
  const resultados = resultadosOrdenados;

  // A vitrine "Aparelhos com análise" (ticket 44, revisto no 52) fica **fora**
  // da tabela, acima dela, e não entra na contagem, na paginação nem na
  // ordenação. Ela é sempre renderizada quando há ao menos uma Análise: primeiro
  // os analisados que passam no recorte, depois similares de outras marcas até
  // seis cartões. A ordenação dos similares é a do módulo puro `montarVitrine`.
  const temFiltro = temFiltroAtivo(estado);
  const itensPorId = new Map((itens ?? []).map((item) => [item.id, item]));
  const analisadosVitrine: AnalisadoVitrine[] = [];
  for (const [id, analise] of analisados) {
    const item = itensPorId.get(id);
    if (item !== undefined) {
      analisadosVitrine.push({
        item,
        titulo: analise.titulo,
        url: analise.url,
      });
    }
  }
  const comAnalise = montarVitrine(analisadosVitrine, {
    filtrados,
    recorte: estado,
    marcasConhecidas: opcoes.marcasChip.map((marca) => marca.valor),
  });
  const somenteForaDoRecorte =
    comAnalise.length > 0 && comAnalise.every((cartao) => cartao.foraDoRecorte);
  const rotuloDaMarcaFiltrada =
    estado.marca === undefined
      ? undefined
      : (opcoes.marcasChip.find((marca) => marca.valor === estado.marca)
          ?.rotulo ?? estado.marca);

  // Mudar filtro ou ordem volta para o início; "Mostrar mais" só cresce a
  // quantidade dentro do mesmo estado.
  const chaveEstado = escreverEstado(estado).toString();
  const mostrados =
    paginacao.chave === chaveEstado ? paginacao.quantidade : TAMANHO_PAGINA;
  const exibidos = resultados.slice(0, mostrados);
  /** Quantos Aparelhos ainda cabem em "Mostrar mais" (ticket 72). */
  const restantes = Math.max(0, resultados.length - mostrados);
  /** A coluna "Análise" só existe quando há ao menos uma Análise publicada. */
  const temAnalises = analisados.size > 0;

  // O chip aceso **é** o valor do filtro: o campo de busca "Outras marcas" não
  // repete esse valor e fica vazio enquanto o chip estiver ativo (um valor por
  // vez). Um link antigo pode trazer a Marca oficial (`?marca=SPRINGER MIDEA`),
  // fora dos chips: ela continua valendo e aparece no campo (ADR-0016).
  const valoresChip = new Set(opcoes.marcasChip.map((marca) => marca.valor));
  const marcaDaBusca =
    estado.marca !== undefined && !valoresChip.has(estado.marca)
      ? estado.marca
      : "";
  // Capacidade exata e faixa dividem o mesmo campo (ticket 60): os chips são as
  // seis faixas comerciais e o `<select>` guarda **todas** as capacidades
  // exatas — inclusive as curadas, que antes eram chips.
  const capacidades = [...new Set([...opcoes.btusChip, ...opcoes.btus])].sort(
    (a, b) => a - b,
  );
  const faixas = faixasDeCapacidade(capacidades);
  /** A faixa cujo rótulo corresponde ao `valor` do chip. */
  function faixaPorRotulo(
    faixas: FaixaCapacidade[],
    valor: string,
  ): FaixaCapacidade | undefined {
    return faixas.find((candidata) => rotuloDaFaixa(candidata) === valor);
  }
  const btuDoSelect =
    estado.btu !== undefined && capacidades.includes(estado.btu)
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

  const colunas = colunasDaTabela();
  const resumo = resumoDosFiltros(estado, opcoes);

  // Seleção para comparar (ticket 51): a barra de ação e os checkboxes leem
  // daqui; o link leva para `/comparar/` com a mesma ordem de `?ids=`.
  const selecionados = new Set(selecao);
  const selecaoCheia = selecao.length >= MAXIMO_COMPARACAO;
  const podeComparar = selecao.length >= 2;
  const hrefComparar = podeComparar
    ? `/comparar/?${escreverIds(selecao).toString()}`
    : undefined;

  /** Os nomes que o dock lista, na ordem em que foram escolhidos. */
  const modelosSelecionados = selecao.flatMap((id) => {
    const item = itensPorId.get(id);
    return item === undefined
      ? []
      : [{ id, marca: item.marcaCatalogo, modelo: item.modelo }];
  });

  /** Só o painel do celular é um diálogo modal; no desktop ele é embutido. */
  const atributosDoDialogo = ehCelular
    ? {
        role: "dialog",
        "aria-modal": true,
        "aria-label": "Pesquisa avançada",
      }
    : {};

  return (
    <section className="consulta" ref={raizRef}>
      {/* O dock (ticket 74) fica **acima** da barra e só existe com ao menos um
          modelo marcado: assim ele nunca ocupa espaço nem cobre a linha em
          leitura quando a seleção está vazia. No celular também desaparece. */}
      {temSelecao ? (
        <section
          ref={dockRef}
          className="barra-selecao"
          aria-label="Seleção para comparar"
        >
          <p className="selecao-contagem" role="status">
            {`${selecao.length} de ${MAXIMO_COMPARACAO} modelos selecionados`}
          </p>
          <ul className="selecao-modelos" aria-label="Modelos selecionados">
            {modelosSelecionados.map(({ id, marca, modelo }) => (
              <li key={id}>
                <span className="selecao-modelo" title={`${marca} ${modelo}`}>
                  {modelo}
                </span>
              </li>
            ))}
          </ul>
          {selecaoCheia ? (
            <p className="selecao-limite">
              Limite de {MAXIMO_COMPARACAO} modelos por comparação.
            </p>
          ) : null}
          {descartadosSelecao > 0 ? (
            <p className="selecao-aviso selecao-aviso-dock" role="status">
              {textoDescartes(descartadosSelecao)}
            </p>
          ) : null}
          <div className="barra-selecao-acoes">
            <button
              type="button"
              className="selecao-limpar"
              onClick={limparSelecao}
            >
              Limpar seleção
            </button>
            {hrefComparar === undefined ? (
              <button type="button" className="botao" disabled>
                Comparar
              </button>
            ) : (
              <a className="botao" href={hrefComparar}>
                Comparar
              </a>
            )}
          </div>
        </section>
      ) : null}

      {/* Sem nenhum id válido sobrando, o dock não aparece; o aviso do link
          continua visível por conta própria (ticket 74). */}
      {!temSelecao && descartadosSelecao > 0 ? (
        <p className="selecao-aviso" role="status">
          {textoDescartes(descartadosSelecao)}
        </p>
      ) : null}

      <form
        ref={barraRef}
        className="filtros barra-ferramentas"
        onSubmit={(evento) => evento.preventDefault()}
      >
        <label className="busca">
          <span className="sr-only">Busca</span>
          <span className="icone-busca" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="8" cy="8" r="5.5" />
              <path d="m12 12 3 3" />
            </svg>
          </span>
          <input
            ref={buscaRef}
            type="search"
            value={estado.q ?? ""}
            placeholder="Marca, modelo ou tipo"
            onChange={(evento) =>
              atualizar({ q: evento.target.value || undefined })
            }
          />
        </label>

        <div className="barra-ferramentas-acoes">
          <button
            ref={botaoAvancadaRef}
            type="button"
            className="botao-pesquisa-avancada"
            aria-expanded={painelAberto}
            aria-controls="pesquisa-avancada"
            onClick={() =>
              painelAberto ? fecharPainel() : setPainelAberto(true)
            }
          >
            Pesquisa avançada
          </button>
        </div>

        <fieldset className="resumo-filtros">
          <legend className="sr-only">Filtros ativos</legend>
          {resumo.length === 0 ? (
            <p className="resumo-vazio">Nenhum filtro ativo.</p>
          ) : (
            resumo.map((filtro) => (
              <button
                key={filtro.campo}
                type="button"
                className="chip-filtro"
                data-campo={filtro.campo}
                aria-label={filtro.remover}
                onClick={() => removerFiltro(filtro.campo)}
              >
                {filtro.rotulo}
                <span className="chip-x" aria-hidden="true">
                  ×
                </span>
              </button>
            ))
          )}
        </fieldset>

        <div className="linha-ordenacao">
          {motor === null ? null : (
            <p role="status">
              {resultados.length} aparelho(s) com Dados declarados.
            </p>
          )}
          <label className="campo-ordenar">
            <span className="campo-ordenar-rotulo">Ordenar por</span>
            <select
              value={estado.ordem ?? ""}
              onChange={(evento) => trocarOrdem(evento.target.value)}
            >
              <option value="">
                {estado.q === undefined || estado.q.trim() === ""
                  ? "Padrão (A–Z)"
                  : "Padrão (relevância)"}
              </option>{" "}
              {colunas
                .filter((coluna) => CAMPOS_ORDENAVEIS.has(coluna.campo))
                .map((coluna) => (
                  <option key={coluna.campo} value={coluna.campo}>
                    {coluna.rotulo}
                  </option>
                ))}
            </select>
          </label>

          {/* O cabeçalho da tabela acompanha a rolagem, então a direção também
              precisa de um controle próprio — o seletor ordena, este botão inverte. */}
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
              {estado.dir === "desc" ? "Decrescente" : "Crescente"}
            </button>
          ) : null}
        </div>
      </form>

      <div
        {...atributosDoDialogo}
        ref={painelRef}
        className="filtros-avancados"
        id="pesquisa-avancada"
        hidden={!painelAberto}
        tabIndex={ehCelular ? -1 : undefined}
      >
        <fieldset className="faixa-filtros faixa-aparelho">
          <legend>Aparelho</legend>

          <fieldset className="campo-chips campo-marca">
            <legend>Marca</legend>
            <Chips
              opcoes={opcoes.marcasChip}
              estaAtivo={(valor) => estado.marca === valor}
              selecionar={(valor) => toggleCampo("marca", valor)}
            />
            <BuscaMarca
              valor={marcaDaBusca}
              onChange={(valor) =>
                atualizar({ marca: valor === "" ? undefined : valor })
              }
            />
          </fieldset>

          <fieldset className="campo-chips campo-tipo">
            <legend>Tipo</legend>
            <Chips
              opcoes={tipos}
              estaAtivo={(valor) => estado.tipo === valor}
              selecionar={(valor) => toggleCampo("tipo", valor)}
            />
          </fieldset>

          <fieldset className="campo-chips campo-funcao">
            <legend>Função</legend>
            <Chips
              opcoes={funcoes}
              estaAtivo={(valor) => estado.funcao === valor}
              selecionar={(valor) => toggleCampo("funcao", valor)}
            />
          </fieldset>
        </fieldset>

        <fieldset className="faixa-filtros faixa-desempenho">
          <legend>Desempenho</legend>

          <fieldset className="campo-chips campo-capacidade">
            <legend>Capacidade</legend>
            <Chips
              opcoes={faixas.map((faixa) => ({
                valor: rotuloDaFaixa(faixa),
                rotulo: rotuloDaFaixa(faixa),
              }))}
              estaAtivo={(valor) => {
                const faixa = faixaPorRotulo(faixas, valor);
                return faixa !== undefined && estadoNaFaixa(estado, faixa);
              }}
              selecionar={(valor) => {
                const faixa = faixaPorRotulo(faixas, valor);
                if (faixa === undefined) {
                  return;
                }
                // Faixa e capacidade exata são exclusivas: escolher a faixa
                // (ou desligá-la) sempre limpa `btu`.
                atualizar({
                  btu: undefined,
                  btuMin: estadoNaFaixa(estado, faixa) ? undefined : faixa.min,
                  btuMax: estadoNaFaixa(estado, faixa) ? undefined : faixa.max,
                });
              }}
            />
            <SelectOutras
              rotulo="Capacidade exata"
              vazio="Todas as capacidades"
              valor={btuDoSelect}
              opcoes={capacidades.map((btu) => ({
                valor: String(btu),
                rotulo: btu.toLocaleString("pt-BR"),
              }))}
              onChange={(valor) =>
                // Escolher a exata limpa as duas chaves da faixa.
                atualizar({
                  btu: valor === "" ? undefined : Number(valor),
                  btuMin: undefined,
                  btuMax: undefined,
                })
              }
            />
          </fieldset>

          <fieldset className="campo-chips campo-classe">
            <legend>Classe</legend>
            <ChipsClass
              opcoes={opcoes.classesChip}
              estaAtivo={(valor) => estado.classe === valor}
              selecionar={(valor) => toggleCampo("classe", valor)}
            />
            {classesExtras.length > 0 ? (
              <SelectOutras
                rotulo="Outras classes"
                valor={
                  estado.classe !== undefined &&
                  classesExtras.includes(estado.classe)
                    ? estado.classe
                    : ""
                }
                opcoes={classesExtras.map((classe) => ({
                  valor: classe,
                  rotulo: classe,
                }))}
                onChange={(valor) => atualizar({ classe: valor || undefined })}
              />
            ) : null}
          </fieldset>

          <label className="campo-tensao">
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
        </fieldset>

        <div className="rodape-filtros">
          <p className="contagem-recorte">
            {resultados.length} resultado(s) no recorte
          </p>
          <div className="rodape-filtros-acoes">
            {temFiltro ? (
              <button type="button" className="limpar-filtros" onClick={limpar}>
                Limpar filtros
              </button>
            ) : null}
            {/* No celular o rodapé é a saída do painel sobreposto (ticket 73). */}
            <button
              type="button"
              className="botao aplicar-filtros"
              onClick={fecharPainel}
            >
              Ver {resultados.length} resultado
              {resultados.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      </div>

      {erro !== null ? (
        <div className="consulta-alerta" role="alert">
          <p className="consulta-alerta-texto">
            Não foi possível carregar a base: {erro}.
          </p>
          <button type="button" className="botao" onClick={tentarDeNovo}>
            Tentar de novo
          </button>
        </div>
      ) : (
        <>
          {motor === null ? (
            <EsqueletoTabela />
          ) : (
            <>
              {comAnalise.length === 0 ? null : (
                <section
                  className="com-analise"
                  aria-labelledby="com-analise-titulo"
                >
                  <h2 id="com-analise-titulo">Aparelhos com análise</h2>
                  {somenteForaDoRecorte ? (
                    <p className="com-analise-legenda">
                      {rotuloDaMarcaFiltrada === undefined
                        ? "Nenhum Aparelho analisado passa no recorte atual. Os cartões abaixo são alternativas fora do recorte."
                        : `Nenhum Aparelho analisado da marca ${rotuloDaMarcaFiltrada} no recorte atual. Os cartões abaixo são alternativas fora do recorte.`}
                    </p>
                  ) : null}
                  <ul>
                    {comAnalise.map((cartao) => {
                      const imagem = analisados.get(cartao.item.id)?.imagem;
                      return (
                        <li key={cartao.item.id}>
                          <a className="com-analise-item" href={cartao.url}>
                            {imagem === undefined ? null : (
                              <span className="com-analise-imagem">
                                <img
                                  src={imagem.src}
                                  alt={imagem.alt}
                                  width={160}
                                  height={100}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </span>
                            )}
                            <span className="com-analise-texto">
                              <span className="analisado-etiqueta">
                                Análise
                              </span>
                              <span className="com-analise-marca">
                                {cartao.item.marcaCatalogo}
                              </span>
                              <span className="com-analise-titulo">
                                {cartao.titulo}
                              </span>
                              <span className="com-analise-detalhe">
                                {formatarFaixa(
                                  cartao.item.capacidadesBtu,
                                  " BTU/h",
                                )}
                                {cartao.item.tipo === null ||
                                cartao.item.tipo.trim() === ""
                                  ? ""
                                  : ` · ${cartao.item.tipo}`}
                              </span>
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          )}

          {motor === null ? null : resultados.length === 0 ? (
            <div className="consulta-vazio">
              <p className="consulta-vazio-titulo">
                Nenhum Aparelho neste recorte
              </p>
              <p className="consulta-vazio-frase">
                Nenhum Aparelho com Dados declarados combina com a busca e os
                filtros atuais. Tente uma faixa de capacidade mais ampla ou
                limpe os filtros.
              </p>
              <div className="consulta-vazio-acao">
                <button type="button" className="botao" onClick={limpar}>
                  Limpar filtros
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* A região rolável só é operável pelo teclado se receber foco
                  (WCAG 2.1.1); o `tabIndex` vem por espalhamento porque o
                  `noNoninteractiveTabindex` do Biome não conhece o padrão de
                  scroll region e o marcaria como erro. */}
              <section
                {...{ tabIndex: 0 }}
                ref={tabelaRef}
                className="tabela-rolagem"
                aria-label="Tabela de Aparelhos; role horizontalmente para ver todas as colunas"
              >
                <p className="consulta-rolagem-aviso">
                  Deslize para ver as colunas
                </p>
                <table className="tabela-aparelhos">
                  <caption className="sr-only">
                    Aparelhos de ar-condicionado, uma linha por Aparelho
                  </caption>
                  <colgroup>
                    <col className="col-selecao" />
                    {colunas.map((coluna) => (
                      <col
                        key={coluna.campo}
                        className={`col-${coluna.campo}`}
                      />
                    ))}
                    {temAnalises ? <col className="col-analise" /> : null}
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" data-campo="selecao"></th>
                      {colunas.map((coluna) =>
                        CAMPOS_ORDENAVEIS.has(coluna.campo) ? (
                          <Cabecalho
                            key={coluna.campo}
                            campo={coluna.campo as OrdemConsulta}
                            rotulo={coluna.rotulo}
                            estado={estado}
                            alternar={alternar}
                          />
                        ) : (
                          <th
                            key={coluna.campo}
                            scope="col"
                            data-campo={coluna.campo}
                          >
                            {coluna.rotulo}
                          </th>
                        ),
                      )}
                      {temAnalises ? (
                        <th scope="col" data-campo="analise">
                          Análise
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {exibidos.map((item) => {
                      const analise = analisados.get(item.id);
                      const detalhe = detalheDoAparelho(item);
                      return (
                        <tr
                          key={item.id}
                          className={
                            analise === undefined
                              ? undefined
                              : "linha-analisado"
                          }
                        >
                          <td data-campo="selecao" data-label="Comparar">
                            {/* O selo de 20 px vive dentro de um alvo de 44 px. */}
                            <label className="celula-selecao">
                              <input
                                type="checkbox"
                                checked={selecionados.has(item.id)}
                                disabled={
                                  !selecionados.has(item.id) && selecaoCheia
                                }
                                aria-label={`Comparar ${item.marcaCatalogo} ${item.modelo}`}
                                onChange={() => alternarSelecao(item.id)}
                              />
                            </label>
                          </td>
                          {colunas.map((coluna) => {
                            const campo = coluna.campo;
                            const valor = valorDaColuna(item, campo);
                            const unidade = unidadeDaColuna(campo);
                            const etiqueta =
                              campo === "classe"
                                ? etiquetaDaClasse(item.classes)
                                : null;
                            return (
                              <td
                                key={campo}
                                data-label={coluna.rotulo}
                                data-campo={campo}
                              >
                                {campo === "modelo" ? (
                                  <span className="celula-modelo">
                                    <a href={`/aparelhos/${item.id}`}>
                                      {valor}
                                    </a>
                                    {detalhe === null ? null : (
                                      <span className="modelo-detalhe">
                                        {detalhe}
                                      </span>
                                    )}
                                  </span>
                                ) : campo === "classe" ? (
                                  etiqueta === null ? (
                                    "—"
                                  ) : (
                                    <span
                                      className="etiqueta-classe"
                                      data-classe={etiqueta.pior}
                                      title={etiqueta.explicacao}
                                    >
                                      <span aria-hidden="true">
                                        {etiqueta.texto}
                                      </span>
                                      <span className="apenas-leitor">
                                        {etiqueta.explicacao}
                                      </span>
                                    </span>
                                  )
                                ) : unidade === null || valor === "—" ? (
                                  valor
                                ) : (
                                  <span className="celula-medida">
                                    {valor}{" "}
                                    <span className="celula-unidade">
                                      {unidade}
                                    </span>
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          {temAnalises ? (
                            <td data-campo="analise" data-label="Análise">
                              {analise === undefined ? null : (
                                <SeloAnalise
                                  itemId={item.id}
                                  analise={analise}
                                />
                              )}
                            </td>
                          ) : null}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
              {restantes > 0 ? (
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
                  Mostrar mais{" "}
                  <span className="mostrar-mais-restante">
                    {restantes} restante{restantes === 1 ? "" : "s"}
                  </span>
                </button>
              ) : null}
            </>
          )}
        </>
      )}
    </section>
  );
}
