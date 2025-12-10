import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { mandaEmail } from "../../lib/mandaEmail";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import api from "../../configs/axiosConfig";


const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const idFromUrl = params.get("id");
  const peiCentralId = location.state?.peiCentralId || idFromUrl;

  useEffect(() => {
    if (!peiCentralId) {
      alert("PEI não encontrado. Voltando para a home...");
      navigate("/home");
    }
  }, [peiCentralId, navigate]);

  // === ESTADOS ===
  const [aluno, setAluno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [nomeCurso, setNomeCurso] = useState("—");
  const [coordenador, setCoordenador] = useState("—");
  const [emailCoordenador, setEmailCoordenador] = useState("");
  const [periodoPrincipal, setPeriodoPrincipal] = useState("—");
  const [pareceres, setPareceres] = useState([]);
  const [gruposUsuario, setGruposUsuario] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");
  const [statusPEI, setStatusPEI] = useState("aberto");
  const [carregandoStatus, setCarregandoStatus] = useState(false);
  const [erro, setErro] = useState(false);

  // Modal
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
        setNomeUsuario(user.nome || user.username || "Usuário");
        setGruposUsuario((user.grupos || []).map(g => g.toLowerCase()));
      } catch (err) {
        console.error("Erro ao ler usuário:", err);
      }
    }
  }, []);

  // === CARREGA DADOS DO PEI  ===
  useEffect(() => {
    if (!peiCentralId) return;

    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");
        console.log("Token obtido do localStorage:", token);
        if (!token) throw new Error("Token de autenticação não encontrado.");
        const headers = {
          Authorization: `Token ${token}`,
        };
        console.log("Headers enviados na requisição:", headers);

        const res = await axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`, {
          headers,
        });

        console.log("Resposta do backend:", res.data);

        const pei = res.data;

        // Aluno
        setAluno(pei.aluno || { nome: "Aluno não encontrado", email: "" });

        // Período principal
        const primeiroPeriodo = Array.isArray(pei.periodos) ? pei.periodos[0] : pei.periodos;
        setPeriodoPrincipal(primeiroPeriodo?.periodo_principal || "—");

        // Curso + Coordenador
        let cursoObj = null;
        if (pei.cursos) {
          if (Array.isArray(pei.cursos) && pei.cursos.length > 0) cursoObj = pei.cursos[0];
          else if (typeof pei.cursos === "object") cursoObj = pei.cursos;
        }

        if (cursoObj) {
          setNomeCurso(cursoObj.nome || "—");
          setCurso(cursoObj);

          const coord = cursoObj.coordenador;
          if (coord) {
            const nomeCoord = coord.nome || coord.username || coord.email?.split("@")[0] || "—";
            const emailCoord = coord.email || "";
            setCoordenador(nomeCoord);
            setEmailCoordenador(emailCoord);
          }
        }

        // Pareceres
        const todosPareceres = [];
        const periodos = Array.isArray(pei.periodos) ? pei.periodos : [pei.periodos || {}];
        periodos.forEach(p => {
          const comps = Array.isArray(p.componentes_curriculares) ? p.componentes_curriculares : [];
          comps.forEach(comp => {
            const pareceresLista = Array.isArray(comp.pareceres) ? comp.pareceres : [];
            pareceresLista.forEach(parecer => {
              const prof = parecer.professor || {};
              todosPareceres.push({
                ...parecer,
                componenteNome: comp.disciplina?.nome || "Sem disciplina",
                professorNome: prof.nome || prof.username || prof.email?.split("@")[0] || "Professor",
                professorEmail: prof.email || ""
              });
            });
          });
        });
        setPareceres(todosPareceres);

        // Status
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
      const token = localStorage.getItem("token");
      await axios.patch(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`, {
        status_pei: valorBackend
      }, { headers: { Authorization: `Token ${token}` } });

      setStatusPEI(novoStatusFrontend);
      fecharModal();

      // === ENVIO DE E-MAILS  ===
      const textoEmail = `
        Prezado(a),

        O PEI do aluno(a) ${aluno?.nome || "não identificado"} foi ${acaoTexto}.

        • Alterado por: ${nomeUsuario}
        • Motivo: ${motivo || "Não informado"}
        • Justificativa: ${justificativa || "Sem justificativa detalhada"}

        Acesse o sistema para mais detalhes.
      `.trim();

      const enviados = [];

      // Aluno
      if (aluno?.email) {
        try { await mandaEmail(aluno.email, `[PEI] Seu PEI foi ${acaoTexto}`, textoEmail); enviados.push(aluno.email); }
        catch (e) { console.log("Erro aluno:", e); }
      }

      // Coordenador
      if (emailCoordenador) {
        try { await mandaEmail(emailCoordenador, `[PEI] PEI do aluno ${aluno?.nome} foi ${acaoTexto}`, textoEmail); enviados.push(emailCoordenador); }
        catch (e) { console.log("Erro coordenador:", e); }
      }

      // Professores
      const emailsProfessores = [...new Set(pareceres.map(p => p.professorEmail).filter(Boolean))];
      for (const email of emailsProfessores) {
        try { await mandaEmail(email, `[PEI] PEI do aluno ${aluno?.nome} foi ${acaoTexto}`, textoEmail); enviados.push(email); }
        catch (e) { console.log("Erro professor:", e); }
      }

      alert(`PEI ${acaoTexto} com sucesso!\nE-mails enviados para ${enviados.length} pessoa(s).`);

    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Status atualizado, mas falha ao enviar e-mails.");
    } finally {
      setCarregandoStatus(false);
    }
  };

  // === BOTÕES ORIGINAIS ===
  const renderBotoesOriginais = () => {
    return (
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
                <Link to="/crud/PEIPeriodoLetivo" className="btn-verde">Gerenciar Períodos Letivos</Link>
                <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                <Link to="/crud/componenteCurricular" className="btn-verde">Gerenciar Componentes Curriculares</Link>
                <Link to="/ataDeAcompanhamento" className="btn-verde">Gerenciar Atas de Acompanhamento</Link>
                <Link to="/crud/documentacaoComplementar" className="btn-verde">Gerenciar Documentações Complementares</Link>
              </>
            );
            case "coordenador": return (
              <>
                <Link to="/crud/Curso" className="btn-verde">Gerenciar Cursos</Link>
                <Link to="/crud/Disciplina" className="btn-verde">Gerenciar Disciplinas</Link>
                <Link to="/peicentral" className="btn-verde">Visualizar PEI Central</Link>
                <Link to="/crud/aluno" className="btn-verde">Gerenciar Alunos</Link>
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
  };

  if (erro) return <p style={{ textAlign: "center", color: "red", padding: "50px" }}>Erro ao carregar o PEI.</p>;
  if (!aluno) return <p style={{ textAlign: "center", padding: "50px" }}>Carregando perfil do aluno...</p>;

  return (
    <div className="pei-detalhe-container">
      <div className="pei-header">
        <div className="aluno-info">
          <img src={aluno.foto || "https://img.icons8.com/win10/1200/guest-male--v2.jpg"} alt={aluno.nome} className="aluno-fotoPerfil" />
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

          {/* BOTÕES DE AÇÃO */}
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
                <select
                  style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "6px", border: "1px solid #ccc" }}
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                >
                  <option value="">Selecione o motivo...</option>

                  {acaoPendente === "fechado" && (
                    <>
                      <option>Conclusão do curso</option>
                      <option>Desistência da vaga</option>
                      <option>Transferência</option>
                      <option>Outro</option>
                    </>
                  )}

                  {acaoPendente === "suspenso" && (
                    <>
                      <option>Solicitado pelo aluno</option>
                      <option>Trancamento de matrícula</option>
                      <option>Outro</option>
                    </>
                  )}
                </select>

                <label style={{ marginTop: "15px", display: "block" }}>
                  <strong>Justificativa {motivo ? "(obrigatória)" : "(opcional)"}:</strong>
                </label>
                <textarea
                  placeholder={motivo ? "Descreva detalhadamente..." : "Justificativa detalhada (opcional)"}
                  rows="4"
                  required={!!motivo}
                  style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "6px", border: "1px solid #ccc" }}
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                className="btn-salvar"
                onClick={atualizarStatusPEI}
                disabled={carregandoStatus || (["fechado", "suspenso"].includes(acaoPendente) && !motivo)}
              >
                {carregandoStatus ? "Processando..." : "Confirmar"}
              </button>
              <button className="botao-deletar" onClick={fecharModal} disabled={carregandoStatus}>
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