import { useEffect, useState } from "react";
import apiBackend from "../../configs/apiBackend";
import "./Acompanhamentos.css";
import '../../cssGlobal.css';
import BotaoVoltar from "../../components/customButtons/botaoVoltar";

const Acompanhamentos = () => {
  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState({
    aluno: "",
    titulo: "",
    descricao: "",
    status: "pendente",
  });

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    apiBackend
      .get("/aluno/")
      .then((res) => {
        const dados = res.data.results ?? res.data;
        setAlunos(Array.isArray(dados) ? dados : []);
      })
      .catch((err) => {
        console.error("ERRO ALUNOS:", err);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    try {
      const response = await apiBackend.post("/acompanhamentos/", form);
      if (response.data?.email_enviado) {
        setMensagem({ tipo: "sucesso", texto: "Acompanhamento criado e e-mail enviado com sucesso!" });
      } else {
        setMensagem({ tipo: "alerta", texto: "Acompanhamento criado, mas o e-mail não foi enviado." });
      }
      setForm({ aluno: "", titulo: "", descricao: "", status: "pendente" });
    } catch (error) {
      console.error("ERRO AO SALVAR ACOMPANHAMENTO:", error);
      setMensagem({ tipo: "erro", texto: "Erro ao salvar acompanhamento." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      <h1>Meus Acompanhamentos</h1>

      <form onSubmit={handleSubmit} className="card">
        <label>Aluno</label>
        <select name="aluno" value={form.aluno} onChange={handleChange} required>
          <option value="">Selecione um aluno</option>
          {Array.isArray(alunos) && alunos.map((aluno) => (
            <option key={aluno.id} value={aluno.id}>
              {aluno.nome || `${aluno.first_name} ${aluno.last_name}`}
            </option>
          ))}
        </select>

        <label>Título</label>
        <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required />

        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="pendente">Pendente</option>
          <option value="aceito">Aceito</option>
          <option value="recusado">Recusado</option>
          <option value="concluido">Concluído</option>
        </select>

        <label>Descrição</label>
        <textarea name="descricao" rows="5" value={form.descricao} onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>

        {mensagem && <p className={`msg ${mensagem.tipo}`}>{mensagem.texto}</p>}
      </form>
      <BotaoVoltar />
    </div>
  );
};

export default Acompanhamentos;
