import React, { useState, useRef, useEffect } from 'react';
import "./Header.css";
import logo from "../../assets/logo-sem-nome.png";
import userIcon from "../../assets/user.svg";
import chevronDown from "../../assets/chevron-down.svg";
import bellIcon from "../../assets/bell.svg";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import axios from "axios";

const Header = ({ usuario, logado, logout }) => {
    const [menuAberto, setMenuAberto] = useState(false);
    const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const menuRef = useRef(null);
    const notifRef = useRef(null);

    // Fecha dropdowns ao clicar fora
=======

const Header = ({ usuario, logado, logout }) => {
    const [menuAberto, setMenuAberto] = useState(false);
    const menuRef = useRef(null);

>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAberto(false);
            }
<<<<<<< HEAD
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotificacoesAbertas(false);
            }
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

<<<<<<< HEAD
    // Busca notificações ao logar
    useEffect(() => {
        if (logado) {
            buscarNotificacoes();
        }
    }, [logado]);

    const buscarNotificacoes = async () => {
        try {
            const token = localStorage.getItem("access");
            const response = await axios.get("http://localhost:8000/services/notificacoes-lista/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNotificacoes(response.data);
        } catch (error) {
            console.error("Erro ao buscar notificações:", error);
        }
    };

    // metodo para formatar a data para exibição de quanto tempo faz que a notificacao foi emitida
    const formatarData = (dataString) => {
        const data = new Date(dataString);
        const agora = new Date();
        const diffMs = agora - data;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Agora mesmo";
        if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
        if (diffDias < 7) return `Há ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
        
        return data.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    return (
        <header className="header">
=======
    return (
        <header className="header">
            {/* ESQUERDA */}
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
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

<<<<<<< HEAD
=======
            {/* CENTRO */}
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
            <div className="header-center">
                <h1>Sistema de Gerenciamento de PEI</h1>
                <span className="header-subtitle">Gestão de Planos Educacionais Individualizados</span>
            </div>

<<<<<<< HEAD
            <div className="header-right">
                {logado && usuario && (
                    <>
                        {/* 🔔 Notificações */}
                        <div className="notif-wrapper" ref={notifRef}>
                            <button
                                className="header-icon-btn"
                                onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
                            >
                                <img src={bellIcon} alt="Notificações" />
                                {notificacoes.length > 0 && (
                                    <span className="notif-badge">{notificacoes.length}</span>
                                )}
                            </button>

                            <div className={`notif-dropdown ${notificacoesAbertas ? "active" : ""}`}>
                                <div className="notif-header">
                                    <p className="notif-title">Notificações</p>
                                    {notificacoes.length > 0 && (
                                        <span className="notif-count">{notificacoes.length} nova{notificacoes.length > 1 ? 's' : ''}</span>
                                    )}
                                </div>
                                
                                <div className="notif-list-container">
                                    {notificacoes.length > 0 ? (
                                        <ul className="notif-list">
                                            {notificacoes.map((n) => (
                                                <li key={n.id} className="notif-item">
                                                    <div className="notif-content">
                                                        <h4 className="notif-item-title">{n.titulo}</h4>
                                                        <p className="notif-item-message">{n.mensagem}</p>
                                                        <span className="notif-item-time">{formatarData(n.data_criacao)}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="notif-empty">
                                            <p className="notif-empty-text">Nenhuma notificação</p>
                                            <span className="notif-empty-subtext">Você está em dia!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 👤 Usuário */}
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
=======
            {/* DIREITA */}
            <div className="header-right">
                {logado && usuario && (
                    <>
                        {/* Notificações */}
                        <button className="header-icon-btn">
                            <img src={bellIcon} alt="Notificações" />
                        </button>
                        
                        {/* Avatar + Nome + Chevron */}
                        <div className="user-wrapper" ref={menuRef}>
                            <div 
                                className="user-avatar"
                                onClick={() => setMenuAberto(!menuAberto)}
                            >
                                <img src={userIcon} alt="Usuário" />
                                <span className="user-avatar-name">{usuario.nome}</span>
                                <img 
                                    src={chevronDown} 
                                    alt="Menu" 
                                    className="user-arrow"
                                    style={{ 
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
                                        transform: menuAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease'
                                    }}
                                />
                            </div>

<<<<<<< HEAD
=======
                            {/* Dropdown */}
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
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