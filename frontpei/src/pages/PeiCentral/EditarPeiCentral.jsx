import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

function EditarPeiCentral() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAlert, clearFieldAlert } = useAlert();

  const DB = axios.create({ baseURL: API_ROUTES.PEI_CENTRAL });

  const [status_pei, setStatus] = useState("");
  const [historico_do_aluno, setHistorico] = useState("");
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [dificuldades_apresentadas, setDificuldadesApresentadas] = useState("");
  const [adaptacoes, setAdaptacoes] = useState("");
  const [aluno, setAluno] = useState("");

  const [form, setForm] = useState({
    status_pei: "",
    historico_do_aluno: "",
    necessidades_educacionais_especificas: "",
    habilidades:"",
    dificuldades_apresentadas:"",
    adaptacoes:"",
    aluno_id:""
  })
  
  useEffect(() => {
    async function carregarPeiCentral() {
      try {
        const resposta = await DB.get(`/${id}/`);
        const dados = resposta.data;
        setForm({
          status_pei: dados.status_pei || "",
          historico_do_aluno: dados.historico_do_aluno || "",
          necessidades_educacionais_especificas: dados.necessidades_educacionais_especificas || "",
          habilidades: dados.habilidades || "",
          dificuldades_apresentadas: dados.dificuldades_apresentadas || "",
          adaptacoes: dados.adaptacoes || "",
          aluno_id: dados.aluno_id || dados.aluno?.id || ""
        });
        setAluno(dados.aluno);
      } catch (err) {
        console.error("Erro ao carregar PEI Central:", err);
        addAlert("Erro ao carregar PEI Central. Tente novamente.", "error");
      }
    }

    carregarPeiCentral();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    const mensagens = validaCampos(form, e.target);

    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}`}));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DB.put(`/${id}/`, {
        status_pei: form.status_pei,
        historico_do_aluno: form.historico_do_aluno,
        necessidades_educacionais_especificas: form.necessidades_educacionais_especificas,
        habilidades: form.habilidades,
        dificuldades_apresentadas: form.dificuldades_apresentadas,
        adaptacoes: form.adaptacoes,
        aluno_id: typeof form.aluno_id === "object" ? form.aluno_id.id : form.aluno_id,
      });
      addAlert("PEI Central atualizado com sucesso!", "success");
      setTimeout(() => navigate("/peicentral"), 1500);
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        // Exibe mensagens inline específicas do backend
        Object.entries(err.response.data).forEach(([field, msgs]) => {
          addAlert(msgs.join(", "), "error", { fieldName: `edit-${field}` });
        });

        // Monta o texto completo para o toast
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");

        addAlert(`Erro ao editar:\n${messages}`, "error");
      } else {
        addAlert("Erro ao editar (erro desconhecido).", "error");
      }
    }
  }

  return (
    <div className="container-padrao">
      <h1 className="text-xl font-bold mb-4">Editar PEI Central do aluno {aluno.nome}</h1>
      
      <br/>
      <form className="form-padrao" onSubmit={handleSubmit}>  
        
        <div>
          <label className="block mb-1 font-medium">Status:</label>
          <select
            value={form.status_pei}
            name="status_pei"
            onChange={(e) => {
              setForm({ ...form, status_pei: e.target.value })
              if (e.target.value.trim() !== "") {
                clearFieldAlert("status_pei");
              }
            }
            }
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">Selecione</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM ANDAMENTO">Em Andamento</option>
            <option value="FECHADO">Fechado</option>
          </select>
          <FieldAlert fieldName="status_pei" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Histórico do Aluno:</label>
          <textarea
            value={form.historico_do_aluno}
            name="historico_do_aluno"
            onChange={(e) => {
              setForm({ ...form, historico_do_aluno: e.target.value })
              if (e.target.value.trim() !== "") {
                clearFieldAlert("historico_do_aluno");
              }
            }
            }
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
          <FieldAlert fieldName="historico_do_aluno" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Necessidades Educacionais Específicas:</label>
          <textarea
            value={form.necessidades_educacionais_especificas}
            name="necessidades_educacionais_especificas"
            onChange={(e) => {
              setForm({ ...form, necessidades_educacionais_especificas: e.target.value })
              if (e.target.value.trim() !== "") {
                clearFieldAlert("necessidades_educacionais_especificas");
              }
            }}
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
          <FieldAlert fieldName="necessidades_educacionais_especificas" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Habilidades:</label>
          <textarea
            value={form.habilidades}
            name="habilidades"
            onChange={(e) => {
              setForm({ ...form, habilidades: e.target.value })
              if (e.target.value.trim() !== "") {
                clearFieldAlert("habilidades");
              }
            }
            }
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
          <FieldAlert fieldName="habilidades" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>
          <textarea
            value={form.dificuldades_apresentadas}
            name ="dificuldades_apresentadas"
            onChange={(e) => {
              setForm({ ...form, dificuldades_apresentadas: e.target.value })
              if (e.target.value.trim() !== "") {
                clearFieldAlert("dificuldades_apresentadas");
              }
            }
            }
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
          <FieldAlert fieldName="dificuldades_apresentadas" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Adaptações:</label>
          <textarea
            value={form.adaptacoes}
            name="adaptacoes"
            onChange={(e) => {
              setForm({ ...form, adaptacoes: e.target.value })
              if (e.target.value.trim() !== "") {
                clearFieldAlert("adaptacoes");
              }
            }
            }
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
          <FieldAlert fieldName="adaptacoes" />
        </div>

        <div className="posicao-buttons esquerda mt-4">
          <button
            className="btn-salvar"
          >
            Salvar Alterações
          </button>&nbsp;
          <button
            className="btn-cancelar"
            onClick={() => navigate(-1)}
            
          >
            Cancelar
          </button>&nbsp;
         <button
            className="botao-deletar"
            onClick={() => navigate(`/deletar_peicentral/${id}`)}
          >
            Deletar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarPeiCentral;
