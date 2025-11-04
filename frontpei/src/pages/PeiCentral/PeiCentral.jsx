import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../peiPeriodoLetivo/pei_periodo_letivo.css";
import "../peiPeriodoLetivo/listar_pei_periodo_letivo.css";
import { API_ROUTES, BACKEND_TOKEN } from "../../configs/apiRoutes";

function PeiCentral() {
  const [peiCentral, setPeiCentral] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  const DB = axios.create({
    baseURL: API_ROUTES.PEI_CENTRAL, // agora usa o padrão do projeto
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
    <div className="container">
      <h1 style={{ textAlign: "center" }}>PEI CENTRAL</h1>

      <button
        type="button"
        style={{ fontSize: "21px" }}
        onClick={() => navigate("/create_peicentral")}
      >
        Criar novo PEI
      </button>

      <br />
      <br />

      {carregando ? (
        <p>Carregando dados do PEI...</p>
      ) : erro ? (
        <p style={{ color: "red" }}>{erro}</p>
      ) : peiCentral.length === 0 ? (
        <p>Nenhum PEI cadastrado ainda.</p>
      ) : (
        peiCentral.map((pei) => (
          <div
            key={pei.id}
            style={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              backgroundColor: "#f7f7f7",
            }}
          >
            <button
              type="button"
              onClick={() => navigate(`/editar_peicentral/${pei.id}`)}
            >
              Editar
            </button>

            <br />
            <br />

            <div
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
              <b>Aluno:</b> {pei.aluno?.nome ?? "Não informado"} <br />
              <b>Matrícula:</b> {pei.aluno?.matricula ?? "—"} <br />
              <b>E-mail:</b> {pei.aluno?.email ?? "—"}
            </div>

            <div style={{ textAlign: "justify" }}>
              <p>
                <b>Status:</b> {pei.status_pei ?? "—"}
              </p>

              <p>
                <b>Histórico do Aluno:</b>
                <br />
                {pei.historico_do_aluno || <i>Sem histórico</i>}
              </p>

              <p>
                <b>Necessidades:</b>
                <br />
                {pei.necessidades_educacionais_especificas || <i>Sem registro</i>}
              </p>

              <p>
                <b>Habilidades:</b> {pei.habilidades || <i>Não informado</i>}
              </p>

              <p>
                <b>Dificuldades Apresentadas:</b> {pei.dificuldades_apresentadas || <i>Não informado</i>}
              </p>

              <p>
                <b>Adaptações:</b> {pei.adaptacoes || <i>Não informado</i>}
              </p>
            </div>

            <br />

            {pei.periodos?.length > 0 ? (
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
                    <div
                      key={periodo.id}
                      className="periodo-card"
                      style={{
                        padding: "10px",
                        border: "1px solid #bbb",
                        borderRadius: "6px",
                        background: "#ececec",
                      }}
                    >
                      <p>
                        <b>Data de Criação:</b> {periodo.data_criacao ?? "—"} <br />
                        <b>Data de Término:</b> {periodo.data_termino ?? "—"}
                      </p>
                      <p>
                        <b>Período Letivo:</b> {periodo.periodo_principal ?? "—"}
                      </p>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/listar_periodos/${periodo.id}`)}
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

      <button type="button" onClick={() => navigate("/")}>
        Voltar
      </button>
    </div>
  );
}

export default PeiCentral;
