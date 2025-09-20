import React from 'react';
import "./Header.css";
import logo from "../assets/logo.png"; // ajusta o caminho se necessário

const Header = ({ usuario, logado, logout }) => {
    return (
        <header className="header">
            {/* ESQUERDA */}
            <div className="header-left">
                <img src={logo} alt="Logo IFRS" className="header-logo" />
                <div className="header-text">
                    <strong>INSTITUTO FEDERAL</strong>
                    <span>Rio Grande do Sul</span>
                    <span>Campus Restinga</span>
                </div>
            </div>

            {/* CENTRO */}
            <div className="header-center">
                <h1>Plano Educacional Individualizado (PEI)</h1>
            </div>

            {/* DIREITA */}
            <div className="header-right">
                {logado && usuario && (
                    <div className="user-info">
                        <span>Olá, {usuario.nome}</span>
                        <button onClick={logout} className="logout-btn">Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
