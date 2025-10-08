import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validaCampos } from "../utils/validaCampos";
import { useAlert } from "../context/AlertContext";
import "./componenteCurricular.css";

function Alunos() {
  const { addAlert } = useAlert();
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
    const mensagens = validaCampos(aluno, event.target);

    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    try {
      await DBALUNOS.post("/", { 
        nome: aluno.nome,
        matricula: aluno.matricula,
        email: aluno.email,  
      });
      await recuperaAlunos();
      setAluno({ nome: "", matricula: "", email: "" });
      addAlert("Componente cadastrado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  }

  async function excluirAluno(id) {
    addAlert("Deseja realmente deletar este Aluno?", "confirm", {
      onConfirm: async () => {
        try {
          await DBALUNOS.delete(`/${id}/`);
          recuperaAlunos();
          addAlert("Aluno deletado com sucesso!", "success");
        } catch (err) {
          console.error(err);
          if (err.response?.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join(" | ");
            addAlert(`Erro ao deletar ${messages}`, "error");
          } else {
            addAlert("Erro ao deletar (erro desconhecido).", "error");
          }
        }
      },
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    }); 
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
          name="nome"
          type="text"
          value={aluno.nome}
          onChange={(e) => setAluno({ ...aluno, nome: e.target.value })}
        />
        <br />

        <label>Matrícula:</label>
        <br />
        <input
          name="matricula"
          type="text"
          value={aluno.matricula}
          onChange={(e) => setAluno({ ...aluno, matricula: e.target.value })}
        />
        <br />

        <label>Email institucional:</label>
        <br />
        <input
          name="email"
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