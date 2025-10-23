import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import "./professor.css"; // reutilizando o mesmo CSS

function Alunos() {
  const { addAlert } = useAlert();
  const DBALUNOS = axios.create({ baseURL: import.meta.env.VITE_ALUNO_URL });

  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState({ nome: "", matricula: "", email: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", matricula: "", email: "" });

  async function recuperaAlunos() {
    try {
      const response = await DBALUNOS.get("/");
      const data = response.data;
      setAlunos(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar alunos: ", err);
      addAlert("Erro ao carregar lista de alunos!", "error");
    }
  }

  async function adicionaAluno(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      // ALERTS INLINE
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      // TOAST GERAL
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBALUNOS.post("/", form);
      setForm({ nome: "", matricula: "", email: "" });
      recuperaAlunos();
      addAlert("Aluno cadastrado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar aluno (erro desconhecido).", "error");
      }
    }
  }

  async function atualizaAluno(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBALUNOS.put(`/${id}/`, editForm);
      setEditId(null);
      setEditForm({ nome: "", matricula: "", email: "" });
      recuperaAlunos();
      addAlert("Aluno atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao atualizar ${messages}`, "error");
      } else {
        addAlert("Erro ao atualizar aluno (erro desconhecido).", "error");
      }
    }
  }

  function excluirAluno(id) {
    addAlert("Deseja realmente deletar este aluno?", "confirm", {
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
            addAlert("Erro ao deletar aluno (erro desconhecido).", "error");
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
    <div className="professores-container">
      <h1>Gerenciar Alunos</h1>

      <h2>Cadastrar Aluno</h2>
      <form className="professor-form" onSubmit={adicionaAluno}>
        <label>Nome:</label>
        <input
          name="nome"
          type="text"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          placeholder="Digite o nome do aluno"
        />
        <FieldAlert fieldName="nome" />

        <label>Matrícula:</label>
        <input
          name="matricula"
          type="text"
          value={form.matricula}
          onChange={(e) => setForm({ ...form, matricula: e.target.value })}
          placeholder="Somente números"
        />
        <FieldAlert fieldName="matricula" />

        <label>Email institucional:</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="exemplo@restinga.ifrs.edu.br"
        />
        <FieldAlert fieldName="email" />

        <button type="submit">Adicionar Aluno</button>
      </form>

      <div className="professores-list">
        <h3>Alunos Cadastrados</h3>
        <ul>
          {alunos.length === 0 && <li>Nenhum aluno cadastrado.</li>}
          {alunos.map((a) => (
            <li key={a.id}>
              {editId === a.id ? (
                <form id="editForm" onSubmit={(e) => atualizaAluno(e, a.id)}>
                  <input
                    name="nome"
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  />
                  <FieldAlert fieldName="nome" />
                  <input
                    name="matricula"
                    type="text"
                    value={editForm.matricula}
                    onChange={(e) => setEditForm({ ...editForm, matricula: e.target.value })}
                  />
                  <FieldAlert fieldName="matricula" />
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                  <FieldAlert fieldName="email" />
                  <div className="btn-group">
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{a.nome}</strong><br />
                  Matrícula: {a.matricula}<br />
                  Email: {a.email}<br />
                  <div className="professor-buttons">
                    <button
                      onClick={() => {
                        setEditId(a.id);
                        setEditForm({
                          nome: a.nome,
                          matricula: a.matricula,
                          email: a.email,
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => excluirAluno(a.id)}>Deletar</button>
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

export default Alunos;
