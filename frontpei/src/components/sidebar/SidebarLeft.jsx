import React, { useState } from "react";
import "./Sidebar.css"; 
import menuIcon from "./setaEsquerda.png";
import { Link } from "react-router-dom";

export default function SidebarLeft() {
  const [open, setOpen] = useState(false);

  const toggleLeftSidebar = () => setOpen(!open);

  return (
    <>
      {/* Botão flutuante esquerdo (abrir) */}
      {!open && (
        <button className="sidebar-left-toggle" onClick={toggleLeftSidebar}>
          <img src={menuIcon} alt="Menu" className="icon-image" />
        </button>
      )}

      {/* Container do sidebar */}
      <aside className={`sidebar-left ${open ? "open" : ""}`}>
        <div className="sidebar-left-content">

          {/* Botão fechar */}
          <button
            className="sidebar-close-btn-left"
            onClick={() => setOpen(false)}
            title="Fechar"
          >
            ✖
          </button>

          <h2>Menu</h2>

          <div className="sidebar-left-buttons">

            <Link to="/" className="sidebar-left-btn">🏠 Início</Link>

            <Link to="/pei/meus-acompanhamentos" className="sidebar-left-btn">
              📘 Meus Acompanhamentos
            </Link>

            <Link to="/perfil" className="sidebar-left-btn">
              👤 Meu Perfil
            </Link>

            <Link to="/ajuda" className="sidebar-left-btn">
              ❓ Ajuda
            </Link>

          </div>

        </div>
      </aside>
    </>
  );
}
