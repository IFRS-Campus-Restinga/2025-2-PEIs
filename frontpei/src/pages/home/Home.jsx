import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

DataTable.use(DT);

const HomeView = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nomeCompleto, setNomeCompleto] = useState("Usuário");
  const [meusGrupos, setMeusGrupos] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  // Normaliza texto: remove acentos, pontos, underlines, múltiplos espaços
  const normalizar = (str = "") =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\._-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  // 1) Carrega usuário do localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (!usuarioSalvo) {
      navigate("/");
      return;
    }
    try {
      const usuario = JSON.parse(usuarioSalvo);
      const tokenSalvo = usuario.token;
      const nomeUsuario = usuario.nome || "Usuário";
      const gruposArray = usuario.grupos || (usuario.grupo ? [usuario.grupo] : []);

      if (!tokenSalvo) {
        navigate("/");
        return;
      }

      setToken(tokenSalvo);
      setNomeCompleto(nomeUsuario);
      setMeusGrupos(gruposArray.map(g => g.toLowerCase()));
    } catch (err) {
      console.error("Erro ao ler usuário", err);
      navigate("/");
    }
  }, [navigate]);

  // 2) Extrai info do coordenador (nome + normalizado)
  const getCoordenadorInfo = (pei) => {
    try {
      for (const periodo of pei.periodos || []) {
        for (const comp of periodo.componentes_curriculares || []) {
          const disc = comp.disciplina || comp.disciplinas;
          const coord = disc?.cursos?.[0]?.coordenador;
          if (!coord) continue;

          const candidatos = [coord.nome, coord.username, coord.email?.split("@")[0]].filter(Boolean);
          if (candidatos.length === 0) return null;

          const nomeExibicao = coord.nome || coord.username || coord.email?.split("@")[0] || "—";
          const nomeNormalizado = normalizar(candidatos[0]);

          return { nomeExibicao, nomeNormalizado };
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // 3) Verifica se o professor logado deu parecer nesse PEI
  const temMeuParecer = (pei) => {
    const meuNomeNorm = normalizar(nomeCompleto);

    return (pei.periodos || []).some(periodo =>
      (periodo.componentes_curriculares || []).some(comp =>
        (comp.pareceres || []).some(parecer => {
          const prof = parecer.professor;
          if (!prof) return false;

          const candidatos = [
            prof.nome,
            prof.username,
            prof.email ? prof.email.split("@")[0] : null
          ].filter(Boolean);

          return candidatos.some(c => {
            const nomeProfNorm = normalizar(c);
            return (
              nomeProfNorm === meuNomeNorm ||
              nomeProfNorm.includes(meuNomeNorm) ||
              meuNomeNorm.includes(nomeProfNorm)
            );
          });
        })
      )
    );
  };

  // 4) Carrega e filtra PEIs
  useEffect(() => {
    if (!token || nomeCompleto === "Usuário") return;

    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(API_ROUTES.PEI_CENTRAL, {
          headers: { Authorization: `Token ${token}` },
        });

        const peis = res.data.results || res.data || [];
        const meuNomeNorm = normalizar(nomeCompleto);
        const souCoordenador = meusGrupos.includes("coordenador");
        const souProfessor = meusGrupos.includes("professor");

        const dados = peis.map((pei) => {
          const comp = pei.periodos?.[0]?.componentes_curriculares?.[0];
          const disciplina = comp?.disciplina || comp?.disciplinas || {};
          const coordInfo = getCoordenadorInfo(pei);

          return {
            nome: pei.aluno_nome || pei.aluno?.nome || "Sem nome",
            componente: disciplina.nome || "Diversos",
            status: pei.status_pei || "ABERTO",
            coordenador: coordInfo?.nomeExibicao || "—",
            coordenadorNorm: coordInfo?.nomeNormalizado || null,
            peiCentralId: pei.id,
            temMeuParecer: temMeuParecer(pei),
          };
        });

        const dadosFiltrados = dados.filter((item) => {
          // COORDENADOR
          if (souCoordenador) {
            if (!item.coordenadorNorm) return false;
            const bateCoord =
              item.coordenadorNorm === meuNomeNorm ||
              item.coordenadorNorm.includes(meuNomeNorm) ||
              meuNomeNorm.includes(item.coordenadorNorm);
            if (!bateCoord) return false;
          }

          // PROFESSOR (só vê onde já deu parecer)
          if (souProfessor && !souCoordenador) {
            if (!item.temMeuParecer) return false;
          }

          return true;
        });

        setTableData(dadosFiltrados);
      } catch (err) {
        console.error("Erro ao carregar PEIs:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, nomeCompleto, meusGrupos, navigate]);

  // Botão Visualizar
  useEffect(() => {
    const handler = (e) => {
      if (e.target.classList.contains("visualizar-btn")) {
        const id = e.target.getAttribute("data-id");
        navigate("/periodoLetivoPerfil", { state: { peiCentralId: id } });
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [navigate]);

  return (
    <div className="telaPadrao-page">
      {loading ? (
        <p style={{ textAlign: "center", padding: "100px", fontSize: "1.8em", fontWeight: "bold" }}>
          Carregando seus PEIs...
        </p>
      ) : tableData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px" }}>
          <p style={{ fontSize: "1.8em", color: "#e74c3c" }}>
            Nenhum PEI encontrado.
          </p>
          <p style={{ fontSize: "1.2em", color: "#7f8c8d" }}>
            {meusGrupos.includes("coordenador") && `${nomeCompleto}, você ainda não tem alunos nos seus cursos.`}
            {meusGrupos.includes("professor") && !meusGrupos.includes("coordenador") && `${nomeCompleto}, você ainda não cadastrou parecer em nenhum aluno.`}
            {!meusGrupos.some(g => ["coordenador", "professor"].includes(g)) && "Não há PEIs registrados no sistema no momento."}
          </p>
        </div>
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { title: "Aluno", data: "nome" },
            { title: "Componente", data: "componente" },
            { title: "Status", data: "status" },
            { title: "Coordenador", data: "coordenador" },
            {
              title: "Ação",
              data: "peiCentralId",
              orderable: false,
              render: (id) => `
                <button class="btn-verde visualizar-btn" data-id="${id}" style="padding: 8px 16px; font-size: 0.9em;">
                  Visualizar
                </button>
              `,
            },
          ]}
          className="display table table-striped table-hover w-100"
          options={{
            destroy: true,
            pageLength: 10,
            lengthMenu: [10, 15, 25, 50, 100],
            language: {
              search: "Pesquisar aluno:",
              lengthMenu: "_MENU_ PEIs por página",
              info: "Mostrando _START_ a _END_ de _TOTAL_ alunos",
              infoEmpty: "Nenhum aluno encontrado",
              infoFiltered: "(filtrado de _MAX_ registros)",
              paginate: {
                first: "Primeiro",
                last: "Último",
                next: "Próximo",
                previous: "Anterior"
              },
              emptyTable: "Nenhum PEI disponível",
              zeroRecords: "Nenhum aluno encontrado com este filtro"
            }
          }}
        />
      )}
    </div>
  );
};

export default HomeView;