import React, { useState } from 'react';
import { Link } from "react-router-dom";
import "../../cssGlobal.css";
import LeitorTela from '../leitorTela/LeitorTela';
// 👇 Import do Modal que criamos
import ModalReportarProblema from '../modals/ModalReportarProblema';

const Footer = ({ usuario }) => {
    const isAdmin = usuario?.grupos?.some(g => g.toLowerCase() === "admin");
    
    // 👇 Estado para controlar o modal
    const [mostrarModalReport, setMostrarModalReport] = useState(false);

    return (
        <>
            <footer className="footer">
                <div className="footer-left">
                    {/* Mantive o texto original */}
                    <div className='footer-text'>
                        <strong>INSTITUTO FEDERAL</strong>
                        <span>Rio Grande do Sul</span>
                        <span>Campus Restinga</span>
                    </div>

                    {/* 👇 NOVO BOTÃO DE REPORTAR (Separado por uma barra vertical visual) */}
                    <div style={{ 
                        marginLeft: '15px', 
                        paddingLeft: '15px', 
                        borderLeft: '1px solid #ccc',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <button 
                            onClick={() => setMostrarModalReport(true)}
                            className="footer-logs-btn" // Reutilizando a classe para manter padrão
                            style={{ 
                                background: 'transparent', 
                                border: '1px solid #999', 
                                color: '#555',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                            title="Encontrou um erro? Avise-nos!"
                        >
                            <span>🐛</span> Reportar Problema
                        </button>
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

            {/* 👇 Renderização do Modal fora do fluxo do footer visual, mas dentro do componente */}
            {mostrarModalReport && (
                <ModalReportarProblema aoFechar={() => setMostrarModalReport(false)} />
            )}
        </>
    );
};

export default Footer;