import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../context/AlertContext";
import { validaCampos } from "../utils/validaCampos";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import { API_ROUTES } from "../configs/apiRoutes";
import "../cssGlobal.css";

function CoordenadoresCurso() {
  const { addAlert, clearFieldAlert } = useAlert();
  const DBCOORDENADORES = axios.create(API_ROUTES.COORDENADORCURSO);

  const [form, setForm] = useState({ nome: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "" });
  const [coordenadores, setCoordenadores] = useState([]);

  async function recuperaCoordenadores() {
    try {
      const res = await DBCOORDENADORES.get("/");
      setCoordenadores(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar coordenadores!", "error");
    }
  }

  async function adicionaCoordenador(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Campo obrigatório não preenchido.", "warning");
      return;
    }

    try {
      await DBCOORDENADORES.post("/", form);
      setForm({ nome: "" });
      recuperaCoordenadores();
      addAlert("Coordenador cadastrado com sucesso!", "success");
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
        addAlert("Erro ao cadastrar coordenador.", "error");
      }
    }
  }

  async function atualizaCoordenador(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` }));
      addAlert("Nome é obrigatório.", "warning");
      return;
    }

    try {
      await DBCOORDENADORES.put(`/${id}/`, editForm);
      setEditId(null);
      setEditForm({ nome: "" });
      recuperaCoordenadores();
      addAlert("Coordenador atualizado com sucesso!", "success");
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
        addAlert("Erro ao atualizar coordenador.", "error");
      }
    }
  }

  useEffect(() => {
    recuperaCoordenadores();
  }, []);

  return (
    <div className="container-padrao">
      <h1>Gerenciar Coordenadores de Curso</h1>

      <h2>Cadastrar Coordenador</h2>
      <form className="form-padrao" onSubmit={adicionaCoordenador}>
        <label>Nome:</label>
        <input
          name="nome"
          type="text"
          value={form.nome}
          onChange={(e) => {
            setForm({ ...form, nome: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("nome");
          }}
          placeholder="Digite o nome do coordenador"
        />
        <FieldAlert fieldName="nome" />
        <button className="submit-btn">Adicionar Coordenador</button>
      </form>

      <div className="list-padrao">
        <h3>Coordenadores Cadastrados</h3>
        <ul>
          {coordenadores.length === 0 && <li>Nenhum coordenador cadastrado.</li>}
          {coordenadores.map((c) => (
            <li key={c.id}>
              {editId === c.id ? (
                <form id="editForm" onSubmit={(e) => atualizaCoordenador(e, c.id)}>
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
                  <strong>{c.nome}</strong>
                  <div className="posicao-buttons">
                    <BotaoEditar
                      id={c.id}
                      onClickInline={() => {
                        setEditId(c.id);
                        setEditForm({ nome: c.nome });
                      }}
                    />
                    <BotaoDeletar
                      id={c.id}
                      axiosInstance={DBCOORDENADORES}
                      onDeletarSucesso={recuperaCoordenadores}
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

export default CoordenadoresCurso;