import React from 'react';
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import "../../cssGlobal.css";
import LeitorTela from '../leitorTela/LeitorTela';

const Footer = ({ usuario }) => {
    //
    const isAdmin = usuario?.grupos?.some(g => g.toLowerCase() === "admin");

    return (
        <footer className="footer">
            <div className="footer-left">
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
                <LeitorTela />
                {/* OS LOGS E APROVAÇÃO SÓ APARECEM SE FOR ADMIN */}
                {isAdmin && (
                    <Link to="/logs" className="footer-logs-btn" title="Ver logs do sistema">
                        LOGS
                    </Link>
                )}

                {isAdmin && (
                    <Link to="/admin/solicitacoes"
                        className="footer-logs-btn"
                        style={{ marginLeft: "10px", backgroundColor: "#007f3f", color: "white", border: "1px solid #006400" }}
                    >
                        ADMIN
                    </Link>
                )}
            </div>
        </footer>
    );
};

export default Footer;