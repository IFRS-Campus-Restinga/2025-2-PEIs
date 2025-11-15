import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

DataTable.use(DT);

const ProfessorView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        console.log("Buscando usuários em:", API_ROUTES.USUARIO);

        const res = await axios.get(API_ROUTES.USUARIO);

        const lista = res.data?.results || res.data || [];

        console.log("✔ Usuários carregados:", lista);

        setUsuarios(lista);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        alert("Erro ao carregar usuários. Veja o console.");
      }
    }

    carregarUsuarios();
  }, []);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resAlunos, resPeiCentral, resCursos, resPeriodos] = await Promise.all([
          axios.get(API_ROUTES.ALUNO),
          axios.get(API_ROUTES.PEI_CENTRAL),
          axios.get(API_ROUTES.CURSOS),
          axios.get(API_ROUTES.PEIPERIODOLETIVO),
        ]);

        const alunosData = resAlunos.data?.results || resAlunos.data || [];
        const peiCentralsData = resPeiCentral.data?.results || resPeiCentral.data || [];
        const cursosData = resCursos.data?.results || resCursos.data || [];
        const periodosData = resPeriodos.data?.results || resPeriodos.data || [];

        const dadosTabela = [];

        alunosData.forEach((aluno) => {
          const peiCentral = peiCentralsData.find((p) => p.aluno?.id === aluno.id);
          const peiCentralStatus = peiCentral?.status_pei || "Sem PEI";

          const periodosDoAluno = peiCentral
            ? periodosData.filter((periodo) => periodo.pei_central === peiCentral.id)
            : [];

          if (periodosDoAluno.length > 0) {
            periodosDoAluno.forEach((periodo) => {
              const componentes = periodo.componentes_curriculares || [];
              if (componentes.length === 0) {
                dadosTabela.push({
                  nome: aluno.nome,
                  componente: "—",
                  status: peiCentralStatus,
                  coordenador: "—",
                  peiCentralId: peiCentral?.id || null,
                });
              } else {
                componentes.forEach((comp) => {
                  const disciplina = comp.disciplina;
                  if (!disciplina) return;
                  const cursoRelacionado = cursosData.find((curso) =>
                    curso.disciplinas?.some((d) => d.id === disciplina.id)
                  );
                  dadosTabela.push({
                    nome: aluno.nome,
                    componente: disciplina.nome || "Disciplina sem nome",
                    status: peiCentralStatus,
                    coordenador: cursoRelacionado?.coordenador?.nome || "Sem coordenador",
                    peiCentralId: peiCentral?.id || null,
                  });
                });
              }
            });
          } else {
            dadosTabela.push({
              nome: aluno.nome,
              componente: "—",
              status: peiCentralStatus,
              coordenador: "—",
              peiCentralId: peiCentral?.id || null,
            });
          }
        });

        setTableData(dadosTabela);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        alert("Erro ao carregar dados. Verifique o console.");
      }
    }

    carregarDados();
  }, []);

  const handleVisualizarClick = (peiCentralId) => {
    if (!peiCentralId) {
      alert("Nenhum PEI Central vinculado a este aluno.");
      return;
    }

    if (!usuarioSelecionado) {
      alert("Selecione um usuário antes de visualizar.");
      return;
    }

    console.log("➡ Enviando para navigate:");
    console.log("Usuário:", usuarioSelecionado);
    console.log("PEI Central:", peiCentralId);

    navigate("/periodoLetivoPerfil", {
      state: {
        peiCentralId,
        usuarioSelecionado,
        cargoSelecionado: usuarioSelecionado.categoria,
      },
    });
  };

  useEffect(() => {
    const handleButtonClick = (e) => {
      if (e.target.classList.contains("visualizar-btn")) {
        const peiCentralId = e.target.getAttribute("data-id");
        handleVisualizarClick(peiCentralId);
      }
    };

    document.addEventListener("click", handleButtonClick);
    return () => document.removeEventListener("click", handleButtonClick);
  }, [usuarioSelecionado]);

  return (
    <div className="telaPadrao-page">
      <div className="cargo-dropdown-container">
        <label htmlFor="usuario" className="cargo-label">Selecione o usuário:</label>

        <select
          id="usuario"
          className="cargo-dropdown"
          value={usuarioSelecionado?.id || ""}
          onChange={(e) => {
            const usuario = usuarios.find(u => u.id === Number(e.target.value));
            setUsuarioSelecionado(usuario || null);
          }}
        >
          <option value="">— Escolher usuário —</option>

          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} — {u.categoria || "Sem categoria"}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={tableData}
        columns={[
          { title: "Nome do aluno", data: "nome" },
          { title: "Componente Curricular", data: "componente" },
          { title: "Status", data: "status" },
          { title: "Coordenador de curso", data: "coordenador" },
          {
            title: "Visualizar",
            data: "peiCentralId",
            render: (peiCentralId) => `
              <button class="btn btn-sm btn-primary visualizar-btn" data-id="${peiCentralId}">
                Visualizar
              </button>
            `,
          },
        ]}
        className="display table table-striped table-hover w-100"
        options={{
          pageLength: 10,
          language: {
            decimal: ",",
            thousands: ".",
            processing: "Processando...",
            search: "Pesquisar:",
            lengthMenu: "Mostrar _MENU_ PEIs",
            info: 'Mostrando de _START_ até _END_ de _TOTAL_ PEIs',
            infoEmpty: "Mostrando 0 até 0 de 0 PEIs",
            infoFiltered: "(filtrado de _MAX_ PEIs no total)",
            loadingRecords: "Carregando...",
            zeroRecords: "Nenhum PEI encontrado",
            emptyTable: "Nenhum dado disponível nesta tabela",
            paginate: {
              first: "Primeiro",
              previous: "Anterior",
              next: "Próximo",
              last: "Último",
            },
          },
        }}
      />
    </div>
  );
};

export default ProfessorView;
