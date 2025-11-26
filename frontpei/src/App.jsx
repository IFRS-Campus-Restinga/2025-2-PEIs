import "./cssGlobal.css";
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AlertProvider } from "./context/AlertContext";
import AlertComponent from "./components/alert/AlertComponent.jsx";

import LoginPage from "./pages/login/Login.jsx";

import Header from "./components/customHeader/Header.jsx";
import SubHeader from "./components/customSubHeader/Subheader.jsx";
import Footer from "./components/customFooter/Footer.jsx";

import Home from "./pages/home/Home.jsx";
import Pareceres from "./pages/Parecer.jsx";
import PEIPeriodoLetivo from "./pages/peiPeriodoLetivo/PEIPeriodoLetivo.jsx";
import PEIPeriodoLetivoLista from "./pages/peiPeriodoLetivo/listar_pei_periodo_letivo.jsx";
import PeriodoLetivoPerfil from "./pages/telaPerfilProfessor/periodoLetivoPerfil.jsx";
import Perfil from "./pages/perfil/Perfil.jsx";
import Cursos from "./pages/Curso/Curso.jsx";
import CursosCRUD from "./pages/Curso/CursoCRUD.jsx";
import Disciplinas from "./pages/Disciplina/Disciplina.jsx";
import DisciplinasCRUD from "./pages/Disciplina/DisciplinaCRUD.jsx";
import PeiCentral from "./pages/PeiCentral/PeiCentral.jsx";
import CreatePeiCentral from "./pages/PeiCentral/CreatePeiCentral.jsx";
import EditarPeiCentral from "./pages/PeiCentral/EditarPeiCentral.jsx";
import DeletarPeiCentral from "./pages/PeiCentral/DeletarPeiCentral.jsx";
import Alunos from "./pages/Aluno.jsx";
import CoordenadorCurso from "./pages/CoordenadorCurso.jsx";
import Logs from "./pages/LogsComponents/Logs.jsx";
import ComponenteCurricular from "./pages/componenteCurricular.jsx";
import AtaDeAcompanhamento from "./pages/ataDeAcompanhamento.jsx";
import DocumentacaoComplementar from "./pages/documentacaoComplementar.jsx";
import Pedagogos from "./pages/Pedagogo.jsx";
import Professor from "./pages/Professor.jsx";
import Conteudo from "./pages/Conteudo.jsx";
import CrudWrapper from "./components/crud/crudWrapper.jsx";

// Layout das rotas autenticadas
const LayoutAutenticado = ({ usuario, onLogout }) => {
  return (
    <div className="app-container">
      <Header usuario={usuario} logado={true} logout={onLogout} />
      <SubHeader />
      <hr />
      <main className="main-content">
        <Outlet context={{ usuario }} />
      </main>
      <Footer usuario={usuario} />
    </div>
  );
};

function App() {
  const [usuario, setUsuario] = useState(null);
  const [logado, setLogado] = useState(false);
  const navigate = useNavigate();

  // Carrega usuário ao iniciar
  useEffect(() => {
    const salvo = localStorage.getItem("usuario");
    if (salvo) {
      const user = JSON.parse(salvo);
      setUsuario(user);
      setLogado(true);
    }
  }, []);

  const handleLoginSuccess = (dadosUsuario) => {
    localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);
    setLogado(true);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setLogado(false);
    navigate("/login");
  };

  const isAdmin = usuario?.grupos?.some((g) => g.toLowerCase() === "admin");

  return (
    <AlertProvider>
      <AlertComponent />

      <Routes>
        {/* Rota pública - Login */}
        <Route
          path="/login"
          element={
            logado ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Rotas protegidas */}
        <Route
          element={
            logado ? (
              <LayoutAutenticado usuario={usuario} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/pareceres" element={<Pareceres />} />
          <Route path="/periodo" element={<PEIPeriodoLetivo />} />
          <Route path="/listar_periodos" element={<PEIPeriodoLetivoLista />} />
          <Route path="/listar_periodos/:id" element={<PEIPeriodoLetivoLista />} />
          <Route path="/periodoLetivoPerfil" element={<PeriodoLetivoPerfil />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/curso" element={<Cursos />} />
          <Route path="/cursoCadastrar" element={<CursosCRUD />} />
          <Route path="/cursoEditar/:id" element={<CursosCRUD />} />
          <Route path="/disciplina" element={<Disciplinas />} />
          <Route path="/disciplinasCadastrar" element={<DisciplinasCRUD />} />
          <Route path="/disciplinaEditar/:id" element={<DisciplinasCRUD />} />
          <Route path="/aluno" element={<Alunos />} />
          <Route path="/coordenador" element={<CoordenadorCurso />} />
          <Route path="/peicentral" element={<PeiCentral />} />
          <Route path="/create_peicentral" element={<CreatePeiCentral />} />
          <Route path="/editar_peicentral/:id" element={<EditarPeiCentral />} />
          <Route path="/deletar_peicentral/:id" element={<DeletarPeiCentral />} />
          <Route path="/componenteCurricular" element={<ComponenteCurricular />} />
          <Route path="/ataDeAcompanhamento" element={<AtaDeAcompanhamento />} />
          <Route path="/documentacaoComplementar" element={<DocumentacaoComplementar />} />
          <Route path="/pedagogo" element={<Pedagogos />} />
          <Route path="/professor" element={<Professor />} />
          <Route path="/conteudo" element={<Conteudo />} />
          <Route path="/crud/:modelKey" element={<CrudWrapper />} />
          <Route
            path="/logs"
            element={isAdmin ? <Logs /> : <Navigate to="/" replace />}
          />
        </Route>

        {/* Qualquer rota desconhecida */}
        <Route path="*" element={<Navigate to={logado ? "/" : "/login"} replace />} />
      </Routes>
    </AlertProvider>
  );
}

export default App;