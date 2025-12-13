import api from "../../configs/api";
import { API_ROUTES } from "../../configs/apiRoutes";

export default function AcompanhamentoCard({ acompanhamento, abrirModalRecusa, atualizar }) {

  async function aceitarAcompanhamento() {
    try {
      await api.post(API_ROUTES.ACEITAR_ACOMPANHAMENTO(acompanhamento.id));
      atualizar();
    } catch (e) {
      console.error("Erro ao aceitar:", e);
    }
  }

  return (
    <div className="acompanhamento-card">
      <h3>{acompanhamento.titulo}</h3>
      <p>{acompanhamento.descricao}</p>

      <p className="status">
        Status: <strong>{acompanhamento.status}</strong>
      </p>

      {acompanhamento.status === "pendente" && (
        <div className="botoes-card">
          <button
            className="btn-aceitar"
            onClick={aceitarAcompanhamento}
          >
            Aceitar
          </button>

          <button
            className="btn-recusar"
            onClick={() => abrirModalRecusa(acompanhamento)}
          >
            Recusar
          </button>
        </div>
      )}
    </div>
  );
}
