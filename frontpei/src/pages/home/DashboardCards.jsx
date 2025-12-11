import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../cssGlobal.css"; // Usa estilos globais ou crie um específico

export default function DashboardCards() {
  const [stats, setStats] = useState({
    total_alunos: 0,
    total_peis: 0,
    notificacoes_pendentes: 0,
    solicitacoes_pendentes: 0,
    is_admin: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        // Endpoint que acabamos de criar
        const res = await axios.get("http://localhost:8000/services/dashboard/", {
          headers: { Authorization: `Token ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return null; // Ou um spinner pequeno

  // Estilo inline para agilidade (pode mover pro CSS)
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
    marginTop: "10px"
  };

  const cardStyle = (color) => ({
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    borderLeft: `5px solid ${color}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.2s"
  });

  const labelStyle = { color: "#666", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };
  const numberStyle = { fontSize: "32px", fontWeight: "700", color: "#333", marginTop: "5px" };

  return (
    <div style={gridStyle}>
      
      {/* CARD 1: ALUNOS */}
      <div style={cardStyle("#055C0F")} className="hover-scale">
        <span style={labelStyle}>Total de Alunos</span>
        <span style={numberStyle}>{stats.total_alunos}</span>
      </div>

      {/* CARD 2: PEIS */}
      <div style={cardStyle("#2e8b57")} className="hover-scale">
        <span style={labelStyle}>PEIs no Sistema</span>
        <span style={numberStyle}>{stats.total_peis}</span>
      </div>

      {/* CARD 3: NOTIFICAÇÕES (Clicável) */}
      <Link to="/todas-notificacoes" style={{ textDecoration: 'none' }}>
        <div style={cardStyle(stats.notificacoes_pendentes > 0 ? "#fbc02d" : "#ccc")} className="hover-scale">
            <span style={labelStyle}>Notificações Pendentes</span>
            <span style={{ ...numberStyle, color: stats.notificacoes_pendentes > 0 ? "#e65100" : "#333" }}>
                {stats.notificacoes_pendentes}
            </span>
        </div>
      </Link>

      {/* CARD 4: ADMIN (Só aparece se for admin) */}
      {stats.is_admin && (
        <Link to="/admin/solicitacoes" style={{ textDecoration: 'none' }}>
            <div style={cardStyle(stats.solicitacoes_pendentes > 0 ? "#d32f2f" : "#ccc")} className="hover-scale">
            <span style={labelStyle}>Solicitações de Acesso</span>
            <span style={{ ...numberStyle, color: stats.solicitacoes_pendentes > 0 ? "#d32f2f" : "#333" }}>
                {stats.solicitacoes_pendentes}
            </span>
            </div>
        </Link>
      )}

    </div>
  );
}