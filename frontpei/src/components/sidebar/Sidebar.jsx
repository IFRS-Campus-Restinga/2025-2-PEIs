import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { termosPEI, sugestoesPorPagina } from "../../data/sidebarData";
import "./Sidebar.css";
import menuIcon from "./setaEsquerda.png";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  // === FUNÇÃO QUE FALTAVA ===
  const toggleSidebar = () => setOpen(!open);

  return (
    <>
      {/* BOTÃO FLUTUANTE ABRIR/FECHAR */}
      {!open && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <img src={menuIcon} alt="Abrir menu" className="icon-image" />
        </button>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar-container ${open ? "open" : ""}`}>
        <div className="sidebar-content">
          
          {/* Botão de fechar interno */}
          <button
            className="sidebar-close-btn"
            onClick={() => setOpen(false)}
            title="Fechar"
          >
            ✖
          </button>

          <h2>Explicações</h2>
          <ul>
            {Object.entries(termosPEI).map(([termo, descricao]) => (
              <li key={termo}>
                <strong>{termo.toUpperCase()}</strong>: {descricao}
              </li>
            ))}
          </ul>

          <h2>💡 Sugestões</h2>
          <ul>
            {(sugestoesPorPagina[path] || [
              "Nenhuma sugestão para esta página",
            ]).map((s, index) => (
              <li key={index}>{s}</li>
            ))}
          </ul>

        </div>
      </aside>
    </>
  );
}
