import './App.css'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useState, useEffect } from 'react'
import Home from "./pages/home/Home.jsx"
import Pareceres from "./components/Parecer";
import PEIPeriodoLetivo from "./components/PEIPeriodoLetivo";
import Cursos from './components/Curso.jsx'
import Disciplinas from './components/Disciplina.jsx'
import { Routes, Route } from "react-router-dom";
import Header from './components/customHeader/Header.jsx'
import Footer from './components/customFooter/Footer.jsx'
import SubHeader from './components/customSubHeader/Subheader.jsx'
import PeiCentral from './components/PeiCentral/PeiCentral.jsx'
import CreatePeiCentral from './components/PeiCentral/CreatePeiCentral.jsx'
import EditarPeiCentral from './components/PeiCentral/EditarPeiCentral.jsx'
import DeletarPeiCentral from './components/PeiCentral/DeletarPeiCentral.jsx'
import Alunos from './components/Aluno.jsx'
import CoordenadorCurso from './components/CoordenadorCurso.jsx'
import Logs from './components/LogsComponents/Logs.jsx'
import ComponenteCurricular from './components/componenteCurricular.jsx'
import AtaDeAcompanhamento from './components/ataDeAcompanhamento.jsx'
import DocumentacaoComplementar from './components/documentacaoComplementar.jsx'
import Pedagogos from './components/Pedagogo.jsx'

function App() {

  // estados para o login do google
  const [usuario, setUsuario] = useState(null)
  const [logado, setLogado] = useState(false)
  // verifica ao iniciar se usuario ja esta logado
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario")
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo))
      setLogado(true) }
  }, [])
  // funcao que roda ao usuario ter sucesso no login do google
  const sucessoLoginGoogle = (credentialResponse) => {
    try {
      // abrindo os dados o usuario
      const dados = jwtDecode(credentialResponse.credential)
      // preciso validar se o email pertence ao ifrs
      const email = dados.email || ""
      const partes = email.split("@")
      // deve ter exatamente uma arroba e terminar com "ifrs.edu.br"
      if (partes.length !== 2 || !email.endsWith("ifrs.edu.br")) {
        console.error("Email invalido ou nao autorizado:", email)
        setUsuario(null)
        setLogado(false)
        localStorage.removeItem("usuario")
        localStorage.removeItem("token")
        alert("Apenas contas do IFRS podem acessar o sistema.")
        return }
      // salva os dados o usuario e ativa flag de login
      const userData = { email: dados.email, nome: dados.name }
      setUsuario(userData)
      setLogado(true)
      localStorage.setItem("usuario", JSON.stringify(userData))
      localStorage.setItem("token", credentialResponse.credential)
    } catch (erro) {
      console.error('Erro ao decodificar token do Google:', erro)
      setUsuario(null)
      setLogado(false)
    } }
  // funcao que roda no caso de erro no login
  const erroLoginGoogle = () => {
    console.error('Falha no login com o Google')
    setUsuario(null)
    setLogado(false)
  }
  // funcao de logout
  const logout = () => {
    setUsuario(null)
    setLogado(false)
    // limpa a persistencia e o token
    localStorage.removeItem("usuario")
    localStorage.removeItem("token")
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
            <Route path="/" element={<Home usuario={usuario} />} />
            <Route path="/pareceres" element={<Pareceres />} />
            <Route path="/periodo" element={<PEIPeriodoLetivo />} />
            <Route path="/disciplina" element={<Disciplinas/>}/>
            <Route path="/curso" element={<Cursos/>}/>
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
