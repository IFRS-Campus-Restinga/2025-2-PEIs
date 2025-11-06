import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_ROUTES } from "../configs/apiRoutes";
import "./disciplina.css";


function Usuarios() {
  // estados necessarios
  const DBUsuario = axios.create({baseURL: API_ROUTES.USUARIO});
  const [usuarios, setUsuarios] = useState([])
  const [erroBanco, setErroBanco] = useState(false)


  // funcao para buscar no rest/django os usuarios cadastrados
  async function recuperaUsuarios() {
    try {
      const resposta = await DBUsuario.get("/")
      setUsuarios(resposta.data.results)
      setErroBanco(false)
    // se tiver dado erro
    } catch (erro) { console.error("Erro ao buscar usuarios:", erro)
      setErroBanco(true) } }


  // função para deletar usuario
  async function deletarUsuario(id) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await DBUsuario.delete(`/${id}/`);
      // atualiza a lista localmente
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (erro) {
      console.error("Erro ao deletar usuario:", erro);
      alert("Erro ao tentar excluir o usuario."); } }


  // função para cadastrar novo usuario
  async function cadastrarUsuario(event) {
    event.preventDefault();
    const email = event.target.email.value.trim();
    const categoria = event.target.categoria.value;
    // validacao do email institucional
    const partes = email.split("@");
    if (partes.length !== 2 || !email.endsWith("ifrs.edu.br")) {
      alert("Use apenas email institucional (ifrs.edu.br).");
      return; }
    try {
      const resposta = await DBUsuario.post("/", { email, categoria });
      // adiciona o novo usuario na lista
      setUsuarios([...usuarios, resposta.data]);
      // limpa o formulario
      event.target.reset();
    } catch (erro) {
      console.error("Erro ao cadastrar usuario:", erro);
      alert("Erro ao cadastrar o usuário. Verifique se o email já existe ou se o backend está acessível."); } }


  // executando na inicializacao
  useEffect(() => {
    recuperaUsuarios();
  }, []);

  return ( <>
    <div className="disciplinas-container">
      <h1>Cadastro de Usuários</h1>
      <form onSubmit={cadastrarUsuario}>
        <label>
          Email (apenas institucional do IFRS): <br />
          <input type="email" name="email" required style={{ width: "100%", height: "30px" }} />
        </label>
        <br /><br />
        <label>
          Categoria de acesso: <br />
          <select name="categoria" required style={{ width: "200px" }}>
            <option value="">Selecione...</option>
            <option value="ADMIN">Administrador do Sistema</option>
            <option value="NAPNE">NAPNE</option>
            <option value="PROFESSOR">Professor</option>
            <option value="COORDENADOR">Coordenador</option>
            <option value="PEDAGOGO">Pedagogo</option>
          </select>
        </label>
        <br /><br />
        <div style={{textAlign: "center"}}><button type="submit">Cadastrar Usuário</button></div>
      </form>

      <div className="disciplinas-list">
        <h3>Usuários Cadastrados</h3>
        <ul>
        { erroBanco ? ( <p>Não foi possível acessar o backend do django...</p> ) : (
        usuarios.map(u => (
          <li key={u.id}>
            <p><b>Email:</b> {u.email} <br /> <b>Categoria:</b> { u.categoria }</p>
            <button style={{backgroundColor: "red"}} onClick={() => deletarUsuario(u.id)}>Excluir</button>
          </li>
        ) ) ) }
        </ul>

        { erroBanco ? ( <p>Não foi possível acessar o backend do django...</p> ) : (
        <pre>{JSON.stringify(usuarios, null, 2)}</pre> ) } 

      </div>
      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>

  </> ) }
export default Usuarios;