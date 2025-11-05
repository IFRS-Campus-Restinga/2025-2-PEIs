import React from 'react';
import './Login.css';
import { GoogleLogin } from '@react-oauth/google';
import ErrorMessage from "../../components/errorMessage/errorMessage.jsx";
import axios from 'axios';

const LoginPage = ({ onLoginSuccess, onLoginError, mensagemErro }) => {

  const handleGoogleSuccess = async (response) => {
    const code = response.code;
    if (!code) {
      onLoginError();
      return;
    }

    try {
      // ✅ uso seguro do import.meta.env
      const backendURL = import.meta.env.VITE_LOGIN_GOOGLE_URL;
      if (!backendURL) {
        console.error("Variável de ambiente VITE_LOGIN_GOOGLE_URL não definida!");
        onLoginError("Erro interno: URL de login ausente.");
        return;
      }

      const res = await axios.get(backendURL, {
        params: { code },
        withCredentials: true,
      });

      const { django_token, user } = res.data;
      localStorage.setItem('django_token', django_token);
      localStorage.setItem('usuario', JSON.stringify(user));
      onLoginSuccess(); 
    } catch (err) {
      console.error("Erro no login com Google:", err);
      onLoginError();
    }
  };

  return (
    <div className="login-container">
      {/* Lado Esquerdo - Informações */}
      <div className="login-info-side">
        <div className="login-info-content">
          <div className="login-brand">
            <img src='./src/assets/logo-sem-nome.png' alt="Logo IFRS" className="login-brand-logo" />
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
                <div className="feature-icon">Document</div>
                <div className="feature-text">
                  <h3>Gestão Centralizada</h3>
                  <p>Gerencie todos os PEIs em um único lugar com interface intuitiva</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="feature-icon">People</div>
                <div className="feature-text">
                  <h3>Colaboração em Equipe</h3>
                  <p>Professores, coordenadores e familiares trabalhando juntos</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="feature-icon">Chart</div>
                <div className="feature-text">
                  <h3>Acompanhamento em Tempo Real</h3>
                  <p>Monitore o progresso dos estudantes com relatórios detalhados</p>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="feature-icon">Lock</div>
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

      {/* Lado Direito - Login */}
      <div className="login-form-side">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Acesse sua conta</h2>
            <p>Faça login com sua conta institucional do Google</p>
          </div>

          {mensagemErro && (
            <div className="login-error-wrapper">
              <ErrorMessage message={mensagemErro} align="center" />
            </div>
          )}

          <div className="login-button-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={onLoginError}
              flow="auth-code"
              size="large"
              width={350}
            />


          </div>

          <div className="login-help">
            <p className="login-help-text">
              Utilize seu e-mail institucional (@restinga.ifrs.edu.br) para acessar o sistema.
            </p>
          </div>

          <div className="login-divider"></div>

          <div className="login-support">
            <h4>Precisa de ajuda?</h4>
            <p>Entre em contato com o suporte técnico:</p>
            <a href="mailto:suporte@restinga.ifrs.edu.br">suporte@restinga.ifrs.edu.br</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;