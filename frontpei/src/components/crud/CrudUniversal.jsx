// --- CÓDIGO COMPLETO COM CONSOLE.LOGS ---

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

  console.log("[INIT] Renderizou CrudUniversal para:", modelName);

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
    console.log("[NORMALIZE RECORD] Entrada:", record);

    const normalized = { ...record };

    metadata.fields.forEach((f) => {
      const value = record[f.name];

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

    console.log("[NORMALIZE RECORD] Saída:", normalized);
    return normalized;
  }

  const formatLabel = (label) => {
    if (!label) return "";
    let l = label.replace(/_/g, " ");
    return l.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    clearAlerts();
  }, []);

  // Carrega serviços
  useEffect(() => {
    async function fetchServices() {
      try {
        console.log("[SERVICES] Buscando lista de serviços...");
        const res = await axios.get("http://localhost:8000/services/");
        console.log("[SERVICES] Recebido:", res.data);
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

    console.log("[RECORDS] Buscando registros em:", url);

    if (!url) return;

    try {
      const res = await axios.get(url);

      console.log("[RECORDS] Dados crus recebidos:", res.data);

      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];

      console.log("[RECORDS] Dados normalizados:", data);

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

      console.log(
        `[METADATA] Buscando metadata em: ${servicesMap.schema}${modelName}`
      );

      try {
        const res = await axios.get(`${servicesMap.schema}${modelName}`);
        console.log("[METADATA] Recebido:", res.data);

        const data = res.data;
        setMetadata(data);

        // Carregar opções de selects/multiselects
        data.fields.forEach(async (f) => {
          console.log(`[SELECT LOAD] Campo encontrado:`, f);

          const isSelect = f.type === "select";
          const isMulti = f.type === "multiselect";

          if (f.choices) {
            console.log(`[SELECT LOAD] Campo ${f.name} é ENUM, ignorando.`);
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

            console.log(`[SELECT LOAD] Buscando opções em:`, endpoint);

            const r = await axios.get(endpoint);

            const options = Array.isArray(r.data)
              ? r.data
              : r.data?.results || [];

            console.log(`[SELECT LOAD] Opções recebidas para ${f.name}:`, options);

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
    console.log("[PAYLOAD] Normalizando:", data);

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

    console.log("[PAYLOAD] Final:", payload);
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

    console.log("[CREATE] Form enviado:", form);

    try {
      const payload = normalizePayload(form, metadata);

      console.log("[CREATE] Payload enviado ao backend:", payload);

      await axios.post(getEndpoint(modelName), payload);
      await fetchRecords();

      setForm(
        Object.fromEntries(Object.keys(form).map((k) => [k, ""]))
      );

      addAlert("Registro criado!", "success");
    } catch (err) {
      handleApiErrors(err);
    }
  }

  // UPDATE
  async function handleEditSubmit(e, id) {
    e.preventDefault();

    console.log("[UPDATE] Edit form:", editForm);

    try {
      const payload = normalizePayload(editForm, metadata);

      console.log("[UPDATE] Payload enviado:", payload);

      await axios.put(`${getEndpoint(modelName)}${id}/`, payload);

      setEditId(null);
      await fetchRecords();

      addAlert("Registro atualizado!", "success");
    } catch (err) {
      handleApiErrors(err);
    }
  }

  const getEndpoint = (model) => servicesMap[exceptions[model] || model];

  // Renderização dos inputs
  const renderInput = (f, value, onChange) => {
    console.log(
      `[RENDER INPUT] Campo: ${f.name}, Tipo: ${f.type}, Valor:`,
      value
    );

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

      console.log(`[RENDER INPUT] Opções carregadas para ${f.name}:`, options);

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
              {opt.nome || opt.label || opt.username || opt.id}
            </option>
          ))}
        </select>
      );
    }

    // MULTISELECT
    if (f.type === "multiselect") {
      const options = selectOptions[f.name] || [];

      console.log(
        `[RENDER MULTI] Opções para ${f.name}:`,
        options
      );

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
    console.log("[RENDER FIELD VALUE] Campo:", f.name, "Record:", record);

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
  console.log("[RENDER] disciplina (detalhe):", obj);
  return obj?.nome || "-";
}

    if (f.type === "select" && f.choices) {
      const found = f.choices.find((c) => c.value === value);
      return found?.label || value || "-";
    }

    if (f.type === "select") {
      const id = typeof value === "object" ? value.id : value;
      const found = options.find((o) => o.id === id);
      return found?.nome || found?.label || found?.username || id || "-";
    }

    if (f.type === "multiselect") {
      if (!Array.isArray(value)) return "-";

      return value
        .map((v) => {
          if (typeof v === "object") {
            return v.nome || v.label || v.periodo_principal || username || v.id;
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
                    <button type="button" onClick={() => setEditId(null)}>
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
                        console.log("[EDIT] Normalizando registro:", r);
                        const normalized = normalizeRecordForEdit(r, metadata);
                        console.log("[EDIT] Normalizado:", normalized);

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
