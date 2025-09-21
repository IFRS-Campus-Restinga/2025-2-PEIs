import React from 'react';
import logo from "../assets/logo.png";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
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
        </footer>
    );
};

export default Footer;
