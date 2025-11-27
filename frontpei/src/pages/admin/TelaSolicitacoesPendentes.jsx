import { useEffect, useState } from "react";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";

export default function TelaSolicitacoesPendentes() {
  const [solicitacoes, setSolicitacoes] = useState([]);

  // Endpoint base para as ações do Admin (Aprovar/Rejeitar)
  const ADMIN_API_BASE = "http://localhost:8000/api/auth/solicitacoes/"; 
  const token = localStorage.getItem("token");

  async function carregar() {
    try {
      // Endpoint para listar pendentes
      const resp = await fetch(ADMIN_API_BASE + "pendentes/", {
        headers: { "Authorization": `Token ${token}` }
      });
      // Adicionando uma pequena checagem para evitar problemas de autenticação
      if (resp.status === 401 || resp.status === 403) {
        throw new Error("Não autorizado. Verifique se você está logado como Admin.");
      }
      const data = await resp.json();
      setSolicitacoes(data);
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
      // Em uma aplicação real, você usaria o useAlert() aqui
      // mas mantemos simples para não introduzir o hook aqui
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aprovar(id) {
    await fetch(ADMIN_API_BASE + "aprovar/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`
      },
      body: JSON.stringify({ id })
    });
    carregar();
  }

  async function rejeitar(id) {
    await fetch(ADMIN_API_BASE + "rejeitar/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`
      },
      body: JSON.stringify({ id })
    });
    carregar();
  }

  return (
    // Utiliza 'container-padrao' para o layout base de tela (fundo branco, centralizado)
    <div className="container-padrao"> 
      <h1>Solicitações Pendentes</h1>

      {solicitacoes.length === 0 && <p className="list-padrao">Nenhuma solicitação pendente.</p>}

      {/* Utiliza 'list-padrao' e 'componente-item' para a estrutura de lista e card */}
      <div className="list-padrao">
        <ul>
          {solicitacoes.map((s) => (
            <li key={s.id} className="componente-item">
              <div className="componente-detalhe">
                <p><strong>Nome:</strong> {s.nome}</p>
                <p><strong>Email:</strong> {s.email}</p>
                <p><strong>Categoria solicitada:</strong> {s.categoria_solicitada}</p>
              </div>

              {/* Alinha os botões à esquerda com classes do cssGlobal */}
              <div className="posicao-buttons esquerda"> 
                <button 
                  className="btn-salvar" // Botão verde para aprovação
                  onClick={() => aprovar(s.id)} 
                  style={{ marginTop: "0" }} // Ajuste de margem
                >
                  Aprovar
                </button>
                <button 
                  className="botao-deletar" // Botão vermelho para rejeição
                  onClick={() => rejeitar(s.id)} 
                  style={{ marginTop: "0" }} // Ajuste de margem
                >
                  Rejeitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <BotaoVoltar />
    </div>
  );
}