import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import "../peiPeriodoLetivo/pei_periodo_letivo.css";

function EditarPeiCentral() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAlert } = useAlert();

  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  const [status_pei, setStatus] = useState("");
  const [historico_do_aluno, setHistorico] = useState("");
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [dificuldades_apresentadas, setDificuldadesApresentadas] = useState("");
  const [adaptacoes, setAdaptacoes] = useState("");
  const [aluno, setAluno] = useState("");
  
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
        setAluno(resposta.data.aluno);
      } catch (err) {
        console.error("Erro ao carregar PEI Central:", err);
        addAlert("Erro ao carregar PEI Central. Tente novamente.", "error");
      }
    }

    carregarPeiCentral();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    const campos = {
      aluno_id: aluno.id,
      status_pei,
      historico_do_aluno,
      necessidades_educacionais_especificas,
      habilidades,
      dificuldades_apresentadas,
      adaptacoes,
      
    };

    const mensagens = validaCampos(campos, e.target);

    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    try {
      await DB.put(`/${id}/`, campos);
      addAlert("PEI Central atualizado com sucesso!", "success");
      setTimeout(() => navigate("/peicentral"), 1500);
    } catch (err) {
      console.error("Erro ao atualizar PEI Central:", err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao atualizar: ${messages}`, "error");
      } else {
        addAlert("Erro ao atualizar PEI Central. Tente novamente.", "error");
      }
    }
  }

  return (
    <div className="container">
      <h1 className="text-xl font-bold mb-4">Editar PEI Central do aluno {aluno.nome}</h1>
      
      <br/>
      <form onSubmit={handleSubmit} className="space-y-4">  
        
        <div>
          <label className="block mb-1 font-medium">Status:</label>
          <select
            value={status_pei}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">Selecione</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM ANDAMENTO">Em Andamento</option>
            <option value="FECHADO">Fechado</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Histórico do Aluno:</label>
          <textarea
            value={historico_do_aluno}
            onChange={(e) => setHistorico(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Necessidades Educacionais Específicas:</label>
          <textarea
            value={necessidades_educacionais_especificas}
            onChange={(e) => setNecessidades(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Habilidades:</label>
          <textarea
            value={habilidades}
            onChange={(e) => setHabilidades(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>
          <textarea
            value={dificuldades_apresentadas}
            onChange={(e) => setDificuldadesApresentadas(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Adaptações:</label>
          <textarea
            value={adaptacoes}
            onChange={(e) => setAdaptacoes(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
            className="border px-2 py-1 rounded w-full resize-y"
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Salvar Alterações
          </button>&nbsp;
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>&nbsp;
         <button
            type="button"
            style={{ backgroundColor: "red", color: "white", marginRight: "10px" }}
            onClick={() => navigate(`/deletar_peicentral/${id}`)}
          >
            Deletar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarPeiCentral;