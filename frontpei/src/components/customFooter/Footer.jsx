import React from 'react';
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import "../../cssGlobal.css";

const Footer = ({ usuario }) => {
    const isAdmin = usuario?.grupos?.includes("Admin");

    return (
        <footer className="footer">
            <div className="footer-left">
                <Link to="/" className="footer-logo-link">
                    <img src={logo} alt="Logo IFRS" className="footer-logo" />
                </Link>
                <div className='footer-text'>
                    <strong>INSTITUTO FEDERAL</strong>
                    <span>Rio Grande do Sul</span>
                    <span>Campus Restinga</span>
                </div>
            </div>

            <div className="footer-center">
                Rua Alberto Hoffmann, 285 | Bairro Restinga | CEP 91791-508<br />
                (51) 3247-8400
            </div>

            <div className="footer-right">
                <Link to="/logs" className="footer-logs-btn" title="Ver logs do sistema">
                    LOGS
                </Link>

                {/* BOTÃO ADMIN SOMENTE SE FOR ADMIN */}
                {isAdmin && (
                    <Link to="/admin/solicitacoes"
                        className="footer-logs-btn"
                        style={{ marginLeft: "10px", backgroundColor: "#007f3f" }}
                    >
                        ADMIN
                    </Link>
                )}
            </div>
        </footer>
    );
};

export default Footer;
