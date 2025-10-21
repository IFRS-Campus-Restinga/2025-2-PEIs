import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./periodoLetivoPerfil.css";

const PeriodoLetivoPerfil = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ Hook para voltar
  const { peiCentralId } = location.state || {};

  const API_ALUNO = import.meta.env.VITE_ALUNO_URL;
  const API_PEICENTRAL = import.meta.env.VITE_PEI_CENTRAL_URL;
  const API_CURSO = import.meta.env.VITE_CURSOS_URL;
  const API_PEIPERIODO = import.meta.env.VITE_PEIPERIODOLETIVO_URL;

  const [aluno, setAluno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [coordenador, setCoordenador] = useState(null);
  const [periodoPrincipal, setPeriodoPrincipal] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resPeiCentral, resAlunos, resCursos, resPeriodos] = await Promise.all([
          axios.get(`${API_PEICENTRAL}${peiCentralId}/`),
          axios.get(API_ALUNO),
          axios.get(API_CURSO),
          axios.get(API_PEIPERIODO),
        ]);

        const peiCentral = resPeiCentral.data;
        const alunosData = resAlunos.data.results || [];
        const cursosData = Array.isArray(resCursos.data)
          ? resCursos.data
          : resCursos.data?.results || [];
        const periodosData = Array.isArray(resPeriodos.data)
          ? resPeriodos.data
          : resPeriodos.data?.results || [];

        const alunoVinculado = alunosData.find((a) => a.id === peiCentral.aluno?.id);
        setAluno(alunoVinculado || peiCentral.aluno || null);

        const periodosDoPei = periodosData.filter((p) => p.pei_central === peiCentral.id);
        setPeriodos(periodosDoPei);

        if (periodosDoPei.length > 0) {
          const periodoAtual = periodosDoPei[0];
          setPeriodoPrincipal(periodoAtual.periodo_principal || "—");

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
          } else {
            console.warn("Nenhum curso correspondente encontrado para as disciplinas do PEI.");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setErro(true);
      }
    }

    if (peiCentralId) carregarDados();
  }, [peiCentralId]);

  if (erro)
    return <p style={{ textAlign: "center", color: "red" }}>Erro ao carregar informações.</p>;

  if (!aluno)
    return <p style={{ textAlign: "center" }}>Carregando informações do aluno...</p>;

  return (
    <div className="pei-detalhe-container">
      {/* Cabeçalho */}
      <div className="pei-header">
        <div className="aluno-info">
          <img
            src={aluno.foto || "https://randomuser.me/api/portraits/men/11.jpg"}
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

      {/* Corpo */}
      <div className="pei-corpo">
        <div className="pei-documentos">
          <Link to="/peicentral" className="btn-admin">Documentação PEI Central</Link>

          <div className="botoes-parecer">
            <Link to="/pareceres" className="btn-verde">Parecer Disciplina</Link>
            <Link to="/atadeacompanhamento" className="btn-verde">Ata Semestral</Link>
            <button className="btn-verde" onClick={() => navigate(-1)}>
                Voltar
            </button>
          </div>
        </div>

        <div className="pei-pareceres">
          <h3>Últimas Interações</h3>
          {periodos.length > 0 ? (
            periodos.map((periodo) =>
              periodo.componentes_curriculares?.map((comp) =>
                comp.pareceres?.map((parecer) => (
                  <div key={parecer.id} className="parecer-card">
                    <div className="parecer-topo">
                      <span className="parecer-professor">
                        👤 {parecer.professor?.nome || "Professor não informado"}{" "}
                        ({comp.disciplina?.nome || "Sem disciplina"})
                      </span>
                      <span className="parecer-data">{parecer.data || "—"}</span>
                    </div>
                    <div className="parecer-texto">
                      {parecer.texto || "Sem texto disponível."}
                    </div>
                  </div>
                ))
              )
            )
          ) : (
            <p>Nenhum parecer encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodoLetivoPerfil;
