import { useEffect, useState } from "react";
import axios from "axios";

// Base da API
const DB_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/services/";

// Configuração das tabelas
const tabelas = {
  pessoa: { endpoint: "pessoa/", campos: ["nome", "categoria"] },
  curso: { endpoint: "curso/", campos: ["nome", "nivel"], choices: { nivel: ["MEDIO", "SUPERIOR", "TECNICO"] } },
  disciplina: { endpoint: "disciplina/", campos: ["nome", "cursos"] },
  componenteCurricular: { endpoint: "componenteCurricular/", campos: ["objetivos", "conteudo_prog", "metodologia", "cursos", "disciplinas"] },
  documentacaoComplementar: { endpoint: "documentacaoComplementar/", campos: ["autor", "tipo", "caminho"] }
};

function Crud() {
  const [dados, setDados] = useState({});
  const [erroBanco, setErroBanco] = useState(false);
  const [tabelaSelecionada, setTabelaSelecionada] = useState("pessoa");

  // Formulários dinâmicos
  const [form, setForm] = useState({
    pessoa: { nome: "", categoria: 1 },
    curso: { nome: "", nivel: "MEDIO" },
    disciplina: { nome: "", cursos: [] },
    componenteCurricular: { objetivos: "", conteudo_prog: "", metodologia: "", cursos: [], disciplinas: [] },
    documentacaoComplementar: { autor: "", tipo: "", caminho: "" }
  });

  // ------------------------------------------------------------
  async function recuperaTabela(tabela) {
    try {
      const resposta = await axios.get(`${DB_BASE}${tabelas[tabela].endpoint}`);
      setDados(prev => ({ ...prev, [tabela]: resposta.data }));
      setErroBanco(false);
    } catch (erro) {
      console.error(`Erro ao buscar ${tabela}:`, erro);
      setErroBanco(true);
    }
  }

  // ------------------------------------------------------------
  async function adicionaRegistro(event) {
    event.preventDefault();
    const novo = { ...form[tabelaSelecionada] };

    try {
      await axios.post(`${DB_BASE}${tabelas[tabelaSelecionada].endpoint}`, novo);
      await recuperaTabela(tabelaSelecionada);
      // limpa o formulário
      setForm(prev => ({
        ...prev,
        [tabelaSelecionada]: Object.fromEntries(
          Object.keys(prev[tabelaSelecionada]).map(k =>
            [k, Array.isArray(prev[tabelaSelecionada][k]) ? [] : (k === "categoria" ? 1 : (k === "nivel" ? "MEDIO" : ""))]
          )
        )
      }));
      setErroBanco(false);
    } catch (erro) {
      console.error(`Erro ao criar ${tabelaSelecionada}:`, erro);
      setErroBanco(true);
      alert(`Falha ao cadastrar ${tabelaSelecionada}!`);
    }
  }

  // ------------------------------------------------------------
  useEffect(() => {
    recuperaTabela(tabelaSelecionada);
    // Para popular selects de ManyToMany
    if (["disciplina", "componenteCurricular"].includes(tabelaSelecionada)) {
      recuperaTabela("curso");
      recuperaTabela("disciplina");
    }
  }, [tabelaSelecionada]);

  // ------------------------------------------------------------
  return (
    <>

    <img src='./src/assets/logo.png' style={{ height: 225, width: 150 }} />
    <h1>Prova de Conceito do PEI</h1>

      <h1>CRUD Dinâmico PEI</h1>

      {/* Botões de seleção */}
      <div>
        {Object.keys(tabelas).map(tab => (
          <button
            key={tab}
            onClick={() => setTabelaSelecionada(tab)}
            style={{ margin: "0 5px", fontWeight: tabelaSelecionada === tab ? "bold" : "normal" }}
          >
            {tab}
          </button>
        ))}
      </div>

      <hr />
      <h2>Adicionar {tabelaSelecionada}</h2>
      <form onSubmit={adicionaRegistro}>
        {tabelas[tabelaSelecionada].campos.map(campo => (
          <div key={campo} style={{ marginBottom: 10 }}>
            <label>{campo}:</label><br />
            {/* Se campo tiver choices */}
            {tabelas[tabelaSelecionada].choices?.[campo] ? (
              <select
                value={form[tabelaSelecionada][campo]}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    [tabelaSelecionada]: { ...prev[tabelaSelecionada], [campo]: e.target.value }
                  }))
                }
              >
                {tabelas[tabelaSelecionada].choices[campo].map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : Array.isArray(form[tabelaSelecionada][campo]) ? (
              // ManyToMany selects
              <select
                multiple
                value={form[tabelaSelecionada][campo]}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                  setForm(prev => ({
                    ...prev,
                    [tabelaSelecionada]: { ...prev[tabelaSelecionada], [campo]: selected }
                  }));
                }}
              >
                {(campo === "cursos" ? dados.curso : dados.disciplina)?.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form[tabelaSelecionada][campo]}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    [tabelaSelecionada]: { ...prev[tabelaSelecionada], [campo]: e.target.value }
                  }))
                }
              />
            )}
          </div>
        ))}
        <button type="submit">Adicionar</button>
      </form>

      <hr />
      <h2>Dados cadastrados ({tabelaSelecionada})</h2>
      {erroBanco ? (
        <p>Não foi possível acessar o backend do Django...</p>
      ) : (
        <div>
          {dados[tabelaSelecionada]?.map((item, idx) => (
            <div key={idx}>
              {Object.entries(item).map(([k, v]) => (
                <span key={k} style={{ marginRight: 10 }}>
                  <b>{k}:</b> {Array.isArray(v) ? v.join(", ") : v.toString()}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Crud;
