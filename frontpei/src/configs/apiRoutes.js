// frontpei/src/configs/apiRoutes.js

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
  "permissoes",
  "usuario",
  "register",
  "status-cadastro",
  "login",
];

// Constrói automaticamente as rotas padronizadas
export const API_ROUTES = {
  ...Object.fromEntries(
    endpoints.map((name) => [
      name.toUpperCase(),
      `${API_BASE_URL}${name}/`
    ])
  ),

  // 🔥 ROTA DE LOGIN (não entra na lista automática!)
  //LOGIN: `${API_BASE_URL}services/login/`,

  // Rota especial de registro
  USUARIOS_REGISTRAR: `${API_BASE_URL}usuarios/registrar/`,
};

export const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN;
