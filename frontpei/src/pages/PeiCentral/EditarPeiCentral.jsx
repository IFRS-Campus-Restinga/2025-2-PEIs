import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

function EditarPeiCentral() {
  const { id } = useParams();
  const navigate = useNavigate();
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  const [status, setStatus] = useState("");
  const [historico_do_aluno, setHistorico] = useState("");
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [dificuldades_apresentadas, setDificuldadesApresentadas] = useState("");
  const [adaptacoes, setAdaptacoes] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  

  useEffect(() => {
    async function carregarPeiCentral() {
      try {
        const resposta = await DB.get(`/${id}/`);
        setStatus(resposta.data.status_pei);
        setHistorico(resposta.data.historico_do_aluno);
        setNecessidades(resposta.data.necessidades_educacionais_especificas);
        setHabilidades(resposta.data.habilidades);
        setDificuldadesApresentadas(resposta.data.dificuldades_apresentadas);
        setAdaptacoes(resposta.data.adaptacoes);
      } catch (err) {
        console.error("Erro ao carregar PEI Central:", err);
      }
    }

    carregarPeiCentral();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await DB.put(`/${id}/`, {
        status_pei: status,
        historico_do_aluno: historico_do_aluno,
        necessidades_educacionais_especificas: necessidades_educacionais_especificas,
        habilidades: habilidades,
        dificuldades_apresentadas: dificuldades_apresentadas,
        adaptacoes: adaptacoes,
      });

      setSucesso("PEI Central atualizado com sucesso!");
      setTimeout(() => {navigate("/peicentral")}, 2000);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível atualizar o PEI Central.");
    }
  }

  return (
    <div>
      <h1>Editar PEI Central</h1>
      {sucesso && <div  className="text-sucesso">{sucesso}</div>}
      <form onSubmit={handleSubmit}>
        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Selecione</option>
          <option value="ABERTO">Aberto</option>
          <option value="EM ANDAMENTO">Em Andamento</option>
          <option value="FECHADO">Fechado</option>
        </select>

        <br /><br />

        <label>Histórico do Aluno:</label>
        <br />
        <textarea
          value={historico_do_aluno}
          onChange={(e) => setHistorico(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
        />

        <br /><br />

        <label>Necessidades Educacionais Específicas:</label>
        <br />
        <textarea
          value={necessidades_educacionais_especificas}
          onChange={(e) => setNecessidades(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
        />

        <br /><br />

        <label>Habilidades:</label>
        <br />
        <textarea
          value={habilidades}
          onChange={(e) => setHabilidades(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
        />

        <br /><br />

         <label>Dificuldades Apresentadas:</label>
        <br />
        <textarea
          value={dificuldades_apresentadas}
          onChange={(e) => setDificuldadesApresentadas(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
        />

        <br /><br />

        <br /><br />

         <label>Adaptações:</label>
        <br />
        <textarea
          value={adaptacoes}
          onChange={(e) => setAdaptacoes(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
        />

        <br /><br />

        <button type="submit">Salvar Alterações</button>
        <button type="button" onClick={() => navigate("/peicentral")}>
          Cancelar
        </button>
        <button>
            <Link to={`/deletar_peicentral/${id}`}> Deletar </Link> 
        </button>
      </form>
    </div>
  );
}

export default EditarPeiCentral;
