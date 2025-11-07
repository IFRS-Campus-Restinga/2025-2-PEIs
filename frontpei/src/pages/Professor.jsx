import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../context/AlertContext";
import { validaCampos } from "../utils/validaCampos";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import "../cssGlobal.css";
import { API_ROUTES } from "../configs/apiRoutes";

function Professor() {
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

  useEffect(() => {
    // limpa todos os alertas ao entrar na tela
    clearAlerts();
  }, []);
  const DBPROFESSORES = axios.create({ baseURL: API_ROUTES.PROFESSOR });

  const [professores, setProfessores] = useState([]);
  const [form, setForm] = useState({ nome: "", matricula: "", email: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", matricula: "", email: "" });

  async function recuperaProfessores() {
    try {
      const res = await DBPROFESSORES.get("");
      setProfessores(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar lista de professores!", "error");
    }
  }

  async function adicionaProfessor(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);

    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBPROFESSORES.post("/", form);
      setForm({ nome: "", matricula: "", email: "" });
      recuperaProfessores();
      addAlert("Professor cadastrado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        // Exibir mensagens inline (por campo)
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });

        // Montar mensagem amigável pro toast
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1); // Capitaliza o nome do campo
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
          .join("\n");

        addAlert(`Erro ao cadastrar:\n${msg}`, "error", { persist: true });
      } else {
        addAlert("Erro ao cadastrar professor.", "error", { persist: true });
      }
    }
  }

  async function atualizaProfessor(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}`}));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBPROFESSORES.put(`/${id}/`, editForm);
      setEditId(null);
      setEditForm({ nome: "", matricula: "", email: "" });
      recuperaProfessores();
      addAlert("Professor atualizado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        // Exibir mensagens inline (por campo)
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });

        // Montar mensagem amigável pro toast
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1); // Capitaliza o nome do campo
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
          .join("\n");

        addAlert(`Erro ao cadastrar:\n${msg}`, "error", { persist: true });
      } else {
        addAlert("Erro ao editar professor.", "error", { persist: true });
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

  useEffect(() => {
    recuperaProfessores();
  }, []);

  return (
    <div className="container-padrao">
      <h1>Gerenciar Professores</h1>

      <h2>Cadastrar Professor</h2>
      <form className="form-padrao" onSubmit={adicionaProfessor}>
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
          placeholder="Digite o nome do professor"
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

        <button className="submit-btn">Adicionar Professor</button>
      </form>

      <div className="list-padrao">
        <h3>Professores Cadastrados</h3>
        <ul>
          {professores.length === 0 && <li>Nenhum professor cadastrado.</li>}
          {professores.map((p) => (
            <li key={p.id}>
              {editId === p.id ? (
                <form id="editForm" onSubmit={(e) => atualizaProfessor(e, p.id)}>
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

                  <div className="posicao-buttons esquerda">
                    <button type="submit" className="btn-salvar">Salvar</button>
                    <button type="button" className="botao-deletar" onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="list-padrao">
                  <strong>{p.nome}</strong><br />
                  Matrícula: {p.matricula}<br />
                  Email: {p.email}<br />
                  <div className="posicao-buttons">
                    <BotaoEditar
                      id={p.id}
                      onClickInline={() => {
                        setEditId(p.id);
                        setEditForm({ nome: p.nome, matricula: p.matricula, email: p.email });
                      }}
                    />
                    <BotaoDeletar
                      id={p.id}
                      axiosInstance={DBPROFESSORES}
                      onDeletarSucesso={recuperaProfessores}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <BotaoVoltar />
    </div>
  );
}

export default Professor;