import React from "react";
import { useNavigate } from "react-router-dom";
import "./../cssGlobal.css"; // ajuste o caminho se necessário

function PaginaInicial() {
  const navigate = useNavigate();

  return (
    <div className="pagina-inicial-container">
      <div className="pagina-inicial-card">
        <h1 className="pagina-inicial-titulo">Sistema PEIs – IFRS</h1>
        <p className="pagina-inicial-subtitulo">
          Bem-vindo! Acesse sua conta ou registre-se para continuar.
        </p>

        <div className="pagina-inicial-botoes">
          <button
            className="botao-primario"
            onClick={() => navigate("/login")}
          >
            Entrar
          </button>

          <button
            className="botao-secundario"
            onClick={() => navigate("/registro")}
          >
            Registrar-se
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaginaInicial;
