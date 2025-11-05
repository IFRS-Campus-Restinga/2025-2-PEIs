import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import "../peiPeriodoLetivo/pei_periodo_letivo.css";
import "../peiPeriodoLetivo/listar_pei_periodo_letivo.css";
import { API_ROUTES, BACKEND_TOKEN } from "../../configs/apiRoutes";
=======
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import BotaoEditar from "../../components/customButtons/botaoEditar";

>>>>>>> 2f0d9acb6b498f58eb764a09ee5deea97f0047c3

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
<<<<<<< HEAD
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

=======
    <div className="container-padrao">
      <h1 textAlign='center'>
        PEI CENTRAL  
      </h1> 
      <button className="submit-btn" style={{fontSize: '21px', }} onClick={() => navigate("/create_peicentral")}>
          Criar novo PEI
      </button><br /><br/>
        <div>
        <br></br>
        {erro ? (
          <p style={{ color: "red" }}>Não foi possível carregar os períodos.</p>
        ) : (
          pei_central.map((pei) => (
>>>>>>> 2f0d9acb6b498f58eb764a09ee5deea97f0047c3
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
<<<<<<< HEAD
              <b>Aluno:</b> {pei.aluno?.nome ?? "Não informado"} <br />
              <b>Matrícula:</b> {pei.aluno?.matricula ?? "—"} <br />
              <b>E-mail:</b> {pei.aluno?.email ?? "—"}
=======
              <BotaoEditar id={pei.id} rotaEdicao="/editar_peicentral/" />
              <br /><br />
              <div className="periodo-card" style={{textAlign: 'center', fontSize: '20px', margin:'10px', background:'#d3d3d3ff'}}>
                  <br/>
                  <b>Aluno:</b> {pei.aluno.nome} - <b>Matricula:</b> {pei.aluno.matricula}<br/> <b>e-mail:</b> {pei.aluno.email} <br />
                  <br/>
              </div>
              <br/>
              <div style={{textAlign: 'justify'}}>
                <b>Status:</b> <p>{pei.status_pei}</p>
                
                <b>Histórico do Aluno:</b><br/> <p>{pei.historico_do_aluno}</p>
                
                <b>Necessidades:</b><br/> <p>{pei.necessidades_educacionais_especificas}</p> <br />
                
                <b>Habilidades:</b> <p>{pei.habilidades}</p> <br />
                
                <b>Dificuldades Apresentadas</b> <p>{pei.dificuldades_apresentadas}</p>
                
                <b>Adaptações:</b> <p>{pei.adaptacoes}</p>
              </div>
              
              <br />

              {pei.periodos && pei.periodos.length > 0 ? (
                <div>
                  <b>Períodos:</b>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                    {pei.periodos.map((periodo) => (
                      <div className="periodo-card">
                        <p><b>Data de Criação:</b> {periodo.data_criacao} <b>Data de Término:</b> {periodo.data_termino}</p>
                        <p><b>Período Letivo:</b> {periodo.periodo_principal}        
                        <div style={{ display: "flex", gap: "20px" }}>
                          <button className="btn-verde" onClick={() => navigate("/listar_periodos/"+ periodo.id)}>
                            Visualizar Periodo
                          </button>
                        </div>
                        </p>
                        
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p><i>Nenhum período vinculado</i></p>
              )}
              <hr></hr>
>>>>>>> 2f0d9acb6b498f58eb764a09ee5deea97f0047c3
            </div>

<<<<<<< HEAD
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
=======
        <BotaoVoltar/>
      </div>
>>>>>>> 2f0d9acb6b498f58eb764a09ee5deea97f0047c3
    </div>
  );
}

export default PeiCentral;
