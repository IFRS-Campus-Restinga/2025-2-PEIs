import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import DT from "datatables.net-dt";
import DataTable from "datatables.net-react";
import { API_ROUTES } from "../../configs/apiRoutes";
import logo from '../../assets/logo.png';
import logo_nome from '../../assets/logo-sem-nome.png';
import { useMemo } from "react";


DataTable.use(DT);

// Função para pegar o período mais recente
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
  const navigate = useNavigate();

  const wrapperRef = useRef(null);

  useEffect(() => {
    async function carregarPeis() {
      try {
        const res = await axios.get(API_ROUTES.PEI_CENTRAL);
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

  // Listener para botões "Visualizar" e "Listar Períodos"
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleClick = (e) => {
      const visualizarBtn = e.target.closest(".visualizar-btn");
      const listarBtn = e.target.closest(".listar-periodos-btn");
      const editarBtn = e.target.closest(".editar-btn");

      // --- VISUALIZAR ---
      if (visualizarBtn) {
        const id = visualizarBtn.getAttribute("data-id");
        const pei = peiCentral.find((p) => Number(p.id) === Number(id));
        if (pei) {
          setSelectPei(pei);
          setModalOpen(true);
        }
        return;
      }

      // --- LISTAR PERÍODOS ---
      if (listarBtn) {
        const id = listarBtn.getAttribute("data-id");
        navigate("/listar_periodos/" + id);
        return;
      }
      //--- EDITAR ---
      if (editarBtn){
        const id = editarBtn.getAttribute("data-id");
        navigate("/editar_peicentral/"+ id)
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

  
  const dadosTabela = useMemo(() =>{
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

  return (
    <div className="telaPadrao-page">
      <h1 style={{ textAlign: "center" }}>PEI CENTRAL</h1>

      <button
        type="btn-verde:hover"
        className="submit-btn"
        style={{ fontSize: "21px" }}
        onClick={() => navigate("/create_peicentral")}
      >
        Criar novo PEI
      </button>

      <br />
      <br />

      {erro ? (
        <p style={{ color: "red" }}>Erro ao carregar PEIs.</p>
      ) : (
        <div ref={wrapperRef}>
          <DataTable
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
                render: (id) => `
                  <button class="btn btn-sm btn-primary editar-btn" data-id="${id}">
                    Editar
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
                search: "Pesquisar:",
                lengthMenu: "Mostrar MENU PEIs",
                info: "Mostrando de START até END de TOTAL PEIs",
                zeroRecords: "Nenhum PEI encontrado",
                emptyTable: "Sem dados",
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

      {/* ---- MODAL COMPLETO DO VISUALIZAR --- */}
      {modalOpen && selectPei && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              width: "80%",
              height: "80%",
              padding: "20px",
              borderRadius: "8px",
              overflowY: "auto",
              position: "relative",
            }}
          >
            
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              X
            </button>

            <br />
            <header className="header">
              <div className="header-letf">
                <img src={logo_nome} alt="Logo IFRS" className="header-logo" />
              </div>
              <div style={{ marginRight: 'auto' }} className="header-text">
                <strong>INSTITUTO FEDERAL</strong>
                <span>Rio Grande do Sul</span>
                <span>Campus Restinga</span>
              </div>
              <div className="header-center">
                <h1>Visualização do PEI</h1>
                <span>Plano Educacional Individualizado</span>
              </div>
            </header>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                marginTop: "10px",
                marginBottom: "20px"
              }}
            >
              <div
                onClick={gerarPDF}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  transition: "0.2s ease",
                  width: "fit-content",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <img
                  src="https://static.vecteezy.com/system/resources/previews/023/234/824/non_2x/pdf-icon-red-and-white-color-for-free-png.png"
                  style={{ width: "50px", height: "50px" }}
                  alt="PDF icon"
                />

                <span style={{ fontSize: "20px", fontWeight: "600" }}>
                  Download da Documentação
                </span>
              </div>
            </div>


            <div
              id="conteudo-pei-pdf"
              style={{
                marginLeft: '100px',
                marginRight: '100px',
                padding: "50px",
                fontSize: "16px",
                textAlign: 'justify'
              }}
            >

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img src={logo} height={150} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p><b>Aluno:</b> {selectPei.aluno?.nome}</p>
                  <p><b>Matrícula:</b> {selectPei.aluno?.matricula}</p>
                  <p><b>Curso:</b> {selectPei.cursos?.nome}</p>
                </div>
                <div>
                  <p><b>Status:</b> {selectPei.status_pei}</p>
                </div>
              </div>
              <br />
              <br />
              <p><b>Histórico:</b><br /> &emsp;&emsp;{selectPei.historico_do_aluno}</p>
              <p><b>Necessidades:</b><br /> &emsp;&emsp;{selectPei.necessidades_educacionais_especificas}</p>
              <p><b>Habilidades:</b><br /> &emsp;&emsp;{selectPei.habilidades}</p>
              <p><b>Dificuldades:</b><br /> &emsp;&emsp;{selectPei.dificuldades_apresentadas}</p>
              <p><b>Adaptações:</b><br /> &emsp;&emsp;{selectPei.adaptacoes}</p>

              <br /><br />

              <div style={{ textAlign: 'center' }}>
                <p><b>Assinatura Docente:</b><br />_______________</p>
                <p><b>Assinatura Coordenador de Curso:</b><br />_______________</p>
                <p><b>Assinatura NAPNE/NAAf (Reponsável):</b><br />_______________</p>
                <p><b>Assinatura Setor Pedagógico (Reponsável):</b><br />_______________</p>
                <p><b>Assinatura Assistência Estudantil (Reponsável):</b><br />_______________</p>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default PeiCentral;