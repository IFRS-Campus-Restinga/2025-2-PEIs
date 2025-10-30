<<<<<<< HEAD
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { validaCampos } from "../../utils/validaCampos";
import { useAlert } from "../../context/AlertContext";
import "../peiPeriodoLetivo/pei_periodo_letivo.css";
=======
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

function CreatePeiCentral() {
  const [historico_do_aluno, setHistorico] = useState("");
  const [necessidades_educacionais_especificas, setNecessidades] = useState("");
  const [habilidades, setHabilidades] = useState("");
<<<<<<< HEAD
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
=======
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
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    }
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Criar Pei Central</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de preenchimento de historico_do_aluno */}
        <div>
          <label className="block mb-1 font-medium">Histórico do Aluno:</label>
          <br></br>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={historico_do_aluno}
            onChange={(e) => setHistorico(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Digite o histórico completo do aluno"
<<<<<<< HEAD
            //required
          />
        </div>

        {/* Necessidades */}
        <div>
          <label className="block mb-1 font-medium">
            Necessidades Educacionais Específicas:
          </label>
=======
            required
          />
        </div>

        {/* preenchimento do campo necessidades_educacionais_especificas */}
        <div>
          <label className="block mb-1 font-medium">Necessidades Educacionais Específicas:</label>
          <br></br>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={necessidades_educacionais_especificas}
            onChange={(e) => setNecessidades(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
<<<<<<< HEAD
            placeholder="Ex: Se o estudante é cego, precisa de Braille, leitor de telas..."
            //required
          />
        </div>

        {/* Habilidades */}
        <div>
          <label className="block mb-1 font-medium">Habilidades:</label>
=======
            placeholder="Detalhar as condições do estudante o que ele necessita. Ex: Se o estudante é cego: sua condição é: cegueira. Precisa de: Braille, Leitor de telas..."
            required
          />
        </div>

        {/* preenchimento do campo habilidades */}
        <div>
          <label className="block mb-1 font-medium">Habilidades:</label>
          <br></br>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={habilidades}
            onChange={(e) => setHabilidades(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
<<<<<<< HEAD
            placeholder="Conhecimentos, habilidades, interesses, afinidades..."
            //required
          />
        </div>

        {/* Dificuldades apresentadas */}
        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>
=======
            placeholder="Conhecimentos, Habilidades, Capacidades, Interesses, Necessidades (O que sabe? Do que gosta/afinidades?...)"
            required
          />
        </div>

        {/*preenchimento do campo dificuldades_apresentadas */}

        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>
          <br></br>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={dificuldades_apresentadas}
<<<<<<< HEAD
            onChange={(e) => setDificuldadesApresentadas(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Dificuldades apresentadas pelo aluno"
            //required
          />
        </div>

        {/* Adaptações */}
        <div>
          <label className="block mb-1 font-medium">Adaptações:</label>
=======
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
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
          <textarea
            style={{ width: "100%" }}
            rows={6}
            value={adaptacoes}
<<<<<<< HEAD
            onChange={(e) => setAdaptacoes(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Adaptações razoáveis e/ou acessibilidades curriculares"
            //required
          />
        </div>

        {/* Status ENUM */}
=======
            onChange={(e) => SetAdaptacoes(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Adaptações Razoáveis e/ou Acessibilidades Curriculares"
            required
          />
        </div>


        {/* Campo Status (ENUM) */}
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
        <div>
          <label className="block mb-1 font-medium">Status:</label>
          <select
            value={status_pei}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-2 py-1 rounded w-full"
<<<<<<< HEAD
            //required
          >
            <option value="">-- Selecione --</option>
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
=======
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
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
          Salvar
        </button>
      </form>

<<<<<<< HEAD
      <div className="mt-4">
        <button>
          <Link to="/peicentral" className="text-blue-600 hover:underline">
            Voltar
          </Link>
=======
      {erro && <p className="text-red-600 mt-4">{erro}</p>}
      {sucesso && <p className="text-green-600 mt-4">{sucesso}</p>}

      <div className="mt-4">
        <button>
            <Link to="/peicentral" className="text-blue-600 hover:underline">
                Voltar
            </Link>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
        </button>
      </div>
    </div>
  );
}

export default CreatePeiCentral;
