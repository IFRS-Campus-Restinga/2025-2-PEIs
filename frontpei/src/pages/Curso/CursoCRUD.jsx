import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import ErrorMessage from "../../components/errorMessage/ErrorMessage";
import "../curso.css";

export default function CursosCRUD() {
  const { id } = useParams(); // se existir, é edição
  const navigate = useNavigate();

  const [curso, setCurso] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);
  const [nivel, setNivel] = useState("Não informado");
  const [coordSelecionado, setCoordSelecionado] = useState("");
  const [coordCurso, setCoordCurso] = useState([]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const niveis = [
    { label: "Superior", value: "Superior" },
    { label: "Ensino Médio", value: "Ensino Médio" },
    { label: "Não informado", value: "Não informado" }
  ];

  const DBDISCIPLINAS = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });
  const DBCURSOS = axios.create({ baseURL: import.meta.env.VITE_CURSOS_URL });
  const DBCOORDENADOR = axios.create({ baseURL: import.meta.env.VITE_COORDENADORCURSO_URL });

  useEffect(() => {
    async function fetchData() {
      try {
        const [discipResponse, coordResponse] = await Promise.all([
          DBDISCIPLINAS.get("/"),
          DBCOORDENADOR.get("/")
        ]);
        setDisciplinas(Array.isArray(discipResponse.data) ? discipResponse.data : discipResponse.data.results || []);
        setCoordCurso(Array.isArray(coordResponse.data) ? coordResponse.data : coordResponse.data.results || []);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setErro("Não foi possível carregar disciplinas e coordenadores.");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (id) {
      async function carregarCurso() {
        try {
          const res = await DBCURSOS.get(`/${id}/`);
          setCurso(res.data.name);
          setNivel(res.data.nivel);
          setCoordSelecionado(res.data.coordenador ? res.data.coordenador.id : "");
          setDisciplinasSelecionadas(res.data.disciplinas.map(d => d.id));
        } catch (err) {
          console.error("Erro ao carregar curso:", err);
          setErro("Não foi possível carregar o curso.");
        }
      }
      carregarCurso();
    }
  }, [id]);

  async function salvarCurso(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!curso.trim()) {
      setErro("Informe o nome do curso!");
      return;
    }

    const payload = {
      name: curso.trim(),
      nivel,
      coordenador_id: coordSelecionado,
      disciplinas_ids: disciplinasSelecionadas
    };

    try {
      if (id) {
        await DBCURSOS.put(`/${id}/`, payload);
        setSucesso("Curso atualizado com sucesso!");
      } else {
        await DBCURSOS.post("/", payload);
        setSucesso("Curso cadastrado com sucesso!");
      }

      setTimeout(() => navigate("/curso"), 1500);
    } catch (err) {
      console.error("Erro ao salvar curso:", err);
      setErro("Falha ao salvar curso!");
    }
  }

  return (
    <div className="cursos-container">
      <h1>{id ? "Editar Curso" : "Cadastrar Curso"}</h1>

      <ErrorMessage message={erro} />
      {sucesso && <p style={{ color: "green", textAlign: "center" }}>{sucesso}</p>}

      <form className="cursos-form" onSubmit={salvarCurso}>
        <label>Nome do curso:</label>
        <input type="text" value={curso} onChange={(e) => setCurso(e.target.value)} /><br />

        <label>Disciplinas:</label>
        <div className="disciplinas-checkboxes">
          {disciplinas.map(d => (
            <label key={d.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                value={d.id}
                checked={disciplinasSelecionadas.includes(d.id)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setDisciplinasSelecionadas(prev =>
                    prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
                  );
                }}
              />
              {d.nome}
            </label>
          ))}
        </div>

        <label>Nível:</label>
        <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
          {niveis.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
        </select><br />

        <label>Coordenador:</label>
        <select value={coordSelecionado} onChange={(e) => setCoordSelecionado(e.target.value)}>
          <option value="">Não informado</option>
          {coordCurso.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select><br />

        <button type="submit">{id ? "Salvar alterações" : "Adicionar curso"}</button>
      </form>

      <Link to="/curso" className="voltar-btn">Voltar</Link>
    </div>
  );
}
