import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import "./professor.css"; // reutilizando o mesmo CSS

function Alunos() {
  const { addAlert, clearFieldAlert } = useAlert();
  const DBALUNOS = axios.create({ baseURL: import.meta.env.VITE_ALUNO_URL });

  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState({ nome: "", matricula: "", email: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", matricula: "", email: "" });
=======

function Alunos() {
  const DBALUNOS = axios.create({baseURL: import.meta.env.VITE_ALUNO_URL});

  const [aluno, setAluno] = useState({
    nome: "",
    matricula: "",
    email: "",
  });

  const [alunosCadastrados, setAlunosCadastrados] = useState([]);
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

  async function recuperaAlunos() {
    try {
      const response = await DBALUNOS.get("/");
      const data = response.data;
<<<<<<< HEAD
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
      // ALERTAS INLINE por campo
      mensagens.forEach((m) =>
      addAlert(m.message, "error", { fieldName: m.fieldName })
      );

      // ALERTA GLOBAL
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
=======
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
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
      return;
    }

    try {
<<<<<<< HEAD
      await DBALUNOS.post("/", form);
      setForm({ nome: "", matricula: "", email: "" });
      recuperaAlunos();
      addAlert("Aluno cadastrado com sucesso!", "success");
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
    }
  }

  async function atualizaAluno(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}`}));
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
        // Exibe mensagens inline específicas do backend
        Object.entries(err.response.data).forEach(([field, msgs]) => {
          addAlert(msgs.join(", "), "error", { fieldName: `edit-${field}` });
        });

        // Monta o texto completo para o toast
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");

        addAlert(`Erro ao atualizar:\n${messages}`, "error");
      } else {
        addAlert("Erro ao atualizar (erro desconhecido).", "error");
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
              const data = err.response.data;

              // Caso 1: Erro genérico do backend (ex: { "erro": "mensagem" })
              if (typeof data.erro === "string") {
                addAlert(data.erro, "error");
                return;
              }

              // Caso 2: Erros de campo (ex: { nome: ["Campo obrigatório"], email: [...] })
              Object.entries(data).forEach(([field, msgs]) => {
                if (Array.isArray(msgs)) {
                  addAlert(msgs.join(", "), "error", { fieldName: field });
                } else {
                  addAlert(String(msgs), "error");
                }
              });

              // Monta um resumo para o toast
              const messages = Object.entries(data)
                .map(([field, msgs]) =>
                  Array.isArray(msgs) ? `${field}: ${msgs.join(", ")}` : `${field}: ${msgs}`
                )
                .join("\n");

              addAlert(`Erro ao deletar:\n${messages}`, "error");
            } else {
              addAlert("Erro ao deletar (erro desconhecido).", "error");
            }
          }
      },
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    });
  }

=======
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

>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
  useEffect(() => {
    recuperaAlunos();
  }, []);

  return (
<<<<<<< HEAD
    <div className="professores-container">
      <h1>Gerenciar Alunos</h1>

      <h2>Cadastrar Aluno</h2>
      <form className="professor-form" onSubmit={adicionaAluno}>
        <label>Nome:</label>
        <input
          name="nome"
          type="text"
          value={form.nome}
          onChange={(e) => {
            setForm({ ...form, nome: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("nome");
            }
            }
          }
          placeholder="Digite o nome do aluno"
        />
        <FieldAlert fieldName="nome" />

        <label>Matrícula:</label>
        <input
          name="matricula"
          type="text"
          value={form.matricula}
          onChange={(e) => {
            setForm({ ...form, matricula: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("matricula");
            }
          }
          }
          placeholder="Somente números"
        />
        <FieldAlert fieldName="matricula" />

        <label>Email institucional:</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("email");
            }
          }
          }
          placeholder="exemplo@restinga.ifrs.edu.br"
        />
        <FieldAlert fieldName="email" />

        <button type="submit">Adicionar Aluno</button>
      </form>

      <div className="componente-list">
        <h3>Alunos Cadastrados</h3>
        <ul>
          {alunos.length === 0 && <li>Nenhum aluno cadastrado.</li>}
          {alunos.map((a) => (
            <li key={a.id}>
              {editId === a.id ? (
                <form id="editForm" className="componente-edit-form" onSubmit={(e) => atualizaAluno(e, a.id)}>
                  <label>Nome:</label>
                  <input
                    name="nome"
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => {
                      setEditForm({ ...editForm, nome: e.target.value })
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("edit-nome");
                      }
                    }
                    }
                  />
                  <FieldAlert fieldName="edit-nome" />
                  <label>Matrícula:</label>
                  <input
                    name="matricula"
                    type="text"
                    value={editForm.matricula}
                    onChange={(e) => {
                      setEditForm({ ...editForm, matricula: e.target.value })
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("edit-matricula");
                      }
                    }
                    }
                  />
                  <FieldAlert fieldName="edit-matricula" />
                  <label>Email:</label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => {
                      setEditForm({ ...editForm, email: e.target.value })
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("edit-email");
                      }
                    }
                    }
                  />
                  <FieldAlert fieldName="edit-email" />
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
=======
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
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
            </li>
          ))}
        </ul>
      </div>

<<<<<<< HEAD
      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
}

export default Alunos;
=======
      <button>
        <Link to="/">Voltar</Link>
      </button>
    </>
  );
}

export default Alunos;
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
