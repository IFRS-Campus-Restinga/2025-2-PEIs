import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../cssGlobal.css";

function DeletarPeiCentral() {
  const { id } = useParams();
  const navigate = useNavigate();

  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  async function handleDelete() {
    try {
      await DB.delete(`/${id}/`);
      alert("PEI Central deletado com sucesso!");
      navigate("/peicentral"); 
    } catch (error) {
      console.error("Erro ao deletar PEI Central:", error);
      alert("Erro ao tentar deletar. Verifique o console.");
    }
  }

  function handleCancel() {
    navigate(-1); 
  }

  return (
    <div>
      <h2>Excluir PEI Central</h2>
      <p>Tem certeza que deseja excluir o registro <b>{id}</b>?</p>

      <div className="posicao-buttons esquerda">
        <button 
          onClick={handleDelete} 
          className="botao-deletar"
        >
          Sim, deletar
        </button>

        <button className="btn-cancelar" onClick={handleCancel}>Cancelar</button>
      </div>
    </div>
  );
}

export default DeletarPeiCentral;
