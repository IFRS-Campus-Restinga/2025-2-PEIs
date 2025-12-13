import React, { useEffect, useState, useRef } from "react";
import api from "../../configs/axiosConfig";

export default function Chat() {
  const [usuarios, setUsuarios] = useState([]);
  const [destinatario, setDestinatario] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))?.id;

  const mensagensRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens]);

  // Carregar usuários
  useEffect(() => {
    api.get("/usuarios/").then((res) => {
      setUsuarios(Array.isArray(res.data) ? res.data : res.data.results || []);

    });
  }, []);

  // Carregar mensagens da conversa
  useEffect(() => {
    if (destinatario) {
      api
        .get(`/mensagens/conversa/?com=${destinatario}`)
        .then((res) => setMensagens(res.data));
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
    <div style={styles.container}>
      <h2 style={styles.titulo}>💬 Chat interno</h2>

      {/* Lista de usuários */}
      <select
        onChange={(e) => setDestinatario(Number(e.target.value))}
        value={destinatario || ""}
        style={styles.select}
      >
        <option value="">Selecione alguém</option>
        {usuarios.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username} ({u.email})
          </option>
        ))}
      </select>

      {/* Conversa */}
      <div style={styles.chatBox} ref={mensagensRef}>
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.msgWrapper,
              justifyContent:
                msg.remetente === usuarioLogado ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bolha,
                background:
                  msg.remetente === usuarioLogado ? "#d1f8d1" : "#ececec",
                color: "#333",
              }}
            >
              {msg.corpo}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Digite uma mensagem..."
          style={styles.input}
        />
        <button style={styles.botao} onClick={enviarMensagem}>
          Enviar
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    maxWidth: 800,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },

  titulo: {
    textAlign: "center",
    marginBottom: 10,
  },

  select: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #bbb",
    fontSize: 16,
  },

  chatBox: {
    height: "60vh",
    overflowY: "auto",
    border: "1px solid #ccc",
    padding: 15,
    borderRadius: 10,
    background: "#fafafa",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  msgWrapper: {
    display: "flex",
    width: "100%",
  },

  bolha: {
    maxWidth: "65%",
    padding: "10px 14px",
    borderRadius: 12,
    fontSize: 15,
    lineHeight: 1.4,
  },

  inputArea: {
    display: "flex",
    gap: 10,
  },

  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #aaa",
    fontSize: 16,
  },

  botao: {
    padding: "12px 18px",
    background: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },
};
