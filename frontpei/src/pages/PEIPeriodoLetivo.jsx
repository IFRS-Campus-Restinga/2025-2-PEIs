import { useState, useEffect } from "react";
import axios from "axios";
import "./pei_periodo_letivo.css";

function PEIPeriodoLetivo() {
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });
  const DB_CENTRAL = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  const [dataCriacao, setDataCriacao] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [periodoEscolhido, setPeriodoEscolhido] = useState("");
  const [peiCentralId, setPeiCentralId] = useState("");
  const [peiCentrals, setPeiCentrals] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // 🔹 Buscar PeiCentrals disponíveis no backend
  useEffect(() => {
    async function carregarPeiCentrals() {
      try {
        const res = await DB_CENTRAL.get("/");
        const dados = Array.isArray(res.data)
          ? res.data
          : res.data?.results || []; // compatível com DRF paginado
        setPeiCentrals(dados);
        console.log("PeiCentrals carregados:", dados);
      } catch (err) {
        console.error("Erro ao carregar PEI Central:", err);
        setPeiCentrals([]);
      }
    }
    carregarPeiCentrals();
  }, []);

  // 🔹 Salvar ou atualizar período letivo
  async function salvarPeriodo(event) {
    event.preventDefault();

    if (!dataCriacao || !dataTermino || !periodoEscolhido || !peiCentralId) {
      alert("Preencha todos os campos!");
      return;
    }

    const novo = {
      data_criacao: dataCriacao,
      data_termino: dataTermino,
      periodo: periodoEscolhido,
      pei_central: peiCentralId, // 🔗 ligação do ForeignKey
    };

    try {
      if (editingId) {
        await DB.put(`${editingId}/`, novo);
        alert("Período atualizado com sucesso!");
      } else {
        await DB.post("/", novo);
        alert("Período cadastrado com sucesso!");
      }

      // limpar campos após salvar
      setDataCriacao("");
      setDataTermino("");
      setPeriodoEscolhido("");
      setPeiCentralId("");
      setEditingId(null);
    } catch (err) {
      console.error("Erro ao salvar período:", err);
      if (err.response) {
        console.error("Resposta do backend:", err.response.data);
        alert(`Erro ao salvar período: ${JSON.stringify(err.response.data)}`);
      } else {
        alert("Falha ao salvar período! Verifique o console.");
      }
    }
  }

  // 🔹 Preencher dados ao editar
  function editarPeriodo(p) {
    setDataCriacao(p.data_criacao);
    setDataTermino(p.data_termino);
    setPeriodoEscolhido(p.periodo);
    setPeiCentralId(p.pei_central);
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

        <label>PEI Central:</label>
        <select
          value={peiCentralId}
          onChange={(e) => setPeiCentralId(e.target.value)}
        >
          <option value="">-- selecione --</option>
          {Array.isArray(peiCentrals) &&
            peiCentrals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo || `PEI Central ${p.id}`}
              </option>
            ))}
        </select>

        <button type="submit">
          {editingId ? "Atualizar" : "Adicionar"}
        </button>
      </form>
    </div>
  );
}

export default PEIPeriodoLetivo;
