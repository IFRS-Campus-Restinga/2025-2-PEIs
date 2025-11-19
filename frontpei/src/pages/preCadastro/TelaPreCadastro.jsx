import { useState, useEffect } from "react";

export default function TelaPreCadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    categoria: "",
  });

  const [mensagem, setMensagem] = useState(null);

  // Carrega os dados do Google salvos no localStorage
  useEffect(() => {
    const data = localStorage.getItem("google_prelogin");
    if (data) {
      const usuario = JSON.parse(data);
      setForm(prev => ({
        ...prev,
        nome: usuario.nome || "",
        email: usuario.email || "",
      }));
    }
  }, []);

  const enviarSolicitacao = async () => {
    if (!form.categoria) {
      setMensagem("Selecione sua categoria antes de enviar.");
      return;
    }

    const resposta = await fetch("http://localhost:8000/api/auth/pre-cadastro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await resposta.json();

    if (resposta.ok) {
      setMensagem("Solicitação enviada com sucesso! Aguarde a aprovação.");
      localStorage.removeItem("google_prelogin");
    } else {
      setMensagem(data.detail || "Erro ao enviar solicitação.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto" }}>
      <h2>Solicitar Acesso ao Sistema</h2>

      <label>Nome</label>
      <input
        type="text"
        value={form.nome}
        disabled
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <label>Email</label>
      <input
        type="text"
        value={form.email}
        disabled
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <label>Quem você é?</label>
      <select
        value={form.categoria}
        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        <option value="">Selecione...</option>
        <option value="PROFESSOR">Professor</option>
        <option value="NAPNE">NAPNE</option>
        <option value="COORDENADOR">Coordenador</option>
        <option value="PEDAGOGO">Pedagogo</option>
        <option value="ADMIN">Admin</option>
      </select>

      <button
        onClick={enviarSolicitacao}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#006400",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Enviar Solicitação
      </button>

      {mensagem && (
        <p style={{ marginTop: "20px", color: "blue" }}>{mensagem}</p>
      )}
    </div>
  );
}
