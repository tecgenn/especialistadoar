import logoMercadoLivre from "../../assets/lojas/mercado-livre.svg?url";
import {
  dadosDoLogoDaLoja,
  GRADE_DO_LOGO,
  MEDIDAS_DO_LOGO_MERCADO_LIVRE,
  nomeDaLojaParaLeitura,
} from "../../lib/lojas";
import { MARCADOR_OFERTA } from "../../lib/ofertas";

type Props = {
  loja: string;
};

/**
 * Espelho React de `LogoLoja.astro` para a Comparação (tickets 106 e 108): o
 * Mercado Livre entra com o SVG oficial e a Amazon com o desenho de linha.
 */
export default function LogoLojaIsla({ loja }: Props) {
  const dados = dadosDoLogoDaLoja(loja);
  const nome = nomeDaLojaParaLeitura(loja);

  if (dados === null) {
    return <span className="loja-logo-fallback">{nome}</span>;
  }

  if (dados.tipo === "arquivo") {
    return (
      <img
        className="loja-logo"
        src={logoMercadoLivre}
        width={MEDIDAS_DO_LOGO_MERCADO_LIVRE.largura}
        height={MEDIDAS_DO_LOGO_MERCADO_LIVRE.altura}
        alt={dados.nome}
        title={MARCADOR_OFERTA}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <svg
      className="loja-logo"
      viewBox={GRADE_DO_LOGO}
      width={22}
      height={22}
      role="img"
      aria-label={dados.nome}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <title>{MARCADOR_OFERTA}</title>
      {dados.caminhos.map((caminho) => (
        <path d={caminho} key={caminho} />
      ))}
    </svg>
  );
}
