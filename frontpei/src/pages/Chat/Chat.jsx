import React, { useEffect, useState, useRef } from "react";
import api from "../../configs/axiosConfig";
import "./chat.css"; // agora usamos estilos da folha externa

export default function Chat() {
  const [usuarios, setUsuarios] = useState([]);
  const [destinatario, setDestinatario] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))?.id;

  const mensagensRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens]);

  // Carregar lista de usuários
  useEffect(() => {
    api
      .get("/usuarios/")
      .then((res) => {
        let data = res.data;

        // Trata paginação DRF
        if (!Array.isArray(data)) {
          data = data.results || [];
        }

        if (!Array.isArray(data)) {
          setErro("Erro ao carregar usuários.");
          return;
        }

        setUsuarios(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuários:", err);
        setErro("Não foi possível carregar os usuários.");
      });
  }, []);

  // Carregar mensagens da conversa
  useEffect(() => {
    if (destinatario) {
      api
        .get(`/mensagens/conversa/?com=${destinatario}`)
        .then((res) => {
          setMensagens(res.data);
        })
        .catch((err) => {
          console.error("Erro ao carregar mensagens:", err);
        });
    }
  }, [destinatario]);

  const enviarMensagem = async () => {
    if (!texto.trim()) return;

    await api.post("/mensagens/", {
      remetente: usuarioLogado,
      destinatario: Number(destinatario),
      corpo: texto,
    });

    setTexto("");

    const res = await api.get(`/mensagens/conversa/?com=${destinatario}`);
    setMensagens(res.data);
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">💬 Chat interno</h2>

      {erro && <p className="chat-error">{erro}</p>}

      <select
        onChange={(e) => setDestinatario(Number(e.target.value))}
        value={destinatario || ""}
        className="chat-select"
      >
        <option value="">Selecione alguém</option>

        {usuarios.length === 0 && (
          <option disabled>Nenhum usuário encontrado</option>
        )}

        {usuarios.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username} ({u.email})
          </option>
        ))}
      </select>

      <div className="chat-messages" ref={mensagensRef}>
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={`chat-msg-wrapper ${
              msg.remetente === usuarioLogado ? "me" : "them"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg.remetente === usuarioLogado ? "mine" : "other"
              }`}
            >
              {msg.corpo}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
          placeholder="Digite uma mensagem..."
          className="chat-input"
        />

        <button className="chat-send-btn" onClick={enviarMensagem}>
          Enviar
        </button>
      </div>
    </div>
  );
}
