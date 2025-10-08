import React, { useEffect, useState } from "react";
import axios from "axios";
import "./perfilAdmin.css";

const PerfilAdmin = ({ usuario }) => {
  const [peiCentral, setpeiCentral] = useState([]);
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 4;

  // URL base da API (pode usar variável de ambiente)
  const API_URL = import.meta.env.VITE_PEI_CENTRAL_URL;

  useEffect(() => {
    const buscarpeiCentral = async () => {
      try {
        const resposta = await axios.get(`${API_URL}`);
        setpeiCentral(resposta.data);
      } catch (erro) {
        console.error("Erro ao buscar peiCentral:", erro);
      }
    };

    buscarpeiCentral();
  }, []);

  // Paginação simples
  const totalPaginas = Math.ceil(peiCentral.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const peiCentralPaginados = peiCentral.slice(inicio, inicio + itensPorPagina);

  return (
    <div className="perfil-admin-container">
      <h1>Bem-vindo ao Gerenciamento de PEIs</h1>

      <table className="tabela-admin">
        <thead>
          <tr>
            <th>Nome Aluno</th>
            <th>Componente Curricular</th>
            <th>Status</th>
            <th>Coordenador de curso</th>
            <th>Visualizar</th>
          </tr>
        </thead>

        <tbody>
          {peiCentralPaginados.map((aluno) => (
            <tr key={aluno.id} className="linha-aluno">
              <td className="aluno-info">
                <img
                  src={aluno.foto || "https://via.placeholder.com/50"}
                  alt={aluno.nome}
                  className="aluno-foto"
                />
                <span className="aluno-nome">{aluno.nome}</span>
              </td>
              <td>{aluno.componente}</td>
              <td
                className={`status ${
                  aluno.status === "Em andamento"
                    ? "status-andamento"
                    : "status-encerrado"
                }`}
              >
                {/*aluno.status.toUpperCase()*/}
              </td>
              <td className="coordenador-info">
                <img
                  src={aluno.coordenador_foto || "https://via.placeholder.com/40"}
                  alt={aluno.coordenador}
                  className="coordenador-foto"
                />
                <span>{aluno.coordenador}</span>
              </td>
              <td>
                <button className="btn-visualizar">
                  {/*<FaSearch size={20} />*/}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
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
    </div>
  );
};

export default PerfilAdmin;
