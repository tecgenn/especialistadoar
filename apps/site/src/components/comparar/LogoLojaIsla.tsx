import { dadosDoLogoDaLoja, nomeDaLojaParaLeitura } from "../../lib/lojas";
import { MARCADOR_OFERTA } from "../../lib/ofertas";
import { URL_DOS_LOGOS_OFICIAIS } from "../urls-dos-logos";

type Props = {
  loja: string;
};

/**
 * Espelho React de `LogoLoja.astro` para a Comparação (tickets 106 e 108):
 * os mesmos SVGs oficiais, nos mesmos cartões de marca.
 */
export default function LogoLojaIsla({ loja }: Props) {
  const dados = dadosDoLogoDaLoja(loja);
  const nome = nomeDaLojaParaLeitura(loja);

  if (dados === null) {
    return <span className="loja-logo-fallback">{nome}</span>;
  }

  return (
    <span className={`loja-marca loja-marca--${dados.chave}`}>
      <img
        className="loja-logo"
        src={URL_DOS_LOGOS_OFICIAIS[dados.chave]}
        width={dados.largura}
        height={dados.altura}
        alt={dados.nome}
        title={MARCADOR_OFERTA}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
