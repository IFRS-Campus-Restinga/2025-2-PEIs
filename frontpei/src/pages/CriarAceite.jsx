import { useState } from "react";
import "../../src/cssGlobal.css";

export default function CriarAceite() {
  const [destino, setDestino] = useState("");
  const [objetoUrl, setObjetoUrl] = useState("");
  const [assunto, setAssunto] = useState("");
  const [extra, setExtra] = useState("");
  const [mensagem, setMensagem] = useState("");

  const CREATE_URL = "http://localhost:8000/services/aceite/create/";

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem("Enviando...");
    let extraObj = {};
    try {
      if (extra && extra.trim()) extraObj = JSON.parse(extra);
    } catch (err) {
      setMensagem("Campo 'extra' deve ser um JSON válido.");
      return;
    }

    try {
      const resp = await fetch(CREATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-BACKEND-TOKEN": (import.meta.env.VITE_BACKEND_TOKEN || "")
        },
        body: JSON.stringify({
          destino,
          objeto_url: objetoUrl,
          assunto,
          extra: extraObj
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMensagem("Erro: " + (data.erro || JSON.stringify(data)));
      } else {
        setMensagem("OK: " + (data.mensagem || "Email enviado com sucesso."));
        setDestino("");
        setObjetoUrl("");
        setAssunto("");
        setExtra("");
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao conectar com backend: " + err.toString());
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Criar Pedido de Aceite</h2>
      <form onSubmit={handleSubmit}>
        <label>Destino (email):</label>
        <input type="email" value={destino} onChange={(e) => setDestino(e.target.value)} required />

        <label>Objeto URL (ex: http://localhost:8000/services/parecer/6/):</label>
        <input type="text" value={objetoUrl} onChange={(e) => setObjetoUrl(e.target.value)} required />

        <label>Assunto do e-mail (opcional):</label>
        <input type="text" value={assunto} onChange={(e) => setAssunto(e.target.value)} />

        <label>Extra (JSON, opcional):</label>
        <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder='{"referencia":"Parecer #6"}' />

        <div style={{ marginTop: 10 }}>
          <button type="submit">Criar e Enviar Pedido</button>
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        <strong>Status:</strong>
        <div>{mensagem}</div>
      </div>
    </div>
  );
}