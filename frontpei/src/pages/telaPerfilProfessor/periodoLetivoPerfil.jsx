import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { mandaEmail } from "../../lib/mandaEmail";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import logo_nome from "../../assets/logo-sem-nome.png"; 
import api from "../../configs/axiosConfig";


const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const idFromUrl = params.get("id");
  const peiCentralId = location.state?.peiCentralId || idFromUrl;

  useEffect(() => {
    if (!peiCentralId) {
      navigate("/home");
    }
  }, [peiCentralId, navigate]);

  const [aluno, setAluno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [nomeCurso, setNomeCurso] = useState("—");
  const [coordenador, setCoordenador] = useState("—");
  const [emailCoordenador, setEmailCoordenador] = useState("");
  const [periodoPrincipal, setPeriodoPrincipal] = useState("—");
  const [pareceres, setPareceres] = useState([]);
  const [emailsProfessores, setEmailsProfessores] = useState([]);
  const [gruposUsuario, setGruposUsuario] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");
  const [statusPEI, setStatusPEI] = useState("aberto");
  const [carregandoStatus, setCarregandoStatus] = useState(false);
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

  // === CARREGA USUÁRIO ===
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

  // === CARREGA DADOS DO PEI ===
  useEffect(() => {
    if (!peiCentralId) return;

    async function carregarDados() {
      try {
        const token = localStorage.getItem("token");
        console.log("Token obtido do localStorage:", token);
        if (!token) throw new Error("Token de autenticação não encontrado.");
        const headers = { Authorization: `Token ${token}` };
        console.log("Headers enviados na requisição:", headers);

        const res = await axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`, { headers });
        console.log("Resposta do backend:", res.data);

        const pei = res.data;
        console.log("PEI Central retornado:", pei);

        // --- ALUNO ---
        const alunoData = pei.aluno || { nome: "Aluno não encontrado", email: "" };
        setAluno(alunoData);
        console.log("Aluno retornado:", alunoData);

        // --- PERÍODOS ---
        const periodos = pei.periodos || [];
        console.log("Períodos retornados:", periodos);
        setPeriodoPrincipal(periodos[0]?.periodo_principal || "—");

        // --- CURSO ---
        const cursoData = pei.cursos || null;
        setCurso(cursoData);
        if (cursoData) {
          setNomeCurso(cursoData.nome || "—");
          const coord = cursoData.coordenador;
          if (coord) {
            const nomeCoord = coord.nome || coord.username || coord.email?.split("@")[0] || "—";
            setCoordenador(nomeCoord);
            setEmailCoordenador(coord.email || "");
          }
        }

        const todosPareceres = (pei.periodos || [])
          .flatMap(p => p.componentes_curriculares || [])
          .flatMap(comp =>
            (comp.pareceres || []).map(parecer => ({
              ...parecer,
              componenteNome: comp.disciplina?.nome || "Sem disciplina",
              professorNome:
                parecer.professor?.first_name ||
                parecer.professor?.nome ||
                parecer.professor?.email?.split("@")[0] ||
                "Professor",
            }))
          )
          .sort((a, b) => new Date(b.data) - new Date(a.data));

        setPareceres(todosPareceres);        

        // E-MAILS DOS PROFESSORES DAS DISCIPLINAS
        const emailsSet = new Set();
        (pei.periodos || []).forEach(p => {
          (p.componentes_curriculares || []).forEach(comp => {
            (comp.disciplina?.professores || []).forEach(prof => {
              if (prof?.email) emailsSet.add(prof.email);
            });
          });
        });
        setEmailsProfessores(Array.from(emailsSet));

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

    let statusAtualizado = false;

    // TENTA ATUALIZAR O STATUS
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`,
        { status_pei: valorBackend },
        { headers: { Authorization: `Token ${token}` } }
      );
      setStatusPEI(novoStatusFrontend);
      statusAtualizado = true;
    } catch (err) {
      console.warn("Status não atualizado (sem permissão no objeto):", err.response?.data);
      
    }

    // ENVIA E-MAILS SEMPRE
    const textoEmail = `
        Prezado(a),

        O PEI do aluno(a) ${aluno.nome} foi ${acaoTexto}.

        • Alterado por: ${nomeUsuario}
        • Motivo: ${motivo || "Não informado"}
        • Justificativa: ${justificativa || "Sem justificativa detalhada"}

        Acesse o sistema para mais detalhes.
      `.trim();

    const enviados = [];
    const destinos = new Set();

    if (aluno?.email) destinos.add(aluno.email);
    if (emailCoordenador) destinos.add(emailCoordenador);
    emailsProfessores.forEach(e => destinos.add(e));

    for (const email of destinos) {
      try {
        await mandaEmail(email, `[PEI] Seu PEI foi ${acaoTexto}`, textoEmail);
        enviados.push(email);
      } catch (e) {
        console.log(`Falha ao enviar para ${email}`, e);
      }
    }

    fecharModal();
    setCarregandoStatus(false);
  };

  // === BOTÕES ORIGINAIS ===
    const formatarTempoDecorrido = (dataString) => {
        const data = new Date(dataString);
        const agora = new Date();
        const diffMs = agora - data;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Agora mesmo";
        if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
        if (diffDias < 7) return `Há ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
        
        return data.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
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
                  <Link to="/pareceres" state={{ peiCentralId }} className="btn-acao-pei">Cadastrar Parecer</Link>
                  <Link to="/documentacaoComplementar" state={{matricula: aluno.matricula}} className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                </>
              );
            case "pedagogo":
              return (
                <>
                  <Link to="/ataDeAcompanhamento" className="btn-acao-pei">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                  <Link to="/documentacaoComplementar" state={{matricula: aluno.matricula}} className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                </>
              );
            case "napne":
              return (
                <>
                  <Link to="/crud/PEIPeriodoLetivo" className="btn-acao-pei">Gerenciar Períodos Letivos</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                  <Link to="/crud/componenteCurricular" className="btn-acao-pei">Gerenciar Componentes Curriculares</Link>
                  <Link to="/ataDeAcompanhamento" className="btn-acao-pei">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/documentacaoComplementar" state={{matricula: aluno.matricula}} className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                </>
              );
            case "coordenador":
              return (
                <>
                  <Link to="/crud/Curso" className="btn-acao-pei">Gerenciar Cursos</Link>
                  <Link to="/crud/Disciplina" className="btn-acao-pei">Gerenciar Disciplinas</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                  <Link to="/crud/aluno" className="btn-acao-pei">Gerenciar Alunos</Link>
                  <Link to="/ataDeAcompanhamento" className="btn-acao-pei">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/documentacaoComplementar" state={{matricula: aluno.matricula}} className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
                </>
              );
            case "admin":
              return (
                <>
                  <Link to="/usuario" className="btn-acao-pei">Gerenciar Usuários</Link>
                  <Link to="/crud/Curso" className="btn-acao-pei">Gerenciar Cursos</Link>
                  <Link to="/crud/Disciplina" className="btn-acao-pei">Gerenciar Disciplinas</Link>
                  <Link to="/crud/PEIPeriodoLetivo" className="btn-acao-pei">Gerenciar Períodos Letivos</Link>
                  <Link to="/crud/aluno" className="btn-acao-pei">Gerenciar Alunos</Link>
                  <Link to="/peicentral" className="btn-acao-pei">Visualizar PEI Central</Link>
                  <Link to="/pareceres" state={{ peiCentralId }} className="btn-acao-pei">Cadastrar Parecer</Link>
                  <Link to="/crud/componenteCurricular" className="btn-acao-pei">Gerenciar Componentes Curriculares</Link>
                  <Link to="/ataDeAcompanhamento" className="btn-acao-pei">Gerenciar Atas de Acompanhamento</Link>
                  <Link to="/documentacaoComplementar" state={{matricula: aluno.matricula}} className="btn-acao-pei">Gerenciar Documentações Complementares</Link>
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
      {/* CABEÇALHO (MANTIDO) */}
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

        </div>
      </div>

      {/* CORPO DIVIDIDO EM 2 COLUNAS */}
      <div className="pei-corpo-grid">
        
        {/* ESQUERDA: PARECERES (Scrollável) */}
        <div className="pei-coluna-pareceres">
          <div className="pareceres-header">
             <h3>Últimos Pareceres</h3>
          </div>
          
          <div className="pareceres-lista-scroll">
            {/* 👇 NOVO BOTÃO DE ADICIONAR (CARD) */}
            {/* Verifica se o usuário tem permissão */}
            {(gruposUsuario.includes("professor") || gruposUsuario.includes("admin") || gruposUsuario.includes("napne")) && (
                <Link to="/pareceres" state={{ peiCentralId }} className="parecer-card-add">
                  <span className="icon-plus">+</span>
                  <span>Adicionar Novo Parecer</span>
                </Link>
            )}
            {pareceres.length > 0 ? (
              pareceres.map((p) => (
                <div key={p.id} className="parecer-card" onClick={() => abrirPopup(p)}
                style={{ cursor: "pointer" }}>
                    <div className="parecer-topo">
                    <span className="parecer-professor">
                      {p.professorNome} <small>({p.componenteNome})</small>
                    </span>
                    
                    
                    <div className="parecer-info-data">
                        <span className="parecer-data-oficial">
                          {p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—"}
                        </span>
                        <span className="parecer-tempo-relativo">
                          {formatarTempoDecorrido(p.data)}
                        </span>
                    </div>

                  </div>
                  <div className="parecer-texto">
                    {p.texto || "Sem texto disponível."}
                  </div>
                </div>
              ))
            ) : (
              <div className="parecer-vazio">Nenhum parecer registrado neste período.</div>
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
                        width: "93%",
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

        {/* DIREITA: AÇÕES (Fixa) */}
        <div className="pei-coluna-acoes">
          <div className="acoes-card">
            <h3>Ações Disponíveis</h3>
            <div className="lista-botoes-vertical">
              {renderBotoesOriginais()}
            </div>
          </div>
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
                      <option>Desistência de vaga</option>
                      <option>Outros</option>
                    </>
                  )}

                  {acaoPendente === "suspenso" && (
                    <>
                      <option>Solicitado pelo aluno</option>
                      <option>Trancamento de matrícula</option>
                      <option>Outros</option>
                    </>
                  )}
                </select>

                <label style={{ marginTop: "15px", display: "block" }}>
                  <strong>Justificativa</strong>
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
