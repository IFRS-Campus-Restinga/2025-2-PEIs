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
  const [identificadorUsuario, setIdentificadorUsuario] = useState("");

  const navigate = useNavigate();
  
  const [erro, setErro] = useState(null);

  const normalizar = (str = "") =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\._-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  // Carrega usuário
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (!usuarioSalvo) {
      navigate("/");
      return;
    }
    try {
      const usuario = JSON.parse(usuarioSalvo);
      const tokenSalvo = usuario.token;
      const email = usuario.email || "";
      const nomeUsuario = usuario.nome || "Usuário";
      const gruposArray = usuario.grupos || (usuario.grupo ? [usuario.grupo] : []);

      if (!tokenSalvo) {
        navigate("/");
        return;
      }

      const usernameDoEmail = email.split("@")[0].toLowerCase().trim();
      const nomeCompletoLower = nomeUsuario.toLowerCase().trim();
      const identificador = usernameDoEmail || nomeCompletoLower;

      setToken(tokenSalvo);
      setNomeCompleto(nomeUsuario);
      setIdentificadorUsuario(identificador);
      setMeusGrupos(gruposArray.map(g => g.toLowerCase()));
    } catch (err) {
      console.error("Erro ao ler usuário", err);
      navigate("/");
    }
  }, [navigate]);

  // Função para coordenador
  const getCoordenadorInfo = (pei) => {
    try {
      let coord = pei.cursos?.coordenador;
      if (!coord) return null;

      const nomeExibicao = coord.nome || coord.username || coord.email?.split("@")[0] || "—";
      const possiveisNomes = [coord.nome, coord.username, coord.email?.split("@")[0]]
        .filter(Boolean)
        .map(normalizar);

      return { nomeExibicao, possiveisNomes };
    } catch {
      return null;
    }
  };

  // Função para verificar se o professor já tem parecer
  const temMeuParecer = (pei) => {
    const meuIdentificadorNorm = normalizar(identificadorUsuario);
    const meuNomeNorm = normalizar(nomeCompleto);

    return (pei.periodos || []).some(periodo =>
      (periodo.componentes_curriculares || []).some(comp =>
        (comp.pareceres || []).some(parecer => {
          const prof = parecer.professor;
          if (!prof) return false;

          const candidatos = [
            prof.nome,
            prof.username,
            prof.email?.split("@")[0]
          ].filter(Boolean).map(normalizar);

          return candidatos.some(c =>
            c.includes(meuIdentificadorNorm) ||
            meuIdentificadorNorm.includes(c) ||
            c.includes(meuNomeNorm) ||
            meuNomeNorm.includes(c)
          );
        })
      )
    );
  };

  // Cria instância Axios para disciplinas
  const DBDISCIPLINAS = axios.create({
    baseURL: API_ROUTES.DISCIPLINAS,
    headers: { Authorization: `Token ${token}` },
  });

  // Carrega e filtra PEIs
  useEffect(() => {
    if (!token || !identificadorUsuario) return;

    async function load() {
      try {
        setLoading(true);

        // GET PEIs
        const resPei = await axios.get(API_ROUTES.PEI_CENTRAL, {
          headers: { Authorization: `Token ${token}` },
        });
        const peis = resPei.data.results || resPei.data || [];

        // GET todas as disciplinas
        const resDiscs = await DBDISCIPLINAS.get("/");
        const todasDisciplinas = resDiscs.data.results || resDiscs.data || [];

        const meuIdentificadorNorm = normalizar(identificadorUsuario);
        const meuNomeNorm = normalizar(nomeCompleto);
        const souCoordenador = meusGrupos.includes("coordenador");
        const souProfessor = meusGrupos.includes("professor");

        // Processa PEIs
        const dados = peis.map(pei => {
          const comps = pei.periodos?.[0]?.componentes_curriculares || [];
          const disciplinasDoPei = comps.map(c => c.disciplina).filter(Boolean);

          // Filtra apenas disciplinas do professor logado
          const disciplinasDoProf = disciplinasDoPei.filter(d => {
            const discSistema = todasDisciplinas.find(td => td.id === d.id);
            if (!discSistema?.professores) return false;

            return discSistema.professores.some(prof => {
              const candidatos = [
                prof.nome,
                prof.username,
                prof.email?.split("@")[0]
              ].filter(Boolean).map(normalizar);

              return candidatos.includes(meuIdentificadorNorm);
            });
          });

          const coordInfo = getCoordenadorInfo(pei);

          return {
            nome: pei.aluno_nome || pei.aluno?.nome || "Sem nome",
            componente: disciplinasDoProf[0]?.nome || "Diversos",
            status: pei.status_pei || "ABERTO",
            coordenador: coordInfo?.nomeExibicao || "—",
            coordPossiveisNomes: coordInfo?.possiveisNomes || [],
            peiCentralId: pei.id,
            temMeuParecer: temMeuParecer(pei),
            disciplinasGet: disciplinasDoProf
          };
        });

        // Filtra PEIs visíveis para o usuário
        const dadosFiltrados = dados.filter(item => {
          if (souCoordenador) {
            if (!item.coordPossiveisNomes?.length) return false;
            return item.coordPossiveisNomes.some(nomeC =>
              nomeC.includes(meuIdentificadorNorm) ||
              meuIdentificadorNorm.includes(nomeC) ||
              nomeC.includes(meuNomeNorm) ||
              meuNomeNorm.includes(nomeC)
            );
          }

          if (souProfessor && !souCoordenador) {
            return item.temMeuParecer || (item.disciplinasGet?.length > 0);
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
  }, [token, identificadorUsuario, nomeCompleto, meusGrupos, navigate]);

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
          <p style={{ fontSize: "1.8em", color: "#e74c3c", marginBottom: "20px" }}>
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
                  Gerenciar
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
