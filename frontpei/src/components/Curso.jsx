import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Cursos() {
  const [cursosCadastrados, setCursosCadastrados] = useState([]);
  const [curso, setCurso] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);
  const [nivel, setNivel] = useState("Não informado");
  const [coordSelecionado, setCoordSelecionado] = useState("")
  const [coordCurso, setCoordCurso] = useState([])

  const niveis = [
    { label: "Superior", value: "Superior" },
    { label: "Ensino Médio", value: "Ensino Médio" },
    { label: "Não informado", value: "Não informado" }
  ];

  const DBDISCIPLINAS = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const DBCURSOS = axios.create({ baseURL: import.meta.env.VITE_CURSOS_URL});
  const DBCOORDENADOR = axios.create({baseURL: import.meta.env.VITE_COORDENADORCURSO_URL})

  // Recupera disciplinas
  async function recuperaDisciplinas() {
    try {
      const response = await DBDISCIPLINAS.get("");
      const data = response.data;
      setDisciplinas(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar disciplinas: ", err);
    }
  }

  // Recupera cursos
  async function recuperaCursos() {
    try {
      const response = await DBCURSOS.get("/");
      const data = response.data;
      setCursosCadastrados(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar cursos: ", err);
    }
  }

  // Recupera coordenadores
  async function recuperaCoord(){
    try{
      const response = await DBCOORDENADOR.get("")
      const data = response.data
      setCoordCurso(Array.isArray(data) ? data : data.results)
    }catch (err){
      console.error("Erro ao buscar coordenadores: ", err)
    }
  }

  // Adiciona curso
  async function adicionaCurso(event) {
    event.preventDefault();

    if (!curso.trim()) {
      alert("Informe o nome do curso!");
      return;
    }

    const novo = {
      name: curso.trim(),
      nivel,
      disciplinas_ids: disciplinasSelecionadas
    };

    try {
      await DBCURSOS.post("/", novo);
      await recuperaCursos();
      setCurso("");
      setDisciplinasSelecionadas([]);
      setNivel("Não informado");
    } catch (err) {
      console.error("Erro ao criar curso:", err);
      alert("Falha ao cadastrar curso!");
    }
  }

  // Lida com seleção múltipla de disciplinas
  function handleSelectChange(e) {
    const options = Array.from(e.target.selectedOptions, (option) => parseInt(option.value));
    setDisciplinasSelecionadas(options);
  }

  useEffect(() => {
    recuperaCursos();
    recuperaDisciplinas();
    recuperaCoord();
  }, []);

  return (
    <>
      <h1>Gerenciar Cursos</h1>

      <h2>Cadastrar Curso</h2>
      <form onSubmit={adicionaCurso}>
        <label>Nome do curso:</label>
        <br />
        <textarea value={curso} onChange={(e) => setCurso(e.target.value)} />

        <br />
        <label>Disciplinas:</label>
        <br />
        <select
          multiple
          value={disciplinasSelecionadas}
          onChange={handleSelectChange}
          style={{ minHeight: "100px", width: "200px" }}
        >
          {disciplinas.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>

        <br />
        <label>Nível:</label>
        <br />
        <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
          {niveis.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
        <br />

        <label>Coordenador:</label>
        <br/>
        <select value={coordSelecionado} onChange={(e) => setCoordSelecionado(e.target.value)}>
          <option value="">Não informado</option>
          {coordCurso.map((cc) => (
            <option key={cc.id} value={cc.id}>
              {cc.nome}
            </option>
          ))}
        </select>
        <br/>
        <button type="submit">Adicionar curso</button>
      </form>

      <div>
        <h3>Cursos cadastrados</h3>
        {cursosCadastrados.length === 0 ? (
          <p>Nenhum curso cadastrado</p>
        ) : (
          <ul>
            {cursosCadastrados.map((cc) => (
              <li key={cc.id}>
                <strong>{cc.name}</strong>
                <br />
                Nível: {cc.nivel}
                <br />
                Disciplinas: {cc.disciplinas && cc.disciplinas.length > 0
                  ? cc.disciplinas.map((d) => d.nome).join(", ")
                  : "Nenhuma"}
                <br/>
                Coordenador: {cc.coordCurso}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button>
        <Link to="/">Voltar</Link>
      </button>
    </>
  );
}

export default Cursos;
