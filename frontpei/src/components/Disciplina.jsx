import { useEffect, useState } from "react";
import axios from "axios"
import Crud from "../Crud"

function Disciplinas(){
    const [voltarCrud, setVoltarCrud] = useState(false)

    const DBDISCIPLINAS = axios.create({baseURL: import.meta.env.VITE_DISCIPLINA_URL})

    const [disciplinas, setDisciplina] = useState([])
    const [texto, setTexto] = useState("")

    async function recuperaDisciplinas() {
        try{
            const response = await DBDISCIPLINAS.get("/")
            const data = response.data

            if(Array.isArray(data)) setDisciplina(data)
            else if(Array.isArray(data.results)) setDisciplina(data.results)
        }catch (err){
            console.error("Erro ao buscar disciplinas: ", err)
        }
    }

    async function adicionaDisciplina(event) {
        event.preventDefault()
        const confereTexto = texto.trim()
        const novo = {
            texto: confereTexto
        }
        try{
            await DBDISCIPLINAS.post("/", novo)
            await recuperaDisciplinas()
            setTexto("")

        }catch (err) {
            console.error("Erro ao criar disciplina:", err)
            alert("Falha ao cadastrar disciplina!")
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
            <h1>Gerenciar Disciplinas</h1>
            <h2>Cadastrar disciplinas</h2>
            <form onSubmit={adicionaDisciplina}>
                <label>Nome: </label>
                <br/>
                <textarea value={texto} onChange={(e) => setTexto(e.target.value)}/>
                <button type="submit">Adicionar disciplina</button>
            </form>

            <button onClick={() => setVoltarCrud(true)}>Voltar</button>
        </>
    )
}

export default Disciplinas