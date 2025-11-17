import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import ErrorMessage from "../../components/errorMessage/ErrorMessage.jsx";
import "../../cssGlobal.css";

const LoginPage = ({ onLoginSuccess, onLoginError, mensagemErro }) => {

  // Controle do popup de registro
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Campos de login manual
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Campos do registro
  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSenha, setRegSenha] = useState("");
  const [regConfirmSenha, setRegConfirmSenha] = useState("");
  const [regPerfil, setRegPerfil] = useState("");
  const [regMatricula, setRegMatricula] = useState("");

  // Controle de erros no registro
  const [registroErro, setRegistroErro] = useState("");

  const abrirRegistro = () => {
    setRegistroErro("");
    setShowRegisterModal(true);
  };
  const fecharRegistro = () => setShowRegisterModal(false);

  // Login manual (API a ser implementada)
  const handleLoginManual = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/login/", {
        email: email,
        senha: senha
      });

      console.log("Login manual realizado:", response.data);
      // Tratar sucesso do login (token, redirecionamento etc)
    } catch (error) {
      console.error("Erro no login manual:", error);
      alert("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  // Registro via backend
  const handleRegistrar = async () => {
    setRegistroErro("");

    if (!regNome || !regEmail || !regSenha || !regConfirmSenha || !regPerfil) {
      setRegistroErro("Preencha todos os campos obrigatórios e selecione um perfil!");
      return;
    }

    if (regSenha !== regConfirmSenha) {
      setRegistroErro("As senhas não coincidem!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/usuarios/registrar/", {
        nome: regNome,
        email: regEmail,
        senha: regSenha,
        tipo_usuario: regPerfil,
        matricula: regPerfil === "ALUNO" ? regMatricula : undefined
      });

      if (response.status === 201 || response.status === 200) {
        alert("Registro realizado com sucesso!");
        fecharRegistro();

        // Limpar campos do registro
        setRegNome("");
        setRegEmail("");
        setRegSenha("");
        setRegConfirmSenha("");
        setRegPerfil("");
        setRegMatricula("");
      }

    } catch (error) {
      console.error(error);
      if (error.response) {
        setRegistroErro("Erro ao registrar: " + (error.response.data.error || JSON.stringify(error.response.data)));
      } else {
        setRegistroErro("Erro ao registrar usuário. Verifique sua conexão.");
      }
    }
  };

  return (
    <div className="login-container">

      {/* Lado Esquerdo */}
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

      {/* Lado Direito — Login */}
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

          {/* Login com Google */}
          <div className="login-button-wrapper">
            <GoogleLogin 
              onSuccess={onLoginSuccess} 
              onError={onLoginError}
              size="large"
              width="100%"
            />
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

            {/* Seleção de perfil */}
            <div className="perfil-check-container">
              <p>Selecione seu perfil:</p>

              <label className="perfil-item">
                <input 
                  type="radio"
                  name="perfil"
                  value="COORDENADOR"
                  onChange={e => setRegPerfil(e.target.value)}
                /> Coordenador
              </label>

              <label className="perfil-item">
                <input 
                  type="radio"
                  name="perfil"
                  value="NAPNE"
                  onChange={e => setRegPerfil(e.target.value)}
                /> NAPNE
              </label>

              <label className="perfil-item">
                <input 
                  type="radio"
                  name="perfil"
                  value="PROFESSOR"
                  onChange={e => setRegPerfil(e.target.value)}
                /> Professor
              </label>

              <label className="perfil-item">
                <input 
                  type="radio"
                  name="perfil"
                  value="PEDAGOGO"
                  onChange={e => setRegPerfil(e.target.value)}
                /> Pedagogo
              </label>
            </div>

            {/* Matrícula apenas para alunos */}
            {regPerfil === "ALUNO" && (
              <input
                type="text"
                placeholder="Matrícula"
                value={regMatricula}
                onChange={e => setRegMatricula(e.target.value)}
                className="login-input"
              />
            )}

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
