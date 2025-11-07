import { useState, useEffect } from "react"; 
import { useNavigate, useParams, Link } from "react-router-dom"; 
import axios from "axios"; 
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import { API_ROUTES } from "../../configs/apiRoutes";

function CursoCRUD() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

    useEffect(() => {
      // limpa todos os alertas ao entrar na tela
      clearAlerts();
    }, []);

  // Instâncias da API
  const DBCURSOS = axios.create({ baseURL: API_ROUTES.CURSOS });
  const DBDISCIPLINAS = axios.create({ baseURL: API_ROUTES.DISCIPLINAS });
  const DBCOORDENADOR = axios.create({ baseURL: API_ROUTES.COORDENADORCURSO });

  // Estados principais
  const [form, setForm] = useState({
    nome: "",
    nivel: "Não informado",
    disciplinas: [],
    coordenador: "",
    arquivo: null,
  });

  const [disciplinas, setDisciplinas] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);

  // Opções fixas de nível
  const niveis = [
    { label: "Superior", value: "Superior" },
    { label: "Ensino Médio", value: "Ensino Médio" },
    { label: "Não informado", value: "Não informado" },
  ];

  // Busca disciplinas e coordenadores
  const carregarDadosIniciais = async () => {
    try {
      const [resDisciplinas, resCoords] = await Promise.all([
        DBDISCIPLINAS.get("/"),
        DBCOORDENADOR.get("/"),
      ]);

      setDisciplinas(Array.isArray(resDisciplinas.data) ? resDisciplinas.data : resDisciplinas.data.results || []);
      setCoordenadores(Array.isArray(resCoords.data) ? resCoords.data : resCoords.data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar dados iniciais.", "error");
    }
  };

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Carrega curso em modo edição
  useEffect(() => {
    if (!id) return;

    const carregarCurso = async () => {
      try {
        const res = await DBCURSOS.get(`/${id}/`);
        const data = res.data;
        setForm({
          nome: data.nome || "",
          nivel: data.nivel || "Não informado",
          disciplinas: data.disciplinas ? data.disciplinas.map((d) => d.id) : [],
          coordenador: data.coordenador?.id || "",
          arquivo: null,
        });
      } catch (err) {
        addAlert("Erro ao carregar o curso.", "error");
      }
    };

    carregarCurso();
  }, [id]);

  // Monta o FormData quando necessário
  const montaFormData = (dados) => {
    const fd = new FormData();
    fd.append("nome", dados.nome);
    fd.append("nivel", dados.nivel);
    fd.append("coordenador_id", dados.coordenador || "");
    dados.disciplinas.forEach((d) => fd.append("disciplinas_ids", d));
    if (dados.arquivo) fd.append("arquivo_upload", dados.arquivo);
    return fd;
  };

  // Salva (cria ou edita)
  const salvarCurso = async (e) => {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);

    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      const formData = montaFormData(form);
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (id) {
        await DBCURSOS.put(`/${id}/`, formData, config);
        addAlert("Curso atualizado com sucesso!", "success");
      } else {
        await DBCURSOS.post("/", formData, config);
        addAlert("Curso cadastrado com sucesso!", "success");
      }

      setTimeout(() => navigate("/curso"), 1500);
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
        addAlert("Erro ao cadastrar componente.", "error", { persist: true });
      }
    }
  };

  return (
    <div className="container-padrao">
      <h1>{id ? "Editar Curso" : "Cadastrar Curso"}</h1>

      <form className="form-padrao" onSubmit={salvarCurso}>
        <label>Nome do curso:</label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={(e) => {
            setForm({ ...form, nome: e.target.value });
            if (e.target.value.trim() !== "") clearFieldAlert("nome");
          }}
          placeholder="Digite o nome do curso"
        />
        <FieldAlert fieldName="nome" />

        <label>Disciplinas:</label>
        <div className="disciplinas-checkboxes">
          {disciplinas.map((d) => (
            <label key={d.id} className="checkbox-item">
              <input
                type="checkbox"
                name="disciplinas"
                value={d.id}
                checked={form.disciplinas.includes(d.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    disciplinas: prev.disciplinas.includes(val)
                      ? prev.disciplinas.filter((x) => x !== val)
                      : [...prev.disciplinas, val],
                  }));
                  clearFieldAlert("disciplinas");
                }}
              />
              <span>{d.nome}</span>
            </label>
          ))}
        </div>
        <FieldAlert fieldName="disciplinas" />

        <label>Nível:</label>
        <select
          name="nivel"
          value={form.nivel}
          onChange={(e) => {
            setForm({ ...form, nivel: e.target.value });
            clearFieldAlert("nivel");
          }}
        >
          {niveis.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
        <FieldAlert fieldName="nivel" />

        <label>Coordenador:</label>
        <select
          name="coordenador"
          value={form.coordenador}
          onChange={(e) => {
            setForm({ ...form, coordenador: e.target.value });
            clearFieldAlert("coordenador");
          }}
        >
          <option value="">Não informado</option>
          {coordenadores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <FieldAlert fieldName="coordenador" />

        <label>Arquivo do curso (opcional):</label>
        <input
          type="file"
          onChange={(e) => {
            setForm({ ...form, arquivo: e.target.files[0] });
            clearFieldAlert("arquivo");
          }}
        />

        <button type="submit" className="submit-btn">
          {id ? "Salvar Alterações" : "Adicionar Curso"}
        </button>
      </form>

      <BotaoVoltar/>
    </div>
  );
}

export default CursoCRUD;
