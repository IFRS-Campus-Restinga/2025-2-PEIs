import { useEffect, useState } from "react";
import axios from "axios";
import BotaoVoltar from "../components/customButtons/botaoVoltar";
import BotaoDeletar from "../components/customButtons/botaoDeletar";
import "../cssGlobal.css"
import { API_ROUTES } from "../configs/apiRoutes";

function Conteudo({usuario}) {
  // cria a instancia do axios
  const DBConteudo = axios.create({baseURL: API_ROUTES.CONTEUDO});
  // adiciona o usuario de email nas requisicoes desse axios
  DBConteudo.defaults.headers.common["X-User-Email"] = usuario.email;
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
    try {
      const resposta = await DBConteudo.post("/", { texto });
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

        {/* { erroBanco ? ( <p>Não foi possível acessar o backend do django...</p> ) : (
        <pre>{JSON.stringify(conteudos, null, 2)}</pre> ) } */}

      </div>
      <BotaoVoltar/>
    </div>

  </> ) }
export default Conteudo;
