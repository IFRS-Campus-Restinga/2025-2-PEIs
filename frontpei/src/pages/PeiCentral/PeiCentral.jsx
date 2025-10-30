import { useEffect, useState } from "react";
import axios from "axios";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import "../peiPeriodoLetivo/pei_periodo_letivo.css";
import "../peiPeriodoLetivo/listar_pei_periodo_letivo.css";
=======
import { Link } from "react-router-dom";
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

function PeiCentral() {
  const [pei_central, setPeiCentral] = useState([]);
  const [erro, setErro] = useState(false);
<<<<<<< HEAD
  const navigate = useNavigate();
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

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
<<<<<<< HEAD
    <div className="container">
      <h1 textAlign='center'>
        PEI CENTRAL  
      </h1> 
      <button type="button" style={{fontSize: '21px', }} onClick={() => navigate("/create_peicentral")}>
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
              <button type="button" onClick={() => navigate("/editar_peicentral/" + pei.id)}>
                Editar
              </button>
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
              <hr></hr>
            </div>
            
          ))
        )}

        <button type="button" onClick={()=>navigate("/")}>
          Voltar
        </button>
      </div>
=======
    <div>
      <h1>PEI CENTRAL</h1>

      {/* Botão sempre visível */}
      <button>
        <Link to="/create_peicentral">Criar novo PEI</Link>
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
            
            <Link to={'/editar_peicentral/'+ pei.id}>Editar</Link>
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
            
            {pei.periodos && pei.periodos.length > 0 ? (
              <div>
                <b>Períodos:</b>
                <ul>
                  {pei.periodos.map((periodo) => (
                    <li key={periodo.id}>
                      <b>Data de Criação:</b> {periodo.periodo} <br />
                      <b>Período Letivo:</b> {periodo.data_criacao} {/* exemplo */}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p><i>Nenhum período vinculado</i></p>
            )}

          </div>
        ))
      )}

      <button>
        <Link to="/">Voltar</Link>
      </button>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    </div>
  );
}

export default PeiCentral;
