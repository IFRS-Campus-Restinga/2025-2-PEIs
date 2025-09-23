import './App.css'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useState, useEffect } from 'react'
import Crud from './Crud.jsx'
import Pareceres from "./components/Parecer";
import PEIPeriodoLetivo from "./components/PEIPeriodoLetivo";
import Cursos from './components/Curso.jsx'
import Disciplinas from './components/Disciplina.jsx'
import { Routes, Route } from "react-router-dom";
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import SubHeader from './components/Subheader.jsx'
import PeiCentral from './components/PeiCentral.jsx'
import CreatePeiCentral from './components/CreatePeiCentral.jsx'
import Alunos from './components/Aluno.jsx'
import CoordenadorCurso from './components/CoordenadorCurso.jsx'


function App() {
  const [usuario, setUsuario] = useState(null)
  const [logado, setLogado] = useState(false)

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
      const userData = { email: dados.email, nome: dados.name }

      setUsuario(userData)
      setLogado(true)

      // Salva no localStorage
      localStorage.setItem("usuario", JSON.stringify(userData))
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
  }

  const logout = () => {
    setUsuario(null)
    setLogado(false)
    localStorage.removeItem("usuario") // limpa persistência
  }

  return (
    <GoogleOAuthProvider clientId="1050578287576-b870ajrmae9eioc0k2mumod0digo54fd.apps.googleusercontent.com">
      { logado ? (
        <div className="app-container">
          <Header usuario={usuario} logado={logado} logout={logout} />
          <SubHeader/>
          <hr />
          
          <main className='main-content'>
          <Routes>
            <Route path="/" element={<Crud />} />
            <Route path="/pareceres" element={<Pareceres />} />
            <Route path="/periodo" element={<PEIPeriodoLetivo />} />
            <Route path="/disciplina" element={<Disciplinas/>}/>
            <Route path="/curso" element={<Cursos/>}/>
            <Route path="/peicentral" element={<PeiCentral />} />
            <Route path="/create_peicentral" element={<CreatePeiCentral/>}/>
            <Route path="/aluno" element={<Alunos/>}/>
            <Route path="/coordenador" element={<CoordenadorCurso/>}/>
          </Routes>
          </main>
          <Footer/>

        </div>
      ) : (  
         <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '30%'
        }}>
          <img src='./src/assets/logo.png' style={{ height: 225, width: 150 }} />
          <h2>Prova de Conceito do PEI</h2>
          <p>Você precisa fazer login para acessar o sistema.</p>
          <GoogleLogin onSuccess={sucessoLoginGoogle} onError={erroLoginGoogle} />
        </div>
      )}
    </GoogleOAuthProvider>   
  )
}

export default App
