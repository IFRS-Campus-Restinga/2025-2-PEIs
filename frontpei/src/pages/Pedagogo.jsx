import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./disciplina.css";
import { useAlert, FieldAlert } from "../context/AlertContext"; 
import { validaCampos } from "../utils/validaCampos";
import { API_ROUTES } from "../configs/apiRoutes";

function Pedagogos() {
  const DBPEDAGOGO = axios.create({baseURL: API_ROUTES.PEDAGOGO});
  const [pedagogo, setPedagogo] = useState("");
  const [pedagogosCadastradas, setPedagogosCadastradas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const { addAlert, clearFieldAlert } = useAlert();
  const [form, setForm] = useState({ nome: "" });
  const [editForm, setEditForm] = useState({nome: ""});

  async function recuperaPedagogos() {
    try {
      const response = await DBPEDAGOGO.get("/");
      const data = response.data;
      setPedagogosCadastradas(Array.isArray(data) ? data : data.results);
    } catch (err) {
      addAlert("Erro ao buscar disciplinas: ", err);
    }
  }

  async function adicionaPedagogo(e) {
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
      await DBPEDAGOGO.post("/", {
        nome: form.nome
      });

      setForm({nome: ""});
      await recuperaPedagogos();
      addAlert("Pedagogo cadastrado com sucesso!", "success");
      setPedagogo("");
    } catch (err) {
      console.error("Erro completo:", err);
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

  // Função para deletar disciplina
  async function deletaPedagogo(id) {
    addAlert("Deseja realmente deletar este pedagogo?", "confirm", {
      onConfirm: async () => {
        try {
          await DBPEDAGOGO.delete(`/${id}/`);
          recuperaPedagogos();
          addAlert("Pedagogo deletado com sucesso!", "success");
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

  async function atualizaPedagogo(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));

    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}`}));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBPEDAGOGO.put(`/${id}/`, { nome: editForm.nome });
      setEditId(null);
      setEditForm({nome: ""});
      await recuperaPedagogos();
    } catch (err) {
      if (err.response?.data) {
      // Exibe mensagens inline específicas do backend
      Object.entries(err.response.data).forEach(([field, msgs]) => {
        addAlert(msgs.join(", "), "error", { fieldName: `edit-${field}` });
      });

      // Monta o texto completo para o toast
      const messages = Object.entries(err.response.data)
        .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
        .join("\n");

        addAlert(`Erro ao editar:\n${messages}`, "error");
      } else {
        addAlert("Erro ao editar (erro desconhecido).", "error");
      }
    }
  }


  useEffect(() => {
    recuperaPedagogos();
  }, []);

  return (
    <div className="disciplinas-container">
      <h1>Gerenciar Pedagogo</h1>

      <h2>Cadastrar pedagogo</h2>
      <form className="disciplinas-form" onSubmit={adicionaPedagogo}>
        <label>Nome: </label>
        <br />
        <textarea
          name="nome"
          value={form.nome}
          onChange={(e) => {
            setForm({ ...form, nome: e.target.value })
              if (e.target.value.trim() !== "") {
                clearFieldAlert("nome");
              }
            }
          }
        />
        <FieldAlert fieldName="nome" />
        <br />
        <button type="submit">Adicionar pedagogo</button>
      </form>

      <div className="disciplinas-list">
        <h3>Pedagogos Cadastrados</h3>
        <ul>
          {pedagogosCadastradas.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <>
                  <form id="editForm" onSubmit={(e) => atualizaPedagogo(e, d.id)}>
                  <input
                    value={editForm.nome}
                    onChange={(e) => {
                      setEditForm({...editForm, nome: e.target.value})
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("edit-nome");
                      }
                    }
                  }
                  />
                  <FieldAlert fieldName="edit-nome" />
                  <div className="btn-group">
                    <button onClick={(e) => atualizaPedagogo(e, d.id)}>Salvar</button>
                  </div>
                  </form>
                </>
              ) : (
                <>
                  <span>{d.nome}</span>
                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(d.id);
                        setEditForm(editForm.nome);
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => deletaPedagogo(d.id)}>Deletar</button>
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

export default Pedagogos;
