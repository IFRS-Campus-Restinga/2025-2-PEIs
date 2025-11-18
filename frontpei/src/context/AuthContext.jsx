import { createContext, useState, useEffect } from "react";
import api from "../configs/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  // Carrega automaticamente o usuário se o token existir
  useEffect(() => {
    const carregarUsuario = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common["Authorization"] = `Token ${token}`;
        const response = await api.get("/api/usuario/me/");

        // só permite usuário aprovado
        if (response.data.status !== "aprovado") {
          logout();
        } else {
          setUsuario(response.data);
        }

      } catch {
        logout();
      }

      setLoading(false);
    };

    carregarUsuario();
  }, [token]);

  // Login manual
  const login = ({ token, usuario }) => {
    localStorage.setItem("authToken", token);
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
    setToken(token);
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUsuario(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
