import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import "../cssGlobal.css"

function AtaDeAcompanhamento() {
  const { addAlert, clearFieldAlert } = useAlert();
  const DBATA = axios.create({ baseURL: import.meta.env.VITE_ATA_ACOMPANHAMENTO });
  const PERIODO_LETIVO_API = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });

  const [form, setForm] = useState({
    dataReuniao: "",
    participantes: "",
    descricao: "",
    ator: "",
    periodoLetivo: "",
  });

  const [atasCadastradas, setAtasCadastradas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ dataReuniao: "", participantes: "", descricao: "", ator: "", periodoLetivo: "" });
  const [periodosLetivos, setPeriodosLetivos] = useState([]);

  useEffect(() => {
    recuperaAtas();
    recuperaPeriodosLetivos();
  }, []);

  async function recuperaAtas() {
    try {
      const res = await DBATA.get("/");
      setAtasCadastradas(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) { 
      console.error(err);
      addAlert("Erro ao carregar atas de acompanhamento!", "error") }
  }

  async function recuperaPeriodosLetivos() {
      try {
        const res = await PERIODO_LETIVO_API.get("/");
        setPeriodosLetivos(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch {
        addAlert("Erro ao recuperar períodos letivos!", "error");
      }
    }

  async function adicionaAta(e) {
    e.preventDefault();
    const formElement = e.target;
    const mensagens = validaCampos(form, formElement);

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
      await DBATA.post("/", {
        dataReuniao: new Date(form.dataReuniao).toISOString(),
        participantes: form.participantes,
        descricao: form.descricao,
        ator: form.ator,
        peiperiodoletivo: form.periodoLetivo
      });
      setForm({ dataReuniao: "", participantes: "", descricao: "", ator: "", periodoLetivo: "" });
      recuperaAtas();
      addAlert("Ata cadastrada com sucesso!", "success");

    } catch (err) {
       console.error(err);

      if (err.response?.data) {
        // Exibe mensagens inline específicas do backend
        Object.entries(err.response.data).forEach(([field, msgs]) => {
          const mensagens = Array.isArray(msgs) ? msgs.join(", ") : msgs;
          addAlert(mensagens, "error", { fieldName: field });
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

  async function deletaAta(id) {
    addAlert("Deseja realmente deletar esta ata?", "confirm", {
      onConfirm: async () => {
        try {
          await DBATA.delete(`/${id}/`);
          recuperaAtas();
          addAlert("Ata deletada com sucesso!", "success");
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
      onCancel: () => {
        addAlert("Exclusão cancelada pelo usuário.", "info");
      },
    });
  }

  async function atualizaAta(e, id) {
    e.preventDefault();
    const formElement = document.getElementById("editForm");
    const mensagens = validaCampos(editForm, formElement);

    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}`}));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBATA.put(`/${id}/`, {
        dataReuniao: new Date(editForm.dataReuniao).toISOString(),
        participantes: editForm.participantes,
        descricao: editForm.descricao,
        ator: editForm.ator,
        peiperiodoletivo: editForm.periodoLetivo
      });
      setEditId(null);
      setEditForm({ dataReuniao: "", participantes: "", descricao: "", ator: "", periodoLetivo: "" });
      recuperaAtas();
      addAlert("Ata atualizada com sucesso!", "success");
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
  }

  useEffect(() => { recuperaAtas(); }, []);

  return (
    <div className="componente-container">
      <h1>Gerenciar Atas de Acompanhamento</h1>
      <h2>Cadastrar Ata</h2>

      <form className="componente-form" onSubmit={adicionaAta}>
        <label>Período Letivo:</label>
          <select
            name="periodoLetivo"
            value={form.periodoLetivo}
            onChange={(e) => {
              setForm({ ...form, periodoLetivo: Number(e.target.value)})
              if (e.target.value.trim() !== "") {
                clearFieldAlert("periodoLetivo");
              }
            }
          }
          >
            <option value="">Selecione um período letivo</option>
            {periodosLetivos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.periodo_principal} ({p.data_criacao} a {p.data_termino})
              </option>
            ))}
          </select>
          <FieldAlert fieldName="periodoLetivo" />

        <label>Data da Reunião:</label>
        <input type="datetime-local"
        name="dataReuniao"
        value={form.dataReuniao} 
        onChange={(e) => {
            setForm({ ...form, dataReuniao: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("dataReuniao");
            }
          }
          } />
        <FieldAlert fieldName="dataReuniao" />
        <label>Participantes:</label>
        <input type="text"
        name="participantes"
        value={form.participantes}
        onChange={(e) => {
            setForm({ ...form, participantes: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("participantes");
            }
          }} />
        <FieldAlert fieldName="participantes" />
        <label>Descrição:</label>
        <input type="text"
        name="descricao"
        value={form.descricao} onChange={(e) => {
            setForm({ ...form, descricao: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("descricao");
            }
          }} />
        <FieldAlert fieldName="descricao" />
        <label>Ator:</label>
        <input type="text"
        name="ator"
        value={form.ator} onChange={(e) => {
            setForm({ ...form, ator: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("ator");
            }
          }} />
        <FieldAlert fieldName="ator" />
        <button className="submit-btn">Adicionar Ata</button>
      </form>

      <div className="componente-list">
        <h3>Atas Cadastradas</h3>
        <ul>
          {atasCadastradas.length === 0 && <li>Nenhuma ata cadastrada.</li>}
          {atasCadastradas.map((a) => {
            const periodo = periodosLetivos.find(p => p.id === a.peiperiodoletivo);

            return (
              <li key={a.id}>
                {editId === a.id ? (
                  <form
                    id="editForm"
                    className="componente-edit-form"
                    onSubmit={(e) => atualizaAta(e, a.id)}
                  >
                    <label>Período Letivo:</label>
                    <select
                      name="periodoLetivo"
                      value={editForm.periodoLetivo}
                      onChange={(e) => {
                        setEditForm({ ...editForm, periodoLetivo: Number(e.target.value) });
                        if (e.target.value.trim() !== "") {
                          clearFieldAlert("edit-periodoLetivo");
                        }
                      }}
                    >
                      <option value="">Selecione um período letivo</option>
                      {periodosLetivos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.periodo_principal} ({p.data_criacao} a {p.data_termino})
                        </option>
                      ))}
                    </select>
                    <FieldAlert fieldName="edit-periodoLetivo" />

                    {/* resto dos campos editáveis */}
                    <strong><label>Data da reunião: </label></strong>
                    <input
                      type="datetime-local"
                      value={editForm.dataReuniao}
                      name="dataReuniao"
                      onChange={(e) => {
                        setEditForm({ ...editForm, dataReuniao: e.target.value });
                        if (e.target.value.trim() !== "") clearFieldAlert("edit-dataReuniao");
                      }}
                    />
                    <FieldAlert fieldName="edit-dataReuniao" />

                    <strong><label>Participantes: </label></strong>
                    <input
                      type="text"
                      value={editForm.participantes}
                      name="participantes"
                      onChange={(e) => {
                        setEditForm({ ...editForm, participantes: e.target.value });
                        if (e.target.value.trim() !== "") clearFieldAlert("edit-participantes");
                      }}
                      placeholder="Participantes"
                    />
                    <FieldAlert fieldName="edit-participantes" />

                    <strong><label>Descrição: </label></strong>
                    <input
                      type="text"
                      value={editForm.descricao}
                      name="descricao"
                      onChange={(e) => {
                        setEditForm({ ...editForm, descricao: e.target.value });
                        if (e.target.value.trim() !== "") clearFieldAlert("edit-descricao");
                      }}
                      placeholder="Descrição"
                    />
                    <FieldAlert fieldName="edit-descricao" />

                    <strong><label>Ator: </label></strong>
                    <input
                      type="text"
                      value={editForm.ator}
                      name="ator"
                      onChange={(e) => {
                        setEditForm({ ...editForm, ator: e.target.value });
                        if (e.target.value.trim() !== "") clearFieldAlert("edit-ator");
                      }}
                      placeholder="Ator"
                    />
                    <FieldAlert fieldName="edit-ator" />

                    <div className="btn-group">
                      <button type="submit">Salvar</button>
                      <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <strong>PEI Período Letivo:</strong> {periodo ? `${periodo.periodo_principal} (${periodo.data_criacao} a ${periodo.data_termino})` : "-"} <br />
                    <strong>Data:</strong> {a.dataReuniao ? new Date(a.dataReuniao).toLocaleString() : "-"} <br />
                    <strong>Participantes:</strong> {a.participantes || "-"} <br />
                    <strong>Descrição:</strong> {a.descricao || "-"} <br />
                    <strong>Ator:</strong> {a.ator || "-"} <br />
                    <div className="btn-group">
                      <button
                        onClick={() => {
                          setEditId(a.id);
                          setEditForm({
                            dataReuniao: a.dataReuniao ? new Date(a.dataReuniao).toISOString().slice(0, 16) : "",
                            participantes: a.participantes,
                            descricao: a.descricao,
                            ator: a.ator,
                            periodoLetivo: a.peiperiodoletivo, // aqui preenchemos o ID corretamente
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
            );
          })}
        </ul>
      </div>

      <BotaoVoltar/>

    </div>
  );
}

export default AtaDeAcompanhamento;
