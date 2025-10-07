import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./componenteCurricular.css";
import { validaCampos } from "../utils/validaCampos";
import { useAlert } from "../context/AlertContext";

function DocumentacaoComplementar() {
  const { addAlert } = useAlert();
  const DBDOC = axios.create({ baseURL: import.meta.env.VITE_DOC_COMPLEMENTAR });

  const [form, setForm] = useState({ autor: "", tipo: "", caminho: "" });
  const [docsCadastrados, setDocsCadastrados] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ autor: "", tipo: "", caminho: "" });

  async function recuperaDocs() {
    try {
      const res = await DBDOC.get("/");
      setDocsCadastrados(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function adicionaDoc(e) {
    e.preventDefault();
    const formElement = e.target;
    const mensagens = validaCampos(form, formElement);

    if (mensagens.length > 0) {
      const mensagemUnica = mensagens.join("\n");
      addAlert(mensagemUnica, "warning");
      return;
    }

    try {
      await DBDOC.post("/", form);
      setForm({ autor: "", tipo: "", caminho: "" });
      recuperaDocs();
      addAlert("Documento cadastrado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  }

  async function atualizaDoc(id) {
    const formElement = document.getElementById("editForm");
    const mensagens = validaCampos(editForm, formElement);

    if (mensagens.length > 0) {
      mensagens.forEach((msg) => addAlert(msg, "warning"));
      return;
    }

    try {
      await DBDOC.put(`/${id}/`, editForm);
      setEditId(null);
      setEditForm({ autor: "", tipo: "", caminho: "" });
      recuperaDocs();
      addAlert("Documento atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao atualizar ${messages}`, "error");
      } else {
        addAlert("Erro ao atualizar (erro desconhecido).", "error");
      }
    }
  }

  function deletaDoc(id) {
    addAlert("Deseja realmente deletar este documento?", "confirm", {
      onConfirm: async () => {
        try {
          await DBDOC.delete(`/${id}/`);
          recuperaDocs();
          addAlert("Documento deletado com sucesso!", "success");
        } catch (err) {
          console.error(err);
          if (err.response && err.response.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join(" | ");
            addAlert(`Erro ao deletar ${messages}`, "error");
          } else {
            addAlert("Erro ao deletar (erro desconhecido).", "error");
          }
        }
      },
      onCancel: () => {
        addAlert("Exclusão cancelada pelo usuário.", "info");
      },
    });
  }

  useEffect(() => {
    recuperaDocs();
  }, []);

  return (
    <div className="componente-container">
      <h1>Gerenciar Documentação Complementar</h1>
      <h2>Cadastrar Documento</h2>

      <form className="componente-form" onSubmit={adicionaDoc}>
        <label>Autor:</label>
        <input type="text" name="autor" value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} />

        <label>Tipo:</label>
        <input type="text" name="tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />

        <label>Caminho:</label>
        <input type="text" name="caminho" value={form.caminho} onChange={(e) => setForm({ ...form, caminho: e.target.value })} />

        <button type="submit">Adicionar Documento</button>
      </form>

      <div className="componente-list">
        <h3>Documentos Cadastrados</h3>
        <ul>
          {docsCadastrados.length === 0 && <li>Nenhum documento cadastrado.</li>}
          {docsCadastrados.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <form id="editForm" className="componente-edit-form">
                  <strong><label>Autor: </label></strong>
                  <input type="text" value={editForm.autor} onChange={(e) => setEditForm({ ...editForm, autor: e.target.value })} placeholder="Autor" />
                  <label>Tipo: </label>
                  <input type="text" value={editForm.tipo} onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })} placeholder="Tipo" />
                  <label>Caminho: </label>
                  <input type="text" value={editForm.caminho} onChange={(e) => setEditForm({ ...editForm, caminho: e.target.value })} placeholder="Caminho" />
                  <div className="btn-group">
                    <button type="button" onClick={() => atualizaDoc(d.id)}>Salvar</button>
                    <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>Autor:</strong> {d.autor || "-"} <br />
                  <strong>Tipo:</strong> {d.tipo || "-"} <br />
                  <strong>Caminho:</strong> {d.caminho || "-"} <br />
                  <div className="btn-group">
                    <button onClick={() => { setEditId(d.id); setEditForm({ autor: d.autor, tipo: d.tipo, caminho: d.caminho }); }}>Editar</button>
                    <button onClick={() => deletaDoc(d.id)}>Deletar</button>
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

export default DocumentacaoComplementar;
