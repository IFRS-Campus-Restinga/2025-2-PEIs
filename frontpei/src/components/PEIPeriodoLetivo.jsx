import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function PEIPeriodoLetivo() {
  const [periodos, setPeriodos] = useState([]);
  const [erro, setErro] = useState(false);
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });

 
  useEffect(() => {
    async function carregarPeriodos() {
      try {
        const resposta = await DB.get("/"); 
        console.log("Dados recebidos:", resposta.data);

        if (Array.isArray(resposta.data)) {
          setPeriodos(resposta.data);
        } else if (Array.isArray(resposta.data.results)) {
          setPeriodos(resposta.data.results); 
        } else {
          console.error("Formato inesperado da API:", resposta.data);
          setPeriodos([]);
        }
        setErro(false);
      } catch (err) {
        console.error("Erro ao buscar períodos:", err);
        setErro(true);
      }
    }

    carregarPeriodos();
  }, []);

  return (
  <div>
    <h1>Períodos Letivos</h1>
    {erro ? (
      <p style={{ color: "red" }}>Não foi possível carregar os períodos.</p>
    ) : (
      periodos.map((p) => (
        <div key={p.id} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
          <b>Data Criação:</b> {p.data_criacao} <br />
          <b>Período:</b> {p.periodo}
          <br /><br />

          <b>Pareceres:</b>
          {p.pareceres && p.pareceres.length > 0 ? (
            <ul>
              {p.pareceres.map((parecer) => (
                <li key={parecer.id}>
                  <i>{parecer.texto}</i> 
                  <p>Data de Criação Parecer: ({parecer.data})</p>
                  {parecer.professor ? (
                    <p>
                      <b>Professor:</b> {parecer.professor.nome} ({parecer.professor.email})
                    </p>
                  ) : (
                    <p><b>Professor:</b> não informado</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum parecer registrado.</p>
          )}
        </div>
      ))
    )}

    <button>
      <Link to="/">Voltar</Link>
    </button>

  </div>
);

}

export default PEIPeriodoLetivo;
