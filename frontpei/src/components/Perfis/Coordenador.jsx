import React from "react";

const CoordenadorView = ({ usuario, infoPorAluno = [], onVisualizar = () => {} }) => {
  return (
    <>
      {infoPorAluno.length > 0 ? (
        infoPorAluno.map((info, idx) =>
          info.componentesInfo.length > 0 ? (
            info.componentesInfo.map((comp, cIdx) => (
              <div className="aluno-row" key={`${idx}-${cIdx}`}>
                {cIdx === 0 ? (
                  <div className="aluno-info">
                    <img
                      src={info.aluno.foto || "https://randomuser.me/api/portraits/men/13.jpg"}
                      alt={info.aluno.nome}
                      className="aluno-foto"
                    />
                    <span>{info.aluno.nome}</span>
                  </div>
                ) : (
                  <div className="aluno-info-placeholder" />
                )}

                <div>{comp.componente || "—"}</div>
                {cIdx === 0 ? <div>{info.peiCentralStatus}</div> : <div>—</div>}
                <div>{comp.coordenador}</div>

                {cIdx === 0 ? (
                  <div>
                    <button
                      onClick={() => onVisualizar(info.peiCentralId)}
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                      title="Visualizar PEI"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="14" height="18" rx="3" stroke="#333" strokeWidth="2" />
                        <circle cx="18" cy="18" r="3" stroke="#333" strokeWidth="2" />
                        <line x1="20" y1="20" x2="22" y2="22" stroke="#333" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            ))
          ) : (
            <div className="aluno-row" key={idx}>
              <div className="aluno-info">
                <img
                  src={info.aluno.foto || "https://randomuser.me/api/portraits/men/13.jpg"}
                  alt={info.aluno.nome}
                  className="aluno-foto"
                />
                <span>{info.aluno.nome}</span>
              </div>
              <div>—</div>
              <div>{info.peiCentralStatus}</div>
              <div>—</div>
              <div>
                <button
                  onClick={() => onVisualizar(info.peiCentralId)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  title="Visualizar PEI"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="14" height="18" rx="3" stroke="#333" strokeWidth="2" />
                    <circle cx="18" cy="18" r="3" stroke="#333" strokeWidth="2" />
                    <line x1="20" y1="20" x2="22" y2="22" stroke="#333" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </div>
          )
        )
      ) : (
        <p style={{ textAlign: "center", marginTop: 20 }}>Nenhum aluno encontrado.</p>
      )}
    </>
  );
};

export default CoordenadorView;
