import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import formatarNome from "../../utils/formatarNome";

DataTable.use(DT);

const Home = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      const user = JSON.parse(usuarioSalvo);
      setUsuarioLogado(user);
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!usuarioLogado) return;

    async function carregarDados() {
      try {
        setLoading(true);

        const [resAlunos, resPeiCentral, resDisciplinas] = await Promise.all([
          axios.get(API_ROUTES.ALUNO),
          axios.get(API_ROUTES.PEI_CENTRAL),
          axios.get(API_ROUTES.DISCIPLINA),
        ]);

        const alunos = Array.isArray(resAlunos.data?.results) ? resAlunos.data.results : resAlunos.data || [];
        const peis = Array.isArray(resPeiCentral.data?.results) ? resPeiCentral.data.results : resPeiCentral.data || [];
        const disciplinas = Array.isArray(resDisciplinas.data?.results) ? resDisciplinas.data.results : resDisciplinas.data || [];

        // === DADOS DO USUÁRIO LOGADO ===
        const emailUsuario = usuarioLogado.email;
        const grupos = (usuarioLogado.grupos || []).map(g => g.toLowerCase());

        // Disciplinas que o professor logado leciona
        const disciplinasDoProfessor = disciplinas.filter(d =>
          d.professores?.some(p => p.email === emailUsuario || p.username === emailUsuario)
        );

        // Cursos que o coordenador coordena
        const cursosCoordenados = disciplinas
          .flatMap(d => d.cursos || [])
          .filter(c => c.coordenador?.email === emailUsuario || c.coordenador?.username?.includes(emailUsuario.split("@")[0]));

        const dadosTabela = [];

        for (const aluno of alunos) {
          const pei = peis.find(p => p.aluno?.id === aluno.id);
          if (!pei) continue;

          const status = pei.status_pei || "Sem PEI";
          const periodos = pei.periodos || [];

          for (const periodo of periodos) {
            const componentes = periodo.componentes_curriculares || [];

            for (const comp of componentes) {
              const disciplina = comp.disciplina || comp.disciplinas;
              if (!disciplina) continue;

              const nomeDisciplina = disciplina.nome || "—";
              const cursosDaDisciplina = disciplina.cursos || [];
              const coordenador = cursosDaDisciplina[0]?.coordenador;

              // === FILTRO POR PERMISSÃO ===
              let podeVer = false;

              if (grupos.includes("admin") || grupos.includes("napne") || grupos.includes("pedagogo")) {
                podeVer = true; // Admins veem tudo
              } else if (grupos.includes("professor")) {
                // Professor só vê se leciona essa disciplina
                podeVer = disciplinasDoProfessor.some(d => d.id === disciplina.id);
              } else if (grupos.includes("coordenador")) {
                // Coordenador só vê alunos do seu curso
                podeVer = cursosDaDisciplina.some(c => cursosCoordenados.some(cc => cc.id === c.id));
              }

              if (!podeVer) continue; // pula se não tiver permissão

              dadosTabela.push({
                nome: aluno.nome,
                componente: nomeDisciplina,
                status,
                coordenador: coordenador || "—",
                peiCentralId: pei.id,
              });
            }
          }
        }

        setTableData(dadosTabela);
      } catch (err) {
        console.error("Erro ao carregar home com filtro:", err);
        alert("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [usuarioLogado]);

  const handleVisualizarClick = (peiCentralId) => {
    if (!peiCentralId) return alert("Sem PEI");
    navigate("/periodoLetivoPerfil", { state: { peiCentralId } });
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.target.classList.contains("visualizar-btn")) {
        const id = e.target.getAttribute("data-id");
        handleVisualizarClick(id);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  if (!usuarioLogado) return <div>Redirecionando...</div>;

  return (
    <div className="telaPadrao-page">
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <h2>Bem-vindo(a), {usuarioLogado.nome || usuarioLogado.email}!</h2>
        <p><strong>Você está vendo apenas os alunos que têm relação com suas permissões.</strong></p>
      </div>

      {loading ? (
        <p>Carregando seus alunos...</p>
      ) : tableData.length === 0 ? (
        <p>Você não tem alunos vinculados no momento.</p>
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { title: "Aluno", data: "nome" },
            { title: "Componente Curricular", data: "componente" },
            { title: "Status do PEI", data: "status" },
            { title: "Coordenador", data: "coordenador", render: (c) => formatarNome(c) },
            {
              title: "Ações",
              data: "peiCentralId",
              render: (id) => `
                <button class="btn btn-sm btn-primary visualizar-btn" data-id="${id}">
                  Visualizar PEI
                </button>
              `,
            },
          ]}
          className="display table table-striped table-hover"
          options={{
            pageLength: 10,
            responsive: true,
            language: { search: "Pesquisar:", emptyTable: "Nenhum aluno encontrado com suas permissões." },
          }}
        />
      )}
    </div>
  );
};

export default Home;