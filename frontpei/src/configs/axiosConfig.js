// services/api.js
import axios from "axios";
import { API_ROUTES } from "../configs/apiRoutes";

// Cria uma instância do Axios
const api = axios.create({
  baseURL: API_ROUTES.BASE_URL, // coloque aqui o baseURL do seu backend
});

// Interceptor para adicionar o token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // pega o token atual do localStorage
    if (token) {
      config.headers.Authorization = `Token ${token}`; // ou "Bearer" se seu backend usar Bearer
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
