import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../context/AlertContext";
import { validaCampos } from "../utils/validaCampos";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import { API_ROUTES } from "../configs/apiRoutes";
import "../cssGlobal.css";

function ComponenteCurricular() {
  const { addAlert, clearFieldAlert } = useAlert();

  const DBCOMPONENTECURRICULAR = axios.create(API_ROUTES.COMPONENTECURRICULAR);
  const DISCIPLINAS_API = API_ROUTES.DISCIPLINAS;
  const PERIODO_LETIVO_API = API_ROUTES.PEIPERIODOLETIVO;

  const [form, setForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "",
    periodoLetivoId: "",
  });

  const [componentes, setComponentes] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [periodosLetivos, setPeriodosLetivos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "",
    periodoLetivoId: "",
  });

  useEffect(() => {
    recuperaComponentes();
    recuperaDisciplinas();
    recuperaPeriodosLetivos();
  }, []);

  async function recuperaComponentes() {
    try {
      const res = await DBCOMPONENTECURRICULAR.get("/");
      setComponentes(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      addAlert("Erro ao recuperar componentes!", "error");
    }
  }

  async function recuperaDisciplinas() {
    try {
      const res = await axios.get(DISCIPLINAS_API);
      setDisciplinas(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      addAlert("Erro ao recuperar disciplinas!", "error");
    }
  }

  async function recuperaPeriodosLetivos() {
    try {
      const res = await axios.get(PERIODO_LETIVO_API);
      setPeriodosLetivos(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      addAlert("Erro ao recuperar períodos letivos!", "error");
    }
  }

  // CADASTRO
  async function adicionaComponente(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBCOMPONENTECURRICULAR.post("/", {
        objetivos: form.objetivos,
        conteudo_prog: form.conteudo_prog,
        metodologia: form.metodologia,
        disciplinas: Number(form.disciplinaId),
        periodo_letivo: Number(form.periodoLetivoId),
      });

      setForm({ objetivos: "", conteudo_prog: "", metodologia: "", disciplinaId: "", periodoLetivoId: "" });
      recuperaComponentes();
      addAlert("Componente cadastrado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
          .join("\n");
        addAlert(`Erro ao cadastrar:\n${msg}`, "error");
      } else {
        addAlert("Erro ao cadastrar componente.", "error");
      }
    }
  }

  // EDIÇÃO
  async function atualizaComponente(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` }));
      addAlert("Campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBCOMPONENTECURRICULAR.put(`/${id}/`, {
        objetivos: editForm.objetivos,
        conteudo_prog: editForm.conteudo_prog,
        metodologia: editForm.metodologia,
        disciplinas: Number(editForm.disciplinaId),
        periodo_letivo: Number(editForm.periodoLetivoId),
      });

      setEditId(null);
      setEditForm({ objetivos: "", conteudo_prog: "", metodologia: "", disciplinaId: "", periodoLetivoId: "" });
      recuperaComponentes();
      addAlert("Componente atualizado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: `edit-${f}` });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
          .join("\n");
        addAlert(`Erro ao atualizar:\n${msg}`, "error");
      } else {
        addAlert("Erro ao atualizar componente.", "error");
      }
    }
  }

  return (
    <div className="container-padrao">
      <h1>Gerenciar Componentes Curriculares</h1>

      {/* FORMULÁRIO DE CADASTRO */}
      <h2>Cadastrar Componente</h2>
      <form className="form-padrao" onSubmit={adicionaComponente}>
        <label>Objetivos:</label>
        <textarea
          name="objetivos"
          value={form.objetivos}
          onChange={(e) => {
            setForm({ ...form, objetivos: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("objetivos");
          }}
          placeholder="Descreva os objetivos..."
        />
        <FieldAlert fieldName="objetivos" />

        <label>Conteúdo Programático:</label>
        <textarea
          name="conteudo_prog"
          value={form.conteudo_prog}
          onChange={(e) => {
            setForm({ ...form, conteudo_prog: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("conteudo_prog");
          }}
          placeholder="Liste os conteúdos..."
        />
        <FieldAlert fieldName="conteudo_prog" />

        <label>Metodologia:</label>
        <textarea
          name="metodologia"
          value={form.metodologia}
          onChange={(e) => {
            setForm({ ...form, metodologia: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("metodologia");
          }}
          placeholder="Descreva a metodologia..."
        />
        <FieldAlert fieldName="metodologia" />

        <label>Disciplina:</label>
        <select
          name="disciplinaId"
          value={form.disciplinaId}
          onChange={(e) => {
            setForm({ ...form, disciplinaId: e.target.value });
            if (e.target.value) clearFieldAlert("disciplinaId");
          }}
        >
          <option value="">Selecione...</option>
          {disciplinas.map((d) => (
            <option key={d.id} value={d.id}>{d.nome}</option>
          ))}
        </select>
        <FieldAlert fieldName="disciplinaId" />

        <label>Período Letivo:</label>
        <select
          name="periodoLetivoId"
          value={form.periodoLetivoId}
          onChange={(e) => {
            setForm({ ...form, periodoLetivoId: e.target.value });
            if (e.target.value) clearFieldAlert("periodoLetivoId");
          }}
        >
          <option value="">Selecione...</option>
          {periodosLetivos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.periodo_principal} ({p.data_criacao} - {p.data_termino})
            </option>
          ))}
        </select>
        <FieldAlert fieldName="periodoLetivoId" />
          <br /><br />
        <button type="submit" className="submit-btn">Adicionar Componente</button>
      </form>

      {/* LISTA */}
      <div className="list-padrao">
        <h3>Componentes Cadastrados</h3>
        <ul>
          {componentes.length === 0 && <li>Nenhum componente cadastrado.</li>}

          {componentes.map((c) => (
            <li key={c.id} className="componente-item">
              {editId === c.id ? (
                <form id="editForm" onSubmit={(e) => atualizaComponente(e, c.id)}>
                  <label>Objetivos:</label>
                  <textarea
                    name="objetivos"
                    value={editForm.objetivos}
                    onChange={(e) => {
                      setEditForm({ ...editForm, objetivos: e.target.value });
                      if (e.target.value.trim()) clearFieldAlert("edit-objetivos");
                    }}
                  />
                  <FieldAlert fieldName="edit-objetivos" />

                  <label>Conteúdo Programático:</label>
                  <textarea
                    name="conteudo_prog"
                    value={editForm.conteudo_prog}
                    onChange={(e) => {
                      setEditForm({ ...editForm, conteudo_prog: e.target.value });
                      if (e.target.value.trim()) clearFieldAlert("edit-conteudo_prog");
                    }}
                  />
                  <FieldAlert fieldName="edit-conteudo_prog" />

                  <label>Metodologia:</label>
                  <textarea
                    name="metodologia"
                    value={editForm.metodologia}
                    onChange={(e) => {
                      setEditForm({ ...editForm, metodologia: e.target.value });
                      if (e.target.value.trim()) clearFieldAlert("edit-metodologia");
                    }}
                  />
                  <FieldAlert fieldName="edit-metodologia" />

                  <label>Disciplina:</label>
                  <select
                    name="disciplinaId"
                    value={editForm.disciplinaId}
                    onChange={(e) => {
                      setEditForm({ ...editForm, disciplinaId: e.target.value });
                      if (e.target.value) clearFieldAlert("edit-disciplinaId");
                    }}
                  >
                    <option value="">Selecione...</option>
                    {disciplinas.map((d) => (
                      <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                  </select>
                  <FieldAlert fieldName="edit-disciplinaId" />

                  <label>Período Letivo:</label>
                  <select
                    name="periodoLetivoId"
                    value={editForm.periodoLetivoId}
                    onChange={(e) => {
                      setEditForm({ ...editForm, periodoLetivoId: e.target.value });
                      if (e.target.value) clearFieldAlert("edit-periodoLetivoId");
                    }}
                  >
                    <option value="">Selecione...</option>
                    {periodosLetivos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.periodo_principal} ({p.data_criacao} - {p.data_termino})
                      </option>
                    ))}
                  </select>
                  <FieldAlert fieldName="edit-periodoLetivoId" />

                  <div className="posicao-buttons esquerda">
                    <button type="submit" className="btn-salvar">Salvar</button>
                    <button type="button" className="botao-deletar" onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="componente-detalhe">
                  <strong>Objetivos:</strong> {c.objetivos || "-"} <br />
                  <strong>Conteúdo:</strong> {c.conteudo_prog || "-"} <br />
                  <strong>Metodologia:</strong> {c.metodologia || "-"} <br />
                  <strong>Disciplina:</strong>{" "}
                  {disciplinas.find((d) => d.id === Number(c.disciplinas))?.nome || "-"} <br />
                  <strong>Período:</strong>{" "}
                  {periodosLetivos.find((p) => p.id === Number(c.periodo_letivo))?.periodo_principal || "-"}
                  <div className="posicao-buttons">
                    <BotaoEditar
                      id={c.id}
                      onClickInline={() => {
                        setEditId(c.id);
                        setEditForm({
                          objetivos: c.objetivos || "",
                          conteudo_prog: c.conteudo_prog || "",
                          metodologia: c.metodologia || "",
                          disciplinaId: c.disciplinas || "",
                          periodoLetivoId: c.periodo_letivo || "",
                        });
                      }}
                    />
                    <BotaoDeletar
                      id={c.id}
                      axiosInstance={DBCOMPONENTECURRICULAR}
                      onDeletarSucesso={recuperaComponentes}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <BotaoVoltar />
    </div>
  );
}

export default ComponenteCurricular;