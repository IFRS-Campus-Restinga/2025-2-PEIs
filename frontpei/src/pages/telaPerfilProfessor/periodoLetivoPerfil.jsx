// src/pages/periodoLetivoPerfil/PeriodoLetivoPerfil.jsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

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

  // PEGA NOME COMPLETO + GRUPOS DO USUÁRIO LOGADO
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      try {
        const user = JSON.parse(usuarioSalvo);

        // Nome completo direto do backend (ex: "Jampier Brunetto")
        setNomeUsuario(user.nome || "Usuário");

        // Grupos (para os botões)
        const grupos = (user.grupos || []).map(g => g.toLowerCase());
        setGruposUsuario(grupos);

        console.log("USUÁRIO LOGADO:", { nome: user.nome, grupos });
      } catch (err) {
        console.error("Erro ao ler usuário do localStorage", err);
      }
    }
  }, []);

  // CARREGA DADOS DO PEI
  useEffect(() => {
    if (!peiCentralId) return;

    async function carregarDados() {
      try {
        const res = await axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`);
        const pei = res.data;

        setAluno(pei.aluno || { nome: "Aluno não encontrado", email: "" });

        const periodos = pei.periodos || [];
        if (periodos.length > 0) {
          setPeriodoPrincipal(periodos[0].periodo_principal || "—");
        }

        // Busca curso e coordenador
        let cursoTemp = null;
        let coordNome = "—";
        for (const p of periodos) {
          for (const comp of p.componentes_curriculares || []) {
            const disc = comp.disciplina || comp.disciplinas;
            if (disc?.cursos?.[0]) {
              cursoTemp = disc.cursos[0];
              const coord = cursoTemp.coordenador;
              coordNome = coord?.username || coord?.email?.split("@")[0] || "—";
              break;
            }
          }
          if (cursoTemp) break;
        }
        setCurso(cursoTemp);
        setCoordenador(coordNome);

        // Pareceres
        const todosPareceres = periodos
          .flatMap(p => p.componentes_curriculares || [])
          .flatMap(comp => 
            (comp.pareceres || []).map(parecer => ({
              ...parecer,
              componenteNome: comp.disciplina?.nome || comp.disciplinas?.nome || "Sem disciplina",
              professorNome: parecer.professor?.username || 
                           parecer.professor?.email?.split("@")[0] || 
                           "Professor"
            }))
          );

        setPareceres(todosPareceres);

      } catch (err) {
        console.error("Erro ao carregar PEI:", err);
        setErro(true);
      }
    }

    carregarDados();
  }, [peiCentralId]);

  // BOTÕES ORIGINAIS (com correção do brn-verde → btn-verde)
  const renderBotoesOriginais = () => {
    return (
      <>
        {gruposUsuario.map((grupo) => {
          switch (grupo) {
            case "professor":
              return (
                <>
                  <Link to="/pareceres" className="btn-verde">Cadastrar Parecer</Link>
                  <Link to="/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
                  <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                </>
              );

            case "pedagogo":
              return (
                <>
                  <Link to="/ataDeAcompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                  <Link to="/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
                </>
              );

            case "napne":
              return (
                <>
                  <Link to="/periodo" className="btn-verde">Gerenciar Períodos Letivos</Link>
                  <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                  <Link to="/componenteCurricular" className="btn-verde">Gerenciar Componentes Curriculares</Link>
                  <Link to="/ataDeAcompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
                </>
              );

            case "coordenador":
              return (
                <>
                  <Link to="/curso" className="btn-verde">Gerenciar Cursos</Link>
                  <Link to="/disciplina" className="btn-verde">Gerenciar Disciplinas</Link>
                  <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                  <Link to="/aluno" className="btn-verde">Gerenciar Alunos</Link>
                  <Link to="/ataDeAcompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
                </>
              );

            case "admin":
              return (
                <>
                  <Link to="/usuario" className="btn-verde">Gerenciar Usuários</Link>
                  <Link to="/crud/Curso" className="btn-verde">Gerenciar Cursos</Link>
                  <Link to="/crud/Disciplina" className="btn-verde">Gerenciar Disciplinas</Link>
                  <Link to="/crud/PEIPeriodoLetivo" className="btn-verde">Gerenciar Períodos Letivos</Link>
                  <Link to="/crud/aluno" className="btn-verde">Gerenciar Alunos</Link>
                  <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                  <Link to="/crud/parecer" className="btn-verde">Cadastrar Parecer</Link>
                  <Link to="/crud/componenteCurricular" className="btn-verde">Gerenciar Componentes Curriculares</Link>
                  <Link to="/crud/ataDeAcompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/crud/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
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

  if (erro) return <p style={{ textAlign: "center", color: "red", padding: "50px" }}>Erro ao carregar o PEI.</p>;
  if (!aluno) return <p style={{ textAlign: "center", padding: "50px" }}>Carregando perfil do aluno...</p>;

  return (
    <div className="pei-detalhe-container">
      <div className="pei-header">
        <div className="aluno-info">
          <img
            src={aluno.foto || "https://img.icons8.com/win10/1200/guest-male--v2.jpg"}
            alt={aluno.nome}
            className="aluno-fotoPerfil"
          />
          <div>
            <p><b>Nome:</b> {aluno.nome}</p>
            <p><b>E-mail:</b> {aluno.email}</p>
            <p><b>Período Principal:</b> {periodoPrincipal || "—"}</p>
          </div>
        </div>

        <div className="curso-info">
          <p><b>Curso:</b> {curso?.nome || "—"}</p>
          <p><b>Coordenador do Curso:</b> {coordenador}</p>
        </div>
      </div>

      <div className="pei-corpo">
        <div className="pei-documentos">
          <h3>Ações Disponíveis</h3>
          <div className="botoes-parecer">
            {renderBotoesOriginais()}
          </div>
        </div>

        <div className="pei-pareceres">
          <h3>Últimos Pareceres</h3>
          {pareceres.length > 0 ? (
            pareceres.map((p) => (
              <div key={p.id} className="parecer-card">
                <div className="parecer-topo">
                  <span className="parecer-professor">
                    {p.professorNome} ({p.componenteNome})
                  </span>
                  <span className="parecer-data">
                    {p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </div>
                <div className="parecer-texto">
                  {p.texto || "Sem texto disponível."}
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum parecer encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodoLetivoPerfil;