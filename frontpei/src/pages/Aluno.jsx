import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../context/AlertContext";
import { validaCampos } from "../utils/validaCampos";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import { API_ROUTES } from "../configs/apiRoutes";
import "../cssGlobal.css";

function Alunos() {
  const { addAlert, clearFieldAlert } = useAlert();
  const DBALUNOS = axios.create(API_ROUTES.ALUNOS);

  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState({ nome: "", matricula: "", email: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: "", matricula: "", email: "" });

  async function recuperaAlunos() {
    try {
      const res = await DBALUNOS.get("/");
      setAlunos(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar alunos!", "error");
    }
  }

  // CADASTRO
  async function adicionaAluno(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBALUNOS.post("/", form);
      setForm({ nome: "", matricula: "", email: "" });
      recuperaAlunos();
      addAlert("Aluno cadastrado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
          .join("\n");
        addAlert(`Erro ao cadastrar:\n${msg}`, "error");
      } else {
        addAlert("Erro ao cadastrar aluno.", "error");
      }
    }
  }

  // EDIÇÃO
  async function atualizaAluno(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` }));
      addAlert("Campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBALUNOS.put(`/${id}/`, editForm);
      setEditId(null);
      setEditForm({ nome: "", matricula: "", email: "" });
      recuperaAlunos();
      addAlert("Aluno atualizado com sucesso!", "success");
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([f, m]) => {
          addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: `edit-${f}` });
        });
        const msg = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`)
          .join("\n");
        addAlert(`Erro ao atualizar:\n${msg}`, "error");
      } else {
        addAlert("Erro ao atualizar aluno.", "error");
      }
    }
  }

  useEffect(() => {
    recuperaAlunos();
  }, []);

  return (
    <div className="container-padrao">
      <h1>Gerenciar Alunos</h1>

      {/* FORMULÁRIO DE CADASTRO */}
      <h2>Cadastrar Aluno</h2>
      <form className="form-padrao" onSubmit={adicionaAluno}>
        <label>Nome:</label>
        <input
          name="nome"
          type="text"
          value={form.nome}
          onChange={(e) => {
            setForm({ ...form, nome: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("nome");
          }}
          placeholder="Nome completo do aluno"
        />
        <FieldAlert fieldName="nome" />

        <label>Matrícula:</label>
        <input
          name="matricula"
          type="text"
          value={form.matricula}
          onChange={(e) => {
            setForm({ ...form, matricula: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("matricula");
          }}
          placeholder="Ex: 202310001"
        />
        <FieldAlert fieldName="matricula" />

        <label>Email institucional:</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("email");
          }}
          placeholder="aluno@restinga.ifrs.edu.br"
        />
        <FieldAlert fieldName="email" />

        <button type="submit" className="submit-btn">Adicionar Aluno</button>
      </form>

      {/* LISTA */}
      <div className="list-padrao">
        <h3>Alunos Cadastrados</h3>
        <ul>
          {alunos.length === 0 && <li>Nenhum aluno cadastrado.</li>}

          {alunos.map((a) => (
            <li key={a.id} className="componente-item">
              {editId === a.id ? (
                <form id="editForm" onSubmit={(e) => atualizaAluno(e, a.id)}>
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

                  <label>Matrícula:</label>
                  <input
                    name="matricula"
                    type="text"
                    value={editForm.matricula}
                    onChange={(e) => {
                      setEditForm({ ...editForm, matricula: e.target.value });
                      if (e.target.value.trim()) clearFieldAlert("edit-matricula");
                    }}
                  />
                  <FieldAlert fieldName="edit-matricula" />

                  <label>Email:</label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => {
                      setEditForm({ ...editForm, email: e.target.value });
                      if (e.target.value.trim()) clearFieldAlert("edit-email");
                    }}
                  />
                  <FieldAlert fieldName="edit-email" />

                  <div className="posicao-buttons esquerda">
                    <button type="submit" className="btn-salvar">Salvar</button>
                    <button type="button" className="botao-deletar" onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="componente-detalhe">
                  <strong>{a.nome}</strong> <br />
                  <strong>Matrícula:</strong> {a.matricula} <br />
                  <strong>Email:</strong> {a.email}
                  <div className="posicao-buttons">
                    <BotaoEditar
                      id={a.id}
                      onClickInline={() => {
                        setEditId(a.id);
                        setEditForm({ nome: a.nome, matricula: a.matricula, email: a.email });
                      }}
                    />
                    <BotaoDeletar
                      id={a.id}
                      axiosInstance={DBALUNOS}
                      onDeletarSucesso={recuperaAlunos}
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

export default Alunos;