import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const { peiCentralId } = location.state || {};

  // Estados principais
  const [aluno, setAluno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [coordenador, setCoordenador] = useState("—");
  const [periodoPrincipal, setPeriodoPrincipal] = useState(null);
  const [pareceres, setPareceres] = useState([]);
  const [gruposUsuario, setGruposUsuario] = useState([]);
  const [statusPEI, setStatusPEI] = useState("aberto");
  const [carregandoStatus, setCarregandoStatus] = useState(false);
  const [erro, setErro] = useState(false);

  // Estados do MODAL (AGORA NO LUGAR CERTO!)
  const [modalAberto, setModalAberto] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState(null); // "fechado", "suspenso" ou "reabrir"

  // Carrega usuário
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      try {
        const user = JSON.parse(usuarioSalvo);
        setGruposUsuario((user.grupos || []).map(g => g.toLowerCase()));
      } catch (err) {
        console.error("Erro ao ler usuário:", err);
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

        setAluno(pei.aluno || { nome: "Aluno não encontrado", email: "" });
        setPeriodoPrincipal(pei.periodos?.[0]?.periodo_principal || "—");

        const cursoData = pei.cursos || null;
        setCurso(cursoData);
        if (cursoData?.coordenador) {
          const coord = cursoData.coordenador;
          setCoordenador(coord.nome || coord.username || coord.email?.split("@")[0] || "—");
        }

        const todosPareceres = (pei.periodos || [])
          .flatMap(p => p.componentes_curriculares || [])
          .flatMap(comp => (comp.pareceres || []).map(parecer => ({
            ...parecer,
            componenteNome: comp.disciplina?.nome || "Sem disciplina",
            professorNome: parecer.professor?.nome || parecer.professor?.username || "Professor",
          })));
        setPareceres(todosPareceres);

        // Conversão do status do backend → frontend
        const mapa = {
          "FECHADO": "fechado",
          "SUSPENSO": "suspenso",
          "EM ANDAMENTO": "em_andamento",
          "ABERTO": "aberto"
        };
        setStatusPEI(mapa[pei.status_pei] || "aberto");

      } catch (err) {
        console.error("Erro ao carregar PEI:", err);
        setErro(true);
      }
    }
    carregarDados();
  }, [peiCentralId]);

  // FUNÇÕES DO MODAL
  const abrirModal = (acao) => {
    setAcaoPendente(acao);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAcaoPendente(null);
  };

  const confirmarAcao = () => {
    atualizarStatusPEI(acaoPendente);
  };

  // ATUALIZA STATUS NO BACKEND
  const atualizarStatusPEI = async (acao) => {
    if (carregandoStatus) return;
    setCarregandoStatus(true);

    let valorBackend;
    let novoStatusFrontend;

    if (acao === "fechado") {
      valorBackend = "FECHADO";
      novoStatusFrontend = "fechado";
    } else if (acao === "suspenso") {
      valorBackend = "SUSPENSO";
      novoStatusFrontend = "suspenso";
    } else if (acao === "reabrir") {
      valorBackend = "EM ANDAMENTO";
      novoStatusFrontend = "em_andamento";
    }

    try {
      await axios.patch(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`, {
        status_pei: valorBackend
      });

      setStatusPEI(novoStatusFrontend);
      fecharModal(); // fecha o modal

    } catch (err) {
      console.error("Erro:", err.response?.data);
      alert("Erro: " + JSON.stringify(err.response?.data || "Falha"));
    } finally {
      setCarregandoStatus(false);
    }
  };

  // Renderização dos botões de ação
  const renderBotoesOriginais = () => (
    <>
      {gruposUsuario.map((grupo) => {
        switch (grupo) {
          case "professor": return (
            <>
              <Link to="/pareceres" state={{ peiCentralId }} className="btn-verde">Cadastrar Parecer</Link>
              <Link to="/crud/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
              <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
            </>
          );
          case "pedagogo": return (
            <>
              <Link to="/ataDeAcompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
              <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
              <Link to="/crud/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
            </>
          );
          case "napne": return (
            <>
              <Link to="/periodo" className="btn-verde">Gerenciar Períodos Letivos</Link>
              <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
              <Link to="/componenteCurricular" className="btn-verde">Gerenciar Componentes Curriculares</Link>
              <Link to="/ataDeAcompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
              <Link to="/crud/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
            </>
          );
          case "coordenador": return (
            <>
              <Link to="/curso" className="btn-verde">Gerenciar Cursos</Link>
              <Link to="/disciplina" className="btn-verde">Gerenciar Disciplinas</Link>
              <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
              <Link to="/aluno" className="btn-verde">Gerenciar Alunos</Link>
              <Link to="/ataDeAcompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
              <Link to="/crud/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
            </>
          );
          case "admin": return (
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
          default: return null;
        }
      })}
      <BotaoVoltar />
    </>
  );

  // Loading e erro
  if (erro) return <p style={{ textAlign: "center", color: "red", padding: "50px" }}>Erro ao carregar o PEI.</p>;
  if (!aluno) return <p style={{ textAlign: "center", padding: "50px" }}>Carregando perfil do aluno...</p>;

  return (
    <div className="pei-detalhe-container">
      <div className="pei-header">
        <div className="aluno-info">
          <img src={aluno.foto || "https://img.icons8.com/win10/100/guest-male--v2.jpg"} alt={aluno.nome} className="aluno-fotoPerfil" />
          <div>
            <p><b>Nome:</b> {aluno.nome}</p>
            <p><b>E-mail:</b> {aluno.email}</p>
            <p><b>Período Principal:</b> {periodoPrincipal || "—"}</p>
          </div>
        </div>

        <div className="curso-info">
          <p><b>Curso:</b> {curso?.nome || "—"}</p>
          <p><b>Coordenador do Curso:</b> {coordenador}</p>

          <div style={{ margin: "18px 0" }}>
            <strong>Status do PEI: </strong>
            <span className={`status-badge ${statusPEI}`}>
              {statusPEI === "fechado" ? "Fechado" :
               statusPEI === "suspenso" ? "Suspenso" :
               statusPEI === "em_andamento" ? "Em Andamento" : "Aberto"}
            </span>
          </div>

          {/* BOTÕES COM MODAL */}
          {(gruposUsuario.includes("admin") || 
            gruposUsuario.includes("napne") || 
            gruposUsuario.includes("coordenador")) && (
            <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {/* REABRIR — só aparece se estiver suspenso */}
              {statusPEI === "suspenso" && (
                <button 
                  className="btn-reabrir-pei" 
                  onClick={() => abrirModal("reabrir")} 
                  disabled={carregandoStatus}
                >
                  Reabrir PEI
                </button>
              )}

              {/* FINALIZAR E SUSPENDER — só aparecem se estiver aberto ou em andamento */}
              {(statusPEI === "aberto" || statusPEI === "em_andamento") && (
                <>
                  <button 
                    className="btn-finalizar-pei" 
                    onClick={() => abrirModal("fechado")} 
                    disabled={carregandoStatus}
                  >
                    Finalizar PEI
                  </button>
                  <button 
                    className="btn-suspender-pei" 
                    onClick={() => abrirModal("suspenso")} 
                    disabled={carregandoStatus}
                  >
                    Suspender PEI
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pei-corpo">
        <div className="pei-documentos">
          <h3>Ações Disponíveis</h3>
          <div className="botoes-parecer">{renderBotoesOriginais()}</div>
        </div>

        <div className="pei-pareceres">
          <h3>Últimos Pareceres</h3>
          {pareceres.length > 0 ? pareceres.map(p => (
            <div key={p.id} className="parecer-card">
              <div className="parecer-topo">
                <span className="parecer-professor">{p.professorNome} ({p.componenteNome})</span>
                <span className="parecer-data">{p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—"}</span>
              </div>
              <div className="parecer-texto">{p.texto || "Sem texto disponível."}</div>
            </div>
          )) : <p>Nenhum parecer encontrado.</p>}
        </div>
      </div>

      {/* ==================== MODAL DE CONFIRMAÇÃO ==================== */}
      {modalAberto && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div className="modal-content">
            <h3>
              {acaoPendente === "fechado" && "Finalizar PEI"}
              {acaoPendente === "suspenso" && "Suspender PEI"}
              {acaoPendente === "reabrir" && "Reabrir PEI"}
            </h3>
            <p>
              {acaoPendente === "fechado" && "Após finalizar, o PEI não poderá mais ser alterado. Tem certeza?"}
              {acaoPendente === "suspenso" && "O PEI será pausado e poderá ser reaberto depois. Deseja continuar?"}
              {acaoPendente === "reabrir" && "O PEI voltará ao status EM ANDAMENTO. Deseja continuar?"}
            </p>

            <div className="modal-buttons">
              <button className="confirmar" onClick={confirmarAcao} disabled={carregandoStatus}>
                {carregandoStatus ? "Processando..." : "Confirmar"}
              </button>
              <button className="cancelar" onClick={fecharModal} disabled={carregandoStatus}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodoLetivoPerfil;