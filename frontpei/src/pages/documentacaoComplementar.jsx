import { useEffect, useState } from "react";
import axios from "axios";
import { validaCampos } from "../utils/validaCampos";
import { useAlert, FieldAlert } from "../context/AlertContext";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoEditar from "../components/customButtons/botaoEditar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import "../cssGlobal.css";
import { API_ROUTES } from "../configs/apiRoutes";
import { useLocation} from "react-router-dom";

function DocumentacaoComplementar() {
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();
  const location = useLocation()
  const {matricula} = location.state || {}
  console.log("MATRICULA NO FRONT:", matricula);


  const DBDOC = axios.create({baseURL: API_ROUTES.DOCUMENTACAOCOMPLEMENTAR });
  const [form, setForm] = useState({ nomeArquivo: "" });
  const [arquivo, setArquivo] = useState(null);
  const [docs, setDocs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nomeArquivo: "" });
  const [editArquivo, setEditArquivo] = useState(null);

  const recuperaDocs = async () => {
    try {
      const res = await DBDOC.get("/");
      setDocs(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      addAlert("Erro ao carregar documentos.", "error");
    }
  };

  const montaFormData = (dados, arquivo, matricula) => {
    const form = new FormData();

    form.append("nomeArquivo", dados.nomeArquivo || "");
    form.append("matricula", matricula);

    if(arquivo){
      form.append("arquivo", arquivo)
    }

    return form
  }

  const adicionaDoc = async (e) => {
    e.preventDefault();
    const formComArquivo = { ...form, arquivo };
    const mensagens = validaCampos(formComArquivo, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
      addAlert("Existem campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      await DBDOC.post("/", montaFormData(form, arquivo, matricula), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addAlert("Documento cadastrado com sucesso!", "success");
      setForm({ nomeArquivo: ""});
      setArquivo(null);
      recuperaDocs();
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
        addAlert("Erro ao cadastrar documentação.", "error", { persist: true });
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
      await DBDOC.put(`/${id}/`, montaFormData(editForm, editArquivo, matricula), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addAlert("Documento atualizado com sucesso!", "success");
      setEditId(null);
      setEditForm({ nomeArquivo: ""});
      setEditArquivo(null);
      recuperaDocs();
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
        addAlert("Erro ao editar documentação.", "error", { persist: true });
      }
    }
  };

  useEffect(() => {
    recuperaDocs();
    clearAlerts();
  }, []);

  return (
    <div className="container-padrao">
      <h1>Gerenciar Documentação Complementar</h1>

      <h2>Adicionar Documento</h2>
      <form className="form-padrao" onSubmit={adicionaDoc}>
        <label>Nome do arquivo:</label>
        <input
          type="text"
          name="nomeArquivo"
          value={form.nomeArquivo}
          onChange={(e) => {
            setForm({ ...form, nomeArquivo: e.target.value });
            if (e.target.value.trim()) clearFieldAlert("nomeArquivo");
          }}
          placeholder="Ex: Plano de Ensino Matemática 2025/1"
        />
        <FieldAlert fieldName="nomeArquivo" />

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

        <button type="submit" className="submit-btn">
          Adicionar Documento
        </button>
      </form>

      <div className="list-padrao">
        <h3>Documentos Cadastrados</h3>
        <ul>
          {docs.length === 0 && <li>Nenhum documento.</li>}
          {docs.map((d) => (
            <li key={d.id} className="componente-item">
              {editId === d.id ? (
                <form id="editForm" onSubmit={(e) => atualizaDoc(e, d.id)}>
                  <label>Nome do arquivo:</label>
                  <input
                    type="text"
                    name="nomeArquivo"
                    value={editForm.nomeArquivo}
                    onChange={(e) => {
                      setEditForm({ ...editForm, nomeArquivo: e.target.value });
                      if (e.target.value.trim())
                        clearFieldAlert("edit-nomeArquivo");
                    }}
                  />
                  <FieldAlert fieldName="edit-nomeArquivo" />

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
                    <button type="submit" className="btn-salvar">
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="botao-deletar"
                      onClick={() => setEditId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="componente-detalhe">
                  <strong>Nome do arquivo:</strong> {d.nomeArquivo || "-"} <br />
                  {d.arquivo ? (
                    <a
                      href={d.arquivo}
                      target="_blank"
                      rel="noreferrer"
                      className="link-arquivo"
                    >
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
                        setEditForm({ nomeArquivo: d.nomeArquivo });
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