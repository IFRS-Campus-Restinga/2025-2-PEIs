import { useState, useEffect } from "react";
import axios from "axios";
import "./pei_periodo_letivo.css";
import { useAlert } from "../context/AlertContext";
import { Link } from "react-router-dom";

function PEIPeriodoLetivo() {
  const { addAlert } = useAlert();

  const DB = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });
  const DB_CENTRAL = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  const [dataCriacao, setDataCriacao] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [periodoEscolhido, setPeriodoEscolhido] = useState("");
  const [peiCentralId, setPeiCentralId] = useState("");
  const [peiCentrals, setPeiCentrals] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    async function carregarPeiCentrals() {
      try {
        const res = await DB_CENTRAL.get("/");
        const dados = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];
        setPeiCentrals(dados);
      } catch (err) {
        console.error("Erro ao carregar PEI Central:", err);
        setPeiCentrals([]);
        addAlert("Erro ao carregar PEIs Centrais!", "error");
      }
    }
    carregarPeiCentrals();
  }, []);

  async function salvarPeriodo(event) {
    event.preventDefault();

    if (!dataCriacao || !dataTermino || !periodoEscolhido || !peiCentralId) {
      addAlert("Preencha todos os campos!", "warning");
      return;
    }

    const novo = {
      data_criacao: dataCriacao,
      data_termino: dataTermino,
      periodo: periodoEscolhido,
      pei_central: peiCentralId,
    };

    try {
      if (editingId) {
        await DB.put(`${editingId}/`, novo);
        addAlert("Período atualizado com sucesso!", "success");
      } else {
        await DB.post("/", novo);
        addAlert("Período cadastrado com sucesso!", "success");
      }

      setDataCriacao("");
      setDataTermino("");
      setPeriodoEscolhido("");
      setPeiCentralId("");
      setEditingId(null);
    } catch (err) {
      console.error("Erro ao salvar período:", err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        addAlert(`Erro ao salvar período: ${messages}`, "error");
      } else {
        addAlert("Falha ao salvar período (erro desconhecido).", "error");
      }
    }
  }

  function editarPeriodo(p) {
    setDataCriacao(p.data_criacao);
    setDataTermino(p.data_termino);
    setPeriodoEscolhido(p.periodo);
    setPeiCentralId(p.pei_central);
    setEditingId(p.id);
    window.scrollTo(0, 0);
    addAlert("Modo de edição ativado para o período selecionado.", "info");
  }

  function excluirPeriodo(id) {
    addAlert("Deseja realmente deletar este período?", "confirm", {
      onConfirm: async () => {
        try {
          await DB.delete(`${id}/`);
          addAlert("Período deletado com sucesso!", "success");
        } catch (err) {
          console.error("Erro ao deletar período:", err);
          if (err.response?.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
              .join(" | ");
            addAlert(`Erro ao deletar período: ${messages}`, "error");
          } else {
            addAlert("Erro ao deletar período (erro desconhecido).", "error");
          }
        }
      },
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    });
  }

  return (
    <div className="container">
      <h1>Gerenciar Períodos Letivos</h1>

      <hr />
      <h2>{editingId ? "Editar Período" : "Cadastrar Período"}</h2>

      <form onSubmit={salvarPeriodo}>
        <label>Data de Criação:</label>
        <input
          type="date"
          value={dataCriacao}
          onChange={(e) => setDataCriacao(e.target.value)}
        />

        <label>Data de Término:</label>
        <input
          type="date"
          value={dataTermino}
          onChange={(e) => setDataTermino(e.target.value)}
        />

        <label>Período:</label>
        <select
          value={periodoEscolhido}
          onChange={(e) => setPeriodoEscolhido(e.target.value)}
        >
          <option value="">-- selecione --</option>
          <option value="BIMESTRE">Bimestre</option>
          <option value="TRIMESTRE">Trimestre</option>
          <option value="SEMESTRE">Semestre</option>
        </select>

        <label>PEI do Aluno:</label>
        <select
          value={peiCentralId}
          onChange={(e) => setPeiCentralId(e.target.value)}
        >
          <option value="">-- selecione --</option>
          {Array.isArray(peiCentrals) &&
            peiCentrals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.aluno.nome || `PEI Central ${p.id}`}
              </option>
            ))}
        </select>

        <button type="submit">
          {editingId ? "Atualizar" : "Adicionar"}
        </button>
      </form>
      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
}

export default PEIPeriodoLetivo;
