import { useEffect, useState} from "react";
import apiBackend from "../../configs/apiBackend";
import axios from "axios";
import { API_ROUTES } from "../../configs/apiRoutes";


const FormAHSD = () => {
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [form, setForm] = useState([]);

    useEffect(() => {
        apiBackend
        .get("/aluno/")
    })

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
        <div>
        <h1>Formulário para registros de Alta Habilidade/Superdotação</h1>
        <form onSubmit={handleSubmit} classname="form">
            <label className="label">Professor</label>
            <select name="professor" value={form.professor} onChange={handleChange} required>
                <option value="">Selecione o professor</option>
                {Array.isArray(professores) && professores.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                    {professor.nome || `${professor.first_name} ${professor.last_name}`}
                    </option>
                ))}
            </select>
            <label className="label">Disciplina</label>
            <select name="disciplina" value={form.disciplina} onChange={handleChange} required>
                <option value="">Selecione a disciplina</option>
                {Array.isArray(disciplinas) && disciplinas.map((disciplina) => (
                    <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nome}
                    </option>
                ))}
            </select>
            <label className="label">Aluno</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">E-mail</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">Finalidade</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">Data</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">Área de destaque</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">Indicadores observados</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">Interesses e potencialidades do estudante</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">Estratégias de enriquecimento propostas</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">Evidências/Anexos</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <label className="label">Parecer</label>
            <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

    
        </form>
    
    
        </div>
    )
}

export default FormAHSD;
