<<<<<<< HEAD
// DisciplinaCRUD.jsx
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ErrorMessage from "../../components/errorMessage/ErrorMessage";
import "../Disciplina.css";
<<<<<<< HEAD
import { useAlert } from "../../context/AlertContext";
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

export default function DisciplinasCRUD() {
  const [disciplina, setDisciplina] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
<<<<<<< HEAD
  const [isSubmitting, setIsSubmitting] = useState(false); // ← Flag para evitar múltiplos submits
  const { addAlert } = useAlert();

  const DB = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const navigate = useNavigate();
  const { id } = useParams();
=======

  const DB = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const navigate = useNavigate();
  const { id } = useParams(); // se existir, é edição
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

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
<<<<<<< HEAD
    if (isSubmitting) {
      console.log("Submit já em andamento, ignorando...");
      return;
    }
    setIsSubmitting(true); // ← Bloqueia novos submits
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    setErro("");
    setSucesso("");

    const nomeTrim = disciplina.trim();
<<<<<<< HEAD
=======
    if (!nomeTrim) {
      setErro("Insira um nome válido!");
      return;
    }
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

    try {
      if (id) {
        await DB.put(`/${id}/`, { nome: nomeTrim });
<<<<<<< HEAD
        addAlert("Disciplina atualizada com sucesso!", "success");
      } else {
        await DB.post("/", { nome: nomeTrim });
        setSucesso("Disciplina cadastrada com sucesso!", "success");
      }
      setTimeout(() => navigate("/disciplina"), 1500);
    } catch (err) {
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    } finally {
      setIsSubmitting(false); // ← Sempre libera o submit
=======
        setSucesso("Disciplina atualizada com sucesso!");
      } else {
        await DB.post("/", { nome: nomeTrim });
        setSucesso("Disciplina cadastrada com sucesso!");
      }

      setTimeout(() => navigate("/disciplina"), 1500);
    } catch (err) {
      console.error("Erro ao salvar disciplina:", err);
      setErro("Falha ao salvar disciplina!");
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    }
  }

  return (
    <div className="disciplinas-container">
      <h1>{id ? "Editar Disciplina" : "Cadastrar Disciplina"}</h1>

      <ErrorMessage message={erro} />
      {sucesso && <p style={{ color: "green", textAlign: "center" }}>{sucesso}</p>}

      <form className="cursos-form" onSubmit={salvarDisciplina}>
        <div className="form-group">
          <label htmlFor="nome">Nome da disciplina:</label>
          <input
            id="nome"
            type="text"
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value)}
            placeholder="Digite o nome da disciplina"
          />
        </div>

<<<<<<< HEAD
        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting} // ← Desabilita o botão durante o submit
        >
          {isSubmitting ? "Salvando..." : (id ? "Salvar alterações" : "Adicionar disciplina")}
=======

        <button type="submit" className="submit-btn">
          {id ? "Salvar alterações" : "Adicionar disciplina"}
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
        </button>
      </form>

      <Link to="/disciplina" className="voltar-btn">
        Voltar
      </Link>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
