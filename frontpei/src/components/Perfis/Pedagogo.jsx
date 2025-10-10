import React from "react";

const PedagogoView = ({
  usuario,
  alunos = [],
  componentes = [],
  statusPei = null,
  coordenador = null,
  onVisualizar = () => {},
}) => {
  const pegarNomeComponente = (aluno) => {
    for (const c of componentes) {
      if (aluno.componente === c.id || aluno.disciplina?.id === c.id) {
        return c?.disciplina?.nome || c?.nome || "—";
      }
    }
    return aluno.disciplina?.nome || "—";
  };

  return (
    <>
      {alunos.length > 0 ? (
        alunos.map((aluno, idx) => {
          const peiId = aluno.pei_id || aluno.id || 1;
          return (
            <div className="aluno-row" key={aluno.id || idx}>
              <div className="aluno-info">
                <img
                  src={aluno.foto || "https://randomuser.me/api/portraits/men/11.jpg"}
                  alt={aluno.nome || "Aluno"}
                  className="aluno-foto"
                />
                <span>{aluno.nome || "—"}</span>
              </div>

              <div>{pegarNomeComponente(aluno)}</div>

              <div>{aluno.status || aluno.status_pei || statusPei || "—"}</div>

              <div className="coordenador-info">
                <img
                  src={
                    aluno.coordenador?.foto ||
                    coordenador?.foto ||
                    "https://randomuser.me/api/portraits/men/32.jpg"
                  }
                  alt={aluno.coordenador?.nome || coordenador?.nome || "Coordenador"}
                  className="coordenador-foto"
                />
                <span>{aluno.coordenador?.nome || coordenador?.nome || "—"}</span>
              </div>

              <div>
                <button
                  onClick={() => onVisualizar(peiId)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  title="Visualizar PEI"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="14"
                      height="18"
                      rx="3"
                      stroke="#333"
                      strokeWidth="2"
                    />
                    <circle cx="18" cy="18" r="3" stroke="#333" strokeWidth="2" />
                    <line x1="20" y1="20" x2="22" y2="22" stroke="#333" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p style={{ textAlign: "center", marginTop: 20 }}>Nenhum aluno encontrado.</p>
      )}
    </>
  );
};

export default PedagogoView;
