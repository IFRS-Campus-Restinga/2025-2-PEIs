import { useEffect, useState } from "react";
import axios from "axios";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import { API_ROUTES } from "../configs/apiRoutes";
import "../cssGlobal.css";

function DocumentacaoComplementar() {
  const { addAlert, clearFieldAlert } = useAlert();
  const DBDOC = axios.create(API_ROUTES.DOCUMENTACAOCOMPLEMENTAR);

  const [form, setForm] = useState({ autor: "", tipo: "", arquivo: null });
  const [arquivo, setArquivo] = useState(null);
  const [docs, setDocs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ autor: "", tipo: "", arquivo: null });
  const [editArquivo, setEditArquivo] = useState(null);

  const recuperaDocs = async () => {
    try {
      const res = await DBDOC.get("/");
      setDocs(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar documentos.", "error");
    }
  };

  useEffect(() => {
    recuperaDocs();
  }, []);

  const montaFormData = (dados, arquivo) => {
    const fd = new FormData();
    Object.entries(dados).forEach(([k, v]) => fd.append(k, v));
    if (arquivo) fd.append("arquivo", arquivo);
    return fd;
  };

  const adicionaDoc = async (e) => {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBDOC.post("/", montaFormData(form, arquivo), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addAlert("Documento cadastrado com sucesso!", "success");
      setForm({ autor: "", tipo: "" });
      setArquivo(null);
      recuperaDocs();
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([field, msgs]) => {
          addAlert(msgs.join(", "), "error", { fieldName: field });
        });
        const messages = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${m.join(", ")}`)
          .join("\n");
        addAlert(`Erro ao cadastrar:\n${messages}`, "error");
      } else {
        addAlert("Erro ao cadastrar (erro desconhecido).", "error");
      }
    }
  };

  const atualizaDoc = async (e, id) => {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBDOC.put(`/${id}/`, montaFormData(editForm, editArquivo), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addAlert("Documento atualizado com sucesso!", "success");
      setEditId(null);
      setEditForm({ autor: "", tipo: "" });
      setEditArquivo(null);
      recuperaDocs();
    } catch (err) {
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([field, msgs]) => {
          addAlert(msgs.join(", "), "error", { fieldName: `edit-${field}` });
        });
        const messages = Object.entries(err.response.data)
          .map(([f, m]) => `${f}: ${m.join(", ")}`)
          .join("\n");
        addAlert(`Erro ao atualizar:\n${messages}`, "error");
      } else {
        addAlert("Erro ao atualizar (erro desconhecido).", "error");
      }
    }
  };

  return (
    <div className="container-padrao">
      <h1>Gerenciar Documentação Complementar</h1>

      <h2>Adicionar Documento</h2>
      <form className="form-padrao" onSubmit={adicionaDoc}>
        <label>Autor:</label>
        <input
          type="text"
          name="autor"
          value={form.autor}
          onChange={(e) => {
            setForm({ ...form, autor: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("autor");
          }}
          placeholder="Nome do autor"
        />
        <FieldAlert fieldName="autor" />

        <label>Tipo:</label>
        <input
          type="text"
          name="tipo"
          value={form.tipo}
          onChange={(e) => {
            setForm({ ...form, tipo: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("tipo");
          }}
          placeholder="Ex: Relatório, Ata"
        />
        <FieldAlert fieldName="tipo" />

        <label>Arquivo:</label>
        <input
          type="file"
          name="arquivo"
          accept=".pdf,.docx,.png,.jpg"
          onChange={(e) => {
            setArquivo(e.target.files[0]);
            if (e.target.value) clearFieldAlert("arquivo");
          }}
        />
        <FieldAlert fieldName="arquivo" />

        <button type="submit" className="submit-btn">Adicionar Documento</button>
      </form>

      <div className="list-padrao">
        <h3>Documentos Cadastrados</h3>
        <ul>
          {docs.length === 0 && <li>Nenhum documento.</li>}
          {docs.map((d) => (
            <li key={d.id} className="componente-item">
              {editId === d.id ? (
                <form id="editForm" onSubmit={(e) => atualizaDoc(e, d.id)}>
                  <label>Autor:</label>
                  <input
                    type="text"
                    name="autor"
                    value={editForm.autor}
                    onChange={(e) => {
                      setEditForm({ ...editForm, autor: e.target.value });
                      if (e.target.value.trim()) clearFieldAlert("edit-autor");
                    }}
                  />
                  <FieldAlert fieldName="edit-autor" />

                  <label>Tipo:</label>
                  <input
                    type="text"
                    name="tipo"
                    value={editForm.tipo}
                    onChange={(e) => {
                      setEditForm({ ...editForm, tipo: e.target.value });
                      if (e.target.value.trim()) clearFieldAlert("edit-tipo");
                    }}
                  />
                  <FieldAlert fieldName="edit-tipo" />

                  <label>Novo Arquivo (opcional):</label>
                  <input
                    type="file"
                    name="arquivo"
                    accept=".pdf,.docx,.png,.jpg"
                    onChange={(e) => {
                      setEditArquivo(e.target.files[0]);
                      if (e.target.value) clearFieldAlert("edit-arquivo");
                    }}
                  />
                  <FieldAlert fieldName="edit-arquivo" />

                  <div className="posicao-buttons esquerda">
                    <button type="submit" className="btn-salvar">Salvar</button>
                    <button type="button" className="botao-deletar" onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="componente-detalhe">
                  <strong>Autor:</strong> {d.autor || "-"} <br />
                  <strong>Tipo:</strong> {d.tipo || "-"} <br />
                  {d.arquivo ? (
                    <a href={d.arquivo} target="_blank" rel="noreferrer" className="link-arquivo">
                      Ver Arquivo
                    </a>
                  ) : (
                    <span>Sem arquivo</span>
                  )}
                  <div className="posicao-buttons">
                    <BotaoEditar
                      id={d.id}
                      onClickInline={() => {
                        setEditId(d.id);
                        setEditForm({ autor: d.autor, tipo: d.tipo });
                      }}
                    />
                    <BotaoDeletar
                      id={d.id}
                      axiosInstance={DBDOC}
                      onDeletarSucesso={recuperaDocs}
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

export default DocumentacaoComplementar;