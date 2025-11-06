import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { peiCentralId, cargoSelecionado: cargoInicial } = location.state || {};

  const [aluno, setAluno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [coordenador, setCoordenador] = useState(null);
  const [periodoPrincipal, setPeriodoPrincipal] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [erro, setErro] = useState(false);
  const [cargoSelecionado, setCargoSelecionado] = useState(cargoInicial || ""); 

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resPeiCentral, resAlunos, resCursos, resPeriodos] = await Promise.all([
          axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`),
          axios.get(API_ROUTES.ALUNO),
          axios.get(API_ROUTES.CURSOS),
          axios.get(API_ROUTES.PEIPERIODOLETIVO),
        ]);

        const peiCentral = resPeiCentral.data;
        const alunosData = resAlunos.data.results || [];
        const cursosData = Array.isArray(resCursos.data)
          ? resCursos.data
          : resCursos.data?.results || [];
        const periodosData = Array.isArray(resPeriodos.data)
          ? resPeriodos.data
          : resPeriodos.data?.results || [];

        const alunoVinculado = alunosData.find((a) => a.id === peiCentral.aluno?.id);
        setAluno(alunoVinculado || peiCentral.aluno || null);

        const periodosDoPei = periodosData.filter((p) => p.pei_central === peiCentral.id);
        setPeriodos(periodosDoPei);

        if (periodosDoPei.length > 0) {
          const periodoAtual = periodosDoPei[0];
          setPeriodoPrincipal(periodoAtual.periodo_principal || "—");

          let cursoEncontrado = null;
          for (const periodo of periodosDoPei) {
            for (const componente of periodo.componentes_curriculares || []) {
              const disciplinaId = componente.disciplina?.id;
              if (!disciplinaId) continue;

              cursoEncontrado = cursosData.find((curso) =>
                (curso.disciplinas || []).some((disc) => disc.id === disciplinaId)
              );
              if (cursoEncontrado) break;
            }
            if (cursoEncontrado) break;
          }

          if (cursoEncontrado) {
            setCurso(cursoEncontrado);
            setCoordenador(cursoEncontrado.coordenador || null);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setErro(true);
      }
    }

    if (peiCentralId) carregarDados();
  }, [peiCentralId]);

  if (erro)
    return <p style={{ textAlign: "center", color: "red" }}>Erro ao carregar informações.</p>;

  if (!aluno)
    return <p style={{ textAlign: "center" }}>Carregando informações do aluno...</p>;

  return (
    <div className="pei-detalhe-container">
      <div className="pei-header">
        <div className="aluno-info">
          <img
            src={aluno.foto || "https://randomuser.me/api/portraits/men/11.jpg"}
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
          <p><b>Curso:</b> {curso?.name || "Não encontrado"}</p>
          <p><b>Coordenador do Curso:</b> {coordenador?.nome || "—"}</p>
        </div>
      </div>

      <div className="pei-corpo">
        <div className="pei-documentos">
          <h3>Ações Disponíveis</h3>

          <div className="botoes-parecer">
            {cargoSelecionado === "Professor" && (
              <>
                <Link to="/pareceres" className="btn-verde">Cadastrar Parecer</Link>
                <Link to="/documentacaocomplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
                <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
              </>
            )}

            {cargoSelecionado === "Pedagogo" && (
              <>
                <Link to="/atadeacompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                <Link to="/documentacaocomplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
              </>
            )}

            {cargoSelecionado === "NAPNE" && (
              <>
                <Link to="/periodo" className="btn-verde">Gerenciar Períodos Letivos</Link>
                <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                <Link to="/componentecurricular" className="btn-verde">Gerenciar Componentes Curriculares</Link>
                <Link to="/peicentral" className="btn-verde">Gerenciar PEIs</Link>
                <Link to="/atadeacompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                <Link to="/pedagogo" className="btn-verde">Gerenciar Pedagogos</Link>
                <Link to="/documentacaocomplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
              </>
            )}

            {cargoSelecionado === "Coordenador de Curso" && (
              <>
                <Link to="/curso" className="btn-verde">Gerenciar Cursos</Link>
                <Link to="/disciplina" className="btn-verde">Gerenciar Disciplinas</Link>
                <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                <Link to="/aluno" className="btn-verde">Gerenciar Alunos</Link>
                <Link to="/professor" className="btn-verde">Gerenciar Professores</Link>
                <Link to="/atadeacompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                <Link to="/documentacaocomplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
              </>
            )}

            {cargoSelecionado === "Administrador" && (
              <>
                <Link to="/usuario" className="btn-verde">Cadastrar Usuários</Link>
                <Link to="/curso" className="btn-verde">Gerenciar Cursos</Link>
                <Link to="/disciplina" className="btn-verde">Gerenciar Disciplinas</Link>
                <Link to="/periodo" className="btn-verde">Gerenciar Períodos Letivos</Link>
                <Link to="/coordenador" className="btn-verde">Gerenciar Coordenadores</Link>
                <Link to="/aluno" className="btn-verde">Gerenciar Alunos</Link>
                <Link to="/professor" className="btn-verde">Gerenciar Professores</Link>
                <Link to="/peicentral" className="btn-verde">Gerenciar PEIs</Link>
                <Link to="/pareceres" className="btn-verde">Gerenciar Pareceres</Link>
                <Link to="/componentecurricular" className="btn-verde">Gerenciar Componentes Curriculares</Link>
                <Link to="/atadeacompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                <Link to="/documentacaocomplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
                <Link to="/pedagogo" className="btn-verde">Gerenciar Pedagogos</Link>
              </>
            )}

            <BotaoVoltar />
          </div>
        </div>

        <div className="pei-pareceres">
          <h3>Últimas Interações</h3>
          {periodos.length > 0 ? (
            periodos.map((periodo) =>
              periodo.componentes_curriculares?.map((comp) =>
                comp.pareceres?.map((parecer) => (
                  <div key={parecer.id} className="parecer-card">
                    <div className="parecer-topo">
                      <span className="parecer-professor">
                        👤 {parecer.professor?.nome || "Professor não informado"}{" "}
                        ({comp.disciplina?.nome || "Sem disciplina"})
                      </span>
                      <span className="parecer-data">{parecer.data || "—"}</span>
                    </div>
                    <div className="parecer-texto">
                      {parecer.texto || "Sem texto disponível."}
                    </div>
                  </div>
                ))
              )
            )
          ) : (
            <p>Nenhum parecer encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodoLetivoPerfil;
