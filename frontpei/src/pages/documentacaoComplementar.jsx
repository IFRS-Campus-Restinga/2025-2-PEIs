import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import "../cssGlobal.css"


/**
 * Componente para gerenciar a documentação complementar
 * com upload, edição e exclusão de arquivos.
 */
function DocumentacaoComplementar() {
  const { addAlert, clearFieldAlert } = useAlert();

  // Cria instância da API
  const DBDOC = axios.create({
    baseURL: import.meta.env.VITE_DOC_COMPLEMENTAR,
  });

  const [form, setForm] = useState({ autor: "", tipo: "", arquivo: null });
  const [arquivo, setArquivo] = useState(null);
  const [docs, setDocs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ autor: "", tipo: "", arquivo: null });
  const [editArquivo, setEditArquivo] = useState(null);

  // Recupera documentos cadastrados
  const recuperaDocs = async () => {
    try {
      const res = await DBDOC.get("/");
      setDocs(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
      addAlert("Erro ao carregar documentos.", "error");
    }
  };

  useEffect(() => {
    recuperaDocs();
  }, []);

  // Monta o payload para envio (cadastro e edição)
  const montaFormData = (dados, arquivo) => {
    const fd = new FormData();
    Object.entries(dados).forEach(([k, v]) => fd.append(k, v));
    if (arquivo) fd.append("arquivo", arquivo);
    return fd;
  };

  // Adiciona novo documento
  const adicionaDoc = async (e) => {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);

    if (mensagens.length > 0) {
      // ALERTAS INLINE por campo
      mensagens.forEach((m) =>
      addAlert(m.message, "error", { fieldName: m.fieldName })
      );

      // ALERTA GLOBAL
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBDOC.post("/", montaFormData(form, arquivo), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addAlert("Documento cadastrado com sucesso!", "success");
      setForm({ autor: "", tipo: "" });
      setArquivo(null);
      recuperaDocs();
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
  };

  // Atualiza documento existente
  const atualizaDoc = async (id) => {
    const formElement = document.getElementById("editForm");
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}`}));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBDOC.put(`/${id}/`, montaFormData(editForm, editArquivo), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addAlert("Documento atualizado com sucesso!", "success");
      setEditId(null);
      setEditForm({ autor: "", tipo: "" });
      setEditArquivo(null);
      recuperaDocs();
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
  };

  // Deleta documento
  const deletaDoc = (id) => {
    addAlert("Deseja realmente deletar este documento?", "confirm", {
      onConfirm: async () => {
        try {
          await DBDOC.delete(`/${id}/`);
          addAlert("Documento deletado com sucesso!", "success");
          recuperaDocs();
        } catch (err) {
          console.error(err);
          addAlert("Erro ao deletar documento.", "error");
        }
      },
      onCancel: () => addAlert("Exclusão cancelada.", "info"),
    });
  };

  return (
    <div className="componente-container">
      <h1>Gerenciar Documentação Complementar</h1>

      {/* Formulário de cadastro */}
      <form className="componente-form" onSubmit={adicionaDoc}>
        <label>Autor:</label>
        <input
          type="text"
          name="autor"
          value={form.autor}
          onChange={(e) => {
            setForm({ ...form, autor: e.target.value })
            if (e.target.value.trim() !== ""){
              clearFieldAlert("autor");
            }
            }
          }
        />
        <FieldAlert fieldName="autor" />

        <label>Tipo:</label>
        <input
          type="text"
          name="tipo"
          value={form.tipo}
          onChange={(e) => {
            setForm({ ...form, tipo: e.target.value })
            if (e.target.value.trim() !== ""){
              clearFieldAlert("tipo");
            }
            }
          }
        />
        <FieldAlert fieldName="tipo" />

        <label>Arquivo:</label>
        <input
          type="file"
          name="arquivo"
          accept=".pdf,.docx,.png,.jpg"
          onChange={(e) => {
            setForm({...form, arquivo: e.target.files[0]})
            if (e.target.value.trim() !== ""){
              clearFieldAlert("arquivo");
            }
            }
          }
        />
        <FieldAlert fieldName="arquivo" />
        
        <br /> <br />
        <button className="submit-btn">Adicionar Documento</button>
      </form>

      {/* Lista de documentos */}
      <div className="componente-list">
        <h3>Documentos Cadastrados</h3>
        <ul>
          {docs.length === 0 && <li>Nenhum documento cadastrado.</li>}

          {docs.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <form id="editForm" className="componente-edit-form">
                  <label>Autor:</label>
                  <input
                    type="text"
                    name="autor"
                    value={editForm.autor}
                    onChange={(e) => {
                      setEditForm({ ...editForm, autor: e.target.value })
                      if (e.target.value.trim() !== ""){
                        clearFieldAlert("edit-autor");
                      }
                    }
                    }
                  />
                  <FieldAlert fieldName="edit-autor" />

                  <label>Tipo:</label>
                  <input
                    type="text"
                    name="tipo"
                    value={editForm.tipo}
                    onChange={(e) => {
                      setEditForm({ ...editForm, tipo: e.target.value })
                      if (e.target.value.trim() !== ""){
                        clearFieldAlert("edit-tipo");
                      }
                      }
                    }
                  />
                  <FieldAlert fieldName="edit-tipo" />

                  <label>Novo Arquivo:</label>
                  <input
                    type="file"
                    name="arquivo"
                    accept=".pdf,.docx,.png,.jpg"
                    onChange={(e) => {
                      setEditForm({...editForm, arquivo: e.target.files[0]})
                      if (e.target.value.trim() !== ""){
                        clearFieldAlert("edit-arquivo");
                      }
                      }
                    }
                  />
                  <FieldAlert fieldName="edit-arquivo" />

                  <div className="btn-group">
                    <button type="button" onClick={() => atualizaDoc(d.id)}>
                      Salvar
                    </button>
                    <button type="button" onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>Autor:</strong> {d.autor || "-"} <br />
                  <strong>Tipo:</strong> {d.tipo || "-"} <br />
                  {d.arquivo ? (
                    <a href={d.arquivo} target="_blank" rel="noreferrer">
                      Ver Arquivo
                    </a>
                  ) : (
                    <span>Sem arquivo</span>
                  )}

                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(d.id);
                        setEditForm({ autor: d.autor, tipo: d.tipo });
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => deletaDoc(d.id)}>Deletar</button>
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

export default DocumentacaoComplementar;
