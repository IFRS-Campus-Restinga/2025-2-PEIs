import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import BotaoDeletar from "../../components/customButtons/botaoDeletar";
import BotaoEditar from "../../components/customButtons/botaoEditar";
import "../../cssGlobal.css";

function CrudUniversal({ modelName }) {
  console.log("CrudUniversal renderizado com modelName:", modelName);

  const { addAlert, clearAlerts } = useAlert();

  const [metadata, setMetadata] = useState(null);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectOptions, setSelectOptions] = useState({});
  const [servicesMap, setServicesMap] = useState({});

  // Função para formatar labels legíveis
  const formatLabel = (label) => {
    if (!label) return "";
    // Substitui underscores por espaço e capitaliza cada palavra
    let l = label.replace(/_/g, " ");
    l = l.replace(/\b\w/g, char => char.toUpperCase());
    return l;
  };

  useEffect(() => {
    console.log("useEffect clearAlerts rodou");
    clearAlerts();
  }, []);

  // Lista de endpoints disponíveis
  useEffect(() => {
    console.log("useEffect fetchServices rodou");
    async function fetchServices() {
      try {
        const res = await axios.get("http://localhost:8000/services/");
        setServicesMap(res.data);
        console.log("Serviços carregados:", res.data);
      } catch (err) {
        addAlert("Erro ao carregar lista de serviços", "error");
        setServicesMap({});
        console.log("Erro ao carregar serviços:", err.message);
      }
    }
    fetchServices();
  }, []);

  const exceptions = {
    Disciplina: "disciplinas",
    ComponenteCurricular: "componenteCurricular",
    PEIPeriodoLetivo: "PEIPeriodoLetivo",
    CustomUser: "usuario",
    Curso: "cursos",
    Parecer: "parecer",
  };

  // Busca metadados
  useEffect(() => {
    console.log("useEffect fetchMetadata rodou");
    async function fetchMetadata() {
      console.log("servicesMap:", servicesMap);
      if (!servicesMap.schema) return;

      try {
        const res = await axios.get(`${servicesMap.schema}${modelName}`);
        const data = res.data;
        console.log("Metadata carregado:", data);
        setMetadata(data);

        const initialForm = {};
        data.fields?.forEach(f => initialForm[f.name] = "");
        setForm(initialForm);
        setEditForm(initialForm);

        // Busca opções de select/foreignkey
        data.fields?.forEach(async f => {
          if (f.type === "foreignkey" || f.type === "select") {
            try {
              const modelKey = f.related_model;
              const mappedKey = exceptions[modelKey] || modelKey;
              const endpoint = f.related_endpoint || servicesMap[mappedKey] || `http://localhost:8000/services/${mappedKey}/`;

              const r = await axios.get(endpoint);
              const options = Array.isArray(r.data) ? r.data : r.data?.results || [];
              setSelectOptions(prev => ({ ...prev, [f.name]: options }));
              console.log(`Opções carregadas para ${f.name}:`, options);
            } catch (err) {
              addAlert(`Erro ao carregar opções de ${f.name}`, "error");
              console.log(`Erro ao carregar opções de ${f.name}:`, err.message);
            }
          }
        });
      } catch (err) {
        addAlert("Erro ao carregar metadados do modelo.", "error");
        console.log("Erro ao carregar metadata:", err.message);
      }
    }
    fetchMetadata();
  }, [modelName, servicesMap]);

  // Busca registros
  useEffect(() => {
    console.log("useEffect fetchRecords rodou");
    const mappedModel = exceptions[modelName] || modelName;
    if (!metadata?.fields?.length || !servicesMap[mappedModel]) return;

    async function recuperaRegistros() {
      try {
        const res = await axios.get(servicesMap[mappedModel]);
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setRecords(data);
        console.log("Registros carregados:", data);
      } catch (err) {
        addAlert("Erro ao recuperar registros!", "error");
        console.log("Erro ao carregar registros:", err.message);
      }
    }
    recuperaRegistros();
  }, [metadata, servicesMap, modelName]);

  function handleApiErrors(err) {
    if (err.response?.data) {
      Object.entries(err.response.data).forEach(([f, m]) =>
        addAlert(Array.isArray(m) ? m.join(", ") : m, "error", { fieldName: f })
      );
    } else {
      addAlert("Erro na requisição.", "error", { persist: true });
    }
    console.log("Erro da API:", err.response?.data || err.message);
  }

  const getEndpoint = (model) => servicesMap[exceptions[model] || model];

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("handleSubmit chamado com form:", form);

    const mensagens = validaCampos(form, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach(m => addAlert(m.message, "error", { fieldName: m.fieldName }));
      return;
    }

    try {
      const payload = modelName === "Parecer" ? {
        componente_curricular: Number(form.componente_curricular),
        professor_id: Number(form.professor),
        texto: form.texto,
        data: form.data
      } : form;

      console.log("Payload formatado para criar:", payload);

      await axios.post(getEndpoint(modelName), payload);
      setForm(Object.fromEntries(Object.keys(form).map(k => [k, ""])));
      setRecords(prev => [...prev]);
      addAlert("Registro cadastrado com sucesso!", "success");
    } catch (err) {
      handleApiErrors(err);
    }
  }

  async function handleEditSubmit(e, id) {
    e.preventDefault();
    console.log(`handleEditSubmit chamado para ID ${id} com editForm:`, editForm);

    const mensagens = validaCampos(editForm, e.target);
    if (mensagens.length > 0) {
      mensagens.forEach(m => addAlert(m.message, "error", { fieldName: `edit-${m.fieldName}` }));
      return;
    }

    try {
      const payload = modelName === "Parecer" ? {
        componente_curricular: Number(editForm.componente_curricular),
        professor_id: Number(editForm.professor),
        texto: editForm.texto,
        data: editForm.data
      } : editForm;

      console.log("Payload formatado para edição:", payload);

      await axios.put(`${getEndpoint(modelName)}${id}/`, payload);
      setEditId(null);
      setEditForm(Object.fromEntries(Object.keys(editForm).map(k => [k, ""])));
      setRecords(prev => [...prev]);
      addAlert("Registro atualizado com sucesso!", "success");
    } catch (err) {
      handleApiErrors(err);
    }
  }

  if (!metadata) return <div>Carregando...</div>;

  const renderInput = (f, value, onChange) => {
    if (f.type === "textarea") return <textarea value={value || ""} onChange={e => onChange(e.target.value)} />;
    if (f.type === "DateField") return <input type="date" value={value || ""} onChange={e => onChange(e.target.value)} />;
    if (f.type === "DateTimeField") return <input type="datetime-local" value={value || ""} onChange={e => onChange(e.target.value)} />;

    if (f.type === "foreignkey" || f.type === "select") {
      return (
        <select value={value || ""} onChange={e => onChange(e.target.value)}>
          <option value="">Selecione...</option>
          {(selectOptions[f.name] || []).map(opt => {
            if (f.related_model === "ComponenteCurricular") return <option key={opt.id} value={opt.id}>{opt.disciplina?.nome || "-"}</option>;
            if (f.related_model === "PEIPeriodoLetivo") return <option key={opt.id} value={opt.id}>{opt.periodo_principal || "-"}</option>;
            if (f.related_model === "CustomUser") return <option key={opt.id} value={opt.id}>{opt.username || "-"}</option>;
            return <option key={opt.id} value={opt.id}>{opt.nome || opt.label || opt.id}</option>;
          })}
        </select>
      );
    }

    if (f.type === "integer" || f.type === "float") return <input type="number" value={value || ""} onChange={e => onChange(e.target.value)} />;
    return <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} />;
  };

  return (
    <div className="container-padrao">
      <h1>Gerenciar {metadata?.model}</h1>

      <form className="form-padrao" onSubmit={handleSubmit}>
        {metadata?.fields
          ?.filter(f => f.name !== "id")
          .map(f => (
            <div key={f.name}>
              <label>{f.label ? f.label : formatLabel(f.name)}:</label>
              {renderInput(f, form[f.name], val => { setForm({ ...form, [f.name]: val }); console.log(`Form atualizado ${f.name}:`, val); })}
              <FieldAlert fieldName={f.name} />
            </div>
        ))}
        <button type="submit" className="submit-btn">Adicionar</button>
      </form>

      <div className="list-padrao">
        <h3>Registros</h3>
        <ul>
          {records.length === 0 && <li>Nenhum registro.</li>}
          {records.map(r => (
            <li key={r.id}>
              {editId === r.id ? (
                <form onSubmit={e => handleEditSubmit(e, r.id)}>
                  {metadata?.fields
                    ?.filter(f => f.name !== "id")
                    .map(f => (
                      <div key={f.name}>
                        <label>{f.label ? f.label : formatLabel(f.name)}:</label>
                        {renderInput(f, editForm[f.name], val => { setEditForm({ ...editForm, [f.name]: val }); console.log(`EditForm atualizado ${f.name}:`, val); })}
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
                  {metadata?.fields
                    ?.filter(f => f.name !== "id")
                    .map(f => (
                      <div key={f.name}>
                        <strong>{f.label ? f.label : formatLabel(f.name)}:</strong>{" "}
                        {(f.type === "foreignkey" || f.type === "select")
                          ? selectOptions[f.name]?.find(opt => opt.id === Number(r[f.name]))?.nome
                            || selectOptions[f.name]?.find(opt => opt.id === Number(r[f.name]))?.periodo_principal
                            || selectOptions[f.name]?.find(opt => opt.id === Number(r[f.name]))?.username
                            || "-"
                          : r[f.name] || "-"}
                      </div>
                  ))}
                  <div className="posicao-buttons">
                    <BotaoEditar id={r.id} onClickInline={() => { setEditId(r.id); setEditForm(r); console.log("Editando registro:", r); }} />
                    <BotaoDeletar id={r.id} axiosInstance={getEndpoint(modelName)} onDeletarSucesso={() => { setRecords(prev => prev.filter(x => x.id !== r.id)); console.log("Registro deletado:", r.id); }} />
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
