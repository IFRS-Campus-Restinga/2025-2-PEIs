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
  
  // Restauramos o identificadorUsuario para ter o username do email também
  const [identificadorUsuario, setIdentificadorUsuario] = useState(""); 
  
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
      const email = usuario.email || "";
      const nomeUsuario = usuario.nome || "Usuário";
      const gruposArray = usuario.grupos || (usuario.grupo ? [usuario.grupo] : []);

      if (!tokenSalvo) {
        navigate("/");
        return;
      }

      // Lógica restaurada para pegar username do email
      const usernameDoEmail = email.split("@")[0].toLowerCase().trim();
      const nomeCompletoLower = nomeUsuario.toLowerCase().trim();
      
      // Identificador composto para comparação robusta
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

  // 2) Extrai info do coordenador (nome + normalizado)
  const getCoordenadorInfo = (pei) => {
    try {
      let coord = null;

      // Prioridade 1: Curso vinculado ao aluno (via serializer atualizado)
      if (pei.aluno?.curso_detalhes?.coordenador) {
        coord = pei.aluno.curso_detalhes.coordenador;
      } else {
        // Fallback: Tenta pegar das disciplinas
        for (const periodo of pei.periodos || []) {
          for (const comp of periodo.componentes_curriculares || []) {
            const disc = comp.disciplina || comp.disciplinas;
            if (disc?.cursos?.[0]?.coordenador) {
              coord = disc.cursos[0].coordenador;
              break;
            }
          }
          if (coord) break;
        }
      }

      if (!coord) return null;

      // Extrai dados possíveis do objeto coordenador
      const nomeExibicao = coord.nome || coord.username || coord.email?.split("@")[0] || "—";
      
      // Normaliza todas as possibilidades para comparação
      const possiveisNomes = [
          coord.nome, 
          coord.username, 
          coord.email?.split("@")[0]
      ].filter(Boolean).map(normalizar);

      return { nomeExibicao, possiveisNomes };

    } catch (e) {
      return null;
    }
  };

  // 3) Verifica se o professor logado deu parecer nesse PEI
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
            prof.email ? prof.email.split("@")[0] : null
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

  // 4) Carrega e filtra PEIs
  useEffect(() => {
    if (!token || !identificadorUsuario) return;

    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(API_ROUTES.PEI_CENTRAL, {
          headers: { Authorization: `Token ${token}` },
        });

        const peis = res.data.results || res.data || [];
        
        const meuNomeNorm = normalizar(nomeCompleto);
        const meuIdentificadorNorm = normalizar(identificadorUsuario);
        
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
            coordPossiveisNomes: coordInfo?.possiveisNomes || [],
            peiCentralId: pei.id,
            temMeuParecer: temMeuParecer(pei),
          };
        });

        const dadosFiltrados = dados.filter((item) => {
          // COORDENADOR
          if (souCoordenador) {
            // Se não achou info do coordenador no PEI, esconde por segurança
            if (!item.coordPossiveisNomes || item.coordPossiveisNomes.length === 0) return false;
            
            // Verifica se ALGUM dos nomes possíveis do coordenador do PEI bate com ALGUM dos meus identificadores
            const bateCoord = item.coordPossiveisNomes.some(nomeC => 
                nomeC.includes(meuIdentificadorNorm) || 
                meuIdentificadorNorm.includes(nomeC) ||
                nomeC.includes(meuNomeNorm) ||
                meuNomeNorm.includes(nomeC)
            );
            
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