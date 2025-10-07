import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./componenteCurricular.css";
import { validaCampos } from "../utils/validaCampos";
import { useAlert } from "../context/AlertContext";

function Curso() {
  const { addAlert } = useAlert();
  const DBCURSOS = axios.create({ baseURL: import.meta.env.VITE_CURSOS_URL });
  const DBDISCIPLINAS = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const DBCOORDENADOR = axios.create({ baseURL: import.meta.env.VITE_COORDENADORCURSO_URL });

  const [form, setForm] = useState({
    nome: "",
    nivel: "Não informado",
    coordenador: "",
    disciplinas: [],
  });

  const [cursosCadastrados, setCursosCadastrados] = useState([]);
  const [coordenadores, setCoordenadores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    nivel: "Não informado",
    coordenador: "",
    disciplinas: [],
  });

  async function recuperaCursos() {
    try {
      const res = await DBCURSOS.get("/");
      setCursosCadastrados(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function recuperaDisciplinas() {
    try {
      const res = await DBDISCIPLINAS.get("/");
      setDisciplinas(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function recuperaCoordenadores() {
    try {
      const res = await DBCOORDENADOR.get("/");
      setCoordenadores(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function adicionaCurso(e) {
    e.preventDefault();
    const formElement = e.target;
    const mensagens = validaCampos(form, formElement);

    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    const novoCurso = {
      name: form.nome.trim(),
      nivel: form.nivel,
      coordenador_id: form.coordenador,
      disciplinas_ids: form.disciplinas,
    };

    try {
      await DBCURSOS.post("/", novoCurso);
      setForm({ nome: "", nivel: "Não informado", coordenador: "", disciplinas: [] });
      await recuperaCursos();
      addAlert("Curso cadastrado com sucesso!", "success");
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

  async function deletaCurso(id) {
    addAlert("Deseja realmente deletar este curso?", "confirm", {
      onConfirm: async () => {
        try {
          await DBCURSOS.delete(`/${id}/`);
          recuperaCursos();
          addAlert("Curso deletado com sucesso!", "success");
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

  async function atualizaCurso(e, id) {
    e.preventDefault();
    const formElement = document.getElementById("editForm");
    const mensagens = validaCampos(editForm, formElement);

    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    const cursoAtualizado = {
      name: editForm.nome.trim(),
      nivel: editForm.nivel,
      coordenador_id: editForm.coordenador,
      disciplinas_ids: editForm.disciplinas,
    };

    try {
      await DBCURSOS.put(`/${id}/`, cursoAtualizado);
      setEditId(null);
      setEditForm({ nome: "", nivel: "Não informado", coordenador: "", disciplinas: [] });
      recuperaCursos();
      addAlert("Curso atualizado com sucesso!", "success");
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

  useEffect(() => {
    recuperaCursos();
    recuperaDisciplinas();
    recuperaCoordenadores();
  }, []);

  return (
    <div className="componente-container">
      <h1>Gerenciar Cursos</h1>
      <h2>Cadastrar Curso</h2>

      <form className="componente-form" onSubmit={adicionaCurso}>
        <label>Nome do curso:</label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />

        <label>Nível:</label>
        <select
          name="nivel"
          value={form.nivel}
          onChange={(e) => setForm({ ...form, nivel: e.target.value })}
        >
          <option value="Não informado">Não informado</option>
          <option value="Técnico">Técnico</option>
          <option value="Graduação">Graduação</option>
          <option value="Pós-Graduação">Pós-Graduação</option>
        </select>

        <label>Coordenador:</label>
        <select
          name="coordenador"
          value={form.coordenador}
          onChange={(e) => setForm({ ...form, coordenador: e.target.value })}
        >
          <option value="">Selecione um coordenador</option>
          {coordenadores.map((coord) => (
            <option key={coord.id} value={coord.id}>
              {coord.nome}
            </option>
          ))}
        </select>

        <label>Disciplinas:</label>
        <select
          multiple
          name="disciplinas"
          value={form.disciplinas}
          onChange={(e) =>
            setForm({
              ...form,
              disciplinas: Array.from(e.target.selectedOptions, (opt) => opt.value),
            })
          }
        >
          {disciplinas.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>

        <button type="submit">Adicionar Curso</button>
      </form>

      <div className="componente-list">
        <h3>Cursos Cadastrados</h3>
        <ul>
          {cursosCadastrados.length === 0 && <li>Nenhum curso cadastrado.</li>}
          {cursosCadastrados.map((c) => (
            <li key={c.id}>
              {editId === c.id ? (
                <form id="editForm" className="componente-edit-form" onSubmit={(e) => atualizaCurso(e, c.id)}>
                  <label>Nome:</label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  />

                  <label>Nível:</label>
                  <select
                    value={editForm.nivel}
                    onChange={(e) => setEditForm({ ...editForm, nivel: e.target.value })}
                  >
                    <option value="Não informado">Não informado</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Graduação">Graduação</option>
                    <option value="Pós-Graduação">Pós-Graduação</option>
                  </select>

                  <label>Coordenador:</label>
                  <select
                    value={editForm.coordenador}
                    onChange={(e) => setEditForm({ ...editForm, coordenador: e.target.value })}
                  >
                    <option value="">Selecione um coordenador</option>
                    {coordenadores.map((coord) => (
                      <option key={coord.id} value={coord.id}>
                        {coord.nome}
                      </option>
                    ))}
                  </select>

                  <label>Disciplinas:</label>
                  <select
                    multiple
                    value={editForm.disciplinas}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        disciplinas: Array.from(e.target.selectedOptions, (opt) => opt.value),
                      })
                    }
                  >
                    {disciplinas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>

                  <div className="btn-group">
                    <button type="submit">Salvar</button>
                    <button onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>Nome:</strong> {c.name || "-"} <br />
                  <strong>Nível:</strong> {c.nivel || "-"} <br />
                  <strong>Coordenador:</strong> {c.coordenador ? c.coordenador.nome : "Não informado"} <br />
                  <strong>Disciplinas:</strong>{" "}
                  {c.disciplinas && c.disciplinas.length > 0
                ? c.disciplinas.map(d => d.nome).join(", ")
                : "Nenhuma"} <br />
                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(c.id);
                        setEditForm({
                          nome: c.name,
                          nivel: c.nivel,
                          coordenador: c.coordenador_id || "",
                          disciplinas: c.disciplinas_ids || [],
                        });
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => deletaCurso(c.id)}>Deletar</button>
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

export default Curso;
