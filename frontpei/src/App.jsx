import "../src/cssGlobal.css"
import { GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom";

// 🔥 IMPORTA O AUTH CONTEXT E PROTECTED ROUTES
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// Importações dos contextos/alerts
import { AlertProvider } from "./context/AlertContext";
import AlertComponent from './components/alert/AlertComponent.jsx';

// Imports das tuas páginas e componentes
import Home from "./pages/home/Home.jsx"
import Pareceres from "./pages/Parecer.jsx";
import PEIPeriodoLetivo from "./pages/peiPeriodoLetivo/PEIPeriodoLetivo.jsx";
import PEIPeriodoLetivoLista from "./pages/peiPeriodoLetivo/listar_pei_periodo_letivo.jsx";
import PeriodoLetivoPerfil from "./pages/telaPerfilProfessor/periodoLetivoPerfil.jsx";
import Perfil from "./pages/perfil/Perfil.jsx";
import Cursos from "./pages/Curso/Curso.jsx";
import CursosCRUD from "./pages/Curso/CursoCRUD.jsx";
import Disciplinas from "./pages/Disciplina/Disciplina.jsx";
import DisciplinasCRUD from "./pages/Disciplina/DisciplinaCRUD.jsx";
import Header from './components/customHeader/Header.jsx'
import Footer from './components/customFooter/Footer.jsx'
import SubHeader from './components/customSubHeader/Subheader.jsx'
import PeiCentral from './pages/PeiCentral/PeiCentral.jsx'
import CreatePeiCentral from './pages/PeiCentral/CreatePeiCentral.jsx'
import EditarPeiCentral from './pages/PeiCentral/EditarPeiCentral.jsx'
import DeletarPeiCentral from './pages/PeiCentral/DeletarPeiCentral.jsx'
import Alunos from './pages/Aluno.jsx'
import CoordenadorCurso from './pages/CoordenadorCurso.jsx'
import Logs from './pages/LogsComponents/Logs.jsx'
import ComponenteCurricular from './pages/componenteCurricular.jsx'
import AtaDeAcompanhamento from './pages/ataDeAcompanhamento.jsx'
import DocumentacaoComplementar from './pages/documentacaoComplementar.jsx'
import Pedagogos from './pages/Pedagogo.jsx'
import LoginPage from './pages/login/Login.jsx'
import Professor from "./pages/Professor.jsx";
import Usuarios from './pages/Usuario.jsx';
import { mandaEmail } from "./lib/mandaEmail";


function App() {
  // estados para o login do google
  const [usuario, setUsuario] = useState(null)
  const [logado, setLogado] = useState(false)
  const [mensagemErro, setMensagemErro] = useState(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);

  // recuperar sessão do google
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario")
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo))
      setLogado(true)
    }
  }, [])

  const sucessoLoginGoogle = (credentialResponse) => {
    try {
      const dados = jwtDecode(credentialResponse.credential)
      const email = dados.email || ""

      if (!email.endsWith("ifrs.edu.br")) {
        setUsuario(null)
        setLogado(false)
        setMensagemErro("Acesso negado. Use um email IFRS.")
        return
      }

      const userData = { email: dados.email, nome: dados.name, foto: dados.picture }

      setUsuario(userData)
      setLogado(true)
      localStorage.setItem("usuario", JSON.stringify(userData))

      mandaEmail(email, "Login PEI", "Novo login feito no sistema.")

    } catch (erro) {
      console.error('Erro token Google:', erro)
      setUsuario(null)
      setLogado(false)
    }
  }

  const erroLoginGoogle = () => {
    setUsuario(null)
    setLogado(false)
    setMensagemErro("Falha no login com o Google.")
  }

  const logout = () => {
    setUsuario(null)
    setLogado(false)
    setPerfilSelecionado(null)
    localStorage.removeItem("usuario")
  }

  return (
    <GoogleOAuthProvider clientId="992049438235-9m3g236g0p0mu0bsaqn6id0qc2079tub.apps.googleusercontent.com">
      {/* 🔥 ENVOLVE TUDO AQUI */}
      <AuthProvider>
        <AlertProvider>

          <AlertComponent />

          { logado ? (
            <div className="app-container">
              <Header usuario={usuario} logado={logado} logout={logout} />
              <SubHeader perfilSelecionado={perfilSelecionado} />
              <hr />

              <main className='main-content'>
                <Routes>

                  {/* 🔥 ROTAS PROTEGIDAS POR LOGIN */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Home 
                          usuario={usuario} 
                          perfilSelecionado={perfilSelecionado} 
                          setPerfilSelecionado={setPerfilSelecionado} 
                        />
                      </ProtectedRoute>
                    }
                  />

                  <Route 
                    path="/pareceres" 
                    element={<ProtectedRoute><Pareceres /></ProtectedRoute>} 
                  />

                  <Route 
                    path="/periodo" 
                    element={<ProtectedRoute><PEIPeriodoLetivo /></ProtectedRoute>} 
                  />

                  <Route 
                    path="/listar_periodos" 
                    element={<ProtectedRoute><PEIPeriodoLetivoLista /></ProtectedRoute>} 
                  />

                  <Route 
                    path="/listar_periodos/:id" 
                    element={<ProtectedRoute><PEIPeriodoLetivoLista /></ProtectedRoute>} 
                  />

                  <Route 
                    path="/periodoLetivoPerfil" 
                    element={<ProtectedRoute><PeriodoLetivoPerfil /></ProtectedRoute>} 
                  />

                  <Route 
                    path="/disciplina" 
                    element={<ProtectedRoute><Disciplinas/></ProtectedRoute>} 
                  />

                  <Route 
                    path="/disciplinasCadastrar" 
                    element={<ProtectedRoute><DisciplinasCRUD/></ProtectedRoute>}
                  />

                  <Route 
                    path="/disciplinaEditar/:id" 
                    element={<ProtectedRoute><DisciplinasCRUD/></ProtectedRoute>}
                  />

                  <Route path="/curso" element={<ProtectedRoute><Cursos/></ProtectedRoute>} />
                  <Route path="/cursoCadastrar" element={<ProtectedRoute><CursosCRUD/></ProtectedRoute>} />
                  <Route path="/cursoEditar/:id" element={<ProtectedRoute><CursosCRUD/></ProtectedRoute>} />
                  <Route path="/aluno" element={<ProtectedRoute><Alunos/></ProtectedRoute>} />
                  <Route path="/coordenador" element={<ProtectedRoute><CoordenadorCurso/></ProtectedRoute>} />

                  <Route path="/peicentral" element={<ProtectedRoute><PeiCentral /></ProtectedRoute>} />
                  <Route path="/create_peicentral" element={<ProtectedRoute><CreatePeiCentral/></ProtectedRoute>} />
                  <Route path="/editar_peicentral/:id" element={<ProtectedRoute><EditarPeiCentral/></ProtectedRoute>} />
                  <Route path="/deletar_peicentral/:id" element={<ProtectedRoute><DeletarPeiCentral/></ProtectedRoute>} />

                  <Route path="/componenteCurricular" element={<ProtectedRoute><ComponenteCurricular/></ProtectedRoute>} />
                  <Route path="/ataDeAcompanhamento" element={<ProtectedRoute><AtaDeAcompanhamento/></ProtectedRoute>} />
                  <Route path="/documentacaoComplementar" element={<ProtectedRoute><DocumentacaoComplementar/></ProtectedRoute>} />
                  <Route path="/pedagogo" element={<ProtectedRoute><Pedagogos/></ProtectedRoute>} />
                  <Route path="/logs" element={<ProtectedRoute><Logs/></ProtectedRoute>} />
                  <Route path="/professor" element={<ProtectedRoute><Professor /></ProtectedRoute>} />
                  <Route path="/usuario" element={<ProtectedRoute><Usuarios/></ProtectedRoute>} />
                  <Route path="/perfil" element={<ProtectedRoute><Perfil/></ProtectedRoute>} />

                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/aprovar-usuarios"
                    element={
                      <AdminRoute>
                        <ListaDeUsuariosPendentes />
                      </AdminRoute>
                    }
                  />

                </Routes>
              </main>

              <Footer/>
            </div>
          ) : (
            <LoginPage 
              onLoginSuccess={sucessoLoginGoogle}
              onLoginError={erroLoginGoogle}
              mensagemErro={mensagemErro}
            />
          )}

        </AlertProvider>
      </AuthProvider>
    </GoogleOAuthProvider>   
  )
}

export default App;
