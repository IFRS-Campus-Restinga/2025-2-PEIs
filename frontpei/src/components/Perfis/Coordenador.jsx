import { useEffect, useState } from "react";
import axios from "axios";


const CoordenadorView = ({ usuario }) => {
  const [alunos, setAlunos] = useState([]);

  const API_BASE = import.meta.env.VITE_ALUNO_URL;
 
  // Função para buscar alunos no banco
  useEffect(() => {
    const buscarAlunos = async () => {
      try {
        // 👉 Substitua pela URL da tua API
        const response = await axios.get(`${API_BASE}`);
        setAlunos(response.data); // supõe que o backend retorna um array de alunos
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
      }
    };

    buscarAlunos();
  }, []);

  return (
    <div className="telaPadrao-page">
      {/* Título central */}
      <h2 className="telaPadrao-title">Bem-vindo, Pedagogo(a)</h2>

      {/* Perfil padrão */}
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

      {/* Tabela de alunos */}
      <div className="alunos-table">
        <div className="alunos-header">
          <span>Nome do aluno</span>
          <span>Componente Curricular</span>
          <span>Status</span>
          <span>Coordenador de curso</span>
          <span>Visualizar</span>
        </div>

        {/* Renderização dinâmica */}
        {alunos.length > 0 ? (
          alunos.map((aluno, idx) => (
            <div className="aluno-row" key={idx}>
              <div className="aluno-info">
                <img
                  src={aluno.foto}
                  alt={aluno.nome}
                  className="aluno-foto"
                />
                <span>{aluno.nome}</span>
              </div>
              <span>{aluno.componente}</span>
              <span>{aluno.status}</span>
              <div className="coordenador-info">
                <img
                  src={aluno.coordenador?.foto}
                  alt={aluno.coordenador?.nome}
                  className="coordenador-foto"
                />
                <span>{aluno.coordenador?.nome}</span>
              </div>
              <span>
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

export default CoordenadorView;