import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom";

// Importações dos contextos/alerts
import { AlertProvider } from "./context/AlertContext";
import AlertComponent from "./components/alert/AlertComponent.jsx";

// Imports das páginas e componentes
import Home from "./pages/home/Home.jsx"
import Pareceres from "./pages/Parecer.jsx";
import PEIPeriodoLetivo from "./pages/peiPeriodoLetivo/PEIPeriodoLetivo.jsx";
import PEIPeriodoLetivoLista from "./pages/peiPeriodoLetivo/listar_pei_periodo_letivo.jsx";
import PeriodoLetivoPerfil from "./pages/telaPerfilProfessor/periodoLetivoPerfil.jsx";
import Cursos from "./pages/Curso/Curso.jsx";
import CursosCRUD from "./pages/Curso/CursoCRUD.jsx";
import Disciplinas from "./pages/Disciplina/Disciplina.jsx";
import DisciplinasCRUD from "./pages/Disciplina/DisciplinaCRUD.jsx";
import Header from './components/customHeader/Header.jsx'
import Footer from './components/customFooter/Footer.jsx'
import SubHeader from './components/customSubHeader/Subheader.jsx'
import PeiCentral from './pages/PeiCentral/PeiCentral.jsx'
import CreatePeiCentral from './pages/PeiCentral/CreatePeiCentral.jsx'
import EditarPeiCentral from './pages/peiCentral/EditarPeiCentral.jsx'
import DeletarPeiCentral from './pages/peiCentral/DeletarPeiCentral.jsx'
import Alunos from './pages/Aluno.jsx'
import CoordenadorCurso from './pages/CoordenadorCurso.jsx'
import Logs from './pages/LogsComponents/Logs.jsx'
import ComponenteCurricular from './pages/componenteCurricular.jsx'
import AtaDeAcompanhamento from './pages/ataDeAcompanhamento.jsx'
import DocumentacaoComplementar from './pages/documentacaoComplementar.jsx'
import Pedagogos from './pages/Pedagogo.jsx'
import LoginPage from './pages/login/Login.jsx';
import Professor from "./pages/Professor.jsx";
import Perfil from './components/Perfis/Perfil.jsx';
import VisualizarPEI from './components/Perfis/VisualizarPEI.jsx';
import Usuarios from './pages/Usuario.jsx';
import { mandaEmail } from "./lib/mandaEmail";

function App() {
  // Estados do login
  //console.log("CLIENT_ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const [usuario, setUsuario] = useState(null)
  const [logado, setLogado] = useState(false)
  const [mensagemErro, setMensagemErro] = useState(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);

  // Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    const tokenSalvo = localStorage.getItem("django_token");
    if (usuarioSalvo && tokenSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      setLogado(true);
    }
  }, []);

  // Função chamada após login bem-sucedido (pelo LoginPage)
  const sucessoLoginGoogle = () => {
    const usuarioSalvo = localStorage.getItem("usuario");
    const tokenSalvo = localStorage.getItem("django_token");
    if (usuarioSalvo && tokenSalvo) {
      const user = JSON.parse(usuarioSalvo);
      setUsuario(user);
      setLogado(true);
      setMensagemErro(null);

      // Envia e-mail de notificação
      mandaEmail(user.email, "Login PEI", "Um novo login foi realizado com sucesso no sistema PEI!");
    }
  };

  // Função chamada em caso de erro
  const erroLoginGoogle = (msg = "Falha no login com o Google. Tente novamente.") => {
    setMensagemErro(msg);
    setUsuario(null);
    setLogado(false);
    localStorage.removeItem("usuario");
    localStorage.removeItem("django_token");
  };

  // Função de logout
  const logout = () => {
    setUsuario(null);
    setLogado(false);
    setPerfilSelecionado(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("django_token");
    setMensagemErro(null);
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AlertProvider>
        <AlertComponent />

        {logado ? (
          <div className="app-container">
            <Header usuario={usuario} logado={logado} logout={logout} />
            <SubHeader perfilSelecionado={perfilSelecionado} />
            <hr />

            <main className='main-content'>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Home 
                      usuario={usuario} 
                      perfilSelecionado={perfilSelecionado} 
                      setPerfilSelecionado={setPerfilSelecionado} 
                    />
                  } 
                />
                <Route path="/pareceres" element={<Pareceres />} />
                <Route path="/periodo" element={<PEIPeriodoLetivo />} />
                <Route path="/listar_periodos" element={<PEIPeriodoLetivoLista />} />
                <Route path="/listar_periodos/:id" element={<PEIPeriodoLetivoLista />} />
                <Route path="/periodoLetivoPerfil" element={<PeriodoLetivoPerfil />} />
                <Route path="/disciplina" element={<Disciplinas/>}/>
                <Route path="/disciplinasCadastrar" element={<DisciplinasCRUD/>}/>
                <Route path="/disciplinaEditar/:id" element={<DisciplinasCRUD/>}/>
                <Route path="/curso" element={<Cursos/>}/>
                <Route path="/cursoCadastrar" element={<CursosCRUD/>}/>
                <Route path="/cursoEditar/:id" element={<CursosCRUD/>}/>
                <Route path="/aluno" element={<Alunos/>}/>
                <Route path="/coordenador" element={<CoordenadorCurso/>}/>
                <Route path="/peicentral" element={<PeiCentral />} />
                <Route path="/create_peicentral" element={<CreatePeiCentral/>}/>
                <Route path="/editar_peicentral/:id" element={<EditarPeiCentral/>}/>
                <Route path="/deletar_peicentral/:id" element={<DeletarPeiCentral/>}/>
                <Route path="/componenteCurricular" element={<ComponenteCurricular/>}/>
                <Route path="/ataDeAcompanhamento" element={<AtaDeAcompanhamento/>}/>
                <Route path="/documentacaoComplementar" element={<DocumentacaoComplementar/>}/>
                <Route path="/pedagogo" element={<Pedagogos/>}/>
                <Route path="/logs" element={<Logs/>}/>
                <Route path="/professor" element={<Professor />} />
                <Route path="/usuario" element={<Usuarios/>}/>
                <Route path="/perfil/:perfil" element={<Perfil usuario={usuario} />} />
                <Route path="/pei/:alunoId" element={<VisualizarPEI />} />
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
    </GoogleOAuthProvider>   
  )
}

export default App