import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./disciplina.css";

function Disciplinas() {
  const DBDISCIPLINAS = axios.create({baseURL: import.meta.env.VITE_DISCIPLINAS_URL});
  const [disciplina, setDisciplina] = useState("");
  const [disciplinasCadastradas, setDisciplinasCadastradas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");

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

  // Função para deletar disciplina
  async function deletaDisciplina(id) {
    if (!window.confirm("Tem certeza que deseja deletar esta disciplina?")) return;

    try {
      await DBDISCIPLINAS.delete(`/${id}/`);
      await recuperaDisciplinas();
    } catch (err) {
      console.error("Erro ao deletar disciplina:", err);
      alert("Falha ao deletar disciplina!");
    }
  }

  async function atualizaDisciplina(id) {
    const nomeTrim = editNome.trim();
    if (!nomeTrim) return alert("Insira um nome válido!");

    try {
      await DBDISCIPLINAS.put(`/${id}/`, { nome: nomeTrim });
      setEditId(null);
      setEditNome("");
      await recuperaDisciplinas();
    } catch (err) {
      console.error("Erro ao atualizar disciplina:", err);
      alert("Falha ao atualizar disciplina!");
    }
  }


  useEffect(() => {
    recuperaDisciplinas();
  }, []);

  return (
    <div className="disciplinas-container">
      <h1>Gerenciar Disciplinas</h1>

      <h2>Cadastrar disciplina</h2>
      <form className="disciplinas-form" onSubmit={adicionaDisciplina}>
        <label>Nome: </label>
        <br />
        <textarea
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
        />
        <br />
        <button type="submit">Adicionar disciplina</button>
      </form>

      <div className="disciplinas-list">
        <h3>Disciplinas Cadastradas</h3>
        <ul>
          {disciplinasCadastradas.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <>
                  <input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                  />
                  <div className="btn-group">
                    <button onClick={() => atualizaDisciplina(d.id)}>Salvar</button>
                  </div>
                </>
              ) : (
                <>
                  <span>{d.nome}</span>
                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(d.id);
                        setEditNome(d.nome);
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => deletaDisciplina(d.id)}>Deletar</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>


      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
}

export default Disciplinas;
