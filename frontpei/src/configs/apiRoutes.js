const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const endpoints = [
  "PEIPeriodoLetivo",
  "parecer",
<<<<<<< HEAD
  "professor",
  "aluno",
  "coordenadorCurso",
  "disciplinas",
  "cursos",
  "pei_central",
  "pedagogo",
=======
  "aluno",
  "disciplinas",
  "cursos",
  "pei_central",
>>>>>>> Gabriel
  "componenteCurricular",
  "ataDeAcompanhamento",
  "documentacaoComplementar",
  "mandaEmail",
<<<<<<< HEAD
  "usuario"
=======
  "permissoes",
  "usuario",
  "register",
  "status-cadastro"
>>>>>>> Gabriel
];

export const API_ROUTES = Object.fromEntries(
  endpoints.map((name) => [name.toUpperCase(), `${API_BASE_URL}${name}/`])
);

export const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN;
