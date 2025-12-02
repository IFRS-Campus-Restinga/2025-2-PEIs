// frontpei/src/configs/apiRoutes.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  // "usuarios/registrar" ← REMOVIDO AQUI (era o culpado do 404)
  "register",
  "status-cadastro"
];

export const API_ROUTES = {
  // Todas as rotas do router (já têm /services/ no base URL)
  ...Object.fromEntries(
    endpoints.map((name) => [name.toUpperCase(), `${API_BASE_URL}${name}/`])
  ),

  // ROTA ESPECIAL DE REGISTRO (fora do router)
  USUARIOS_REGISTRAR: `${API_BASE_URL}usuarios/registrar/`,
  // Com seu .env atual → vira: http://localhost:8000/services/usuarios/registrar/ → PERFEITO
};

export const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN;