import "./cssGlobal.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, Outlet } from "react-router-dom";

// Auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// Alerts
import { AlertProvider } from "./context/AlertContext";
import AlertComponent from "./components/alert/AlertComponent.jsx";

// Pages
import LoginPage from "./pages/login/Login.jsx";
import Header from "./components/customHeader/Header.jsx";
import SubHeader from "./components/customSubHeader/Subheader.jsx";
import Footer from "./components/customFooter/Footer.jsx";
import Sidebar from "./components/sidebar/Sidebar.jsx";
import Home from "./pages/home/Home.jsx";
import Pareceres from "./pages/Parecer.jsx";
import PEIPeriodoLetivo from "./pages/peiPeriodoLetivo/PEIPeriodoLetivo.jsx";
import PEIPeriodoLetivoLista from "./pages/peiPeriodoLetivo/listar_pei_periodo_letivo.jsx";
import PeriodoLetivoPerfil from "./pages/telaPerfilProfessor/periodoLetivoPerfil.jsx";
import Perfil from "./pages/perfil/Perfil.jsx";
import Cursos from "./pages/Curso/Curso.jsx";
import CursosCRUD from "./pages/Curso/CursoCRUD.jsx";
import Disciplinas from "./pages/Disciplina/Disciplina.jsx";
import DisciplinasCRUD from "./pages/Disciplina/DisciplinaCRUD.jsx";
import PeiCentral from "./pages/PeiCentral/PeiCentral.jsx";
import CreatePeiCentral from "./pages/PeiCentral/CreatePeiCentral.jsx";
import EditarPeiCentral from "./pages/PeiCentral/EditarPeiCentral.jsx";
import DeletarPeiCentral from "./pages/PeiCentral/DeletarPeiCentral.jsx";
import Alunos from "./pages/Aluno.jsx";
import CoordenadorCurso from "./pages/CoordenadorCurso.jsx";
import Logs from "./pages/LogsComponents/Logs.jsx";
import ComponenteCurricular from "./pages/componenteCurricular.jsx";
import AtaDeAcompanhamento from "./pages/ataDeAcompanhamento.jsx";
import DocumentacaoComplementar from "./pages/documentacaoComplementar.jsx";
import Pedagogos from "./pages/Pedagogo.jsx";
import Professor from "./pages/Professor.jsx";
import Conteudo from "./pages/Conteudo.jsx";
import CrudWrapper from "./components/crud/crudWrapper.jsx";


// Layout das rotas autenticadas
const LayoutAutenticado = ({ usuario, onLogout, sidebarOpen, toggleSidebar }) => {
  return (
    <div className="app-container">
      <Header usuario={usuario} logado={true} logout={onLogout} toggleSidebar={toggleSidebar} />
      <SubHeader />
      <hr />

      <div className="layout-principal-com-sidebar">
        <main className="main-content">
          <Outlet context={{ usuario }} />
        </main>

        {/* Sidebar retrátil */}
        <Sidebar open={sidebarOpen} setOpen={toggleSidebar} />
      </div>

      <Footer usuario={usuario} />
    </div>
  );
};


function App() {
  const [usuario, setUsuario] = useState(null);
  const [logado, setLogado] = useState(false);
  const [mensagemErro, setMensagemErro] = useState(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // Abrir/fechar sidebar
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);   // ← ADIÇÃO

  // Carrega usuário ao iniciar
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      const user = JSON.parse(usuarioSalvo);
      setUsuario(user);
      setLogado(true);
    }
  }, []);

  // 🔥 LOGIN COM GOOGLE (SEGURO)
    const sucessoLoginGoogle = (credentialResponse) => {
      try {
        if (!credentialResponse?.credential) {
          console.warn("Token Google ausente em credentialResponse");
          throw new Error("Token Google ausente");
        }
  
        const dados = jwtDecode(credentialResponse.credential);
        const email = dados.email || "";
  
        if (!email.endsWith("ifrs.edu.br")) {
          setUsuario(null);
          setLogado(false);
          setMensagemErro("Acesso negado. Use um email IFRS.");
          return;
        }
  
        const userData = {
          email: dados.email,
          nome: dados.name,
          foto: dados.picture,
        };
  
        setUsuario(userData);
        setLogado(true);
        localStorage.setItem("usuario", JSON.stringify(userData));
  
        mandaEmail(email, "Login PEI", "Novo login feito no sistema.");
      } catch (erro) {
        console.error("Erro token Google:", erro);
        setUsuario(null);
        setLogado(false);
      }
    };
  
    const erroLoginGoogle = () => {
      setUsuario(null);
      setLogado(false);
      setMensagemErro("Falha no login com o Google.");
    };
  
    const logout = () => {
      setUsuario(null);
      setLogado(false);
      setPerfilSelecionado(null);
      localStorage.removeItem("usuario");
    };

  const handleLoginSuccess = (dadosUsuario) => {
    localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);
    setLogado(true);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setLogado(false);
    navigate("/login");
  };

  const isAdmin = usuario?.grupos?.some((g) => g.toLowerCase() === "admin");

  return (
    <GoogleOAuthProvider clientId="992049438235-9m3g236g0p0mu0bsaqn6id0qc2079tub.apps.googleusercontent.com">
      <AuthProvider>
        <AlertProvider>
          <AlertComponent />

          <Routes>
            {/* Rota pública - Login */}
            <Route
              path="/login"
              element={
                logado ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* Rotas protegidas */}
            <Route
              element={
                logado ? (
                  <LayoutAutenticado
                    usuario={usuario}
                    onLogout={handleLogout}
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/pareceres" element={<Pareceres />} />
              <Route path="/periodo" element={<PEIPeriodoLetivo />} />
              <Route path="/listar_periodos" element={<PEIPeriodoLetivoLista />} />
              <Route path="/listar_periodos/:id" element={<PEIPeriodoLetivoLista />} />
              <Route path="/periodoLetivoPerfil" element={<PeriodoLetivoPerfil />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/curso" element={<Cursos />} />
              <Route path="/cursoCadastrar" element={<CursosCRUD />} />
              <Route path="/cursoEditar/:id" element={<CursosCRUD />} />
              <Route path="/disciplina" element={<Disciplinas />} />
              <Route path="/disciplinasCadastrar" element={<DisciplinasCRUD />} />
              <Route path="/disciplinaEditar/:id" element={<DisciplinasCRUD />} />
              <Route path="/aluno" element={<Alunos />} />
              <Route path="/coordenador" element={<CoordenadorCurso />} />
              <Route path="/peicentral" element={<PeiCentral />} />
              <Route path="/create_peicentral" element={<CreatePeiCentral />} />
              <Route path="/editar_peicentral/:id" element={<EditarPeiCentral />} />
              <Route path="/deletar_peicentral/:id" element={<DeletarPeiCentral />} />
              <Route path="/componenteCurricular" element={<ComponenteCurricular />} />
              <Route path="/ataDeAcompanhamento" element={<AtaDeAcompanhamento />} />
              <Route path="/documentacaoComplementar" element={<DocumentacaoComplementar />} />
              <Route path="/pedagogo" element={<Pedagogos />} />
              <Route path="/professor" element={<Professor />} />
              <Route path="/conteudo" element={<Conteudo />} />
              <Route path="/crud/:modelKey" element={<CrudWrapper />} />
              <Route path="/logs" element={isAdmin ? <Logs /> : <Navigate to="/" replace />} />
            </Route>

            {/* Qualquer rota desconhecida */}
            <Route path="*" element={<Navigate to={logado ? "/" : "/login"} replace />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
