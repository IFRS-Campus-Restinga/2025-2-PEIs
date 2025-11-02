import { useState, useEffect } from "react"; 
import { useNavigate, useParams, Link } from "react-router-dom"; 
import axios from "axios"; 
import ErrorMessage from "../../components/errorMessage/ErrorMessage"; 
import "../Curso.css"; 
import { useAlert } from "../../context/AlertContext";

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
  const [arquivo, setArquivo] = useState(null); //teste arquivo unico 
  const { addAlert } = useAlert();


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
        const [discipResponse, coordResponse] = await Promise.all([ DBDISCIPLINAS.get("/"), DBCOORDENADOR.get("/") ]); 
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
          setArquivo(null); // opcional: limpa o campo de arquivo
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
    
    const formData = new FormData(); 
    formData.append("name", curso.trim()); 
    formData.append("nivel", nivel); 
    formData.append("coordenador_id", coordSelecionado); 
    disciplinasSelecionadas.forEach(d => formData.append("disciplinas_ids", d)); 
    
    if (arquivo) formData.append("arquivo_upload", arquivo);
    
    try { 
      if (id) { 
        await DBCURSOS.put(`/${id}/`, formData, { 
          headers: { "Content-Type": "multipart/form-data" } 
        }); 
        addAlert("Curso atualizado com sucesso!", "success"); 
      } else { 
        await DBCURSOS.post("/", formData, { headers: { "Content-Type": "multipart/form-data" } }); 
        addAlert("Curso cadastrado com sucesso!", "success"); 
      } setTimeout(() => navigate("/curso"), 1500); 
    } catch (err) { 
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      } 
    } 
  } 
  
  return ( 
      <div className="cursos-container"> 
        <h1>{id ? "Editar Curso" : "Cadastrar Curso"}</h1> 
        
        <ErrorMessage message={erro} /> 
        
        {sucesso && <p style={{ color: "green", textAlign: "center" }}>{sucesso}</p>} 
        
          <form className="cursos-form" onSubmit={salvarCurso}> 
            <div className="form-group"> 
              <label>Nome do curso:</label> 
                <input type="text" value={curso} onChange={(e) => setCurso(e.target.value)} placeholder="Digite o nome do curso" /> 
            </div>
            <div className="form-group"> 
              <label>Disciplinas:</label> 
              <div className="disciplinas-checkboxes"> 
                {disciplinas.map(d => ( 
                  <label key={d.id} className="checkbox-item"> 
                    <input type="checkbox" value={d.id} checked={disciplinasSelecionadas.includes(d.id)} onChange={(e) => { 
                      const val = parseInt(e.target.value); 
                        setDisciplinasSelecionadas(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val] ); 
                      }} 
                    /> 
                    <span>{d.nome}</span> 
                  </label> ))}
              </div>
            </div> 
            
            <div className="form-group"> 
              <label>Nível:</label> 
              <select value={nivel} onChange={(e) => setNivel(e.target.value)}> 
                {niveis.map(n => (
                  <option key={n.value} value={n.value}>{n.label}</option> 
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Coordenador:</label>
              <select value={coordSelecionado} onChange={(e) => setCoordSelecionado(e.target.value)}>
                <option value="">Não informado</option>
                {coordCurso.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option> ))}
              </select>
            </div>
            
            <div className="form-group"> 
              <label>Arquivo do curso (opcional):</label>
              <input type="file" onChange={(e) => setArquivo(e.target.files[0])} />
            </div>
            
            <button type="submit" className="submit-btn">
              {id ? "Salvar alterações" : "Adicionar curso"} </button>
          </form>
        <div className="cursos-form">
        <div className="form-buttons">
          <Link to="/curso" className="voltar-btn"> Voltar </Link>
        </div>
      </div>
    </div>
  );
}