import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import { API_ROUTES } from "../../configs/apiRoutes";
import PeiVisualizarModal from "../../components/PeiVisualizarModal";

DataTable.use(DT);

function getUltimoPeriodo(pei) {
  if (!pei.periodos || pei.periodos.length === 0) return null;

  return [...pei.periodos].sort(
    (a, b) => new Date(b.data_criacao) - new Date(a.data_criacao)
  )[0];
}

function PeiCentral() {
  const [peiCentral, setPeiCentral] = useState([]);
  const [erro, setErro] = useState(false);
  const [selectPei, setSelectPei] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [gruposUsuario, setGruposUsuario] = useState([]);


  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    async function carregarPeis() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token de autenticação não encontrado.");

        const headers = { Authorization: `Token ${token}` };
        const res = await axios.get(API_ROUTES.PEI_CENTRAL, { headers });
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];

        setPeiCentral(data);
        setErro(false);
      } catch (e) {
        console.error("Erro ao carregar PEIs:", e);
        setErro(true);
      }
    }
    carregarPeis();
  }, []);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      try {
        const user = JSON.parse(usuarioSalvo);
        setGruposUsuario((user.grupos || []).map(g => g.toLowerCase()));
      } catch (err) {
        console.error("Erro ao ler usuário do localStorage:", err);
      }
    }
  }, []);


  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleClick = (e) => {
      const visualizarBtn = e.target.closest(".visualizar-btn");
      const listarBtn = e.target.closest(".listar-periodos-btn");
      const editarBtn = e.target.closest(".editar-btn");

      if (visualizarBtn) {
        const id = visualizarBtn.getAttribute("data-id");
        const pei = peiCentral.find((p) => Number(p.id) === Number(id));

        if (pei) {
          setSelectPei(pei);
          setModalOpen(true);
        }
        return;
      }

      if (listarBtn) {
        const id = listarBtn.getAttribute("data-id");
        navigate("/listar_periodos/" + id);
        return;
      }

      if (editarBtn) {
        const id = editarBtn.getAttribute("data-id");
        navigate("/editar_peicentral/" + id);
      }
    };

    wrapper.addEventListener("click", handleClick);
    return () => wrapper.removeEventListener("click", handleClick);
  }, [peiCentral]);

  const gerarPDF = async () => {
    if (!selectPei) return;

    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const conteudo = document.getElementById("conteudo-pei-pdf");
    if (!conteudo) return;

    const canvas = await html2canvas(conteudo, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const largura = pdf.internal.pageSize.getWidth() - 20;
    const altura = (canvas.height * largura) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, largura, altura);
    pdf.save(`PEI_${selectPei.aluno?.nome || "aluno"}.pdf`);
  };

  const dadosTabela = useMemo(() => {
    return peiCentral.map((pei) => {
      const ultimo = getUltimoPeriodo(pei);
      return {
        nome: pei.aluno?.nome || "Sem aluno vinculado",
        curso: pei.cursos?.nome || "Sem curso",
        status: pei.status_pei || "Sem status",
        periodo: ultimo?.periodo_principal || "Sem período",
        id: pei.id,
      };
    });
  }, [peiCentral]);

  const podeCriarEditarPei = gruposUsuario.includes("admin") || gruposUsuario.includes("napne");
  console.log("GRUPOS DO USUÁRIO:", gruposUsuario);
  console.log("PODE EDITAR?:", podeCriarEditarPei);
  return (
    <div className="telaPadrao-page">
      <h1 style={{ textAlign: "center" }}>PEI CENTRAL</h1>

      {podeCriarEditarPei && (
        <button
          className="submit-btn"
          style={{ fontSize: "21px" }}
          onClick={() => navigate("/create_peicentral")}
        >
        Criar novo PEI
        </button>
      )}  

      <br />
      <br />

      {erro ? (
        <p style={{ color: "red" }}>Erro ao carregar PEIs.</p>
      ) : (
        <div ref={wrapperRef}>
          <DataTable
            key={podeCriarEditarPei ? "admin" : "user"}
            data={dadosTabela}
            columns={[
              { title: "Nome do aluno", data: "nome" },
              { title: "Curso", data: "curso" },
              { title: "Status", data: "status" },
              { title: "Período Atual", data: "periodo" },
              {
                title: "Visualizar todos os Períodos",
                data: "id",
                render: (id) => `
                  <button 
                    class="btn btn btn-sm btn-primary listar-periodos-btn" 
                    data-id="${id}"
                  >
                    Listar
                  </button>
                `,
              },
              {
                title: "Visualizar",
                data: "id",
                render: (id) => `
                  <button class="btn btn-sm btn-primary visualizar-btn" data-id="${id}">
                    Visualizar
                  </button>
                `,
              },
              {
                title: "Editar",
                data: "id",
                render: (id) =>
                  podeCriarEditarPei 
                    ? `
                      <button class="btn btn-sm btn-primary editar-btn" data-id="${id}">
                        Editar
                      </button>
                    `
                    : "",
              }
            ]}
            className="display table table-striped table-hover w-100"
            options={{
              pageLength: 10,
              language: {
                decimal: ",",
                thousands: ".",
                searchPlaceholder: "Pesquisar",
                lengthMenu: "Mostrar _MENU_ PEIs",
                zeroRecords: "Nenhum PEI encontrado",
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
      )}

      <BotaoVoltar />

      {/* MODAL FINAL — usando componente externo */}
      {modalOpen &&(
        <PeiVisualizarModal
          selectPei={selectPei}
          onClose={() => setModalOpen(false)}
          gerarPDF={gerarPDF}
        />
      )}
    </div>
  );
}


export default PeiCentral;
