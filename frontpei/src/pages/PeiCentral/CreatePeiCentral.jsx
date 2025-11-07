import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { validaCampos } from "../../utils/validaCampos";
import { FieldAlert, useAlert } from "../../context/AlertContext";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

function CreatePeiCentral() {
  const [historico_do_aluno, setHistorico] = useState("");
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [dificuldades_apresentadas, setDificuldadesApresentadas] = useState("");
  const [adaptacoes, setAdaptacoes] = useState("");
  const [status_pei, setStatus] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState("");

  const [form, setForm] = useState({
    historico_do_aluno: "",
    necessidades_educacionais_especificas: "",
    habilidades: "",
    dificuldades_apresentadas: "",
    adaptacoes: "",
    status_pei: "",
    aluno_id: "",
  });

  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

  useEffect(() => {
    // limpa todos os alertas ao entrar na tela
    clearAlerts();
  }, []);
  const navigate = useNavigate();

  const DB = axios.create({ baseURL: API_ROUTES.PEI_CENTRAL });
  const DBALUNO = axios.create({ baseURL: API_ROUTES.ALUNO });

  // Carrega alunos na abertura da tela
  useEffect(() => {
    async function recuperaAlunos() {
      try {
        const resp = await DBALUNO.get("/");
        const data = resp.data;
        setAlunos(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        addAlert("Erro ao carregar alunos!", "error");
      }
    }
    recuperaAlunos();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const mensagens = validaCampos(form, e.target);
    
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Campos obrigatórios não preenchidos.", "warning");
      return;
    }

    /*const camposParaValidar = {
      aluno_id: alunoSelecionado,
      historico_do_aluno,
      necessidades_educacionais_especificas,
      habilidades,
      dificuldades_apresentadas,
      adaptacoes,
      status_pei,
    }; */

    try {
      const resposta = await DB.post("/", {
        historico_do_aluno: form.historico_do_aluno,
        necessidades_educacionais_especificas: form.necessidades_educacionais_especificas,
        habilidades: form.habilidades,
        dificuldades_apresentadas: form.dificuldades_apresentadas,
        adaptacoes: form.adaptacoes,
        status_pei: form.status_pei,
        aluno_id: Number(form.aluno_id)
      });
      addAlert("PEI Central criado com sucesso!", "success");

      // limpa campos
      setForm({
        historico_do_aluno: "",
        necessidades_educacionais_especificas: "",
        habilidades: "",
        dificuldades_apresentadas: "",
        adaptacoes: "",
        status_pei: "",
        aluno_id: "",
      })

      // redireciona após tempo de mensagem
      setTimeout(() => navigate("/peicentral"), 1500);
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
          .join("\n");
        addAlert(`Erro ao cadastrar:\n${msg}`, "error");
      } else {
        addAlert("Erro ao cadastrar componente.", "error");
      }
    }
  }

  return (
    <div className="container">
      <h1 className="text-xl font-bold mb-4">Criar PEI Central</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label>Selecione o Aluno</label>
        <br />
        <select
          value={form.aluno_id}
          name="aluno_id"
          onChange={(e) =>  {
            setForm({ ...form, aluno_id: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("aluno_id");
            }
            }
        >
          <option value="">-- Selecione --</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
                {a.nome ?? `#${a.id}`} - {a.matricula}
            </option>
          ))}
        </select>
        <FieldAlert fieldName="aluno_id" />
        
        {/* Histórico do aluno */}
        <div>
          <label className="block mb-1 font-medium">Histórico do Aluno:</label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            name= "historico_do_aluno"
            value={form.historico_do_aluno}
            onChange={(e) => {
            setForm({ ...form, historico_do_aluno: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("historico_do_aluno");
            }
            }
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Digite o histórico completo do aluno"
            //required
          />
          <FieldAlert fieldName="historico_do_aluno" />
          
        </div>

        {/* Necessidades */}
        <div>
          <label className="block mb-1 font-medium">
            Necessidades Educacionais Específicas:
          </label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            name="necessidades_educacionais_especificas"
            value={form.necessidades_educacionais_especificas}
            onChange={(e) => {
            setForm({ ...form, necessidades_educacionais_especificas: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("necessidades_educacionais_especificas");
            }
            }
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Ex: Se o estudante é cego, precisa de Braille, leitor de telas..."
            //required
          />
          <FieldAlert fieldName="necessidades_educacionais_especificas" />
        </div>

        {/* Habilidades */}
        <div>
          <label className="block mb-1 font-medium">Habilidades:</label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            name="habilidades"
            value={form.habilidades}
            onChange={(e) => {
            setForm({ ...form, habilidades: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("habilidades");
            }
            }
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Conhecimentos, habilidades, interesses, afinidades..."
            //required
          />
          <FieldAlert fieldName="habilidades" />
        </div>

        {/* Dificuldades apresentadas */}
        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            name = "dificuldades_apresentadas"
            value={form.dificuldades_apresentadas}
            onChange={(e) => {
            setForm({ ...form, dificuldades_apresentadas: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("dificuldades_apresentadas");
            }
            }
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Dificuldades apresentadas pelo aluno"
            //required
          />
          <FieldAlert fieldName="dificuldades_apresentadas" />
        </div>

        {/* Adaptações */}
        <div>
          <label className="block mb-1 font-medium">Adaptações:</label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            name="adaptacoes"
            value={form.adaptacoes}
            onChange={(e) => {
            setForm({ ...form, adaptacoes: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("adaptacoes");
            }
            }
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Adaptações razoáveis e/ou acessibilidades curriculares"
            //required
          />
          <FieldAlert fieldName="adaptacoes" />
        </div>

        {/* Status ENUM */}
        <div>
          <label className="block mb-1 font-medium">Status:</label>
          <select
            value={form.status_pei}
            name="status_pei"
            onChange={(e) => {
            setForm({ ...form, status_pei: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("status_pei");
            }
            }
            className="border px-2 py-1 rounded w-full"
            //required
          >
            <option value="">-- Selecione --</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM ANDAMENTO">Em Andamento</option>
            <option value="FECHADO">Fechado</option>
          </select>
          <FieldAlert fieldName="status_pei" />
        </div>
          <br />
          
        {/* Botão salvar */}
        <button
          className="submit-btn"
        >
          Salvar
        </button>
      </form>

      <BotaoVoltar/>
    </div>
  );
}

export default CreatePeiCentral;
