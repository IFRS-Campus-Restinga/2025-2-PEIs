import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./curso.css";

function Cursos() {
  const [cursosCadastrados, setCursosCadastrados] = useState([]);
  const [curso, setCurso] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);
  const [nivel, setNivel] = useState("Não informado");
  const [coordSelecionado, setCoordSelecionado] = useState("");
  const [coordCurso, setCoordCurso] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editCurso, setEditCurso] = useState("");
  const [editDisciplinas, setEditDisciplinas] = useState([]);
  const [editNivel, setEditNivel] = useState("Não informado");
  const [editCoord, setEditCoord] = useState("");

  const niveis = [
    { label: "Superior", value: "Superior" },
    { label: "Ensino Médio", value: "Ensino Médio" },
    { label: "Não informado", value: "Não informado" }
  ];

  const DBDISCIPLINAS = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const DBCURSOS = axios.create({ baseURL: import.meta.env.VITE_CURSOS_URL });
  const DBCOORDENADOR = axios.create({ baseURL: import.meta.env.VITE_COORDENADORCURSO_URL });

  async function recuperaDisciplinas() {
    try {
      const response = await DBDISCIPLINAS.get("");
      const data = response.data;
      setDisciplinas(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar disciplinas: ", err);
    }
  }

  async function recuperaCursos() {
    try {
      const response = await DBCURSOS.get("/");
      const data = response.data;
      setCursosCadastrados(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar cursos: ", err);
    }
  }

  async function recuperaCoord() {
    try {
      const response = await DBCOORDENADOR.get("");
      const data = response.data;
      setCoordCurso(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar coordenadores: ", err);
    }
  }

  async function adicionaCurso(event) {
    event.preventDefault();
    if (!curso.trim()) return alert("Informe o nome do curso!");

    const novo = {
      name: curso.trim(),
      nivel,
      disciplinas_ids: disciplinasSelecionadas,
      coordenador_id: coordSelecionado
    };

    try {
      await DBCURSOS.post("/", novo);
      await recuperaCursos();
      setCurso("");
      setDisciplinasSelecionadas([]);
      setNivel("Não informado");
      setCoordSelecionado("");
    } catch (err) {
      console.error("Erro ao criar curso:", err);
      alert("Falha ao cadastrar curso!");
    }
  }

  async function deletaCurso(id) {
    if (!window.confirm("Tem certeza que deseja deletar este curso?")) return;
    try {
      await DBCURSOS.delete(`/${id}/`);
      await recuperaCursos();
    } catch (err) {
      console.error("Erro ao deletar curso:", err);
      alert("Falha ao deletar curso!");
    }
  }

  async function atualizaCurso(id) {
    if (!editCurso.trim()) return alert("Informe o nome do curso!");

    const atualizado = {
      name: editCurso.trim(),
      nivel: editNivel,
      disciplinas_ids: editDisciplinas,
      coordenador_id: editCoord
    };

    try {
      await DBCURSOS.put(`/${id}/`, atualizado);
      setEditId(null);
      setEditCurso("");
      setEditDisciplinas([]);
      setEditNivel("Não informado");
      setEditCoord("");
      await recuperaCursos();
    } catch (err) {
      console.error("Erro ao atualizar curso:", err);
      alert("Falha ao atualizar curso!");
    }
  }

  useEffect(() => {
    recuperaCursos();
    recuperaDisciplinas();
    recuperaCoord();
  }, []);

  return (
    <div className="cursos-container">
      <h1>Gerenciar Cursos</h1>

      <h2>Cadastrar Curso</h2>
      <form className="cursos-form" onSubmit={adicionaCurso}>
        <label>Nome do curso:</label><br />
        <textarea value={curso} onChange={(e) => setCurso(e.target.value)} /><br />

        <label>Disciplinas:</label>
        <div className="disciplinas-checkboxes">
          {disciplinas.map((d) => (
            <label key={d.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                value={d.id}
                checked={disciplinasSelecionadas.includes(d.id)}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  setDisciplinasSelecionadas((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                  );
                }}
              />
              {d.nome}
            </label>
          ))}
        </div>

        <label>Nível:</label><br />
        <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
          {niveis.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
        </select><br />

        <label>Coordenador:</label><br />
        <select value={coordSelecionado} onChange={(e) => setCoordSelecionado(e.target.value)}>
          <option value="">Não informado</option>
          {coordCurso.map(cc => <option key={cc.id} value={cc.id}>{cc.nome}</option>)}
        </select><br />

        <button type="submit">Adicionar curso</button>
      </form>

      <div className="cursos-list">
        <h3>Cursos cadastrados</h3>
        <ul>
          {cursosCadastrados.length === 0 && <p>Nenhum curso cadastrado</p>}
          {cursosCadastrados.map(c => (
            <li key={c.id}>
              {editId === c.id ? (
                <>
                  <input value={editCurso} onChange={(e) => setEditCurso(e.target.value)} />

                  <div className="disciplinas-checkboxes">
                    {disciplinas.map((d) => (
                      <label key={d.id} style={{ display: "block" }}>
                        <input
                          type="checkbox"
                          value={d.id}
                          checked={editDisciplinas.includes(d.id)}
                          onChange={(e) => {
                            const id = parseInt(e.target.value);
                            setEditDisciplinas((prev) =>
                              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                            );
                          }}
                        />
                        {d.nome}
                      </label>
                    ))}
                  </div>

                  <select value={editNivel} onChange={(e) => setEditNivel(e.target.value)}>
                    {niveis.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>

                  <select value={editCoord} onChange={(e) => setEditCoord(e.target.value)}>
                    <option value="">Não informado</option>
                    {coordCurso.map(cc => <option key={cc.id} value={cc.id}>{cc.nome}</option>)}
                  </select>

                  <button onClick={() => atualizaCurso(c.id)}>Salvar</button>
                </>
              ) : (
                <>
                  <strong>{c.name}</strong><br />
                  Nível: {c.nivel}<br />
                  Disciplinas: {c.disciplinas && c.disciplinas.length > 0
                    ? c.disciplinas.map(d => d.nome).join(", ")
                    : "Nenhuma"}<br />
                  Coordenador: {c.coordenador ? c.coordenador.nome : "Não informado"}<br />

                  <div className="curso-buttons">
                    <button onClick={() => {
                      setEditId(c.id);
                      setEditCurso(c.name);
                      setEditDisciplinas(c.disciplinas.map(d => d.id));
                      setEditNivel(c.nivel);
                      setEditCoord(c.coordenador ? c.coordenador.id : "");
                    }}>Editar</button>
                    <button onClick={() => deletaCurso(c.id)}>Deletar</button>
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

export default Cursos;
