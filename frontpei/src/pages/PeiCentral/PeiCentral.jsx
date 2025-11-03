import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import BotaoEditar from "../../components/customButtons/botaoEditar";


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
            <div
              key={pei.id}
              style={{
                marginBottom: "20px",
                padding: "10px",
                border: "1px solid #ccc",
              }}
            >
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
            </div>
            
          ))
        )}

        <BotaoVoltar/>
      </div>
    </div>
  );
}

export default PeiCentral;
