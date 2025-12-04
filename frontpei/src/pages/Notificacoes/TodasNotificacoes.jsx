import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";
import "./TodasNotificacoes.css"; // importando o CSS específico

export default function TodasNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [filtro, setFiltro] = useState("todas"); // todas, nao_lidas, lidas
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carrega notificações
  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/services/notificacoes-lista/", {
        headers: { Authorization: `Token ${token}` },
      });
      setNotificacoes(res.data);
    } catch (err) {
      console.error("Erro ao carregar notificações", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/services/notificacoes/marcar_todas_lidas/",
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      // Atualiza localmente
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Clique na notificação (Navegação + Marcar como lida individual)
  const handleNotificationClick = async (n) => {
    // 1. Marca como lida no backend se necessário
    if (!n.lida) {
      try {
        const token = localStorage.getItem("token");
        await axios.patch(
          `http://localhost:8000/services/notificacoes/${n.id}/`,
          { lida: true },
          { headers: { Authorization: `Token ${token}` } }
        );
        // Atualiza estado local para refletir a leitura
        setNotificacoes(prev => prev.map(item => item.id === n.id ? { ...item, lida: true } : item));
      } catch (e) {
        console.error("Erro ao marcar como lida", e);
      }
    }

    // 2. Redirecionamento Inteligente
    if (n.dados_extras && n.dados_extras.url) {
      if (n.tipo === 'prazo' && n.dados_extras.pei_central_id) {
        navigate(n.dados_extras.url, { state: { peiCentralId: n.dados_extras.pei_central_id } });
      } else {
        navigate(n.dados_extras.url);
      }
    }
  };

  // Formatação de data amigável
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diffMs = agora - data;
    const diffHoras = Math.floor(diffMs / 3600000);
    
    if (diffHoras < 24) return `Há ${diffHoras} horas`;
    return data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Filtragem
  const listaFiltrada = notificacoes.filter(n => {
    if (filtro === 'nao_lidas') return !n.lida;
    if (filtro === 'lidas') return n.lida;
    return true;
  });

  return (
    <div className="container-padrao notificacoes-page">
      <div className="notif-header-page">
        <h1>Minhas Notificações</h1>
        
        <div className="notif-actions">
          {notificacoes.some(n => !n.lida) && (
            <button 
                onClick={marcarTodasComoLidas}
                className="submit-btn" 
                style={{ padding: '8px 16px', fontSize: '13px' }}
            >
                Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Tabs de Filtro */}
      <div className="notif-tabs" style={{ marginBottom: '20px' }}>
        <button 
            className={`notif-tab ${filtro === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltro('todas')}
        >
            Todas
        </button>
        <button 
            className={`notif-tab ${filtro === 'nao_lidas' ? 'active' : ''}`}
            onClick={() => setFiltro('nao_lidas')}
        >
            Não Lidas ({notificacoes.filter(n => !n.lida).length})
        </button>
        <button 
            className={`notif-tab ${filtro === 'lidas' ? 'active' : ''}`}
            onClick={() => setFiltro('lidas')}
        >
            Lidas
        </button>
      </div>

      {loading ? (
        <p style={{textAlign: 'center'}}>Carregando...</p>
      ) : listaFiltrada.length === 0 ? (
        <div className="empty-state">
            <h3>Tudo limpo! ✨</h3>
            <p>Você não tem notificações nesta categoria.</p>
        </div>
      ) : (
        <div className="notif-full-list">
          {listaFiltrada.map((n) => (
            <div 
                key={n.id} 
                className={`notif-card ${n.lida ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(n)}
            >
              <div className="notif-icon-area">
                {!n.lida && <div className="icon-circle"></div>}
              </div>
              
              <div className="notif-content-area">
                <div className="notif-top-row">
                    <span className="notif-subject">{n.titulo}</span>
                    <span className="notif-date">{formatarData(n.data_criacao)}</span>
                </div>
                <p className="notif-body">{n.mensagem}</p>
                
                {n.dados_extras?.url && (
                    <div className="notif-card-actions">
                        <span style={{ fontSize: '12px', color: '#055C0F', fontWeight: 'bold' }}>
                            Ver detalhes →
                        </span>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BotaoVoltar />
    </div>
  );
}