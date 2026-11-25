import { nomeDaLojaParaLeitura } from "../../lib/lojas";
import {
  ATRIBUTOS_OFERTA,
  MARCADOR_OFERTA,
  type OfertaExibida,
} from "../../lib/ofertas";
import LogoLojaIsla from "./LogoLojaIsla";

type Props = {
  oferta: OfertaExibida;
};

export default function OfertaCartaoIsla({ oferta }: Props) {
  const nomeDaLoja = nomeDaLojaParaLeitura(oferta.loja);

  return (
    <a
      className="oferta-cartao oferta-cta oferta-cta--com-logo"
      href={oferta.url}
      {...ATRIBUTOS_OFERTA}
      aria-label={`${oferta.rotulo} — ${nomeDaLoja} — ${MARCADOR_OFERTA}`}
    >
      <span className="oferta-cta-conteudo">
        <LogoLojaIsla loja={oferta.loja} />
        <span className="oferta-cta-rotulo">
          {oferta.rotulo} <span aria-hidden="true">→</span>
        </span>
      </span>
    </a>
  );
}
