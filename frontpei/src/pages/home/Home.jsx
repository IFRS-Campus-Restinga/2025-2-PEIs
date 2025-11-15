import { useState, useEffect, useMemo } from "react";
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
  const [allTableData, setAllTableData] = useState([]); 
  const [dataTableKey, setDataTableKey] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ------------------------------------
  // 🔹 CARREGAR USUÁRIOS
  // ------------------------------------
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        console.log("🔄 Buscando usuários em:", API_ROUTES.USUARIO);

        const res = await axios.get(API_ROUTES.USUARIO);

        const lista = res.data?.results || res.data || [];

        console.log("✔ Usuários carregados:", lista);

        setUsuarios(lista);
      } catch (err) {
        console.error("❌ Erro ao carregar usuários:", err);
        alert("Erro ao carregar usuários. Veja o console.");
      }
    }

    carregarUsuarios();
  }, []);

  // ------------------------------------
  // 🔹 CARREGAR DADOS DA TABELA (TODOS)
  // ------------------------------------
 useEffect(() => {
  async function carregarDados() {
    setIsLoading(true);
    try {
      const [resAlunos, resPeiCentral, resPeriodos, resCursos] = await Promise.all([
        axios.get(API_ROUTES.ALUNO),
        axios.get(API_ROUTES.PEI_CENTRAL),
        axios.get(API_ROUTES.PEIPERIODOLETIVO),
        axios.get(API_ROUTES.CURSOS),
      ]);

      const alunosData = resAlunos.data?.results || resAlunos.data || [];
      const peiCentralsData = resPeiCentral.data?.results || resPeiCentral.data || [];
      const periodosData = resPeriodos.data?.results || resPeriodos.data || [];
      const cursosData = resCursos.data?.results || resCursos.data || [];

      const alunosAgrupados = {};

      alunosData.forEach((aluno) => {
        const peiCentral = peiCentralsData.find((p) => p.aluno?.id === aluno.id);
        if (!peiCentral) return;

        const status = peiCentral.status_pei || "Sem PEI";
        const peiCentralId = peiCentral.id;
        const periodosDoAluno = periodosData.filter((p) => p.pei_central === peiCentralId);

        if (!alunosAgrupados[aluno.id]) {
          alunosAgrupados[aluno.id] = {
            alunoId: aluno.id,
            nome: aluno.nome,
            status,
            peiCentralId,
            componentes: [],
            professores: new Set(),
            coordenadores: new Set(), // COLETAR COORDENADORES
          };
        }

        periodosDoAluno.forEach((periodo) => {
          const componentes = periodo.componentes_curriculares || [];
          componentes.forEach((comp) => {
            const disciplina = comp.disciplina;
            if (!disciplina) return;

            // BUSCA CURSO QUE TEM ESSA DISCIPLINA
            const curso = cursosData.find((c) =>
              c.disciplinas?.some((d) => d.id === disciplina.id)
            );
            const coordenador = curso?.coordenador?.nome;

            if (coordenador) {
              alunosAgrupados[aluno.id].coordenadores.add(coordenador);
            }

            const professores = comp.pareceres
              ? comp.pareceres.map((p) => p.professor).filter(Boolean)
              : [];

            alunosAgrupados[aluno.id].componentes.push({
              nome: disciplina.nome,
              professores,
            });

            professores.forEach((prof) => {
              if (prof?.id) alunosAgrupados[aluno.id].professores.add(prof);
            });
          });
        });
      });

      const dadosTabela = Object.values(alunosAgrupados).map((item) => ({
        alunoId: item.alunoId,
        nome: item.nome,
        componentes: item.componentes.map((c) => c.nome),
        componentesComProfessores: item.componentes,
        status: item.status,
        peiCentralId: item.peiCentralId,
        coordenador: Array.from(item.coordenadores).join(", ") || "Sem coordenador",
        professores: Array.from(item.professores),
      }));

      setAllTableData(dadosTabela);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  }

  carregarDados();
}, []);

  // ------------------------------------
  // 🔹 DADOS DA TABELA FILTRADOS (useMemo)
  // ------------------------------------
  const filteredTableData = useMemo(() => {
  if (!usuarioSelecionado) return [];

  const categoria = usuarioSelecionado.categoria;
  const idUsuario = usuarioSelecionado.id;

  return allTableData.filter((item) => {
    if (categoria === "ADMIN") return true;

    const isProfessor = item.componentesComProfessores.some((comp) =>
      comp.professores.some((prof) => prof.id === idUsuario)
    );
    const isCoordenador = categoria === "COORDENADOR" && item.coordenador.includes(usuarioSelecionado.nome);

    if (categoria === "PROFESSOR") return isProfessor;
    if (categoria === "COORDENADOR") return isProfessor || isCoordenador;
    if (categoria === "PEDAGOGO") return isProfessor || isCoordenador;

    return false;
  });
}, [allTableData, usuarioSelecionado]);

  // ------------------------------------
  // 🔹 EFEITO PARA FORÇAR RE-RENDER DO DATATABLE
  // ------------------------------------
  useEffect(() => {
    // Incrementa a chave sempre que o usuário selecionado muda
    // Isso força o DataTable a ser destruído e recriado com os novos dados filtrados
    setDataTableKey((prevKey) => prevKey + 1);
  }, [usuarioSelecionado]);

  // ------------------------------------
  // 🔹 FUNÇÃO DO BOTÃO VISUALIZAR
  // ------------------------------------
  const handleVisualizarClick = (peiCentralId) => {
    if (!peiCentralId) {
      alert("Nenhum PEI Central vinculado a este aluno.");
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
        cargoSelecionado: usuarioSelecionado.categoria,
      },
    });
  };

  // ------------------------------------
  // 🔹 LISTENER DOS BOTÕES DA TABELA
  // ------------------------------------
  useEffect(() => {
    const handleButtonClick = (e) => {
      if (e.target.classList.contains("visualizar-btn")) {
        const peiCentralId = e.target.getAttribute("data-id");
        handleVisualizarClick(peiCentralId);
      }
    };

    
    document.addEventListener("click", handleButtonClick);
    return () => document.removeEventListener("click", handleButtonClick);
  }, [usuarioSelecionado, dataTableKey]);

  // ------------------------------------
  // 🔹 RENDERIZAÇÃO
  // ------------------------------------
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

      {isLoading ? (
        <p>Carregando dados...</p>
      ) : (
        <DataTable
          key={dataTableKey}
          data={filteredTableData}
          columns={[
            { title: "Nome do aluno", data: "nome" },

            {
              title: "Componentes Curriculares",
              data: "componentes", // ← array com os nomes
              render: (componentes) => {
                if (!componentes || componentes.length === 0) {
                  return "—";
                }
                return componentes
                  .map((c) => `<div class="componentes-lista">• ${c}</div>`)
                  .join("");
              },
            },

            { title: "Status", data: "status" },
            { title: "Coordenador(es)", data: "coordenador" },

            {
              title: "Visualizar",
              data: "peiCentralId",
              render: (peiCentralId) => `
                <button class="btn btn-sm btn-primary visualizar-btn" data-id="${peiCentralId}">
                  Visualizar PEI
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
      )}
    </div>
  );
};

export default ProfessorView;
