import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAlert, FieldAlert } from "../context/AlertContext"; 

function Pareceres() {
  const { addAlert } = useAlert();

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

  async function recuperaComponentes() {
    try {
      const resp = await DBCOMPONENTES.get("/");
      const data = resp.data;
      setComponentes(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar componentes:", err);
      addAlert("Erro ao carregar componentes curriculares!", "error");
    }
  }

  async function recuperaDisciplinas() {
    try {
      const resp = await DBDISCIPLINAS.get("/");
      const data = resp.data;
      setDisciplinas(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar disciplinas:", err);
      addAlert("Erro ao carregar disciplinas!", "error");
    }
  }

  async function recuperaProfessores() {
    try {
      const resp = await DBPROF.get("/");
      const data = resp.data;
      setProfessores(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
      addAlert("Erro ao carregar professores!", "error");
    }
  }

  async function adicionaParecer(e) {
    e.preventDefault();

    const confereTexto = texto.trim();

    if (confereTexto.length > 1000) {
      addAlert("O texto do parecer ultrapassa 1000 caracteres.", "warning");
      return;
    }

    // 🔹 Validação manual ANTES de montar o objeto
    if (!componenteSelecionado) {
      addAlert("Preencha o campo: componente", "error", { fieldName: "componente" });
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    if (!professorSelecionado) {
      addAlert("Preencha o campo: professor", "error", { fieldName: "professor" });
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    if (!confereTexto) {
      addAlert("Preencha o campo: texto", "error", { fieldName: "texto" });
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
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
      addAlert("Parecer cadastrado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao criar parecer:", err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar parecer: ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar parecer (erro desconhecido).", "error");
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
        <label>Componente Curricular:</label>
        <br />
        <select
          name="componente"
          value={componenteSelecionado}
          onChange={(e) => setComponenteSelecionado(e.target.value)}
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
        <FieldAlert fieldName="componente" />

        <br /><br />

        <label>Professor:</label>
        <br />
        <select
          name="professor"
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
        <FieldAlert fieldName="professor" />

        <br /><br />

        <label>Texto (máx. 1000 caracteres):</label>
        <br />
        <textarea
          name="texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva o parecer (até 1000 caracteres)"
          rows={6}
          maxLength={1000}
          style={{ width: "100%" }}
        />
        <FieldAlert fieldName="texto" />

        <br /><br />
        <button type="submit">Adicionar Parecer</button>
      </form>

      <br />
      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
}

export default Pareceres;
