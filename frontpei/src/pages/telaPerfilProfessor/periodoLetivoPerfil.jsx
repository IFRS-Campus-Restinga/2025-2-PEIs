import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import logo_nome from "../../assets/logo-sem-nome.png";

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
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [parecerSelecionado, setParecerSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [textoEditado, setTextoEditado] = useState("");


  // Funções para abrir e fechar popup de parecer
  function abrirPopup(parecer) {
    setParecerSelecionado(parecer);
    setMostrarPopup(true);
  };

  function ativarEdicao() {
  setModoEdicao(true);
  setTextoEditado(parecerSelecionado.texto || "");
  };

  async function salvarEdicao() {
    try {
      const payload = {
        texto: textoEditado,
        professor_id: parecerSelecionado.professor.id,
        componente_curricular_id: parecerSelecionado.componente_curricular,
        data: parecerSelecionado.data
      };

      await axios.put(
        `${API_ROUTES.PARECER}${parecerSelecionado.id}/`,
        payload
      );

      // Atualiza o parecer na listagem
      setPareceres((prev) =>
        prev.map((p) =>
          p.id === parecerSelecionado.id
            ? { ...p, texto: textoEditado }
            : p
        )
      );

      setParecerSelecionado((prev) => ({
        ...prev,
        texto: textoEditado
      }));

      setModoEdicao(false);
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
      alert("Erro ao editar parecer.");
    }
  }


  function fecharPopup() {
    setMostrarPopup(false);
    setParecerSelecionado(null);
  }

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
        const res = await axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`);
        const pei = res.data;

        console.log("PEI Central retornado:", pei);

        // --- ALUNO ---
        const alunoData = pei.aluno || { nome: "Aluno não encontrado", email: "" };
        setAluno(alunoData);
        console.log("Aluno retornado:", alunoData);

        // --- PERÍODO PRINCIPAL ---
        const periodos = pei.periodos || [];
        setPeriodoPrincipal(periodos[0]?.periodo_principal || "—");

        // --- CURSO E COORDENADOR via novo campo cursos ---
        const cursoData = pei.cursos || null;
        setCurso(cursoData);
        console.log("Curso retornado:", cursoData);

        let nomeCoord = "—";
        if (cursoData?.coordenador) {
          const coord = cursoData.coordenador;
          nomeCoord = coord.username || coord.nome || coord.email?.split("@")[0] || "—";
        }
        setCoordenador(nomeCoord);
        console.log("Coordenador do curso:", nomeCoord);

        // --- PARECERES ---
        const todosPareceres = periodos
          .flatMap(p => p.componentes_curriculares || [])
          .flatMap(comp =>
            (comp.pareceres || []).map(parecer => ({
              ...parecer,
              componenteNome: comp.disciplina?.nome || "Sem disciplina",
              professorNome: parecer.professor?.username || parecer.professor?.nome || parecer.professor?.email?.split("@")[0] || "Professor",
            }))
          );

        setPareceres(todosPareceres);
        console.log("Pareceres processados:", todosPareceres);

      } catch (err) {
        console.error("Erro ao carregar PEI:", err);
        setErro(true);
      }
    }

    carregarDados();
  }, [peiCentralId]);

  // Render dos botões baseado no grupo do usuário
  const renderBotoesOriginais = () => {
    return (
      <>
        {gruposUsuario.map((grupo) => {
          switch (grupo) {
            case "professor":
              return (
                <>
                  <Link to="/pareceres" state={{ peiCentralId }} className="btn-verde">Cadastrar Parecer</Link>
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
                  <Link to="/pareceres" state={{ peiCentralId }} className="btn-verde">Cadastrar Parecer</Link>
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

  if (erro)
    return <p style={{ textAlign: "center", color: "red", padding: "50px" }}>Erro ao carregar o PEI.</p>;

  if (!aluno)
    return <p style={{ textAlign: "center", padding: "50px" }}>Carregando perfil do aluno...</p>;

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
              <div key={p.id} className="parecer-card" onClick={() => abrirPopup(p)} style={{ cursor: "pointer" }}>
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
          {mostrarPopup && (
            <div className="popup-overlay" onClick={fecharPopup}>
              <div 
                className="popup-content" 
                onClick={(e) => e.stopPropagation()} // impede fechar ao clicar dentro
              >
                <header 
                  className="header"
                >
                  <div className="header-left">
                    <img src={logo_nome} alt="Logo IFRS" className="header-logo" />
                  </div>

                  <div style={{ marginRight: "auto" }} className="header-text">
                    <strong>INSTITUTO FEDERAL</strong>
                    <span>Rio Grande do Sul</span>
                    <span>Campus Restinga</span>
                  </div>

                  <div className="header-center">
                    <h1>Visualização do Parecer</h1>
                    <span>Plano Educacional Individualizado</span>
                  </div>

                  <div
                    className="header-actions"
                    style={{ 
                      display: "flex", 
                      gap: "8px", 
                      marginLeft: "20px" 
                    }}
                  >
                  </div>
                </header>

                <h3>Parecer de {parecerSelecionado.professorNome}</h3>

                <p><strong>Componente:</strong> {parecerSelecionado.componenteNome}</p>
                <p><strong>Data:</strong> {new Date(parecerSelecionado.data).toLocaleDateString("pt-BR")}</p>
                <div className="popup-texto">
                  {modoEdicao ? (
                    <textarea
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "140px",
                        padding: "10px",
                        fontSize: "16px",
                        borderRadius: "8px"
                      }}
                    />
                  ) : (
                    parecerSelecionado.texto
                  )}
                </div>

                <div className="popup-botoes">
                  {modoEdicao ? (
                    <>
                      <button className="botao-editar" onClick={salvarEdicao}>
                        Salvar
                      </button>
                      <button className="btn-fechar" onClick={() => setModoEdicao(false)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="botao-editar" onClick={ativarEdicao}>
                        Editar
                      </button>
                      <button className="btn-fechar" onClick={fecharPopup}>
                        Fechar
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PeriodoLetivoPerfil;
