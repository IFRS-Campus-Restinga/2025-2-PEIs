import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
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

  return (
    <div className="componente-container">
      <h1>Gerenciar Documentação Complementar</h1>
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
