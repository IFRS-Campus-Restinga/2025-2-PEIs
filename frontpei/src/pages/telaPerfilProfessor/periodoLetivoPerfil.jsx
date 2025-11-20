import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import formatarNome from "../../utils/formatarNome"; // ← usando a função reutilizável

const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { peiCentralId } = location.state || {};

  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [aluno, setAluno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [coordenador, setCoordenador] = useState(null);
  const [periodoPrincipal, setPeriodoPrincipal] = useState(null);
  const [pareceres, setPareceres] = useState([]);
  const [gruposUsuario, setGruposUsuario] = useState([]);
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carrega usuário logado
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (!usuarioSalvo) {
      navigate("/");
      return;
    }
    const user = JSON.parse(usuarioSalvo);
    setUsuarioLogado(user);
    setGruposUsuario((user.grupos || []).map(g => g.toLowerCase()));
  }, [navigate]);

  // Carrega dados do PEI
  useEffect(() => {
    if (!peiCentralId || !usuarioLogado) return;

    async function carregarDados() {
      try {
        setLoading(true);
        const resPeiCentral = await axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`);
        const peiCentral = resPeiCentral.data;

        setAluno(peiCentral.aluno);
        const periodos = peiCentral.periodos || [];
        if (periodos.length > 0) {
          setPeriodoPrincipal(periodos[0].periodo_principal || "—");
        }

        // Busca curso e coordenador
        let cursoEncontrado = null;
        let coordenadorEncontrado = null;
        for (const periodo of periodos) {
          for (const comp of periodo.componentes_curriculares || []) {
            const disciplina = comp.disciplina || comp.disciplinas;
            if (disciplina?.cursos?.length > 0) {
              cursoEncontrado = disciplina.cursos[0];
              coordenadorEncontrado = cursoEncontrado.coordenador;
              break;
            }
          }
          if (cursoEncontrado) break;
        }
        setCurso(cursoEncontrado);
        setCoordenador(coordenadorEncontrado);

        // Pareceres
        const todosPareceres = periodos
          .flatMap(p => p.componentes_curriculares || [])
          .flatMap(comp => (comp.pareceres || []).map(parecer => ({
            ...parecer,
            componenteNome: comp.disciplina?.nome || comp.disciplinas?.nome || "Sem disciplina",
          })));
        setPareceres(todosPareceres);

      } catch (err) {
        console.error("Erro ao carregar PEI:", err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [peiCentralId, usuarioLogado]);

  // === BOTÕES COM SWITCH (SEM DUPLICAÇÃO) ===
  const renderBotoesPorGrupo = () => {
    const botoesAdicionados = new Set(); // evita duplicação
    const adicionarBotao = (key, to, texto) => {
      if (!botoesAdicionados.has(key)) {
        botoesAdicionados.add(key);
        return <Link key={key} to={to} className="btn-verde">{texto}</Link>;
      }
      return null;
    };

    const botoes = [];

    gruposUsuario.forEach(grupo => {
      switch (grupo) {
        case "admin":
          botoes.push(
            adicionarBotao("admin-usuario", "/usuario", "Gerenciar Usuários"),
            adicionarBotao("admin-curso", "/curso", "Gerenciar Cursos"),
            adicionarBotao("admin-disciplina", "/disciplina", "Gerenciar Disciplinas"),
            adicionarBotao("admin-periodo", "/periodo", "Gerenciar Períodos"),
            adicionarBotao("admin-aluno", "/aluno", "Gerenciar Alunos"),
            adicionarBotao("admin-parecer", "/pareceres", "Cadastrar Parecer"),
            adicionarBotao("admin-componente", "/componenteCurricular", "Gerenciar Componentes"),
            adicionarBotao("admin-ata", "/ataDeAcompanhamento", "Gerenciar Atas"),
            adicionarBotao("admin-doc", "/documentacaoComplementar", "Documentações Complementares")
          );
          break;

        case "professor":
          botoes.push(
            adicionarBotao("prof-parecer", "/pareceres", "Cadastrar Parecer"),
            adicionarBotao("prof-doc", "/documentacaoComplementar", "Gerenciar Documentações")
          );
          break;

        case "pedagogo":
        case "napne":
          botoes.push(
            adicionarBotao("ped-ata", "/ataDeAcompanhamento", "Gerenciar Atas"),
            adicionarBotao("ped-doc", "/documentacaoComplementar", "Documentações Complementares"),
            adicionarBotao("napne-periodo", "/periodo", "Gerenciar Períodos"),
            adicionarBotao("napne-componente", "/componenteCurricular", "Componentes Curriculares")
          );
          break;

        case "coordenador":
          botoes.push(
            adicionarBotao("coord-curso", "/curso", "Gerenciar Cursos"),
            adicionarBotao("coord-disciplina", "/disciplina", "Gerenciar Disciplinas"),
            adicionarBotao("coord-aluno", "/aluno", "Gerenciar Alunos")
          );
          break;

        default:
          break;
      }
    });

    // Sempre adiciona
    botoes.push(adicionarBotao("peicentral", "/peicentral", "Visualizar PEI Central"));

    return botoes.filter(Boolean); // remove nulls
  };

  // === RENDER ===
  if (!usuarioLogado) return <div>Redirecionando...</div>;
  if (loading) return <p style={{textAlign: "center"}}>Carregando perfil do aluno...</p>;
  if (erro) return <p style={{textAlign: "center", color: "red"}}>Erro ao carregar dados.</p>;
  if (!aluno) return <p style={{textAlign: "center"}}>Aluno não encontrado.</p>;

  return (
    <div className="pei-detalhe-container">
      <div className="pei-header">
        <div className="aluno-info">
          <img src={aluno.foto || "https://img.icons8.com/win10/1200/guest-male--v2.jpg"} alt={aluno.nome} className="aluno-fotoPerfil" />
          <div>
            <p><b>Nome:</b> {aluno.nome}</p>
            <p><b>E-mail:</b> {aluno.email}</p>
            <p><b>Período:</b> {periodoPrincipal || "—"}</p>
          </div>
        </div>

        <div className="curso-info">
          <p><b>Curso:</b> {curso?.nome || "Não informado"}</p>
          <p><b>Coordenador:</b> {formatarNome(coordenador)}</p>
        </div>
      </div>

      <div className="pei-corpo">
        <div className="pei-documentos">
          <h3>Ações Disponíveis</h3>
          <div className="botoes-parecer">
            {renderBotoesPorGrupo()}
            <BotaoVoltar />
          </div>
        </div>

        <div className="pei-pareceres">
          <h3>Últimos Pareceres</h3>
          {pareceres.length > 0 ? (
            pareceres.map((p) => (
              <div key={p.id} className="parecer-card">
                <div className="parecer-topo">
                  <span className="parecer-professor">
                    {formatarNome(p.professor)} ({p.componenteNome})
                  </span>
                  <span className="parecer-data">{p.data || "—"}</span>
                </div>
                <div className="parecer-texto">
                  {p.texto || "Sem descrição."}
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum parecer cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodoLetivoPerfil;