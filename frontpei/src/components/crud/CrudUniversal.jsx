import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import BotaoDeletar from "../../components/customButtons/botaoDeletar";
import BotaoEditar from "../../components/customButtons/botaoEditar";
import "../../cssGlobal.css";

function CrudUniversal({ modelName }) {
  const { addAlert, clearAlerts } = useAlert();

  const [metadata, setMetadata] = useState(null);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectOptions, setSelectOptions] = useState({});
  const [servicesMap, setServicesMap] = useState({});

  const exceptions = {
    Disciplina: "disciplinas",
    ComponenteCurricular: "componenteCurricular",
    PEIPeriodoLetivo: "PEIPeriodoLetivo",
    CustomUser: "usuario",
    Curso: "cursos",
    Parecer: "parecer",
    PeiCentral: "pei_central",
  };

  const formatLabel = (label) => {
    if (!label) return "";
    let l = label.replace(/_/g, " ");
    l = l.replace(/\b\w/g, char => char.toUpperCase());
    return l;
  };

  useEffect(() => { clearAlerts(); }, []);

  // Carrega lista de serviços
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await axios.get("http://localhost:8000/services/");
        setServicesMap(res.data);
      } catch (err) {
        addAlert("Erro ao carregar lista de serviços", "error");
        setServicesMap({});
      }
    }
    fetchServices();
  }, []);

  async function fetchRecords() {
    const mappedModel = exceptions[modelName] || modelName;
    if (!servicesMap[mappedModel]) return;
    try {
      const res = await axios.get(servicesMap[mappedModel]);
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setRecords(data);
    } catch (err) {
      addAlert("Erro ao recuperar registros!", "error");
    }
  }

  useEffect(() => {
    if (!servicesMap || Object.keys(servicesMap).length === 0) return;
    fetchRecords();
  }, [servicesMap, modelName]);

  // Fetch metadata e opções de select
  useEffect(() => {
    async function fetchMetadata() {
      if (!servicesMap.schema) return;

      try {
        const res = await axios.get(`${servicesMap.schema}${modelName}`);
        const data = res.data;
        setMetadata(data);

        const initialForm = {};
        data.fields?.forEach(f => initialForm[f.name] = "");
        setForm(initialForm);
        setEditForm(initialForm);

        data.fields?.forEach(async f => {
          const isFK = f.type === "foreignkey";
          const isMulti = f.type === "multiselect";
          const isSelectWithModel = f.type === "select" && f.related_model;

          if (isFK || isMulti || isSelectWithModel) {
            try {
              const modelKey = f.related_model;
              const mappedKey = exceptions[modelKey] || modelKey;

              const endpoint =
                f.related_endpoint ||
                servicesMap[mappedKey] ||
                `http://localhost:8000/services/${mappedKey}/`;

              const r = await axios.get(endpoint);
              const options = Array.isArray(r.data) ? r.data : r.data?.results || [];

              setSelectOptions(prev => ({ ...prev, [f.name]: options }));
            } catch (err) {
              addAlert(`Erro ao carregar opções de ${f.name}`, "error");
            }
          }
        });
      } catch (err) {
        addAlert("Erro ao carregar metadados do modelo.", "error");
      }
    }
    fetchMetadata();
  }, [modelName, servicesMap]);

  function handleApiErrors(err) {
  console.error("Erro da requisição:", err.response?.data || err.message);

  if (err.response?.data) {
    const data = err.response.data;

    // Se for objeto, percorre cada campo
    if (typeof data === "object" && !Array.isArray(data)) {
      Object.entries(data).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach(msg => addAlert(`${field}: ${msg}`, "error", { fieldName: field }));
        } else if (typeof messages === "object") {
          // Caso seja objeto aninhado
          Object.entries(messages).forEach(([subField, subMsg]) => {
            addAlert(`${field}.${subField}: ${Array.isArray(subMsg) ? subMsg.join(", ") : subMsg}`, "error", { fieldName: field });
          });
        } else {
          addAlert(`${field}: ${messages}`, "error", { fieldName: field });
        }
      });
    } else if (Array.isArray(data)) {
      data.forEach(msg => addAlert(msg, "error"));
    } else {
      addAlert(data, "error");
    }
  } else {
    addAlert("Erro na requisição: " + (err.message || "desconhecido"), "error", { persist: true });
  }
}

  const getEndpoint = (model) => servicesMap[exceptions[model] || model];

  function normalizePayload(data, metadata) {
    const payload = { ...data };
    metadata.fields.forEach(f => {
      if (f.type === "foreignkey") payload[f.name] = payload[f.name] ? Number(payload[f.name]) : null;
      if (f.type === "multiselect") payload[f.name] = payload[f.name] || [];
    });
    return payload;
  }

  // CREATE
  async function handleSubmit(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach(m => addAlert(m.message, "error", { fieldName: m.fieldName }));
      return;
    }
    try {
      const payload = normalizePayload(form, metadata);
      
      await axios.post(getEndpoint(modelName), payload);
      await fetchRecords();
      setForm(Object.fromEntries(Object.keys(form).map(k => [k, ""])));
      addAlert("Registro cadastrado com sucesso!", "success");
    } catch (err) {
      handleApiErrors(err);
    }
  }

  // UPDATE
  async function handleEditSubmit(e, id) {
    e.preventDefault();
    const mensagens = validaCampos(editForm, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach(m => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` }));
      return;
    }
    try {
      const payload = normalizePayload(editForm, metadata);
      await axios.put(`${getEndpoint(modelName)}${id}/`, payload);
      setEditId(null);
      setEditForm(Object.fromEntries(Object.keys(editForm).map(k => [k, ""])));
      await fetchRecords();
      addAlert("Registro atualizado com sucesso!", "success");
    } catch (err) {
      handleApiErrors(err);
    }
  }

  // RENDER INPUT
  const renderInput = (f, value, onChange) => {
  

  if (f.type === "textarea") 
    return <textarea value={value || ""} onChange={e => onChange(e.target.value)} />;

  if (f.type === "DateField") 
    return <input type="date" value={value || ""} onChange={e => onChange(e.target.value)} />;

  if (f.type === "DateTimeField") 
    return <input type="datetime-local" value={value || ""} onChange={e => onChange(e.target.value)} />;

  if (f.choices) {
    return (
      <select value={value || ""} onChange={e => onChange(e.target.value)}>
        <option value="">Selecione...</option>
        {f.choices.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    );
  }

  if (f.type === "foreignkey" || (f.type === "select" && f.related_model)) {
    const options = selectOptions[f.name] || [];
    

    return (
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Selecione...</option>
        {options.map(opt => {
          // Escolhe o melhor label disponível
          const label =
            opt.nome ||
            opt.label ||
            (opt.first_name || opt.last_name ? `${opt.first_name || ""} ${opt.last_name || ""}`.trim() : opt.username) ||
            opt.id;
          return <option key={opt.id} value={opt.id}>{label}</option>;
        })}
      </select>
    );
  }

  if (f.type === "multiselect") {
    const options = selectOptions[f.name] || [];
    

    return (
      <div className="checkbox-group">
        {options.map(opt => {
          const label =
            opt.nome ||
            opt.label ||
            (opt.first_name || opt.last_name ? `${opt.first_name || ""} ${opt.last_name || ""}`.trim() : opt.username) ||
            opt.id;
          return (
            <label key={opt.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={(value || []).includes(opt.id)}
                onChange={e => {
                  const selected = new Set(value || []);
                  e.target.checked ? selected.add(opt.id) : selected.delete(opt.id);
                  onChange([...selected]);
                }}
              />
              {label}
            </label>
          );
        })}
      </div>
    );
  }

  if (f.type === "file") 
    return <input type="file" onChange={e => onChange(e.target.files[0])} />;

  return <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} />;
};


  // RENDER FIELD VALUE
  // RENDER FIELD VALUE (ajustada para objetos no registro)
// Mapeamento de campos _id para o nome real do objeto no registro
const idFieldMap = {
  disciplinas_id: "disciplina",
  periodo_letivo_id: "periodo_letivo",
  // adicione outros se houver
};

const renderFieldValue = (f, record) => {
  let value = record[f.name];

  // Se for campo *_id, tenta pegar o objeto correspondente
  if (f.name.endsWith("_id")) {
    const objField = idFieldMap[f.name] || f.name.replace(/_id$/, "");
    if (record[objField] && typeof record[objField] === "object") {
      value = record[objField];
    }
  }

  // Para foreign keys ou selects com related_model
  if ((f.type === "foreignkey" || (f.type === "select" && f.related_model)) && value) {
    if (typeof value === "object") {
      return (
        value.nome ||
        (value.first_name || value.last_name ? `${value.first_name || ""} ${value.last_name || ""}`.trim() : null) ||
        value.username ||
        "-"
      );
    }
    const options = selectOptions[f.name] || [];
    const found = options.find(opt => String(opt.id) === String(value));
    if (found) {
      return (
        found.nome ||
        (found.first_name || found.last_name ? `${found.first_name || ""} ${found.last_name || ""}`.trim() : null) ||
        found.username ||
        "-"
      );
    }
    return "-";
  }

  // Multiselect
  if (f.type === "multiselect") {
    let values = record[f.name];
    const options = selectOptions[f.name] || [];
    if (Array.isArray(values)) {
      return values
        .map(v => {
          const found = options.find(opt => String(opt.id) === String(v));
          return found
            ? found.nome ||
                (found.first_name || found.last_name ? `${found.first_name || ""} ${found.last_name || ""}`.trim() : found.username) ||
                v
            : v;
        })
        .join(", ");
    }
    return "-";
  }

  return value ?? "-";
};



  return (
    <div className="container-padrao">
      <h1>Gerenciar {metadata?.model}</h1>

      <form className="form-padrao" onSubmit={handleSubmit}>
        {metadata?.fields?.filter(f => f.name !== "id").map(f => (
          <div key={f.name}>
            <label>{f.label ? f.label : formatLabel(f.name)}:</label>
            {renderInput(f, form[f.name], val => setForm({ ...form, [f.name]: val }))}
            <FieldAlert fieldName={f.name} />
          </div>
        ))}
        <button type="submit" className="submit-btn">Adicionar</button>
      </form>

      <div className="list-padrao">
  <h3>Registros</h3>
  <ul>
    {records.length === 0 && <li>Nenhum registro.</li>}
    {records.map(r => {
      
      return (
        <li key={r.id}>
          {editId === r.id ? (
            <form onSubmit={e => handleEditSubmit(e, r.id)}>
              {metadata?.fields?.filter(f => f.name !== "id").map(f => (
                <div key={f.name}>
                  <label>{f.label ? f.label : formatLabel(f.name)}:</label>
                  {renderInput(f, editForm[f.name], val => setEditForm({ ...editForm, [f.name]: val }))}
                  <FieldAlert fieldName={`edit-${f.name}`} />
                </div>
              ))}
              <div className="posicao-buttons esquerda">
                <button type="submit" className="btn-salvar">Salvar</button>
                <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
              </div>
            </form>
          ) : (
            <div>
              {metadata?.fields?.filter(f => f.name !== "id").map(f => {
                const valor = renderFieldValue(f, r);
                
                return (
                  <div key={f.name}>
                    <strong>{f.label ? f.label : formatLabel(f.name)}:</strong>{" "}
                    {valor}
                  </div>
                );
              })}
              <div className="posicao-buttons">
                <BotaoEditar id={r.id} onClickInline={() => { setEditId(r.id); setEditForm(r); }} />
                <BotaoDeletar
                  id={r.id}
                  axiosInstance={getEndpoint(modelName)}
                  onDeletarSucesso={async () => { await fetchRecords(); addAlert("Registro deletado!", "success"); }}
                />
              </div>
            </div>
          )}
        </li>
      );
    })}
  </ul>
</div>

      <BotaoVoltar />
    </div>
  );
}

export default CrudUniversal;
