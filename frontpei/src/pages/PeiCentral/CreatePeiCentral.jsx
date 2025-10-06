import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/errorMessage/ErrorMessage.jsx";
import "../../components/errorMessage/ErrorMessage.css"


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
  //constantes de validação dos campos no front
  const [erroHistorico, setErroHistorico] = useState("");
  const [erroNecessidadesEducacionaisEspecificas, setErroNecessidadesEducadionaisEspecificas] = useState("")
  const [erroHabilidades, setErroHabilidades] = useState("");
  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setErroHistorico("");
    setErroNecessidadesEducadionaisEspecificas("");
    setErroHabilidades("");

    //Validação campo histórico
    if(historico_do_aluno.trim().length < 200){
      setErroHistorico("!A descrição do Histórico do Aluno deve conter pelo menos duzentos (200) caracteres!")
      
    }
    //Validação do campo necessidades
    if(necessidades_educacionais_especificas.trim().length < 50){
      setErroNecessidadesEducadionaisEspecificas("!A descrição para as Necessidades Educacionais do Aluno devem conter ao menos cinquenta (50) caracteres!")
    }
    //Validação do campo habilidades
    if(habilidades.trim().length < 50){
      setErroHabilidades("!A descrição para as Habilidades do Aluno devem conter ao menos cinquenta (50) caracteres !")
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
        {/* Campo de preenchimento de historico_do_aluno */}
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
            value={historico_do_aluno}
            onChange={(e) => setHistorico(e.target.value)}
            className="px-2 py-1 rounded w-full h-32 resize-y" 
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
            placeholder="Detalhar as condições do estudante o que ele necessita. Ex: Se o estudante é cego: sua condição é: cegueira. Precisa de: Braille, Leitor de telas..."
            required
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
