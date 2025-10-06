import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./componenteCurricular.css";
import { validaCampos } from "../utils/validaCampos";
import { useAlert } from "../context/AlertContext";

function ComponenteCurricular() {
  const { addAlert } = useAlert();
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

  // Recupera componentes
  async function recuperaComponenteCurricular() {
    try {
      const res = await DBCOMPONENTECURRICULAR.get("/");
      setComponenteCurricularCadastrado(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
      addAlert("Erro ao recuperar componentes!", "error");
    }
  }

  // Recupera disciplinas
  async function recuperaDisciplinas() {
    try {
      const res = await axios.get(DISCIPLINAS_API);
      setDisciplinasCadastradas(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
      addAlert("Erro ao recuperar disciplinas!", "error");
    }
  }

  // Adiciona componente
  async function adicionaComponenteCurricular(e) {
    e.preventDefault();
    const formElement = e.target;
    const mensagens = validaCampos(form, formElement);

    if (mensagens.length > 0) {
      // Junta todas as mensagens em um único texto
      const mensagemUnica = mensagens.join("\n");
      addAlert(mensagemUnica, "warning"); // Apenas um alerta
      return;
    }

    try {
      await DBCOMPONENTECURRICULAR.post("/", {
        objetivos: form.objetivos,
        conteudo_prog: form.conteudo_prog,
        metodologia: form.metodologia,
        disciplinas: Number(form.disciplinaId),
      });
      setForm({ objetivos: "", conteudo_prog: "", metodologia: "", disciplinaId: "" });
      recuperaComponenteCurricular();
      addAlert("Componente cadastrado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  }

  // Atualiza componente
  async function atualizaComponenteCurricular(e, id) {
    e.preventDefault();
    const formElement = document.getElementById("editForm");
    const mensagens = validaCampos(editForm, formElement);

    if (mensagens.length > 0) {
      mensagens.forEach((msg) => addAlert(msg, "warning"));
      return;
    }

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
      addAlert("Componente atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao editar ${messages}`, "error");
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
          if (err.response && err.response.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join(" | ");
            addAlert(`Erro ao deletar ${messages}`, "error");
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
        <input
          type="text"
          name="objetivos"
          value={form.objetivos}
          onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
        />

        <label>Conteúdo Programático:</label>
        <input
          type="text"
          name="conteudo_prog"
          value={form.conteudo_prog}
          onChange={(e) => setForm({ ...form, conteudo_prog: e.target.value })}
        />

        <label>Metodologia:</label>
        <textarea
          name="metodologia"
          value={form.metodologia}
          onChange={(e) => setForm({ ...form, metodologia: e.target.value })}
        />

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

        <button type="submit">Adicionar</button>
      </form>

      <div className="componente-list">
        <h3>Componentes Cadastrados</h3>
        <ul>
          {componenteCurricularCadastrado.length === 0 && <li>Nenhum componente cadastrado.</li>}
          {componenteCurricularCadastrado.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <form id="editForm" className="componente-edit-form" onSubmit={(e) => atualizaComponenteCurricular(e, d.id)}>
                  <label>Objetivos:</label>
                  <input
                    type="text"
                    name="objetivos"
                    value={editForm.objetivos}
                    onChange={(e) => setEditForm({ ...editForm, objetivos: e.target.value })}
                  />

                  <label>Conteúdo Programático:</label>
                  <input
                    type="text"
                    name="conteudo_prog"
                    value={editForm.conteudo_prog}
                    onChange={(e) => setEditForm({ ...editForm, conteudo_prog: e.target.value })}
                  />

                  <label>Metodologia:</label>
                  <textarea
                    name="metodologia"
                    value={editForm.metodologia}
                    onChange={(e) => setEditForm({ ...editForm, metodologia: e.target.value })}
                  />

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

                  <div className="btn-group">
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>Objetivos:</strong> {d.objetivos || "-"} <br />
                  <strong>Conteúdo:</strong> {d.conteudo_prog || "-"} <br />
                  <strong>Metodologia:</strong> {d.metodologia || "-"} <br />
                  <strong>Disciplina:</strong>{" "}
                  {disciplinasCadastradas.find((disc) => disc.id === Number(d.disciplinas))?.nome || "-"} <br />
                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(d.id);
                        setEditForm({
                          objetivos: d.objetivos,
                          conteudo_prog: d.conteudo_prog,
                          metodologia: d.metodologia,
                          disciplinaId: d.disciplinas || "",
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
