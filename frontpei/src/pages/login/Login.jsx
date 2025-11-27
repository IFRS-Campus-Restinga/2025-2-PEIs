import React, { useState, useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import ErrorMessage from "../../components/errorMessage/ErrorMessage.jsx";
import api from "../../configs/api";
import { API_ROUTES } from "../../configs/apiRoutes.js";
import "../../cssGlobal.css";
import logo from "../../assets/logo-sem-nome.png";

const GOOGLE_CLIENT_ID = "992049438235-9m3g236g0p0mu0bsaqn6id0qc2079tub.apps.googleusercontent.com";

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

  // Estado que antes controlava o Google Login
  const [logadoComSucesso, setLogadoComSucesso] = useState(false);

  const abrirRegistro = () => {
    setRegistroErro("");
    setShowRegisterModal(true);
  };

  const fecharRegistro = () => setShowRegisterModal(false);

  // =============================
  // LOGIN MANUAL
  // =============================
  const handleLoginManual = async (e) => {
    e.preventDefault();
    if (!email.trim() || !senha) {
      alert("Preencha e-mail e senha.");
      return;
    }

    try {
      const response = await api.post(API_ROUTES.LOGIN, {
        email: email.trim(),
        senha: senha,
      });

      if (!response.data?.success) {
        alert(response.data?.error || "Credenciais inválidas.");
        return;
      }

      const usuario = response.data.usuario;

      if (usuario.status && usuario.status !== "APPROVED") {
        alert("Seu cadastro ainda está pendente de aprovação.");
        return;
      }

      setLogadoComSucesso(true); 
      onLoginSuccess?.(usuario);

    } catch (error) {
      console.error("Erro no login manual:", error);
      const msg = error?.response?.data?.error || "Erro ao conectar ao servidor.";
      alert(msg);
      onLoginError?.(error);
    }
  };

  // =============================
  // LOGIN COM GOOGLE (ATIVADO)
  // =============================
  
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const google_token = credentialResponse.credential;
      const response = await api.post("/api/login/google/", {
        token_google: google_token
      });

      const { token, usuario, status } = response.data;

      if (!token) {
        alert("Falha ao autenticar com Google.");
        return;
      }

      if (status !== "aprovado" && status !== "APPROVED") {
        alert("Seu cadastro ainda está pendente de aprovação.");
        return;
      }

      localStorage.setItem("authToken", token);
      api.defaults.headers.common["Authorization"] = `Token ${token}`;
      localStorage.setItem("usuario", JSON.stringify(usuario));

      setLogadoComSucesso(true);
      onLoginSuccess?.(usuario);

    } catch (error) {
      console.error("Erro no login Google:", error);
      alert("Falha ao autenticar com Google.");
      onLoginError?.(error);
    }
  };
  

  // =============================
  // REGISTRO
  // =============================
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
      const response = await api.post("/usuarios/registrar/", {
        nome: regNome,
        email: regEmail,
        senha: regSenha,
        tipo_usuario: regPerfil.toLowerCase(),
      });

      if (response.status === 200 || response.status === 201) {
        alert("Registro enviado! Aguarde aprovação do administrador.");
        fecharRegistro();
        setRegNome("");
        setRegEmail("");
        setRegSenha("");
        setRegConfirmSenha("");
        setRegPerfil("");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      if (error.response) {
        setRegistroErro(error.response.data.error || JSON.stringify(error.response.data));
      } else {
        setRegistroErro("Erro ao registrar usuário. Verifique a conexão.");
      }
    }
  };

  return (
    <div className="login-container">
      {/* LADO ESQUERDO */}
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
              Plataforma completa para criação, acompanhamento e gestão de Planos Educacionais 
              Individualizados, promovendo educação inclusiva e personalizada.
            </p>
            <div className="login-feature-list">
              <div className="login-feature-item">
                <div className="feature-icon">📋</div>
                <div className="feature-text">
                  <h3>Gestão Centralizada</h3>
                  <p>Gerencie todos os PEIs em um único lugar com interface intuitiva</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="feature-icon">👥</div>
                <div className="feature-text">
                  <h3>Colaboração em Equipe</h3>
                  <p>Professores, coordenadores e familiares trabalhando juntos</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="feature-icon">📊</div>
                <div className="feature-text">
                  <h3>Acompanhamento em Tempo Real</h3>
                  <p>Monitore o progresso dos estudantes com relatórios detalhados</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="feature-icon">🔒</div>
                <div className="feature-text">
                  <h3>Segurança e Privacidade</h3>
                  <p>Dados protegidos com autenticação segura e criptografia</p>
                </div>
              </div>
            </div>
          </div>
          <div className="login-footer-info">
            <p>Instituto Federal do Rio Grande do Sul - Campus Restinga</p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO */}
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

          {/* LOGIN MANUAL */}
          <form className="login-manual-form" onSubmit={handleLoginManual}>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <button type="submit" className="login-button">
              Entrar
            </button>

            <button type="button" className="register-button" onClick={abrirRegistro}>
              Registrar
            </button>

          </form>


          <div className="login-divider"></div>

          {/* GOOGLE LOGIN ATIVADO */}
          
          <div 
            className="login-button-wrapper" 
            style={{ opacity: logadoComSucesso ? 0.5 : 1, pointerEvents: logadoComSucesso ? 'none' : 'auto' }}
          >
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log("Erro no login com Google")}
                size="large"
                width="350"
                theme="outline"
                logo_alignment="left"
              />
            </GoogleOAuthProvider>
          </div>
          

          <div className="login-help">
            <p className="login-help-text">
              Utilize seu e-mail institucional (@restinga.ifrs.edu.br)
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE REGISTRO */}
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
              onChange={(e) => setRegNome(e.target.value)}
              className="login-input"
            />
            <input
              type="email"
              placeholder="E-mail"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Senha"
              value={regSenha}
              onChange={(e) => setRegSenha(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Confirmar Senha"
              value={regConfirmSenha}
              onChange={(e) => setRegConfirmSenha(e.target.value)}
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
                    checked={regPerfil === p}
                    onChange={(e) => setRegPerfil(e.target.value)}
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
