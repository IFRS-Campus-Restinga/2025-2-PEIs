import './App.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom";

// Importações dos contextos/alerts
import { AlertProvider } from "./context/AlertContext";
import Alert from "./components/alert/AlertComponent.jsx";

// Imports das tuas páginas e componentes
import Home from "./pages/home/Home.jsx"
import Pareceres from "./pages/Parecer.jsx";
import PEIPeriodoLetivo from "./pages/PEIPeriodoLetivo.jsx";
import PEIPeriodoLetivoLista from "./pages/listar_pei_periodo_letivo.jsx";
import Cursos from './pages/Curso/Curso.jsx'
import CursosCRUD from './pages/Curso/CursoCRUD.jsx'
import Disciplinas from './pages/Disciplina/Disciplina.jsx'
import DisciplinasCRUD from './pages/Disciplina/DisciplinaCRUD.jsx'
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
import LoginPage from './pages/login/login.jsx'
import Perfil from './components/Perfis/Perfil.jsx';

function App() {
  // estados para o login do google
  const [usuario, setUsuario] = useState(null)
  const [logado, setLogado] = useState(false)
  const [mensagemErro, setMensagemErro] = useState(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);

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
      const partes = email.split("@")
      if (partes.length !== 2 || !email.endsWith("ifrs.edu.br")) {
        console.error("Email invalido ou nao autorizado:", email)
        setUsuario(null)
        setLogado(false)
        localStorage.removeItem("usuario")
        localStorage.removeItem("token")
        setMensagemErro("Acesso negado. Use um email institucional do IFRS.")
        return
      }
      const userData = { email: dados.email, nome: dados.name }
      setUsuario(userData)
      setLogado(true)
      localStorage.setItem("usuario", JSON.stringify(userData))
      localStorage.setItem("token", credentialResponse.credential)
    } catch (erro) {
      console.error('Erro ao decodificar token do Google:', erro)
      setUsuario(null)
      setLogado(false)
    }
  }

  const erroLoginGoogle = () => {
    console.error('Falha no login com o Google')
    setUsuario(null)
    setLogado(false)
    setMensagemErro("Falha no login com o Google. Tente novamente.")
  }

  const logout = () => {
    setUsuario(null)
    setLogado(false)
    setPerfilSelecionado(null)
    localStorage.removeItem("usuario")
    localStorage.removeItem("token")
  }

  return (
    <GoogleOAuthProvider clientId="1050578287576-b870ajrmae9eioc0k2mumod0digo54fd.apps.googleusercontent.com">
      <AlertProvider>
        {/* componente global que exibe alerts */}
        <Alert />

        { logado ? (
          <div className="app-container">
            <Header usuario={usuario} logado={logado} logout={logout} />
            <SubHeader perfilSelecionado={perfilSelecionado} />
            <hr />

            <main className='main-content'>
              <Routes>
                <Route 
                  path="/" 
                  element={<Home 
                    usuario={usuario} 
                    perfilSelecionado={perfilSelecionado} 
                    setPerfilSelecionado={setPerfilSelecionado} 
                  />} 
                />
                <Route path="/pareceres" element={<Pareceres />} />
                <Route path="/periodo" element={<PEIPeriodoLetivo />} />
                <Route path="/listar_periodos" element={<PEIPeriodoLetivoLista />} />
                <Route path="/listar_periodos/:id" element={<PEIPeriodoLetivoLista />} /> {/**Teste Mau */}
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
                <Route path="/perfil/:perfil" element={<Perfil usuario={usuario} />} />
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
