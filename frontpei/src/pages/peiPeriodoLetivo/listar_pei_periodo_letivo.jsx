import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./listar_pei_periodo_letivo.css";

function PEIPeriodoLetivoLista() {
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEIPERIODOLETIVO_URL });
  const [periodos, setPeriodos] = useState([]);
  const [erro, setErro] = useState(false);
  const [periodoUnico, setPeriodoUnico] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  async function carregarPeriodos() {
    try {
      const resposta = await DB.get("/");
      if (Array.isArray(resposta.data)) setPeriodos(resposta.data);
      else if (Array.isArray(resposta.data.results)) setPeriodos(resposta.data.results);
      else setPeriodos([]);
      setErro(false);
    } catch (err) {
      setErro(true);
    }
  }

  async function carregarPeriodoUnico(id) {
    try {
      const resposta = await DB.get(`/${id}/`);
      setPeriodoUnico(resposta.data);
      setErro(false);
    } catch (err) {
      setErro(true);
    }
  }

  useEffect(() => {
    if (id) carregarPeriodoUnico(id);
    else carregarPeriodos();
  }, [id]);

  if (id && periodoUnico) {
    return (
      <div className="container">
        <h1>Período Letivo #{periodoUnico.id}</h1>
        <div className="periodo-card">
          <b>Data Criação:</b> {periodoUnico.data_criacao} <br />
          <b>Data Término:</b> {periodoUnico.data_termino} <br />
          <b>Período:</b> {periodoUnico.periodo_principal || periodoUnico.periodo}
          <br /><br />
          <b>Pareceres:</b>
          {periodoUnico.componentes_curriculares?.length > 0 ? (
            periodoUnico.componentes_curriculares.map((comp) => (
              <div key={comp.id} className="componente-container">
                <i>
                  Componente Curricular:{" "}
                  {comp.disciplina?.nome || "Sem disciplina vinculada"}
                </i>
                {comp.pareceres?.length > 0 ? (
                  comp.pareceres.map((parecer) => (
                    <div key={parecer.id} className="parecer-card">
                      <div className="parecer-header">
                        <span>
                          {parecer.professor
                            ? `${parecer.professor.nome} (${parecer.professor.email})`
                            : "Professor não informado"}
                        </span>
                        <span className="parecer-data">{parecer.data}</span>
                      </div>
                      <div className="parecer-texto">{parecer.texto}</div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum parecer registrado neste componente.</p>
                )}
              </div>
            ))
          ) : (
            <p>Nenhum componente curricular neste período.</p>
          )}
        </div>
        <div className="botoes-navegacao">
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
            <b>Período:</b> {p.periodo_principal || p.periodo}
            <br /><br />
            <b>Pareceres:</b>
            {p.componentes_curriculares?.length > 0 ? (
              p.componentes_curriculares.map((comp) => (
                <div key={comp.id} className="componente-container">
                  <i>
                    Componente Curricular:{" "}
                    {comp.disciplina?.nome || "Sem disciplina vinculada"}
                  </i>
                  {comp.pareceres?.length > 0 ? (
                    comp.pareceres.map((parecer) => (
                      <div key={parecer.id} className="parecer-card">
                        <div className="parecer-header">
                          <span>
                            {parecer.professor
                              ? `${parecer.professor.nome} (${parecer.professor.email})`
                              : "Professor não informado"}
                          </span>
                          <span className="parecer-data">{parecer.data}</span>
                        </div>
                        <div className="parecer-texto">{parecer.texto}</div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum parecer registrado neste componente.</p>
                  )}
                </div>
              ))
            ) : (
              <p>Nenhum componente curricular neste período.</p>
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
