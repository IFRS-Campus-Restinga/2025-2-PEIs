import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from 'react-router-dom';
import "./Perfil.css";
import ProfessorView from './Professor.jsx';
import PedagogoView from './Pedagogo.jsx';
import CoordenadorView from './Coordenador.jsx';
import NapneView from './Napne.jsx';
import PerfilAdmin from '../../pages/perfil/perfilAdmin.jsx';


const Perfil = ({ usuario }) => {
  const { perfil } = useParams();
  
  const [peiCentral, setpeiCentral] = useState([]);
  
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 4;

  const API_BASE = import.meta.env.VITE_ALUNO_URL;

  useEffect(() => {
      const buscarpeiCentral = async () => {
        try {
          const resposta = await axios.get(`${API_BASE}`);
          setpeiCentral(resposta.data);
        } catch (erro) {
          console.error("Erro ao buscar peiCentral:", erro);
        }
      };
  
      buscarpeiCentral();
    }, []);

  const conteudosPorPerfil = {
    coordenador: <CoordenadorView usuario={usuario} />,
    napne: <NapneView usuario={usuario} />,
    professor: <ProfessorView usuario={usuario} />,
    pedagogo: <PedagogoView usuario={usuario} />,
    administrador: <PerfilAdmin usuario={usuario} />,
  };

  const conteudo = conteudosPorPerfil[perfil] || <p>Perfil não encontrado</p>;
  const totalPaginas = Math.ceil(peiCentral.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const peiCentralPaginados = peiCentral.slice(inicio, inicio + itensPorPagina);

  return (
    <div className="tela-padrao">
      <main>
        {conteudo}
      </main>
      <div className="paginacao">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
          className="paginacao-btn"
        >
          ← Previous
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            onClick={() => setPagina(i + 1)}
            className={`paginacao-btn ${
              pagina === i + 1 ? "ativo" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
          className="paginacao-btn"
        >
          Next →
        </button>
      </div>
      <Link to="/" className="voltar-btn"
      onClick={() => setPerfilSelecionado(null)}
      >Voltar</Link>
    </div>
  );
};

export default Perfil;