// src/pages/home/HomeView.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import formatarNome from "../../utils/formatarNome";

DataTable.use(DT);

const HomeView = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate();

  // 1) Carregar usuário logado automaticamente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("/api/auth/me/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setUsuarioLogado(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // 2) Carregar dados da tabela (igual à versão antiga que funcionava!)
  useEffect(() => {
    if (!usuarioLogado) return;

    async function carregarDados() {
      try {
        setLoading(true);

        const [resAlunos, resPeiCentral] = await Promise.all([
          axios.get(API_ROUTES.ALUNO),
          axios.get(API_ROUTES.PEI_CENTRAL),
        ]);

        const alunosData = [].concat(resAlunos.data?.results || resAlunos.data || []);
        const peiCentralsData = [].concat(resPeiCentral.data?.results || resPeiCentral.data || []);

        const dadosTabela = [];

        for (const aluno of alunosData) {
          const pei = peiCentralsData.find((p) => p.aluno?.id === aluno.id);
          const status = pei?.status_pei || "Sem PEI";

          if (!pei) {
            dadosTabela.push({
              nome: aluno.nome,
              componente: "—",
              status,
              coordenador: "—",
              peiCentralId: null,
            });
            continue;
          }

          const periodos = pei.periodos || pei.periodos_set || [];

          if (!periodos.length) {
            dadosTabela.push({
              nome: aluno.nome,
              componente: "—",
              status,
              coordenador: "—",
              peiCentralId: pei.id,
            });
            continue;
          }

          for (const periodo of periodos) {
            const componentes = periodo.componentes_curriculares || [];
            for (const comp of componentes) {
              const disciplina = comp.disciplina || comp.disciplinas;
              const nomeDisciplina = disciplina?.nome || "—";
              const cursos = disciplina?.cursos || [];
              const primeiroCurso = cursos[0];
              const coordenador = primeiroCurso?.coordenador
                ? formatarNome(primeiroCurso.coordenador)
                : "—";

              dadosTabela.push({
                nome: aluno.nome,
                componente: nomeDisciplina,
                status,
                coordenador,
                peiCentralId: pei.id,
              });
            }
          }
        }

        setTableData(dadosTabela);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [usuarioLogado]);

  // Abrir PEI (sem precisar do dropdown!)
  const handleVisualizarClick = (peiCentralId) => {
    if (!peiCentralId) {
      alert("Este aluno não possui PEI Central.");
      return;
    }
    navigate("/periodoLetivoPerfil", {
      state: { peiCentralId },
    });
  };

  // Botão Visualizar (igualzinho ao antigo)
  useEffect(() => {
    const clickHandler = (e) => {
      if (e.target.classList.contains("visualizar-btn")) {
        const id = e.target.getAttribute("data-id");
        handleVisualizarClick(id);
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, []);

  if (!usuarioLogado) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Carregando usuário...</div>;
  }

  return (
    <div className="telaPadrao-page">
      {loading ? (
        <p style={{ textAlign: "center", padding: "50px" }}>Carregando alunos...</p>
      ) : (
        <DataTable
          key={tableData.length}
          data={tableData}
          columns={[
            { title: "Aluno", data: "nome" },
            { title: "Componente Curricular", data: "componente" },
            { title: "Status", data: "status" },
            { title: "Coordenador de Curso", data: "coordenador" },
            {
              title: "Visualizar",
              data: "peiCentralId",
              render: (id) => id ? `
                <button class="btn btn-sm btn-primary visualizar-btn" data-id="${id}">
                  Visualizar
                </button>
              ` : "—",
            },
          ]}
          className="display table table-striped table-hover w-100"
          options={{
            destroy: true,
            pageLength: 10,
            language: {
              search: "Pesquisar:",
              lengthMenu: "Mostrar _MENU_ registros",
              info: "Mostrando _START_ até _END_ de _TOTAL_",
              paginate: { next: "Próximo", previous: "Anterior" },
            },
          }}
        />
      )}
    </div>
  );
};

export default HomeView;