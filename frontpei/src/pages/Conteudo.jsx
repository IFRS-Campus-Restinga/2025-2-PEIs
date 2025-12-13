import { useEffect, useState } from "react";
import axios from "axios";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import "../cssGlobal.css"
import { API_ROUTES } from "../configs/apiRoutes";

function Conteudo({usuario}) {
  // cria a instancia do axios com email e grupo do usuario
  const DBConteudo = axios.create({baseURL: API_ROUTES.CONTEUDO})
  DBConteudo.defaults.headers.common["X-User-Email"] = usuario.email
  DBConteudo.defaults.headers.common["X-User-Group"] = usuario.grupo
  // estados necessarios
  const [conteudos, setConteudos] = useState([])
  const [erroBanco, setErroBanco] = useState(false)

  // funcao para buscar no rest/django os conteudos cadastrados
  async function recuperaConteudos() {
    try {
      const resposta = await DBConteudo.get("/")
      setConteudos(resposta.data.results)
      setErroBanco(false)
    // se tiver dado erro
    } catch (erro) { console.error("Erro ao buscar conteudos:", erro)
      setErroBanco(true) } }


  // função para deletar conteudo
  async function deletarConteudo(id) {
    if (!window.confirm("Tem certeza que deseja excluir este conteúdo?")) return;
    try {
      await DBConteudo.delete(`/${id}/`);
      // atualiza a lista localmente
      setConteudos(conteudos.filter(u => u.id !== id));
    } catch (erro) {
      console.error("Erro ao deletar conteudo:", erro);
      alert("Erro ao tentar excluir o conteudo."); } }


  // função para cadastrar novo conteudo
  async function cadastrarConteudo(event) {
    event.preventDefault();
    const texto = event.target.texto.value;
    const visibilidade = event.target.visibilidade.value;
    // listas padrao
    let emails_autorizados = [];
    let grupos_autorizados = [];
    // regras visibilidade, publico fica vazio
    if (visibilidade === "privado") {
      emails_autorizados = [usuario.email];
      grupos_autorizados = ["Admin"]; }
    else if (visibilidade === "grupo") {
      grupos_autorizados = [usuario.grupo, "Admin"]; }
    try {
      const resposta = await DBConteudo.post("/", {
        texto,
        emails_autorizados,
        grupos_autorizados });
      // adiciona o novo conteudo na lista
      setConteudos([...conteudos, resposta.data]);
      // limpa o formulario
      event.target.reset();
    } catch (erro) {
      console.error("Erro ao cadastrar conteudo:", erro);
      alert("Erro ao cadastrar o conteúdo. Revise o conteúdo dos campos e confirme que o backend está funcional."); } }  

  // executando na inicializacao
  useEffect(() => {
      recuperaConteudos();
  }, []);

  // ============================================================
  return ( <>
    <div className="container-padrao">
      <h1>Cadastro de Conteúdos</h1>
      <form className="form-padrao" onSubmit={cadastrarConteudo}>
        <label>
          Visibilidade:<br />
          <select name="visibilidade" defaultValue="publico" required>
            <option value="publico">Público</option>
            <option value="privado">Privado</option>
            <option value="grupo">Grupo</option>
          </select>
        </label>
        <label>
          Texto: <br />
          <input type="text" name="texto" required style={{ width: "100%", height: "100px" }} />
        </label>
        <div style={{textAlign: "center"}}><button className="submit-btn">Cadastrar Conteúdo</button></div>
      </form>

      <div className="list-padrao">
        <h3>Conteúdos Cadastrados</h3>
        <p>Seu email é <b>{usuario.email}</b><br />Seu grupo é: <b>{usuario.grupo}</b></p>
        <ul>
        { erroBanco ? ( <p>Não foi possível acessar o backend do django...</p> ) : (
        conteudos.map(u => (
          <li key={u.id}>
            <p><b>Autor:</b> {u.autor} <br /> <b>Data:</b> {u.timestamp} <br /> <b>Texto:</b> { u.texto }</p>
            <div className="posicao-buttons">
              <BotaoDeletar id={u.id} axiosInstance={DBConteudo} onDeletarSucesso={recuperaConteudos}/>
            </div>
          </li>
        ) ) ) }
        </ul>

        { erroBanco ? ( <p>Não foi possível acessar o backend do django...</p> ) : (
        <pre>{JSON.stringify(conteudos, null, 2)}</pre> ) }

      </div>
      <BotaoVoltar/>
    </div>

  </> ) }
export default Conteudo;
