import { useState, useEffect } from "react";
import "../../cssGlobal.css"; 

export default function TelaPreCadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    categoria: "",
  });

  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    // A lógica de carregamento dos dados do Google
    const data = localStorage.getItem("google_prelogin");
    if (!data) return;

    try {
      const usuario = JSON.parse(data);
      setForm(prev => ({
        ...prev,
        nome: usuario.nome || "",
        email: usuario.email || "",
      }));
    } catch (e) {
      console.log("❌ Erro ao parsear JSON do localStorage:", e);
    }
  }, []);

  const enviarSolicitacao = async () => {
    setMensagem(null);

    if (!form.categoria) {
      setMensagem("Selecione sua categoria antes de enviar.");
      return;
    }

    const payload = {
      email: form.email,
      name: form.nome,
      picture: "", 
      categoria_solicitada: form.categoria
    };

    try {
      // Endpoint de pré-cadastro (auth_app/views.py)
      const resposta = await fetch("http://localhost:8000/api/auth/pre-cadastro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await resposta.json();

      if (resposta.ok) {
        setMensagem("Solicitação enviada com sucesso! Aguarde a aprovação.");
        localStorage.removeItem("google_prelogin");
        // Redireciona para a tela de aguardando (se o useNavigate estivesse importado)
        // navigate('/aguardando-aprovacao'); 
      } else {
        setMensagem(data?.detail || "Erro ao enviar solicitação.");
      }

    } catch (error) {
      setMensagem("Erro de rede. Verifique o backend.");
    }
  };

  return (
    <div className="container-padrao" style={{ marginTop: '80px', padding: '40px' }}> 
      <h1 style={{ textAlign: "center", color: "#055C0F" }}>Solicitar Acesso ao Sistema</h1>
        
      <form className="form-padrao" onSubmit={(e) => { e.preventDefault(); enviarSolicitacao(); }}>
        {/* CAMPOS APENAS LEITURA */}
        <div>
          <label>Nome:</label>
          {/* Adicionando disabled no form-padrao já dá um estilo acinzentado */}
          <input type="text" value={form.nome} disabled /> 
        </div>

        <div>
          <label>Email:</label>
          <input type="text" value={form.email} disabled />
        </div>

        {/* CAMPO DE SELEÇÃO */}
        <div>
          <label>Quem você é? <span style={{color: 'red'}}>*</span></label>
          <select
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            name="categoria"
          >
            <option value="">-- Selecione sua função --</option>
            <option value="PROFESSOR">Professor</option>
            <option value="NAPNE">NAPNE</option>
            <option value="COORDENADOR">Coordenador</option>
            <option value="PEDAGOGO">Pedagogo</option>
            <option value="Admin">Administrador (Apenas para Devs)</option>
          </select>
        </div>

        {/* FEEDBACK DA MENSAGEM */}
        {mensagem && (
          // Usando as classes de alerta padrão
          <p className={mensagem.includes("Erro") || mensagem.includes("Selecione") ? "alert error" : "alert info"} style={{textAlign: 'center'}}>
            {mensagem}
          </p>
        )}
        
        {/* BOTÃO */}
        <button
          type="submit"
          className="submit-btn"
          style={{ marginTop: "10px" }}
        >
          Enviar Solicitação
        </button>
      </form>
      
    </div>
  );
}