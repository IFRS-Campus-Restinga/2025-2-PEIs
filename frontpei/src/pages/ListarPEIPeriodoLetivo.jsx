import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./pei_periodo_letivo.css";

function PEIPeriodoLetivoLista() {
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });
  const [periodos, setPeriodos] = useState([]);
  const [erro, setErro] = useState(false);

  async function carregarPeriodos() {
    try {
      const resposta = await DB.get("/");
      if (Array.isArray(resposta.data)) setPeriodos(resposta.data);
      else if (Array.isArray(resposta.data.results)) setPeriodos(resposta.data.results);
      else setPeriodos([]);
      setErro(false);
    } catch (err) {
      console.error("Erro ao buscar períodos:", err);
      setErro(true);
    }
  }

  useEffect(() => {
    carregarPeriodos();
  }, []);

  return (
    <div className="container">
      <h1>Períodos Letivos</h1>

      {erro ? (
        <p className="error">Não foi possível carregar os períodos.</p>
      ) : periodos.length === 0 ? (
        <p>Nenhum período registrado.</p>
      ) : (
        periodos.map((p) => (
          <div key={p.id} className="periodo-card">
            <b>Data Criação:</b> {p.data_criacao} <br />
            <b>Data Término:</b> {p.data_termino} <br />
            <b>Período:</b> {p.periodo}
            <br /><br />

            <b>Pareceres:</b>
            {p.pareceres && p.pareceres.length > 0 ? (
              <ul>
                {p.pareceres.map((parecer) => (
                  <li key={parecer.id}>
                    <i>{parecer.texto}</i>
                    <p>Data de Criação Parecer: {parecer.data}</p>
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

      <button style={{ marginTop: "20px" }}>
        <Link to="/">Voltar</Link>
      </button>
    </div>
  );
}

export default PEIPeriodoLetivoLista;
