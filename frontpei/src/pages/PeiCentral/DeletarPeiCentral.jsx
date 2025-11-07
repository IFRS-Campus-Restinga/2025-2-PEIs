import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import { validaCampos } from "../../utils/validaCampos";
import { useAlert, FieldAlert } from "../../context/AlertContext";

function DeletarPeiCentral() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();
  
    useEffect(() => {
      // limpa todos os alertas ao entrar na tela
      clearAlerts();
    }, []);

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
    <div className="container-padrao">
      <div className="form-padrao">
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
    </div>
  );
}

export default DeletarPeiCentral;
