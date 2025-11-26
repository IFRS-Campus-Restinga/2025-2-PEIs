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

  const [identificadorUsuario, setIdentificadorUsuario] = useState("");

  // 1) PEGA USUÁRIO DO localStorage — NOME COMPLETO + USERNAME + GRUPOS
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
      const nomeDoUsuario = usuario.nome || "Usuário";
      const gruposArray = usuario.grupos || (usuario.grupo ? [usuario.grupo] : []);

      if (!tokenSalvo) {
        navigate("/");
        return;
      }

      const usernameDoEmail = email.split("@")[0].toLowerCase().trim();
      const nomeCompletoLower = nomeDoUsuario.toLowerCase().trim();

      // AQUI É A MÁGICA: guardamos os DOIS identificadores
      const identificador = usernameDoEmail || nomeCompletoLower;

      console.log("USUÁRIO LOGADO:", { 
        nome: nomeDoUsuario, 
        username: usernameDoEmail,
        identificadorUsado: identificador 
      });

      setToken(tokenSalvo);
      setNomeCompleto(nomeDoUsuario);
      setIdentificadorUsuario(identificador);  // ← usado no filtro
      setMeusGrupos(gruposArray.map(g => g.toLowerCase()));

    } catch (err) {
      console.error("Erro ao ler usuario", err);
      navigate("/");
    }
  }, [navigate]);

  // 2) PEGA COORDENADOR DO PEI
  const extrairCoordenador = (pei) => {
    try {
      for (const periodo of pei.periodos || []) {
        for (const comp of periodo.componentes_curriculares || []) {
          const disc = comp.disciplina || comp.disciplinas;
          if (!disc?.cursos?.[0]?.coordenador) continue;
          const coord = disc.cursos[0].coordenador;
          return (coord.username || coord.email?.split("@")[0] || "").toLowerCase().trim();
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // 3) VERIFICA SE O PROFESSOR DEU PARECER
  const temMeuParecer = (pei) => {
    try {
      const identificadorLower = identificadorUsuario.toLowerCase().trim();

      for (const periodo of pei.periodos || []) {
        for (const comp of periodo.componentes_curriculares || []) {
          for (const parecer of comp.pareceres || []) {
            const prof = parecer.professor;
            if (!prof) continue;

            const nomeProf = (prof.nome || "").toLowerCase().trim();
            const usernameProf = (prof.username || "").toLowerCase().trim();
            const emailUser = prof.email ? prof.email.split("@")[0].toLowerCase().trim() : "";

            // Agora compara com QUALQUER coisa que você tenha
            if (
              nomeProf.includes(identificadorLower) ||
              usernameProf === identificadorLower ||
              emailUser === identificadorLower ||
              identificadorLower.includes(nomeProf) // caso o nome completo esteja no identificador
            ) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (err) {
      console.error("Erro em temMeuParecer:", err);
      return false;
    }
  };

  // 4) CARREGA E FILTRA OS PEIs
  useEffect(() => {
    if (!token || !identificadorUsuario) return;

    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(API_ROUTES.PEI_CENTRAL, {
          headers: { Authorization: `Token ${token}` },
        });

        const peis = res.data.results || res.data || [];

        const dados = peis
          .map((pei) => {
            const coordUsername = extrairCoordenador(pei);
            const comp = pei.periodos?.[0]?.componentes_curriculares?.[0];
            const disciplina = comp?.disciplina || comp?.disciplinas || {};

            return {
              nome: pei.aluno_nome || pei.aluno?.nome || "Sem nome",
              componente: disciplina.nome || "Diversos",
              status: pei.status_pei || "ABERTO",
              coordenador: coordUsername ? coordUsername.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') 
              : "—",
              peiCentralId: pei.id,
              coordenadorRaw: coordUsername,
              temMeuParecer: temMeuParecer(pei),
            };
          })
          .filter((item => {
            const souCoordenador = meusGrupos.includes("coordenador");
            const souProfessor = meusGrupos.includes("professor");

            if (souCoordenador && item.coordenadorRaw !== identificadorUsuario) return false;
            if (souProfessor && !souCoordenador && !item.temMeuParecer) return false;

            return true;
          }));

        console.log(`Mostrando ${dados.length} PEIs para ${nomeCompleto} (${meusGrupos.join(", ")})`);
        setTableData(dados);
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
  }, [token, identificadorUsuario, meusGrupos, navigate]);

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

  // RENDER
  return (
    <div className="telaPadrao-page">
        <p style={{ margin: "8px 0 0", color: "#555" }}>
          {meusGrupos.includes("coordenador")}
          {meusGrupos.includes("professor") && !meusGrupos.includes("coordenador")}
          {!meusGrupos.includes("coordenador") && !meusGrupos.includes("professor")}
        </p>
      

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
            {meusGrupos.includes("coordenador") && `${nomeCompleto}, você ainda não tem alunos nos cursos que coordena.`}
            {meusGrupos.includes("professor") && !meusGrupos.includes("coordenador") && `${nomeCompleto}, você ainda não cadastrou parecer em nenhum aluno.`}
            {!meusGrupos.includes("coordenador") && !meusGrupos.includes("professor") && "Não há PEIs registrados no sistema no momento."}
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
                <button class="btn btn-sm btn-primary visualizar-btn" data-id="${id}">
                  Visualizar
                </button>
              `,
            },
          ]}
          className="display table table-striped table-hover w-100"
          options={{
            destroy: true,
            pageLength: 15,
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