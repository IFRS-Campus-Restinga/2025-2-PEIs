import { useEffect, useState } from "react";
import axios from "axios";


const NapneView = ({ usuario }) => {
  const [alunos, setAlunos] = useState([]);
  const [peiCentralStatus, setPeiCentralStatus] = useState(null);
  const [coordenador, setCoordenador] = useState(null);

  const API_BASE = import.meta.env.VITE_ALUNO_URL;
  const PEI_CENTRAL_URL = import.meta.env.VITE_PEI_CENTRAL_URL;
  const COORDENADOR_URL = import.meta.env.VITE_COORDENADORCURSO_URL;

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const alunosResponse = await axios.get(`${API_BASE}`);
        setAlunos(alunosResponse.data.results);

        const peiCentralResponse = await axios.get(`${PEI_CENTRAL_URL}1/`);
        setPeiCentralStatus(peiCentralResponse.data.status_pei);

        const coordenadorResponse = await axios.get(`${COORDENADOR_URL}`);
        setCoordenador(coordenadorResponse.data.results[0]); 

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    buscarDados();
  }, []);

  const handleVisualizarClick = () => {
    // Navega para o PEI Central com id = 1
    window.location.href = `${PEI_CENTRAL_URL}1`;
  };

  return (
    <div className="telaPadrao-page">
      <h2 className="telaPadrao-title">Bem-vindo, Napne</h2>

      <div className="telaPadrao-profile">
        <img
          src={usuario.foto}
          alt="Foto do Usuário"
          className="professor-foto"
        />
        <div className="professor-info">
          <h3>{usuario.nome}</h3>
          <p>{usuario.email}</p>
        </div>
      </div>

      <div className="alunos-table">
        <div className="alunos-header">
          <span>Nome do aluno</span>
          <span>Componente Curricular</span>
          <span>Status</span>
          <span>Coordenador de curso</span>
          <span>Visualizar</span>
        </div>

        {alunos.length > 0 ? (
          alunos.map((aluno, idx) => (
            <div className="aluno-row" key={idx}>
              <div className="aluno-info">
                <img
                  src={"https://randomuser.me/api/portraits/men/11.jpg"}
                  alt={aluno.nome}
                  className="aluno-foto"
                />
                <span>{aluno.nome}</span>
              </div>
              <span>{aluno.componente || "Analise e Desenvolvimento de Sistemas"}</span>
              <span>{peiCentralStatus || "—"}</span>
              <div className="coordenador-info">
                <img
                  src={"https://randomuser.me/api/portraits/men/32.jpg"}
                  alt={aluno.coordenador?.nome}
                  className="coordenador-foto"
                />
                
                <span>{coordenador?.nome || "—"}</span>
              </div>
              <span onClick={handleVisualizarClick} style={{ cursor: 'pointer' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="14"
                    height="18"
                    rx="3"
                    stroke="#333"
                    strokeWidth="2"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="3"
                    stroke="#333"
                    strokeWidth="2"
                  />
                  <line
                    x1="20"
                    y1="20"
                    x2="22"
                    y2="22"
                    stroke="#333"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Nenhum aluno encontrado.
          </p>
        )}
      </div>
    </div>
  );
};

export default NapneView;
