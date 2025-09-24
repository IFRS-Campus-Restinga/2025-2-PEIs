import React from "react";
import logo from "./assets/logo.png";

const Home = ({ usuario }) => {
  return (
    <div className="home-container" style={{ textAlign: "center", marginTop: 40 }}>
      <img src={logo} alt="Logo IFRS" style={{ height: 180, width: 120, marginBottom: 16 }} />
      <h1>Bem-vindo{usuario ? `, ${usuario.nome}` : ""}!</h1>
      <p style={{ fontSize: 18, margin: "16px 0" }}>
        Este é o sistema de Plano Educacional Individualizado (PEI) do IFRS Campus Restinga.<br/>
        Utilize o menu acima para acessar os módulos do sistema.
      </p>
      <p style={{ color: '#1976d2', fontWeight: 500 }}>
        Selecione um CRUD no subheader para começar.
      </p>
    </div>
  );
};

export default Home;
