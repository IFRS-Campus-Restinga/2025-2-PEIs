import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { mandaEmail } from "../../lib/mandaEmail";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const { peiCentralId } = location.state || {};

  // === ESTADOS ===
  const [aluno, setAluno] = useState({ nome: "", email: "" });
  const [nomeCurso, setNomeCurso] = useState("—");
  const [coordenador, setCoordenador] = useState("—");
  const [emailCoordenador, setEmailCoordenador] = useState("");
  const [periodoPrincipal, setPeriodoPrincipal] = useState("—");
  const [pareceres, setPareceres] = useState([]);
  const [gruposUsuario, setGruposUsuario] = useState([]);
  const [nomeUsuarioLogado, setNomeUsuarioLogado] = useState("Usuário");
  const [statusPEI, setStatusPEI] = useState("aberto");
  const [carregandoStatus, setCarregandoStatus] = useState(false);
  const [erro, setErro] = useState(false);

  // === MODAL ===
  const [modalAberto, setModalAberto] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [justificativa, setJustificativa] = useState("");

  // === CARREGA USUÁRIO LOGADO ===
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      try {
        const user = JSON.parse(usuarioSalvo);
        setGruposUsuario((user.grupos || []).map(g => g.toLowerCase()));
        setNomeUsuarioLogado(user.nome || user.username || "Usuário");
      } catch (err) {
        console.error("Erro ao ler usuário:", err);
      }
    }
  }, []);

  // === CARREGA DADOS DO PEI (COM TRATAMENTO ROBUSTO) ===
  useEffect(() => {
    if (!peiCentralId) return;

    async function carregarDados() {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        const pei = res.data;

        // Aluno
        setAluno(pei.aluno || { nome: "Aluno não encontrado", email: "" });

        // Período principal
        const primeiroPeriodo = Array.isArray(pei.periodos) ? pei.periodos[0] : pei.periodos;
        setPeriodoPrincipal(primeiroPeriodo?.periodo_principal || "—");

        // === CURSO E COORDENADOR (AGORA 100% SEGURO) ===
        let cursoObj = null;

        if (pei.cursos) {
          if (Array.isArray(pei.cursos) && pei.cursos.length > 0) {
            cursoObj = pei.cursos[0];
          } else if (!Array.isArray(pei.cursos) && typeof pei.cursos === "object") {
            cursoObj = pei.cursos;
          }
        }

        if (cursoObj) {
          setNomeCurso(cursoObj.nome || "—");

          const coord = cursoObj.coordenador;
          if (coord) {
            const nomeCoord = coord.nome || coord.username || coord.email?.split("@")[0] || "—";
            const emailCoord = coord.email || "";
            setCoordenador(nomeCoord);
            setEmailCoordenador(emailCoord);
          } else {
            setCoordenador("—");
            setEmailCoordenador("");
          }
        } else {
          setNomeCurso("—");
          setCoordenador("—");
          setEmailCoordenador("");
        }

        // Pareceres
        const todosPareceres = [];
        const periodos = Array.isArray(pei.periodos) ? pei.periodos : [pei.periodos];
        periodos.forEach(p => {
          if (p?.componentes_curriculares) {
            const comps = Array.isArray(p.componentes_curriculares) ? p.componentes_curriculares : [p.componentes_curriculares];
            comps.forEach(comp => {
              if (comp?.pareceres) {
                const pareceresLista = Array.isArray(comp.pareceres) ? comp.pareceres : [comp.pareceres];
                pareceresLista.forEach(parecer => {
                  todosPareceres.push({
                    ...parecer,
                    componenteNome: comp.disciplina?.nome || "Sem disciplina",
                    professorNome: parecer.professor?.nome || parecer.professor?.username || "Professor",
                    professorEmail: parecer.professor?.email || ""
                  });
                });
              }
            });
          }
        });
        setPareceres(todosPareceres);

        // Status do PEI
        const mapaStatus = {
          "FECHADO": "fechado",
          "SUSPENSO": "suspenso",
          "EM ANDAMENTO": "em_andamento",
          "ABERTO": "aberto"
        };
        setStatusPEI(mapaStatus[pei.status_pei] || "aberto");

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

        • Alterado por: ${nomeUsuarioLogado}
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

  // === BOTÕES POR GRUPO ===
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

  if (erro) return <p style={{ textAlign: "center", color: "red", padding: "50px" }}>Erro ao carregar o PEI.</p>;
  if (!aluno.nome) return <p style={{ textAlign: "center", padding: "50px" }}>Carregando perfil do aluno...</p>;

  return (
    <div className="pei-detalhe-container">
      <div className="pei-header">
        <div className="aluno-info">
          <img src={aluno.foto || "https://img.icons8.com/win10/100/guest-male--v2.jpg"} alt={aluno.nome} className="aluno-fotoPerfil" />
          <div>
            <p><b>Nome:</b> {aluno.nome}</p>
            <p><b>E-mail:</b> {aluno.email || "—"}</p>
            <p><b>Período Principal:</b> {periodoPrincipal}</p>
          </div>
        </div>

        <div className="curso-info">
          <p><b>Curso:</b> {nomeCurso}</p>
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