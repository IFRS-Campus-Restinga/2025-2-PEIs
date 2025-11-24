import { useState, useEffect } from "react";

export default function TelaPreCadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    categoria: "",
  });

  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    console.log("🔍 Carregando dados do Google do localStorage...");
    const data = localStorage.getItem("google_prelogin");

    if (!data) {
      console.log("⚠️ Nenhum dado encontrado no localStorage.");
      return;
    }

    try {
      const usuario = JSON.parse(data);
      console.log("📦 Dados brutos do Google:", usuario);

      setForm(prev => ({
        ...prev,
        nome: usuario.nome || "",
        email: usuario.email || "",
      }));

      console.log("📄 Form atualizado:", {
        ...form,
        nome: usuario.nome,
        email: usuario.email
      });

    } catch (e) {
      console.log("❌ Erro ao parsear JSON do localStorage:", e);
    }
  }, []);

  const enviarSolicitacao = async () => {
    console.log("🚀 Enviando solicitação com os dados:", form);

    if (!form.categoria) {
      console.log("❌ Categoria não selecionada.");
      setMensagem("Selecione sua categoria antes de enviar.");
      return;
    }

    const payload = {
      email: form.email,
      name: form.nome,
      picture: "",
      categoria_solicitada: form.categoria
    };

    console.log("📤 Payload REAL enviado ao backend:", payload);

    try {
      const resposta = await fetch("http://localhost:8080/api/auth/pre-cadastro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("📥 Status da resposta:", resposta.status);

      let data = null;

      try {
        data = await resposta.json();
        console.log("📥 Corpo da resposta do backend:", data);
      } catch (e) {
        console.log("⚠️ Não foi possível interpretar JSON da resposta:", e);
      }

      if (resposta.ok) {
        console.log("✅ Solicitação enviada com sucesso.");
        setMensagem("Solicitação enviada com sucesso! Aguarde a aprovação.");
        localStorage.removeItem("google_prelogin");
      } else {
        console.log("❌ Backend retornou erro:", data);
        setMensagem(data?.detail || "Erro ao enviar solicitação.");
      }

    } catch (error) {
      console.log("🔥 ERRO DE REDE AO ENVIAR SOLICITAÇÃO:", error);
      setMensagem("Erro de rede. Verifique o backend.");
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
        onChange={(e) => {
          console.log("✏️ Categoria alterada:", e.target.value);
          setForm({ ...form, categoria: e.target.value });
        }}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        <option value="">Selecione...</option>
        <option value="PROFESSOR">Professor</option>
        <option value="NAPNE">NAPNE</option>
        <option value="COORDENADOR">Coordenador</option>
        <option value="PEDAGOGO">Pedagogo</option>
        <option value="Admin">Admin</option>
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
