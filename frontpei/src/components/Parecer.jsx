import { useEffect, useState } from "react";
import axios from "axios";
import PEIPeriodoLetivo from "../components/PEIPeriodoLetivo"; 
import Crud from "../Crud";

function Pareceres() {
  const [voltarCrud, setVoltarCrud] = useState(false);

  const DBPERIODO = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });
  const DBPARECERES = axios.create({ baseURL: import.meta.env.VITE_PEIPARECERES_URL });
  const DBPROF = axios.create({ baseURL: import.meta.env.VITE_PROFESSOR_URL });

  const [periodos, setPeriodos] = useState([]);
  const [professores, setProfessores] = useState([]);

  const [periodoSelecionado, setPeriodoSelecionado] = useState("");
  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [texto, setTexto] = useState("");


  async function recuperaPeriodos() {
    try {
      const resp = await DBPERIODO.get("/"); 
      const data = resp.data;
      if (Array.isArray(data)) setPeriodos(data);
      else if (Array.isArray(data.results)) setPeriodos(data.results);
      else setPeriodos([]);
    } catch (err) {
      console.error("Erro ao buscar periodos:", err);
    }
  }

  async function recuperaProfessores() {
    try {
      const resp = await DBPROF.get("/"); 
      const data = resp.data;
      if (Array.isArray(data)) setProfessores(data);
      else if (Array.isArray(data.results)) setProfessores(data.results);
      else setProfessores([]);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
    }
  }

  async function adicionaParecer(event) {
    event.preventDefault();

    const confereTexto = texto.trim();
    if (confereTexto.length === 0) {
      alert("O texto do parecer não pode ficar vazio.");
      return;
    }
    if (confereTexto.length > 1000) {
      alert("O texto do parecer ultrapassa 1000 caracteres.");
      return;
    }
    if (!periodoSelecionado) {
      alert("Selecione um período letivo.");
      return;
    }
    if (!professorSelecionado) {
      alert("Selecione um professor.");
      return;
    }

    const novo = {
      periodo_letivo: Number(periodoSelecionado),
      professor_id: Number(professorSelecionado),
      texto: confereTexto,
    };

    try {
      await DBPARECERES.post("/", novo); 
      await recuperaPareceres();
      setTexto("");
      setPeriodoSelecionado("");
      setProfessorSelecionado("");
    } catch (err) {
      console.error("Erro ao criar parecer:", err);
      alert("Falha ao cadastrar o parecer!");
    }
  }

  useEffect(() => {
    recuperaPeriodos();
    recuperaProfessores();
  }, []);

  if (voltarCrud) {
    return <Crud />;
  }
  return (
    <>
      <img src="./src/assets/logo.png" style={{ height: 225, width: 150 }} />
      <h1>Gerenciar Pareceres</h1>

      <hr />
      <h2>Cadastrar parecer</h2>
      <form onSubmit={adicionaParecer}>
        <label>Período Letivo:</label>
        <br />
        <select
          value={periodoSelecionado}
          onChange={(e) => setPeriodoSelecionado(e.target.value)}
        >
          <option value="">-- selecione --</option>
          {periodos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.periodo ?? p.nome ?? `#${p.id} - ${p.data_criacao ?? ""}`}
            </option>
          ))}
        </select>

        <br /><br />
        <label>Professor:</label>
        <br />
        <select
          value={professorSelecionado}
          onChange={(e) => setProfessorSelecionado(e.target.value)}
        >
          <option value="">-- selecione --</option>
          {professores.map((prof) => (
            <option key={prof.id} value={prof.id}>
              {prof.nome ?? prof.full_name ?? `#${prof.id}`}
            </option>
          ))}
        </select>

        <br /><br />
        <label>Texto (max 1000):</label>
        <br />
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva o parecer (até 1000 caracteres)"
          rows={6}
          maxLength={1000}
          style={{ width: "100%" }}
        />

        <br /><br />
        <button type="submit">Adicionar parecer</button>
      </form>

      <button onClick={() => setVoltarCrud(true)} style={{ marginTop: "20px" }}>
      Voltar
    </button>
    </>
  );
}

export default Pareceres;
