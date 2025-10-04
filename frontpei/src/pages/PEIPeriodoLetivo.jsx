import { useState } from "react";
import axios from "axios";
import "./pei_periodo_letivo.css";

function PEIPeriodoLetivo() {
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });

  const [dataCriacao, setDataCriacao] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [periodoEscolhido, setPeriodoEscolhido] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function salvarPeriodo(event) {
    event.preventDefault();
    if (!dataCriacao || !dataTermino || !periodoEscolhido) {
      alert("Preencha todos os campos!");
      return;
    }

    const novo = {
      data_criacao: dataCriacao,
      data_termino: dataTermino,
      periodo: periodoEscolhido,
    };

    try {
      if (editingId) await DB.put(`${editingId}/`, novo);
      else await DB.post("/", novo);

      setDataCriacao("");
      setDataTermino("");
      setPeriodoEscolhido("");
      setEditingId(null);
      alert("Período salvo com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar período:", err);
      alert("Falha ao salvar período!");
    }
  }

  function editarPeriodo(p) {
    setDataCriacao(p.data_criacao);
    setDataTermino(p.data_termino);
    setPeriodoEscolhido(p.periodo);
    setEditingId(p.id);
    window.scrollTo(0, 0);
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

        <button type="submit">{editingId ? "Atualizar" : "Adicionar"}</button>
      </form>
    </div>
  );
}

export default PEIPeriodoLetivo;
