import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function DocumentacaoComplementar() {
  const DBDOC = axios.create({
    baseURL: import.meta.env.VITE_DOC_COMPLEMENTAR, // defina no seu .env
  });

  // Estado do formulário
  const [form, setForm] = useState({
    autor: "",
    tipo: "",
    caminho: "",
  });

  const [docs, setDocs] = useState([]);

  // Recuperar documentação cadastrada
  async function recuperaDocs() {
    try {
      const response = await DBDOC.get("/");
      const data = response.data;
      setDocs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar documentação: ", err);
    }
  }

  // Adicionar nova documentação
  async function adicionaDoc(event) {
    event.preventDefault();

    if (!form.autor || !form.tipo || !form.caminho) {
      alert("Preencha todos os campos antes de cadastrar!");
      return;
    }

    try {
      await DBDOC.post("/", {
        autor: form.autor,
        tipo: form.tipo,
        caminho: form.caminho,
      });
      alert("Documentação cadastrada com sucesso!");
      setForm({ autor: "", tipo: "", caminho: "" }); // limpa form
      recuperaDocs();
    } catch (err) {
      console.error("Erro ao cadastrar documentação:", err.response?.data || err);
      alert("Falha ao cadastrar documentação!");
    }
  }

  useEffect(() => {
    recuperaDocs();
  }, []);

  return (
    <>
      <h1>Gerenciar Documentação Complementar</h1>
      <h2>Cadastrar Documentação</h2>

      <form onSubmit={adicionaDoc}>
        <label>Autor:</label>
        <br />
        <input
          type="text"
          value={form.autor}
          onChange={(e) => setForm({ ...form, autor: e.target.value })}
          required
        />
        <br />

        <label>Tipo:</label>
        <br />
        <input
          type="text"
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          required
        />
        <br />

        <label>Caminho:</label>
        <br />
        <input
          type="text"
          value={form.caminho}
          onChange={(e) => setForm({ ...form, caminho: e.target.value })}
          required
        />
        <br />

        <button type="submit">Adicionar Documentação</button>
      </form>

      <div>
        <h3>Documentações Cadastradas</h3>
        <ul>
          {docs.length === 0 && <li>Nenhuma documentação cadastrada.</li>}
          {docs.map((d) => (
            <li key={d.id || Math.random()}>
              <strong>Autor:</strong> {d.autor} <br />
              <strong>Tipo:</strong> {d.tipo} <br />
              <strong>Caminho:</strong> {d.caminho}
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

export default DocumentacaoComplementar;
