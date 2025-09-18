import { useEffect, useState } from 'react'
import axios from 'axios'

function CrudCursos() {
  const DB = axios.create({ baseURL: import.meta.env.VITE_API_URL_CURSOS})
  const [curso, setCurso] = useState([])
  const [erroBanco, setErroBanco] = useState(false)
  const [nome, setNome] = useState("")
  //const [nivel, setNivel] = useState("")
  //const [disciplina, setDisciplina] = useState("")

  async function recuperaCursos() {
    try {
      const resposta = await DB.get("/")
      setCurso(resposta.data)
      setErroBanco(false)
    } catch (erro) { console.error("Erro ao buscar cursos:", erro)
      setErroBanco(true) } }

  async function adicionaCurso(event) {
    event.preventDefault()
    const nomeCurso = curso.trim()
    if (nomeCurso.length < 1) {
      alert("O nome precisa ter ao menos 1 caracteres.")
      return 
      }
    
    const novo = { nome: nomeCurso}
    try {
      await DB.post("/", novo)
      await recuperaCursos()
      setNome("")
      setErroBanco(false)
    } catch (erro) {
      console.error("Erro ao criar curso:", erro)
      setErroBanco(true)
      alert("Falha ao cadastrar a curso!")
    } }

  useEffect(() => {
    recuperaCursos()
  }, [])

  return ( <>
    { /* ------------------------------------------------------ */ }
    { /* cadastro de pessoa */ }
    <hr /><h2>Cadastrar cursos</h2>
    <form onSubmit={adicionaCurso}>
      <label>Nome:</label>
      <br />
      <input type="text" value={nome} onChange={(e) => setCurso(e.target.value)}
        placeholder="Digite o nome do curso (min. 1 caracteres)" />
      <br /><br />
      <button type="submit">Adicionar</button>
      </form>

    { /* ------------------------------------------------------ */ }
    { /* visualizacao dos dados do backend */ }
    <hr /><h2>Dados cadastrados:</h2>
    { erroBanco ? ( <p>Não foi possível acessar o backend do django...</p> ) : (
    curso.map(cursos => (
      <div key={cursos.id}>
        <p><b>Nome:</b> {cursos.nome}</p>
      </div>
    ) ) ) }

  </> ) }

export default CrudCursos