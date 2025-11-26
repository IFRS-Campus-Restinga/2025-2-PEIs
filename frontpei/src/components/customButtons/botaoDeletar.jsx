import { useState } from "react";
import { useAlert } from "../../context/AlertContext";
import axios from "axios";
import "../../cssGlobal.css";

export default function BotaoDeletar({ id, axiosInstance, onDeletarSucesso }) {
  const { addAlert } = useAlert();
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setModalAberto(false);
    setErro("");
    setCarregando(false);
  };

  const handleDeletar = async () => {
    if (carregando) return;
    setCarregando(true);
    setErro("");

    try {
      await axios.delete(`${axiosInstance}${id}/`);
      fecharModal();
      if (onDeletarSucesso) onDeletarSucesso();
      addAlert("Registro deletado com sucesso!", "success");
    } catch (err) {
  console.error("Erro ao deletar:", err);

  // Extrai mensagem amigável do backend
  const backendMessage =
    err.response?.data?.erro || 
    err.response?.data?.message || 
    err.response?.data?.detail || 
    (typeof err.response?.data === "string" ? err.response.data : null);

  const mensagemFinal = backendMessage || "Erro ao deletar (servidor indisponível).";

  setErro(mensagemFinal);
  addAlert(mensagemFinal, "error");
} finally {

      setCarregando(false);
    }
  };

  return (
    <>
      <button className="botao-deletar" onClick={abrirModal} disabled={modalAberto}>
        Deletar
      </button>

      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmação de Exclusão</h3>
            <p>Tem certeza que deseja deletar?</p>

            {erro && <p className="erro">{erro}</p>}

            <div className="modal-buttons">
              <button
                className="btn-salvar"
                onClick={handleDeletar}
                disabled={carregando}
                style={{ opacity: carregando ? 0.7 : 1 }}
              >
                {carregando ? "Deletando..." : "Sim"}
              </button>
              <button className="botao-deletar" onClick={fecharModal} disabled={carregando}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
