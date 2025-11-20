// frontpei/src/configs/apiRoutes.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/services";

export const API_ROUTES = {
  PEIPERIPERIODOLETIVO: `${API_BASE_URL}/PEIPeriodoLetivo/`,
  PARECER: `${API_BASE_URL}/parecer/`,
  ALUNO: `${API_BASE_URL}/aluno/`,
  DISCIPLINAS: `${API_BASE_URL}/disciplinas/`,
  CURSOS: `${API_BASE_URL}/cursos/`,
  PEI_CENTRAL: `${API_BASE_URL}/pei_central/`,
  COMPONENTECURRICULAR: `${API_BASE_URL}/componenteCurricular/`,
  ATADEACOMPANHAMENTO: `${API_BASE_URL}/ataDeAcompanhamento/`,
  DOCUMENTACAOCOMPLEMENTAR: `${API_BASE_URL}/documentacaoComplementar/`,
  MANDAEMAIL: `${API_BASE_URL}/mandaEmail/`,
  PERMISSOES: `${API_BASE_URL}/permissoes/`,
  USUARIO: `${API_BASE_URL}/usuario/`,
  REGISTER: `${API_BASE_URL}/register/`,
  STATUS_CADASTRO: `${API_BASE_URL}/status-cadastro/`,

  // ROTA CORRETA DO REGISTRO (essa é a que tem que funcionar)
  USUARIOS_REGISTRAR: "http://localhost:8000/services/usuarios/registrar/",
};

export const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN;