import React, { useState, useEffect } from 'react';
import '../../cssGlobal.css'; 
import LeitorTela from '../leitorTela/LeitorTela';

const AccessibilityWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [fontSize, setFontSize] = useState(100); // %
    const [highContrast, setHighContrast] = useState(false);

    // Aplica o tamanho da fonte
    useEffect(() => {
        // Altera o zoom do navegador (funciona bem para demos)
        // ou altera o font-size base se seu CSS usar 'rem'
        document.body.style.zoom = `${fontSize}%`;
    }, [fontSize]);

    // Aplica o Alto Contraste
    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [highContrast]);

    const handleReset = () => {
        setFontSize(100);
        setHighContrast(false);
    };

    return (
        <div className="accessibility-wrapper">
            {/* Menu de Opções (só aparece se isOpen = true) */}
            <div className={`accessibility-menu ${isOpen ? 'open' : ''}`}>
                <div className="acc-header">
                    <strong>Acessibilidade</strong>
                    <button onClick={handleReset} className="acc-reset-btn" title="Resetar">↺</button>
                </div>
                
                <div className="acc-controls">
                    <div className="acc-row">
                        <span>Texto:</span>
                        <button onClick={() => setFontSize(prev => Math.max(70, prev - 10))}>A-</button>
                        <span className="acc-value">{fontSize}%</span>
                        <button onClick={() => setFontSize(prev => Math.min(150, prev + 10))}>A+</button>
                    </div>

                    <div className="acc-row">
                        <span>Contraste:</span>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={highContrast}
                                onChange={() => setHighContrast(!highContrast)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div>
                        <span>Leitor de Tela:</span> <LeitorTela />
                    </div>
                </div>
            </div>

            {/* Botão Flutuante (Gatilho) */}
            <button 
                className="accessibility-btn" 
                onClick={() => setIsOpen(!isOpen)}
                title="Opções de Acessibilidade"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z" fill="currentColor"/>
                </svg>
            </button>
        </div>
    );
};

export default AccessibilityWidget;