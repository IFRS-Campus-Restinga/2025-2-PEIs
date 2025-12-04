import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import { validaCampos } from "../utils/validaCampos";
import "../cssGlobal.css";
import { API_ROUTES } from "../configs/apiRoutes";
import { useLocation } from "react-router-dom";

function Pareceres({ usuario }) {
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();
  const location = useLocation();
  const peiIdFromState = location.state?.peiCentralId;
  const [peiCentralId, setPeiCentralId] = useState(
    peiIdFromState || localStorage.getItem("peiCentralId") || null
  );

  function getAuthHeaders() {
    const token = localStorage.getItem("access") || localStorage.getItem("token");
    return token ? { Authorization: `token ${token}` } : {};
  }

  const DBPEI = axios.create({
    baseURL: API_ROUTES.PEI_CENTRAL,
    headers: getAuthHeaders()
  });

  const DBPARECERES = axios.create({
    baseURL: API_ROUTES.PARECER,
    headers: getAuthHeaders()
  });

  const DBCOMPONENTECURRICULAR = axios.create({
    baseURL: API_ROUTES.COMPONENTECURRICULAR,
    headers: getAuthHeaders()
  });

  const DBUSUARIOS = axios.create({
    baseURL: API_ROUTES.USUARIO,
    headers: getAuthHeaders()
  });


  // → Reaplica o token ANTES de cada requisição (agora seguro)
  [DBPEI, DBPARECERES, DBCOMPONENTECURRICULAR, DBUSUARIOS].forEach(api => {
    api.interceptors.request.use(config => {
      config.headers = getAuthHeaders();
      return config;
    });
  });


  // interceptor para garantir q SEMPRE manda o token certo
  [DBPEI, DBPARECERES, DBCOMPONENTECURRICULAR, DBUSUARIOS].forEach(api => {
    api.interceptors.request.use(config => {
      config.headers = { ...config.headers, ...getAuthHeaders() };
      return config;
    });
  });

  const [carregando, setCarregando] = useState(true);
  const [componentes, setComponentes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null); // id do usuário logado
  const [form, setForm] = useState({ disciplina: "", texto: "" });

  useEffect(() => {
    if (peiIdFromState) {
      localStorage.setItem("peiCentralId", peiIdFromState);
      setPeiCentralId(peiIdFromState);
      console.log("PEI Central do state:", peiIdFromState);
    }
  }, [peiIdFromState]);

  useEffect(() => {
    async function carregarDisciplinas() {
      clearAlerts();
      setCarregando(true);

      if (!peiCentralId) {
        addAlert("PEI Central não encontrado.", "error");
        setCarregando(false);
        return;
      }

      try {
        const resPEI = await DBPEI.get(`${peiCentralId}/`);
        const dadosPEI = resPEI.data || {};
        console.log("Dados do PEI Central recebidos:", dadosPEI);

        const disciplinasPEI = (dadosPEI.periodos || [])
          .flatMap(p => p.componentes_curriculares || [])
          .map(c => c.disciplina)
          .filter(Boolean);

        const disciplinasDoProfessor = disciplinasPEI.filter(d => 
          Array.isArray(d.professores) && d.professores.some(p => p.email === usuario.email)
        );

        console.log("Disciplinas do PEI filtradas pelo professor logado:", disciplinasDoProfessor);
        setDisciplinas(disciplinasDoProfessor);

        if (disciplinasDoProfessor.length === 0) {
          addAlert("Nenhuma disciplina encontrada para o professor logado.", "error");
        }

        const resComponentes = await DBCOMPONENTECURRICULAR.get("/");
        const todosComponentes = Array.isArray(resComponentes.data)
          ? resComponentes.data
          : resComponentes.data.results || [];

        console.log("Todos componentes curriculares do sistema:", todosComponentes);

        const componentesFiltrados = todosComponentes.filter(c =>
          disciplinasDoProfessor.some(d => d.nome === c.disciplina?.nome)
        );

        console.log("Componentes filtrados pelas disciplinas do PEI:", componentesFiltrados);
        setComponentes(componentesFiltrados);

        const resUsuarios = await DBUSUARIOS.get("/");
        const todosUsuarios = Array.isArray(resUsuarios.data)
          ? resUsuarios.data
          : resUsuarios.data.results || [];

        console.log("Todos usuários do sistema:", todosUsuarios);

        const usuarioLogado = todosUsuarios.find(u => u.email === usuario.email);
        if (!usuarioLogado) {
          addAlert("Usuário logado não encontrado no sistema.", "error");
        } else {
          console.log("Usuário logado encontrado:", usuarioLogado);
          setUsuarioId(usuarioLogado.id);
        }

      } catch (err) {
        console.error(err);
        addAlert("Erro ao carregar dados do PEI Central, componentes ou usuários.", "error");
      } finally {
        setCarregando(false);
      }
    }

    carregarDisciplinas();
  }, [peiCentralId, usuario.email]);

  async function adicionaParecer(e) {
    e.preventDefault();
    const mensagens = validaCampos({ disciplina: form.disciplina, texto: form.texto }, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      return;
    }

    if (!form.disciplina) {
      addAlert("Selecione uma disciplina.", "error");
      return;
    }

    if (!usuarioId) {
      addAlert("ID do usuário logado não definido.", "error");
      return;
    }

    console.log("Form enviado:", form);
    console.log("Componentes carregados:", componentes);

    const disciplinaSelecionada = disciplinas.find(d => d.id === Number(form.disciplina));
    console.log("Disciplina selecionada no dropdown:", disciplinaSelecionada);

    const componenteSelecionado = componentes.find(
      c => c.disciplina?.nome === disciplinaSelecionada?.nome
    );

    console.log("Componente curricular encontrado:", componenteSelecionado);

    if (!componenteSelecionado) {
      addAlert(`Componente curricular não encontrado para a disciplina: ${disciplinaSelecionada?.nome}`, "error");
      return;
    }

    const novoParecer = {
      professor_id: usuarioId,
      componente_curricular_id: componenteSelecionado.id,
      texto: form.texto
    };

    try {
      await DBPARECERES.post("/", novoParecer);
      setForm({ disciplina: "", texto: "" });
      addAlert("Parecer cadastrado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      addAlert("Erro ao cadastrar parecer.", "error");
    }
  }

  return (
    <div className="container-padrao">
      <h1>Gerenciar Pareceres</h1>
      <hr />
      <h2>Cadastrar Parecer</h2>
      {carregando && <p>Carregando dados do PEI...</p>}

      <form className="form-padrao" onSubmit={adicionaParecer}>
        <label>Disciplina:</label>
        <select
          name="disciplina"
          value={form.disciplina}
          onChange={(e) => { setForm({ ...form, disciplina: e.target.value }); clearFieldAlert("disciplina"); }}
        >
          <option value="">-- selecione --</option>
          {disciplinas.length === 0 && <option disabled>Nenhuma disciplina encontrada</option>}
          {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
        <FieldAlert fieldName="disciplina" />

        <br />
        <label>Texto (máx. 1000 caracteres):</label>
        <textarea
          name="texto"
          value={form.texto}
          onChange={(e) => { setForm({ ...form, texto: e.target.value }); clearFieldAlert("texto"); }}
          rows={6}
          maxLength={1000}
          style={{ width: "100%" }}
        />
        <FieldAlert fieldName="texto" />

        <br />
        <button className="submit-btn">Adicionar Parecer</button>
      </form>
      <br />
      <BotaoVoltar />
    </div>
  );
}

export default Pareceres;
