import './App.css'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useState } from 'react'
import Crud from './Crud.jsx'

function App() {

// ------------------------------------------------------------
// estados para login google
const [usuario, setUsuario] = useState(null)
const [logado, setLogado] = useState(false)

// ------------------------------------------------------------
// callback de sucesso no login
const sucessoLoginGoogle = (credentialResponse) => {
  try {
    const dados = jwtDecode(credentialResponse.credential)
    setUsuario({ email: dados.email, nome: dados.name })
    setLogado(true)
  } catch (erro) {
    console.error('Erro ao decodificar token do Google:', erro)
    setUsuario(null)
    setLogado(false) } }

// ------------------------------------------------------------
// callback de erro no login
const erroLoginGoogle = () => {
  console.error('Falha no login com o Google')
  setUsuario(null)
  setLogado(false) }

// ------------------------------------------------------------
return ( <>
<GoogleOAuthProvider clientId="1050578287576-b870ajrmae9eioc0k2mumod0digo54fd.apps.googleusercontent.com">
  { logado ? (
    <div>
      <div>Olá, {usuario.nome} ({usuario.email}).<br />
      <button onClick={() => { setUsuario(null); setLogado(false); }}>Logout</button></div>
      <hr />
      <Crud />
    </div>
  ) : (  
    <div style={{
      position: 'fixed',
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      width: '30%' }}>
      <img src='./src/assets/logo.png' style={{ height: 225, width: 150 }} />
      <h2>Prova de Conceito do PEI</h2>
      <p>Você precisa fazer login para acessar o sistema.</p>
      <GoogleLogin
        onSuccess={sucessoLoginGoogle}
        onError={erroLoginGoogle}
      />
    </div>
  ) }
</GoogleOAuthProvider>
</> ) }
export default App