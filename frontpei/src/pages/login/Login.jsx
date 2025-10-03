import './Login.css'
import { GoogleLogin } from '@react-oauth/google'
import ErrorMessage from "../../components/errorMessage/errorMessage.jsx"

const LoginPage = ({ onLoginSuccess, onLoginError, mensagemErro }) => {
  return (
    <div className="login-page">
      <img src='./src/assets/logo.png' alt="Logo" className="login-logo" />
      <h2>Sistema PEI</h2>
      <p>Você precisa fazer login para acessar o sistema.</p>
      {mensagemErro && <ErrorMessage message={mensagemErro} align="center" />}
      <GoogleLogin onSuccess={onLoginSuccess} onError={onLoginError} />
    </div>
  )
}

export default LoginPage
