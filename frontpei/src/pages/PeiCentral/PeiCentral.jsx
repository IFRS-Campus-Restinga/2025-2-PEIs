import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import { API_ROUTES } from "../../configs/apiRoutes";
import "../../cssGlobal.css";
import BotaoEditar from "../../components/customButtons/botaoEditar";

function PeiCentral() {
  const [peiCentral, setPeiCentral] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  const DB = axios.create({
    baseURL: API_ROUTES.PEI_CENTRAL,
    headers: {
      Authorization: `Token ${BACKEND_TOKEN}`,
    },
  });

  useEffect(() => {
    async function carregarPeiCentral() {
      setCarregando(true);
      setErro(null);

      try {
        const resposta = await DB.get("/");
        console.log("✅ Dados PEI Central recebidos:", resposta.data);

        let lista = [];
        if (Array.isArray(resposta.data)) {
          lista = resposta.data;
        } else if (Array.isArray(resposta.data.results)) {
          lista = resposta.data.results;
        } else {
          console.warn("⚠️ Formato inesperado de resposta da API:", resposta.data);
        }

        setPeiCentral(lista);
      } catch (err) {
        console.error("❌ Erro ao buscar PEIs Centrais:", err);
        setErro("Erro ao carregar dados do PEI Central. Verifique o console para detalhes.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPeiCentral();
  }, []);

  return (
    <div className="container-padrao">
      <h1 style={{ textAlign: "center" }}>PEI CENTRAL</h1>

      <button
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
          peiCentral.map((pei) => (
            <div
              key={pei.id}
              className="periodo-card"
              style={{
                textAlign: "center",
                fontSize: "20px",
                margin: "10px",
                background: "#d3d3d3ff",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <BotaoEditar id={pei.id} rotaEdicao="/editar_peicentral/" />
              <br />
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
                <b>Aluno:</b> {pei.aluno?.nome} -{" "}
                <b>Matrícula:</b> {pei.aluno?.matricula}
                <br />
                <b>E-mail:</b> {pei.aluno?.email}
                <br />
                <br />
              </div>

              <div style={{ textAlign: "justify" }}>
                <b>Status:</b> <p>{pei.status_pei}</p>

                <b>Histórico do Aluno:</b>
                <p>{pei.historico_do_aluno}</p>

                <b>Necessidades:</b>
                <p>{pei.necessidades_educacionais_especificas}</p>

                <b>Habilidades:</b>
                <p>{pei.habilidades}</p>

                <b>Dificuldades Apresentadas:</b>
                <p>{pei.dificuldades_apresentadas}</p>

                <b>Adaptações:</b>
                <p>{pei.adaptacoes}</p>
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
                      <div key={periodo.id} className="periodo-card">
                        <p>
                          <b>Data de Criação:</b> {periodo.data_criacao}{" "}
                          <b>Data de Término:</b> {periodo.data_termino}
                        </p>
                        <p>
                          <b>Período Letivo:</b> {periodo.periodo_principal}
                        </p>

                        <div style={{ display: "flex", gap: "20px" }}>
                          <button
                            className="btn-verde"
                            onClick={() =>
                              navigate("/listar_periodos/" + periodo.id)
                            }
                          >
                            Visualizar Período
                          </button>
                        </div>
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
        <BotaoVoltar />
      </div>
    </div>
  );
}

export default PeiCentral;
