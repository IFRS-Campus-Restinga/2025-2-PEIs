import React, { useState, useRef, useEffect } from 'react';
import logo from "../../assets/logo-sem-nome.png";
import userIcon from "../../assets/user.svg";
import chevronDown from "../../assets/chevron-down.svg";
import bellIcon from "../../assets/bell.svg";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../cssGlobal.css";
import LeitorTela from '../leitorTela/LeitorTela';

const Header = ({ usuario, logado, logout }) => {
    const [menuAberto, setMenuAberto] = useState(false);
    const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const menuRef = useRef(null);
    const notifRef = useRef(null);

    // Fecha dropdowns ao clicar fora
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

    // Busca notificações ao logar
    useEffect(() => {
        if (logado) {
            buscarNotificacoes();
        }
    }, [logado]);

    const buscarNotificacoes = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Ajustado para porta 8000 e prefixo Token
            const response = await axios.get("http://localhost:8000/services/notificacoes-lista/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            setNotificacoes(response.data);
        } catch (error) {
            console.error("Erro ao buscar notificações:", error);
        }
    };

    const marcarTodasComoLidas = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            await axios.post("http://localhost:8000/services/notificacoes/marcar_todas_lidas/", {}, {
                headers: { Authorization: `Token ${token}` },
            });

            // Atualiza localmente
            const novasNotificacoes = notificacoes.map(n => ({ ...n, lida: true }));
            setNotificacoes(novasNotificacoes);
            
        } catch (error) {
            console.error("Erro ao marcar notificações:", error);
        }
    };

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

    // Contagem de não lidas
    const naoLidasCount = notificacoes.filter(n => !n.lida).length;

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
                        {/* 🔔 Notificações */}
                        <div className="notif-wrapper" ref={notifRef}>
                            <button
                                className="header-icon-btn"
                                onClick={() => setNotificacoesAbertas(!notificacoesAbertas)}
                            >
                                <img src={bellIcon} alt="Notificações" />
                                {naoLidasCount > 0 && (
                                    <span className="notif-badge">{naoLidasCount}</span>
                                )}
                            </button>

                            <div className={`notif-dropdown ${notificacoesAbertas ? "active" : ""}`}>
                                <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p className="notif-title">Notificações</p>
                                    
                                    {naoLidasCount > 0 && (
                                        <button 
                                            onClick={marcarTodasComoLidas}
                                            style={{
                                                background: '#e8f5e9',
                                                color: '#055C0F',
                                                border: '1px solid #a5d6a7',
                                                borderRadius: '20px',
                                                padding: '3px 10px',
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = '#055C0F';
                                                e.target.style.color = '#fff';
                                                e.target.style.borderColor = '#055C0F';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = '#e8f5e9';
                                                e.target.style.color = '#055C0F';
                                                e.target.style.borderColor = '#a5d6a7';
                                            }}
                                        >
                                            Marcar lidas
                                        </button>
                                    )}
                                </div>
                                
                                <div className="notif-list-container">
                                    {notificacoes.length > 0 ? (
                                        <ul className="notif-list">
                                            {notificacoes.map((n) => (
                                                <li key={n.id} className="notif-item" style={{ background: n.lida ? '#fff' : '#f0f9f0' }}>
                                                    <div className="notif-content">
                                                        <h4 className="notif-item-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {!n.lida && <span style={{ width: '8px', height: '8px', background: '#055C0F', borderRadius: '50%', display: 'inline-block' }}></span>}
                                                            {n.titulo}
                                                        </h4>
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
                        <LeitorTela />
                        
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