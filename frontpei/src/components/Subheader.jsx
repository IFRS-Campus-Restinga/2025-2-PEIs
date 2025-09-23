// src/components/SubHeader.jsx
import { useNavigate } from "react-router-dom";
import "./Subheader.css";

const SubHeader = () => {
  const navigate = useNavigate();

  return (
    <nav className="subheader">
      <div className="subheader-buttons">
        <button onClick={() => navigate("/pareceres")} className="subheader-btn">Cadastro de Pareceres</button>
        <button onClick={() => navigate("/curso")} className="subheader-btn">Cadastro de Cursos</button>
        <button onClick={() => navigate("/disciplina")} className="subheader-btn">Cadastro de Disciplinas</button>
        <button onClick={() => navigate("/periodo")} className="subheader-btn">Cadastro de Períodos Letivos</button>
        <button onClick={() => navigate("/aluno")} className="subheader-btn">Cadastro de Alunos</button>
        <button onClick={() => navigate("/coordenador")} className="subheader-btn">Cadastro de Coordenador</button>
        <button onClick={() => navigate("/peicentral")} className="subheader-btn">Visualizar PEI Central</button>
      </div>
    </nav>
  );
};

export default SubHeader;
