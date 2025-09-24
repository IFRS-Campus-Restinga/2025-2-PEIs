import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./componenteCurricular.css"; // usando CSS de Componentes Curriculares

function AtaDeAcompanhamento() {
  const DBATA = axios.create({ baseURL: import.meta.env.VITE_ATA_ACOMPANHAMENTO });

  const [form, setForm] = useState({
    dataReuniao: "",
    participantes: "",
    descricao: "",
    ator: "",
  });

  const [atasCadastradas, setAtasCadastradas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ dataReuniao: "", participantes: "", descricao: "", ator: "" });

  async function recuperaAtas() {
    try {
      const res = await DBATA.get("/");
      setAtasCadastradas(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) { console.error(err); }
  }

  async function adicionaAta(e) {
    e.preventDefault();
    if (!form.dataReuniao || !form.participantes || !form.descricao || !form.ator)
      return alert("Preencha todos os campos!");

    try {
      await DBATA.post("/", {
        dataReuniao: new Date(form.dataReuniao).toISOString(),
        participantes: form.participantes,
        descricao: form.descricao,
        ator: form.ator,
      });
      setForm({ dataReuniao: "", participantes: "", descricao: "", ator: "" });
      recuperaAtas();
    } catch (err) { console.error(err); alert("Erro ao cadastrar!"); }
  }

  async function deletaAta(id) {
    if (!window.confirm("Deseja deletar esta ata?")) return;
    try { await DBATA.delete(`/${id}/`); recuperaAtas(); }
    catch (err) { console.error(err); alert("Erro ao deletar!"); }
  }

  async function atualizaAta(id) {
    if (!editForm.dataReuniao || !editForm.participantes || !editForm.descricao || !editForm.ator)
      return alert("Preencha todos os campos!");

    try {
      await DBATA.put(`/${id}/`, {
        dataReuniao: new Date(editForm.dataReuniao).toISOString(),
        participantes: editForm.participantes,
        descricao: editForm.descricao,
        ator: editForm.ator,
      });
      setEditId(null);
      setEditForm({ dataReuniao: "", participantes: "", descricao: "", ator: "" });
      recuperaAtas();
    } catch (err) { console.error(err); alert("Erro ao atualizar!"); }
  }

  useEffect(() => { recuperaAtas(); }, []);

  return (
    <div className="componente-container">
      <h1>Gerenciar Atas de Acompanhamento</h1>
      <h2>Cadastrar Ata</h2>

      <form className="componente-form" onSubmit={adicionaAta}>
        <label>Data da Reunião:</label>
        <input type="datetime-local" value={form.dataReuniao} onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })} />
        <label>Participantes:</label>
        <input type="text" value={form.participantes} onChange={(e) => setForm({ ...form, participantes: e.target.value })} />
        <label>Descrição:</label>
        <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        <label>Ator:</label>
        <input type="text" value={form.ator} onChange={(e) => setForm({ ...form, ator: e.target.value })} />
        <button type="submit">Adicionar Ata</button>
      </form>

      <div className="componente-list">
        <h3>Atas Cadastradas</h3>
        <ul>
          {atasCadastradas.length === 0 && <li>Nenhuma ata cadastrada.</li>}
          {atasCadastradas.map((a) => (
            <li key={a.id}>
              {editId === a.id ? (
                <>
                  <input type="datetime-local" value={editForm.dataReuniao} onChange={(e) => setEditForm({ ...editForm, dataReuniao: e.target.value })} />
                  <input type="text" value={editForm.participantes} onChange={(e) => setEditForm({ ...editForm, participantes: e.target.value })} placeholder="Participantes" />
                  <input type="text" value={editForm.descricao} onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })} placeholder="Descrição" />
                  <input type="text" value={editForm.ator} onChange={(e) => setEditForm({ ...editForm, ator: e.target.value })} placeholder="Ator" />
                  <div className="btn-group">
                    <button onClick={() => atualizaAta(a.id)}>Salvar</button>
                    <button onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <strong>Data:</strong> {a.dataReuniao ? new Date(a.dataReuniao).toLocaleString() : "-"} <br />
                  <strong>Participantes:</strong> {a.participantes || "-"} <br />
                  <strong>Descrição:</strong> {a.descricao || "-"} <br />
                  <strong>Ator:</strong> {a.ator || "-"} <br />
                  <div className="btn-group">
                    <button onClick={() => { setEditId(a.id); setEditForm({ dataReuniao: a.dataReuniao ? new Date(a.dataReuniao).toISOString().slice(0,16) : "", participantes: a.participantes, descricao: a.descricao, ator: a.ator }); }}>Editar</button>
                    <button onClick={() => deletaAta(a.id)}>Deletar</button>
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

export default AtaDeAcompanhamento;
