import axios from "axios";

const apiBackend = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Backend-Token": import.meta.env.VITE_BACKEND_TOKEN,
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

export default apiBackend;
