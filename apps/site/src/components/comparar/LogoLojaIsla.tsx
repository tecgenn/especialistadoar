import {
  dadosDoLogoDaLoja,
  GRADE_DO_LOGO,
  nomeDaLojaParaLeitura,
} from "../../lib/lojas";

type Props = {
  loja: string;
};

export default function LogoLojaIsla({ loja }: Props) {
  const dados = dadosDoLogoDaLoja(loja);
  const nome = nomeDaLojaParaLeitura(loja);

  if (dados === null) {
    return <span className="loja-logo-fallback">{nome}</span>;
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
      {dados.caminhos.map((caminho) => (
        <path d={caminho} key={caminho} />
      ))}
    </svg>
  );
}
