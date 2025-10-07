import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ErrorMessage from "../../components/errorMessage/ErrorMessage";
import "../Disciplina.css";

export default function DisciplinasCRUD() {
  const [disciplina, setDisciplina] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const DB = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const navigate = useNavigate();
  const { id } = useParams(); // se existir, é edição

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
    setErro("");
    setSucesso("");

    const nomeTrim = disciplina.trim();
    if (!nomeTrim) {
      setErro("Insira um nome válido!");
      return;
    }

    try {
      if (id) {
        await DB.put(`/${id}/`, { nome: nomeTrim });
        setSucesso("Disciplina atualizada com sucesso!");
      } else {
        await DB.post("/", { nome: nomeTrim });
        setSucesso("Disciplina cadastrada com sucesso!");
      }

      setTimeout(() => navigate("/disciplina"), 1500);
    } catch (err) {
      console.error("Erro ao salvar disciplina:", err);
      setErro("Falha ao salvar disciplina!");
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


        <button type="submit" className="submit-btn">
          {id ? "Salvar alterações" : "Adicionar disciplina"}
        </button>
      </form>

      <Link to="/disciplina" className="voltar-btn">
        Voltar
      </Link>
    </div>
  );
}
