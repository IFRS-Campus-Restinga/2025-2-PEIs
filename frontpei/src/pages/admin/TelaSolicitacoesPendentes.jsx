import { useEffect, useState } from "react";

export default function TelaSolicitacoesPendentes() {
  const [solicitacoes, setSolicitacoes] = useState([]);

  const token = localStorage.getItem("token");

  async function carregar() {
    const resp = await fetch("http://localhost:8080/api/auth/solicitacoes/pendentes/", {
      headers: { "Authorization": `Token ${token}` }
    });
    const data = await resp.json();
    setSolicitacoes(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aprovar(id) {
    await fetch("http://localhost:8080/api/auth/solicitacoes/aprovar/", {
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
    await fetch("http://localhost:8080/api/auth/solicitacoes/rejeitar/", {
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
    <div style={{ padding: "2rem" }}>
      <h1>Solicitações Pendentes</h1>

      {solicitacoes.length === 0 && <p>Nenhuma solicitação pendente.</p>}

      {solicitacoes.map((s) => (
        <div key={s.id} style={{ 
          border: "1px solid #ccc",
          padding: "10px",
          marginTop: "10px",
          borderRadius: "6px"
        }}>
          <p><strong>Nome:</strong> {s.nome}</p>
          <p><strong>Email:</strong> {s.email}</p>
          <p><strong>Categoria solicitada:</strong> {s.categoria_solicitada}</p>

          <button onClick={() => aprovar(s.id)} style={{ marginRight: "10px" }}>
            Aprovar
          </button>
          <button onClick={() => rejeitar(s.id)} style={{ color: "red" }}>
            Rejeitar
          </button>
        </div>
      ))}
    </div>
  );
}
