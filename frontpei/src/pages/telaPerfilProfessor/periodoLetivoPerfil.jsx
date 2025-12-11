import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { mandaEmail } from "../../lib/mandaEmail";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import { API_ROUTES } from "../../configs/apiRoutes";
import logo_nome from "../../assets/logo-sem-nome.png";
//import api from "../../configs/axiosConfig";
import Sidebar from "../../components/layout/Sidebar"; 

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
  const [statusPEI, setStatusPEI] = useState("em_andamento");
  const [carregandoStatus, setCarregandoStatus] = useState(false);
  const [emailCoordenador, setEmailCoordenador] = useState("");

  // Funções para abrir e fechar popup de parecer
  function abrirPopup(parecer) {
    setParecerSelecionado(parecer);
    setMostrarPopup(true);
  };

  function formatarDataHora(isoString) {
    return new Date(isoString).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }


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

      await api.put(
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

  // === MODAL ===
  const [modalAberto, setModalAberto] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [justificativa, setJustificativa] = useState("");

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
        setEmailCoordenador(cursoData?.coordenador?.email || "");


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

  // === MODAL ===
  const abrirModal = (acao) => {
    setAcaoPendente(acao);
    setMotivo("");
    setJustificativa("");
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAcaoPendente(null);
  };

  // === ATUALIZA STATUS + ENVIA E-MAILS ===
  const atualizarStatusPEI = async () => {
    if (carregandoStatus || !acaoPendente) return;
    setCarregandoStatus(true);

    let valorBackend, novoStatusFrontend, acaoTexto;

    if (acaoPendente === "fechado") {
      valorBackend = "FECHADO";
      novoStatusFrontend = "fechado";
      acaoTexto = "finalizado (fechado)";
    } else if (acaoPendente === "suspenso") {
      valorBackend = "SUSPENSO";
      novoStatusFrontend = "suspenso";
      acaoTexto = "suspenso";
    } else if (acaoPendente === "reabrir") {
      valorBackend = "EM ANDAMENTO";
      novoStatusFrontend = "em_andamento";
      acaoTexto = "reaberto";
    }

    try {
      const token = localStorage.getItem("token") || "";
      await axios.patch(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`, {
        status_pei: valorBackend
      }, { headers: { Authorization: `Token ${token}` } });

      setStatusPEI(novoStatusFrontend);
      fecharModal();

      const textoEmail = `
        Prezado(a),

        O PEI do aluno(a) **${aluno.nome}** foi **${acaoTexto}**.

        • Alterado por: ${nomeUsuario}
        • Motivo: ${motivo || "Não informado"}
        • Justificativa: ${justificativa || "Sem justificativa detalhada"}

        Acesse o sistema para mais detalhes.
      `.trim();

      const enviados = [];

      if (aluno.email) {
        await mandaEmail(aluno.email, `[PEI] Seu PEI foi ${acaoTexto}`, textoEmail);
        enviados.push(aluno.email);
      }

      if (emailCoordenador) {
        await mandaEmail(emailCoordenador, `[PEI] PEI do aluno ${aluno.nome} foi ${acaoTexto}`, textoEmail);
        enviados.push(emailCoordenador);
      }

      const emailsProf = [...new Set(pareceres.map(p => p.professorEmail).filter(Boolean))];
      for (const email of emailsProf) {
        await mandaEmail(email, `[PEI] PEI do aluno ${aluno.nome} foi ${acaoTexto}`, textoEmail);
        enviados.push(email);
      }

    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setCarregandoStatus(false);
    }
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
                <Sidebar>
                  <Link to="/usuario" className="sidebar-link">Gerenciar Usuários</Link>
                  <Link to="/crud/Curso" className="sidebar-link">Gerenciar Cursos</Link>
                  <Link to="/crud/Disciplina" className="sidebar-link">Gerenciar Disciplinas</Link>
                  <Link to="/crud/PEIPeriodoLetivo" className="sidebar-link">Gerenciar Períodos Letivos</Link>
                  <Link to="/crud/aluno" className="sidebar-link">Gerenciar Alunos</Link>
                  <Link to="/peicentral" className="sidebar-link">Visualizar PEI Central</Link>
                  <Link to="/pareceres" state={{ peiCentralId }} className="sidebar-link">Cadastrar Parecer</Link>
                  <Link to="/crud/componenteCurricular" className="sidebar-link">Gerenciar Componentes Curriculares</Link>
                  <Link to="/ataDeAcompanhamento" className="sidebar-link">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/crud/documentacaoComplementar" className="sidebar-link">Gerenciar Documentações Complementares</Link>
                </Sidebar>
              );
            default:
              return null;
          }
        })}
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

          <div style={{ margin: "18px 0" }}>
            <strong>Status do PEI: </strong>
            <span className={`status-badge ${statusPEI}`}>
              {statusPEI === "fechado" ? "Fechado" :
               statusPEI === "suspenso" ? "Suspenso" :
               statusPEI === "em_andamento" ? "Em Andamento" : "Aberto"}
            </span>
          </div>
          {/* BOTÕES */}
          {(gruposUsuario.includes("admin") || gruposUsuario.includes("napne") || gruposUsuario.includes("coordenador")) && (
            <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {statusPEI === "suspenso" && (
                <button className="btn-reabrir-pei" onClick={() => abrirModal("reabrir")} disabled={carregandoStatus}>
                  Reabrir PEI
                </button>
              )}
              {(statusPEI === "aberto" || statusPEI === "em_andamento") && (
                <>
                  <button className="btn-finalizar-pei" onClick={() => abrirModal("fechado")} disabled={carregandoStatus}>
                    Finalizar PEI
                  </button>
                  <button className="btn-suspender-pei" onClick={() => abrirModal("suspenso")} disabled={carregandoStatus}>
                    Suspender PEI
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pei-corpo">
        {renderBotoesOriginais()}
        <div className="pei-pareceres">
          <h3>Últimos Pareceres</h3>
          {pareceres.length > 0 ? (
            pareceres.map((p) => (
              <div 
                key={p.id} 
                className="parecer-card" 
                onClick={() => abrirPopup(p)}
                style={{ cursor: "pointer" }}
              >

                
                  <span className="parecer-professor">
                    {p.professorNome} ({p.componenteNome})
                  </span>
                  <span className="parecer-data">
                    {p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—"}
                  </span>
                
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

                  <div className="header-right-parecer">
                    <p><strong>Professor:</strong> {parecerSelecionado.professorNome}</p>
                    <p><strong>Componente:</strong> {parecerSelecionado.componenteNome}</p>
                    <p><strong>Criado em:</strong> {formatarDataHora(parecerSelecionado.data)}</p>

                    {/*{parecerSelecionado.data && (
                      <p><strong>Atualizado em:</strong> {formatarDataHora(parecerSelecionado.data)}</p>
                    )}*/}

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

                <div className="popup-texto">
                  {modoEdicao ? (
                    <textarea
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      style={{
                        width: "98%",
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
                      <button className="botao-deletar" onClick={() => setModoEdicao(false)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="botao-editar" onClick={ativarEdicao}>
                        Editar
                      </button>
                      <button className="botao-deletar" onClick={fecharPopup}>
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
      <BotaoVoltar />

      {/* MODAL */}
      {modalAberto && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", maxWidth: "520px", width: "90%" }}>
            <h3 style={{ margin: "0 0 15px" }}>
              {acaoPendente === "fechado" ? "Finalizar PEI" : acaoPendente === "suspenso" ? "Suspender PEI" : "Reabrir PEI"}
            </h3>
            <p style={{ marginBottom: "20px" }}>
              {acaoPendente === "fechado" && "O PEI será marcado como FECHADO e não poderá mais ser alterado."}
              {acaoPendente === "suspenso" && "O PEI será pausado e poderá ser reaberto depois."}
              {acaoPendente === "reabrir" && "O PEI voltará ao status EM ANDAMENTO."}
            </p>

            {(acaoPendente === "fechado" || acaoPendente === "suspenso") && (
              <div style={{ marginBottom: "20px" }}>
                <label><strong>Motivo:</strong></label>
                <select style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "6px", border: "1px solid #ccc" }}
                  value={motivo} onChange={e => setMotivo(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option>Conclusão do curso</option>
                  <option>Desistência</option>
                  <option>Transferência</option>
                  <option>Mudança de instituição</option>
                  <option>Outros</option>
                </select>

                <label style={{ marginTop: "15px", display: "block" }}><strong>Justificativa (opcional):</strong></label>
                <textarea
                  placeholder="Detalhe o motivo..."
                  rows="4"
                  style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "6px", border: "1px solid #ccc" }}
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value)}
                />
              </div>
            )}

            <div className="modal-buttons" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="confirmar" onClick={atualizarStatusPEI} disabled={carregandoStatus}>
                {carregandoStatus ? "Processando..." : "Confirmar"}
              </button>
              <button className="cancelar" onClick={fecharModal} disabled={carregandoStatus}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodoLetivoPerfil;
