import { useState } from "react";
import "../../cssGlobal.css";

export default function BotaoDeletar({ id, axiosInstance, onDeletarSucesso }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState("");

  const handleDeletar = async () => {
    try {
      await axiosInstance.delete(`/${id}/`);
      setModalAberto(false);
      setErro("");
      if (onDeletarSucesso) onDeletarSucesso();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      setErro("Falha ao deletar!");
    }
  };

  return (
    <>
      <button className="botao-deletar" onClick={() => setModalAberto(true)}>
        Deletar
      </button>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmação</h3>
            <p>Tem certeza que deseja deletar este item?</p>
            {erro && <p className="erro">{erro}</p>}
            <div className="modal-buttons">
              <button className="confirmar" onClick={handleDeletar}>Sim</button>
              <button className="cancelar" onClick={() => setModalAberto(false)}>Não</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
