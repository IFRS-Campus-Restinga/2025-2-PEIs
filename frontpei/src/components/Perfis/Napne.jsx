const alunos = [
  {
    nome: "Ana Souza",
    foto: "https://randomuser.me/api/portraits/women/44.jpg",
    componente: "Análise e Desenvolvimento de Sistemas",
    status: "Em andamento",
    coordenador: {
      nome: "Carlos Silva",
      foto: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  },
  {
    nome: "João Lima",
    foto: "https://randomuser.me/api/portraits/men/45.jpg",
    componente: "Letras",
    status: "Concluído",
    coordenador: {
      nome: "Maria Oliveira",
      foto: "https://randomuser.me/api/portraits/women/33.jpg"
    }
  }
];

const NapneView = ({ usuario }) => (
  <div className="telaPadrao-page">
      {/* Título central */}
      <h2 className="telaPadrao-title">Bem-vindo, Napne</h2>

      {/* Perfil padrão */}
      <div className="telaPadrao-profile">
        <img src={usuario.foto} alt="Foto do Usuário" className="napne-foto" />
        <div className="napne-info">
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
        {alunos.map((aluno, idx) => (
          <div className="aluno-row" key={idx}>
            <div className="aluno-info">
              <img src={aluno.foto} alt={aluno.nome} className="aluno-foto" />
              <span>{aluno.nome}</span>
            </div>
            <span>{aluno.componente}</span>
            <span>{aluno.status}</span>
            <div className="coordenador-info">
              <img src={aluno.coordenador.foto} alt={aluno.coordenador.nome} className="coordenador-foto" />
              <span>{aluno.coordenador.nome}</span>
            </div>
            <span>
              {/* Ícone de página com lupa */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="14" height="18" rx="3" stroke="#333" strokeWidth="2" />
                <circle cx="18" cy="18" r="3" stroke="#333" strokeWidth="2" />
                <line x1="20" y1="20" x2="22" y2="22" stroke="#333" strokeWidth="2" />
              </svg>
            </span>
          </div>
        ))}
      </div>
    </div>
);

export default NapneView;