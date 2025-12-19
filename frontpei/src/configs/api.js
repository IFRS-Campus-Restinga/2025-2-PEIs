import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 🔐 Interceptor para enviar o token do backend
api.interceptors.request.use(
  (config) => {
    const backendToken = import.meta.env.VITE_BACKEND_TOKEN;

    if (backendToken) {
      config.headers["X-Backend-Token"] = backendToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔎 Log de erro padronizado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error);
    return Promise.reject(error);
  }
);

export default api;
