import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import { API_ROUTES } from "../../configs/apiRoutes";
import "../../cssGlobal.css";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import { API_ROUTES } from "../../configs/apiRoutes";

export default function DisciplinasCRUD() {
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

<<<<<<< HEAD
=======
  useEffect(() => {
    // limpa todos os alertas ao entrar na tela
    clearAlerts();
  }, []);
  const [form, setForm] = useState({
    nome: ""
  })

>>>>>>> Gabriel
  const DB = axios.create({ baseURL: API_ROUTES.DISCIPLINAS });
  const navigate = useNavigate();
  const { id } = useParams();

  // Carrega disciplina para edição
  useEffect(() => {
    if (id) {
      async function carregarDisciplina() {
        try {
          const resposta = await DB.get(`/${id}/`);

          setForm({ nome: resposta.data.nome || "" });
        } catch (err) {
          addAlert("Erro ao carregar disciplina.", "error");
        }
      }
      carregarDisciplina();
    }
  }, [id]);

  // Salvar
  const salvarDisciplina = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const mensagens = validaCampos(form, e.target);

    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      setIsSubmitting(false);
      return;
    }

    try {
      if (id) {
        await DB.put(`/${id}/`, { nome: form.nome });
        addAlert("Disciplina atualizada com sucesso!", "success");
      } else {
        await DB.post("/", { nome: form.nome });
        addAlert("Disciplina cadastrada com sucesso!", "success");
        setForm({ nome: "" });
      }
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
        addAlert("Erro ao cadastrar disciplina.", "error", { persist: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-padrao">
      <h1>{id ? "Editar Disciplina" : "Cadastrar Disciplina"}</h1>

      <form className="form-padrao" onSubmit={salvarDisciplina}>
        <div className="form-group">
          <label>Nome da disciplina:</label>
          <input
            type="text"
            name = "nome"
            value={form.nome}
            onChange={(e) => {
              setForm({ nome: e.target.value });
              if (e.target.value.trim()) clearFieldAlert("nome");
            }}
            placeholder="Ex: Matemática"
          />
          <FieldAlert fieldName="nome" />
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : (id ? "Salvar alterações" : "Criar disciplina")}
        </button>
      </form>

      <BotaoVoltar />
    </div>
  );
}