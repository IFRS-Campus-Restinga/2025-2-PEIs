import React, { useState } from 'react';
import '../../cssGlobal.css'; 
import { useAlert } from '../../context/AlertContext'; 
import axios from 'axios';

const ModalReportarProblema = ({ aoFechar }) => {
    const { addAlert } = useAlert();
    const [enviando, setEnviando] = useState(false);
    const [problema, setProblema] = useState({
        assunto: '',
        descricao: '',
        url: window.location.href, // Captura onde o usuário estava
        navegador: navigator.userAgent // Captura info do navegador
    });

    const handleChange = (e) => {
        setProblema({ ...problema, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!problema.assunto || !problema.descricao) {
            addAlert("Por favor, preencha o assunto e a descrição.", "warning");
            return;
        }

        setEnviando(true);

        try {
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Token ${token}` } } : {};

            await axios.post("http://localhost:8000/services/reportar-problema/", problema, config);

            console.log("Relatório enviado:", problema);
            addAlert("Obrigado! Seu relato foi enviado para o suporte.", "success");
            aoFechar();
        } catch (error) {
            console.error("Erro ao enviar: ", error);
            addAlert("Erro ao enviar relatório. Tente novamente.", "error");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={aoFechar}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header" style={{ background: '#d32f2f' }}> {/* Vermelho para atenção */}
                    <h3>🐛 Reportar um Problema</h3>
                    <button className="close-btn" onClick={aoFechar}>&times;</button>
                </div>

                <div className="modal-body">
                    <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                        Encontrou um erro ou tem uma sugestão? Conte para nós. 
                        Nossa equipe técnica receberá os dados desta página automaticamente.
                    </p>

                    <form onSubmit={handleSubmit} className="form-padrao">
                        <label>Assunto</label>
                        <select 
                            name="assunto" 
                            value={problema.assunto} 
                            onChange={handleChange}
                            style={{ marginBottom: '15px' }}
                        >
                            <option value="">Selecione um tópico...</option>
                            <option value="erro_sistema">Erro no Sistema / Tela Quebrada</option>
                            <option value="lentidao">Lentidão / Travamento</option>
                            <option value="sugestao">Sugestão de Melhoria</option>
                            <option value="acessibilidade">Problema de Acessibilidade</option>
                            <option value="outro">Outro</option>
                        </select>

                        <label>Descrição Detalhada</label>
                        <textarea
                            name="descricao"
                            value={problema.descricao}
                            onChange={handleChange}
                            placeholder="Descreva o que aconteceu, o que você tentou fazer e qual era o resultado esperado..."
                            rows="5"
                            style={{ resize: 'vertical' }}
                        ></textarea>

                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                            <p>Anexado automaticamente: <strong>{window.location.pathname}</strong></p>
                        </div>

                        <div className="modal-buttons" style={{ marginTop: '20px' }}>
                            <button 
                                type="button" 
                                className="cancelar" 
                                onClick={aoFechar}
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="confirmar" 
                                style={{ background: '#055C0F' }} // Botão vermelho
                                disabled={enviando}
                            >
                                {enviando ? 'Enviando...' : 'Enviar Relatório'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalReportarProblema;