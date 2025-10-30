<<<<<<< HEAD
import { useEffect, useState } from "react"; 
import downloadIcon from "../../assets/download.svg";
import { Link } from "react-router-dom"; 
import BotaoEditar from "../../components/customButtons/botaoEditar"; 
import BotaoDeletar from "../../components/customButtons/botaoDeletar"; 
import ErrorMessage from "../../components/errorMessage/ErrorMessage"; 
import axios from "axios"; 
import "../Curso.css"; 

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

    console.log("Teste")
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
=======
import { useEffect, useState } from "react";
import downloadIcon from '../../assets/download.svg'
import { Link } from "react-router-dom";
import BotaoEditar from "../../components/customButtons/botaoEditar";
import BotaoDeletar from "../../components/customButtons/botaoDeletar";
import ErrorMessage from "../../components/errorMessage/ErrorMessage";
import axios from "axios";
import "../curso.css"

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [erro, setErro] = useState("");

  const DBCURSOS = axios.create({ baseURL: import.meta.env.VITE_CURSOS_URL });

  async function carregarCursos() {
    try {
      const res = await DBCURSOS.get("/");
      setCursos(Array.isArray(res.data) ? res.data : res.data.results || []);
      setErro(""); // limpa erro se sucesso
    } catch (err) {
      setErro("Não foi possível carregar os cursos."); // mensagem visível
    }
  }


  useEffect(() => {
    carregarCursos();
  }, []);

  return (
    <div className="cursos-container">
      <h1>Cursos</h1>

      <div className="cursos-form">
        <Link to="/cursoCadastrar">
          <button className="submit-btn">Adicionar curso</button>
        </Link>
      </div>



      {/* Aqui usamos o ErrorMessage */}
      <ErrorMessage message={erro} align="center" />

      <div className="cursos-list">
        <ul>
          {cursos.map((c) => (
            <li key={c.id}>
              <b>Nome do Curso: </b> {c.name}<br />
              <b>Nível: </b> {c.nivel || "Não informado"}<br />
              <b>Disciplinas: </b>{c.disciplinas && c.disciplinas.length > 0
                ? c.disciplinas.map(d => d.nome).join(", ")
                : "Nenhuma"}<br />
              <b>Coordenador: </b> {c.coordenador ? c.coordenador.nome : "Não informado"}<br />
              

              <b>Arquivo: </b>{c.arquivo && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>{c.arquivo.split('/').pop()}</span>
                  <button
                    type="button"
                    onClick={async e => {
                      e.preventDefault();
                      try {
                        const response = await fetch(c.arquivo, { credentials: 'include' });
                        if (!response.ok) throw new Error('Erro ao baixar arquivo');
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = c.arquivo.split('/').pop();
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        alert('Erro ao baixar o arquivo.');
                      }
                    }}
                    className="download-btn"
                    style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                  >
                    <img src={downloadIcon} alt="Download" className="download-icon" width={20} style={{ verticalAlign: 'middle' }} />
                  </button>
                </span>
              )}

              <div className="curso-buttons">
                <BotaoEditar id={c.id} rotaEdicao="/cursoEditar" />
                <BotaoDeletar 
                  id={c.id} 
                  axiosInstance={DBCURSOS} 
                  onDeletarSucesso={carregarCursos}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
}