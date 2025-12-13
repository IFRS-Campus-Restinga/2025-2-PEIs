import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,     // ← FORÇA desativado
  // Remove tudo de CSRF
});

// Interceptor para garantir que NUNCA envie X-CSRFToken
api.interceptors.request.use((config) => {
  delete config.headers["X-CSRFToken"];
  delete config.headers["X-Csrftoken"];
  config.withCredentials = false;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error);
    return Promise.reject(error);
  }
);

export default api;