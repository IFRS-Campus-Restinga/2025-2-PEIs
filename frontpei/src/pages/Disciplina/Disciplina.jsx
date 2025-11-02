import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BotaoEditar from "../../components/customButtons/botaoEditar";
import BotaoDeletar from "../../components/customButtons/botaoDeletar";
import axios from "axios";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";

export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [erro, setErro] = useState(false);

  const DBDISCIPLINAS = axios.create({ baseURL: import.meta.env.VITE_DISCIPLINAS_URL });

  async function carregarDisciplinas() {
    try {
      const resposta = await DBDISCIPLINAS.get("/");
      setDisciplinas(Array.isArray(resposta.data) ? resposta.data : resposta.data.results || []);
      setErro(false);
    } catch (err) {
      console.error("Erro ao buscar disciplinas:", err);
      setErro(true);
    }
  }

  useEffect(() => {
    carregarDisciplinas();
  }, []);

  return (
    <div className="disciplinas-container">
      <h1>Disciplinas</h1>

      {/* Botão criar nova disciplina */}
      <div className="disciplinas-form">
        <Link to="/disciplinasCadastrar">
          <button className="submit-btn">Criar nova disciplina</button>
        </Link>
      </div>

      {/* Mensagem de erro */}
      {erro ? (
        <p style={{ color: "red", textAlign: "center" }}>
          Não foi possível carregar as disciplinas.
        </p>
      ) : (
        <div className="disciplinas-list">
          <ul>
            {disciplinas.map((d) => (
              <li key={d.id}>
                <span><b>{d.nome}</b></span>
                <div className="curso-buttons">
                  <BotaoEditar id={d.id} rotaEdicao="/disciplinaEditar" />
                  <BotaoDeletar 
                    id={d.id} 
                    axiosInstance={DBDISCIPLINAS} 
                    onDeletarSucesso={carregarDisciplinas} 
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botão voltar */}
      <BotaoVoltar/>
    </div>
  );
}
