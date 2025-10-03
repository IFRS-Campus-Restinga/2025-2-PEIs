import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function PeiCentral() {
  const [pei_central, setPeiCentral] = useState([]);
  const [erro, setErro] = useState(false);

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
            <br />
          </div>
        ))
      )}

      <button>
        <Link to="/">Voltar</Link>
      </button>
    </div>
  );
}

export default PeiCentral;
