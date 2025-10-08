import React from "react";
import { Link } from "react-router-dom";
import "./perfilAdmin.css";

const PerfilAdmin = ({ usuario, onVoltar }) => {
  return (
    <div className="perfil-admin-container">
      <h1>Bem-vindo ao Painel do Administrador</h1>
      <p className="subtitulo">
        Escolha uma das opções abaixo para gerenciar o sistema.
      </p>

      <div className="botoes-admin-grid">
        <Link to="/curso" className="btn-admin">Gerenciar Cursos</Link>
        <Link to="/disciplina" className="btn-admin">Gerenciar Disciplinas</Link>
        <Link to="/periodos" className="btn-admin">Gerenciar Períodos Letivos</Link>
        <Link to="/coordenadores" className="btn-admin">Gerenciar Coordenadores</Link>
        <Link to="/alunos" className="btn-admin">Gerenciar Alunos</Link>
        <Link to="/professores" className="btn-admin">Gerenciar Professores</Link>
        <Link to="/pei" className="btn-admin">Gerenciar PEIs</Link>
      </div>
      <button onClick={onVoltar} className="voltar-btn">Voltar</button>
    </div>
  );
};

export default PerfilAdmin;
