import React from "react";
import { Link } from "react-router-dom";
import "../../cssGlobal.css";

const PerfilAdmin = ({ usuario, onVoltar }) => {
  return (
    <div className="perfil-admin-container">
      <h1>Painel do Administrador</h1>
      <p className="subtitulo">
        Escolha uma das opções abaixo para gerenciar o sistema.
      </p>

      <div className="botoes-admin-grid">
        <Link to="/usuario" className="btn-admin">Cadastrar Usuários</Link>
        <Link to="/curso" className="btn-admin">Gerenciar Cursos</Link>
        <Link to="/disciplina" className="btn-admin">Gerenciar Disciplinas</Link>
        <Link to="/periodo" className="btn-admin">Gerenciar Períodos Letivos</Link>
        <Link to="/coordenador" className="btn-admin">Gerenciar Coordenadores</Link>
        <Link to="/aluno" className="btn-admin">Gerenciar Alunos</Link>
        <Link to="/professor" className="btn-admin">Gerenciar Professores</Link>
        <Link to="/peicentral" className="btn-admin">Gerenciar PEIs</Link>
        <Link to="/pareceres" className="btn-admin">Gerenciar Pareceres</Link>
        <Link to="/componentecurricular" className="btn-admin">Gerenciar Componentes Curriculares</Link>
        <Link to="/atadeacompanhamento" className="btn-admin">Gerenciar Atas de Acompanhamento</Link>
        <Link to="/documentacaocomplementar" className="btn-admin">Gerenciar Documentações Complementares</Link>
        <Link to="/pedagogo" className="btn-admin">Gerenciar Pedagogos</Link>



      </div>
      
      
    </div>
  );
};

export default PerfilAdmin;
