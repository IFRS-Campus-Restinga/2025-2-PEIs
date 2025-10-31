import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./disciplina.css";
import { useAlert, FieldAlert } from "../context/AlertContext"; 
import { validaCampos } from "../utils/validaCampos";
import BotaoVoltar from "../components/customButtons/botaoVoltar";

function Pedagogos() {
  const DBPEDAGOGO = axios.create({baseURL: import.meta.env.VITE_PEDAGOGO_URL});
  const [pedagogo, setPedagogo] = useState("");
  const [pedagogosCadastradas, setPedagogosCadastradas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const { addAlert } = useAlert();
  const [form, setForm] = useState({ nome: "" });

  async function recuperaPedagogos() {
    try {
      const response = await DBPEDAGOGO.get("/");
      const data = response.data;
      setPedagogosCadastradas(Array.isArray(data) ? data : data.results);
    } catch (err) {
      addAlert("Erro ao buscar disciplinas: ", err);
    }
  }

  async function adicionaPedagogo(event) {
    event.preventDefault();
    const nomePedagogo = pedagogo.trim();

    const mensagens = validaCampos(form, event.target);
    if (mensagens.length > 0) {
      // ALERTS INLINE
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      // TOAST GERAL
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBPEDAGOGO.post("/", form);
      await recuperaPedagogos();
      setPedagogo("");
    } catch (err) {
      console.error("Erro completo:", err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" \n ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  }

  // Função para deletar disciplina
  async function deletaPedagogo(id) {
    addAlert("Deseja realmente deletar este pedagogo?", "confirm", {
      onConfirm: async () => {
        try {
          await DBPEDAGOGO.delete(`/${id}/`);
          recuperaPedagogos();
          addAlert("Pedagogo deletado com sucesso!", "success");
        } catch (err) {
          console.error(err);
          if (err.response?.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join(" | ");
            addAlert(`Erro ao deletar ${messages}`, "error");
          } else {
            addAlert("Erro ao deletar pedagogo (erro desconhecido).", "error");
          }
        }
      },
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    });
  }

  async function atualizaPedagogo(id) {
    const nomeTrim = editNome.trim();
    if (!nomeTrim) return addAlert("Insira um nome válido!", "warning");

    try {
      await DBPEDAGOGO.put(`/${id}/`, { nome: nomeTrim });
      setEditId(null);
      setEditNome("");
      await recuperaPedagogos();
    } catch (err) {
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join(" \n ");
        addAlert(`Erro ao cadastrar ${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  }


  useEffect(() => {
    recuperaPedagogos();
  }, []);

  return (
    <div className="disciplinas-container">
      <h1>Gerenciar Pedagogo</h1>

      <h2>Cadastrar pedagogo</h2>
      <form className="disciplinas-form" onSubmit={adicionaPedagogo}>
        <label>Nome: </label>
        <br />
        <textarea
          name="nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <FieldAlert fieldName="nome" />
        <br />
        <button type="submit">Adicionar pedagogo</button>
      </form>

      <div className="disciplinas-list">
        <h3>Pedagogos Cadastrados</h3>
        <ul>
          {pedagogosCadastradas.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <>
                  <input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                  />
                  <div className="btn-group">
                    <button onClick={() => atualizaPedagogo(d.id)}>Salvar</button>
                  </div>
                </>
              ) : (
                <>
                  <span>{d.nome}</span>
                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(d.id);
                        setEditNome(d.nome);
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => deletaPedagogo(d.id)}>Deletar</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>


      <BotaoVoltar/>
    </div>
  );
}

export default Pedagogos;
