import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ROUTES } from "../../configs/apiRoutes";
import "../peiPeriodoLetivo/pei_periodo_letivo.css";
import { validaCampos } from "../../utils/validaCampos";
import { useAlert, FieldAlert } from "../../context/AlertContext";

function DeletarPeiCentral() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {addAlert} = useAlert();

  const DB = axios.create({ baseURL: API_ROUTES.PEI_CENTRAL });

  async function handleDelete() {
    try {
      await DB.delete(`/${id}/`);
      addAlert("PEI Central deletado com sucesso!", "success");
      navigate("/peicentral"); 
    } catch (error) {
      console.error("Erro ao deletar PEI Central:", error);
      addAlert("Erro ao tentar deletar. Verifique o console.", "error");
    }
  }

  function handleCancel() {
    navigate(-1); 
  }

  return (
    <div className="container">
      <h2>Excluir PEI Central</h2>
      <p>Tem certeza que deseja excluir o registro <b>{id}</b>?</p>

      <button 
        onClick={handleDelete} 
        style={{ backgroundColor: "red", color: "white", marginRight: "10px" }}
      >
        Sim, deletar
      </button>

      <button onClick={handleCancel}>Cancelar</button>
    </div>
  );
}

export default DeletarPeiCentral;
