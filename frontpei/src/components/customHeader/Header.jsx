import React, { useState, useRef, useEffect } from 'react';
import "./Header.css";
import logo from "../../assets/logo-sem-nome.png";
import userIcon from "../../assets/user.svg";
import chevronDown from "../../assets/chevron-down.svg";
import bellIcon from "../../assets/bell.svg";
import { Link } from "react-router-dom";

const Header = ({ usuario, logado, logout }) => {
    const [menuAberto, setMenuAberto] = useState(false);
    const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
    const menuRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAberto(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotificacoesAbertas(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/">
                    <img src={logo} alt="Logo IFRS" className="header-logo" />
                </Link>
                <div className="header-text">
                    <strong>INSTITUTO FEDERAL</strong>
                    <span>Rio Grande do Sul</span>
                    <span>Campus Restinga</span>
                </div>
            </div>

            <div className="header-center">
                <h1>Sistema de Gerenciamento de PEI</h1>
                <span className="header-subtitle">Gestão de Planos Educacionais Individualizados</span>
            </div>

            <div className="header-right">
                {logado && usuario && (
                    <>
                        <div className="notif-wrapper" ref={notifRef}>
                            <button 
                                className="header-icon-btn"
                                onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
                            >
                                <img src={bellIcon} alt="Notificações" />
                            </button>

                            <div className={`notif-dropdown ${notificacoesAbertas ? "active" : ""}`}>
                                <p className="notif-title">Notificações</p>
                                <ul className="notif-list">
                                    <li>Nenhuma nova notificação</li>
                                </ul>
                            </div>
                        </div>

                        <div className="user-wrapper" ref={menuRef}>
                            <div 
                                className="user-avatar"
                                onClick={() => setMenuAberto(!menuAberto)}
                            >
                                <img src={usuario.foto ? usuario.foto : userIcon} alt="Usuário" />
                                <span className="user-avatar-name">{usuario.nome}</span>
                                <img 
                                    src={chevronDown} 
                                    alt="Menu" 
                                    className="user-arrow"
                                    style={{ 
                                        transform: menuAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease'
                                    }}
                                />
                            </div>

                            <div className={`user-menu ${menuAberto ? "active" : ""}`}>
                                <div className="user-card">
                                    <p className="user-name">{usuario.nome}</p>
                                    <Link to="/perfil">Meu Perfil</Link>
                                    <button onClick={logout}>Sair</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
