import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Perfil.css";

// Views dos perfis
import CoordenadorView from "./Coordenador.jsx";
import PedagogoView from "./Pedagogo.jsx";
import NapneView from "./Napne.jsx";
import ProfessorView from "./Professor.jsx";
import PerfilAdmin from "../../pages/perfil/perfilAdmin.jsx";

const Perfil = ({ usuario }) => {
  const { perfil } = useParams();
  const navigate = useNavigate();

  // estados de dados
  const [alunos, setAlunos] = useState([]);
  const [componentes, setComponentes] = useState([]);
  const [peiStatus, setPeiStatus] = useState(null);
  const [coordenador, setCoordenador] = useState(null);

  // paginação
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 4;

  // loading / erro
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // variáveis de ambiente
  const API_BASE = import.meta.env.VITE_ALUNO_URL;
  const PEI_CENTRAL_URL = import.meta.env.VITE_PEI_CENTRAL_URL;
  const COORDENADOR_URL = import.meta.env.VITE_COORDENADORCURSO_URL;
  const COMPONENTE_CURRICULAR = import.meta.env.VITE_COMPONENTE_CURRICULAR;

  useEffect(() => {
    const buscarTodos = async () => {
      setLoading(true);
      setErro(null);
      try {
        const [
          alunosResponse,
          peiCentralResponse,
          coordenadorResponse,
          componenteResponse,
        ] = await Promise.all([
          axios.get(API_BASE),
          axios.get(`${PEI_CENTRAL_URL}1/`),
          axios.get(COORDENADOR_URL),
          axios.get(COMPONENTE_CURRICULAR),
        ]);

        setAlunos(alunosResponse.data?.results || []);
        setPeiStatus(peiCentralResponse.data?.status_pei ?? null);
        setCoordenador(coordenadorResponse.data?.results?.[0] || null);
        setComponentes(componenteResponse.data?.results || []);
      } catch (err) {
        console.error("Erro ao buscar dados em Perfil.jsx:", err);
        setErro("Falha ao buscar dados. Veja console para mais detalhes.");
      } finally {
        setLoading(false);
      }
    };

    buscarTodos();
  }, []);

  // calcular paginação
  const totalPaginas = Math.ceil(alunos.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const alunosDaPagina = alunos.slice(inicio, inicio + itensPorPagina);

  // função para navegar para VisualizarPEI
  const handleVisualizarClick = (alunoId) => {
    navigate(`/pei/${alunoId}`);
  };

  // mapeamento de perfis para título
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
        alunos={alunosDaPagina}
        componentes={componentes}
        statusPei={peiStatus}
        coordenador={coordenador}
        onVisualizar={handleVisualizarClick}
      />
    ),
    pedagogo: (
      <PedagogoView
        usuario={usuario}
        alunos={alunosDaPagina}
        componentes={componentes}
        statusPei={peiStatus}
        coordenador={coordenador}
        onVisualizar={handleVisualizarClick}
      />
    ),
    napne: (
      <NapneView
        usuario={usuario}
        alunos={alunosDaPagina}
        componentes={componentes}
        statusPei={peiStatus}
        coordenador={coordenador}
        onVisualizar={handleVisualizarClick}
      />
    ),
    professor: (
      <ProfessorView
        usuario={usuario}
        alunos={alunosDaPagina}
        componentes={componentes}
        statusPei={peiStatus}
        coordenador={coordenador}
        onVisualizar={handleVisualizarClick}
      />
    ),
    administrador: <PerfilAdmin usuario={usuario} />,
  };

  const conteudo = conteudosPorPerfil[perfil] || <p>Perfil não encontrado</p>;

  return (
    <div className="tela-padrao">
      <main>
        {loading ? (
          <div className="loading">Carregando dados...</div>
        ) : erro ? (
          <div className="erro">{erro}</div>
        ) : (
          <>
            {/* Título de boas-vindas */}
            <h2 className="professor-title">
              Bem-vindo, {perfilTituloMap[perfil] || "Usuário"}{" "}
              {usuario?.nome?.split(" ")[0]}!
            </h2>

            {/* Perfil do usuário logado alinhado à esquerda */}
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
            </div>

            {/* Cabeçalho da tabela */}
            <div className="alunos-table">
              <div className="alunos-header">
                <div>Nome do aluno</div>
                <div>Componente Curricular</div>
                <div>Status</div>
                <div>Coordenador de curso</div>
                <div>Visualizar</div>
              </div>

              {/* Corpo da tabela: filho renderiza linhas */}
              {conteudo}
            </div>

            {/* paginação só se houver mais de 4 alunos */}
            {perfil !== "administrador" && alunos.length > itensPorPagina && (
              <div className="paginacao">
                <button
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  className="paginacao-btn"
                >
                  ← Previous
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
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* botão voltar */}
      <Link to="/" className="voltar-btn">
        Voltar
      </Link>
    </div>
  );
};

export default Perfil;
