import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function AtaDeAcompanhamento() {
  const DBATA = axios.create({
    baseURL: import.meta.env.VITE_ATA_ACOMPANHAMENTO, // coloque a URL da sua API no .env
  });

  // Formulário
  const [form, setForm] = useState({
    dataReuniao: "",
    participantes: "",
    descricao: "",
    ator: "",
  });

  const [atasCadastradas, setAtasCadastradas] = useState([]);

  // Recupera atas
  async function recuperaAtas() {
    try {
      const response = await DBATA.get("/");
      const data = response.data;
      setAtasCadastradas(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar atas: ", err);
    }
  }

  // Adiciona nova ata
  async function adicionaAta(event) {
    event.preventDefault();

    if (!form.dataReuniao || !form.participantes || !form.descricao || !form.ator) {
      alert("Preencha todos os campos antes de cadastrar!");
      return;
    }

    try {
      await DBATA.post("/", {
        dataReuniao: new Date(form.dataReuniao).toISOString(), // ✅ acessa via form
        participantes: form.participantes,
        descricao: form.descricao,
        ator: form.ator,
      });
      alert("Ata criada com sucesso!");
      setForm({ dataReuniao: "", participantes: "", descricao: "", ator: "" }); // limpa formulário
      recuperaAtas(); // recarregar lista
    } catch (err) {
      console.error("Erro ao criar ata:", err.response?.data || err);
      alert("Falha ao cadastrar ata de acompanhamento!");
    }
  }

  useEffect(() => {
    recuperaAtas();
  }, []);

  return (
    <>
      <h1>Gerenciar Atas de Acompanhamento</h1>
      <h2>Cadastrar Ata</h2>

      <form onSubmit={adicionaAta}>
        <label>Data da Reunião:</label>
        <br />
        <input
          type="datetime-local"
          value={form.dataReuniao}
          onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })}
          required
        />
        <br />

        <label>Participantes:</label>
        <br />
        <input
          type="text"
          value={form.participantes}
          onChange={(e) => setForm({ ...form, participantes: e.target.value })}
        />
        <br />

        <label>Descrição:</label>
        <br />
        <input
          type="text"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
        <br />

        <label>Ator:</label>
        <br />
        <input
          type="text"
          value={form.ator}
          onChange={(e) => setForm({ ...form, ator: e.target.value })}
        />
        <br />

        <button type="submit">Adicionar Ata</button>
      </form>

      <div>
        <h3>Atas Cadastradas</h3>
        <ul>
          {atasCadastradas.length === 0 && <li>Nenhuma ata cadastrada.</li>}
          {atasCadastradas.map((a) => (
            <li key={a.id || Math.random()}>
              <strong>Data:</strong> {new Date(a.dataReuniao).toLocaleString()} <br />
              <strong>Participantes:</strong> {a.participantes} <br />
              <strong>Descrição:</strong> {a.descricao} <br />
              <strong>Ator:</strong> {a.ator}
            </li>
          ))}
        </ul>
      </div>

      <button>
        <Link to="/">Voltar</Link>
      </button>
    </>
  );
}

export default AtaDeAcompanhamento;
