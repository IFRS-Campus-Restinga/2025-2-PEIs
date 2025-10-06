import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // importei useParams e useNavigate
import axios from "axios";
import "./pei_periodo_letivo.css";

function PEIPeriodoLetivoLista() {
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });
  const [periodos, setPeriodos] = useState([]);
  const [erro, setErro] = useState(false);

  // estados para manipulação bia indice na url peririo (1, 2, 3, ...)
  const [periodoUnico, setPeriodoUnico] = useState(null);
  const { id } = useParams(); // captura o ID da URL (ex: /pei-periodos/5)
  const navigate = useNavigate();

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

  // Função separada para buscar o período único Maurício
  async function carregarPeriodoUnico(id) {
    try {
      const resposta = await DB.get(`/${id}/`);
      setPeriodoUnico(resposta.data);
      setErro(false);
    } catch (err) {
      console.error("Erro ao buscar período específico:", err);
      setErro(true);
    }
  }

  useEffect(() => {
    if (id) carregarPeriodoUnico(id);
    else carregarPeriodos();
  }, [id]); 

  // Condicional: se há ID, mostra o detalhe do periodo requisitado na pagina do pei central
  if (id && periodoUnico) {
    return (
      <div className="container">
        <h1>Período Letivo #{periodoUnico.id}</h1>
        <div className="periodo-card">
          <b>Data Criação:</b> {periodoUnico.data_criacao} <br />
          <b>Data Término:</b> {periodoUnico.data_termino} <br />
          <b>Período:</b> {periodoUnico.periodo}
          <br /><br />
          <b>Pareceres:</b>
          {periodoUnico.pareceres && periodoUnico.pareceres.length > 0 ? (
            <ul>
              {periodoUnico.pareceres.map((parecer) => (
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

          <div style={{ display: "flex", gap: "20px" }}>
            <button type="button" onClick={() => navigate("/listar_periodos/")}>
              Visualizar Lista de Períodos
            </button>
            <button type="button" onClick={() => navigate("/")}>
              Voltar para Home
            </button>
          </div>
      </div>
    );
  }

  // Abaixo código do Gabi sem alterações.
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
