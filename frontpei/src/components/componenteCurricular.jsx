import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ComponenteCurricular() {
  const DBCOMPONENTECURRICULAR = axios.create({
    baseURL: import.meta.env.VITE_COMPONENTE_CURRICULAR,
  });

  const DISCIPLINAS_API = import.meta.env.VITE_DISCIPLINAS_URL;

  // Formulário do componente curricular
  const [form, setForm] = useState({
    objetivos: "",
    conteudo_prog: "",
    metodologia: "",
    disciplinaId: "", // ID da disciplina selecionada
  });

  const [componenteCurricularCadastrado, setComponenteCurricularCadastrado] = useState([]);
  const [disciplinasCadastradas, setDisciplinasCadastradas] = useState([]);

  // Recupera componentes curriculares
  async function recuperaComponenteCurricular() {
    try {
      const response = await DBCOMPONENTECURRICULAR.get("/");
      const data = response.data;
      setComponenteCurricularCadastrado(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar componente curricular: ", err);
    }
  }

  // Recupera disciplinas
  async function recuperaDisciplinas() {
    try {
      const response = await axios.get(DISCIPLINAS_API);
      const data = response.data;
      setDisciplinasCadastradas(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar disciplinas: ", err);
    }
  }

  // Adiciona novo componente curricular
  async function adicionaComponenteCurricular(event) {
    event.preventDefault();

    if (!form.objetivos || !form.conteudo_prog || !form.metodologia || !form.disciplinaId) {
      alert("Preencha todos os campos antes de cadastrar!");
      return;
    }

    try {
      await DBCOMPONENTECURRICULAR.post("/", {
        objetivos: form.objetivos,
        conteudo_prog: form.conteudo_prog,
        metodologia: form.metodologia,
        disciplinas: Number(form.disciplinaId), // enviar apenas a PK
      });

      await recuperaComponenteCurricular();
      setForm({ objetivos: "", conteudo_prog: "", metodologia: "", disciplinaId: "" });
    } catch (err) {
      console.error("Erro ao criar componente curricular:", err.response?.data || err);
      alert("Falha ao cadastrar componente curricular!");
    }
  }

  useEffect(() => {
    recuperaComponenteCurricular();
    recuperaDisciplinas();
  }, []);

  return (
    <>
      <h1>Gerenciar Componentes Curriculares</h1>
      <h2>Cadastrar Componentes Curriculares</h2>

      <form onSubmit={adicionaComponenteCurricular}>
        <label>Objetivos:</label>
        <br />
        <input
          type="text"
          value={form.objetivos}
          onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
        />
        <br />

        <label>Conteúdo Programático:</label>
        <br />
        <input
          type="text"
          value={form.conteudo_prog}
          onChange={(e) => setForm({ ...form, conteudo_prog: e.target.value })}
        />
        <br />

        <label>Metodologia:</label>
        <br />
        <textarea
          value={form.metodologia}
          onChange={(e) => setForm({ ...form, metodologia: e.target.value })}
        />
        <br />

        <label>Disciplina:</label>
        <br />
        <select
          value={form.disciplinaId}
          onChange={(e) => setForm({ ...form, disciplinaId: e.target.value })}
        >
          <option value="">Selecione uma disciplina</option>
          {disciplinasCadastradas.map((disc) => (
            <option key={disc.id} value={disc.id}>
              {disc.nome}
            </option>
          ))}
        </select>
        <br />

        <button type="submit">Adicionar componente curricular</button>
      </form>

      <div>
        <h3>Componentes Curriculares Cadastrados</h3>
        <ul>
          {componenteCurricularCadastrado.length === 0 && <li>Nenhum componente cadastrado.</li>}
          {componenteCurricularCadastrado.map((d) => (
            <li key={d.id || Math.random()}>
              <strong>Objetivos:</strong> {d.objetivos || "-"} <br />
              <strong>Conteúdo:</strong> {d.conteudo_prog || "-"} <br />
              <strong>Metodologia:</strong> {d.metodologia || "-"} <br />
              <strong>Disciplina:</strong> {d.disciplinas?.nome || d.disciplinas || "-"}
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

export default ComponenteCurricular;
