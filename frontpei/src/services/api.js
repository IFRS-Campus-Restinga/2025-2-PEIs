// services/api.js
import axios from "axios";
import { API_ROUTES } from "../configs/apiRoutes";

// Sempre pega o token atualizado
export function getAuthHeaders() {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return token ? { Authorization: `token ${token}` } : {};
}

// Cria uma instância padrão já com baseURL opcional
export const api = axios.create();

// Interceptor p/ sempre reenviar o token atualizado
api.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...getAuthHeaders(),
  };
  return config;
});

// Instâncias específicas como no componente anterior
export const DBPEI = axios.create({ baseURL: API_ROUTES.PEI_CENTRAL });
export const DBPARECERES = axios.create({ baseURL: API_ROUTES.PARECER });
export const DBCOMPONENTECURRICULAR = axios.create({ baseURL: API_ROUTES.COMPONENTECURRICULAR });
export const DBUSUARIOS = axios.create({ baseURL: API_ROUTES.USUARIO });
export const DBPEIPERIODOLETIVO = axios.create({ baseURL: API_ROUTES.PEIPERIODOLETIVO });
export const DBALUNO = axios.create({ baseURL: API_ROUTES.ALUNO });
export const DBDISCIPLINAS = axios.create({ baseURL: API_ROUTES.DISCIPLINAS });
export const DBCURSOS = axios.create({ baseURL: API_ROUTES.CURSOS });
export const DBUATADEACOMPANHAMENTO = axios.create({ baseURL: API_ROUTES.ATADEACOMPANHAMENTO });
export const DBSCHEMA = axios.create({ baseURL: API_ROUTES.SCHEMA });

// Para cada instância, reaplica interceptors
[DBPEI, DBPARECERES, DBCOMPONENTECURRICULAR, DBUSUARIOS, DBPEIPERIODOLETIVO, DBALUNO, DBDISCIPLINAS, DBCURSOS, DBUATADEACOMPANHAMENTO, DBSCHEMA].forEach((apiInstance) => {
  apiInstance.interceptors.request.use((config) => {
    config.headers = {
      ...config.headers,
      ...getAuthHeaders(),
    };
    return config;
  });
});
