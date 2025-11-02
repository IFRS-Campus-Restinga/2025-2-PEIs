import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { validaCampos } from "../../utils/validaCampos";
import { useAlert } from "../../context/AlertContext";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";

function CreatePeiCentral() {
  const [historico_do_aluno, setHistorico] = useState("");
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [dificuldades_apresentadas, setDificuldadesApresentadas] = useState("");
  const [adaptacoes, setAdaptacoes] = useState("");
  const [status_pei, setStatus] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState("");

  const { addAlert } = useAlert();
  const navigate = useNavigate();

  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });
  const DBALUNO = axios.create({ baseURL: import.meta.env.VITE_ALUNO_URL });

  // 🔹 Carrega alunos na abertura da tela
  useEffect(() => {
    async function recuperaAlunos() {
      try {
        const resp = await DBALUNO.get("/");
        const data = resp.data;
        setAlunos(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        addAlert("Erro ao carregar alunos!", "error");
      }
    }
    recuperaAlunos();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const camposParaValidar = {
      aluno_id: alunoSelecionado,
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
      setAlunoSelecionado("");
      setHistorico("");
      setNecessidades("");
      setHabilidades("");
      setDificuldadesApresentadas("");
      setAdaptacoes("");
      setStatus("");

      // redireciona após tempo de mensagem
      setTimeout(() => navigate("/peicentral"), 1500);
    } catch (err) {
      console.error("Erro ao criar PEI Central:", err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([campo, msgs]) => `${campo}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join("\n");
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
        <label>Selecione o Aluno</label>
        <br />
        <select
          value={alunoSelecionado}
          onChange={(e) => setAlunoSelecionado(e.target.value)}
        >
          <option value="">-- Selecione --</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
                {a.nome ?? `#${a.id}`} - {a.matricula}
            </option>
          ))}
        </select>
        
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
            onChange={(e) => setDificuldadesApresentadas(e.target.value)}
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
            onChange={(e) => setAdaptacoes(e.target.value)}
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
            <option value="">-- Selecione --</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM ANDAMENTO">Em Andamento</option>
            <option value="FECHADO">Fechado</option>
          </select>
        </div>
          <br />
          
        {/* Botão salvar */}
        <button
          className="submit-btn"
        >
          Salvar
        </button>
      </form>

      <BotaoVoltar/>
    </div>
  );
}

export default CreatePeiCentral;
