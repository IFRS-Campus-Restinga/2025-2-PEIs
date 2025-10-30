import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import "./componenteCurricular.css";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";

/**
 * Componente para gerenciar a documentação complementar
 * com upload, edição e exclusão de arquivos.
 */
function DocumentacaoComplementar() {
  const { addAlert } = useAlert();

  // Cria instância da API
  const DBDOC = axios.create({
    baseURL: import.meta.env.VITE_DOC_COMPLEMENTAR,
  });

  const [form, setForm] = useState({ autor: "", tipo: "" });
  const [arquivo, setArquivo] = useState(null);
  const [docs, setDocs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ autor: "", tipo: "" });
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
    const formElement = e.target;
    const mensagens = validaCampos(form, formElement);

    if (mensagens.length > 0) {
      // ALERTS INLINE
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      // TOAST GERAL
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
      const message = err.response?.data
        ? Object.entries(err.response.data)
            .map(([f, m]) => `${f}: ${m.join(", ")}`)
            .join(" | ")
        : "Erro desconhecido.";
      addAlert(`Erro ao cadastrar: ${message}`, "error");
    }
  };

  // Atualiza documento existente
  const atualizaDoc = async (id) => {
    const formElement = document.getElementById("editForm");
    const mensagens = validaCampos(editForm, formElement);
    if (mensagens.length > 0) {
      mensagens.forEach((msg) => addAlert(msg, "warning"));
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
      const message = err.response?.data
        ? Object.entries(err.response.data)
            .map(([f, m]) => `${f}: ${m.join(", ")}`)
            .join(" | ")
        : "Erro desconhecido.";
      addAlert(`Erro ao atualizar: ${message}`, "error");
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
=======
import "./componenteCurricular.css"; // usando o CSS de Componente Curricular

function DocumentacaoComplementar() {
  const DBDOC = axios.create({ baseURL: import.meta.env.VITE_DOC_COMPLEMENTAR });

  const [form, setForm] = useState({ autor: "", tipo: "", caminho: "" });
  const [docs, setDocs] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({ autor: "", tipo: "", caminho: "" });

  async function recuperaDocs() {
    try {
      const res = await DBDOC.get("/");
      setDocs(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) { console.error(err); }
  }

  async function adicionaDoc(e) {
    e.preventDefault();
    if (!form.autor || !form.tipo || !form.caminho) return alert("Preencha todos os campos!");
    try {
      await DBDOC.post("/", form);
      setForm({ autor: "", tipo: "", caminho: "" });
      recuperaDocs();
    } catch (err) { console.error(err); alert("Erro ao cadastrar!"); }
  }

  function editarDoc(doc) {
    setEditando(doc.id);
    setFormEdit({ autor: doc.autor, tipo: doc.tipo, caminho: doc.caminho });
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    try {
      await DBDOC.put(`/${editando}/`, formEdit);
      setEditando(null);
      recuperaDocs();
    } catch (err) { console.error(err); alert("Erro ao editar!"); }
  }

  async function deletarDoc(id) {
    if (!window.confirm("Deseja realmente excluir esta documentação?")) return;
    try { await DBDOC.delete(`/${id}/`); recuperaDocs(); }
    catch (err) { console.error(err); alert("Erro ao excluir!"); }
  }

  useEffect(() => { recuperaDocs(); }, []);
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

  return (
    <div className="componente-container">
      <h1>Gerenciar Documentação Complementar</h1>
<<<<<<< HEAD

      {/* Formulário de cadastro */}
      <form className="componente-form" onSubmit={adicionaDoc}>
        <label>Autor:</label>
        <input
          type="text"
          name="autor"
          value={form.autor}
          onChange={(e) => setForm({ ...form, autor: e.target.value })}
        />
        <FieldAlert fieldName="autor" />

        <label>Tipo:</label>
        <input
          type="text"
          name="tipo"
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        />
        <FieldAlert fieldName="tipo" />

        <label>Arquivo:</label>
        <input
          type="file"
          name="arquivo"
          accept=".pdf,.docx,.png,.jpg"
          onChange={(e) => setArquivo(e.target.files[0])}
        />
        <FieldAlert fieldName="arquivo" />

        <button type="submit">Adicionar Documento</button>
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
                    onChange={(e) =>
                      setEditForm({ ...editForm, autor: e.target.value })
                    }
                  />
                  <FieldAlert fieldName="autor" />

                  <label>Tipo:</label>
                  <input
                    type="text"
                    name="tipo"
                    value={editForm.tipo}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tipo: e.target.value })
                    }
                  />
                  <FieldAlert fieldName="tipo" />

                  <label>Novo Arquivo (opcional):</label>
                  <input
                    type="file"
                    name="arquivo"
                    accept=".pdf,.docx,.png,.jpg"
                    onChange={(e) => setEditArquivo(e.target.files[0])}
                  />
                  <FieldAlert fieldName="arquivo" />

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
=======
      <h2>Cadastrar Documentação</h2>

      <form className="componente-form" onSubmit={adicionaDoc}>
        <label>Autor:</label>
        <input type="text" value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} />

        <label>Tipo:</label>
        <input type="text" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />

        <label>Caminho:</label>
        <input type="text" value={form.caminho} onChange={(e) => setForm({ ...form, caminho: e.target.value })} />

        <button type="submit">Adicionar Documentação</button>
      </form>

      <div className="componente-list">
        <h3>Documentações Cadastradas</h3>
        <ul>
          {docs.length === 0 && <li>Nenhuma documentação cadastrada.</li>}
          {docs.map((d) => (
            <li key={d.id}>
              {editando === d.id ? (
                <>
                  <input type="text" value={formEdit.autor} onChange={(e) => setFormEdit({ ...formEdit, autor: e.target.value })} placeholder="Autor" />
                  <input type="text" value={formEdit.tipo} onChange={(e) => setFormEdit({ ...formEdit, tipo: e.target.value })} placeholder="Tipo" />
                  <input type="text" value={formEdit.caminho} onChange={(e) => setFormEdit({ ...formEdit, caminho: e.target.value })} placeholder="Caminho" />
                  <div className="btn-group">
                    <button onClick={salvarEdicao}>Salvar</button>
                    <button onClick={() => setEditando(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <strong>Autor:</strong> {d.autor} <br />
                  <strong>Tipo:</strong> {d.tipo} <br />
                  <strong>Caminho:</strong> {d.caminho} <br />
                  <div className="btn-group">
                    <button onClick={() => editarDoc(d)}>Editar</button>
                    <button onClick={() => deletarDoc(d.id)}>Excluir</button>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

<<<<<<< HEAD
      <Link to="/" className="voltar-btn">
        Voltar
      </Link>
=======
      <Link to="/" className="voltar-btn">Voltar</Link>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    </div>
  );
}

export default DocumentacaoComplementar;
