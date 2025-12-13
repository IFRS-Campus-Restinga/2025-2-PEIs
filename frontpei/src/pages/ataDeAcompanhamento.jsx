
import { useEffect, useState } from "react";
import axios from "axios";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import "../cssGlobal.css";
import { API_ROUTES } from "../configs/apiRoutes";

function AtaDeAcompanhamento({ usuario }) {
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

  useEffect(() => {
    clearAlerts();
  }, []);

  
  const DBATA = axios.create({ baseURL: API_ROUTES.ATADEACOMPANHAMENTO });
  if (usuario && usuario.email) {
    DBATA.defaults.headers.common["X-User-Email"] = usuario.email;
    DBATA.defaults.headers.common["X-User-Group"] = usuario.grupo || "";
  }

  const [form, setForm] = useState({
    tituloReuniao: "",
    local: "",
    dataInicio: "",
    dataFim: "",
    participantes: "",
    gruposSelecionados: ["NAPNE"],
  });

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    tituloReuniao: "",
    local: "",
    dataInicio: "",
    dataFim: "",
    participantes: "",
    gruposSelecionados: ["NAPNE"],
  });

  const [ataEditor, setAtaEditor] = useState({
    openForId: null,
    texto: "",
  });

  const [atasCadastradas, setAtasCadastradas] = useState([]);

  const [aceitesPorAta, setAceitesPorAta] = useState({});

  const GRUPOS_FIXOS = ["Coordenador", "NAPNE", "Pedagogo", "Professor"];

  function parseParticipantsToArray(text) {
    if (!text) return [];
    return text
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter((p) => p.length > 0);
  }

  function isoLocalFromInput(valueLocalDatetime) {
    if (!valueLocalDatetime) return null;
    const dt = new Date(valueLocalDatetime);
    return dt.toISOString();
  }

  function validateDates(startIso, endIso) {
    if (!startIso || !endIso) return false;
    const s = new Date(startIso);
    const e = new Date(endIso);
    return e > s;
  }

  async function recuperaAtas() {
    try {
      const res = await DBATA.get("/");
      const list = Array.isArray(res.data) ? res.data : res.data.results || [];
      setAtasCadastradas(list);
    } catch (err) {
      addAlert("Erro ao carregar atas de acompanhamento!", "error");
    }
  }

  async function recuperaAceitesParaAta(ataId) {
    const objetoUrl = encodeURIComponent(`/api/ataDeAcompanhamento/${ataId}/`);
    const url = `${(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "")}/aceite/?objeto_url=${objetoUrl}`;
    try {
      const resp = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "X-BACKEND-TOKEN": import.meta.env.VITE_BACKEND_TOKEN || "",
        },
      });
      if (!resp.ok) {
        setAceitesPorAta((prev) => ({ ...prev, [ataId]: null }));
        return null;
      }
      const data = await resp.json();
      setAceitesPorAta((prev) => ({ ...prev, [ataId]: data }));
      return data;
    } catch (e) {
      setAceitesPorAta((prev) => ({ ...prev, [ataId]: null }));
      return null;
    }
  }

  useEffect(() => {
    recuperaAtas();
  }, []);

  async function adicionaReuniao(e) {
    e.preventDefault();

    if (!form.tituloReuniao || !form.local || !form.dataInicio || !form.dataFim || !form.participantes) {
      addAlert("Preencha título, local, datas e participantes.", "warning");
      return;
    }

    const inicioIso = isoLocalFromInput(form.dataInicio);
    const fimIso = isoLocalFromInput(form.dataFim);

    if (!validateDates(inicioIso, fimIso)) {
      addAlert("A data de fim deve ser posterior à data de início.", "error");
      return;
    }

    const participantesArray = parseParticipantsToArray(form.participantes);

    const payload = {
      dataReuniao: inicioIso,
      dataFim: fimIso,
      tituloReuniao: form.tituloReuniao,
      local: form.local,
      participantes: form.participantes,
      participantes_emails: participantesArray,
      grupos_autorizados: form.gruposSelecionados || [],
      descricao: form.tituloReuniao,
    };

    try {
      await DBATA.post("/", payload);
      setForm({
        tituloReuniao: "",
        local: "",
        dataInicio: "",
        dataFim: "",
        participantes: "",
        gruposSelecionados: [],
      });
      recuperaAtas();
      addAlert("Reunião cadastrada com sucesso! Convites enviados.", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });
      } else {
        addAlert("Erro ao cadastrar reunião.", "error");
      }
    }
  }

  function iniciaEdicaoReuniao(reuniao) {
    if (reuniao.ata_texto) {
      addAlert("Não é possível editar reunião que já possui ata.", "warning");
      return;
    }
    setEditId(reuniao.id);
    setEditForm({
      tituloReuniao: reuniao.tituloReuniao || reuniao.descricao || "",
      local: reuniao.local || "",
      dataInicio: reuniao.dataReuniao ? new Date(reuniao.dataReuniao).toISOString().slice(0, 16) : "",
      dataFim: reuniao.dataFim ? new Date(reuniao.dataFim).toISOString().slice(0, 16) : "",
      participantes: reuniao.participantes || "",
      gruposSelecionados: reuniao.grupos_autorizados || [],
    });
  }

  function cancelaEdicao() {
    setEditId(null);
    setEditForm({
      tituloReuniao: "",
      local: "",
      dataInicio: "",
      dataFim: "",
      participantes: "",
      gruposSelecionados: [],
    });
  }

  async function salvaEdicao(e, id) {
    e.preventDefault();
    if (!editForm.tituloReuniao || !editForm.local || !editForm.dataInicio || !editForm.dataFim || !editForm.participantes) {
      addAlert("Preencha título, local, datas e participantes.", "warning");
      return;
    }

    const inicioIso = isoLocalFromInput(editForm.dataInicio);
    const fimIso = isoLocalFromInput(editForm.dataFim);

    if (!validateDates(inicioIso, fimIso)) {
      addAlert("A data de fim deve ser posterior à data de início.", "error");
      return;
    }

    const participantesArray = parseParticipantsToArray(editForm.participantes);

    const payload = {
      dataReuniao: inicioIso,
      dataFim: fimIso,
      tituloReuniao: editForm.tituloReuniao,
      local: editForm.local,
      participantes: editForm.participantes,
      participantes_emails: participantesArray,
      grupos_autorizados: editForm.gruposSelecionados || [],
      descricao: editForm.tituloReuniao,
    };

    try {
      await DBATA.patch(`/${id}/`, payload);
      cancelaEdicao();
      recuperaAtas();
      addAlert("Reunião atualizada com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });
      } else {
        addAlert("Erro ao atualizar reunião.", "error");
      }
    }
  }

  async function deletaReuniao(id) {
    if (!window.confirm("Deseja realmente excluir essa reunião dos registros?")) return;
    try {
      await DBATA.delete(`/${id}/`);
      recuperaAtas();
      addAlert("Reunião excluída dos registros do sistema.", "success");
    } catch (err) {
      addAlert("Erro ao excluir reunião.", "error");
    }
  }

  function abrirEditorAta(reuniao) {
    const isAutor = usuario?.email && usuario.email.toLowerCase() === (reuniao.autor || "").toLowerCase();
    const isAdmin = usuario?.grupo === "Admin";
    if (!(isAutor || isAdmin)) {
      addAlert("Apenas o autor ou administrador pode criar a ata.", "warning");
      return;
    }
    if (reuniao.ata_texto) {
      addAlert("Ata já existe para esta reunião.", "warning");
      return;
    }
    setAtaEditor({ openForId: reuniao.id, texto: "" });
  }

  async function salvaAta(e, id) {
    e.preventDefault();
    if (!ataEditor.texto || !ataEditor.texto.trim()) {
      addAlert("A ata não pode ficar vazia.", "warning");
      return;
    }

    try {
      await DBATA.patch(`/${id}/`, { ata_texto: ataEditor.texto });
      setAtaEditor({ openForId: null, texto: "" });
      recuperaAtas();
      addAlert("Ata registrada. Pedidos de aceite enviados aos participantes.", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });
      } else {
        addAlert("Erro ao salvar a ata.", "error");
      }
    }
  }

  async function atualizarAceites(ataId) {
    await recuperaAceitesParaAta(ataId);
    addAlert("Tentativa de atualização dos aceites executada.", "info");
  }

  function renderAceites(ataId) {
    const dados = aceitesPorAta[ataId];
    if (dados === undefined) {
      return <small>Carregando aceites...</small>;
    }
    if (dados === null) {
      return <small>Não há dados de aceite disponíveis (endpoint opcional não exposto).</small>;
    }
    if (Array.isArray(dados) && dados.length === 0) {
      return <small>Nenhum pedido de aceite registrado.</small>;
    }
    return (
      <ul>
        {dados.map((a) => (
          <li key={a.id || a.email_destinatario}>
            <strong>{a.email_destinatario || a.email}</strong> —{" "}
            {a.aceito_em ? `ACEITO em ${new Date(a.aceito_em).toLocaleString()}` : "PENDENTE"}
          </li>
        ))}
      </ul>
    );
  }

  // ====
  // HTML
  // ====
  return (
    <div className="container-padrao">
      <h1>Gerenciamento de Reuniões</h1>

      <h2>Cadastrar Reunião</h2>
      <form className="form-padrao" onSubmit={adicionaReuniao}>
        <label>Título da Reunião:</label>
        <input
          type="text"
          name="tituloReuniao"
          value={form.tituloReuniao}
          onChange={(e) => {
            setForm({ ...form, tituloReuniao: e.target.value });
            if (e.target.value) clearFieldAlert("tituloReuniao");
          }}
          required
        />
        <FieldAlert fieldName="tituloReuniao" />

        <label>Local (ou link):</label>
        <input
          type="text"
          name="local"
          value={form.local}
          onChange={(e) => {
            setForm({ ...form, local: e.target.value });
            if (e.target.value) clearFieldAlert("local");
          }}
          required
        />
        <FieldAlert fieldName="local" />

        <label>Data de Início:</label>
        <input
          type="datetime-local"
          name="dataInicio"
          value={form.dataInicio}
          onChange={(e) => {
            setForm({ ...form, dataInicio: e.target.value });
            if (e.target.value) clearFieldAlert("dataInicio");
          }}
          required
        />
        <FieldAlert fieldName="dataInicio" />

        <label>Data de Fim:</label>
        <input
          type="datetime-local"
          name="dataFim"
          value={form.dataFim}
          onChange={(e) => {
            setForm({ ...form, dataFim: e.target.value });
            if (e.target.value) clearFieldAlert("dataFim");
          }}
          required
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
          required
        />
        <FieldAlert fieldName="participantes" />

        <label>Grupos com visibilidade (marque os grupos):</label>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {GRUPOS_FIXOS.map((g) => (
            <label key={g} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={form.gruposSelecionados.includes(g)}
                onChange={(e) => {
                  const next = form.gruposSelecionados.includes(g)
                    ? form.gruposSelecionados.filter((x) => x !== g)
                    : [...form.gruposSelecionados, g];
                  setForm({ ...form, gruposSelecionados: next });
                }}
              />
              {g}
            </label>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button type="submit" className="submit-btn">Adicionar Reunião</button>
        </div>
      </form>

      {editId && (
        <>
          <h2>Editar Reunião (ID: {editId})</h2>
          <form id="editForm" className="form-padrao" onSubmit={(e) => salvaEdicao(e, editId)}>
            <label>Título:</label>
            <input type="text" value={editForm.tituloReuniao} onChange={(e) => setEditForm({ ...editForm, tituloReuniao: e.target.value })} required />

            <label>Local:</label>
            <input type="text" value={editForm.local} onChange={(e) => setEditForm({ ...editForm, local: e.target.value })} required />

            <label>Data de Início:</label>
            <input type="datetime-local" value={editForm.dataInicio} onChange={(e) => setEditForm({ ...editForm, dataInicio: e.target.value })} required />

            <label>Data de Fim:</label>
            <input type="datetime-local" value={editForm.dataFim} onChange={(e) => setEditForm({ ...editForm, dataFim: e.target.value })} required />

            <label>Participantes:</label>
            <input type="text" value={editForm.participantes} onChange={(e) => setEditForm({ ...editForm, participantes: e.target.value })} required />

            <label>Grupos visíveis:</label>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              {GRUPOS_FIXOS.map((g) => (
                <label key={g} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={editForm.gruposSelecionados.includes(g)}
                    onChange={() => {
                      const next = editForm.gruposSelecionados.includes(g)
                        ? editForm.gruposSelecionados.filter((x) => x !== g)
                        : [...editForm.gruposSelecionados, g];
                      setEditForm({ ...editForm, gruposSelecionados: next });
                    }}
                  />
                  {g}
                </label>
              ))}
            </div>

            <div className="posicao-buttons esquerda">
              <button type="submit" className="btn-salvar">Salvar</button>
              <button type="button" className="botao-deletar" onClick={() => cancelaEdicao()}>Cancelar</button>
            </div>
          </form>
        </>
      )}

      <div className="list-padrao" style={{ marginTop: 20 }}>
        <h3>Reuniões Cadastradas</h3>
        <p>Seu email: <b>{usuario?.email}</b> — Seu grupo: <b>{usuario?.grupo}</b></p>
        <ul>
          {atasCadastradas.length === 0 && <li>Nenhum registro.</li>}
          {atasCadastradas.map((a) => {
            const inicio = a.dataReuniao ? new Date(a.dataReuniao).toLocaleString() : "-";
            const fim = a.dataFim ? new Date(a.dataFim).toLocaleString() : "-";
            const temAta = !!(a.ata_texto && a.ata_texto.trim());
            const isAutor = usuario?.email && usuario.email.toLowerCase() === (a.autor || "").toLowerCase();
            const isAdmin = usuario?.grupo === "Admin";
            const podeEditar = !temAta && (isAutor || isAdmin);

            return (
              <li key={a.id} className="componente-item" style={{ marginBottom: 16 }}>
                <div className="componente-detalhe">
                  <strong>{a.tituloReuniao || a.descricao}</strong><br />
                  <strong>Local:</strong> {a.local || "-"} <br />
                  <strong>Início:</strong> {inicio} <br />
                  <strong>Fim:</strong> {fim} <br />
                  <strong>Participantes:</strong> {a.participantes || "-"} <br />
                  <strong>Grupos visíveis:</strong> {(a.grupos_autorizados || []).join(", ")} <br />
                  <strong>Autor:</strong> {a.autor || "-"} <br />

                  {temAta ? (
                    <div style={{ marginTop: 8, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}>
                      <h4>Ata</h4>
                      {a.ata_criada_em ? (
                        <div style={{ marginBottom: 6, color: "#666", fontSize: 13 }}>
                          Registrada em: {new Date(a.ata_criada_em).toLocaleString()}
                        </div>
                      ) : null}<div style={{ whiteSpace: "pre-wrap" }}>{a.ata_texto}</div>

                      <div style={{ marginTop: 8 }}>
                        <button
                          className="submit-btn"
                          onClick={() => atualizarAceites(a.id)}
                        >
                          Atualizar aceites
                        </button>
                        <div style={{ marginTop: 8 }}>
                          {renderAceites(a.id)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      <em>Sem ata registrada.</em>
                    </div>
                  )}

                  <div className="posicao-buttons" style={{ marginTop: 8 }}>
                    {podeEditar && (
                      <button onClick={() => iniciaEdicaoReuniao(a)} className="btn-salvar" title="Editar">Editar</button>
                    )}

                    {!temAta && (isAutor || isAdmin) && (
                      <button onClick={() => abrirEditorAta(a)} className="submit-btn" title="Criar Ata">Criar Ata</button>
                    )}

                    {(isAutor || isAdmin) && (
                      <button
                        onClick={() => deletaReuniao(a.id)}
                        className="botao-deletar"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {ataEditor.openForId && (
        <div style={{ marginTop: 20 }}>
          <h2>Registrar Ata — {atasCadastradas.find(a => a.id === ataEditor.openForId)?.tituloReuniao || "Reunião"}</h2>
          <form className="form-padrao" onSubmit={(e) => salvaAta(e, ataEditor.openForId)}>
            <label>Texto da Ata:</label>
            <textarea
              value={ataEditor.texto}
              onChange={(e) => setAtaEditor({ ...ataEditor, texto: e.target.value })}
              rows={10}
              style={{ width: "100%" }}
              required
            />
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="submit-btn">Salvar Ata</button>
              <button type="button" className="botao-deletar" onClick={() => setAtaEditor({ openForId: null, texto: "" })}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <BotaoVoltar />
    </div>
  );
}

export default AtaDeAcompanhamento;