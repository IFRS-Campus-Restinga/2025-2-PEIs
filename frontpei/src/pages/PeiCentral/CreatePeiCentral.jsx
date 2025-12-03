import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { validaCampos } from "../../utils/validaCampos";
import { FieldAlert, useAlert } from "../../context/AlertContext";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";
import BuscaAutoComplete from "../../components/BuscaAutoComplete";

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

  const DB = axios.create({ baseURL: API_ROUTES.PEI_CENTRAL });
  const DBALUNO = axios.create({ baseURL: API_ROUTES.ALUNO });

  // NOVO — rota cursos
  const DBCURSOS = axios.create({ baseURL: API_ROUTES.CURSOS });

  // Carrega alunos
  useEffect(() => {
    async function recuperaAlunos() {
      try {
        const resp = await DBALUNO.get("/");
        const data = resp.data;
        console.log("ALUNOS:", data);
        setAlunos(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        addAlert("Erro ao carregar alunos!", "error");
      }
    }
    recuperaAlunos();
  }, []);

  // Carrega cursos
  useEffect(() => {
    async function recuperaCursos() {
      try {
        const resp = await DBCURSOS.get("/");
        const data = resp.data;
        setCursos(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        addAlert("Erro ao carregar cursos!", "error");
      }
    }
    recuperaCursos();
  }, []);

  // Filtra alunos por curso
  const alunosFiltrados = cursoSelecionado
    ? alunos.filter((a) => a.curso_obj?.id === Number(cursoSelecionado))
    : alunos;

  async function handleSubmit(e) {
    e.preventDefault();

    const mensagens = validaCampos(form, e.target);

    if (mensagens.length > 0) {
      mensagens.forEach((m) =>
        addAlert(m.message, "error", { fieldName: m.fieldName })
      );
      addAlert("Campos obrigatórios não preenchidos.", "warning");
      return;
    }

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
      setSucesso("PEI CENTRAL CRIADO!!!");
      
      window.scrollTo({top: 0, behavior:"smooth"});  

      {/*Contador para exibição da mensagem de sucesso*/}
      setTimeout(() => setSucesso (""), 3000)
      
      setHistorico("");
      setStatus("");
      
      {/*Contador para navegar para a página inicial do pei central após salvar model no banco*/}
      setTimeout(() => navigate("/peicentral"), 3500);
    
    } catch (err) {
      console.error(err);
      window.scrollTo({top: 0, behavior:"smooth"});
      setErro("ERRO! Não foi possível criar Pei Central");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Criar Pei Central</h1>
      <div>
        {sucesso && (
          <div className="text-sucesso">{sucesso}</div>
        )}
        <ErrorMessage message={erro} align="center"/>
        <ErrorMessage message={erroHistorico} align="center"/>
        <ErrorMessage message={erroNecessidadesEducacionaisEspecificas} align="center"/>
        <ErrorMessage message={erroHabilidades} align="center"/>
        
      </div>  
      
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Seleção de Curso */}
        <label>Selecione o Curso</label>
        <br />
        <select
          value={cursoSelecionado}
          onChange={(e) => {
            setCursoSelecionado(e.target.value);
            setForm({ ...form, aluno_id: "" });
            clearFieldAlert("aluno_id");
          }}
        >
          <option value="">-- Selecione --</option>
          {cursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        {/* Autocomplete do Aluno */}
        <label>Selecione o Aluno</label>
        <br />

        <div>
          <label className="block mb-1 font-medium">
            Selecione o Aluno (Busca por Nome/Matrícula)
          </label>

          <BuscaAutoComplete
            onSelectAluno={(alunoId) => {
              setForm({ ...form, aluno_id: alunoId });
            }}
            disabled={!cursoSelecionado}
            clearFieldAlert={clearFieldAlert}
          />

          <FieldAlert fieldName="aluno_id" />

          <input type="hidden" name="aluno_id" value={form.aluno_id} />
        </div>

        {/* Histórico */}
        <div>
          <label className="block mb-1 font-medium">Histórico do Aluno:{erroHistorico &&(<span>⚠️</span>)}</label> 
          <br></br>
          <textarea
            style={{ 
              width: "100%", 
              borderWidth: erroHistorico ? "2px": "1px",
              borderColor: erroHistorico ? "red": "#770404",
            }}
            rows={6}
            name="historico_do_aluno"
            value={form.historico_do_aluno}
            onChange={(e) => {
              setForm({ ...form, historico_do_aluno: e.target.value });
              if (e.target.value.trim()) clearFieldAlert("historico_do_aluno");
            }}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Digite o histórico completo do aluno"
            required
          />
          
        </div>

        {/* preenchimento do campo necessidades_educacionais_especificas */}
        <div>
          <label className="block mb-1 font-medium">Necessidades Educacionais Específicas:{erroNecessidadesEducacionaisEspecificas &&(<span>⚠️</span>)}</label>
          <br></br>
          <textarea
            style={{ 
              width: "100%",
              borderWidth: erroNecessidadesEducacionaisEspecificas ? "2px": "1px",
              borderColor: erroNecessidadesEducacionaisEspecificas ? "red": "#770404",
            }}
            rows={6}
            value={necessidades_educacionais_especificas}
            onChange={(e) => setNecessidades(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Ex: Se o estudante é cego, precisa de Braille..."
          />
        </div>

        {/* preenchimento do campo habilidades */}
        <div>
          <label className="block mb-1 font-medium">Habilidades:{erroHabilidades &&(<span>⚠️</span>)}</label>
          <br></br>
          <textarea
            style={{ 
              width: "100%",
              borderWidth: erroHabilidades ? "2px": "1px",
              borderColor: erroHabilidades ? "red": "#770404",
            }}
            rows={6}
            value={habilidades}
            onChange={(e) => setHabilidades(e.target.value)}
            className="border px-2 py-1 rounded w-full h-32 resize-y"
            placeholder="Conhecimentos, habilidades, interesses..."
          />
        </div>

        {/*preenchimento do campo dificuldades_apresentadas */}

        <div>
          <label className="block mb-1 font-medium">Dificuldades Apresentadas:</label>
          <br></br>
          <textarea
            style={{ width: "100%" }}
            rows={6}
            name="dificuldades_apresentadas"
            value={form.dificuldades_apresentadas}
            onChange={(e) => {
              setForm({ ...form, dificuldades_apresentadas: e.target.value });
              if (e.target.value.trim())
                clearFieldAlert("dificuldades_apresentadas");
            }}
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
