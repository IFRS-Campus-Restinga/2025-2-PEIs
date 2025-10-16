import { useState, useEffect } from "react";
import axios from "axios";

const ProfessorView = ({ usuario }) => {
  const API_ALUNO = import.meta.env.VITE_ALUNO_URL;
  const API_PEICENTRAL = import.meta.env.VITE_PEI_CENTRAL_URL;
  const API_CURSO = import.meta.env.VITE_CURSOS_URL;
  const API_PEIPERIODO = import.meta.env.VITE_PEIPERIODOLETIVO_URL;

  const [alunos, setAlunos] = useState([]);
  const [peiCentrals, setPeiCentrals] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [infoPorAluno, setInfoPorAluno] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resAlunos, resPeiCentral, resCursos, resPeriodos] = await Promise.all([
          axios.get(API_ALUNO),
          axios.get(API_PEICENTRAL),
          axios.get(API_CURSO),
          axios.get(API_PEIPERIODO),
        ]);

        const alunosData = resAlunos.data.results || [];
        const peiCentralsData = Array.isArray(resPeiCentral.data) ? resPeiCentral.data : resPeiCentral.data?.results || [];
        const cursosData = Array.isArray(resCursos.data) ? resCursos.data : resCursos.data?.results || [];
        const periodosData = Array.isArray(resPeriodos.data) ? resPeriodos.data : resPeriodos.data?.results || [];

        setAlunos(alunosData);
        setPeiCentrals(peiCentralsData);
        setCursos(cursosData);

        const dadosAlunos = alunosData.map((aluno) => {
          const peiCentral = peiCentralsData.find((p) => p.aluno?.id === aluno.id);
          const peiCentralStatus = peiCentral?.status_pei || "—";

          const periodos = peiCentral
            ? periodosData.filter((periodo) => periodo.pei_central === peiCentral.id)
            : [];

          const componentesInfo = [];

          periodos.forEach((periodo) => {
            (periodo.componentes_curriculares || []).forEach((comp) => {
              const disciplina = comp.disciplina;
              if (!disciplina) return;

              const cursoRelacionado = cursosData.find((curso) =>
                curso.disciplinas.some((d) => d.id === disciplina.id)
              );

              componentesInfo.push({
                componente: disciplina.nome,
                coordenador: cursoRelacionado?.coordenador?.nome || "—", 
              });
            });
          });

          return {
            aluno,
            peiCentralStatus,
            componentesInfo,
          };
        });

        setInfoPorAluno(dadosAlunos);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }

    carregarDados();
  }, []);

  const handleVisualizarClick = (peiCentralId) => {
    window.location.href = `${API_PEICENTRAL}${peiCentralId}`;
  };

  return (
    <div className="telaPadrao-page">
      <div className="telaPadrao-profile">
        <img src={usuario.foto} alt="Foto do Usuário" className="professor-foto" />
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
                      onClick={() => handleVisualizarClick(info.aluno.pei_central || 1)}
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
                  onClick={() => handleVisualizarClick(info.aluno.pei_central || 1)}
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
    </div>
  );
};

export default ProfessorView;
