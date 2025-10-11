import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { validaCampos } from "../../utils/validaCampos";
import { useAlert } from "../../context/AlertContext";
import "../pei_periodo_letivo.css";

function CreatePeiCentral() {
  const [historico_do_aluno, setHistorico] = useState("");
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [dificuldades_apresentadas, SetDificuldadesApresentadas] = useState("");
  const [adaptacoes, SetAdaptacoes] = useState("");
  const [status_pei, setStatus] = useState("");

  const { addAlert } = useAlert();
  const navigate = useNavigate();

  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  async function handleSubmit(e) {
    e.preventDefault();

    // validação dos campos
    const camposParaValidar = {
      historico_do_aluno,
      necessidades_educacionais_especificas,
      habilidades,
      dificuldades_apresentadas,
      adaptacoes,
      status_pei,
    };
      
    const mensagens = validaCampos(camposParaValidar, e.target);
    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
      
    }

    try {
      const resposta = await DB.post("/", camposParaValidar);
      console.log("Criado:", resposta.data);

      addAlert("PEI Central criado com sucesso!", "success");

      // limpa campos
      setHistorico("");
      setNecessidades("");
      setHabilidades("");
      SetDificuldadesApresentadas("");
      SetAdaptacoes("");
      setStatus("");

      

      // redireciona após tempo de mensagem
      setTimeout(() => navigate("/peicentral"), 1500);
    } catch (err) {
      console.error("Erro ao criar PEI Central:", err);

      if (err.response?.data) {
        // converte mensagens do backend
        const messages = Object.entries(err.response.data)
          .map(([campo, msgs]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        addAlert(`Erro ao criar PEI Central:\n ${messages}`, "error");
      } else {
        addAlert("Erro ao criar PEI Central. Tente novamente.", "error");
      }
    }
  }
  
  return (
    <div className="container">
      <h1 className="text-xl font-bold mb-4">Criar PEI Central</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Histórico do aluno */}
        <div>
          <label className="block mb-1 font-medium">Histórico do Aluno:</label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={historico_do_aluno}
            onChange={(e) => setHistorico(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Digite o histórico completo do aluno"
            //required
          />
        </div>

        {/* Necessidades */}
        <div>
          <label className="block mb-1 font-medium">
            Necessidades Educacionais Específicas:
          </label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={necessidades_educacionais_especificas}
            onChange={(e) => setNecessidades(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Ex: Se o estudante é cego, precisa de Braille, leitor de telas..."
            //required
          />
        </div>

        {/* Habilidades */}
        <div>
          <label className="block mb-1 font-medium">Habilidades:</label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={habilidades}
            onChange={(e) => setHabilidades(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Conhecimentos, habilidades, interesses, afinidades..."
            //required
          />
        </div>

        {/* Dificuldades apresentadas */}
        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={dificuldades_apresentadas}
            onChange={(e) => SetDificuldadesApresentadas(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Dificuldades apresentadas pelo aluno"
            //required
          />
        </div>

        {/* Adaptações */}
        <div>
          <label className="block mb-1 font-medium">Adaptações:</label>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={adaptacoes}
            onChange={(e) => SetAdaptacoes(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Adaptações razoáveis e/ou acessibilidades curriculares"
            //required
          />
        </div>

        {/* Status ENUM */}
        <div>
          <label className="block mb-1 font-medium">Status:</label>
          <select
            value={status_pei}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-2 py-1 rounded w-full"
            //required
          >
            <option value="">Selecione um status</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM ANDAMENTO">Em Andamento</option>
            <option value="FECHADO">Fechado</option>
          </select>
        </div>

        {/* Botão salvar */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Salvar
        </button>
      </form>

      <div className="mt-4">
        <button>
          <Link to="/peicentral" className="text-blue-600 hover:underline">
            Voltar
          </Link>
        </button>
      </div>
    </div>
  );
}

export default CreatePeiCentral;
