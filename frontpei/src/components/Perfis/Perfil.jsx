import React from 'react';
import { useParams, Link } from 'react-router-dom';
import "./Perfil.css";
import ProfessorView from './Professor.jsx';
import NapneView from './Napne.jsx';
import CoordenadorView from './Coordenador.jsx';
import PedagogoView from './Pedagogo.jsx';
import PerfilAdmin from '../../pages/perfil/perfilAdmin.jsx';


const Perfil = ({ usuario }) => {
  const { perfil } = useParams();
  console.log("Perfil da URL:", perfil);

  const conteudosPorPerfil = {
    coordenador: <CoordenadorView usuario={usuario} />,
    napne: <NapneView usuario={usuario} />,
    professor: <ProfessorView usuario={usuario} />,
    pedagogo: <PedagogoView usuario={usuario} />,
    administrador: <PerfilAdmin usuario={usuario} />
  };

  const conteudo = conteudosPorPerfil[perfil] || <p>Perfil não encontrado</p>;

  return (
    <div className="tela-padrao">
      <main>
        {conteudo}
      </main>
        <Link to="/" className="voltar-btn"
        onClick={() => setPerfilSelecionado(null)}
        >Voltar</Link>
    </div>
      
  );
};

export default Perfil;
