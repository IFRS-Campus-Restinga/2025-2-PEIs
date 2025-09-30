import React, { useState } from "react";
import logo from "../../assets/logo.png";
import "./Home.css";

const Home = ({ usuario }) => {
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);

  const perfis = ["Coordenador", "NAPNE", "Professor"];

  return (
    <div className="home-container">
      <img src={logo} alt="Logo IFRS" className="home-logo" />
      <h1>Bem-vindo{usuario ? `, ${usuario.nome}` : ""}!</h1>
      <p className="home-description">
        Este é o sistema de Plano Educacional Individualizado (PEI) do IFRS Campus Restinga.<br />
        Utilize o menu acima para acessar os módulos do sistema.
      </p>
      <p className="home-subtitle">Selecione um perfil para começar.</p>

      <div className="perfil-container">
        <h2>Selecione o perfil:</h2>
        <div className="perfil-buttons">
          {perfis.map((perfil) => (
            <button
              key={perfil}
              className={`perfil-btn ${perfilSelecionado === perfil ? "ativo" : ""}`}
              onClick={() => setPerfilSelecionado(perfil)}
            >
              {perfil}
            </button>
          ))}
        </div>
        {perfilSelecionado && (
          <p className="perfil-msg">
            Perfil selecionado: <strong>{perfilSelecionado}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
