import { useEffect, useState } from "react";
import axios from "axios"
import Crud from "../Crud"

function Cursos(){
    const [voltarCrud, setVoltarCrud] = useState(false)
    const [cursos, setCursos] = useState([])
    const [disciplinas, setDisciplinas] = useState("")
    const [texto, setTexto] = useState("")

    const DBDISCIPLINAS = axios.create({baseURL: import.meta.env.VITE_DISCIPLINAS_URL})
    const DBCURSOS = axios.create({baseURL: import.meta.env.VITE_CURSOS_URL})
    
    async function recuperaDisciplinas() {
        try{
            const response = await DBDISCIPLINAS.get("/")
            const data = response.data

            if(Array.isArray(data)) setDisciplina(data)
            else if(Array.isArray(data.results)) setDisciplina(data.results)
            else setDisciplinas([])
        }catch (err){
            console.error("Erro ao buscar disciplinas: ", err)
        }
    }
    async function recuperaCursos() {
        try{
            const response = await DBCURSOS.get("/")
            const data = response.data

            if(Array.isArray(data)) setCursos(data)
            else if(Array.isArray(data.results)) setCursos(data.results)
        
        }catch (err){
            console.error("Erro ao buscar cursos: ", err)
        }
    }

    async function adicionaCurso(event) {
        event.preventDefault()
        const confereTexto = texto.trim()
        const novo = {
            texto: confereTexto
        }
        try{
            await DBCURSOS.post("/", novo)
            await recuperaCursos()
            setDisciplinas("")
            setTexto("")

        }catch (err) {
            console.error("Erro ao criar cursos:", err)
            alert("Falha ao cadastrar cursos!")
        }
    }

    useEffect(()=>{
        recuperaDisciplinas()
    }, [])

    if(voltarCrud){
        return <Crud />
    }

    return (
        <>
            <h1>Gerenciar Cursos</h1>
            <h2>Cadastrar Curso</h2>
            <form onSubmit={adicionaCurso}>
                <label>Disciplina:</label>
                <br/>
                <select value={disciplinas} onChange={(e) => setDisciplinas(e.target.value)}>
                    <option value="">-- SELECIONE --</option>
                    {disciplinas.map((d) => (
                        <option key={p.id} value={p.id}>
                            {p.nome}
                        </option>
                    ))}
                </select>
                <label>Nome: </label>
                <br/>
                <textarea value={texto} onChange={(e) => setTexto(e.target.value)}/>
                <button type="submit">Adicionar curso</button>
            </form>

            <button onClick={() => setVoltarCrud(true)}>Voltar</button>
        </>
    )
}

export default Cursos