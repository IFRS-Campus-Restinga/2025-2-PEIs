import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

DataTable.use(DT);

const HomeView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  // ================================
  // 1) Carregar todos usuários
  // ================================
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const res = await axios.get(API_ROUTES.USUARIO);

        const lista =
          Array.isArray(res.data?.results) ? res.data.results :
          Array.isArray(res.data) ? res.data : [];

        console.log("Usuários carregados:", lista);

        setUsuarios(lista);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
      }
    }

    carregarUsuarios();
  }, []);

  // ================================
  // 2) Carregar alunos + PEI + coordenador de curso
  // ================================
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resAlunos, resPeiCentral] = await Promise.all([
          axios.get(API_ROUTES.ALUNO),
          axios.get(API_ROUTES.PEI_CENTRAL),
        ]);

        const alunosData = [].concat(resAlunos.data?.results || resAlunos.data || []);
        const peiCentralsData = [].concat(resPeiCentral.data?.results || resPeiCentral.data || []);

        console.log("Alunos:", alunosData);
        console.log("PEI Centrals:", peiCentralsData);

        const dadosTabela = [];

        for (const aluno of alunosData) {
          console.log("\n======================");
          console.log("Processando aluno:", aluno.nome);

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

              const coordenador =
                primeiroCurso?.coordenador?.username ||
                "—";

              console.log(`Disciplina: ${nomeDisciplina}`);
              console.log("Cursos:", cursos);
              console.log("Coordenador:", coordenador);

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

        console.log("Dados finais para tabela:", dadosTabela);
        setTableData(dadosTabela);

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }

    carregarDados();
  }, []);

  // ================================
  // Abrir página do PEI
  // ================================
  const handleVisualizarClick = (peiCentralId) => {
    if (!peiCentralId) {
      alert("Este aluno não possui PEI Central.");
      return;
    }
    if (!usuarioSelecionado) {
      alert("Selecione um usuário antes de visualizar.");
      return;
    }

    navigate("/periodoLetivoPerfil", {
      state: {
        peiCentralId,
        usuarioSelecionado,
      },
    });
  };

  // Botão "Visualizar" da tabela
  useEffect(() => {
    const clickHandler = (e) => {
      if (e.target.classList.contains("visualizar-btn")) {
        const id = e.target.getAttribute("data-id");
        handleVisualizarClick(id);
      }
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [usuarioSelecionado]);

  return (
    <div className="telaPadrao-page">

      {/* Seleção de usuário */}
      <div className="cargo-dropdown-container">
        <label htmlFor="usuario" className="cargo-label">
          Selecione o usuário:
        </label>

        <select
          id="usuario"
          className="cargo-dropdown"
          value={usuarioSelecionado?.id || ""}
          onChange={(e) =>
            setUsuarioSelecionado(
              usuarios.find((u) => u.id === Number(e.target.value)) || null
            )
          }
        >
          <option value="">— Escolher usuário —</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username} — {u.categoria || "Sem categoria"}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <DataTable
        data={tableData}
        columns={[
          { title: "Aluno", data: "nome" },
          { title: "Componente Curricular", data: "componente" },
          { title: "Status", data: "status" },
          { title: "Coordenador de Curso", data: "coordenador" },
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
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ até _END_ de _TOTAL_",
            paginate: {
              next: "Próximo",
              previous: "Anterior",
            },
          },
        }}
      />
    </div>
  );
};

export default HomeView;