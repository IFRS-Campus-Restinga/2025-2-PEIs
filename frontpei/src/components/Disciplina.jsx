import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Disciplinas() {
  const DBDISCIPLINAS = axios.create({baseURL: import.meta.env.VITE_DISCIPLINAS_URL});
  const [disciplina, setDisciplina] = useState("");
  const [disciplinasCadastradas, setDisciplinasCadastradas] = useState([]);

  async function recuperaDisciplinas() {
    try {
      const response = await DBDISCIPLINAS.get("/");
      const data = response.data;
      setDisciplinasCadastradas(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar disciplinas: ", err);
    }
  }

  async function adicionaDisciplina(event) {
    event.preventDefault();
    const nomeDisciplina = disciplina.trim();

    if (!nomeDisciplina) {
      alert("Por favor, insira um nome válido para a disciplina.");
      return;
    }

    try {
      await DBDISCIPLINAS.post("/", { nome: nomeDisciplina });
      await recuperaDisciplinas();
      setDisciplina("");
    } catch (err) {
      console.error("Erro ao criar disciplina:", err);
      alert("Falha ao cadastrar disciplina!");
    }
  }

  useEffect(() => {
    recuperaDisciplinas();
  }, []);

  return (
    <>
      <h1>Gerenciar Disciplinas</h1>
      <h2>Cadastrar disciplina</h2>

      <form onSubmit={adicionaDisciplina}>
        <label>Nome: </label>
        <br />
        <textarea
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
        />
        <br />
        <button type="submit">Adicionar disciplina</button>
      </form>

      <div>
        <h3>Disciplinas Cadastradas</h3>
        <ul>
          {disciplinasCadastradas.map((d) => (
            <li key={d.id}>{d.nome}</li>
          ))}
        </ul>
      </div>

      <button>
        <Link to="/">Voltar</Link>
      </button>
    </>
  );
}

export default Disciplinas;
