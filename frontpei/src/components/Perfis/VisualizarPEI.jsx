import React from "react";
import { useLocation } from "react-router-dom";
import "./VisualizarPEI.css";

const VisualizarPEI = () => {
  const { state } = useLocation();

  // Exemplo de dados caso não sejam passados via state
  const exemploInteracoes = [
    {
      id: 1,
      professor: "Maria Oliveira",
      foto: "https://randomuser.me/api/portraits/women/44.jpg",
      data: "09/10/2025",
      texto: "Interação sobre avaliação do aluno e comentários sobre desempenho.",
    },
    {
      id: 2,
      professor: "Carlos Santos",
      foto: "https://randomuser.me/api/portraits/men/55.jpg",
      data: "08/10/2025",
      texto: "Discussão sobre participação em atividades extracurriculares.",
    },
  ];

  // Dados do estado ou fallback para exemplos
  const alunoDados = state?.aluno || exemploAluno;
  const coordDados = state?.coordenador || exemploCoordenador;
  const listaInteracoes = exemploInteracoes; // Mantido como exemplo por enquanto

  return (
    <div className="visualizar-pei-container">
      {/* Cabeçalho: Aluno à esquerda, Coordenador + Botões à direita */}
      <div className="aluno-header">
        <div className="aluno-info">
          <div className="aluno-foto-container">
            <img src={alunoDados.foto} alt={alunoDados.nome} />
          </div>
          <div className="aluno-dados">
            <h2>{alunoDados.nome}</h2>
            <p>{alunoDados.email}</p>
            <p>{alunoDados.semestre}</p>
            <p>{alunoDados.curso}</p>
          </div>
        </div>

        <div className="coordenador-botoes">
          <div className="coordenador-info">
            <img
              src={coordDados.foto}
              alt={coordDados.nome}
              className="coordenador-foto"
            />
            <span>{coordDados.nome}</span>
          </div>
          <div className="botoes-pei">
            <button className="btn-encerrar">Encerrar PEI</button>
            <button className="btn-suspender">Suspender PEI</button>
          </div>
        </div>
      </div>

      {/* Corpo: ícones à esquerda, últimas interações à direita */}
      <div className="visualizar-pei-body">
        <div className="pei-icones">
          <div className="icone-item">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/document.png"
              alt="Documentação PEI"
            />
            <span>Documentação PEI</span>
          </div>
          <div className="icone-item">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/pdf.png"
              alt="Parecer Assistência Estudantil"
            />
            <span>Parecer Assistência Estudantil</span>
          </div>
          <div className="icone-item">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/pdf.png"
              alt="Parecer Atas de Reuniões Semestrais"
            />
            <span>Parecer Atas de Reuniões Semestrais</span>
          </div>
          <div className="icone-item">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/pdf.png"
              alt="Parecer"
            />
            <span>Parecer {alunoDados.disciplina}</span>
          </div>
        </div>

        <div className="ultimas-interacoes">
          <h3>Últimas Interações</h3>
          <div className="interacoes-lista">
            {listaInteracoes.map((item) => (
              <div key={item.id} className="interacao-item">
                <div className="interacao-header">
                  <div className="interacao-user">
                    <img
                      src={item.foto}
                      alt={item.professor}
                      className="interacao-foto"
                    />
                    <span>{item.professor}</span>
                  </div>
                  <span className="interacao-data">{item.data}</span>
                </div>
                <div className="interacao-texto">{item.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarPEI;