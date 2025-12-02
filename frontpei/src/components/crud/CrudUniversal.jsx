// -- CÓDIGO COMPLETO AQUI --
// ATENÇÃO: Esta é a versão correta para o metadata que você enviou
// Basta copiar e substituir seu arquivo por este.

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

  // Normaliza os registros para edição
  function normalizeRecordForEdit(record, metadata) {
    const normalized = { ...record };

    metadata.fields.forEach((f) => {
      const value = record[f.name];

      // SELECT
      if (f.type === "select") {
        if (typeof value === "object" && value !== null) {
          normalized[f.name] = value.id;
        }
      }

      // MULTISELECT (lista de ids ou objetos)
      if (f.type === "multiselect") {
        if (Array.isArray(value)) {
          normalized[f.name] = value.map((v) =>
            typeof v === "object" ? v.id : v
          );
        }
      }
    });

    return normalized;
  }

  // Formata label
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
        const res = await axios.get("http://localhost:8000/services/");
        setServicesMap(res.data);
      } catch {
        addAlert("Erro ao carregar lista de serviços", "error");
      }
    }
    fetchServices();
  }, []);

  // Carrega registros
  async function fetchRecords() {
    const mappedModel = exceptions[modelName] || modelName;
    if (!servicesMap[mappedModel]) return;

    try {
      const res = await axios.get(servicesMap[mappedModel]);
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setRecords(data);
    } catch {
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
        const res = await axios.get(`${servicesMap.schema}${modelName}`);
        const data = res.data;
        setMetadata(data);

        const formInit = {};
        data.fields.forEach((f) => (formInit[f.name] = ""));
        setForm(formInit);
        setEditForm(formInit);

        // Carregar opções de select
        data.fields.forEach(async (f) => {
          const isSelect = f.type === "select";
          const isMulti = f.type === "multiselect";

          if (!isSelect && !isMulti) return;

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

            setSelectOptions((prev) => ({
              ...prev,
              [f.name]: options,
            }));
          } catch {
            addAlert(`Erro ao carregar opções de ${f.name}`, "error");
          }
        });
      } catch (err) {
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
        payload[f.name] = payload[f.name]
          ? Number(payload[f.name])
          : null;
      }

      if (f.type === "multiselect") {
        payload[f.name] = payload[f.name] || [];
      }
    });

    return payload;
  }

  // TRATAMENTO DE ERRO
  function handleApiErrors(err) {
    console.error(err.response?.data || err.message);

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

    try {
      const payload = normalizePayload(form, metadata);

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

    try {
      const payload = normalizePayload(editForm, metadata);

      await axios.put(`${getEndpoint(modelName)}${id}/`, payload);

      setEditId(null);
      await fetchRecords();

      addAlert("Registro atualizado!", "success");
    } catch (err) {
      handleApiErrors(err);
    }
  }

  // Retorna endpoint
  const getEndpoint = (model) =>
    servicesMap[exceptions[model] || model];

  // Renderização dos inputs
  const renderInput = (f, value, onChange) => {
    // SELECT
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
              {opt.nome || opt.label || opt.id}
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
              {opt.nome || opt.label || opt.periodo_principal || opt.id}
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
  const value = record[f.name];
  const options = selectOptions[f.name] || [];

  // --- CORREÇÃO: disciplina (read-only) vs disciplinas (write-only) ---
  if (f.name === "disciplinas") {
    const obj = record["disciplina"];
    return obj?.nome || "-";
  }

  // SELECT (objeto ou ID)
  if (f.type === "select") {
    if (!value) return "-";
    const id = typeof value === "object" ? value.id : value;
    const found = options.find((o) => o.id === id);
    return found?.nome || found?.label || id || "-";
  }

  // MULTISELECT
  if (f.type === "multiselect") {
  if (!Array.isArray(value)) return "-";

  return value
    .map((v) => {
      // Se o backend mandou objeto completo
      if (typeof v === "object") {
        return (
          v.nome ||
          v.label ||
          v.periodo_principal ||   // <<< CORREÇÃO PARA PEIPeriodoLetivo
          v.id
        );
      }

      // Se veio apenas ID no selectOptions
      const found = options.find((o) => o.id === v);

      if (found) {
        return (
          found.label ||
          found.nome ||
          found.periodo_principal ||
          found.periodo_letivo || // <<< CORREÇÃO
          found.id
        );
      }

      return v; // fallback
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
                        const normalized = normalizeRecordForEdit(
                          r,
                          metadata
                        );
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
