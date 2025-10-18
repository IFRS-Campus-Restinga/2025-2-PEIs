import React from "react";

const ProfessorView = ({ usuario, infoPorAluno, onVisualizar }) => {
  return (
    <div className="professor-view">
      {infoPorAluno.length > 0 ? (
        infoPorAluno.map((info, idx) =>
          info.componentesInfo.length > 0 ? (
            info.componentesInfo.map((comp, cIdx) => (
              <div className="aluno-row" key={`${idx}-${cIdx}`}>
                {cIdx === 0 ? (
                  <div className="aluno-info">
                    <img
                      src={"https://randomuser.me/api/portraits/men/11.jpg"}
                      alt={info.aluno.nome}
                      className="aluno-foto"
                    />
                    <span>{info.aluno.nome}</span>
                  </div>
                ) : (
                  <div className="aluno-info-placeholder" />
                )}

                <span>{comp.componente}</span>
                {cIdx === 0 ? <span>{info.peiCentralStatus}</span> : <span>—</span>}
                <span>{comp.coordenador}</span>

                {cIdx === 0 ? (
                  <span
                    onClick={() => onVisualizar(info.peiCentralId)}
                    style={{ cursor: "pointer" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="14" height="18" rx="3" stroke="#333" strokeWidth="2" />
                      <circle cx="18" cy="18" r="3" stroke="#333" strokeWidth="2" />
                      <line x1="20" y1="20" x2="22" y2="22" stroke="#333" strokeWidth="2" />
                    </svg>
                  </span>
                ) : (
                  <span />
                )}
              </div>
            ))
          ) : (
            <div className="aluno-row" key={idx}>
              <div className="aluno-info">
                <img
                  src={"https://randomuser.me/api/portraits/men/11.jpg"}
                  alt={info.aluno.nome}
                  className="aluno-foto"
                />
                <span>{info.aluno.nome}</span>
              </div>
              <span>—</span>
              <span>{info.peiCentralStatus}</span>
              <span>—</span>
              <span
                onClick={() => onVisualizar(info.peiCentralId)}
                style={{ cursor: "pointer" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="14" height="18" rx="3" stroke="#333" strokeWidth="2" />
                  <circle cx="18" cy="18" r="3" stroke="#333" strokeWidth="2" />
                  <line x1="20" y1="20" x2="22" y2="22" stroke="#333" strokeWidth="2" />
                </svg>
              </span>
            </div>
          )
        )
      ) : (
        <p style={{ textAlign: "center", marginTop: "20px" }}>Nenhum aluno encontrado.</p>
      )}
    </div>
  );
};

export default ProfessorView;
