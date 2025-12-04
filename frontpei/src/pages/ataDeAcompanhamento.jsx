import { useEffect, useState } from "react";
import axios from "axios";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import "../cssGlobal.css";
import { API_ROUTES } from "../configs/apiRoutes";
import { enviarConviteReuniao } from "../lib/enviarConviteReuniao";

function AtaDeAcompanhamento({usuario}) {
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

  useEffect(() => {
    // limpa todos os alertas ao entrar na tela
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

  async function adicionaAta(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      /*const convidados = ["maiquelhvr@gmail.com", "2022012656@aluno.restinga.ifrs.edu.br"];
      await enviarConviteReuniao(
        convidados,
        "Reunião de Teste",
        "Convite de teste para sistema PEI.",
        "2025-11-28T16:00",
        "2025-11-28T17:00"
      );*/
      await DBATA.post("/", {
        dataReuniao: new Date(form.dataReuniao).toISOString(),
        participantes: form.participantes,
        descricao: form.descricao,
        ator: form.ator,
        peiperiodoletivo: form.periodoLetivo,
      });
      setForm({ dataReuniao: "", participantes: "", descricao: "", ator: "", periodoLetivo: "" });
      recuperaAtas();
      addAlert("Ata cadastrada com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        // Exibir mensagens inline (por campo)
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });

        // Montar mensagem amigável pro toast
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1); // Capitaliza o nome do campo
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

    try {
      await DBATA.put(`/${id}/`, {
        dataReuniao: new Date(editForm.dataReuniao).toISOString(),
        participantes: editForm.participantes,
        descricao: editForm.descricao,
        ator: editForm.ator,
        peiperiodoletivo: editForm.periodoLetivo,
      });
      setEditId(null);
      setEditForm({ dataReuniao: "", participantes: "", descricao: "", ator: "", periodoLetivo: "" });
      recuperaAtas();
      addAlert("Ata atualizada com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        // Exibir mensagens inline (por campo)
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });

        // Montar mensagem amigável pro toast
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1); // Capitaliza o nome do campo
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
          .join("\n");

        addAlert(`Erro ao cadastrar:\n${msg}`, "error", { persist: true });
      } else {
        addAlert("Erro ao editar ata de acompanhamento.", "error", { persist: true });
      }
    }
  }

  return (
    <div className="container-padrao">
      <h1>Gerenciar Atas de Acompanhamento</h1>

      {/* FORMULÁRIO DE CADASTRO */}
      <h2>Cadastrar Ata</h2>
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

        <label>Data da Reunião:</label>
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

        <label>Participantes:</label>
        <input
          type="text"
          name="participantes"
          value={form.participantes}
          onChange={(e) => {
            setForm({ ...form, participantes: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("participantes");
          }}
          placeholder="Ex: João, Maria"
        />
        <FieldAlert fieldName="participantes" />

        <label>Descrição:</label>
        <input
          type="text"
          name="descricao"
          value={form.descricao}
          onChange={(e) => {
            setForm({ ...form, descricao: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("descricao");
          }}
          placeholder="Resumo da reunião"
        />
        <FieldAlert fieldName="descricao" />

        <label>Ator:</label>
        <input
          type="text"
          name="ator"
          value={form.ator}
          onChange={(e) => {
            setForm({ ...form, ator: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("ator");
          }}
          placeholder="Responsável"
        />
        <FieldAlert fieldName="ator" />

        <button type="submit" className="submit-btn">Adicionar Ata</button>
      </form>

      {/* LISTA */}
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
                    <select
                      name="periodoLetivo"
                      value={editForm.periodoLetivo}
                      onChange={(e) => {
                        setEditForm({ ...editForm, periodoLetivo: e.target.value });
                        if (e.target.value) clearFieldAlert("edit-periodoLetivo");
                      }}
                    >
                      <option value="">Selecione...</option>
                      {periodosLetivos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.periodo_principal} ({p.data_criacao} - {p.data_termino})
                        </option>
                      ))}
                    </select>
                    <FieldAlert fieldName="edit-periodoLetivo" />

                    <label>Data da Reunião:</label>
                    <input
                      type="datetime-local"
                      name="dataReuniao"
                      value={editForm.dataReuniao}
                      onChange={(e) => {
                        setEditForm({ ...editForm, dataReuniao: e.target.value });
                        if (e.target.value) clearFieldAlert("edit-dataReuniao");
                      }}
                    />
                    <FieldAlert fieldName="edit-dataReuniao" />

                    <label>Participantes:</label>
                    <input
                      type="text"
                      name="participantes"
                      value={editForm.participantes}
                      onChange={(e) => {
                        setEditForm({ ...editForm, participantes: e.target.value });
                        if (e.target.value.trim()) clearFieldAlert("edit-participantes");
                      }}
                    />
                    <FieldAlert fieldName="edit-participantes" />

                    <label>Descrição:</label>
                    <input
                      type="text"
                      name="descricao"
                      value={editForm.descricao}
                      onChange={(e) => {
                        setEditForm({ ...editForm, descricao: e.target.value });
                        if (e.target.value.trim()) clearFieldAlert("edit-descricao");
                      }}
                    />
                    <FieldAlert fieldName="edit-descricao" />

                    <label>Ator:</label>
                    <input
                      type="text"
                      name="ator"
                      value={editForm.ator}
                      onChange={(e) => {
                        setEditForm({ ...editForm, ator: e.target.value });
                        if (e.target.value.trim()) clearFieldAlert("edit-ator");
                      }}
                    />
                    <FieldAlert fieldName="edit-ator" />

                    <div className="posicao-buttons esquerda">
                      <button type="submit" className="btn-salvar">Salvar</button>
                      <button type="button" className="botao-deletar" onClick={() => setEditId(null)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="componente-detalhe">
                    <strong>Período:</strong> {periodo?.periodo_principal || "-"} <br />
                    <strong>Data:</strong> {a.dataReuniao ? new Date(a.dataReuniao).toLocaleString() : "-"} <br />
                    <strong>Participantes:</strong> {a.participantes || "-"} <br />
                    <strong>Descrição:</strong> {a.descricao || "-"} <br />
                    <strong>Ator:</strong> {a.ator || "-"}
                    <div className="posicao-buttons">
                      <BotaoEditar
                        id={a.id}
                        onClickInline={() => {
                          setEditId(a.id);
                          setEditForm({
                            dataReuniao: a.dataReuniao ? new Date(a.dataReuniao).toISOString().slice(0, 16) : "",
                            participantes: a.participantes,
                            descricao: a.descricao,
                            ator: a.ator,
                            periodoLetivo: a.peiperiodoletivo,
                          });
                        }}
                      />
                      <BotaoDeletar
                        id={a.id}
                        axiosInstance={DBATA}
                        onDeletarSucesso={recuperaAtas}
                      />
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
