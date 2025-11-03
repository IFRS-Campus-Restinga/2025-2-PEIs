import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import "../../cssGlobal.css";

DataTable.use(DT);

const ProfessorView = ({ usuario }) => {
  const API_ALUNO = import.meta.env.VITE_ALUNO_URL;
  const API_PEICENTRAL = import.meta.env.VITE_PEI_CENTRAL_URL;
  const API_CURSO = import.meta.env.VITE_CURSOS_URL;
  const API_PEIPERIODO = import.meta.env.VITE_PEIPERIODOLETIVO_URL;

  const [cargoSelecionado, setCargoSelecionado] = useState("");
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resAlunos, resPeiCentral, resCursos, resPeriodos] = await Promise.all([
          axios.get(API_ALUNO),
          axios.get(API_PEICENTRAL),
          axios.get(API_CURSO),
          axios.get(API_PEIPERIODO),
        ]);

        const alunosData = resAlunos.data.results || [];
        const peiCentralsData = Array.isArray(resPeiCentral.data)
          ? resPeiCentral.data
          : resPeiCentral.data?.results || [];
        const cursosData = Array.isArray(resCursos.data)
          ? resCursos.data
          : resCursos.data?.results || [];
        const periodosData = Array.isArray(resPeriodos.data)
          ? resPeriodos.data
          : resPeriodos.data?.results || [];

        const dadosTabela = [];

        alunosData.forEach((aluno) => {
          const peiCentral = peiCentralsData.find((p) => p.aluno?.id === aluno.id);
          const peiCentralStatus = peiCentral?.status_pei || "—";

          const periodos = peiCentral
            ? periodosData.filter((periodo) => periodo.pei_central === peiCentral.id)
            : [];

          if (periodos.length > 0) {
            periodos.forEach((periodo) => {
              (periodo.componentes_curriculares || []).forEach((comp) => {
                const disciplina = comp.disciplina;
                if (!disciplina) return;

                const cursoRelacionado = cursosData.find((curso) =>
                  curso.disciplinas.some((d) => d.id === disciplina.id)
                );

                dadosTabela.push({
                  nome: aluno.nome,
                  componente: disciplina.nome,
                  status: peiCentralStatus,
                  coordenador: cursoRelacionado?.coordenador?.nome || "—",
                  peiCentralId: peiCentral?.id || null,
                });
              });
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
      }
    }

    carregarDados();
  }, []);

  const handleVisualizarClick = (peiCentralId) => {
    if (!peiCentralId) {
      alert("Nenhum PEI Central vinculado a este aluno.");
      return;
    }
    //mostrar isso pro pessoal pq é interessante
    navigate("/periodoLetivoPerfil", {
      state: {
        peiCentralId,
        cargoSelecionado,
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
  }, [cargoSelecionado]);

  return (
    <div className="telaPadrao-page">
      <div className="cargo-dropdown-container">
        <label htmlFor="cargo" className="cargo-label">Selecione o cargo:</label>
        <select
          id="cargo"
          className="cargo-dropdown"
          value={cargoSelecionado}
          onChange={(e) => setCargoSelecionado(e.target.value)}
        >
          <option value="">— Escolher —</option>
          <option value="Professor">Professor</option>
          <option value="NAPNE">NAPNE</option>
          <option value="Coordenador de Curso">Coordenador de Curso</option>
          <option value="Pedagogo">Pedagogo</option>
          <option value="Administrador">Administrador</option>
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
            info: '<span class="custom-info-text">Mostrando de _START_ até _END_ de _TOTAL_ PEIs',
            infoEmpty: "Mostrando 0 até 0 de 0 PEIs",
            infoFiltered: "(filtrado de _MAX_ PEIs no total)",
            infoPostFix: "",
            loadingRecords: "Carregando...",
            zeroRecords: "Nenhum PEI encontrado",
            emptyTable: "Nenhum dado disponível nesta tabela",
            paginate: {
              first: "Primeiro",
              previous: "Anterior",
              next: "Próximo",
              last: "Último",
            },
            aria: {
              sortAscending: ": ativar para ordenar a coluna em ordem crescente",
              sortDescending: ": ativar para ordenar a coluna em ordem decrescente",
            },
          },
        }}
      />
    </div>
  );
};

export default ProfessorView;