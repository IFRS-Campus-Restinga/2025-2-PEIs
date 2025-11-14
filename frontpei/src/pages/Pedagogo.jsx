import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../context/AlertContext";
import { validaCampos } from "../utils/validaCampos";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import "../cssGlobal.css";
import { API_ROUTES } from "../configs/apiRoutes";

function Pedagogos() {
  const DBPEDAGOGO = axios.create({baseURL: API_ROUTES.USUARIO});
  const [pedagogo, setPedagogo] = useState("");
  const [pedagogosCadastradas, setPedagogosCadastradas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "" });
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

  useEffect(() => {
    // limpa todos os alertas ao entrar na tela
    clearAlerts();
  }, []);
  const [form, setForm] = useState({ nome: "" });

  async function recuperaPedagogos() {
    try {
      const res = await DBPEDAGOGO.get("/");
      const dados = Array.isArray(res.data) ? res.data : res.data.results || [];
      setPedagogosCadastradas(dados);
    } catch (err) {
      addAlert("Erro ao carregar pedagogos!", "error");
    }
  }

  async function adicionaPedagogo(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBPEDAGOGO.post("/", { nome: form.nome });
      setForm({ nome: "" });
      await recuperaPedagogos();
      addAlert("Pedagogo cadastrado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        // Exibir mensagens inline (por campo)
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });

        // Montar mensagem amigável pro toast
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1); // Capitaliza o nome do campo
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
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
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBPEDAGOGO.put(`/${id}/`, { nome: editForm.nome });
      setEditId(null);
      setEditForm({ nome: "" });
      await recuperaPedagogos();
      addAlert("Pedagogo atualizado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        // Exibir mensagens inline (por campo)
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });

        // Montar mensagem amigável pro toast
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => {
            const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1); // Capitaliza o nome do campo
            const mensagens = Array.isArray(m) ? m.join(", ") : m;
            return `Campo ${nomeCampo}: ${mensagens}`;
          })
          .join("\n");

        addAlert(`Erro ao cadastrar:\n${msg}`, "error", { persist: true });
      } else {
        addAlert("Erro ao editar pedagogo.", "error", { persist: true });
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
        <button type="submit" className="submit-btn">
          Adicionar Pedagogo
        </button>
      </form>

      <div className="list-padrao">
        <h3>Pedagogos Cadastrados</h3>
        <ul>
          {pedagogosCadastradas.length === 0 && <li>Nenhum pedagogo cadastrado.</li>}
          {pedagogosCadastradas.map((p) => (
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
                    autoFocus
                  />
                  <FieldAlert fieldName="edit-nome" />

                  <div className="posicao-buttons esquerda">
                    <button type="submit" className="btn-salvar">Salvar</button>
                    <button
                      type="button"
                      className="botao-deletar"
                      onClick={() => {
                        setEditId(null);
                        setEditForm({ nome: "" });
                        clearFieldAlert("edit-nome");
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="list-padrao">
                  <strong>{p.nome}</strong>
                  <div className="posicao-buttons">
                    <BotaoEditar
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
                </div>
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