import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import api from "../../configs/axiosConfig";


const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const { peiCentralId } = location.state || {};

  const [aluno, setAluno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [coordenador, setCoordenador] = useState("—");
  const [periodoPrincipal, setPeriodoPrincipal] = useState(null);
  const [pareceres, setPareceres] = useState([]);
  const [gruposUsuario, setGruposUsuario] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");
  const [erro, setErro] = useState(false);

  // Carrega usuário do localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      try {
        const user = JSON.parse(usuarioSalvo);
        setNomeUsuario(user.nome || "Usuário");
        setGruposUsuario((user.grupos || []).map(g => g.toLowerCase()));
        console.log("USUÁRIO LOGADO:", { nome: user.nome, grupos: user.grupos });
      } catch (err) {
        console.error("Erro ao ler usuário do localStorage:", err);
      }
    }
  }, []);

  // Carrega dados do PEI
  useEffect(() => {
    if (!peiCentralId) return;

    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");
        console.log("Token obtido do localStorage:", token);
        if (!token) throw new Error("Token de autenticação não encontrado.");
        const headers = { Authorization: `Token ${token}` };
        console.log("Headers enviados na requisição:", headers);

        const res = await axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`, { headers });
        console.log("Resposta do backend:", res.data);

        const pei = res.data;
        console.log("PEI Central retornado:", pei);

        // --- ALUNO ---
        const alunoData = pei.aluno || { nome: "Aluno não encontrado", email: "" };
        setAluno(alunoData);
        console.log("Aluno retornado:", alunoData);

        // --- PERÍODOS ---
        const periodos = pei.periodos || [];
        console.log("Períodos retornados:", periodos);
        setPeriodoPrincipal(periodos[0]?.periodo_principal || "—");

        // --- CURSO ---
        const cursoData = pei.cursos || null;
        setCurso(cursoData);
        console.log("Curso retornado:", cursoData);

        let nomeCoord = "—";
        if (cursoData?.coordenador) {
          const coord = cursoData.coordenador;
          nomeCoord = coord.first_name || coord.nome || coord.email?.split("@")[0] || "—";
        }
        setCoordenador(nomeCoord);
        console.log("Coordenador do curso:", nomeCoord);

        // --- COMPONENTES CURRICULARES ---
        const componentes = periodos.flatMap(p => p.componentes_curriculares || []);
        console.log("Componentes curriculares:", componentes);

        // --- PARECERES ---
        const todosPareceres = componentes.flatMap(comp =>
          (comp.pareceres || []).map(parecer => {
            const obj = {
              ...parecer,
              componenteNome: comp.disciplina?.nome || "Sem disciplina",
              professorNome: parecer.professor?.first_name || parecer.professor?.nome || parecer.professor?.email?.split("@")[0] || "Professor",
            };
            console.log("Parecer processado:", obj);
            return obj;
          })
        ).sort((a, b) => new Date(b.data) - new Date(a.data));;
        

        console.log("Todos pareceres antes do filtro:", todosPareceres);

        // --- FILTRO PELO ALUNO ---
        const pareceresFiltrados = todosPareceres.filter(parecer => {
          const match = parecer.aluno?.id === alunoData.id;
          console.log(`Parecer ${parecer.id} pertence ao aluno?`, match, "parecer.aluno?.id:", parecer.aluno?.id, "alunoData.id:", alunoData.id);
          return match;
        });

        console.log("Pareceres filtrados pelo aluno do PEI central:", pareceresFiltrados);

        setPareceres(pareceresFiltrados);

      } catch (err) {
        console.error("Erro ao carregar PEI:", err);
        setErro(true);
      }
    }

    carregarDados();
  }, [peiCentralId]);

    const formatarTempoDecorrido = (dataString) => {
        const data = new Date(dataString);
        const agora = new Date();
        const diffMs = agora - data;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Agora mesmo";
        if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
        if (diffDias < 7) return `Há ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
        
        return data.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

  // Render dos botões baseado no grupo do usuário
  const renderBotoesOriginais = () => {
    return (
      <>
        {gruposUsuario.map((grupo) => {
          switch (grupo) {
            case "professor":
              return (
                <>
                  <Link to="/pareceres" state={{ peiCentralId }} className="btn-acao-pei">Cadastrar Parecer</Link>
                  <Link to="/crud/documentacaoComplementar" className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                </>
              );
            case "pedagogo":
              return (
                <>
                  <Link to="/ataDeAcompanhamento" className="btn-acao-pei">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                  <Link to="/crud/documentacaoComplementar" className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                </>
              );
            case "napne":
              return (
                <>
                  <Link to="/crud/PEIPeriodoLetivo" className="btn-acao-pei">Gerenciar Períodos Letivos</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                  <Link to="/crud/componenteCurricular" className="btn-acao-pei">Gerenciar Componentes Curriculares</Link>
                  <Link to="/ataDeAcompanhamento" className="btn-acao-pei">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/crud/documentacaoComplementar" className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                </>
              );
            case "coordenador":
              return (
                <>
                  <Link to="/crud/Curso" className="btn-acao-pei">Gerenciar Cursos</Link>
                  <Link to="/crud/Disciplina" className="btn-acao-pei">Gerenciar Disciplinas</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                  <Link to="/crud/aluno" className="btn-acao-pei">Gerenciar Alunos</Link>
                  <Link to="/ataDeAcompanhamento" className="btn-acao-pei">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/crud/documentacaoComplementar" className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                </>
              );
            case "admin":
              return (
                <>
                  <Link to="/usuario" className="btn-acao-pei">Gerenciar Usuários</Link>
                  <Link to="/crud/Curso" className="btn-acao-pei">Gerenciar Cursos</Link>
                  <Link to="/crud/Disciplina" className="btn-acao-pei">Gerenciar Disciplinas</Link>
                  <Link to="/crud/PEIPeriodoLetivo" className="btn-acao-pei">Gerenciar Períodos Letivos</Link>
                  <Link to="/crud/aluno" className="btn-acao-pei">Gerenciar Alunos</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                  <Link to="/pareceres" state={{ peiCentralId }} className="btn-acao-pei">Cadastrar Parecer</Link>
                  <Link to="/crud/componenteCurricular" className="btn-acao-pei">Gerenciar Componentes Curriculares</Link>
                  <Link to="/ataDeAcompanhamento" className="btn-acao-pei">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/crud/documentacaoComplementar" className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                </>
              );
            default:
              return null;
          }
        })}
        <BotaoVoltar />
      </>
    );
  };

  if (erro)
    return <p style={{ textAlign: "center", color: "red", padding: "50px" }}>Erro ao carregar o PEI.</p>;

  if (!aluno)
    return <p style={{ textAlign: "center", padding: "50px" }}>Carregando perfil do aluno...</p>;

  return (
    <div className="pei-detalhe-container">
      {/* CABEÇALHO (MANTIDO) */}
      <div className="pei-header">
        <div className="aluno-info">
          <img src={aluno.foto || "https://img.icons8.com/win10/1200/guest-male--v2.jpg"} alt={aluno.nome} className="aluno-fotoPerfil" />
          <div>
            <p><b>Nome:</b> {aluno.nome}</p>
            <p><b>E-mail:</b> {aluno.email}</p>
            <p><b>Período Principal:</b> {periodoPrincipal || "—"}</p>
          </div>
        </div>
        <div className="curso-info">
          <p><b>Curso:</b> {curso?.nome || "—"}</p>
          <p><b>Coordenador:</b> {coordenador}</p>
        </div>
      </div>

      {/* CORPO DIVIDIDO EM 2 COLUNAS */}
      <div className="pei-corpo-grid">
        
        {/* ESQUERDA: PARECERES (Scrollável) */}
        <div className="pei-coluna-pareceres">
          <div className="pareceres-header">
             <h3>Últimos Pareceres</h3>
          </div>
          
          <div className="pareceres-lista-scroll">
            {/* 👇 NOVO BOTÃO DE ADICIONAR (CARD) */}
            {/* Verifica se o usuário tem permissão */}
            {(gruposUsuario.includes("professor") || gruposUsuario.includes("admin") || gruposUsuario.includes("napne")) && (
                <Link to="/pareceres" state={{ peiCentralId }} className="parecer-card-add">
                  <span className="icon-plus">+</span>
                  <span>Adicionar Novo Parecer</span>
                </Link>
            )}
            {pareceres.length > 0 ? (
              pareceres.map((p) => (
                <div key={p.id} className="parecer-card">
                    <div className="parecer-topo">
                    <span className="parecer-professor">
                      {p.professorNome} <small>({p.componenteNome})</small>
                    </span>
                    
                    
                    <div className="parecer-info-data">
                        <span className="parecer-data-oficial">
                          {p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—"}
                        </span>
                        <span className="parecer-tempo-relativo">
                          {formatarTempoDecorrido(p.data)}
                        </span>
                    </div>

                  </div>
                  <div className="parecer-texto">
                    {p.texto || "Sem texto disponível."}
                  </div>
                </div>
              ))
            ) : (
              <div className="parecer-vazio">Nenhum parecer registrado neste período.</div>
            )}
          </div>
        </div>

        {/* DIREITA: AÇÕES (Fixa) */}
        <div className="pei-coluna-acoes">
          <div className="acoes-card">
            <h3>Ações Disponíveis</h3>
            <div className="lista-botoes-vertical">
              {renderBotoesOriginais()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default PeriodoLetivoPerfil;