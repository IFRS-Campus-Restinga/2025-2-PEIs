import React from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Home.css";
import PerfilAdmin from "../perfil/perfilAdmin";

const Home = ({ usuario, perfilSelecionado, setPerfilSelecionado }) => {
  const perfis = ["Coordenador", "NAPNE", "Professor", "Pedagogo", "Administrador"];
  const navigate = useNavigate();

  const handlePerfilClick = (perfil) => {
    setPerfilSelecionado(perfil);
    navigate(`/perfil/${perfil.toLowerCase()}`);
  };
=======
import logo from "../../assets/logo.png";
import "./Home.css";

const Home = ({ usuario, perfilSelecionado, setPerfilSelecionado }) => {
  const perfis = ["Coordenador", "NAPNE", "Professor"];
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

  return (
    <div className="home-container">
      <img src={logo} alt="Logo IFRS" className="home-logo" />
      <h1>Bem-vindo{usuario ? `, ${usuario.nome}` : ""}!</h1>
<<<<<<< HEAD
=======
      <p className="home-description">
        Este é o sistema de Plano Educacional Individualizado (PEI) do IFRS Campus Restinga.<br />
        Utilize o menu acima para acessar os módulos do sistema.
      </p>
      <p className="home-subtitle">Selecione um perfil para começar.</p>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

      <div className="perfil-container">
        <h2>Selecione o perfil:</h2>
        <div className="perfil-buttons">
          {perfis.map((perfil) => (
            <button
              key={perfil}
              className={`perfil-btn ${perfilSelecionado === perfil ? "ativo" : ""}`}
<<<<<<< HEAD
              onClick={() => handlePerfilClick(perfil)}
=======
              onClick={() => setPerfilSelecionado(perfil)}
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
            >
              {perfil}
            </button>
          ))}
        </div>
<<<<<<< HEAD

        {perfilSelecionado && (
          <>
            <p className="perfil-msg">
              Perfil selecionado: <strong>{perfilSelecionado}</strong>
            </p>

            {perfilSelecionado === "Administrador" ? (
              <PerfilAdmin usuario={usuario} />
            ) : (
              <>
                <p className="home-description">
                  Este é o sistema de Plano Educacional Individualizado (PEI) do IFRS
                  Campus Restinga.
                  <br />
                  Utilize o menu acima para acessar os módulos do sistema.
                </p>
                <p className="home-subtitle">Selecione um perfil para começar.</p>
              </>
            )}
          </>
=======
        {perfilSelecionado && (
          <p className="perfil-msg">
            Perfil selecionado: <strong>{perfilSelecionado}</strong>
          </p>
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
        )}
      </div>
    </div>
  );
};

export default Home;
