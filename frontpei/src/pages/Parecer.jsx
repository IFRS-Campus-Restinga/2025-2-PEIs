import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Pareceres() {
  const DBCOMPONENTES = axios.create({ baseURL: import.meta.env.VITE_COMPONENTE_CURRICULAR });
  const DBDISCIPLINAS = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const DBPROF = axios.create({ baseURL: import.meta.env.VITE_PROFESSORES_URL });
  const DBPARECERES = axios.create({ baseURL: import.meta.env.VITE_PEIPARECERES_URL });

  const [componentes, setComponentes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);

  const [componenteSelecionado, setComponenteSelecionado] = useState("");
  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [texto, setTexto] = useState("");

  // Recupera componentes curriculares
  async function recuperaComponentes() {
    try {
      const resp = await DBCOMPONENTES.get("/");
      const data = resp.data;
      if (Array.isArray(data)) setComponentes(data);
      else if (Array.isArray(data.results)) setComponentes(data.results);
      else setComponentes([]);
    } catch (err) {
      console.error("Erro ao buscar componentes:", err);
      alert("Erro ao carregar componentes curriculares!");
    }
  }

  // Recupera disciplinas
  async function recuperaDisciplinas() {
    try {
      const resp = await DBDISCIPLINAS.get("/");
      const data = resp.data;
      if (Array.isArray(data)) setDisciplinas(data);
      else if (Array.isArray(data.results)) setDisciplinas(data.results);
      else setDisciplinas([]);
    } catch (err) {
      console.error("Erro ao buscar disciplinas:", err);
      alert("Erro ao carregar disciplinas!");
    }
  }

  // Recupera professores
  async function recuperaProfessores() {
    try {
      const resp = await DBPROF.get("/");
      const data = resp.data;
      if (Array.isArray(data)) setProfessores(data);
      else if (Array.isArray(data.results)) setProfessores(data.results);
      else setProfessores([]);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
      alert("Erro ao carregar professores!");
    }
  }

  // Adiciona parecer
  async function adicionaParecer(event) {
    event.preventDefault();

    const confereTexto = texto.trim();
    if (!confereTexto) {
      alert("O texto do parecer não pode ficar vazio.");
      return;
    }
    if (confereTexto.length > 1000) {
      alert("O texto do parecer ultrapassa 1000 caracteres.");
      return;
    }
    if (!componenteSelecionado) {
      alert("Selecione um componente curricular.");
      return;
    }
    if (!professorSelecionado) {
      alert("Selecione um professor.");
      return;
    }

    const novoParecer = {
      professor_id: Number(professorSelecionado),
      componente_curricular: Number(componenteSelecionado),
      texto: confereTexto,
    };

    try {
      await DBPARECERES.post("/", novoParecer);
      setTexto("");
      setComponenteSelecionado("");
      setProfessorSelecionado("");
      alert("Parecer cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar parecer:", err);
      if (err.response?.data) {
        alert("Erro ao cadastrar parecer: " + JSON.stringify(err.response.data));
      } else {
        alert("Falha ao cadastrar o parecer!");
      }
    }
  }

  useEffect(() => {
    recuperaComponentes();
    recuperaDisciplinas();
    recuperaProfessores();
  }, []);

  return (
    <div className="parecer-container">
      <h1>Gerenciar Pareceres</h1>
      <hr />
      <h2>Cadastrar Parecer</h2>

      <form onSubmit={adicionaParecer}>
        {/* Componente Curricular */}
        <label>Componente Curricular:</label>
        <br />
        <select
          value={componenteSelecionado}
          onChange={(e) => setComponenteSelecionado(e.target.value)}
        >
          <option value="">-- selecione --</option>
          {componentes.map((c) => {
            const disciplina = disciplinas.find(d => d.id === c.disciplinas);
            return (
              <option key={c.id} value={c.id}>
                {disciplina?.nome ?? "Disciplina não definida"} - {c.objetivos ?? "-"}
              </option>
            );
          })}
        </select>

        <br /><br />

        {/* Professor */}
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

        {/* Texto do Parecer */}
        <label>Texto (máx. 1000 caracteres):</label>
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
        <button type="submit">Adicionar Parecer</button>
      </form>

      <br />
      <button>
        <Link to="/">Voltar</Link>
      </button>
    </div>
  );
}

export default Pareceres;
