import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

DataTable.use(DT);

const HomeView = ({ user, onLogout }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const navigate = useNavigate();
  
  const [erro, setErro] = useState(null);

  // CARREGAR USUÁRIOS
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const res = await axios.get(API_ROUTES.USUARIO);
        const lista = res.data?.results || res.data || [];
        setUsuarios(lista);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        alert("Erro ao carregar usuários.");
      }
    }

    carregarUsuarios();
  }, []);

  // CARREGAR DADOS DA TABELA
  useEffect(() => {
    async function carregarDados() {
      setErro(null);
      setLoading(true);

      try {
        const [resAlunos, resPeiCentral, resCursos, resPeriodos] = await Promise.all([
          axios.get(API_ROUTES.ALUNO),
          axios.get(API_ROUTES.PEI_CENTRAL),
          axios.get(API_ROUTES.CURSOS),
          axios.get(API_ROUTES.PEIPERIODOLETIVO),
        ]);

        const alunosData = resAlunos.data?.results || resAlunos.data || [];
        const peiData = resPeiCentral.data?.results || resPeiCentral.data || [];
        const cursosData = resCursos.data?.results || resCursos.data || [];
        const periodosData = resPeriodos.data?.results || resPeriodos.data || [];

        const dadosTabela = [];

        alunosData.forEach((aluno) => {
          const peiCentral = peiData.find((p) => p.aluno?.id === aluno.id);
          const status = peiCentral?.status_pei || "Sem PEI";

          const periodos = peiCentral
            ? periodosData.filter((p) => p.pei_central === peiCentral.id)
            : [];

          if (periodos.length === 0) {
            dadosTabela.push({
              nome: aluno.nome,
              componente: "—",
              status,
              coordenador: "—",
              peiCentralId: peiCentral?.id || null,
            });
            return;
          }

          periodos.forEach((periodo) => {
            const componentes = periodo.componentes_curriculares || [];

            if (componentes.length === 0) {
              dadosTabela.push({
                nome: aluno.nome,
                componente: "—",
                status,
                coordenador: "—",
                peiCentralId: peiCentral?.id || null,
              });
              return;
            }

            componentes.forEach((comp) => {
              const disciplina = comp.disciplina;
              if (!disciplina) return;

              const curso = cursosData.find((c) =>
                c.disciplinas?.some((d) => d.id === disciplina.id)
              );

              dadosTabela.push({
                nome: aluno.nome,
                componente: disciplina.nome || "Disciplina sem nome",
                status,
                coordenador: curso?.coordenador?.nome || "Sem coordenador",
                peiCentralId: peiCentral?.id || null,
              });
            });
          });
        });

        setTableData(dadosTabela);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        alert("Erro ao carregar tabela.");
      }

      setLoading(false);
    }

    carregarDados();
  }, []);

  // BOTÃO VISUALIZAR
  const handleVisualizarClick = (peiCentralId) => {
    if (!peiCentralId) {
      return alert("Nenhum PEI Central vinculado.");
    }

    if (!usuarioSelecionado) {
      return alert("Selecione um usuário antes de visualizar.");
    }

    navigate("/periodoLetivoPerfil", {
      state: {
        peiCentralId,
        usuarioSelecionado,
        cargoSelecionado: usuarioSelecionado.categoria,
        userLogado: user,
      },
    });
  };

  useEffect(() => {
    const listener = (e) => {
      if (e.target.classList.contains("visualizar-btn")) {
        handleVisualizarClick(e.target.getAttribute("data-id"));
      }
    };

    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, [usuarioSelecionado, user]);

  // HTML
  return (
    <div className="telaPadrao-page">
      <DataTable
        data={tableData}
        columns={[
          { title: "Nome do aluno", data: "nome" },
          { title: "Componente Curricular", data: "componente" },
          { title: "Status", data: "status" },
          { title: "Coordenador", data: "coordenador" },
          {
            title: "Visualizar",
            data: "peiCentralId",
            render: (id) => `
              <button class="btn btn-sm btn-primary visualizar-btn" data-id="${id}">
                Visualizar
              </button>
            `,
          },
        ]}
        className="display table table-striped table-hover w-100"
        options={{
          pageLength: 10,
          language: {
            search: "Pesquisar:",
            zeroRecords: "Nenhum PEI encontrado",
            emptyTable: "Nenhum dado disponível",
          },
        }}
      />
    </div>
  );
};

export default HomeView;
