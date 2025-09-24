import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./componenteCurricular.css"; // CSS novo

function ComponenteCurricular() {
  const DBCOMPONENTECURRICULAR = axios.create({ baseURL: import.meta.env.VITE_COMPONENTE_CURRICULAR });
  const DISCIPLINAS_API = import.meta.env.VITE_DISCIPLINAS_URL;

  const [form, setForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "",
  });

  const [componenteCurricularCadastrado, setComponenteCurricularCadastrado] = useState([]);
  const [disciplinasCadastradas, setDisciplinasCadastradas] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "",
  });

  async function recuperaComponenteCurricular() {
    try {
      const res = await DBCOMPONENTECURRICULAR.get("/");
      setComponenteCurricularCadastrado(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) { console.error(err); }
  }

  async function recuperaDisciplinas() {
    try {
      const res = await axios.get(DISCIPLINAS_API);
      setDisciplinasCadastradas(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) { console.error(err); }
  }

  async function adicionaComponenteCurricular(e) {
    e.preventDefault();
    if (!form.objetivos || !form.conteudo_prog || !form.metodologia || !form.disciplinaId) return alert("Preencha todos os campos!");
    try {
      await DBCOMPONENTECURRICULAR.post("/", {
        objetivos: form.objetivos,
        conteudo_prog: form.conteudo_prog,
        metodologia: form.metodologia,
        disciplinas: Number(form.disciplinaId),
      });
      setForm({ objetivos: "", conteudo_prog: "", metodologia: "", disciplinaId: "" });
      recuperaComponenteCurricular();
    } catch (err) { console.error(err); alert("Erro ao cadastrar!"); }
  }

  async function deletaComponenteCurricular(id) {
    if (!window.confirm("Deseja deletar este componente?")) return;
    try { await DBCOMPONENTECURRICULAR.delete(`/${id}/`); recuperaComponenteCurricular(); }
    catch (err) { console.error(err); alert("Erro ao deletar!"); }
  }

  async function atualizaComponenteCurricular(id) {
    if (!editForm.objetivos || !editForm.conteudo_prog || !editForm.metodologia || !editForm.disciplinaId) return alert("Preencha todos os campos!");
    try {
      await DBCOMPONENTECURRICULAR.put(`/${id}/`, {
        objetivos: editForm.objetivos,
        conteudo_prog: editForm.conteudo_prog,
        metodologia: editForm.metodologia,
        disciplinas: Number(editForm.disciplinaId),
      });
      setEditId(null);
      setEditForm({ objetivos: "", conteudo_prog: "", metodologia: "", disciplinaId: "" });
      recuperaComponenteCurricular();
    } catch (err) { console.error(err); alert("Erro ao atualizar!"); }
  }

  useEffect(() => {
    recuperaComponenteCurricular();
    recuperaDisciplinas();
  }, []);

  return (
    <div className="componente-container">
      <h1>Gerenciar Componentes Curriculares</h1>
      <h2>Cadastrar Componente Curricular</h2>

      <form className="componente-form" onSubmit={adicionaComponenteCurricular}>
        <label>Objetivos:</label>
        <input type="text" value={form.objetivos} onChange={(e) => setForm({ ...form, objetivos: e.target.value })} />
        <label>Conteúdo Programático:</label>
        <input type="text" value={form.conteudo_prog} onChange={(e) => setForm({ ...form, conteudo_prog: e.target.value })} />
        <label>Metodologia:</label>
        <textarea value={form.metodologia} onChange={(e) => setForm({ ...form, metodologia: e.target.value })} />
        <label>Disciplina:</label>
        <select value={form.disciplinaId} onChange={(e) => setForm({ ...form, disciplinaId: e.target.value })}>
          <option value="">Selecione uma disciplina</option>
          {disciplinasCadastradas.map((disc) => (<option key={disc.id} value={disc.id}>{disc.nome}</option>))}
        </select>
        <button type="submit">Adicionar</button>
      </form>

      <div className="componente-list">
        <h3>Componentes Cadastrados</h3>
        <ul>
          {componenteCurricularCadastrado.length === 0 && <li>Nenhum componente cadastrado.</li>}
          {componenteCurricularCadastrado.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <>
                  <input type="text" placeholder="Objetivos" value={editForm.objetivos} onChange={(e) => setEditForm({ ...editForm, objetivos: e.target.value })} />
                  <input type="text" placeholder="Conteúdo Programático" value={editForm.conteudo_prog} onChange={(e) => setEditForm({ ...editForm, conteudo_prog: e.target.value })} />
                  <textarea placeholder="Metodologia" value={editForm.metodologia} onChange={(e) => setEditForm({ ...editForm, metodologia: e.target.value })} />
                  <select value={editForm.disciplinaId} onChange={(e) => setEditForm({ ...editForm, disciplinaId: e.target.value })}>
                    <option value="">Selecione uma disciplina</option>
                    {disciplinasCadastradas.map((disc) => (<option key={disc.id} value={disc.id}>{disc.nome}</option>))}
                  </select>
                  <div className="btn-group">
                    <button onClick={() => atualizaComponenteCurricular(d.id)}>Salvar</button>
                    <button onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <strong>Objetivos:</strong> {d.objetivos || "-"} <br />
                  <strong>Conteúdo:</strong> {d.conteudo_prog || "-"} <br />
                  <strong>Metodologia:</strong> {d.metodologia || "-"} <br />
                  <strong>Disciplina:</strong> {
                    disciplinasCadastradas.find(disc => disc.id === d.disciplinas)?.nome || "-"
                  } <br />
                  <div className="btn-group">
                    <button onClick={() => { setEditId(d.id); setEditForm({ objetivos: d.objetivos, conteudo_prog: d.conteudo_prog, metodologia: d.metodologia, disciplinaId: d.disciplinas?.id || "" }); }}>Editar</button>
                    <button onClick={() => deletaComponenteCurricular(d.id)}>Deletar</button>
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

export default ComponenteCurricular;
