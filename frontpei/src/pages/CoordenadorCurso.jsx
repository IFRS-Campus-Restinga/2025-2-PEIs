import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validaCampos } from "../utils/validaCampos";
import { useAlert } from "../context/AlertContext";

function CoordenadoresCurso() {
  const {addAlert} = useAlert();
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
    const mensagens = validaCampos(coordenador, event.target);
    const { nome } = coordenador;

    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    try {
      await DBCOORDENADORES.post("/", { nome });
      await recuperaCoordenadores();
      setCoordenador({ nome: "" });
      recuperaCoordenadores();
      addAlert("Coordenador cadastrado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  }

  async function excluirCoordenador(id) {
    addAlert("Deseja realmente deletar este coordenador?", "confirm", {
      onConfirm: async () => {
        try {
          await DBCOORDENADORES.delete(`/${id}/`);
          recuperaCoordenadores();
          addAlert("Coordenador deletado com sucesso!", "success");
        } catch (err) {
          console.error(err);
          if (err.response?.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join(" | ");
            addAlert(`Erro ao deletar ${messages}`, "error");
          } else {
            addAlert("Erro ao deletar (erro desconhecido).", "error");
          }
        }
      },
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    });
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
          name="nome"
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
            <li key={c.id}>{c.nome} {}
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
