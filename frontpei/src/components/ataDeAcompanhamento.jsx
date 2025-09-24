import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


function AtaDeAcompanhamento() {
  const DBATA = axios.create({
    baseURL: import.meta.env.VITE_ATA_ACOMPANHAMENTO,
  });

  // Formulário
  const [form, setForm] = useState({
    dataReuniao: "",
    participantes: "",
    descricao: "",
    ator: "",
  });

  const [atasCadastradas, setAtasCadastradas] = useState([]);

  // Estados para edição
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    dataReuniao: "",
    participantes: "",
    descricao: "",
    ator: "",
  });

  // Recupera atas
  async function recuperaAtas() {
    try {
      const response = await DBATA.get("/");
      const data = response.data;
      setAtasCadastradas(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar atas: ", err);
    }
  }

  // Adiciona nova ata
  async function adicionaAta(event) {
    event.preventDefault();

    if (!form.dataReuniao || !form.participantes || !form.descricao || !form.ator) {
      alert("Preencha todos os campos antes de cadastrar!");
      return;
    }

    try {
      await DBATA.post("/", {
        dataReuniao: new Date(form.dataReuniao).toISOString(),
        participantes: form.participantes,
        descricao: form.descricao,
        ator: form.ator,
      });
      alert("Ata criada com sucesso!");
      setForm({ dataReuniao: "", participantes: "", descricao: "", ator: "" });
      recuperaAtas();
    } catch (err) {
      console.error("Erro ao criar ata:", err.response?.data || err);
      alert("Falha ao cadastrar ata de acompanhamento!");
    }
  }

  // Deleta ata
  async function deletaAta(id) {
    if (!window.confirm("Tem certeza que deseja deletar esta ata?")) return;

    try {
      await DBATA.delete(`/${id}/`);
      await recuperaAtas();
    } catch (err) {
      console.error("Erro ao deletar ata:", err);
      alert("Falha ao deletar ata!");
    }
  }

  // Atualiza ata
  async function atualizaAta(id) {
    if (!editForm.dataReuniao || !editForm.participantes || !editForm.descricao || !editForm.ator) {
      return alert("Preencha todos os campos antes de salvar!");
    }

    try {
      await DBATA.put(`/${id}/`, {
        dataReuniao: new Date(editForm.dataReuniao).toISOString(),
        participantes: editForm.participantes,
        descricao: editForm.descricao,
        ator: editForm.ator,
      });

      setEditId(null);
      setEditForm({ dataReuniao: "", participantes: "", descricao: "", ator: "" });
      await recuperaAtas();
    } catch (err) {
      console.error("Erro ao atualizar ata:", err.response?.data || err);
      alert("Falha ao atualizar ata!");
    }
  }

  useEffect(() => {
    recuperaAtas();
  }, []);

  return (
    <div className="ata-container">
      <h1>Gerenciar Atas de Acompanhamento</h1>
      <h2>Cadastrar Ata</h2>

      <form onSubmit={adicionaAta}>
        <label>Data da Reunião:</label>
        <br />
        <input
          type="datetime-local"
          value={form.dataReuniao}
          onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })}
          required
        />
        <br />

        <label>Participantes:</label>
        <br />
        <input
          type="text"
          value={form.participantes}
          onChange={(e) => setForm({ ...form, participantes: e.target.value })}
        />
        <br />

        <label>Descrição:</label>
        <br />
        <input
          type="text"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
        <br />

        <label>Ator:</label>
        <br />
        <input
          type="text"
          value={form.ator}
          onChange={(e) => setForm({ ...form, ator: e.target.value })}
        />
        <br />

        <button type="submit">Adicionar Ata</button>
      </form>

      <div className="ata-list">
        <h3>Atas Cadastradas</h3>
        <ul>
          {atasCadastradas.length === 0 && <li>Nenhuma ata cadastrada.</li>}

          {atasCadastradas.map((a) => (
            <li key={a.id}>
              {editId === a.id ? (
                <>
                  <input
                    type="datetime-local"
                    value={editForm.dataReuniao}
                    onChange={(e) => setEditForm({ ...editForm, dataReuniao: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editForm.participantes}
                    onChange={(e) => setEditForm({ ...editForm, participantes: e.target.value })}
                    placeholder="Participantes"
                  />
                  <input
                    type="text"
                    value={editForm.descricao}
                    onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                    placeholder="Descrição"
                  />
                  <input
                    type="text"
                    value={editForm.ator}
                    onChange={(e) => setEditForm({ ...editForm, ator: e.target.value })}
                    placeholder="Ator"
                  />

                  <div className="btn-group">
                    <button onClick={() => atualizaAta(a.id)}>Salvar</button>
                    <button onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <strong>Data:</strong>{" "}
                  {a.dataReuniao ? new Date(a.dataReuniao).toLocaleString() : "-"} <br />
                  <strong>Participantes:</strong> {a.participantes || "-"} <br />
                  <strong>Descrição:</strong> {a.descricao || "-"} <br />
                  <strong>Ator:</strong> {a.ator || "-"} <br />

                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(a.id);
                        setEditForm({
                          dataReuniao: a.dataReuniao
                            ? new Date(a.dataReuniao).toISOString().slice(0, 16)
                            : "",
                          participantes: a.participantes,
                          descricao: a.descricao,
                          ator: a.ator,
                        });
                      }}
                    >
                      Editar
                    </button>
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
