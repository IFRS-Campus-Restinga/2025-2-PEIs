import { useEffect, useState } from "react"; 
import downloadIcon from "../../assets/download.svg";
import { Link } from "react-router-dom"; 
import BotaoEditar from "../../components/customButtons/botaoEditar"; 
import BotaoDeletar from "../../components/customButtons/botaoDeletar"; 
import ErrorMessage from "../../components/errorMessage/errorMessage.jsx";
import axios from "axios"; 
import "../Curso.css"; 
import BotaoExportar from "../../components/customButtons/botaoExportar";

export default function Cursos() { 
  const [cursos, setCursos] = useState([]); 
  const [erro, setErro] = useState(""); 
  const DBCURSOS = axios.create({ baseURL: import.meta.env.VITE_CURSOS_URL }); 
  
  async function carregarCursos() { 
    try {
      const res = await DBCURSOS.get("/"); 
      setCursos(Array.isArray(res.data) ? res.data : res.data.results || []); 
      setErro(""); 
    } catch (err) { 
        setErro("Não foi possível carregar os cursos."); 
    } 
  } 
  
  useEffect(() => {
    carregarCursos(); 
  }, []); 
  
  async function handleDownload(cursoId, arquivoNome) {
    const response = await DBCURSOS.get(`/${cursoId}/download/`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', arquivoNome);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
  
  return ( 
    <div className="cursos-container"> 
      <h1>Cursos</h1> 
      
      <div className="cursos-form"> 
        <Link to="/cursoCadastrar"> 
          <button className="submit-btn">Adicionar curso</button> 
        </Link>
        <BotaoExportar className="submit-btn" DBDATA={cursos} nomeArquivo={"cursos_exportacao.pdf"} />
      </div> 
      
      <ErrorMessage message={erro} align="center" /> 
      
      <div className="table-container"> 
        <table className="cursos-table"> 
          <thead> 
            <tr> 
              <th>Nome do Curso</th> 
              <th>Nível</th> 
              <th>Disciplinas</th> 
              <th>Coordenador</th> 
              <th>Arquivo</th> 
              <th>Ações</th> 
            </tr> 
          </thead> 
          <tbody> {cursos.map((curso) => ( 
            <tr key={curso.id}> 
              <td>{curso.name}</td> 
              <td>{curso.nivel || "Não informado"}</td> 
              <td> {curso.disciplinas?.length ? curso.disciplinas.map((d) => d.nome).join(", ") : "Nenhuma"} </td> 
              <td>{curso.coordenador?.nome || "Não informado"}</td> 
              <td>
                {curso.arquivo ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {curso.arquivo_nome}
                    <button
                      type="button"
                      className="download-btn"
                      onClick={() => handleDownload(curso.id, curso.arquivo_nome)}
                    >
                      <img src={downloadIcon} alt="Baixar arquivo" width={20} />
                    </button>
                  </span>
                ) : (
                  "Nenhum"
                )}
              </td>
              <td className="acoes-cell"> 
                <BotaoEditar id={curso.id} rotaEdicao="/cursoEditar" />
                <BotaoDeletar id={curso.id} axiosInstance={DBCURSOS} onDeletarSucesso={carregarCursos} /> 
              </td>
            </tr> ))} 
          </tbody> 
        </table> 
      </div> 

      <Link to="/" className="voltar-btn"> Voltar </Link> 
    </div>
  ); 
}