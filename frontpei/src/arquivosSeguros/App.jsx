import "../src/cssGlobal.css";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Header from "./components/customHeader/Header.jsx";
import SubHeader from './components/customSubHeader/Subheader.jsx';
import Footer from "./components/customFooter/Footer.jsx";

// Contexto e Alertas
import { AlertProvider } from "./context/AlertContext";
import AlertComponent from "./components/alert/AlertComponent.jsx";

// Páginas
import Home from "./pages/home/Home.jsx";
import Login from "./pages/login/Login.jsx";

function App() {
  const [user, setUser] = useState(null);

  // Carregar usuário salvo
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      localStorage.removeItem("user");
    }
  }, []);

  // Login manual vindo do Login.jsx
  const handleManualLoginSuccess = (u) => {
    const usuarioFormatado = {
      nome: u.nome || u.username || "Usuário",
      foto: u.foto || null,
      ...u,
    };

    setUser(usuarioFormatado);
    localStorage.setItem("user", JSON.stringify(usuarioFormatado));
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AlertProvider>
      <div className="app-wrapper">
        <Alert />

        <Header usuario={user} logado={!!user} logout={handleLogout} />

        <div className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Home user={user} onLogout={handleLogout} />}
            />

            <Route
              path="/login"
              element={<Login onLoginSuccess={handleManualLoginSuccess} />}
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </AlertProvider>
  );
}

export default App;
