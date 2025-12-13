import { useEffect, useState } from "react";
import axios from "axios";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import { API_ROUTES } from "../configs/apiRoutes";

function AtaDeAcompanhamento({ usuario }) {
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

  useEffect(() => {
    clearAlerts();
  }, []);
  const TOKEN_BEARER = localStorage.getItem("access") || localStorage.getItem("token") || "";

  const DBATA = axios.create({
    baseURL: API_ROUTES.ATADEACOMPANHAMENTO,
    headers: { Authorization: TOKEN_BEARER ? `token ${TOKEN_BEARER}` : undefined }
  });

  const PERIODO_LETIVO_API = axios.create({
    baseURL: API_ROUTES.PEIPERIODOLETIVO,
    headers: { Authorization: TOKEN_BEARER ? `token ${TOKEN_BEARER}` : undefined }
  });


  const [form, setForm] = useState({
    dataReuniao: "",
    dataFim: "",
    participantes: "",
    descricao: "",
    periodoLetivo: "",
  });

  const [atasCadastradas, setAtasCadastradas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    dataReuniao: "",
    dataFim: "",
    participantes: "",
    descricao: "",
    periodoLetivo: "",
  });
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
      addAlert("Erro ao carregar atas de acompanhamento!", "error");
    }
  }

  async function recuperaPeriodosLetivos() {
    try {
      const res = await PERIODO_LETIVO_API.get("/");
      setPeriodosLetivos(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      addAlert("Erro ao recuperar períodos letivos!", "error");
    }
  }

  function parseParticipantsToArray(text) {
    if (!text) return [];
    return text
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  function validateDates(startIso, endIso) {
    if (!startIso || !endIso) return false;
    const s = new Date(startIso);
    const e = new Date(endIso);
    return e > s;
  }

  async function adicionaAta(e) {
    e.preventDefault();

    // validacao de campos obrigatorios
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    // valida data fim > inicio
    if (!validateDates(form.dataReuniao, form.dataFim)) {
      addAlert("A data de fim deve ser posterior à data de início.", "error");
      return;
    }

    try {
      const participantesArray = parseParticipantsToArray(form.participantes);
      await DBATA.post("/", {
        dataReuniao: new Date(form.dataReuniao).toISOString(),
        dataFim: new Date(form.dataFim).toISOString(),
        participantes: form.participantes,
        participantes_emails: participantesArray,
        descricao: form.descricao,
        peiperiodoletivo: form.periodoLetivo,
      });
      setForm({ dataReuniao: "", dataFim: "", participantes: "", descricao: "", periodoLetivo: "" });
      recuperaAtas();
      addAlert("Ata cadastrada com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1);
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
          .join("\n");
        addAlert(`Erro ao cadastrar:\n${msg}`, "error", { persist: true });
      } else {
        addAlert("Erro ao cadastrar ata de acompanhamento.", "error", { persist: true });
      }
    }
  }

  async function atualizaAta(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    if (!validateDates(editForm.dataReuniao, editForm.dataFim)) {
      addAlert("A data de fim deve ser posterior à data de início.", "error");
      return;
    }

    try {
      const participantesArray = parseParticipantsToArray(editForm.participantes);
      await DBATA.put(`/${id}/`, {
        dataReuniao: new Date(editForm.dataReuniao).toISOString(),
        dataFim: new Date(editForm.dataFim).toISOString(),
        participantes: editForm.participantes,
        participantes_emails: participantesArray,
        descricao: editForm.descricao,
        peiperiodoletivo: editForm.periodoLetivo,
      });
      setEditId(null);
      setEditForm({ dataReuniao: "", dataFim: "", participantes: "", descricao: "", periodoLetivo: "" });
      recuperaAtas();
      addAlert("Ata atualizada com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1);
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
          .join("\n");
        addAlert(`Erro ao atualizar:\n${msg}`, "error", { persist: true });
      } else {
        addAlert("Erro ao editar ata de acompanhamento.", "error", { persist: true });
      }
    }
  }

  async function deletaAta(id) {
    if (!window.confirm("Deseja realmente excluir essa ata e notificar participantes?")) return;
    try {
      // o backend envia email de cancelamento antes de excluir
      await DBATA.delete(`/${id}/`);
      recuperaAtas();
      addAlert("Ata excluída e participantes notificados.", "success");
    } catch (err) {
      addAlert("Erro ao excluir ata.", "error");
    }
  }

  return (
    <div className="container-padrao">
      <h1>Gerenciar Reuniões de Acompanhamento</h1>

      <h2>Cadastrar Reunião</h2>
      <form className="form-padrao" onSubmit={adicionaAta}>
        <label>Período Letivo:</label>
        <select
          name="periodoLetivo"
          value={form.periodoLetivo}
          onChange={(e) => {
            setForm({ ...form, periodoLetivo: e.target.value });
            if (e.target.value) clearFieldAlert("periodoLetivo");
          }}
        >
          <option value="">Selecione...</option>
          {periodosLetivos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.periodo_principal} ({p.data_criacao} - {p.data_termino})
            </option>
          ))}
        </select>
        <FieldAlert fieldName="periodoLetivo" />

        <label>Data de Início:</label>
        <input
          type="datetime-local"
          name="dataReuniao"
          value={form.dataReuniao}
          onChange={(e) => {
            setForm({ ...form, dataReuniao: e.target.value });
            if (e.target.value) clearFieldAlert("dataReuniao");
          }}
        />
        <FieldAlert fieldName="dataReuniao" />

        <label>Data de Fim:</label>
        <input
          type="datetime-local"
          name="dataFim"
          value={form.dataFim}
          onChange={(e) => {
            setForm({ ...form, dataFim: e.target.value });
            if (e.target.value) clearFieldAlert("dataFim");
          }}
        />
        <FieldAlert fieldName="dataFim" />

        <label>Participantes (emails separados por vírgula):</label>
        <input
          type="text"
          name="participantes"
          value={form.participantes}
          onChange={(e) => {
            setForm({ ...form, participantes: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("participantes");
          }}
          placeholder="ex: joao@ifrs.edu.br, maria@gmail.com"
        />
        <FieldAlert fieldName="participantes" />

        <label>Descrição (servirá como título da reunião):</label>
        <input
          type="text"
          name="descricao"
          value={form.descricao}
          onChange={(e) => {
            setForm({ ...form, descricao: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("descricao");
          }}
          placeholder="Assunto ou título da reunião"
        />
        <FieldAlert fieldName="descricao" />

        <div style={{ textAlign: "center" }}>
          <button type="submit" className="submit-btn">Adicionar Ata</button>
        </div>
      </form>

      <div className="list-padrao">
        <h3>Atas Cadastradas</h3>
        <ul>
          {atasCadastradas.length === 0 && <li>Nenhum registro.</li>}
          {atasCadastradas.map((a) => {
            const periodo = periodosLetivos.find((p) => p.id === a.peiperiodoletivo);
            return (
              <li key={a.id} className="componente-item">
                {editId === a.id ? (
                  <form id="editForm" onSubmit={(e) => atualizaAta(e, a.id)}>
                    <label>Período Letivo:</label>
                    <select name="periodoLetivo" value={editForm.periodoLetivo} onChange={(e) => setEditForm({ ...editForm, periodoLetivo: e.target.value })}>
                      <option value="">Selecione...</option>
                      {periodosLetivos.map((p) => (<option key={p.id} value={p.id}>{p.periodo_principal}</option>))}
                    </select>

                    <label>Data de Início:</label>
                    <input type="datetime-local" name="dataReuniao" value={editForm.dataReuniao} onChange={(e) => setEditForm({ ...editForm, dataReuniao: e.target.value })} />

                    <label>Data de Fim:</label>
                    <input type="datetime-local" name="dataFim" value={editForm.dataFim} onChange={(e) => setEditForm({ ...editForm, dataFim: e.target.value })} />

                    <label>Participantes (emails separados por vírgula):</label>
                    <input type="text" name="participantes" value={editForm.participantes} onChange={(e) => setEditForm({ ...editForm, participantes: e.target.value })} />

                    <label>Descrição:</label>
                    <input type="text" name="descricao" value={editForm.descricao} onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })} />

                    <div className="posicao-buttons esquerda">
                      <button type="submit" className="btn-salvar">Salvar</button>
                      <button type="button" className="botao-deletar" onClick={() => setEditId(null)}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <div className="componente-detalhe">
                    <strong>Período:</strong> {periodo?.periodo_principal || "-"} <br />
                    <strong>Data:</strong> {a.dataReuniao ? new Date(a.dataReuniao).toLocaleString() : "-"} <br />
                    <strong>Fim:</strong> {a.dataFim ? new Date(a.dataFim).toLocaleString() : "-"} <br />
                    <strong>Participantes:</strong> {a.participantes || "-"} <br />
                    <strong>Descrição:</strong> {a.descricao || "-"} <br />
                    <strong>Ator:</strong> {a.ator || "-"}
                    <div className="posicao-buttons">
                      <BotaoEditar id={a.id} onClickInline={() => {
                        setEditId(a.id);
                        setEditForm({
                          dataReuniao: a.dataReuniao ? new Date(a.dataReuniao).toISOString().slice(0, 16) : "",
                          dataFim: a.dataFim ? new Date(a.dataFim).toISOString().slice(0, 16) : "",
                          participantes: a.participantes,
                          descricao: a.descricao,
                          periodoLetivo: a.peiperiodoletivo,
                        });
                      }} />
                      <BotaoDeletar id={a.id} axiosInstance={DBATA} onDeletarSucesso={recuperaAtas} />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <BotaoVoltar />
    </div>
  );
}

export default AtaDeAcompanhamento;
