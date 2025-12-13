import axios from "axios";
import { API_ROUTES } from "../configs/apiRoutes";

// recebe email do usuario e retorna o grupo dele
export async function consultaGrupo(email) {
  try {
    // vamos primeiro criar a instancia do axios
    const DBGrupo = axios.create({ baseURL: API_ROUTES.CONSULTAGRUPOS });
    // injeta o email sempre no cabecalho pro django
    DBGrupo.defaults.headers.common["X-User-Email"] = email;
    // realiza a consulta na view
    const resposta = await DBGrupo.get("/");
    const grupos = resposta.data.grupos || [];
    // regra: o usuario deve ter apenas um grupo
    if (grupos.length === 1) { return grupos[0]; }
    // se nao tiver grupos, erro
    if (grupos.length === 0) { console.error("Usuario nao pertence a nenhum grupo."); return null; }
    // se tiver mais de um grupo retornamos o primeiro apenas
    console.error("Usuario pertence a mais de um grupo, nao deveria acontecer."); return grupos[0];
  // se acontecer algum erro generico
  } catch (erro) { console.error("Erro ao consultar grupos:", erro); return null; } }