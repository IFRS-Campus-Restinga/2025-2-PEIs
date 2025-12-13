import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../../cssGlobal.css"

const BotaoVoltar = ({ texto = 'Voltar', estilo = {} }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1); // Volta para a página anterior
  };

  return (
    <button className='voltar-btn' onClick={handleClick} style={estilo}>
      {texto}
    </button>
  );
};

export default BotaoVoltar;