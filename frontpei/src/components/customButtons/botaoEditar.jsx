import { useNavigate } from "react-router-dom";
import "../../cssGlobal.css";

export default function BotaoEditar({ id, rotaEdicao }) {
  const navigate = useNavigate();

  const handleEditar = () => {
    // Garante que não tenha barra duplicada
    const rotaFinal = rotaEdicao.endsWith("/") ? `${rotaEdicao}${id}` : `${rotaEdicao}/${id}`;
    navigate(rotaFinal);
  };

  return (
    <button className="botao-editar" onClick={handleEditar}>Editar</button>
  );
}
