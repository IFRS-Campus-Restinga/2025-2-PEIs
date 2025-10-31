import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./professor.css";
import { useAlert, FieldAlert } from "../context/AlertContext";
import { validaCampos } from "../utils/validaCampos";
import BotaoVoltar from "../components/customButtons/botaoVoltar";

function Professor() {
  const { addAlert } = useAlert();
  const DBPROFESSORES = axios.create({ baseURL: import.meta.env.VITE_PROFESSORES_URL });

  const [professores, setProfessores] = useState([]);
  const [form, setForm] = useState({ nome: "", matricula: "", email: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", matricula: "", email: "" });

  async function recuperaProfessores() {
    try {
      const res = await DBPROFESSORES.get("");
      setProfessores(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
      addAlert("Erro ao carregar lista de professores!", "error");
    }
  }

  async function adicionaProfessor(e) {
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
      await DBPROFESSORES.post("/", {
        nome: form.nome,
        matricula: form.matricula,
        email: form.email,
      });
      setForm({ nome: "", matricula: "", email: "" });
      recuperaProfessores();
      addAlert("Professor cadastrado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar professor (erro desconhecido).", "error");
      }
    }
  }

  async function atualizaProfessor(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    try {
      await DBPROFESSORES.put(`/${id}/`, {
        nome: editForm.nome,
        matricula: editForm.matricula,
        email: editForm.email,
      });
      setEditId(null);
      setEditForm({ nome: "", matricula: "", email: "" });
      recuperaProfessores();
      addAlert("Professor atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao atualizar ${messages}`, "error");
      } else {
        addAlert("Erro ao atualizar professor (erro desconhecido).", "error");
      }
    }
  }

  function deletaProfessor(id) {
    addAlert("Deseja realmente deletar este professor?", "confirm", {
      onConfirm: async () => {
        try {
          await DBPROFESSORES.delete(`/${id}/`);
          recuperaProfessores();
          addAlert("Professor deletado com sucesso!", "success");
        } catch (err) {
          console.error(err);
          if (err.response?.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join(" | ");
            addAlert(`Erro ao deletar ${messages}`, "error");
          } else {
            addAlert("Erro ao deletar professor (erro desconhecido).", "error");
          }
        }
      },
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    });
  }

  useEffect(() => {
    recuperaProfessores();
  }, []);

  return (
    <div className="professores-container">
      <h1>Gerenciar Professores</h1>

      <h2>Cadastrar Professor</h2>
      <form className="professor-form" onSubmit={adicionaProfessor}>
        <label>Nome:</label>
        <input
          name="nome"
          type="text"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          placeholder="Digite o nome do professor"
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

        <button type="submit">Adicionar Professor</button>
      </form>

      <div className="professores-list">
        <h3>Professores Cadastrados</h3>
        <ul>
          {professores.length === 0 && <li>Nenhum professor cadastrado.</li>}
          {professores.map((p) => (
            <li key={p.id}>
              {editId === p.id ? (
                <form id="editForm" onSubmit={(e) => atualizaProfessor(e, p.id)}>
                  <input
                    name="nome"
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  />
                  <input
                    name="matricula"
                    type="text"
                    value={editForm.matricula}
                    onChange={(e) => setEditForm({ ...editForm, matricula: e.target.value })}
                  />
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                  <div className="btn-group">
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{p.nome}</strong><br />
                  Matrícula: {p.matricula}<br />
                  Email: {p.email}<br />
                  <div className="professor-buttons">
                    <button
                      onClick={() => {
                        setEditId(p.id);
                        setEditForm({
                          nome: p.nome,
                          matricula: p.matricula,
                          email: p.email,
                        });
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

      <BotaoVoltar/>
    </div>
  );
}

export default Professor;
