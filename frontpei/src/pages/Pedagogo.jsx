import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../context/AlertContext";
import { validaCampos } from "../utils/validaCampos";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import "../cssGlobal.css";

function Pedagogos() {
  const { addAlert, clearFieldAlert } = useAlert();
  const DBPEDAGOGO = axios.create({ baseURL: import.meta.env.VITE_PEDAGOGO_URL });

  const [form, setForm] = useState({ nome: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "" });
  const [pedagogos, setPedagogos] = useState([]);

  async function recuperaPedagogos() {
    try {
      const res = await DBPEDAGOGO.get("/");
      setPedagogos(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar pedagogos!", "error");
    }
  }

  async function adicionaPedagogo(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Campo obrigatório não preenchido.", "warning");
      return;
    }

    try {
      await DBPEDAGOGO.post("/", form);
      setForm({ nome: "" });
      recuperaPedagogos();
      addAlert("Pedagogo cadastrado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([field, msgs]) => {
          addAlert(msgs.join(", "), "error", { fieldName: field });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${m.join(", ")}`)
          .join("\n");
        addAlert(`Erro ao cadastrar:\n${msg}`, "error");
      } else {
        addAlert("Erro ao cadastrar pedagogo.", "error");
      }
    }
  }

  async function atualizaPedagogo(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` }));
      addAlert("Nome é obrigatório.", "warning");
      return;
    }

    try {
      await DBPEDAGOGO.put(`/${id}/`, editForm);
      setEditId(null);
      setEditForm({ nome: "" });
      recuperaPedagogos();
      addAlert("Pedagogo atualizado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([field, msgs]) => {
          addAlert(msgs.join(", "), "error", { fieldName: `edit-${field}` });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${m.join(", ")}`)
          .join("\n");
        addAlert(`Erro ao atualizar:\n${msg}`, "error");
      } else {
        addAlert("Erro ao atualizar pedagogo.", "error");
      }
    }
  }

  useEffect(() => {
    recuperaPedagogos();
  }, []);

  return (
    <div className="container-padrao">
      <h1>Gerenciar Pedagogos</h1>

      <h2>Cadastrar Pedagogo</h2>
      <form className="form-padrao" onSubmit={adicionaPedagogo}>
        <label>Nome:</label>
        <input
          name="nome"
          type="text"
          value={form.nome}
          onChange={(e) => {
            setForm({ ...form, nome: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("nome");
          }}
          placeholder="Digite o nome do pedagogo"
        />
        <FieldAlert fieldName="nome" />
        <button className="submit-btn">Adicionar Pedagogo</button>
      </form>

      <div className="list-padrao">
        <h3>Pedagogos Cadastrados</h3>
        <ul>
          {pedagogos.length === 0 && <li>Nenhum pedagogo cadastrado.</li>}
          {pedagogos.map((p) => (
            <li key={p.id}>
              {editId === p.id ? (
                <form id="editForm" onSubmit={(e) => atualizaPedagogo(e, p.id)}>
                  <label>Nome:</label>
                  <input
                    name="nome"
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => {
                      setEditForm({ ...editForm, nome: e.target.value });
                      if (e.target.value.trim()) clearFieldAlert("edit-nome");
                    }}
                  />
                  <FieldAlert fieldName="edit-nome" />
                  <div className="posicao-buttons esquerda">
                    <button type="submit" className="btn-salvar">Salvar</button>
                    <button type="button" className="botao-deletar" onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <strong>{p.nome}</strong>
                  <div className="posicao-buttons">
                    <BotaoEditar
                      id={p.id}
                      onClickInline={() => {
                        setEditId(p.id);
                        setEditForm({ nome: p.nome });
                      }}
                    />
                    <BotaoDeletar
                      id={p.id}
                      axiosInstance={DBPEDAGOGO}
                      onDeletarSucesso={recuperaPedagogos}
                    />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <BotaoVoltar />
    </div>
  );
}

export default Pedagogos;