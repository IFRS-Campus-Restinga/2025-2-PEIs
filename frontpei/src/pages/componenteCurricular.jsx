import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./componenteCurricular.css";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";

function ComponenteCurricular() {
  const { addAlert } = useAlert();

  const DBCOMPONENTECURRICULAR = axios.create({
    baseURL: import.meta.env.VITE_COMPONENTE_CURRICULAR,
  });
  const DISCIPLINAS_API = import.meta.env.VITE_DISCIPLINAS_URL;
  const PERIODO_LETIVO_API = import.meta.env.VITE_PEIPERIODOLETIVO_URL;

  const [form, setForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "",
    periodoLetivoId: "",
  });

  const [componenteCurricularCadastrado, setComponenteCurricularCadastrado] = useState([]);
  const [disciplinasCadastradas, setDisciplinasCadastradas] = useState([]);
  const [periodosLetivos, setPeriodosLetivos] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "",
    periodoLetivoId: "",
  });

  // Recupera dados iniciais
  useEffect(() => {
    recuperaComponenteCurricular();
    recuperaDisciplinas();
    recuperaPeriodosLetivos();
  }, []);

  async function recuperaComponenteCurricular() {
    try {
      const res = await DBCOMPONENTECURRICULAR.get("/");
      setComponenteCurricularCadastrado(
        Array.isArray(res.data) ? res.data : res.data.results || []
      );
    } catch (err) {
      console.error(err);
      addAlert("Erro ao recuperar componentes!", "error");
    }
  }

  async function recuperaDisciplinas() {
    try {
      const res = await axios.get(DISCIPLINAS_API);
      setDisciplinasCadastradas(
        Array.isArray(res.data) ? res.data : res.data.results || []
      );
    } catch (err) {
      console.error(err);
      addAlert("Erro ao recuperar disciplinas!", "error");
    }
  }

  async function recuperaPeriodosLetivos() {
    try {
      const res = await axios.get(PERIODO_LETIVO_API);
      setPeriodosLetivos(
        Array.isArray(res.data) ? res.data : res.data.results || []
      );
    } catch (err) {
      console.error(err);
      addAlert("Erro ao recuperar períodos letivos!", "error");
    }
  }

  // ------------------ FORM DE CADASTRO ------------------
  async function adicionaComponenteCurricular(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);

    if (mensagens.length > 0) {
      // ALERTS INLINE
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      // TOAST GERAL
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
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

      setForm({
        objetivos: "",
        conteudo_prog: "",
        metodologia: "",
        disciplinaId: "",
        periodoLetivoId: "",
      });

      recuperaComponenteCurricular();
      addAlert("Componente cadastrado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" \n ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  }

  // ------------------ FORM DE EDIÇÃO ------------------
  async function atualizaComponenteCurricular(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));

    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
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
      setEditForm({
        objetivos: "",
        conteudo_prog: "",
        metodologia: "",
        disciplinaId: "",
        periodoLetivoId: "",
      });

      recuperaComponenteCurricular();
      addAlert("Componente atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" \n ");
        addAlert(`Erro ao editar ${messages}`, "error");
      } else {
        addAlert("Erro ao editar (erro desconhecido).", "error");
      }
    }
  }

  // ------------------ DELETAR COMPONENTE ------------------
  function deletaComponenteCurricular(id) {
    addAlert("Deseja realmente deletar este componente?", "confirm", {
      onConfirm: async () => {
        try {
          await DBCOMPONENTECURRICULAR.delete(`/${id}/`);
          recuperaComponenteCurricular();
          addAlert("Componente deletado com sucesso!", "success");
        } catch (err) {
          console.error(err);
          if (err.response?.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join(" \n ");
            addAlert(`Erro ao deletar ${messages}`, "error");
          } else {
            addAlert("Erro ao deletar (erro desconhecido).", "error");
          }
        }
      },
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    });
  }

  // ------------------ RENDER ------------------
  return (
    <div className="componente-container">
      <h1>Gerenciar Componentes Curriculares</h1>

      {/* FORM DE CADASTRO */}
      <h2>Cadastrar Componente Curricular</h2>
      <form className="componente-form" onSubmit={adicionaComponenteCurricular}>
        <label>Objetivos:</label>
        <input
          name="objetivos"
          type="text"
          value={form.objetivos}
          onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
        />
        <FieldAlert fieldName="objetivos" />

        <label>Conteúdo Programático:</label>
        <input
          name="conteudo_prog"
          type="text"
          value={form.conteudo_prog}
          onChange={(e) => setForm({ ...form, conteudo_prog: e.target.value })}
        />
        <FieldAlert fieldName="conteudo_prog" />

        <label>Metodologia:</label>
        <textarea
          name="metodologia"
          value={form.metodologia}
          onChange={(e) => setForm({ ...form, metodologia: e.target.value })}
        />
        <FieldAlert fieldName="metodologia" />

        <label>Disciplina:</label>
        <select
          name="disciplinaId"
          value={form.disciplinaId}
          onChange={(e) => setForm({ ...form, disciplinaId: e.target.value })}
        >
          <option value="">Selecione uma disciplina</option>
          {disciplinasCadastradas.map((disc) => (
            <option key={disc.id} value={disc.id}>
              {disc.nome}
            </option>
          ))}
        </select>
        <FieldAlert fieldName="disciplinaId" />

        <label>Período Letivo:</label>
        <select
          name="periodoLetivoId"
          value={form.periodoLetivoId}
          onChange={(e) => setForm({ ...form, periodoLetivoId: e.target.value })}
        >
          <option value="">Selecione um período letivo</option>
          {periodosLetivos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.periodo_principal} ({p.data_criacao} a {p.data_termino})
            </option>
          ))}
        </select>
        <FieldAlert fieldName="periodoLetivoId" />

        <button type="submit">Adicionar</button>
      </form>

      {/* LISTAGEM E EDIÇÃO */}
      <div className="componente-list">
        <h3>Componentes Cadastrados</h3>
        <ul>
          {componenteCurricularCadastrado.length === 0 && <li>Nenhum componente cadastrado.</li>}

          {componenteCurricularCadastrado.map((d) => (
            <li key={d.id} className="componente-item">
              {editId === d.id ? (
                <div className="edit-container">
                  <form
                    id="editForm"
                    className="componente-form"
                    onSubmit={(e) => atualizaComponenteCurricular(e, d.id)}
                  >
                    <label>Objetivos:</label>
                    <input
                      name="objetivos"
                      type="text"
                      value={editForm.objetivos}
                      onChange={(e) => setEditForm({ ...editForm, objetivos: e.target.value })}
                    />
                    <FieldAlert fieldName="objetivos" />

                    <label>Conteúdo Programático:</label>
                    <input
                      name="conteudo_prog"
                      type="text"
                      value={editForm.conteudo_prog}
                      onChange={(e) => setEditForm({ ...editForm, conteudo_prog: e.target.value })}
                    />
                    <FieldAlert fieldName="conteudo_prog" />

                    <label>Metodologia:</label>
                    <textarea
                      name="metodologia"
                      value={editForm.metodologia}
                      onChange={(e) => setEditForm({ ...editForm, metodologia: e.target.value })}
                    />
                    <FieldAlert fieldName="metodologia" />

                    <label>Disciplina:</label>
                    <select
                      name="disciplinaId"
                      value={editForm.disciplinaId}
                      onChange={(e) => setEditForm({ ...editForm, disciplinaId: e.target.value })}
                    >
                      <option value="">Selecione uma disciplina</option>
                      {disciplinasCadastradas.map((disc) => (
                        <option key={disc.id} value={disc.id}>
                          {disc.nome}
                        </option>
                      ))}
                    </select>
                    <FieldAlert fieldName="disciplinaId" />

                    <label>Período Letivo:</label>
                    <select
                      name="periodoLetivoId"
                      value={editForm.periodoLetivoId}
                      onChange={(e) => setEditForm({ ...editForm, periodoLetivoId: e.target.value })}
                    >
                      <option value="">Selecione um período letivo</option>
                      {periodosLetivos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.periodo_principal} ({p.data_criacao} a {p.data_termino})
                        </option>
                      ))}
                    </select>
                    <FieldAlert fieldName="periodoLetivoId" />

                    <div className="btn-group">
                      <button type="submit">Salvar</button>
                      <button type="button" onClick={() => setEditId(null)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <strong>Objetivos:</strong> {d.objetivos || "-"} <br />
                  <strong>Conteúdo:</strong> {d.conteudo_prog || "-"} <br />
                  <strong>Metodologia:</strong> {d.metodologia || "-"} <br />
                  <strong>Disciplina:</strong>{" "}
                  {disciplinasCadastradas.find((disc) => disc.id === Number(d.disciplinas))?.nome || "-"} <br />
                  <strong>Período Letivo:</strong>{" "}
                  {periodosLetivos.find((p) => p.id === Number(d.periodo_letivo))?.periodo_principal || "-"} <br />

                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(d.id);
                        setEditForm({
                          objetivos: d.objetivos,
                          conteudo_prog: d.conteudo_prog,
                          metodologia: d.metodologia,
                          disciplinaId: d.disciplinas || "",
                          periodoLetivoId: d.periodo_letivo || "",
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => deletaComponenteCurricular(d.id)}>Deletar</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <Link to="/" className="voltar-btn">
        Voltar
      </Link>
    </div>
  );
}

export default ComponenteCurricular;
