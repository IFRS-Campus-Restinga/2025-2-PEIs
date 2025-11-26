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
  "conteudo",
  "consultaGrupos",
  "schema"
];

export const API_ROUTES = Object.fromEntries(
  endpoints.map((name) => [name.toUpperCase(), `${API_BASE_URL}${name}/`])
);

export const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN;
