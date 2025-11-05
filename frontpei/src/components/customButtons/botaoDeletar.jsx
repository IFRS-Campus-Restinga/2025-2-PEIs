// src/components/customButtons/BotaoDeletar.jsx
import { useState } from "react";
import { useAlert } from "../../context/AlertContext";
import "../../cssGlobal.css";

export default function BotaoDeletar({ id, axiosInstance, onDeletarSucesso }) {
  const { addAlert } = useAlert();
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false); // PROTEÇÃO

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setModalAberto(false);
    setErro("");
    setCarregando(false);
  };

  const handleDeletar = async () => {
    if (carregando) return; // EVITA CLIQUE DUPLO
    setCarregando(true);
    setErro("");

    try {
      await axiosInstance.delete(`/${id}/`);
      fecharModal();
      if (onDeletarSucesso) onDeletarSucesso();
      addAlert("Professor deletado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao deletar:", err);
      setErro("Falha ao deletar. Tente novamente.");

      if (err.response?.data) {
        const data = err.response.data;

        if (data.erro) {
          addAlert(data.erro, "error");
        } else {
          Object.entries(data).forEach(([field, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
            addAlert(`${field}: ${msg}`, "error");
          });

          const summary = Object.entries(data)
            .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
            .join("\n");
          addAlert(`Erro ao deletar:\n${summary}`, "error");
        }
      } else {
        addAlert("Erro ao deletar (servidor indisponível).", "error");
      }
    } finally {
      setCarregando(false); // LIBERA BOTÃO
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
                className="confirmar"
                onClick={handleDeletar}
                disabled={carregando}
                style={{ opacity: carregando ? 0.7 : 1 }}
              >
                {carregando ? "Deletando..." : "Sim"}
              </button>
              <button className="cancelar" onClick={fecharModal} disabled={carregando}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}