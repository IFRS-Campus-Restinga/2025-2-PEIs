import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import BotaoEditar from "../../components/customButtons/botaoEditar";

import { API_ROUTES } from "../../configs/apiRoutes";

function PeiCentral() {
  const [pei_central, setPeiCentral] = useState([]);
  const [erro, setErro] = useState(false);
  const [selectPei, setSelectPei] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const DB = axios.create({ baseURL: API_ROUTES.PEI_CENTRAL });

  useEffect(() => {
    async function carregarPeiCentral() {
      try {
        const resposta = await DB.get("/");
        console.log("Dados recebidos:", resposta.data);

        if (Array.isArray(resposta.data)) {
          setPeiCentral(resposta.data);
        } else if (Array.isArray(resposta.data.results)) {
          setPeiCentral(resposta.data.results);
        } else {
          console.error("Formato inesperado da API:", resposta.data);
          setPeiCentral([]);
        }
        setErro(false);
      } catch (err) {
        console.error("Erro ao buscar períodos:", err);
        setErro(true);
      }
    }

    carregarPeiCentral();
  }, []);

  // === Função para gerar PDF ===
  /*const gerarPDF = async () => {
    if (!selectPei) return;

    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const elemento = document.getElementById("conteudo-pei-pdf");
    if (!elemento) return;

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`PEI_${selectPei.aluno?.nome || "aluno"}.pdf`);
  }; */

  return (
    <div className="container-padrao">
      <h1 style={{ textAlign: "center" }}>PEI CENTRAL</h1>
      <button
        type="button"
        className="submit-btn"
        style={{ fontSize: "21px" }}
        onClick={() => navigate("/create_peicentral")}
      >
        Criar novo PEI
      </button>
      <br />
      <br />

      <div>
        {erro ? (
          <p style={{ color: "red" }}>Não foi possível carregar os períodos.</p>
        ) : (
          pei_central.map((pei) => (
            <div
              key={pei.id}
              style={{
                marginBottom: "20px",
                padding: "10px",
                border: "1px solid #ccc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <BotaoEditar id={pei.id} rotaEdicao="/editar_peicentral/" />

                <button
                  type="button"
                  onClick={() => {
                    setSelectPei(pei);
                    setModalOpen(true);
                  }}
                >
                  Visualizar
                </button>
              </div>

              <br />
              <div
                className="periodo-card"
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                  margin: "10px",
                  background: "#d3d3d3ff",
                }}
              >
                <br />
                <b>Aluno:</b> {pei.aluno.nome} - <b>Matrícula:</b>{" "}
                {pei.aluno.matricula}
                <br /> <b>E-mail:</b> {pei.aluno.email}
                <br />
                <br />
              </div>

              <div style={{ textAlign: "justify" }}>
                <b>Status:</b> <p>{pei.status_pei}</p>
                <b>Histórico do Aluno:</b>
                <p>{pei.historico_do_aluno}</p>
                <b>Necessidades:</b>
                <p>{pei.necessidades_educacionais_especificas}</p>
                <b>Habilidades:</b> <p>{pei.habilidades}</p>
                <b>Dificuldades Apresentadas:</b>{" "}
                <p>{pei.dificuldades_apresentadas}</p>
                <b>Adaptações:</b> <p>{pei.adaptacoes}</p>
              </div>

              <br />

              {pei.periodos && pei.periodos.length > 0 ? (
                <div>
                  <b>Períodos:</b>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      marginTop: "8px",
                    }}
                  >
                    {pei.periodos.map((periodo) => (
                      <div className="periodo-card" key={periodo.id}>
                        <p>
                          <b>Data de Criação:</b> {periodo.data_criacao}{" "}
                          <b>Data de Término:</b> {periodo.data_termino}
                        </p>
                        <p>
                          <b>Período Letivo:</b> {periodo.periodo_principal}
                          <div style={{ display: "flex", gap: "20px" }}>
                            <button
                              type="button"
                              className="btn-verde"
                              onClick={() =>
                                navigate("/listar_periodos/" + periodo.id)
                              }
                            >
                              Visualizar Período
                            </button>
                          </div>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>
                  <i>Nenhum período vinculado</i>
                </p>
              )}
              <hr />
            </div>
          ))
        )}

        <BotaoVoltar/>
      </div>

      {/* === MODAL === */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "red",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => setModalOpen(false)}
            >
              X
            </button>

            <h2>Visualização do PEI</h2>

            {/* Botão PDF */}
            <button
              style={{
                background: "#2b6cb0",
                color: "white",
                padding: "10px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "15px",
              }}
              onClick={gerarPDF}
            >
              Gerar PDF
            </button>

            {/* Conteúdo capturado */}
            <div id="conteudo-pei-pdf" style={{ padding: "10px", fontSize: "16px" }}>
              {selectPei && (
                <div>
                  <p><b>Aluno:</b> {selectPei.aluno?.nome}</p>
                  <p><b>Matrícula:</b> {selectPei.aluno?.matricula}</p>
                  <p><b>E-mail:</b> {selectPei.aluno?.email}</p>
                  <p><b>Status:</b> {selectPei.status_pei}</p>
                  <p><b>Histórico do Aluno:</b> {selectPei.historico_do_aluno}</p>
                  <p><b>Necessidades Educacionais:</b> {selectPei.necessidades_educacionais_especificas}</p>
                  <p><b>Habilidades:</b> {selectPei.habilidades}</p>
                  <p><b>Dificuldades Apresentadas:</b> {selectPei.dificuldades_apresentadas}</p>
                  <p><b>Adaptações:</b> {selectPei.adaptacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PeiCentral;
