import { useEffect, useState } from "react";
import api from "../../configs/api";
import { API_ROUTES } from "../../configs/apiRoutes";
import AcompanhamentoCard from "./AcompanhamentoCard";
import RecusaModal from "./RecusaModal";

export default function Acompanhamentos() {
  const [acompanhamentos, setAcompanhamentos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [acompanhamentoSelecionado, setAcompanhamentoSelecionado] = useState(null);

  async function carregarAcompanhamentos() {
    try {
      const resp = await api.get(API_ROUTES.ACOMPANHAMENTOS_MEUS);
      console.log("RETORNO API ACOMPANHAMENTOS:", resp.data);
      setAcompanhamentos(resp.data);
    } catch (e) {
      console.error("Erro ao carregar acompanhamentos:", e);
    }
  }

  useEffect(() => {
    carregarAcompanhamentos();
  }, []);

  function abrirModalRecusa(acompanhamento) {
    setAcompanhamentoSelecionado(acompanhamento);
    setModalOpen(true);
  }

  return (
    <div className="acompanhamentos-container">
      <h2>Meus Acompanhamentos</h2>

      <div className="lista-acompanhamentos">
        {acompanhamentos.map((ac) => (
          <AcompanhamentoCard
            key={ac.id}
            acompanhamento={ac}
            abrirModalRecusa={abrirModalRecusa}
            atualizar={carregarAcompanhamentos}
          />
        ))}
      </div>

      {modalOpen && (
        <RecusaModal
          acompanhamento={acompanhamentoSelecionado}
          fechar={() => setModalOpen(false)}
          atualizar={carregarAcompanhamentos}
        />
      )}
    </div>
  );
}
