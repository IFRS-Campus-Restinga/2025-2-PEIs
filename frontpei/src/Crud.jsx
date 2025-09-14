import { useEffect, useState } from 'react'
import axios from 'axios'

function Crud() {

// ------------------------------------------------------------
// criando instancia do axios baseado no .env
const DB = axios.create({ baseURL: import.meta.env.VITE_API_URL })


// ------------------------------------------------------------
// declaracao dos estados 
const [pessoas, setPessoas] = useState([])
const [erroBanco, setErroBanco] = useState(false)
// estados para o formulario de cadastro
const [nome, setNome] = useState("")
const [categoria, setCategoria] = useState(1)


// ------------------------------------------------------------
// funcao pra recuperar todas as pessoas
async function recuperaPessoas() {
  try {
    const resposta = await DB.get("/")
    setPessoas(resposta.data)
    setErroBanco(false)
  // se tiver dado erro
  } catch (erro) { console.error("Erro ao buscar pessoas:", erro)
    setErroBanco(true) } }


// ------------------------------------------------------------
// funcao para adicionar uma nova pessoa
async function adicionaPessoa(event) {
  // evita reload do form
  event.preventDefault()
  // validações simples no frontend
  const nomeTrim = nome.trim()
  const catNum = Number(categoria)
  if (nomeTrim.length < 7) {
    alert("O nome precisa ter ao menos 7 caracteres.")
    return }
  if (![1,2,3].includes(catNum)) {
    alert("Categoria inválida. Escolha 1, 2 ou 3.")
    return }
  // passou nas validacoes
  const novo = { nome: nomeTrim, categoria: catNum }
  try {
    // vamos salvar
    await DB.post("/", novo)
    // atualiza a lista pegando o novo cadastro
    await recuperaPessoas()
    // limpa o formulario
    setNome("")
    setCategoria(1)
    setErroBanco(false)
  // se caiu aqui deu ruim
  } catch (erro) {
    console.error("Erro ao criar pessoa:", erro)
    setErroBanco(true)
    alert("Falha ao cadastrar a pessoa!")
  } }


// ------------------------------------------------------------
// funcoes para carregar na inicializacao
useEffect(() => {
  recuperaPessoas()
}, [])

// ------------------------------------------------------------
return ( <>

  <img src='./src/assets/logo.png' style={{ height: 225, width: 150 }} />
  <h1>Prova de Conceito do PEI</h1>

  { /* ------------------------------------------------------ */ }
  { /* cadastro de pessoa */ }
  <hr /><h2>Cadastrar pessoa</h2>
  <form onSubmit={adicionaPessoa}>
    <label>Nome:</label>
    <br />
    <input
      type="text"
      value={nome}
      onChange={(e) => setNome(e.target.value)}
      placeholder="Digite o nome (min. 7 caracteres)" />
    <br /><br />
    <label>Categoria:</label><br />
    <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
      <option value={1}>1</option>
      <option value={2}>2</option>
      <option value={3}>3</option>
    </select>
    <br /><br />
    <button type="submit">Adicionar</button>
    </form>

  { /* ------------------------------------------------------ */ }
  { /* visualizacao dos dados do backend */ }
  <hr /><h2>Dados cadastrados:</h2>
  { erroBanco ? ( <p>Não foi possível acessar o backend do django...</p> ) : (
  pessoas.map(pessoa => (
    <div key={pessoa.id}>
      <p><b>Nome:</b> {pessoa.nome} | <b>Categoria:</b> {pessoa.categoria}</p>
    </div>
  ) ) ) }

  { /* ------------------------------------------------------ */ }
  <hr /><h2>Área de visualização bruta dos dados:</h2>
  <p>Status de erro: {JSON.stringify(erroBanco, null, 2)}</p>
  <p>Dados do model <b>Pessoa</b>:</p>
  <pre>{JSON.stringify(pessoas, null, 2)}</pre>

</> ) }
export default Crud