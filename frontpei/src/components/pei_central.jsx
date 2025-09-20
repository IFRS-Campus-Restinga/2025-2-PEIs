import { useEffect, useState } from "react";
import axios from "axios";
import Crud from "../Crud.jsx";
import { Link } from "react-router-dom";

function PeiCentral() {
  const [pei_central, setPeiCentral] = useState([]);
  const [erro, setErro] = useState(false);
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });
  const [voltarCrud, setVoltarCrud] = useState(false);

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

  if (voltarCrud) {
    return <Crud />;
  }

  return (
    <div>
      <h1>PEI CENTRAL</h1>
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
            <b>Histórico do Aluno:</b> {pei.historico_do_aluno} <br />
            <b>Status:</b> {pei.status_pei}
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
