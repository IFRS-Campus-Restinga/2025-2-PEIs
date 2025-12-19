import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-sem-nome.png";
import userIcon from "../../assets/user.svg";
import chevronDown from "../../assets/chevron-down.svg";
import bellIcon from "../../assets/bell.svg";
import axios from "axios";
import "../../cssGlobal.css";
import { useAlert } from "../../context/AlertContext";

const Header = ({ usuario, logado, logout, toggleAcessibilidade, estadoAcessibilidade}) => {
    
    const { addAlert } = useAlert();
    const [menuAberto, setMenuAberto] = useState(false);
    const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const menuRef = useRef(null);
    const notifRef = useRef(null);
    const navigate = useNavigate();

    // Fallback seguro para foto de usuário
    const fotoUsuario =
        usuario?.foto && usuario.foto.trim() !== "" 
            ? usuario.foto 
            : userIcon;

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

            const novasNotificacoes = notificacoes.map(n => ({ ...n, lida: true }));
            setNotificacoes(novasNotificacoes);
            
        } catch (error) {
            console.error("Erro ao marcar notificações:", error);
        }
    };

    const handleNotificationClick = async (n) => {
        if (!n.lida) {
            try {
                const token = localStorage.getItem("token");
                await axios.patch(`http://localhost:8000/services/notificacoes/${n.id}/`, 
                    { lida: true },
                    { headers: { Authorization: `Token ${token}` } }
                );
                
                setNotificacoes(prev => prev.map(notif => 
                    notif.id === n.id ? { ...notif, lida: true } : notif
                ));
            } catch (error) {
                console.error("Erro ao marcar notificação individual como lida:", error);
            }
        }

        if (n.dados_extras && n.dados_extras.url) {
            if (n.tipo === 'prazo' && n.dados_extras.pei_central_id) {
                navigate(n.dados_extras.url, { state: { peiCentralId: n.dados_extras.pei_central_id } });
            } else {
                navigate(n.dados_extras.url);
            }
            setNotificacoesAbertas(false);
        }
    };

    // AÇÃO RÁPIDA (APROVAR/REJEITAR)
    const handleQuickAction = async (e, action, candidatoId) => {
        e.stopPropagation();
        
        if (!candidatoId) return;
        const token = localStorage.getItem("token");
        const endpoint = action === 'aprovar' 
            ? "http://localhost:8000/api/auth/solicitacoes/aprovar/"
            : "http://localhost:8000/api/auth/solicitacoes/rejeitar/";

        try {
            await axios.post(endpoint, { id: candidatoId }, {
                headers: { Authorization: `Token ${token}` }
            });
            
            // ATUALIZA A NOTIFICAÇÃO LOCALMENTE E REMOVE OS BOTÕES
            setNotificacoes(prev => prev.map(n => 
                n.dados_extras?.candidato_id === candidatoId ? { ...n, lida: true, processada: true } : n
            ));
            
            // 
            addAlert(`Solicitação ${action === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso!`, "success");

        } catch (err) {
            console.error("Erro na ação rápida:", err);
            // 
            addAlert("Erro ao processar ação.", "error");

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
            year: 'numeric',
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
                                                {notificacoes.slice(0, 5).map((n) => (
                                                    <li 
                                                        key={n.id} 
                                                        className="notif-item" 
                                                        style={{ background: n.lida ? '#fff' : '#f0f9f0', cursor: 'pointer' }}
                                                        onClick={() => handleNotificationClick(n)} // Clique na linha toda
                                                    >
                                                        <div className="notif-content">
                                                            <h4 className="notif-item-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                {!n.lida && <span style={{ width: '8px', height: '8px', background: '#055C0F', borderRadius: '50%', display: 'inline-block' }}></span>}
                                                                {n.titulo}
                                                            </h4>
                                                            <p className="notif-item-message">{n.mensagem}</p>
                                                            
                                                            {/* RENDERIZAÇÃO CONDICIONAL: BOTÕES PARA ADMIN */}
                                                            {n.tipo === 'solicitacao_cadastro' && !n.lida && !n.processada && (
                                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                                    <button 
                                                                        onClick={(e) => handleQuickAction(e, 'aprovar', n.dados_extras?.candidato_id)}
                                                                        className="btn-verde"
                                                                        style={{ fontSize: '10px', padding: '4px 8px' }}
                                                                    >
                                                                        Aprovar
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => handleQuickAction(e, 'rejeitar', n.dados_extras?.candidato_id)}
                                                                        className="botao-deletar"
                                                                        style={{ fontSize: '10px', padding: '4px 8px', marginTop: 0 }}
                                                                    >
                                                                        Rejeitar
                                                                    </button>
                                                                </div>
                                                            )}

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
                                    <div className="notif-footer">
                                        <Link 
                                            to="/todas-notificacoes" 
                                            onClick={() => setNotificacoesAbertas(false)}
                                            style={{
                                                background: '#e8f5e9',
                                                color: '#055C0F',
                                                border: '1px solid #a5d6a7',
                                                borderRadius: '20px',
                                                padding: '4px 10px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                transition: 'all 0.2s ease',
                                                display: 'inline-block' 
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
                                            Ver todas as notificações
                                        </Link>
                                    </div>
                            </div>
                        </div>
                        
                        {/* 👤 Usuário */}
                        <div className="user-wrapper" ref={menuRef}>
                            <div
                                className="user-avatar"
                                onClick={() => setMenuAberto(!menuAberto)}
                            >
                                <img src={fotoUsuario} alt="Usuário" />
                                <span className="user-avatar-name">{usuario.nome}</span>
                                <img
                                    src={chevronDown}
                                    alt="Menu"
                                    className="user-arrow"
                                    style={{
                                        transform: menuAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease',
                                    }}
                                />
                            </div>

                                <div className={`user-menu ${menuAberto ? "active" : ""}`}>
                                <div className="user-card">
                                    
                                    {/* 1. NOME (Cabeçalho fixo) */}
                                    <div className="user-menu-header" title={usuario.nome}>
                                        Olá, {usuario.nome}
                                    </div>

                                    {/* 2. MEU PERFIL */}
                                    <Link to="/perfil" className="user-menu-item" onClick={() => setMenuAberto(false)}>
                                        <span className="menu-icon">👤</span> 
                                        Meu Perfil
                                    </Link>
                                    
                                    {/* 3. ACESSIBILIDADE */}
                                    <button 
                                        onClick={() => {
                                            toggleAcessibilidade();
                                            // setMenuAberto(false); // Opcional: fechar ao clicar ou manter aberto
                                        }}
                                        className="user-menu-item"
                                    >
                                        <span className="menu-icon">
                                            {estadoAcessibilidade ? '👁️' : '🕶️'}
                                        </span>
                                        {estadoAcessibilidade ? 'Ocultar Acessibilidade' : 'Mostrar Acessibilidade'}
                                    </button>

                                    {/* 4. SAIR */}
                                    <button onClick={logout} className="user-menu-item logout">
                                        <span className="menu-icon">🚪</span> 
                                        Sair
                                    </button>
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