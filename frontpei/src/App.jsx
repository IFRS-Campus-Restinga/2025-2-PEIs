import "../src/cssGlobal.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// contextos e alertas
import { AlertProvider } from "./context/AlertContext";
import AlertComponent from './components/alert/AlertComponent.jsx';

// Páginas públicas
import LoginPage from './pages/login/Login.jsx';
import TelaPreCadastro from "./pages/preCadastro/TelaPreCadastro.jsx";
import AguardandoAprovacao from "./pages/preCadastro/AguardandoAprovacao.jsx";

// Layout
import Header from './components/customHeader/Header.jsx';
import SubHeader from './components/customSubHeader/Subheader.jsx';
import Footer from './components/customFooter/Footer.jsx';

// PÁGINAS INTERNAS
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
import PeiCentral from './pages/PeiCentral/PeiCentral.jsx';
import CreatePeiCentral from './pages/PeiCentral/CreatePeiCentral.jsx';
import EditarPeiCentral from './pages/PeiCentral/EditarPeiCentral.jsx';
import DeletarPeiCentral from './pages/PeiCentral/DeletarPeiCentral.jsx';
import Alunos from './pages/Aluno.jsx';
import CoordenadorCurso from './pages/CoordenadorCurso.jsx';
import Logs from './pages/LogsComponents/Logs.jsx';
import ComponenteCurricular from './pages/componenteCurricular.jsx';
import AtaDeAcompanhamento from './pages/ataDeAcompanhamento.jsx';
import DocumentacaoComplementar from './pages/documentacaoComplementar.jsx';
import Pedagogos from './pages/Pedagogo.jsx';
import Professor from "./pages/Professor.jsx";
//import Usuarios from './pages/Usuario.jsx';

// ADICIONADO DA BRANCH DEVELOPER (válido)
import { mandaEmail } from "./lib/mandaEmail";
import Conteudo from './pages/Conteudo.jsx';

// Rotas Admin
import TelaSolicitacoesPendentes from "./pages/admin/TelaSolicitacoesPendentes";

function App() {

  const [usuario, setUsuario] = useState(null);
  const [logado, setLogado] = useState(false);
  const [mensagemErro, setMensagemErro] = useState(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const navigate = useNavigate();

  // Carregar login salvo
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
      setLogado(true);
    }
  }, []);

  // Login Google
  const sucessoLoginGoogle = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      const resposta = await fetch("http://localhost:8000/api/auth/login/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken })
      });

      const data = await resposta.json();
      console.log("RESPOSTA DO BACKEND:", data);

      if (data.status === "pending") {
        localStorage.setItem("google_prelogin", JSON.stringify({
          email: data.email,
          nome: data.name,
          foto: data.picture
        }));
        navigate("/pre-cadastro");
        return;
      }

      if (data.status === "not_approved") {
        navigate("/aguardando-aprovacao");
        return;
      }

      if (data.status === "no_group") {
        setMensagemErro("Usuário sem grupo. Contate o administrador.");
        return;
      }

      if (data.status === "ok") {

        const respMe = await fetch("http://localhost:8000/api/auth/me/", {
          headers: { "Authorization": `Token ${data.token}` }
        });
        const me = await respMe.json();
        const dadosGoogle = jwtDecode(credentialResponse.credential);

        const userData = {
          email: data.email,
          token: data.token,
          nome: dadosGoogle.name,
          foto: dadosGoogle.picture,
          grupos: me.grupos
        };

        localStorage.setItem("usuario", JSON.stringify(userData));
        localStorage.setItem("token", data.token);

        setUsuario(userData);
        setLogado(true);
        return;
      }

      setMensagemErro(data.detail || "Erro inesperado.");

    } catch (e) {
      console.error("Erro login Google:", e);
      setMensagemErro("Falha ao conectar com o servidor.");
    }
  };

  const erroLoginGoogle = () => {
    setMensagemErro("Falha no login com o Google.");
  };

  const logout = () => {
    setUsuario(null);
    setLogado(false);
    setPerfilSelecionado(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  return (
    <GoogleOAuthProvider clientId="992049438235-9m3g236g0p0mu0bsaqn6id0qc2079tub.apps.googleusercontent.com">
      <AlertProvider>
        {/* componente global que exibe alerts */}
        <AlertComponent />

        { logado ? (
          <div className="app-container">
            <Header usuario={usuario} logado={logado} logout={logout} />
            <SubHeader perfilSelecionado={perfilSelecionado} />
            <hr />

            <main className='main-content'>
              <Routes>
                   {/* PUBLIC */}
                <Route path="/pre-cadastro" element={<TelaPreCadastro />} />
                <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />
                <Route 
                  path="/" 
                  element={<Home 
                    usuario={usuario} 
                    perfilSelecionado={perfilSelecionado} 
                    setPerfilSelecionado={setPerfilSelecionado} 
                  />} 
                />
                <Route path="/" element={<Home />} />
                <Route path="/pareceres" element={<Pareceres />} />
                <Route path="/periodo" element={<PEIPeriodoLetivo />} />
                <Route path="/listar_periodos" element={<PEIPeriodoLetivoLista />} />
                <Route path="/listar_periodos/:id" element={<PEIPeriodoLetivoLista />} /> {/**Teste Mau */}
                <Route path="/periodoLetivoPerfil" element={<PeriodoLetivoPerfil />} />
                <Route path="/disciplina" element={<Disciplinas/>}/>
                <Route path="/disciplinasCadastrar" element={<DisciplinasCRUD/>}/>
                <Route path="/disciplinaEditar/:id" element={<DisciplinasCRUD/>}/>
                <Route path="/curso" element={<Cursos/>}/>
                <Route path="/cursoCadastrar" element={<CursosCRUD/>}/>
                <Route path="/cursoEditar/:id" element={<CursosCRUD/>}/>
                <Route path="/aluno" element={<Alunos/>}/>
                <Route path="/coordenador" element={<CoordenadorCurso/>}/>
                <Route path="/peicentral" element={<PeiCentral />} />
                <Route path="/create_peicentral" element={<CreatePeiCentral/>}/>
                <Route path="/editar_peicentral/:id" element={<EditarPeiCentral/>}/>
                <Route path="/deletar_peicentral/:id" element={<DeletarPeiCentral/>}/>
                <Route path="/componenteCurricular" element={<ComponenteCurricular/>}/>
                <Route path="/ataDeAcompanhamento" element={<AtaDeAcompanhamento/>}/>
                <Route path="/documentacaoComplementar" element={<DocumentacaoComplementar/>}/>
                <Route path="/pedagogo" element={<Pedagogos/>}/>
                <Route path="/logs" element={<Logs/>}/>
                <Route path="/professor" element={<Professor />} />
                <Route path="/perfil" element={<Perfil/>} />
                 {/* ADMIN */}
                {usuario?.grupos?.includes("Admin") && (
                  <Route path="/admin/solicitacoes" element={<TelaSolicitacoesPendentes />} />
                )}

              </Routes>
            </main>
            <Footer/>
          </div>
        ) : (
          <LoginPage 
            onLoginSuccess={sucessoLoginGoogle}
            onLoginError={erroLoginGoogle}
            mensagemErro={mensagemErro}
          />
        )}
      </AlertProvider>
    </GoogleOAuthProvider>   
  )
}

export default App
