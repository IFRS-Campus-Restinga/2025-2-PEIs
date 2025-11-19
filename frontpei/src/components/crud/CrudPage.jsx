import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import { modelsSchemas } from "../../configs/modelsSchemas";
import BotaoVoltar from "../customButtons/botaoVoltar";
import BotaoDeletar from "../customButtons/botaoDeletar";

export default function CrudPage({ modelKey }) {
  const schema = modelsSchemas[modelKey];
  if (!schema) throw new Error(`Schema não encontrado para modelKey=${modelKey}`);

  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

  const API = axios.create({ baseURL: schema.endpoint });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [newForm, setNewForm] = useState(
    Object.fromEntries(schema.fields.map((f) => [f.name, ""]))
  );

  const [optionsCache, setOptionsCache] = useState({});

  useEffect(() => {
    clearAlerts();
    loadAll();
    // eslint-disable-next-line
  }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadItems(), loadSelects()]);
    setLoading(false);
  }

  async function loadItems() {
    try {
      const res = await API.get(schema.listQuery || "/");
      let data = res.data;

      if (data && typeof data === "object" && Array.isArray(data.results)) {
        data = data.results;
      }

      if (!Array.isArray(data)) {
        console.warn("API não retornou array, convertendo para []:", data);
        data = [];
      }

      setItems(data);
    } catch (err) {
      addAlert("Erro ao carregar registros.", "error");
      setItems([]);
    }
  }

  async function loadSelects() {
    const selects = schema.fields.filter((f) => f.type === "select" && f.source);
    await Promise.all(
      selects.map(async (f) => {
        if (optionsCache[f.source]) return;
        try {
          const res = await axios.get(f.source);
          const data = Array.isArray(res.data) ? res.data : res.data.results || res.data;
          setOptionsCache((prev) => ({ ...prev, [f.source]: data }));
        } catch {
          addAlert(`Erro ao carregar opções: ${f.label}`, "error");
        }
      })
    );
  }

  function openEdit(item) {
    setEditId(item.id);
    setEditForm(schema.mapResponseToForm ? schema.mapResponseToForm(item) : item);
    Object.keys(editForm || {}).forEach((k) => clearFieldAlert(`edit-${k}`));
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm({});
  }

  async function handleSubmitCreate(e) {
  e.preventDefault();

  const mensagens = validaCampos(newForm, e.target);
  if (mensagens.length > 0) {
    mensagens.forEach((m) => addAlert(m.message, "error", { fieldName: m.fieldName }));
    addAlert("Campos obrigatórios não preenchidos.", "warning");
    return;
  }

  try {
    const payload = schema.mapFormToPayload ? schema.mapFormToPayload(newForm) : newForm;

    console.log("=== ENVIANDO CREATE ===");
    console.log("Payload:", payload);

    const response = await API.post("/", payload);

    console.log("Resposta backend:", response.data);

    setNewForm(Object.fromEntries(schema.fields.map((f) => [f.name, ""])));
    addAlert(`${schema.title} cadastrado com sucesso!`, "success");
    await loadItems();
  } catch (err) {
    console.error("Erro na criação:", err.response?.data || err.message);
    handleApiErrors(err, "");
  }
}

  async function handleSubmitEdit(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, document.getElementById("editForm"));

    if (mensagens.length > 0) {
      mensagens.forEach((m) =>
        addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` })
      );
      addAlert("Campos obrigatórios não preenchidos.", "warning");
      return;
    }

    try {
      const payload = schema.mapFormToPayload ? schema.mapFormToPayload(editForm) : editForm;
      await API.put(`/${id}/`, payload);
      addAlert(`${schema.title} atualizado com sucesso!`, "success");
      setEditId(null);
      setEditForm({});
      await loadItems();
    } catch (err) {
      handleApiErrors(err, "edit-");
    }
  }

  async function handleDelete(id) {
    try {
      await API.delete(`/${id}/`);
      addAlert("Registro excluído com sucesso!", "success");
      await loadItems();
    } catch (err) {
      addAlert("Erro ao excluir registro.", "error");
    }
  }

  function handleApiErrors(err, fieldPrefix = "") {
    if (err.response?.data) {
      Object.entries(err.response.data).forEach(([f, m]) => {
        addAlert(Array.isArray(m) ? m.join(", ") : m, "error", {
          fieldName: `${fieldPrefix}${f}`,
        });
      });

      const msg = Object.entries(err.response.data)
        .map(([f, m]) => {
          const nomeCampo = f.charAt(0).toUpperCase() + f.slice(1);
          const mensagens = Array.isArray(m) ? m.join(", ") : m;
          return `Campo ${nomeCampo}: ${mensagens}`;
        })
        .join("\n");

      addAlert(`Erro:\n${msg}`, "error", { persist: true });
    } else {
      addAlert("Erro na operação.", "error", { persist: true });
    }
  }

  const handleNewChange = (e) => {
  const { name, value, files, type } = e.target;

  setNewForm((p) => ({
    ...p,
    [name]:
      type === "file"
        ? files[0]
        : schema.fields.find(f => f.name === name)?.type === "select"
        ? Number(value) || "" // só converte selects em número
        : value,
  }));

  if (value) clearFieldAlert(name);
};

const handleEditChange = (e) => {
  const { name, value, files, type } = e.target;

  setEditForm((p) => ({
    ...p,
    [name]:
      type === "file"
        ? files[0]
        : schema.fields.find(f => f.name === name)?.type === "select"
        ? Number(value) || ""
        : value,
  }));

  if (value) clearFieldAlert(`edit-${name}`);
};

  // ======================
  // Função para renderizar objetos e arrays
  // ======================
  function renderFieldValue(value) {
    if (Array.isArray(value)) return value.map(v => v.nome || v.id || JSON.stringify(v)).join(", ");
    if (value && typeof value === "object") return value.nome || value.id || JSON.stringify(value);
    return value ?? "-";
  }

  return (
    <div className="container-padrao">
      <h1>{schema.title}</h1>

      {/* FORMULÁRIO DE CADASTRO */}
      <h2>Cadastrar</h2>
      <form className="form-padrao" onSubmit={handleSubmitCreate}>
        {schema.fields.map((field) => (
          <div key={field.name}>
            <label>{field.label}:</label>

            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={newForm[field.name] || ""}
                onChange={handleNewChange}
              />
            ) : field.type === "select" ? (
              <select
                name={field.name}
                value={newForm[field.name] || ""}
                onChange={handleNewChange}
              >
                <option value="">Selecione...</option>
                {(optionsCache[field.source] || []).map((opt) => (
                  <option
                    key={field.mapValue ? field.mapValue(opt) : opt.id}
                    value={field.mapValue ? field.mapValue(opt) : opt.id} // envia apenas o ID
                  >
                    {field.mapLabel ? field.mapLabel(opt) : opt.nome ?? opt.id}
                  </option>
                ))}
              </select>
            ) : field.type === "datetime" ? (
              <input
                type="datetime-local"
                name={field.name}
                value={newForm[field.name] ? newForm[field.name].slice(0, 16) : ""}
                onChange={handleNewChange}
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={field.type === "file" ? "" : newForm[field.name] || ""}
                onChange={handleNewChange}
              />
            )}

            <FieldAlert fieldName={field.name} />
          </div>
        ))}

        <br />
        <button type="submit" className="submit-btn">Adicionar</button>
      </form>

      {/* LISTA */}
      <div className="list-padrao">
        <h3>Registros</h3>
        <ul>
          {loading && <li>Carregando...</li>}
          {!loading && items.length === 0 && <li>Nenhum registro.</li>}

          {!loading &&
            items.map((item) => (
              <li key={item.id} className="componente-item">
                {editId === item.id ? (
                  /* FORM DE EDIÇÃO */
                  <form id="editForm" onSubmit={(e) => handleSubmitEdit(e, item.id)}>
                    {schema.fields.map((field) => (
                      <div key={field.name}>
                        <label>{field.label}:</label>

                        {field.type === "textarea" ? (
                          <textarea
                            name={field.name}
                            value={editForm[field.name] ?? ""}
                            onChange={handleEditChange}
                          />
                        ) : field.type === "select" ? (
                          <select
                            name={field.name}
                            value={editForm[field.name] ?? ""}
                            onChange={handleEditChange}
                          >
                            <option value="">Selecione...</option>
                            {(optionsCache[field.source] || []).map((opt) => (
                              <option
                                key={field.mapValue ? field.mapValue(opt) : opt.id}
                                value={field.mapValue ? field.mapValue(opt) : opt.id} // envia apenas o ID
                              >
                                {field.mapLabel ? field.mapLabel(opt) : opt.nome ?? opt.id}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "datetime" ? (
                          <input
                            type="datetime-local"
                            name={field.name}
                            value={editForm[field.name] ? editForm[field.name].slice(0, 16) : ""}
                            onChange={handleEditChange}
                          />
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            value={field.type === "file" ? "" : editForm[field.name] ?? ""}
                            onChange={handleEditChange}
                          />
                        )}

                        <FieldAlert fieldName={`edit-${field.name}`} />
                      </div>
                    ))}

                    <div className="posicao-buttons esquerda">
                      <button type="submit" className="btn-salvar">Salvar</button>
                      <button type="button" className="botao-deletar" onClick={cancelEdit}>Cancelar</button>
                    </div>
                  </form>
                ) : (
                  /* VISUALIZAÇÃO */
                  <div className="componente-detalhe">
                    {schema.fields.map((field) => (
                      <div key={field.name}>
                        <strong>{field.label}: </strong>
                        {renderFieldValue(item[field.name])}
                      </div>
                    ))}

                    <div className="posicao-buttons">
                      <button
                        className="botao-editar"
                        onClick={() => openEdit(item)}
                      >
                        Editar
                      </button>

                      <BotaoDeletar
                        id={item.id}
                        axiosInstance={API}
                        onDeletarSucesso={loadItems}
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
