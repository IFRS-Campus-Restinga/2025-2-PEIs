import { useState } from "react"

export default function Disciplina({onEnvio}){
    const [nome, setNome] = useState("")
    
    function enviar(event){
        event.preventDefault()

        const novaDisciplina = {nome:nome}
        onEnvio(novaDisciplina)
    }

    return <form onSubmit={enviar}>
        <label>Nome: </label>
        <input value={nome} onChange={(event) => setNome(event.target.value)}/>
        <button>Enviar</button>
    </form>


}