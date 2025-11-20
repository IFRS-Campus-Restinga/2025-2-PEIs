import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/services";

const api = axios.create({
  baseURL,
  withCredentials: true, // enviar cookies (essencial para sessão Django)
  headers: {
    "Content-Type": "application/json"
  },
  // axios usa por padrão xsrfCookieName/XsrfHeaderName que combinam com Django:
  // mas deixamos explícito só para garantir consistência
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
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
