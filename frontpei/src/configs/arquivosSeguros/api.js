import axios from "axios";
import { BACKEND_TOKEN } from "./apiRoutes";

console.log(
    "BACKEND TOKEN NO FRONT:",
    import.meta.env.VITE_BACKEND_TOKEN
  );

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  //baseURL,
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Interceptor — injeta o token JWT corretamente em TODAS as requisições
api.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_BACKEND_TOKEN;

  if (token) {
    config.headers["X-Backend-Token"] = token;
  }

  if (token) {
    // Backend Django JWT usa Bearer <token>
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (BACKEND_TOKEN) {
    config.headers["X-Backend-Token"] = BACKEND_TOKEN;
  }

  // Garantia para evitar interferência de CSRF em APIs REST
  delete config.headers["X-CSRFToken"];
  delete config.headers["X-Csrftoken"];

  return config;
});

// Interceptor de resposta — apenas registra erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error);
    return Promise.reject(error);
  }
);

export default api;
