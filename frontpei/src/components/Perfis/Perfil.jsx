import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Perfil.css";
import BotaoVoltar from "../customButtons/botaoVoltar.jsx";

// Views dos perfis
import CoordenadorView from "./Coordenador.jsx";
import PedagogoView from "./Pedagogo.jsx";
import NapneView from "./Napne.jsx";
import ProfessorView from "./Professor.jsx";
import PerfilAdmin from "../../pages/perfil/perfilAdmin.jsx";

const Perfil = ({ usuario }) => {
  const { perfil } = useParams();
  const navigate = useNavigate();

  const [infoPorAluno, setInfoPorAluno] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [mostrarEncerrados, setMostrarEncerrados] = useState(false);

  const itensPorPagina = 4;

  const API_ALUNO = import.meta.env.VITE_ALUNO_URL;
  const API_PEICENTRAL = import.meta.env.VITE_PEI_CENTRAL_URL;
  const API_PEIPERIODO = import.meta.env.VITE_PEIPERIODOLETIVO_URL;
  const API_CURSO = import.meta.env.VITE_CURSOS_URL;

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      setErro(null);
      try {
        const [resAlunos, resPeiCentral, resPeriodos, resCursos] = await Promise.all([
          axios.get(API_ALUNO),
          axios.get(API_PEICENTRAL),
          axios.get(API_PEIPERIODO),
          axios.get(API_CURSO),
        ]);

        const alunos = resAlunos.data?.results || [];
        const peiCentrals = Array.isArray(resPeiCentral.data) ? resPeiCentral.data : resPeiCentral.data?.results || [];
        const periodos = Array.isArray(resPeriodos.data) ? resPeriodos.data : resPeriodos.data?.results || [];
        const cursos = Array.isArray(resCursos.data) ? resCursos.data : resCursos.data?.results || [];

        // Filtrar PEIs ativos ou encerrados baseado no estado
        const peiCentralsFiltrados = mostrarEncerrados
          ? peiCentrals.filter((p) => p.status_pei === "FECHADO")
          : peiCentrals.filter((p) => p.status_pei !== "FECHADO");

        const dadosCompletos = alunos
          .map((aluno) => {
            const peiCentral = peiCentralsFiltrados.find((p) => p.aluno?.id === aluno.id);
            if (!peiCentral) return null;

            const peiCentralStatus = peiCentral?.status_pei || "—";
            const periodosDoAluno = peiCentral ? periodos.filter((p) => p.pei_central === peiCentral.id) : [];

            const componentesInfo = [];
            periodosDoAluno.forEach((periodo) => {
              (periodo.componentes_curriculares || []).forEach((comp) => {
                const disciplina = comp.disciplina;
                if (!disciplina) return;

                const cursoRelacionado = cursos.find((curso) =>
                  curso.disciplinas?.some((d) => d.id === disciplina.id)
                );

                componentesInfo.push({
                  componente: disciplina.nome,
                  coordenador: cursoRelacionado?.coordenador?.nome || "—",
                  coordenadorFoto: cursoRelacionado?.coordenador?.foto || "https://randomuser.me/api/portraits/lego/1.jpg",
                  curso: cursoRelacionado?.name || "Curso Desconhecido", // Adiciona o curso
                  disciplina: cursoRelacionado?.disciplinas?.find((d) => d.id === disciplina.id)?.nome || "Disciplina Desconhecida",
                  semestre: periodo.periodo_principal || "2025/2", // Adiciona o semestre
                });
              });
            });

            return {
              aluno,
              peiCentralStatus,
              componentesInfo,
              peiCentralId: peiCentral?.id || null,
            };
          })
          .filter((item) => item !== null);

        console.log("Dados completos:", dadosCompletos);
        setInfoPorAluno(dadosCompletos);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setErro("Erro ao buscar dados. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [mostrarEncerrados]);

  const totalPaginas = Math.ceil(infoPorAluno.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const alunosDaPagina = infoPorAluno.slice(inicio, inicio + itensPorPagina);

  const handleVisualizarClick = (peiCentralId, aluno, componentesInfo) => {
    if (peiCentralId) {
      const coordenador = componentesInfo[0]?.coordenador
        ? {
            nome: componentesInfo[0].coordenador,
            foto: componentesInfo[0].coordenadorFoto,
          }
        : {
            nome: "Professor Desconhecido",
            foto: "https://randomuser.me/api/portraits/men/32.jpg",
          };
      navigate(`/pei/${peiCentralId}`, {
        state: {
          aluno: {
            nome: aluno.nome,
            email: aluno.email,
            semestre: componentesInfo[0]?.semestre || "2025/2", 
            curso: componentesInfo[0]?.curso || "Curso Desconhecido", 
            disciplina: componentesInfo[0]?.disciplina || "Disciplina Desconhecida", 
            foto: aluno.foto || "https://randomuser.me/api/portraits/men/11.jpg",
          },
          coordenador,
        },
      });
    }
  };

  const perfilTituloMap = {
    coordenador: "Coordenador(a)",
    pedagogo: "Pedagogo(a)",
    napne: "NAPNE",
    professor: "Professor(a)",
    administrador: "Administrador(a)",
  };

  const conteudosPorPerfil = {
    coordenador: (
      <CoordenadorView
        usuario={usuario}
        infoPorAluno={alunosDaPagina}
        onVisualizar={handleVisualizarClick}
      />
    ),
    pedagogo: (
      <PedagogoView
        usuario={usuario}
        infoPorAluno={alunosDaPagina}
        onVisualizar={handleVisualizarClick}
      />
    ),
    napne: (
      <NapneView
        usuario={usuario}
        infoPorAluno={alunosDaPagina}
        onVisualizar={handleVisualizarClick}
      />
    ),
    professor: (
      <ProfessorView
        usuario={usuario}
        infoPorAluno={alunosDaPagina}
        onVisualizar={handleVisualizarClick}
      />
    ),
    administrador: <PerfilAdmin usuario={usuario} />,
  };

  const conteudo = conteudosPorPerfil[perfil] || <p>Perfil não encontrado</p>;

  // Função para alternar entre PEIs ativos e encerrados
  const toggleMostrarEncerrados = () => {
    setMostrarEncerrados(!mostrarEncerrados);
    setPagina(1); // Resetar para a primeira página
  };

  return (
    <div className="tela-padrao">
      <main>
        {loading ? (
          <div className="loading">Carregando dados...</div>
        ) : erro ? (
          <div className="erro">{erro}</div>
        ) : (
          <>
            {perfil !== "professor" && perfil !== "administrador" ? (
              <>
                {/*<h2 className="professor-title">
                  Bem-vindo, {perfilTituloMap[perfil] || "Usuário"} {usuario?.nome?.split(" ")[0]}!
                </h2>

                <div className="professor-profile">
                  <img
                    src={usuario?.foto || "https://randomuser.me/api/portraits/lego/1.jpg"}
                    alt="Foto do Usuário"
                    className="professor-foto"
                  />
                  <div className="professor-info">
                    <h3>{usuario?.nome || "Usuário"}</h3>
                    <p>{usuario?.email || ""}</p>
                  </div>
                </div>*/}

                {/* Botão para alternar PEIs encerrados */}
                <div className="filtro-peis">
                  <button
                    onClick={toggleMostrarEncerrados}
                    className="btn-filtro-encerrados"
                  >
                    {mostrarEncerrados ? "Mostrar PEIs Ativos" : "Visualizar PEIs Encerrados"}
                  </button>
                </div>

                <div className="alunos-table">
                  <div className="alunos-header">
                    <div>Nome do aluno</div>
                    <div>Componente Curricular</div>
                    <div>Status</div>
                    <div>Coordenador de curso</div>
                    <div>Visualizar</div>
                  </div>
                  {conteudo}
                </div>

                {totalPaginas > 1 && (
                  <div className="paginacao">
                    <button
                      disabled={pagina === 1}
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      className="paginacao-btn"
                    >
                      ← Anterior
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPagina(i + 1)}
                        className={`paginacao-btn ${pagina === i + 1 ? "ativo" : ""}`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      disabled={pagina === totalPaginas}
                      onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      className="paginacao-btn"
                    >
                      Próximo →
                    </button>
                  </div>
                )}
              </>
            ) : (
              conteudo
            )}
          </>
        )}
      </main>

      <BotaoVoltar/>
    </div>
  );
};

export default Perfil;