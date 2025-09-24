import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


function ComponenteCurricular() {
  const DBCOMPONENTECURRICULAR = axios.create({
    baseURL: import.meta.env.VITE_COMPONENTE_CURRICULAR,
  });

  const DISCIPLINAS_API = import.meta.env.VITE_DISCIPLINAS_URL;

  // Formulário do componente curricular
  const [form, setForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "", // ID da disciplina selecionada
  });

  const [componenteCurricularCadastrado, setComponenteCurricularCadastrado] = useState([]);
  const [disciplinasCadastradas, setDisciplinasCadastradas] = useState([]);

  // Estados para edição
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "",
  });

  // Recupera componentes curriculares
  async function recuperaComponenteCurricular() {
    try {
      const response = await DBCOMPONENTECURRICULAR.get("/");
      const data = response.data;
      setComponenteCurricularCadastrado(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar componente curricular: ", err);
    }
  }

  // Recupera disciplinas
  async function recuperaDisciplinas() {
    try {
      const response = await axios.get(DISCIPLINAS_API);
      const data = response.data;
      setDisciplinasCadastradas(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar disciplinas: ", err);
    }
  }

  // Adiciona novo componente curricular
  async function adicionaComponenteCurricular(event) {
    event.preventDefault();

    if (!form.objetivos || !form.conteudo_prog || !form.metodologia || !form.disciplinaId) {
      alert("Preencha todos os campos antes de cadastrar!");
      return;
    }

    try {
      await DBCOMPONENTECURRICULAR.post("/", {
        objetivos: form.objetivos,
        conteudo_prog: form.conteudo_prog,
        metodologia: form.metodologia,
        disciplinas: Number(form.disciplinaId),
      });

      await recuperaComponenteCurricular();
      setForm({ objetivos: "", conteudo_prog: "", metodologia: "", disciplinaId: "" });
    } catch (err) {
      console.error("Erro ao criar componente curricular:", err.response?.data || err);
      alert("Falha ao cadastrar componente curricular!");
    }
  }

  // Deletar componente curricular
  async function deletaComponenteCurricular(id) {
    if (!window.confirm("Tem certeza que deseja deletar este componente curricular?")) return;

    try {
      await DBCOMPONENTECURRICULAR.delete(`/${id}/`);
      await recuperaComponenteCurricular();
    } catch (err) {
      console.error("Erro ao deletar componente curricular:", err);
      alert("Falha ao deletar componente curricular!");
    }
  }

  // Atualizar componente curricular
  async function atualizaComponenteCurricular(id) {
    if (!editForm.objetivos || !editForm.conteudo_prog || !editForm.metodologia || !editForm.disciplinaId) {
      return alert("Preencha todos os campos antes de salvar!");
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
      await recuperaComponenteCurricular();
    } catch (err) {
      console.error("Erro ao atualizar componente curricular:", err.response?.data || err);
      alert("Falha ao atualizar componente curricular!");
    }
  }

  useEffect(() => {
    recuperaComponenteCurricular();
    recuperaDisciplinas();
  }, []);

  return (
    <div className="componente-container">
      <h1>Gerenciar Componentes Curriculares</h1>
      <h2>Cadastrar Componente Curricular</h2>

      <form onSubmit={adicionaComponenteCurricular}>
        <label>Objetivos:</label>
        <br />
        <input
          type="text"
          value={form.objetivos}
          onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
        />
        <br />

        <label>Conteúdo Programático:</label>
        <br />
        <input
          type="text"
          value={form.conteudo_prog}
          onChange={(e) => setForm({ ...form, conteudo_prog: e.target.value })}
        />
        <br />

        <label>Metodologia:</label>
        <br />
        <textarea
          value={form.metodologia}
          onChange={(e) => setForm({ ...form, metodologia: e.target.value })}
        />
        <br />

        <label>Disciplina:</label>
        <br />
        <select
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
        <br />

        <button type="submit">Adicionar componente curricular</button>
      </form>

      <div className="componente-list">
        <h3>Componentes Curriculares Cadastrados</h3>
        <ul>
          {componenteCurricularCadastrado.length === 0 && <li>Nenhum componente cadastrado.</li>}

          {componenteCurricularCadastrado.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <>
                  <input
                    type="text"
                    value={editForm.objetivos}
                    onChange={(e) => setEditForm({ ...editForm, objetivos: e.target.value })}
                    placeholder="Objetivos"
                  />
                  <input
                    type="text"
                    value={editForm.conteudo_prog}
                    onChange={(e) => setEditForm({ ...editForm, conteudo_prog: e.target.value })}
                    placeholder="Conteúdo Programático"
                  />
                  <textarea
                    value={editForm.metodologia}
                    onChange={(e) => setEditForm({ ...editForm, metodologia: e.target.value })}
                    placeholder="Metodologia"
                  />
                  <select
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
                    <button onClick={() => atualizaComponenteCurricular(d.id)}>Salvar</button>
                    <button onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <strong>Objetivos:</strong> {d.objetivos || "-"} <br />
                  <strong>Conteúdo:</strong> {d.conteudo_prog || "-"} <br />
                  <strong>Metodologia:</strong> {d.metodologia || "-"} <br />
                  <strong>Disciplina:</strong> {d.disciplinas?.nome || d.disciplinas || "-"} <br />

                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(d.id);
                        setEditForm({
                          objetivos: d.objetivos,
                          conteudo_prog: d.conteudo_prog,
                          metodologia: d.metodologia,
                          disciplinaId: d.disciplinas?.id || "",
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

      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
}

export default ComponenteCurricular;
