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

  const DB = axios.create({
    baseURL: API_ROUTES.PEI_CENTRAL,
    headers: {
      Authorization: `Token ${localStorage.getItem("token") || ""}`
    }
  });

  async function handleDelete() {
    try {
      await DB.delete(`/${id}/`);
      addAlert("PEI Central deletado com sucesso!", "success");
      navigate("/peicentral"); 
    } catch (error) {
      if (err.response?.data) {
        // Exibir mensagens inline (por campo)
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });

        // Montar mensagem amigável pro toast
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1); // Capitaliza o nome do campo
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
          .join("\n");

        addAlert(`Erro ao deletar:\n${msg}`, "error", { persist: true });
      } else {
        addAlert("Erro ao deletar PEI.", "error", { persist: true });
      }
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
