import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pei_periodo_letivo.css";

function PeiCentral() {
  const [pei_central, setPeiCentral] = useState([]);
  const [erro, setErro] = useState(false);
  const navigate = useNavigate();

  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

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

  return (
    <div className="container">
      <h1>PEI CENTRAL</h1>

      
      <button type="button" onClick={() => navigate("/create_peicentral")}>
        Criar novo PEI
      </button><br />
      <br></br>
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
            <button type="button" onClick={() => navigate("/editar_peicentral/")}>
              Editar
            </button>
            <br /><br />
            
            <b>Aluno(PENDENTE):</b> Fulano da Silva <br />
            <b>Status:</b> {pei.status_pei}<br />
            <br></br>   
            <b>Histórico do Aluno:</b> {pei.historico_do_aluno} <br />
            <br></br>
            <b>Necessidades:</b> {pei.necessidades_educacionais_especificas} <br />
            <br></br>
            <b>Habilidades:</b> {pei.habilidades} <br />
            <br></br>
            <b>Dificuldades Apresentadas</b> {pei.dificuldades_apresentadas} <br />
            <br></br>
            <b>Adaptações:</b> {pei.adaptacoes}<br />
            <br />
            <br />

            {pei.periodos && pei.periodos.length > 0 ? (
              <div>
                <b>Períodos:</b>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                  {pei.periodos.map((periodo) => (
                    <div className="periodo-card">
                      <p><b>Data de Criação:</b> {periodo.data_criacao} <b>Data de Término:</b> {periodo.data_termino}</p>
                      <p><b>Período Letivo:</b> {periodo.periodo}        
                      <div style={{ display: "flex", gap: "20px" }}>
                        <button type="button" onClick={() => navigate("/listar_periodos/"+ periodo.id)}>
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
            
          </div>
          
        ))
      )}

      <button type="button" onClick={()=>navigate("/")}>
        Voltar
      </button>
    </div>
  );
}

export default PeiCentral;
