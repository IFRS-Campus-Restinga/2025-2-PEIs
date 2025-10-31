import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./componenteCurricular.css";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";

function ComponenteCurricular() {
  const { addAlert, clearFieldAlert } = useAlert();

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

  const formRef = useRef(null);
  const editFormRef = useRef(null);

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
    } catch {
      addAlert("Erro ao recuperar componentes!", "error");
    }
  }

  async function recuperaDisciplinas() {
    try {
      const res = await axios.get(DISCIPLINAS_API);
      setDisciplinasCadastradas(Array.isArray(res.data) ? res.data : res.data.results || []);
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

  // ------------------ FORM DE CADASTRO ------------------
async function adicionaComponenteCurricular(e) {
  e.preventDefault();
  const mensagens = validaCampos(form, e.target);

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
      // Exibe mensagens inline específicas do backend
      Object.entries(err.response.data).forEach(([field, msgs]) => {
        addAlert(msgs.join(", "), "error", { fieldName: field });
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

// ------------------ FORM DE EDIÇÃO ------------------
async function atualizaComponenteCurricular(e, id) {
  e.preventDefault();
  const mensagens = validaCampos(editForm, document.getElementById("editForm"));

  if (mensagens.length > 0) {
    mensagens.forEach((m) =>
      addAlert(m.message, "error", { fieldName: m.fieldName })
    );
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
      // Exibe mensagens inline específicas do backend
      Object.entries(err.response.data).forEach(([field, msgs]) => {
        addAlert(msgs.join(", "), "error", { fieldName: field });
      });

      // Monta o texto completo para o toast
      const messages = Object.entries(err.response.data)
        .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
        .join("\n");

      addAlert(`Erro ao editar:\n${messages}`, "error");
    } else {
      addAlert("Erro ao editar (erro desconhecido).", "error");
    }
  }
}


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
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    });
  }

  return (
    <div className="componente-container">
      <h1>Gerenciar Componentes Curriculares</h1>

      <h2>Cadastrar Componente Curricular</h2>
      <form ref={formRef} className="componente-form" onSubmit={adicionaComponenteCurricular}>
        <label>Objetivos:</label>
        <input
          name="objetivos"
          value={form.objetivos}
          onChange={(e) => {
            setForm({ ...form, objetivos: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("objetivos");
            }
          }
        }
        />
        <FieldAlert fieldName="objetivos" />

        <label>Conteúdo Programático:</label>
        <input
          name="conteudo_prog"
          value={form.conteudo_prog}
          onChange={(e) => {
            setForm({ ...form, conteudo_prog: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("conteudo_prog");
            }
          }
        }
        />
        <FieldAlert fieldName="conteudo_prog" />

        <label>Metodologia:</label>
        <textarea
          name="metodologia"
          value={form.metodologia}
          onChange={(e) => {
            setForm({ ...form, metodologia: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("metodologia");
            }
          }
        }
        />
        <FieldAlert fieldName="metodologia" />

        <label>Disciplina:</label>
        <select
          name="disciplinaId"
          value={form.disciplinaId}
          onChange={(e) => {
            setForm({ ...form, disciplinaId: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("disciplinaId");
            }
          }
        }
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
          onChange={(e) => {
            setForm({ ...form, periodoLetivoId: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("periodoLetivoId");
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
        <FieldAlert fieldName="periodoLetivoId" />

        <button type="submit">Adicionar</button>
      </form>

      <div className="componente-list">
        <h3>Componentes Cadastrados</h3>
        <ul>
          {componenteCurricularCadastrado.length === 0 && <li>Nenhum componente cadastrado.</li>}

          {componenteCurricularCadastrado.map((d) => (
            <li key={d.id} className="componente-item">
              {editId === d.id ? (
                <form ref={editFormRef} onSubmit={(e) => atualizaComponenteCurricular(e, d.id)}>
                  <label>Objetivos:</label>
                  <input
                    name="objetivos"
                    value={editForm.objetivos}
                    onChange={(e) => {
                      setEditForm({ ...editForm, objetivos: e.target.value })
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("objetivos");
                      }
                    }
                  }
                  />
                  <FieldAlert fieldName="objetivos" />

                  <label>Conteúdo Programático:</label>
                  <input
                    name="conteudo_prog"
                    value={editForm.conteudo_prog}
                    onChange={(e) => {
                      setEditForm({ ...editForm, conteudo_prog: e.target.value })
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("conteudo_prog");
                      }
                    }
                  }
                  />
                  <FieldAlert fieldName="conteudo_prog" />

                  <label>Metodologia:</label>
                  <textarea
                    name="metodologia"
                    value={editForm.metodologia}
                    onChange={(e) => {
                      setEditForm({ ...editForm, metodologia: e.target.value })
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("metodologia");
                      }
                    }
                  }
                  />
                  <FieldAlert fieldName="metodologia" />

                  <label>Disciplina:</label>
                  <select
                    name="disciplinaId"
                    value={editForm.disciplinaId}
                    onChange={(e) => {
                      setEditForm({ ...editForm, disciplinaId: e.target.value })
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("disciplinaId");
                      }
                    }
                  }
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
                    onChange={(e) => {
                      setEditForm({ ...editForm, periodoLetivoId: e.target.value })
                      if (e.target.value.trim() !== "") {
                        clearFieldAlert("periodoLetivoId");
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
                  <FieldAlert fieldName="periodoLetivoId" />

                  <div className="btn-group">
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>Objetivos:</strong> {d.objetivos || "-"} <br />
                  <strong>Conteúdo:</strong> {d.conteudo_prog || "-"} <br />
                  <strong>Metodologia:</strong> {d.metodologia || "-"} <br />
                  <strong>Disciplina:</strong>{" "}
                  {disciplinasCadastradas.find((disc) => disc.id === Number(d.disciplinas))?.nome ||
                    "-"}{" "}
                  <br />
                  <strong>Período Letivo:</strong>{" "}
                  {periodosLetivos.find((p) => p.id === Number(d.periodo_letivo))
                    ?.periodo_principal || "-"}{" "}
                  <br />
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

      <BotaoVoltar/>
    </div>
  );
}

export default ComponenteCurricular;
