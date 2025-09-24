import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


function DocumentacaoComplementar() {
  const DBDOC = axios.create({
    baseURL: import.meta.env.VITE_DOC_COMPLEMENTAR, // defina no seu .env
  });

  // Estado do formulário de adicionar
  const [form, setForm] = useState({
    autor: "",
    tipo: "",
    caminho: "",
  });

  const [docs, setDocs] = useState([]);
  const [editando, setEditando] = useState(null); // id que está em edição
  const [formEdit, setFormEdit] = useState({
    autor: "",
    tipo: "",
    caminho: "",
  });

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

  // Editar documento (abrir form inline)
  function editarDoc(doc) {
    setEditando(doc.id);
    setFormEdit({
      autor: doc.autor,
      tipo: doc.tipo,
      caminho: doc.caminho,
    });
  }

  // Salvar edição
  async function salvarEdicao(event) {
    event.preventDefault();
    try {
      await DBDOC.put(`/${editando}/`, formEdit);
      alert("Documentação atualizada!");
      setEditando(null);
      recuperaDocs();
    } catch (err) {
      console.error("Erro ao editar documentação:", err.response?.data || err);
      alert("Falha ao editar documentação!");
    }
  }

  // Deletar documento
  async function deletarDoc(id) {
    if (!window.confirm("Deseja realmente excluir esta documentação?")) return;
    try {
      await DBDOC.delete(`/${id}/`);
      alert("Documentação excluída!");
      recuperaDocs();
    } catch (err) {
      console.error("Erro ao excluir documentação:", err.response?.data || err);
      alert("Falha ao excluir documentação!");
    }
  }

  useEffect(() => {
    recuperaDocs();
  }, []);

  return (
    <>
      <h1>Gerenciar Documentação Complementar</h1>
      <h2>Cadastrar Documentação</h2>

      {/* Formulário principal (apenas para adicionar) */}
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
              {editando === d.id ? (
                // Formulário inline de edição
                <form onSubmit={salvarEdicao}>
                  <label>Autor:</label>
                  <input
                    type="text"
                    value={formEdit.autor}
                    onChange={(e) => setFormEdit({ ...formEdit, autor: e.target.value })}
                  />
                  <br />

                  <label>Tipo:</label>
                  <input
                    type="text"
                    value={formEdit.tipo}
                    onChange={(e) => setFormEdit({ ...formEdit, tipo: e.target.value })}
                  />
                  <br />

                  <label>Caminho:</label>
                  <input
                    type="text"
                    value={formEdit.caminho}
                    onChange={(e) => setFormEdit({ ...formEdit, caminho: e.target.value })}
                  />
                  <br />

                  <button type="submit">Salvar</button>
                  <button type="button" onClick={() => setEditando(null)}>
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <strong>Autor:</strong> {d.autor} <br />
                  <strong>Tipo:</strong> {d.tipo} <br />
                  <strong>Caminho:</strong> {d.caminho}
                  <br />
                  <button onClick={() => editarDoc(d)}>Editar</button>
                  <button onClick={() => deletarDoc(d.id)}>Excluir</button>
                </>
              )}
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
