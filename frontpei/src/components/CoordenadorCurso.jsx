import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function CoordenadoresCurso() {
  const DBCOORDENADORES = axios.create({ baseURL: import.meta.env.VITE_COORDENADORCURSO_URL });

  const [coordenador, setCoordenador] = useState({
    nome: "",
  });

  const [coordenadoresCadastrados, setCoordenadoresCadastrados] = useState([]);

  async function recuperaCoordenadores() {
    try {
      const response = await DBCOORDENADORES.get("/");
      const data = response.data;
      setCoordenadoresCadastrados(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar coordenadores: ", err);
    }
  }

  async function adicionaCoordenador(event) {
    event.preventDefault();
    const { nome } = coordenador;

    if (!nome.trim()) {
      alert("Preencha o nome corretamente.");
      return;
    }

    try {
      await DBCOORDENADORES.post("/", { nome });
      await recuperaCoordenadores();
      setCoordenador({ nome: "" });
    } catch (err) {
      console.error("Erro ao cadastrar coordenador:", err);
      alert("Falha ao cadastrar coordenador!");
    }
  }

  async function excluirCoordenador(id) {
    try {
      await DBCOORDENADORES.delete(`/${id}/`);
      await recuperaCoordenadores();
    } catch (err) {
      console.error("Erro ao excluir coordenador:", err);
      alert("Falha ao excluir coordenador!");
    }
  }

  useEffect(() => {
    recuperaCoordenadores();
  }, []);

  return (
    <>
      <h1>Gerenciar Coordenadores de Curso</h1>
      <h2>Cadastrar coordenador</h2>

      <form onSubmit={adicionaCoordenador}>
        <label>Nome:</label>
        <br />
        <input
          type="text"
          value={coordenador.nome}
          onChange={(e) => setCoordenador({ ...coordenador, nome: e.target.value })}
        />
        <br />

        <button type="submit">Adicionar coordenador</button>
      </form>

      <div>
        <h3>Coordenadores Cadastrados</h3>
        <ul>
          {coordenadoresCadastrados.map((c) => (
            <li key={c.id}>{c.nome}
            <button onClick={() => excluirCoordenador(c.id)}>Excluir</button>
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

export default CoordenadoresCurso;
