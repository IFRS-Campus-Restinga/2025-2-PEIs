import axios from "axios";
import { BACKEND_TOKEN } from "./apiRoutes";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    //Authorization: `Token ${BACKEND_TOKEN}`,
    "Content-Type": "application/json"
  }
});

// Interceptor para erros padrão
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error);
    return Promise.reject(error);
  }
);

export default api;
