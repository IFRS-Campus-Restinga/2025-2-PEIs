import React from "react";

const AguardandoAprovacao = () => {
  return (
    <div className="pre-cadastro-container">
      <div className="pre-cadastro-card">
        <h2 style={{ color: "#333" }}>Aguardando Aprovação</h2>

        <p style={{ marginTop: "15px", fontSize: "16px" }}>
          Seu cadastro foi enviado e está aguardando aprovação do administrador.
        </p>

        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          Assim que for aprovado, você poderá acessar o sistema normalmente.
        </p>

        <div style={{ marginTop: "20px" }}>
          <span className="loader"></span>
        </div>
      </div>
    </div>
  );
};

export default AguardandoAprovacao;