import { useState, useEffect } from "react";
import axios from "axios";

const ProfessorView = ({ usuario }) => {
  // URLs do backend
  const API_ALUNO = import.meta.env.VITE_ALUNO_URL;
  const API_PEICENTRAL = import.meta.env.VITE_PEI_CENTRAL_URL;
  const API_CURSO = import.meta.env.VITE_CURSOS_URL;
  const API_PEIPERIODO = import.meta.env.VITE_PEIPERIODOLETIVO_URL;
  const API_FEED = import.meta.env.VITE_FEED_URL;

  const backendToken = import.meta.env.VITE_BACKEND_TOKEN;

  // Estados
  const [alunos, setAlunos] = useState([]);
  const [peiCentrals, setPeiCentrals] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [infoPorAluno, setInfoPorAluno] = useState([]);
  const [feed, setFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortStep, setSortStep] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    carregarFeed(currentPage, sortField, sortStep);
  }, [currentPage, sortField, sortStep]);

  // Função para carregar dados dos alunos
  async function carregarDados() {
    try {
      const [resAlunos, resPeiCentral, resCursos, resPeriodos] = await Promise.all([
        axios.get(API_ALUNO),
        axios.get(API_PEICENTRAL),
        axios.get(API_CURSO),
        axios.get(API_PEIPERIODO),
      ]);

      const alunosData = resAlunos.data.results || [];
      const peiCentralsData = Array.isArray(resPeiCentral.data)
        ? resPeiCentral.data
        : resPeiCentral.data?.results || [];
      const cursosData = Array.isArray(resCursos.data)
        ? resCursos.data
        : resCursos.data?.results || [];
      const periodosData = Array.isArray(resPeriodos.data)
        ? resPeriodos.data
        : resPeriodos.data?.results || [];

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

  // Função para carregar feed com paginação e ordenação
  async function carregarFeed(page = 1, field = "timestamp", step = 0) {
    try {
      setFeedLoading(true);
      setFeedError(null);

      const { ordering } = getSortingConfig(field, step);

      const res = await axios.get(API_FEED, {
        headers: { "X-BACKEND-TOKEN": backendToken },
        params: { page, ordering },
      });

      const feedData = res.data.results || res.data;
      setFeed(feedData);
      setTotalPages(res.data.count ? Math.ceil(res.data.count / 20) : 1);
    } catch (err) {
      setFeedError("Erro ao carregar feed");
      console.error("Erro ao carregar feed:", err.response?.status, err.response?.data);
    } finally {
      setFeedLoading(false);
    }
  }

  const getSortingConfig = (field, step) => {
    switch (field) {
      case "timestamp":
        return step === 0
          ? { ordering: "-timestamp" }
          : { ordering: "timestamp" };
      case "acao":
        return step === 0 ? { ordering: "acao" } : { ordering: "-acao" };
      case "modelo":
        return step === 0 ? { ordering: "modelo" } : { ordering: "-modelo" };
      default:
        return { ordering: "-timestamp" };
    }
  };

  const handleSort = (field) => {
    let newStep = 0;
    if (sortField === field) {
      newStep = (sortStep + 1) % 2;
      setSortStep(newStep);
    } else {
      setSortField(field);
      setSortStep(0);
      newStep = 0;
    }
    setCurrentPage(1);
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={i === currentPage ? "page-btn active" : "page-btn"}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="pagination-controls">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          Primeira
        </button>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        {pages}
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Próxima
        </button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
          Última
        </button>
      </div>
    );
  };

  const handleVisualizarClick = (peiCentralId) => {
    window.location.href = `${API_PEICENTRAL}${peiCentralId}`;
  };

  return (
    <div className="telaPadrao-page">
      {/* Perfil do professor */}
      <div className="telaPadrao-profile">
        <img src={usuario.foto} alt="Foto do Usuário" className="professor-foto" />
        <div className="professor-info">
          <h3>{usuario.nome}</h3>
          <p>{usuario.email}</p>
        </div>
      </div>

      {/* Feed de atualizações */}
      <div className="feed-container">
        <h2>Feed de Atualizações</h2>
        {feedLoading && <p>Carregando feed...</p>}
        {feedError && <p>{feedError}</p>}
        {!feedLoading && !feedError && feed.length === 0 && <p>Nenhuma atualização recente.</p>}
        {!feedLoading && !feedError && feed.length > 0 && (
          <ul>
            {feed.map((item) => (
              <li key={item.id}>
                <strong>{item.usuario || "Sistema"}</strong> fez uma <b>{item.acao}</b> em <b>{item.modelo}</b>
                <br />
                {item.data_formatada}
              </li>
            ))}
          </ul>
        )}
        <PaginationControls />
      </div>

      {/* Tabela de alunos e componentes */}
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
                      🔍
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
                  🔍
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
