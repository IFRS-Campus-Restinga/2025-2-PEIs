import { createContext, useState, useEffect } from "react";
import api from "../configs/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  // Carrega usuário automaticamente se tiver token
  useEffect(() => {
    const carregarUsuario = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Força requisição limpa: sem cookies, sem CSRF → nunca dá 403
        const response = await fetch("http://localhost:8000/api/usuario/me/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
          credentials: "omit", // ← ESSA LINHA É A CHAVE: ignora cookies/CSRF
        });

        if (!response.ok) {
          throw new Error("Erro na resposta");
        }

        const data = await response.json();

        // Verifica se o usuário está aprovado
        if (data.status === "aprovado" || data.status === "APPROVED") {
          setUsuario(data);
        } else {
          console.warn("Usuário não aprovado:", data.status);
          logout();
        }
      } catch (error) {
        console.warn("Falha ao validar token. Deslogando...", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    carregarUsuario();
  }, [token]);

  // Login (manual ou Google)
  const login = ({ token, usuario }) => {
    localStorage.setItem("authToken", token);
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
    setToken(token);
    setUsuario(usuario);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("authToken");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};