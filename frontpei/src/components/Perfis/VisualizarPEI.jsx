import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VisualizarPEI.css";

const VisualizarPEI = () => {
  const { state } = useLocation();
  const { alunoId: peiCentralId } = useParams();
  const navigate = useNavigate();
  const API_PEIPERIODO = import.meta.env.VITE_PEIPERIODOLETIVO_URL;
  const API_PEICENTRAL = import.meta.env.VITE_PEI_CENTRAL_URL;

  const [pareceres, setPareceres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); 
  const [isPEIEncerrado, setIsPEIEncerrado] = useState(false);


  const alunoDados = state?.aluno || exemploAluno;
  const coordDados = state?.coordenador || exemploCoordenador;

  // Função para formatar a data
  const formatarData = (dataString) => {
    if (!dataString || dataString === "—") return "—";
    const [ano, mes, dia] = dataString.split("-"); // Assume formato aaaa-mm-dd
    return `${dia}/${mes}/${ano}`; // Retorna dd/mm/aaaa
  };

  // Função para abrir o popup de confirmação
  const handleEncerrarPEI = () => {
    if (!peiCentralId || isPEIEncerrado) return;
    setShowConfirmPopup(true); // Mostra o popup
  };

  // Função para confirmar o encerramento
  const confirmEncerrarPEI = async () => {
    try {
      await axios.patch(`${API_PEICENTRAL}${peiCentralId}/`, {
        status_pei: "FECHADO",
      });
      setIsPEIEncerrado(true); // Desabilita interações após encerrar
      setShowConfirmPopup(false); // Fecha o popup
    } catch (err) {
      console.error("Erro ao encerrar PEI:", err);
      alert("Erro ao encerrar o PEI. Tente novamente.");
      setShowConfirmPopup(false); // Fecha o popup em caso de erro
    }
  };

  // Função para cancelar o encerramento
  const cancelEncerrarPEI = () => {
    setShowConfirmPopup(false); // Fecha o popup sem fazer alterações
  };

  useEffect(() => {
    async function carregarPareceres() {
      try {
        setLoading(true);
        setErro(false);
        if (!peiCentralId) throw new Error("peiCentralId não encontrado");

        const resPeriodos = await axios.get(API_PEIPERIODO);
        const periodosData = Array.isArray(resPeriodos.data)
          ? resPeriodos.data
          : resPeriodos.data?.results || [];

        const periodosDoPei = periodosData.filter((p) => p.pei_central === parseInt(peiCentralId));
        const todosPareceres = [];

        periodosDoPei.forEach((periodo) => {
          (periodo.componentes_curriculares || []).forEach((comp) => {
            (comp.pareceres || []).forEach((parecer) => {
              todosPareceres.push({
                id: parecer.id,
                professor: parecer.professor?.nome || "Professor não informado",
                foto: "https://randomuser.me/api/portraits/men/55.jpg",
                data: parecer.data || "—",
                texto: parecer.texto || "Sem texto disponível.",
                disciplina: comp.disciplina?.nome || "Sem disciplina",
              });
            });
          });
        });

        setPareceres(todosPareceres);
      } catch (err) {
        console.error("Erro ao carregar pareceres:", err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    }

    carregarPareceres();
  }, [peiCentralId]);

  // Navegar de volta após o PEI ser encerrado
  useEffect(() => {
    if (isPEIEncerrado) {
      const timer = setTimeout(() => {
        navigate(-1); // Volta para a tela anterior após um breve delay
      }, 500); // Delay de 500ms para garantir que o estado seja atualizado
      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
    }
  }, [isPEIEncerrado, navigate]);

  if (erro)
    return <p style={{ textAlign: "center", color: "red" }}>Erro ao carregar interações.</p>;

  if (loading)
    return <p style={{ textAlign: "center" }}>Carregando interações...</p>;

  return (
    <div className="visualizar-pei-container">
      {/* Cabeçalho: Aluno à esquerda, Coordenador + Botões à direita */}
      <div className="aluno-header">
        <div className="aluno-info">
          <div className="aluno-foto-container">
            <img src={alunoDados.foto} alt={alunoDados.nome} />
          </div>
          <div className="aluno-dados">
            <h2>{alunoDados.nome}</h2>
            <p>Email: {alunoDados.email}</p>
            <p>Periodo: {alunoDados.semestre}</p>
            <p>Curso: {alunoDados.curso}</p>
          </div>
        </div>

        <div className="coordenador-botoes">
          <div className="coordenador-info">
            <img
              src={coordDados.foto}
              alt={coordDados.nome}
              className="coordenador-foto"
            />
            <span>{coordDados.nome}</span>
          </div>
          <div className="botoes-pei">
            <button
              className="btn-encerrar"
              onClick={handleEncerrarPEI}
              disabled={isPEIEncerrado}
            >
              Encerrar PEI
            </button>
            <button className="btn-suspender" disabled={isPEIEncerrado}>
              Suspender PEI
            </button>
          </div>
        </div>
      </div>

      <br />
      {/* Corpo: ícones à esquerda, últimas interações à direita */}
      <div className="visualizar-pei-body">
        <div className="pei-icones">
          <Link
            to="/peicentral/"
            className="icone-item"
            onClick={(e) => isPEIEncerrado && e.preventDefault()}
          >
            <img
              src="https://img.icons8.com/ios-filled/50/000000/document.png"
              alt="Documentação PEI"
            />
            <span>Documentação PEI</span>
          </Link>

          <Link
            to="/pareceres"
            className="icone-item"
            onClick={(e) => isPEIEncerrado && e.preventDefault()}
          >
            <img
              src="https://img.icons8.com/ios-filled/50/000000/pdf.png"
              alt="Parecer da disciplina"
            />
            <span>Parecer {alunoDados.disciplina}</span>
          </Link>

          <Link
            to="/atadeacompanhamento"
            className="icone-item"
            onClick={(e) => isPEIEncerrado && e.preventDefault()}
          >
            <img
              src="https://img.icons8.com/ios-filled/50/000000/pdf.png"
              alt="Atas de Reuniões Semestrais"
            />
            <span>Parecer Atas de Reuniões Semestrais</span>
          </Link>

          <Link
            //to="/"
            className="icone-item"
            onClick={(e) => isPEIEncerrado && e.preventDefault()}
          >
            <img
              src="https://img.icons8.com/ios-filled/50/000000/pdf.png"
              alt="Parecer Assistência Estudantil"
            />
            <span>Parecer Assistência Estudantil</span>
          </Link>
        </div>

        <div className="ultimas-interacoes">
          <h3>Últimas Interações</h3>
          <div className="interacoes-lista">
            {pareceres.length > 0 ? (
              pareceres.map((item) => (
                <div key={item.id} className="interacao-item">
                  <div className="interacao-header">
                    <div className="interacao-user">
                      <img
                        src={item.foto}
                        alt={item.professor}
                        className="interacao-foto"
                      />
                      <span>{item.professor} ({item.disciplina})</span>
                    </div>
                    <span className="interacao-data">{formatarData(item.data)}</span>
                  </div>
                  <div className="interacao-texto">{item.texto}</div>
                </div>
              ))
            ) : (
              <p>Nenhum parecer encontrado.</p>
            )}
          </div>
        </div>
      </div>
      <Link to="" className="voltar-btn" onClick={() => navigate(-1)}>
        Voltar
      </Link>

      {/* Popup de confirmação */}
      {showConfirmPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Atenção!!!</h3>
            <p>Esta ação vai encerrar o PEI atual.</p>
            <p> Deseja confirmar?</p>
            <div className="modal-buttons">
              <button className="btn-confirm" onClick={confirmEncerrarPEI}>
                Sim
              </button>
              <button className="btn-cancel" onClick={cancelEncerrarPEI}>
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizarPEI;