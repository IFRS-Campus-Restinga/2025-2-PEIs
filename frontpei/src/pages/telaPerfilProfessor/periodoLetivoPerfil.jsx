import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

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
  const [gruposUsuario, setGruposUsuario] = useState([]);
  const [erro, setErro] = useState(false);

  // -------------------------------
  // Carregar dados do PEI Central
  // -------------------------------
  useEffect(() => {
    if (!peiCentralId) return;

    async function carregarDados() {
      console.log("🔍 Buscando dados do PEI Central ID:", peiCentralId);

      try {
        const [resPeiCentral, resAlunos] = await Promise.all([
          axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`),
          axios.get(API_ROUTES.ALUNO),
        ]);

        const peiCentral = resPeiCentral.data;

        // Aluno vinculado
        const alunosData = resAlunos.data?.results || [];
        const alunoVinculado =
          alunosData.find((a) => a.id === peiCentral.aluno?.id) ||
          peiCentral.aluno;

        console.log("Aluno vinculado:", alunoVinculado);
        setAluno(alunoVinculado);

        // Períodos vinculados
        const periodos = peiCentral.periodos || [];
        console.log("Períodos vinculados:", periodos);

        if (periodos.length > 0) {
          setPeriodoPrincipal(periodos[0].periodo_principal || "—");
          setPeriodoAtual(periodos[0]);
        }

        // Todos componentes
        const todosComponentes = periodos.flatMap(
          (p) => p.componentes_curriculares || []
        );

        // Mapear pareceres
        const todosPareceres = todosComponentes.flatMap((comp) =>
          (comp.pareceres || []).map((parecer) => ({
            ...parecer,
            componenteNome: comp.disciplina?.nome || "Sem disciplina",
          }))
        );

        console.log("📄 Pareceres encontrados:", todosPareceres);
        setPareceres(todosPareceres);

        // -------------------------------
        // LOGICA DA DISCIPLINA → CURSO
        // -------------------------------
        console.log("📘 Iniciando busca do curso via disciplinas...");

        let cursoEncontrado = null;

        for (const comp of todosComponentes) {
          const disciplina = comp.disciplina;
          if (!disciplina) continue;

          console.log("🔍 Verificando disciplina:", disciplina.nome);
          console.log("   Cursos vinculados:", disciplina.cursos);

          const cursos = disciplina.cursos || [];

          if (cursos.length > 0) {
            cursoEncontrado = cursos[0]; // pega só o primeiro curso vinculado
            break;
          }
        }

        if (cursoEncontrado) {
          console.log("✅ Curso encontrado:", cursoEncontrado);
          setCurso(cursoEncontrado);
          setCoordenador(cursoEncontrado.coordenador || null);
        } else {
          console.log("⚠️ Nenhum curso encontrado para as disciplinas!");
        }
      } catch (err) {
        console.error("Erro ao carregar dados do PEI:", err);
        setErro(true);
      }
    }

    carregarDados();
  }, [peiCentralId]);

  // -------------------------------
  // Carregar permissões do usuário
  // -------------------------------
  useEffect(() => {
    if (!usuarioSelecionado) return;

    async function carregarPermissoes() {
      try {
        const res = await axios.get(
          `${API_ROUTES.PERMISSOES}?id=${usuarioSelecionado.id}`
        );

        const permissoesUsuario = res.data.permissoes || [];
        const grupos = res.data.grupos || [];

        console.log("Grupos recebidos da API:", grupos);

        setPermissoes(permissoesUsuario);
        setGruposUsuario(grupos.map((g) => g.toLowerCase()));
      } catch (err) {
        console.error("Erro ao buscar permissões do usuário:", err);
      }
    }

    carregarPermissoes();
  }, [usuarioSelecionado]);

  // -------------------------------
  // RENDER
  // -------------------------------
  if (erro)
    return (
      <p style={{ textAlign: "center", color: "red" }}>
        Erro ao carregar informações.
      </p>
    );

  if (!aluno)
    return (
      <p style={{ textAlign: "center" }}>
        Carregando informações do aluno...
      </p>
    );

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
            <p>
              <b>Nome:</b> {aluno.nome}
            </p>
            <p>
              <b>E-mail:</b> {aluno.email}
            </p>
            <p>
              <b>Período Principal:</b> {periodoPrincipal || "—"}
            </p>
          </div>
        </div>

        <div className="curso-info">
          <p>
            <b>Curso:</b> {curso?.nome || "—"}
          </p>
          <p>
            <b>Coordenador do Curso:</b>{" "}
            {coordenador?.username || "—"}
          </p>
        </div>
      </div>

      <div className="pei-corpo">
        <div className="pei-documentos">
          <h3>Ações Disponíveis</h3>

          <div className="botoes-parecer">
            {gruposUsuario.map((grupo) => {
              switch (grupo) {
                case "professor":
                  return (
                    <>
                      <Link to="/crud/Parecer" className="btn-verde">
                        Cadastrar Parecer
                      </Link>
                      <Link
                        to="/crud/DocumentacaoComplementar"
                        className="btn-verde"
                      >
                        Gerenciar Documentações Complementares
                      </Link>
                      <Link to="/peicentral" className="btn-verde">
                        Visualizar PEI Central
                      </Link>
                    </>
                  );
                case "pedagogo":
                  return (
                    <>
                      <Link to="/crud/AtaDeAcompanhamento" className="btn-verde">
                        Gerenciar Atas de Acompanhamento
                      </Link>
                      <Link to="/peicentral" className="btn-verde">
                        Visualizar PEI Central
                      </Link>
                      <Link
                        to="/crud/DocumentacaoComplementar"
                        className="btn-verde"
                      >
                        Gerenciar Documentações Complementares
                      </Link>
                    </>
                  );
                case "napne":
                  return (
                    <>
                      <Link to="/crud/Periodo" className="btn-verde">
                        Gerenciar Períodos Letivos
                      </Link>
                      <Link to="/peicentral" className="btn-verde">
                        Visualizar PEI Central
                      </Link>
                      <Link to="/crud/ComponenteCurricular" className="btn-verde">
                        Gerenciar Componentes Curriculares
                      </Link>
                      <Link to="/crud/AtaDeAcompanhamento" className="btn-verde">
                        Gerenciar Atas de Acompanhamento
                      </Link>
                      <Link
                        to="/crud/DocumentacaoComplementar"
                        className="btn-verde"
                      >
                        Gerenciar Documentações Complementares
                      </Link>
                    </>
                  );
                case "coordenador":
                  return (
                    <>
                      <Link to="/crud/Curso" className="btn-verde">
                        Gerenciar Cursos
                      </Link>
                      <Link to="/crud/Disciplina" className="btn-verde">
                        Gerenciar Disciplinas
                      </Link>
                      <Link to="/peicentral" className="btn-verde">
                        Visualizar PEI Central
                      </Link>
                      <Link to="/crud/Aluno" className="btn-verde">
                        Gerenciar Alunos
                      </Link>
                      <Link to="/crud/AtaDeAcompanhamento" className="btn-verde">
                        Gerenciar Atas de Acompanhamento
                      </Link>
                      <Link
                        to="/crud/DocumentacaoComplementar"
                        className="btn-verde"
                      >
                        Gerenciar Documentações Complementares
                      </Link>
                    </>
                  );
                case "admin":
                  return (
                    <>
                      <Link to="/usuario" className="btn-verde">
                        Gerenciar Usuários
                      </Link>
                      <Link to="/crud/Curso" className="btn-verde">
                        Gerenciar Cursos
                      </Link>
                      <Link to="/crud/Disciplina" className="btn-verde">
                        Gerenciar Disciplinas
                      </Link>
                      <Link to="/crud/Periodo" className="btn-verde">
                        Gerenciar Períodos Letivos
                      </Link>
                      <Link to="/crud/Aluno" className="btn-verde">
                        Gerenciar Alunos
                      </Link>
                      <Link to="/peicentral" className="btn-verde">
                        Visualizar PEI Central
                      </Link>
                      <Link to="/crud/Parecer" className="btn-verde">
                        Cadastrar Parecer
                      </Link>
                      <Link to="/crud/ComponenteCurricular" className="btn-verde">
                        Gerenciar Componentes Curriculares
                      </Link>
                      <Link to="/crud/AtaDeAcompanhamento" className="btn-verde">
                        Gerenciar Atas de Acompanhamento
                      </Link>
                      <Link
                        to="/crud/DocumentacaoComplementar"
                        className="btn-verde"
                      >
                        Gerenciar Documentações Complementares
                      </Link>
                    </>
                  );
                default:
                  return null;
              }
            })}

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
                    👤 {parecer.professor?.nome || parecer.professor?.username || "Professor não informado"} (
                    {parecer.componenteNome})
                  </span>
                  <span className="parecer-data">{parecer.data || "—"}</span>
                </div>

                <div className="parecer-texto">
                  {parecer.texto || "Sem texto disponível."}
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
