import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { validaCampos } from "../../utils/validaCampos";
import { FieldAlert, useAlert } from "../../context/AlertContext";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import BuscaAutoComplete from "../../components/BuscaAutoComplete";
import ErrorMessage from "../../components/errorMessage/ErrorMessage";

function CreatePeiCentral() {
  const navigate = useNavigate();

  // CAMPOS SIMPLES
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [adaptacoes, SetAdaptacoes] = useState("");
  const [status_pei, setStatus] = useState("");

  // ALERTAS
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // FORM COMPLEXO
  const [form, setForm] = useState({
    aluno_id: "",
    historico_do_aluno: "",
    dificuldades_apresentadas: "",
  });

  // CONTEXT DO ALERT
  const { addAlert, clearFieldAlert } = useAlert();

  // ERROS DE CAMPOS
  const [erroHistorico, setErroHistorico] = useState("");
  const [erroNecessidadesEducacionaisEspecificas, setErroNecessidadesEducacionaisEspecificas] = useState("");
  const [erroHabilidades, setErroHabilidades] = useState("");

  // CURSOS E ALUNOS
  const [cursos, setCursos] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState("");
  const [alunos, setAlunos] = useState([]);

  // API
  function getAuthHeaders() {
    const token = localStorage.getItem("access") || localStorage.getItem("token");
    return token ? { Authorization: `token ${token}` } : {};
  }
  const DB = axios.create({
    baseURL: API_ROUTES.PEI_CENTRAL,
    headers: getAuthHeaders()
  });

  const DBALUNO = axios.create({
    baseURL: API_ROUTES.ALUNO,
    headers: getAuthHeaders()
  });

  const DBCURSOS = axios.create({
    baseURL: API_ROUTES.CURSOS,
    headers: getAuthHeaders()
  });

  [DB, DBALUNO, DBCURSOS].forEach(api => {
    api.interceptors.request.use(config => {
      config.headers = getAuthHeaders();
      return config;
    });
  });

  // ================== GET CURSOS ==================
  useEffect(() => {
    async function recuperaCursos() {
      try {
        const resp = await DBCURSOS.get("/");
        const data = resp.data;
        setCursos(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Erro ao carregar cursos:", err);
        addAlert("Erro ao carregar cursos!", "error");
      }
    }
    recuperaCursos();
  }, []);


  // ================== GET ALUNOS ==================
  useEffect(() => {
    async function recuperaAlunos() {
      try {
        const resp = await DBALUNO.get("/");
        const data = resp.data;
        setAlunos(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Erro ao carregar alunos:", err);
        addAlert("Erro ao carregar alunos!", "error");
      }
    }
    recuperaAlunos();
  }, []);


  {/*// ================== GET PEI CENTRAL (CASO PRECISE LISTAR) ==================
  useEffect(() => {
    async function recuperaPeiCentral() {
      try {
        const resp = await DB.get("/");
        const data = resp.data;
        console.log("PEI Central carregado:", data);
        // se quiser salvar no state, coloque abaixo:
        // setPeis(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Erro ao carregar PEI Central:", err);
      }
    }
    recuperaPeiCentral();
  }, []);
    */}
    
  // Filtrar alunos por curso
  const alunosFiltrados = cursoSelecionado
    ? alunos.filter((a) => a.curso_obj?.id === Number(cursoSelecionado))
    : alunos;

  async function handleSubmit(e) {
    e.preventDefault();

    const mensagens = validaCampos(form, e.target);

    if (mensagens.length > 0) {
      mensagens.forEach((m) =>
        addAlert(m.message, "error", { fieldName: m.fieldName })
      );
      addAlert("Campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      const resposta = await DB.post("/", {
        historico_do_aluno: form.historico_do_aluno,
        dificuldades_apresentadas: form.dificuldades_apresentadas,
        necessidades_educacionais_especificas,
        habilidades,
        adaptacoes,
        status_pei,
        aluno_id: form.aluno_id,
      });

      console.log("Criado:", resposta.data);
      setSucesso("PEI CENTRAL CRIADO!!!");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => setSucesso(""), 3000);

      setForm({
        aluno_id: "",
        historico_do_aluno: "",
        dificuldades_apresentadas: "",
      });

      setStatus("");

      setTimeout(() => navigate("/peicentral"), 3500);
    } catch (err) {
      console.error(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setErro("ERRO! Não foi possível criar Pei Central");
    }
  }

  return (
    <div className="container-padrao">
      <h1 className="text-xl font-bold mb-4">Criar Pei Central</h1>

      {/* Mensagens */}
      <div>
        {sucesso && <div className="text-sucesso">{sucesso}</div>}
        <ErrorMessage message={erro} align="center" />
        <ErrorMessage message={erroHistorico} align="center" />
        <ErrorMessage message={erroNecessidadesEducacionaisEspecificas} align="center" />
        <ErrorMessage message={erroHabilidades} align="center" />
      </div>

      <form className="form-padrao" onSubmit={handleSubmit}>

        {/* Curso */}
        <label>Selecione o Curso</label>
        <select
          value={cursoSelecionado}
          onChange={(e) => {
            setCursoSelecionado(e.target.value);
            setForm({ ...form, aluno_id: "" });
            clearFieldAlert("aluno_id");
          }}
        >
          <option value="">-- Selecione --</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        {/* Aluno */}
        <div>
          <label className="block mb-1 font-medium">
            Selecione o Aluno (Busca por Nome/Matrícula)
          </label>

          <BuscaAutoComplete
            onSelectAluno={(alunoId) => {
              setForm({ ...form, aluno_id: alunoId });
            }}
            disabled={!cursoSelecionado}
            clearFieldAlert={clearFieldAlert}
            alunosFiltrados={alunosFiltrados}
            cursoSelecionado={cursoSelecionado}
          />

          <FieldAlert fieldName="aluno_id" />
          <input type="hidden" name="aluno_id" value={form.aluno_id} />
        </div>

        {/* HISTÓRICO */}
        <div>
          <label className="block mb-1 font-medium">
            Histórico do Aluno:
            {erroHistorico && <span>⚠️</span>}
          </label>

          <textarea
            rows={6}
            name="historico_do_aluno"
            value={form.historico_do_aluno}
            onChange={(e) => {
              setForm({ ...form, historico_do_aluno: e.target.value });
              if (e.target.value.trim()) clearFieldAlert("historico_do_aluno");
            }}
            placeholder="Digite o histórico completo do aluno"
            required
          />
        </div>

        {/* NECESSIDADES */}
        <div>
          <label className="block mb-1 font-medium">
            Necessidades Educacionais Específicas:
            {erroNecessidadesEducacionaisEspecificas && <span>⚠️</span>}
          </label>

          <textarea
            rows={6}
            value={necessidades_educacionais_especificas}
            onChange={(e) => setNecessidades(e.target.value)}
            placeholder="Ex: Se o estudante é cego, precisa de Braille..."
          />
        </div>

        {/* HABILIDADES */}
        <div>
          <label className="block mb-1 font-medium">
            Habilidades:
            {erroHabilidades && <span>⚠️</span>}
          </label>

          <textarea
            rows={6}
            value={habilidades}
            onChange={(e) => setHabilidades(e.target.value)}
            placeholder="Conhecimentos, habilidades, interesses..."
          />
        </div>

        {/* DIFICULDADES */}
        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>

          <textarea
            rows={6}
            name="dificuldades_apresentadas"
            value={form.dificuldades_apresentadas}
            onChange={(e) => {
              setForm({
                ...form,
                dificuldades_apresentadas: e.target.value,
              });
              if (e.target.value.trim())
                clearFieldAlert("dificuldades_apresentadas");
            }}
            placeholder="Dificuldades Apresentadas"
            required
          />
        </div>

        {/* ADAPTAÇÕES */}
        <div>
          <label className="block mb-1 font-medium">Adaptações:</label>

          <textarea
            rows={6}
            value={adaptacoes}
            onChange={(e) => SetAdaptacoes(e.target.value)}
            placeholder="Adaptações Razoáveis e/ou Acessibilidades Curriculares"
            required
          />
        </div>

        {/* STATUS */}
        <div>
          <label className="block mb-1 font-medium">Status:</label>

          <select
            value={status_pei}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Selecione um status</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM ANDAMENTO">Em Andamento</option>
            <option value="FECHADO">Fechado</option>
          </select>
        </div>

        {/* BOTÃO */}
        <br />
        <button className="submit-btn">Salvar</button>
      </form>

      <BotaoVoltar />
    </div>
  );
}

export default CreatePeiCentral;
