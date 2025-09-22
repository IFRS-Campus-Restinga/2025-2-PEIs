import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function CreatePeiCentral() {
  const [historico_do_aluno, setHistorico] = useState("");
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [dificuldades_apresentadas, SetDificuldadesApresentadas] = useState("");
  const [adaptacoes, SetAdaptacoes] = useState("");
  const [status_pei, setStatus] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      const resposta = await DB.post("/", {
        historico_do_aluno,
        necessidades_educacionais_especificas,
        habilidades,
        dificuldades_apresentadas,
        adaptacoes,
        status_pei,
      });

      console.log("Criado:", resposta.data);
      setSucesso("Pei Central criado com sucesso!");

      setHistorico("");
      setStatus("");

      setTimeout(() => navigate("/peicentral"), 1500);
    } catch (err) {
      console.error("Erro ao criar Pei Central:", err);
      setErro("Erro ao criar Pei Central. Tente novamente.");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Criar Pei Central</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de preenchimento de historico_do_aluno */}
        <div>
          <label className="block mb-1 font-medium">Histórico do Aluno:</label>
          <br></br>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={historico_do_aluno}
            onChange={(e) => setHistorico(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Digite o histórico completo do aluno"
            required
          />
        </div>

        {/* preenchimento do campo necessidades_educacionais_especificas */}
        <div>
          <label className="block mb-1 font-medium">Necessidades Educacionais Específicas:</label>
          <br></br>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={necessidades_educacionais_especificas}
            onChange={(e) => setNecessidades(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Detalhar as condições do estudante o que ele necessita. Ex: Se o estudante é cego: sua condição é: cegueira. Precisa de: Braille, Leitor de telas..."
            required
          />
        </div>

        {/* preenchimento do campo habilidades */}
        <div>
          <label className="block mb-1 font-medium">Habilidades:</label>
          <br></br>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={habilidades}
            onChange={(e) => setHabilidades(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Conhecimentos, Habilidades, Capacidades, Interesses, Necessidades (O que sabe? Do que gosta/afinidades?...)"
            required
          />
        </div>

        {/*preenchimento do campo dificuldades_apresentadas */}

        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>
          <br></br>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={dificuldades_apresentadas}
            onChange={(e) => SetDificuldadesApresentadas(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Dificuldades Apresentadas"
            required
          />
        </div>

        {/*preenchimento do campo adaptacoes */}
        <div>
          <label className="block mb-1 font-medium">Adaptações:</label>
          <br></br>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={adaptacoes}
            onChange={(e) => SetAdaptacoes(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Adaptações Razoáveis e/ou Acessibilidades Curriculares"
            required
          />
        </div>


        {/* Campo Status (ENUM) */}
        <div>
          <label className="block mb-1 font-medium">Status:</label>
          <select
            value={status_pei}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-2 py-1 rounded w-full"
            required
          >
            <option value="">Selecione um status</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM ANDAMENTO">Em Andamento</option>
            <option value="FECHADO">Fechado</option>
            {/* provisório, a ideia é vincular o status a enventos no sistema.
                neste caso seria automático para para aberto
            */}
          </select>
        </div>

        {/* Botão para salvar */}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Salvar
        </button>
      </form>

      {erro && <p className="text-red-600 mt-4">{erro}</p>}
      {sucesso && <p className="text-green-600 mt-4">{sucesso}</p>}

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
