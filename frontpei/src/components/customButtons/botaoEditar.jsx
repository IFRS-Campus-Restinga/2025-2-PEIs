// src/components/customButtons/BotaoEditar.jsx
import { useNavigate } from "react-router-dom";
import "../../cssGlobal.css";

export default function BotaoEditar({ id, rotaEdicao, onClickInline }) {
  const navigate = useNavigate();

  const handleEditar = () => {
    if (onClickInline) {
      // Edição inline (na mesma página)
      onClickInline();
    } else if (rotaEdicao) {
      // Redireciona para página externa
      const rotaFinal = rotaEdicao.endsWith("/") 
        ? `${rotaEdicao}${id}` 
        : `${rotaEdicao}/${id}`;
      navigate(rotaFinal);
    }
  };

  return (
    <button className="botao-editar" onClick={handleEditar}>
      Editar
    </button>
  );
}