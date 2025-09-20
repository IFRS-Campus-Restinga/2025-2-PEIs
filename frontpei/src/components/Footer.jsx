import React from 'react';
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-left">
                <strong>INSTITUTO FEDERAL</strong>
                <span>Rio Grande do Sul</span>
                <span>Campus Restinga</span>
            </div>
            <div className="footer-center">
                Rua Alberto Hoffmann, 285 | Bairro Restinga | CEP 91791-508<br />
                (51) 3247-8400
            </div>
        </footer>
    );
};

export default Footer;
