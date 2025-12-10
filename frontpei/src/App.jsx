import "../src/cssGlobal.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { API_ROUTES } from "./configs/apiRoutes";

// contextos e alertas
import { AlertProvider } from "./context/AlertContext";
import AlertComponent from './components/alert/AlertComponent.jsx';

// Páginas públicas
import LoginPage from './pages/login/Login.jsx';
import TelaPreCadastro from "./pages/preCadastro/TelaPreCadastro.jsx";
import AguardandoAprovacao from "./pages/preCadastro/AguardandoAprovacao.jsx";

// Layout
import Header from './components/customHeader/Header.jsx';
import SubHeader from './components/customSubHeader/Subheader.jsx';
import Footer from './components/customFooter/Footer.jsx';
import AccessibilityWidget from './components/accessibility/AccessibilityWidget';

// Páginas internas
import Home from "./pages/home/Home.jsx";
import Pareceres from "./pages/Parecer.jsx";
import PeriodoLetivoPerfil from "./pages/telaPerfilProfessor/periodoLetivoPerfil.jsx";
import Perfil from "./pages/perfil/Perfil.jsx";
import PeiCentral from './pages/PeiCentral/PeiCentral.jsx';
import CreatePeiCentral from './pages/PeiCentral/CreatePeiCentral.jsx';
import EditarPeiCentral from './pages/PeiCentral/EditarPeiCentral.jsx';
import DeletarPeiCentral from './pages/PeiCentral/DeletarPeiCentral.jsx';
import Logs from './pages/LogsComponents/Logs.jsx';
import AtaDeAcompanhamento from './pages/ataDeAcompanhamento.jsx';
import DocumentacaoComplementar from './pages/documentacaoComplementar.jsx';
import Conteudo from './pages/Conteudo.jsx';
import TelaSolicitacoesPendentes from "./pages/admin/TelaSolicitacoesPendentes";
import TodasNotificacoes from "./pages/Notificacoes/TodasNotificacoes.jsx";

import { mandaEmail } from "./lib/mandaEmail";
import { consultaGrupo } from "./lib/consultaGrupo";
import CrudWrapper from "./components/crud/crudWrapper.jsx";

function App() {
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  });
  const [logado, setLogado] = useState(() => !!localStorage.getItem("usuario"));
  const [mensagemErro, setMensagemErro] = useState(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [exibirAcessibilidade, setExibirAcessibilidade] = useState(() => {
    const salvo = localStorage.getItem("pref_acessibilidade");
    return salvo !== null ? JSON.parse(salvo) : true;
  });
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = usuario?.grupos?.some(g => g.toLowerCase() === "admin");


  const toggleAcessibilidade = () => {
    const novoValor = !exibirAcessibilidade;
    setExibirAcessibilidade(novoValor);
    localStorage.setItem("pref_acessibilidade", JSON.stringify(novoValor));
  };

  // carregar usuário do localStorage e validar token
  useEffect(() => {
    async function carregarUsuario() {
      const usuarioSalvo = localStorage.getItem("usuario");
      const tokenSalvo = localStorage.getItem("token");

      if (usuarioSalvo && tokenSalvo) {
        const usuarioObj = JSON.parse(usuarioSalvo);
        setUsuario(usuarioObj);
        setLogado(true);

        try {
          const respMe = await fetch("http://localhost:8000/api/auth/me/", {
            headers: { "Authorization": `Token ${tokenSalvo}` }
          });

          if (respMe.ok) {
            const dadosAtualizados = await respMe.json();

            const usuarioAtualizado = {
              ...usuarioObj,
              grupos: dadosAtualizados.grupos,
              categoria: dadosAtualizados.categoria
            };

            localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));
            setUsuario(usuarioAtualizado);
          }
        } catch (error) {
          console.error("Erro ao validar token:", error);
        }
      }
    }
    carregarUsuario();
  }, []);

  // login google
  const sucessoLoginGoogle = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      const resposta = await fetch("http://localhost:8000/api/auth/login/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken })
      });

      const data = await resposta.json();

      if (data.status === "pending") {
        localStorage.setItem("google_prelogin", JSON.stringify({
          email: data.email,
          nome: data.name,
          foto: data.picture
        }));
        navigate("/pre-cadastro");
        return;
      }

      if (data.status === "not_approved") {
        navigate("/aguardando-aprovacao");
        return;
      }

      if (data.status === "no_group") {
        setMensagemErro("Usuário sem grupo.");
        return;
      }

      if (data.status === "ok") {
        const respMe = await fetch("http://localhost:8000/api/auth/me/", {
          headers: { "Authorization": `Token ${data.token}` }
        });
        const me = await respMe.json();
        const dadosGoogle = jwtDecode(credentialResponse.credential);
        const grupoDoUsuario = await consultaGrupo(data.email);

        const userData = {
          email: data.email,
          token: data.token,
          nome: dadosGoogle.name,
          foto: dadosGoogle.picture,
          grupo: grupoDoUsuario,
          grupos: me.grupos
        };

        localStorage.setItem("usuario", JSON.stringify(userData));
        localStorage.setItem("token", data.token);

        setUsuario(userData);
        setLogado(true);
        mandaEmail(data.email, "Login PEI", "Novo login realizado!");

        // Redireciona para rota anterior ou home
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
        return;
      }

      setMensagemErro(data.detail || "Erro inesperado.");
    } catch (e) {
      setMensagemErro("Falha no login com o Google.");
    }
  };

  const erroLoginGoogle = () => {
    setMensagemErro("Falha no login com o Google.");
  };

  const logout = () => {
    setUsuario(null);
    setLogado(false);
    setPerfilSelecionado(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  // ================= PRIVATE ROUTE =================
  const PrivateRoute = ({ children }) => {
    if (!logado) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    return children;
  };

  return (
    <GoogleOAuthProvider clientId="992049438235-9m3g236g0p0mu0bsaqn6id0qc2079tub.apps.googleusercontent.com">
      <AlertProvider>
        <AlertComponent />

        {/* ======================================================== */}
        {/* LAYOUT LOGADO */}
        {/* ======================================================== */}
        {logado ? (
          <div className="app-container">
            <Header 
            usuario={usuario} 
            logado={logado} 
            logout={logout}
            toggleAcessibilidade={toggleAcessibilidade}
            estadoAcessibilidade={exibirAcessibilidade}
             />
            <hr />

            <main className="main-content">
              <Routes>
                <Route path="/" element={
                  <PrivateRoute>
                    <Home 
                      usuario={usuario} 
                      perfilSelecionado={perfilSelecionado} 
                      setPerfilSelecionado={setPerfilSelecionado} 
                    />
                  </PrivateRoute>
                } />

                <Route path="/pareceres" element={<PrivateRoute><Pareceres usuario={usuario} /></PrivateRoute>} />
                <Route path="/periodoLetivoPerfil" element={<PrivateRoute><PeriodoLetivoPerfil /></PrivateRoute>} />
                <Route path="/peicentral" element={<PrivateRoute><PeiCentral /></PrivateRoute>} />
                <Route path="/create_peicentral" element={<PrivateRoute><CreatePeiCentral /></PrivateRoute>} />
                <Route path="/editar_peicentral/:id" element={<PrivateRoute><EditarPeiCentral /></PrivateRoute>} />
                <Route path="/deletar_peicentral/:id" element={<PrivateRoute><DeletarPeiCentral /></PrivateRoute>} />
                <Route path="/ataDeAcompanhamento" element={<PrivateRoute><AtaDeAcompanhamento usuario={usuario} /></PrivateRoute>} />
                <Route path="/documentacaoComplementar" element={<PrivateRoute><DocumentacaoComplementar /></PrivateRoute>} />
                <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
                <Route path="/conteudo" element={<PrivateRoute><Conteudo usuario={usuario} /></PrivateRoute>} />
                <Route path="/crud/:modelKey" element={<PrivateRoute><CrudWrapper /></PrivateRoute>} />
                <Route path="/todas-notificacoes" element={<PrivateRoute><TodasNotificacoes /></PrivateRoute>} />
                
                {isAdmin && (
                  <Route path="/admin/solicitacoes" element={<PrivateRoute><TelaSolicitacoesPendentes /></PrivateRoute>} />
                )}
                
                <Route path="/logs" element={
                  <PrivateRoute>
                    {isAdmin ? <Logs /> : <Navigate to="/" replace />}
                  </PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer usuario={usuario} />
            {exibirAcessibilidade && <AccessibilityWidget />}
          </div>
        ) : (
        /* ======================================================== */
        /* LAYOUT NÃO LOGADO                                       */
        /* ======================================================== */
          <Routes>
            <Route path="/" element={
              <LoginPage 
                onLoginSuccess={sucessoLoginGoogle} 
                onLoginError={erroLoginGoogle}
                mensagemErro={mensagemErro}
              />
            } />
            <Route path="/pre-cadastro" element={<TelaPreCadastro />} />
            <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </AlertProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
