import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAlert, FieldAlert } from "../context/AlertContext"; 
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import { validaCampos } from "../utils/validaCampos";
import { API_ROUTES } from "../configs/apiRoutes";
import "../cssGlobal.css"
import { API_ROUTES } from "../configs/apiRoutes";

function Pareceres() {
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

<<<<<<< HEAD
  const DBCOMPONENTES = axios.create({ baseURL: API_ROUTES.COMPONENTECURRICULAR });
  const DBDISCIPLINAS = axios.create({ baseURL: API_ROUTES.DISCIPLINAS });
  const DBPROF = axios.create({ baseURL: API_ROUTES.PROFESSOR });
=======
  useEffect(() => {
    // limpa todos os alertas ao entrar na tela
    clearAlerts();
  }, []);

  const DBCOMPONENTES = axios.create({ baseURL: API_ROUTES.COMPONENTECURRICULAR });
  const DBDISCIPLINAS = axios.create({ baseURL: API_ROUTES.DISCIPLINAS });
  const DBPROF = axios.create({ baseURL: API_ROUTES.USUARIO });
>>>>>>> Gabriel
  const DBPARECERES = axios.create({ baseURL: API_ROUTES.PARECER });

  const [componentes, setComponentes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);

  const[form, setForm] = useState({componente: "", professor: "", texto: ""});

  const [componenteSelecionado, setComponenteSelecionado] = useState("");
  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [texto, setTexto] = useState("");

  async function recuperaComponentes() {
    try {
      const resp = await DBCOMPONENTES.get("/");
      const data = resp.data;
      setComponentes(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar componentes curriculares!", "error");
    }
  }

  async function recuperaDisciplinas() {
    try {
      const resp = await DBDISCIPLINAS.get("/");
      const data = resp.data;
      setDisciplinas(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar disciplinas!", "error");
    }
  }

  async function recuperaProfessores() {
    try {
      const resp = await DBPROF.get("/");
      const data = resp.data;
      setProfessores(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar professores!", "error");
    }
  }

  async function adicionaParecer(e) {
    e.preventDefault();

    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      // ALERTAS INLINE por campo
      mensagens.forEach((m) =>
      addAlert(m.message, "error", { fieldName: m.fieldName })
      );

      // ALERTA GLOBAL
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    //const confereTexto = texto.trim();

    /* if (confereTexto.length > 1000) {
      addAlert("O texto do parecer ultrapassa 1000 caracteres.", "warning");
      return;
    }

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
    } */

    const novoParecer = {
        professor_id: Number(form.professor),
        componente_curricular: Number(form.componente),
        texto: form.texto,
    };  

    try {
      await DBPARECERES.post("/", novoParecer);
      setForm({componente: "", professor: "", texto: ""});
      recuperaComponentes();
      recuperaDisciplinas();
      recuperaProfessores();
      addAlert("Parecer cadastrado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        // Exibir mensagens inline (por campo)
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });

        // Montar mensagem amigável pro toast
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1); // Capitaliza o nome do campo
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
          .join("\n");

        addAlert(`Erro ao cadastrar:\n${msg}`, "error", { persist: true });
      } else {
        addAlert("Erro ao cadastrar parecer.", "error", { persist: true });
      }
    }
  }

  useEffect(() => {
    recuperaComponentes();
    recuperaDisciplinas();
    recuperaProfessores();
  }, []);

  return (
    <div className="container-padrao">
      <h1>Gerenciar Pareceres</h1>
      <hr />
      <h2>Cadastrar Parecer</h2>

      <form className="form-padrao" onSubmit={adicionaParecer}>
        <label>Componente Curricular:</label>
        <select
          name="componente"
          value={form.componente}
          onChange={(e) => {
            setForm({ ...form, componente: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("componente");
            }
            }
          }
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

        <br />

        <label>Professor:</label>
        <select
          name="professor"
          value={form.professor}
          onChange={(e) => {
            setForm({ ...form, professor: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("professor");
            }
            }
          }
        >
          <option value="">-- selecione --</option>
          {professores.map((prof) => (
            <option key={prof.id} value={prof.id}>
              {prof.nome ?? prof.full_name ?? `#${prof.id}`}
            </option>
          ))}
        </select>
        <FieldAlert fieldName="professor" />

        <br />

        <label>Texto (máx. 1000 caracteres):</label>
        <textarea
          name="texto"
          value={form.texto}
          onChange={(e) => {
            setForm({ ...form, texto: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("texto");
            }
            }
          }
          placeholder="Escreva o parecer (até 1000 caracteres)"
          rows={6}
          maxLength={1000}
          style={{ width: "100%" }}
        />
        <FieldAlert fieldName="texto" />

        <br />
        <button className="submit-btn">Adicionar Parecer</button>
      </form>

      <br />
      <BotaoVoltar/>
    </div>
  );
}

export default Pareceres;
