import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./professor.css";

function Professor() {
  const [professores, setProfessores] = useState([]);
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");

  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editMatricula, setEditMatricula] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Base URL definida no .env
  const DBPROFESSORES = axios.create({ baseURL: import.meta.env.VITE_PROFESSORES_URL });

  async function recuperaProfessores() {
    try {
      const response = await DBPROFESSORES.get("");
      const data = response.data;
      setProfessores(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
      alert("Falha ao carregar lista de professores!");
    }
  }

  async function adicionaProfessor(event) {
    event.preventDefault();
    if (!nome.trim() || !matricula.trim() || !email.trim()) {
      return alert("Preencha todos os campos!");
    }

    const novo = {
      nome: nome.trim(),
      matricula: matricula.trim(),
      email: email.trim()
    };

    try {
      await DBPROFESSORES.post("/", novo);
      await recuperaProfessores();
      setNome("");
      setMatricula("");
      setEmail("");
    } catch (err) {
      console.error("Erro ao criar professor:", err);
      if (err.response?.data?.email)
        alert("Erro: " + err.response.data.email);
      else alert("Falha ao cadastrar professor!");
    }
  }

  async function deletaProfessor(id) {
    if (!window.confirm("Tem certeza que deseja deletar este professor?")) return;
    try {
      await DBPROFESSORES.delete(`/${id}/`);
      await recuperaProfessores();
    } catch (err) {
      console.error("Erro ao deletar professor:", err);
      alert("Falha ao deletar professor!");
    }
  }

  async function atualizaProfessor(id) {
    if (!editNome.trim() || !editMatricula.trim() || !editEmail.trim()) {
      return alert("Preencha todos os campos!");
    }

    const atualizado = {
      nome: editNome.trim(),
      matricula: editMatricula.trim(),
      email: editEmail.trim()
    };

    try {
      await DBPROFESSORES.put(`/${id}/`, atualizado);
      setEditId(null);
      setEditNome("");
      setEditMatricula("");
      setEditEmail("");
      await recuperaProfessores();
    } catch (err) {
      console.error("Erro ao atualizar professor:", err);
      alert("Falha ao atualizar professor!");
    }
  }

  useEffect(() => {
    recuperaProfessores();
  }, []);

  return (
    <div className="professores-container">
      <h1>Gerenciar Professores</h1>

      <h2>Cadastrar Professor</h2>
      <form className="professor-form" onSubmit={adicionaProfessor}>
        <label>Nome:</label><br />
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome do professor"
        /><br />

        <label>Matrícula:</label><br />
        <input
          type="text"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          placeholder="Somente números"
        /><br />

        <label>Email institucional:</label><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemplo@restinga.ifrs.edu.br"
        /><br />

        <button type="submit">Adicionar professor</button>
      </form>

      <div className="professores-list">
        <h3>Professores cadastrados</h3>
        <ul>
          {professores.length === 0 && <p>Nenhum professor cadastrado</p>}
          {professores.map((p) => (
            <li key={p.id}>
              {editId === p.id ? (
                <>
                  <input
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                  />
                  <input
                    type="text"
                    value={editMatricula}
                    onChange={(e) => setEditMatricula(e.target.value)}
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                  <button onClick={() => atualizaProfessor(p.id)}>Salvar</button>
                </>
              ) : (
                <>
                  <strong>{p.nome}</strong><br />
                  Matrícula: {p.matricula}<br />
                  Email: {p.email}<br />

                  <div className="professor-buttons">
                    <button
                      onClick={() => {
                        setEditId(p.id);
                        setEditNome(p.nome);
                        setEditMatricula(p.matricula);
                        setEditEmail(p.email);
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => deletaProfessor(p.id)}>Deletar</button>
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

export default Professor;
