import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validaCampos } from "../utils/validaCampos";
import { useAlert } from "../context/AlertContext";
import "./professor.css"; // reutilizando o mesmo CSS

function CoordenadoresCurso() {
  const { addAlert } = useAlert();
  const DBCOORDENADORES = axios.create({ baseURL: import.meta.env.VITE_COORDENADORCURSO_URL });

  const [coordenador, setCoordenador] = useState({ nome: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "" });
  const [coordenadoresCadastrados, setCoordenadoresCadastrados] = useState([]);

  async function recuperaCoordenadores() {
    try {
      const response = await DBCOORDENADORES.get("/");
      const data = response.data;
      setCoordenadoresCadastrados(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Erro ao buscar coordenadores: ", err);
      addAlert("Erro ao carregar lista de coordenadores!", "error");
    }
  }

  async function adicionaCoordenador(event) {
    event.preventDefault();
    const mensagens = validaCampos(coordenador, event.target);
    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    try {
      await DBCOORDENADORES.post("/", coordenador);
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
        addAlert("Erro ao cadastrar coordenador (erro desconhecido).", "error");
      }
    }
  }

  async function atualizaCoordenador(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      addAlert(mensagens.join("\n"), "warning");
      return;
    }

    try {
      await DBCOORDENADORES.put(`/${id}/`, editForm);
      setEditId(null);
      setEditForm({ nome: "" });
      recuperaCoordenadores();
      addAlert("Coordenador atualizado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" | ");
        addAlert(`Erro ao atualizar ${messages}`, "error");
      } else {
        addAlert("Erro ao atualizar coordenador (erro desconhecido).", "error");
      }
    }
  }

  function excluirCoordenador(id) {
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
            addAlert("Erro ao deletar coordenador (erro desconhecido).", "error");
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
    <div className="professores-container">
      <h1>Gerenciar Coordenadores de Curso</h1>

      <h2>Cadastrar Coordenador</h2>
      <form className="professor-form" onSubmit={adicionaCoordenador}>
        <label>Nome:</label>
        <input
          name="nome"
          type="text"
          value={coordenador.nome}
          onChange={(e) => setCoordenador({ ...coordenador, nome: e.target.value })}
          placeholder="Digite o nome do coordenador"
        />
        <button type="submit">Adicionar Coordenador</button>
      </form>

      <div className="professores-list">
        <h3>Coordenadores Cadastrados</h3>
        <ul>
          {coordenadoresCadastrados.length === 0 && <li>Nenhum coordenador cadastrado.</li>}
          {coordenadoresCadastrados.map((c) => (
            <li key={c.id}>
              {editId === c.id ? (
                <form id="editForm" onSubmit={(e) => atualizaCoordenador(e, c.id)}>
                  <input
                    name="nome"
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  />
                  <div className="btn-group">
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{c.nome}</strong><br />
                  <div className="professor-buttons">
                    <button
                      onClick={() => {
                        setEditId(c.id);
                        setEditForm({ nome: c.nome });
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => excluirCoordenador(c.id)}>Deletar</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
}

export default CoordenadoresCurso;
