import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import { API_ROUTES } from "../../configs/apiRoutes";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

function PEIPeriodoLetivoLista() {
  const DB = axios.create({ baseURL: API_ROUTES.PEIPERIODOLETIVO });
  const [periodos, setPeriodos] = useState([]);
  const [erro, setErro] = useState(false);
  const [periodoUnico, setPeriodoUnico] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  async function carregarPeriodos() {
    console.log("🔹 Iniciando requisição para listar períodos");
    try {
      const resposta = await DB.get("/");
      console.log("🔹 Resposta recebida:", resposta);
      console.log("🔹 Resposta.data:", resposta.data);

      if (Array.isArray(resposta.data)) {
        console.log("🔹 A resposta é um array direto");
        setPeriodos(resposta.data);
      } else if (Array.isArray(resposta.data.results)) {
        console.log("🔹 A resposta possui 'results'");
        setPeriodos(resposta.data.results);
      } else {
        console.log("🔹 Estrutura desconhecida, setando array vazio");
        setPeriodos([]);
      }
      console.log("🔹 State 'periodos' atualizado:", periodos);
      setErro(false);
    } catch (err) {
      console.error("❌ Erro ao carregar períodos:", err);
      setErro(true);
    }
  }

  async function carregarPeriodoUnico(id) {
    console.log(`🔹 Iniciando requisição para período único (id=${id})`);
    try {
      const resposta = await DB.get(`/${id}/`);
      console.log("🔹 Resposta recebida:", resposta);
      console.log("🔹 Resposta.data:", resposta.data);

      setPeriodoUnico(resposta.data);
      console.log("🔹 State 'periodoUnico' atualizado:", resposta.data);
      setErro(false);
    } catch (err) {
      console.error(`❌ Erro ao carregar período id=${id}:`, err);
      setErro(true);
    }
  }

  useEffect(() => {
    console.log("🔹 useEffect disparado, id:", id);
    if (id) carregarPeriodoUnico(id);
    else carregarPeriodos();
  }, [id]);

  if (id && periodoUnico) {
    return (
      <div className="container-padrao">
        <h1>Período Letivo #{periodoUnico.id}</h1>
        <div className="periodo-card">
          <b>Data Criação:</b> {periodoUnico.data_criacao} <br />
          <b>Data Término:</b> {periodoUnico.data_termino} <br />
          <b>Período:</b> {periodoUnico.periodo_principal || periodoUnico.periodo}
          <br /><br />
          <b>Pareceres:</b>
          {periodoUnico.componentes_curriculares?.length > 0 ? (
            periodoUnico.componentes_curriculares.map((comp) => (
              <div key={comp.id}>
                <i>
                  Componente Curricular: {comp.disciplina?.nome || "Sem disciplina vinculada"}
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
          <button type="button" className="btn-visualizar" onClick={() => navigate("/listar_periodos/")}>
            Visualizar Lista de Períodos
          </button>
          <BotaoVoltar/>
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
                    Componente Curricular: {comp.disciplina?.nome || "Sem disciplina vinculada"}
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
      <BotaoVoltar/>
    </div>
  );
}

export default PEIPeriodoLetivoLista;
