// DisciplinaCRUD.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../Disciplina.css";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";

export default function DisciplinasCRUD() {
  const [isSubmitting, setIsSubmitting] = useState(false); // ← Flag para evitar múltiplos submits
  const { addAlert, clearFieldAlert } = useAlert();
  const [form, setForm] = useState({
    nome: ""
  })
  const [editForm, setEditForm] = useState({
    nome: ""
  })

  const DB = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const navigate = useNavigate();
  const { id } = useParams();

  // Carrega disciplina para edição
  useEffect(() => {
    if (id) {
      async function carregarDisciplina() {
        try {
          const resposta = await DB.get(`/${id}/`);
          setDisciplina(resposta.data.nome);
        } catch (err) {
          console.error("Erro ao carregar disciplina:", err);
          setErro("Não foi possível carregar a disciplina para edição.");
        }
      }
      carregarDisciplina();
    }
  }, [id]);

  // Salvar (criação ou edição)
  async function salvarDisciplina(event) {
    event.preventDefault();
    const mensagens = validaCampos(form, event.target);

    if (isSubmitting) {
      console.log("Submit já em andamento, ignorando...");
      return;
    }
    setIsSubmitting(true); // ← Bloqueia novos submits

    if (mensagens.length > 0) {
      // ALERTAS INLINE por campo
      mensagens.forEach((m) =>
        addAlert(m.message, "error", { fieldName: m.fieldName })
      );

      // ALERTA GLOBAL
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      if (id) {
        await DB.put(`/${id}/`, { 
          nome: form.nome
        });

        setForm({nome: ""});

        carregarDisciplina();
        addAlert("Disciplina atualizada com sucesso!", "success");
      } else {
        await DB.post("/", { nome: form.nome });
        setSucesso("Disciplina cadastrada com sucesso!", "success");
      }
      setTimeout(() => navigate("/disciplina"), 1500);
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        // Exibe mensagens inline específicas do backend
        Object.entries(err.response.data).forEach(([field, msgs]) => {
          addAlert(msgs.join(", "), "error", { fieldName: field });
        });

        // Monta o texto completo para o toast
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");

        addAlert(`Erro ao cadastrar:\n${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    } finally {
      setIsSubmitting(false); // ← Sempre libera o submit
    }
  }

  return (
    <div className="disciplinas-container">
      <h1>{id ? "Editar Disciplina" : "Cadastrar Disciplina"}</h1>

      {sucesso && <p style={{ color: "green", textAlign: "center" }}>{sucesso}</p>}

      <form className="cursos-form" onSubmit={salvarDisciplina}>
        <div className="form-group">
          <label htmlFor="nome">Nome da disciplina:</label>
          <input
            id="nome"
            type="text"
            name = "nome"
            value={form.nome}
            onChange={(e) => {
              setForm({...form, nome: e.target.value})
              if (e.target.value.trim() !== "") {
                clearFieldAlert("nome");
              }
            }
            }
            placeholder="Digite o nome da disciplina"
          />
          <FieldAlert fieldName="nome" />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting} // ← Desabilita o botão durante o submit
        >
          {isSubmitting ? "Salvando..." : (id ? "Salvar alterações" : "Adicionar disciplina")}
        </button>
      </form>

      <Link to="/disciplina" className="voltar-btn">
        Voltar
      </Link>
    </div>
  );
}