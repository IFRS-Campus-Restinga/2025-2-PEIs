import React from "react";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import "./AguardandoAprovacao.css";

const AguardandoAprovacao = () => {
  return (
    <div className="waiting-container-full waiting-bg">
      <div className="waiting-card-styled">
        
        {/* Área do Spinner */}
        <div className="spinner-container">
          <span className="loader"></span>
        </div>

        {/* Título e Textos com hierarquia visual */}
        <h2 className="waiting-title">Solicitação Enviada!</h2>

        <p className="waiting-text-main">
          Seu cadastro está em análise e aguardando aprovação do administrador.
        </p>

        <p className="waiting-text-sub">
          Você poderá acessar o sistema assim que sua conta for liberada.
        </p>
        
        {/* Wrapper para centralizar o botão */}
        <div className="waiting-button-wrapper">
          <BotaoVoltar texto="Voltar ao Início" style={{ margin: 0 }} />
        </div>
      </div>
    </div>
  );
};

export default AguardandoAprovacao;