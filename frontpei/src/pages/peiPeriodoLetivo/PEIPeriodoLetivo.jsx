import { useState, useEffect } from "react";
import axios from "axios";
import { useAlert, FieldAlert } from "../../context/AlertContext";
import { validaCampos } from "../../utils/validaCampos";
import { Link } from "react-router-dom";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import { API_ROUTES } from "../../configs/apiRoutes";

function PEIPeriodoLetivo() {
  const { addAlert, clearFieldAlert, clearAlerts } = useAlert();

  useEffect(() => {
    // limpa todos os alertas ao entrar na tela
    clearAlerts();
  }, []);

  const DB = axios.create({ baseURL: API_ROUTES.PEIPERIODOLETIVO });
  const DB_CENTRAL = axios.create({ baseURL: API_ROUTES.PEI_CENTRAL });

  const [dataCriacao, setDataCriacao] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [periodoEscolhido, setPeriodoEscolhido] = useState("");
  const [peiCentralId, setPeiCentralId] = useState("");
  const [peiCentrals, setPeiCentrals] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    dataCriacao: "",
    dataTermino: "",
    periodo: "",
    peiCentral: "",

  });

  const [editForm, setEditForm] = useState({
    dataCriacao: "",
    dataTermino: "",
    periodo: "",
    peiCentral: "",

  });

  useEffect(() => {
    async function carregarPeiCentrals() {
      try {
        const res = await DB_CENTRAL.get("/");
        const dados = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];
        setPeiCentrals(dados);
      } catch (err) {
        console.error("Erro ao carregar PEI Central:", err);
        setPeiCentrals([]);
        addAlert("Erro ao carregar PEIs Centrais!", "error");
      }
    }
    carregarPeiCentrals();
  }, []);

  async function salvarPeriodo(event) {
    event.preventDefault();

    const mensagens = validaCampos(form, event.target);
    
      if (mensagens.length > 0) {
        // ALERTAS INLINE por campo
        mensagens.forEach((m) =>
          addAlert(m.message, "error", { fieldName: m.fieldName })
        );
    
        // ALERTA GLOBAL
        addAlert("Existem campos obrigatórios não preenchidos.", "warning");
        return;
      }

    

    try {
      if (editingId) {
        await DB.put(`${editingId}/`, {
          data_criacao: editForm.dataCriacao,
          data_termino: editForm.dataTermino,
          periodo: editForm.periodo,
          pei_central: editForm.peiCentral,
        });
        addAlert("Período atualizado com sucesso!", "success");
      } else {
        await DB.post("/", {
          data_criacao: form.dataCriacao,
          data_termino: form.dataTermino,
          periodo: form.periodo,
          pei_central: form.peiCentral,
        });
        setForm({
          dataCriacao: "",
          dataTermino: "",
          periodo: "",
          peiCentral: "",
        })

        addAlert("Período cadastrado com sucesso!", "success");
      }

      setEditingId(null);
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
        addAlert("Erro ao cadastrar componente.", "error", { persist: true });
      }
    }
  }

  function editarPeriodo(p) {
    setDataCriacao(p.data_criacao);
    setDataTermino(p.data_termino);
    setPeriodoEscolhido(p.periodo);
    setPeiCentralId(p.pei_central);
    setEditingId(p.id);
    window.scrollTo(0, 0);
    addAlert("Modo de edição ativado para o período selecionado.", "info");
  }

  function excluirPeriodo(id) {
    addAlert("Deseja realmente deletar este período?", "confirm", {
      onConfirm: async () => {
        try {
          await DB.delete(`${id}/`);
          addAlert("Período deletado com sucesso!", "success");
        } catch (err) {
          console.error("Erro ao deletar período:", err);
          if (err.response?.data) {
            const messages = Object.entries(err.response.data)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
              .join(" | ");
            addAlert(`Erro ao deletar período: ${messages}`, "error");
          } else {
            addAlert("Erro ao deletar período (erro desconhecido).", "error");
          }
        }
      },
      onCancel: () => addAlert("Exclusão cancelada pelo usuário.", "info"),
    });
  }

  return (
    <div className="container-padrao">
      <h1>Gerenciar Períodos Letivos</h1>

      <hr />
      <h2>{editingId ? "Editar Período" : "Cadastrar Período"}</h2>

      <form className="form-padrao" onSubmit={salvarPeriodo}>
        <label>Data de Criação:</label>
        <input
          type="date"
          name="dataCriacao"
          value={form.dataCriacao}
          onChange={(e) => {
            setForm({ ...form, dataCriacao: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("dataCriacao");
            }
          }}
        />
        <FieldAlert fieldName="dataCriacao" />

        <label>Data de Término:</label>
        <input
          type="date"
          name = "dataTermino"
          value={form.dataTermino}
          onChange={(e) => {
            setForm({ ...form, dataTermino: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("dataTermino");
            }
          }}
        />
        <FieldAlert fieldName="dataTermino" />

        <label>Período:</label>
        <select
          value={form.periodo}
          name= "periodo"
          onChange={(e) => {
            setForm({ ...form, periodo: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("periodo");
            }
          }}
        >
          <option value="">-- selecione --</option>
          <option value="BIMESTRE">Bimestre</option>
          <option value="TRIMESTRE">Trimestre</option>
          <option value="SEMESTRE">Semestre</option>
        </select>
        <FieldAlert fieldName="periodo" />

        <label>PEI do Aluno:</label>
        <select
          value={form.peiCentral}
          name = "peiCentral"
          onChange={(e) => {
            setForm({ ...form, peiCentral: e.target.value })
            if (e.target.value.trim() !== "") {
              clearFieldAlert("peiCentral");
            }
          }}
        >
          <option value="">-- selecione --</option>
          {Array.isArray(peiCentrals) &&
            peiCentrals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.aluno.nome || `PEI Central ${p.id}`}
              </option>
            ))}
        </select>
        <FieldAlert fieldName="peiCentral" />

        <button type="submit-btn" className="submit-btn">
          {editingId ? "Atualizar" : "Adicionar"}
        </button>
      </form>
      <BotaoVoltar/>
    </div>
  );
}

export default PEIPeriodoLetivo;
