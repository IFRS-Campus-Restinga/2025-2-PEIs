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

  // Normaliza registro para edição
  function normalizeRecordForEdit(record, metadata) {
    const normalized = { ...record };

    Object.keys(record).forEach((key) => {
      const idKey = key + "_id";
      if (metadata.fields.some((f) => f.name === idKey)) {
        if (record[key] && typeof record[key] === "object") {
          normalized[idKey] = record[key].id;
        } else {
          normalized[idKey] = record[key];
        }
        delete normalized[key];
      }
    });

    metadata.fields.forEach((f) => {
      const original = record[f.name];

      // FOREIGN KEY
      if (f.type === "foreignkey") {
        if (original && typeof original === "object") {
          normalized[f.name] = original.id;
        }
      }

      // MULTISELECT
      if (f.type === "multiselect") {
        if (Array.isArray(original)) {
          normalized[f.name] = original.map((v) =>
            typeof v === "object" ? v.id : v
          );
        }
      }
    });

    return normalized;
  }

  const formatLabel = (label) => {
    if (!label) return "";
    let l = label.replace(/_/g, " ");
    l = l.replace(/\b\w/g, (char) => char.toUpperCase());
    return l;
  };

  useEffect(() => {
    clearAlerts();
  }, []);

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
        data.fields?.forEach((f) => (initialForm[f.name] = ""));
        setForm(initialForm);
        setEditForm(initialForm);

        data.fields?.forEach(async (f) => {
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
              const options = Array.isArray(r.data)
                ? r.data
                : r.data?.results || [];

              setSelectOptions((prev) => ({ ...prev, [f.name]: options }));
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
    let data = err.response?.data;

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        addAlert(data, "error");
        return;
      }
    }

    if (data?.erro) {
      addAlert(data.erro, "error");
      return;
    }

    if (typeof data === "object" && !Array.isArray(data)) {
      Object.entries(data).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) =>
            addAlert(`${field}: ${msg}`, "error")
          );
        } else {
          addAlert(`${field}: ${messages}`, "error");
        }
      });
      return;
    }

    if (Array.isArray(data)) {
      data.forEach((msg) => addAlert(msg, "error"));
      return;
    }

    addAlert("Erro na requisição: " + (err.message || "desconhecido"), "error");
  }

  const getEndpoint = (model) => servicesMap[exceptions[model] || model];

  function normalizePayload(data, metadata) {
    const payload = { ...data };
    metadata.fields.forEach((f) => {
      if (f.type === "foreignkey")
        payload[f.name] = payload[f.name] ? Number(payload[f.name]) : null;
      if (f.type === "multiselect") payload[f.name] = payload[f.name] || [];
    });
    return payload;
  }

  // CREATE
  async function handleSubmit(e) {
    e.preventDefault();
    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach((m) =>
        addAlert(m.message, "error", { fieldName: m.fieldName })
      );
      return;
    }
    try {
      const payload = normalizePayload(form, metadata);
      await axios.post(getEndpoint(modelName), payload);
      await fetchRecords();
      setForm(Object.fromEntries(Object.keys(form).map((k) => [k, ""])));
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
      mensagens.forEach((m) =>
        addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` })
      );
      return;
    }

    try {
      const payload = normalizePayload(editForm, metadata);
      await axios.put(`${getEndpoint(modelName)}${id}/`, payload);
      setEditId(null);
      setEditForm(Object.fromEntries(Object.keys(editForm).map((k) => [k, ""])));
      await fetchRecords();
      addAlert("Registro atualizado com sucesso!", "success");
    } catch (err) {
      handleApiErrors(err);
    }
  }

  // RENDER INPUT
  const renderInput = (f, value, onChange) => {
    if (f.type === "textarea")
      return <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    if (f.type === "DateField")
      return <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} />;
    if (f.type === "DateTimeField")
      return <input type="datetime-local" value={value || ""} onChange={(e) => onChange(e.target.value)} />;

    if (f.choices) {
      return (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecione...</option>
          {f.choices.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      );
    }

    if (f.type === "foreignkey" || (f.type === "select" && f.related_model)) {
  const options = selectOptions[f.name] || [];
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">Selecione...</option>
      {options.map((opt) => {
        const label =
          opt.nome || // valor direto
          opt.label ||
          (opt.aluno && opt.aluno.nome) || //  CORREÇÃO AQUI
          (opt.first_name || opt.last_name
            ? `${opt.first_name || ""} ${opt.last_name || ""}`.trim()
            : null) ||
          opt.username ||
          opt.id;

        return (
          <option key={opt.id} value={opt.id}>
            {label}
          </option>
        );
      })}
    </select>
  );
}


    if (f.type === "multiselect") {
      const options = selectOptions[f.name] || [];
      return (
        <div className="checkbox-group">
          {options.map((opt) => {
            const label =
              opt.nome ||
              (opt.first_name || opt.last_name ? `${opt.first_name || ""} ${opt.last_name || ""}`.trim() : opt.username) ||
              opt.id;
            return (
              <label key={opt.id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.id)}
                  onChange={(e) => {
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

    if (f.type === "file") return <input type="file" onChange={(e) => onChange(e.target.files[0])} />;
    return <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} />;
  };

  // RENDER FIELD VALUE
  const renderFieldValue = (f, record) => {
    let value = record[f.name];
    const options = selectOptions[f.name] || [];

    // ForeignKey / Select
    if ((f.type === "foreignkey" || (f.type === "select" && f.related_model)) && value) {
      if (typeof value === "object") {
        return value.nome ||
          (value.first_name || value.last_name ? `${value.first_name || ""} ${value.last_name || ""}`.trim() : value.username) ||
          "-";
      }
      const found = options.find((opt) => String(opt.id) === String(value));
      if (found) {
        return found.nome ||
          (found.first_name || found.last_name ? `${found.first_name || ""} ${found.last_name || ""}`.trim() : found.username) ||
          "-";
      }
      return "-";
    }

    // Multiselect
    if (f.type === "multiselect") {
      if (!Array.isArray(value)) return "-";
      return value
        .map((v) => {
          const id = typeof v === "object" ? v.id : v;
          const found = options.find((opt) => String(opt.id) === String(id));
          if (!found) return id;
          return (
            found.nome ||
            (found.first_name || found.last_name ? `${found.first_name || ""} ${found.last_name || ""}`.trim() : found.username) ||
            id
          );
        })
        .join(", ");
    }

    return value ?? "-";
  };

  return (
    <div className="container-padrao">
      <h1>Gerenciar {metadata?.model}</h1>

      <form className="form-padrao" onSubmit={handleSubmit}>
        {metadata?.fields?.filter((f) => f.name !== "id").map((f) => (
          <div key={f.name}>
            <label>{f.label ? f.label : formatLabel(f.name)}:</label>
            {renderInput(f, form[f.name], (val) => setForm({ ...form, [f.name]: val }))}
            <FieldAlert fieldName={f.name} />
          </div>
        ))}
        <button type="submit" className="submit-btn">Adicionar</button>
      </form>

      <div className="list-padrao">
        <h3>Registros</h3>
        <ul>
          {records.length === 0 && <li>Nenhum registro.</li>}
          {records.map((r) => (
            <li key={r.id}>
              {editId === r.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, r.id)}>
                  {metadata?.fields?.filter((f) => f.name !== "id").map((f) => (
                    <div key={f.name}>
                      <label>{f.label ? f.label : formatLabel(f.name)}:</label>
                      {renderInput(f, editForm[f.name], (val) =>
                        setEditForm({ ...editForm, [f.name]: val })
                      )}
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
                  {metadata?.fields?.filter((f) => f.name !== "id").map((f) => (
                    <div key={f.name}>
                      <strong>{f.label ? f.label : formatLabel(f.name)}:</strong>{" "}
                      {renderFieldValue(f, r)}
                    </div>
                  ))}
                  <div className="posicao-buttons">
                    <BotaoEditar id={r.id} onClickInline={() => {
                      const normalized = normalizeRecordForEdit(r, metadata);
                      setEditId(r.id);
                      setEditForm(normalized);
                    }} />
                    <BotaoDeletar
                      id={r.id}
                      axiosInstance={getEndpoint(modelName)}
                      onDeletarSucesso={async () => {
                        await fetchRecords();
                        addAlert("Registro deletado!", "success");
                      }}
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

export default CrudUniversal;
