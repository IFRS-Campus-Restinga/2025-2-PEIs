import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validaCampos } from "../utils/validaCampos";
import { useAlert } from "../context/AlertContext";

function Pareceres() {
  const { addAlert } = useAlert();

  const DBCOMPONENTES = axios.create({ baseURL: import.meta.env.VITE_COMPONENTE_CURRICULAR });
  const DBDISCIPLINAS = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const DBPROF = axios.create({ baseURL: import.meta.env.VITE_PROFESSORES_URL });
  const DBPARECERES = axios.create({ baseURL: import.meta.env.VITE_PEIPARECERES_URL });

  const [componentes, setComponentes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);

  const [form, setForm] = useState({
    componenteCurricular: "",
    professor: "",
    texto: "",
  });

  // ----------------- Recuperar dados -----------------
  async function recuperaComponentes() {
    try {
      const resp = await DBCOMPONENTES.get("/");
      const data = resp.data;
      if (Array.isArray(data)) setComponentes(data);
      else if (Array.isArray(data.results)) setComponentes(data.results);
      else setComponentes([]);
    } catch (err) {
      console.error("Erro ao buscar componentes:", err);
      addAlert("Erro ao carregar componentes curriculares!", "error");
    }
  }

  async function recuperaDisciplinas() {
    try {
      const resp = await DBDISCIPLINAS.get("/");
      const data = resp.data;
      if (Array.isArray(data)) setDisciplinas(data);
      else if (Array.isArray(data.results)) setDisciplinas(data.results);
      else setDisciplinas([]);
    } catch (err) {
      console.error("Erro ao buscar disciplinas:", err);
      addAlert("Erro ao carregar disciplinas!", "error");
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
      addAlert("Erro ao carregar professores!", "error");
    }
  }

  useEffect(() => {
    recuperaComponentes();
    recuperaDisciplinas();
    recuperaProfessores();
  }, []);

  // ----------------- Adicionar Parecer -----------------
  async function adicionaParecer(event) {
    event.preventDefault();

    // valida campos
    const mensagens = validaCampos(form, event.target);
    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    // cria objeto para envio
    const novoParecer = {
      professor_id: Number(form.professor),
      componente_curricular: Number(form.componenteCurricular),
      texto: form.texto.trim(),
    };

    try {
      await DBPARECERES.post("/", novoParecer);
      setForm({ componenteCurricular: "", professor: "", texto: "" });
      addAlert("Parecer cadastrado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  }

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
          value={form.componenteCurricular}
          onChange={(e) => setForm({ ...form, componenteCurricular: e.target.value })}
        >
          <option value="">-- selecione --</option>
          {componentes.map((c) => {
            const disciplina = disciplinas.find((d) => d.id === c.disciplinas);
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
          value={form.professor}
          onChange={(e) => setForm({ ...form, professor: e.target.value })}
        >
          <option value="">-- selecione --</option>
          {professores.map((prof) => (
            <option key={prof.id} value={prof.id}>
              {prof.nome ?? prof.full_name ?? `#${prof.id}`}
            </option>
          ))}
        </select>

        <br /><br />

        {/* Texto */}
        <label>Texto (máx. 1000 caracteres):</label>
        <br />
        <textarea
          value={form.texto}
          onChange={(e) => setForm({ ...form, texto: e.target.value })}
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
