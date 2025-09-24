import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Alunos() {
  const DBALUNOS = axios.create({baseURL: import.meta.env.VITE_ALUNO_URL});

  const [aluno, setAluno] = useState({
    nome: "",
    matricula: "",
    email: "",
  });

  const [alunosCadastrados, setAlunosCadastrados] = useState([]);

  async function recuperaAlunos() {
    try {
      const response = await DBALUNOS.get("/");
      const data = response.data;
      setAlunosCadastrados(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar alunos: ", err);
    }
  }

  async function adicionaAluno(event) {
    event.preventDefault();
    const { nome, matricula, email } = aluno;

    if (!nome.trim() || !matricula.trim() || !email.trim()) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    try {
      await DBALUNOS.post("/", { nome, matricula, email });
      await recuperaAlunos();
      setAluno({ nome: "", matricula: "", email: "" });
    } catch (err) {
      console.error("Erro ao cadastrar aluno:", err);
      alert("Falha ao cadastrar aluno!");
    }
  }

  async function excluirAluno(id) {
    try {
      await DBALUNOS.delete(`/${id}/`);
      await recuperaAlunos();
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      alert("Falha ao excluir aluno!");
    }
  }

  useEffect(() => {
    recuperaAlunos();
  }, []);

  return (
    <>
      <h1>Gerenciar Alunos</h1>
      <h2>Cadastrar aluno</h2>

      <form onSubmit={adicionaAluno}>
        <label>Nome:</label>
        <br />
        <input
          type="text"
          value={aluno.nome}
          onChange={(e) => setAluno({ ...aluno, nome: e.target.value })}
        />
        <br />

        <label>Matrícula:</label>
        <br />
        <input
          type="text"
          value={aluno.matricula}
          onChange={(e) => setAluno({ ...aluno, matricula: e.target.value })}
        />
        <br />

        <label>Email institucional:</label>
        <br />
        <input
          type="email"
          value={aluno.email}
          onChange={(e) => setAluno({ ...aluno, email: e.target.value })}
        />
        <br />

        <button type="submit">Adicionar aluno</button>
      </form>

      <div>
        <h3>Alunos Cadastrados</h3>
        <ul>
          {alunosCadastrados.map((a) => (
            <li key={a.id}>
              {a.nome} - Matrícula: {a.matricula} - Email: {a.email} {}
              <button onClick={() => excluirAluno(a.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      </div>

      <button>
        <Link to="/">Voltar</Link>
      </button>
    </>
  );
}

export default Alunos;