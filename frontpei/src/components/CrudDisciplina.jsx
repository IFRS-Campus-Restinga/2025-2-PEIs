import { useState, useEffect } from "react"
import axios from 'axios'
import Disciplina from "./Disciplina"

function CrudDisciplina(){
    const [disciplinas, setDisciplina] = useState([])

    async function recuperaDados() {
        const responsta = await axios.get('http://localhost:8000/services/disciplinas/')
        setDisciplina(responsta.data)
    }

    async function cadastrarDisciplina(disciplina) {
        const retorno = await axios.post('http://localhost:8000/services/disciplinas/', disciplina)
        
        const novaListaDisciplinas = [...disciplinas, retorno.data]

        setDisciplina(novaListaDisciplinas)
    
    }

    useEffect(()=>{recuperaDados()}, [])

    return <>
        <Disciplina onEnvio={cadastrarDisciplina}/>
        <br/>
        <table border = "1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                </tr>
            </thead>
            <tbody>
                {disciplinas.map(disciplina => <tr key={disciplina.id}>
                    <td>{disciplina.id}</td>
                    <td>{disciplina.nome}</td>
                </tr>)}
            </tbody>
        </table>
    </>
}
export default CrudDisciplina