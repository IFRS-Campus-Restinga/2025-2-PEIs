import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import ErrorMessage from "../../components/errorMessage/ErrorMessage.jsx";
import api from "../../configs/api";
import "../../cssGlobal.css";

// IMPORTAÇÃO CORRETA DO LOGO
import logo from "../../assets/logo-sem-nome.png";

const LoginPage = ({ onLoginSuccess, onLoginError, mensagemErro }) => {

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSenha, setRegSenha] = useState("");
  const [regConfirmSenha, setRegConfirmSenha] = useState("");
  const [regPerfil, setRegPerfil] = useState("");

  const [registroErro, setRegistroErro] = useState("");

  const abrirRegistro = () => {
    setRegistroErro("");
    setShowRegisterModal(true);
  };

  const fecharRegistro = () => setShowRegisterModal(false);

  const handleLoginManual = async () => {
    try {
      const response = await api.post("/api/login/", {
        email,
        senha
      });

      const { token, usuario, status } = response.data;

      if (status && status !== "aprovado") {
        alert("Seu cadastro ainda está pendente de aprovação pelo administrador.");
        return;
      }

      localStorage.setItem("authToken", token);
      api.defaults.headers.common["Authorization"] = `Token ${token}`;

      onLoginSuccess && onLoginSuccess(usuario);

    } catch (error) {
      console.error("Erro no login manual:", error);
      onLoginError && onLoginError(error);
      alert("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const google_token = credentialResponse.credential;

      const response = await api.post("/api/login/google/", {
        token_google: google_token
      });

      const { token, usuario, status } = response.data;

      if (status !== "aprovado") {
        alert("Seu cadastro ainda está pendente de aprovação do administrador.");
        return;
      }

      localStorage.setItem("authToken", token);
      api.defaults.headers.common["Authorization"] = `Token ${token}`;

      onLoginSuccess && onLoginSuccess(usuario);

    } catch (error) {
      console.error("Erro no login Google:", error);
      onLoginError && onLoginError(error);
      alert("Falha ao autenticar com Google.");
    }
  };

  const handleRegistrar = async () => {
    setRegistroErro("");

    if (!regNome || !regEmail || !regSenha || !regConfirmSenha || !regPerfil) {
      setRegistroErro("Preencha todos os campos obrigatórios e selecione um perfil.");
      return;
    }

    if (regSenha !== regConfirmSenha) {
      setRegistroErro("As senhas não coincidem!");
      return;
    }

    try {
      const response = await api.post("/services/usuarios/registrar/", {
        nome: regNome,
        email: regEmail,
        senha: regSenha,
        tipo_usuario: regPerfil.toLowerCase(),
      });

      if (response.status === 200 || response.status === 201) {
        alert("Registro enviado! Aguarde aprovação de um administrador.");

        setRegNome("");
        setRegEmail("");
        setRegSenha("");
        setRegConfirmSenha("");
        setRegPerfil("");

        fecharRegistro();
      }

    } catch (error) {
      console.error("Erro no registro:", error);

      if (error.response) {
        setRegistroErro(
          error.response.data.error ||
          JSON.stringify(error.response.data)
        );
      } else {
        setRegistroErro("Erro ao registrar usuário. Verifique sua conexão.");
      }
    }
  };

  return (
    <div className="login-container">

      {/* Área Esquerda */}
      <div className="login-info-side">
        <div className="login-info-content">
          <div className="login-brand">
            <img src={logo} alt="Logo IFRS" className="login-brand-logo" />

            <div className="login-brand-text">
              <h1>Sistema PEI</h1>
              <p>Plano Educacional Individualizado</p>
            </div>
          </div>

          <div className="login-features">
            <h2>Bem-vindo ao Sistema de Gerenciamento de PEI</h2>
            <p className="login-description">
              Plataforma completa para criação, acompanhamento e gestão de PEIs,
              promovendo educação inclusiva e personalizada.
            </p>
          </div>

          <div className="login-footer-info">
            <p>Instituto Federal do Rio Grande do Sul - Campus Restinga</p>
          </div>
        </div>
      </div>

      {/* Área Direita */}
      <div className="login-form-side">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Acesse sua conta</h2>
            <p>Escolha uma das opções para entrar:</p>
          </div>

          {mensagemErro && (
            <div className="login-error-wrapper">
              <ErrorMessage message={mensagemErro} align="center" />
            </div>
          )}

          {/* Login Manual */}
          <div className="login-manual-form">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
            />

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="login-input"
            />

            <button className="login-button" onClick={handleLoginManual}>
              Entrar
            </button>

            <button className="register-button" onClick={abrirRegistro}>
              Registrar
            </button>
          </div>

          <div className="login-divider"></div>

          {/* Google Login */}
          <div className="login-button-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => onLoginError && onLoginError()}
              size="large"
            />
          </div>

          <div className="login-help">
            <p className="login-help-text">
              Utilize seu e-mail institucional (@restinga.ifrs.edu.br)
            </p>
          </div>

        </div>
      </div>

      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <h2>Criar Conta</h2>

            {registroErro && (
              <div style={{ marginBottom: "10px", color: "red" }}>
                <ErrorMessage message={registroErro} align="center" />
              </div>
            )}

            <input
              type="text"
              placeholder="Nome completo"
              value={regNome}
              onChange={e => setRegNome(e.target.value)}
              className="login-input"
            />

            <input
              type="email"
              placeholder="E-mail"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              className="login-input"
            />

            <input
              type="password"
              placeholder="Senha"
              value={regSenha}
              onChange={e => setRegSenha(e.target.value)}
              className="login-input"
            />

            <input
              type="password"
              placeholder="Confirmar Senha"
              value={regConfirmSenha}
              onChange={e => setRegConfirmSenha(e.target.value)}
              className="login-input"
            />

            <div className="perfil-check-container">
              <p>Selecione seu perfil:</p>

              {["COORDENADOR", "NAPNE", "PROFESSOR", "PEDAGOGO"].map(p => (
                <label key={p} className="perfil-item">
                  <input
                    type="radio"
                    name="perfil"
                    value={p}
                    onChange={e => setRegPerfil(e.target.value)}
                  />{" "}
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </label>
              ))}
            </div>

            <button className="login-button" onClick={handleRegistrar}>
              Criar Conta
            </button>
            <button className="cancel-button" onClick={fecharRegistro}>
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
