import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import { API_ROUTES } from "../../configs/apiRoutes";
import "../../cssGlobal.css";

const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const { peiCentralId, usuarioSelecionado } = location.state || {};

  const [aluno, setAluno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [coordenador, setCoordenador] = useState(null);
  const [periodoPrincipal, setPeriodoPrincipal] = useState(null);
  const [periodoAtual, setPeriodoAtual] = useState(null);
  const [pareceres, setPareceres] = useState([]);
  const [permissoes, setPermissoes] = useState([]);
  const [erro, setErro] = useState(false);

  // -------------------------------
  // Logs de debug
  useEffect(() => {
    console.log("location:", location);
    if (!usuarioSelecionado) {
      console.log("Nenhum usuário enviado via navigate");
    } else {
      console.log("Usuário enviado via navigate:", usuarioSelecionado);
    }
  }, [location, usuarioSelecionado]);

  // -------------------------------
  // Carregar dados do PEI, aluno, curso e período
  useEffect(() => {
    if (!peiCentralId) return;

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
        const cursosData = Array.isArray(resCursos.data) ? resCursos.data : resCursos.data?.results || [];
        const periodosData = Array.isArray(resPeriodos.data) ? resPeriodos.data : resPeriodos.data?.results || [];

        // Aluno vinculado
        const alunoVinculado = alunosData.find((a) => a.id === peiCentral.aluno?.id);
        setAluno(alunoVinculado || peiCentral.aluno || null);

        // Período principal e atual
        const periodosDoPei = periodosData.filter((p) => p.pei_central === peiCentral.id);
        if (periodosDoPei.length > 0) {
          setPeriodoPrincipal(periodosDoPei[0].periodo_principal || "—");
          setPeriodoAtual(periodosDoPei[0]);
        }

        // Curso e coordenador
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

        // Pareceres filtrados por período atual
        const pareceresFiltrados = [];
        periodosDoPei.forEach((periodo) => {
          (periodo.componentes_curriculares || []).forEach((comp) => {
            (comp.pareceres || []).forEach((parecer) => {
              pareceresFiltrados.push({
                ...parecer,
                componenteNome: comp.disciplina?.nome || "Sem disciplina",
              });
            });
          });
        });
        console.log("Pareceres carregados:", pareceresFiltrados);
        setPareceres(pareceresFiltrados);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setErro(true);
      }
    }

    carregarDados();
  }, [peiCentralId]);

  // Carregar permissões do usuário (sem token)
  useEffect(() => {
    if (!usuarioSelecionado) {
      console.log("Nenhum usuário disponível para carregar permissões");
      setPermissoes([]);
      return;
    }

    async function carregarPermissoes() {
      try {
        const tipo = usuarioSelecionado.categoria.toLowerCase();
        const id = usuarioSelecionado.id;

        const res = await axios.get(API_ROUTES.PERMISSOES, {
          params: { tipo, id },
        });

        console.log("🔹 Permissões carregadas:", res.data.permissoes);
        setPermissoes(res.data.permissoes || []);
      } catch (err) {
        console.error("Erro ao carregar permissões:", err);
        setPermissoes([]);
      }
    }

    carregarPermissoes();
  }, [usuarioSelecionado]);

  if (erro) return <p style={{ textAlign: "center", color: "red" }}>Erro ao carregar informações.</p>;
  if (!aluno) return <p style={{ textAlign: "center" }}>Carregando informações do aluno...</p>;

  return (
    <div className="pei-detalhe-container">
      <div className="pei-header">
        <div className="aluno-info">
          <img
            src={aluno.foto || perfil}
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
          {/* Pareceres */}
          {permissoes.includes("add_parecer") && (
            <Link to="/pareceres" className="btn-verde">
              Cadastrar Parecer
            </Link>
          )}

          {/* Documentação complementar */}
          {(permissoes.includes("add_documentocomplementar") || permissoes.includes("change_documentocomplementar")) && (
            <Link to="/documentacaocomplementar" className="btn-verde">
              Gerenciar Documentações Complementares
            </Link>
          )}

          {/* PEI Central */}
          {(permissoes.includes("change_peicentral") || permissoes.includes("view_peicentral")) && (
            <Link to="/peicentral" className="btn-verde">
              Visualizar PEI Central
            </Link>
          )}

          {/* PEI Período Letivo */}
          {permissoes.includes("change_peiperiodoletivo") && (
            <Link to="/periodo" className="btn-verde">
              Gerenciar Períodos Letivos
            </Link>
          )}

          {/* Atas de acompanhamento */}
          {permissoes.includes("add_atadeacompanhamento") && (
            <Link to="/atadeacompanhamento" className="btn-verde">
              Gerenciar Atas de Acompanhamento
            </Link>
          )}

          {/* Cursos */}
          {permissoes.includes("add_curso") && (
            <Link to="/curso" className="btn-verde">
              Gerenciar Cursos
            </Link>
          )}

          {/* Disciplinas / Componentes Curriculares */}
          {(permissoes.includes("add_componentecurricular") || permissoes.includes("change_componentecurricular") || permissoes.includes("add_disciplina")) && (
            <Link to="/disciplina" className="btn-verde">
              Gerenciar Disciplinas
            </Link>
          )}

          {/* Alunos */}
          {permissoes.includes("add_aluno") && (
            <Link to="/aluno" className="btn-verde">
              Gerenciar Alunos
            </Link>
          )}

          {/* Professores */}
          {permissoes.includes("add_usuario") && (
            <Link to="/professor" className="btn-verde">
              Gerenciar Professores
            </Link>
          )}

          {/* Pedagogos */}
          {permissoes.includes("add_usuario") && (
            <Link to="/pedagogo" className="btn-verde">
              Gerenciar Pedagogos
            </Link>
          )}

          {/* Coordenadores (se houver permissão específica) */}
          {permissoes.includes("change_coordenadorcurso") && (
            <Link to="/coordenador" className="btn-verde">
              Gerenciar Coordenadores
            </Link>
          )}
           <BotaoVoltar />
          </div>
        </div>
        <div className="pei-pareceres">
          <h3>Últimos Pareceres</h3>
          {pareceres.length > 0 ? (
            pareceres.map((parecer) => (
              <div key={parecer.id} className="parecer-card">
                <div className="parecer-topo">
                  <span className="parecer-professor">
                    👤 {parecer.professor?.nome || "Professor não informado"} ({parecer.componenteNome})
                  </span>
                  <span className="parecer-data">{parecer.data || "—"}</span>
                </div>
                <div className="parecer-texto">{parecer.texto || "Sem texto disponível."}</div>
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
