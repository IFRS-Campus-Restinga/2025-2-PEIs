import { useState } from "react";
import api from "../../configs/api";
import { API_ROUTES } from "../../configs/apiRoutes";

export default function RecusaModal({ acompanhamento, fechar, atualizar }) {
  const [motivo, setMotivo] = useState("");

  async function enviarRecusa() {
    if (!motivo.trim()) {
      alert("Por favor, escreva um motivo.");
      return;
    }

    try {
      await api.post(API_ROUTES.RECUSAR_ACOMPANHAMENTO(acompanhamento.id), {
        motivo: motivo,
      });

      atualizar();
      fechar();
    } catch (e) {
      console.error("Erro ao recusar:", e);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Recusar Acompanhamento</h3>

        <p><strong>{acompanhamento.titulo}</strong></p>

        <textarea
          placeholder="Descreva o motivo..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />

        <div className="modal-buttons">
          <button className="btn-cancelar" onClick={fechar}>Cancelar</button>
          <button className="btn-confirmar" onClick={enviarRecusa}>
            Confirmar Recusa
          </button>
        </div>
      </div>
    </div>
  );
}
