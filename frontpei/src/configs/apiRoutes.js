let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL.endsWith("/")) {
  API_BASE_URL += "/";
}

const endpoints = [
  "PEIPeriodoLetivo",
  "parecer",
  "aluno",
  "disciplinas",
  "cursos",
  "pei_central",
  "componenteCurricular",
  "ataDeAcompanhamento",
  "documentacaoComplementar",
  "mandaEmail",
  "enviarConviteReuniao",
  "permissoes",
  "usuario",
  "conteudo",
  "consultaGrupos",
  "schema",
  "formahsd",
];

// Constrói automaticamente as rotas padronizadas
/*export const API_ROUTES = {
  ...Object.fromEntries(
    endpoints.map((name) => [
      name.toUpperCase(),
      `${API_BASE_URL}${name}/`
    ])
  ),*/

  export const API_ROUTES = {
    ALUNO: "aluno/",
    ACOMPANHAMENTOS: "acompanhamentos/",
    ACOMPANHAMENTOS_MEUS: "acompanhamentos/meus/",
    ACOMPANHAMENTOS_RECUSAR: (id) => `acompanhamentos/${id}/recusar/`,
  };


  // Rotas especiais do Acompanhamento
  /*ACOMPANHAMENTOS_MEUS: `${API_BASE_URL}acompanhamentos/meus/`,
  ACOMPANHAMENTOS_DETALHE: (id) => `${API_BASE_URL}acompanhamentos/${id}/`,
  ACOMPANHAMENTOS_RECUSAR: (id) => `${API_BASE_URL}acompanhamentos/${id}/recusar/`,
  ACOMPANHAMENTOS_ACEITAR: (id) => `${API_BASE_URL}acompanhamentos/${id}/aceitar/`,*/

  // ROTA DE LOGIN (não entra na lista automática!)
  //LOGIN: `${API_BASE_URL}services/login/`,

  // Rota especial de registro
  //USUARIOS_REGISTRAR: `${API_BASE_URL}usuarios/registrar/`,
//};

export const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN;
