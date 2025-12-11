
import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import BotaoDeletar from "../../components/customButtons/botaoDeletar";
import BotaoEditar from "../../components/customButtons/botaoEditar";
import "../../cssGlobal.css";
import { api } from "../../services/api";


function CrudUniversal({ modelName }) {
  const { addAlert } = useAlert();

  const [metadata, setMetadata] = useState(null);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectOptions, setSelectOptions] = useState({});
  const [servicesMap, setServicesMap] = useState({});


  // Mapeamento de exceções
  const exceptions = {
    Disciplina: "disciplinas",
    ComponenteCurricular: "componenteCurricular",
    PEIPeriodoLetivo: "PEIPeriodoLetivo",
    CustomUser: "usuario",
    Curso: "cursos",
    Parecer: "parecer",
    PeiCentral: "pei_central",
  };

  function normalizeRecordForEdit(record, metadata) {
  const normalized = { ...record };

  metadata.fields.forEach((f) => {
    const value = record[f.name];

    if (f.name === "disciplinas") {
      // Backend manda "disciplina: { id, nome }"
      if (record.disciplina) {
        normalized.disciplinas = record.disciplina.id;
      }
      return;
    }

    if (f.type === "select") {
      normalized[f.name] =
        typeof value === "object" && value !== null ? value.id : value;
    }

    if (f.type === "multiselect") {
      normalized[f.name] = Array.isArray(value)
        ? value.map((v) => (typeof v === "object" ? v.id : v))
        : [];
    }
  });

  return normalized;
}

  const formatLabel = (label) => {
    if (!label) return "";
    let l = label.replace(/_/g, " ");
    return l.replace(/\b\w/g, (c) => c.toUpperCase());
  };


  // Carrega serviços
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get("http://localhost:8000/services/");
        setServicesMap(res.data);
      } catch (err) {
        console.error("[SERVICES] Erro:", err);
        addAlert("Erro ao carregar lista de serviços", "error");
      }
    }
    fetchServices();
  }, []);

  // Carrega registros
  async function fetchRecords() {
    const mappedModel = exceptions[modelName] || modelName;
    const url = servicesMap[mappedModel];


    if (!url) return;

    try {
      const res = await api.get(url);


      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];


      setRecords(data);
    } catch (err) {
      console.error("[RECORDS] Erro:", err);
      addAlert("Erro ao recuperar registros!", "error");
    }
  }

  useEffect(() => {
    if (Object.keys(servicesMap).length === 0) return;
    fetchRecords();
  }, [servicesMap, modelName]);

  // Carrega metadata
  useEffect(() => {
    async function loadMetadata() {
      if (!servicesMap.schema) return;

      

      try {
        const res = await api.get(`${servicesMap.schema}${modelName}`);

        const data = res.data;
        setMetadata(data);

        // Carregar opções de selects/multiselects
        data.fields.forEach(async (f) => {

          const isSelect = f.type === "select";
          const isMulti = f.type === "multiselect";

          if (f.choices) {
            return;
          }

          if (!isSelect && !isMulti) return;
          if (!f.related_model) return;

          try {
            const mappedKey = exceptions[f.related_model] || f.related_model;

            const endpoint =
              f.related_endpoint ||
              servicesMap[mappedKey] ||
              `http://localhost:8000/services/${mappedKey}/`;


            const r = await api.get(endpoint);

            const options = Array.isArray(r.data)
              ? r.data
              : r.data?.results || [];


            setSelectOptions((prev) => ({
              ...prev,
              [f.name]: options,
            }));
          } catch (err) {
            console.error(`[SELECT LOAD] Erro carregando ${f.name}:`, err);
            addAlert(`Erro ao carregar opções de ${f.name}`, "error");
          }
        });
      } catch (err) {
        console.error("[METADATA] Erro:", err);
        addAlert("Erro ao carregar metadata!", "error");
      }
    }

    loadMetadata();
  }, [modelName, servicesMap]);

  // Normalização do payload
  function normalizePayload(data, metadata) {

    const payload = { ...data };

    metadata.fields.forEach((f) => {
      if (f.type === "select") {
        if (!f.choices) {
          payload[f.name] = payload[f.name]
            ? Number(payload[f.name])
            : null;
        }
      }

      if (f.type === "multiselect") {
        payload[f.name] = payload[f.name] || [];
      }
    });
     // --- CONDIÇÃO CUSTOM PARA ComponenteCurricular ---
    if (modelName === "ComponenteCurricular") {

      // Se o form tiver periodos_letivos (multiselect), enviamos isso como periodos_letivos_id
      if (Array.isArray(payload.periodos_letivos)) {
        payload.periodos_letivos_id = payload.periodos_letivos.map(Number);
      }

      // Segurança: remove a chave errada caso exista
      delete payload.periodos_letivos;
    }
    
    return payload;
  }

  // TRATAMENTO DE ERRO
  function handleApiErrors(err) {
    console.error("[API ERROR]", err.response?.data || err.message);

    let data = err.response?.data;

    if (typeof data === "string") {
      addAlert(data, "error");
      return;
    }

    if (typeof data === "object" && !Array.isArray(data)) {
      Object.entries(data).forEach(([field, msg]) => {
        if (Array.isArray(msg)) {
          msg.forEach((m) => addAlert(`${field}: ${m}`, "error"));
        } else {
          addAlert(`${field}: ${msg}`, "error");
        }
      });
      return;
    }

    addAlert("Erro desconhecido.", "error");
  }

  // CREATE
  async function handleSubmit(e) {
  e.preventDefault();

  // 1) Valida sem apagar nada
  const erros = validaCampos(form, metadata, null, "", addAlert);
  if (erros.length > 0) return;

  // 2) Limpa só os toasts

  try {
    const payload = normalizePayload(form, metadata);
    await api.post(getEndpoint(modelName), payload);
    await fetchRecords();

    addAlert("Registro criado!", "success");

    // 3) Reset form
    setForm(Object.fromEntries(Object.keys(form).map(k => [k, ""])));

  } catch (err) {
    const backendErrors = err.response?.data;
    validaCampos(form, metadata, backendErrors, "", addAlert);
  }
}


  // UPDATE
  async function handleEditSubmit(e, id) {
  e.preventDefault();

  

  const erros = validaCampos(editForm, metadata, null, "", addAlert);
  if (erros.length > 0) return;

  try {
    const payload = normalizePayload(editForm, metadata);
    await api.put(`${getEndpoint(modelName)}${id}/`, payload);

    setEditId(null);
    await fetchRecords();

    addAlert("Registro atualizado!", "success");
    clearAlerts();
  } catch (err) {
    const backendErrors = err.response?.data;
    validaCampos(editForm, metadata, backendErrors, "");
  }
}


  const getEndpoint = (model) => servicesMap[exceptions[model] || model];

  // Renderização dos inputs
  const renderInput = (f, value, onChange) => {
    
    // Normalização dos tipos vindos do schema DRF
    let fieldType = f.type;

    // DateField → date
    if (f.type === "DateField") {
      fieldType = "date";
    }

    // DateTimeField → datetime
    if (f.type === "DateTimeField") {
      fieldType = "datetime";
    }
    // FileField → file
    if (f.type === "FileField") {
      fieldType = "file";
    }
    // SELECT (ENUM)
    if (f.type === "select" && f.choices) {
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Selecione...</option>
          {f.choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      );
    }

    // SELECT FK
    if (f.type === "select") {
      const options = selectOptions[f.name] || [];


      return (
        <select
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.nome || opt.aluno_nome || opt.label || opt.username || opt.id}
            </option>
          ))}
        </select>
      );
    }

    // MULTISELECT
    if (f.type === "multiselect") {
      const options = selectOptions[f.name] || [];


      return (
        <div>
          {options.map((opt) => (
            <label key={opt.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={(value || []).includes(opt.id)}
                onChange={(e) => {
                  const list = new Set(value || []);
                  e.target.checked
                    ? list.add(opt.id)
                    : list.delete(opt.id);
                  onChange([...list]);
                }}
              />
              {opt.nome ||
                opt.username ||
                opt.label ||
                opt.periodo_principal ||
                opt.id}
            </label>
          ))}
        </div>
      );
    }
    // DATE
    if (fieldType === "date") {
      return (
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    // DATETIME
    if (fieldType === "datetime") {
      return (
        <input
          type="datetime-local"
          value={value ? value.substring(0, 16) : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    // FILE
    if (fieldType === "file") {
      return (
        <input
          type="file"
          onChange={(e) => onChange(e.target.files[0])}
        />
      );
    }
    // TEXT
    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  // Renderiza valores na listagem
  const renderFieldValue = (f, record) => {

    const value = record[f.name];
    const options = selectOptions[f.name] || [];

    if (f.name === "disciplinas") {
      
      // Se for multiselect, usa a lógica padrão de multiselect
      if (f.type === "multiselect") {
        return value && value.length
          ? value
              .map((v) => {
                if (typeof v === "object") {
                  return v.nome || v.label || v.id;
                }
                const found = selectOptions["disciplinas"]?.find(
                  (o) => o.id === v
                );
                return found?.nome || v;
              })
              .join(", ")
          : "-";
      }
      
      // Se NÃO for multiselect, usa sua lógica original (para outro model)
      const obj = record["disciplina"];
      return obj?.nome || "-";
    }

    if (f.type === "select" && f.choices) {
      const found = f.choices.find((c) => c.value === value);
      return found?.label || value || "-";
    }

    if (f.type === "select") {
      const id = typeof value === "object" ? value.id : value;
      const found = options.find((o) => o.id === id);
      return found?.nome || found?.aluno_nome || found?.label || found?.username || id || "-";
    }

    if (f.type === "multiselect") {
      if (!Array.isArray(value)) return "-";

      return value
        .map((v) => {
          if (typeof v === "object") {
            return v.nome || v.label || v.periodo_principal || v.username || v.id;
          }

          const found = options.find((o) => o.id === v);

          if (found) {
            return (
              (found.label ||
                found.nome ||
                found.username ||
                found.periodo_principal ||
                found.periodo_letivo) ??
              found.id
            );
          }

          return v;
        })
        .join(", ");
    }
    // FILE FIELD
if (f.type === "FileField" || f.type === "file") {
  if (!value) return "-";

  // Se vier objeto com URL
  if (typeof value === "object" && value.url) {
    return (
      <a href={value.url} target="_blank" rel="noreferrer">
        {value.name || "Arquivo"}
      </a>
    );
  }

  // Se vier somente a URL
  if (typeof value === "string") {
    return (
      <a href={value} target="_blank" rel="noreferrer">
        {value.split("/").pop()}
      </a>
    );
  }

  return "-";
}
    return value ?? "-";
  };

  return (
    <div className="container-padrao">
      <h1>Gerenciar {metadata?.model}</h1>

      {/* FORM CREATE */}
      <form className="form-padrao" onSubmit={handleSubmit}>
        {metadata?.fields
          ?.filter((f) => f.name !== "id")
          .map((f) => (
            <div key={f.name}>
              <label>{formatLabel(f.name)}:</label>
              {renderInput(f, form[f.name], (val) =>
                setForm({ ...form, [f.name]: val })
              )}
              <FieldAlert fieldName={f.name} />
            </div>
          ))}
        <button type="submit" className="submit-btn">
          Adicionar
        </button>
      </form>

      {/* LIST */}
      <div className="list-padrao">
        <h3>Registros</h3>
        <ul>
          {records.length === 0 && <li>Nenhum registro.</li>}
          {records.map((r) => (
            <li key={r.id}>
              {editId === r.id ? (
                <form onSubmit={(e) => handleEditSubmit(e, r.id)}>
                  {metadata?.fields
                    ?.filter((f) => f.name !== "id")
                    .map((f) => (
                      <div key={f.name}>
                        <label>{formatLabel(f.name)}:</label>

                        {renderInput(f, editForm[f.name], (val) =>
                          setEditForm({ ...editForm, [f.name]: val })
                        )}

                        <FieldAlert fieldName={`edit-${f.name}`} />
                      </div>
                    ))}

                  <div className="posicao-buttons esquerda">
                    <button type="submit" className="btn-salvar">
                      Salvar
                    </button>
                    <button type="button" class="botao-deletar" onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {metadata?.fields
                    ?.filter((f) => f.name !== "id")
                    .map((f) => (
                      <div key={f.name}>
                        <strong>{formatLabel(f.name)}:</strong>{" "}
                        {renderFieldValue(f, r)}
                      </div>
                    ))}

                  <div className="posicao-buttons">
                    <BotaoEditar
                      id={r.id}
                      onClickInline={() => {
                        const normalized = normalizeRecordForEdit(r, metadata);

                        setEditId(r.id);
                        setEditForm(normalized);
                      }}
                    />
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
