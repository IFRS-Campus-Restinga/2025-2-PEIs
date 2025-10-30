import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import eyeIcon from "../../assets/eye-show.svg";
import "./Logs.css";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [sortStep, setSortStep] = useState(0); // Para controlar múltiplos cliques
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, sortField, sortDirection, sortStep]);

  async function fetchLogs(page = 1) {
    try {
      setLoading(true);
      const LOGS_URL = import.meta.env.VITE_LOGS_URL || "http://localhost:8000/logs/logs/";
      const backendToken = import.meta.env.VITE_BACKEND_TOKEN;
      
      // Obtém a configuração de ordenação atual
      const { ordering } = getSortingConfig(sortField, sortStep);
      
      const response = await axios.get(LOGS_URL, {
        headers: {
          'X-BACKEND-TOKEN': backendToken
        },
        params: {
          page: page,
          ordering: ordering
        }
      });

      // setando paginacao
      const logsData = response.data.results || response.data;
      setLogs(logsData);
      setTotalPages(Math.ceil(response.data.count / 20)); // para verificar o total de pags
      setTotalCount(response.data.count);
    } catch (err) {
      setError("Erro ao buscar logs");
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field) => {
    
    let newStep = 0;
    
    if (sortField === field) {
      // Incrementa o step para múltiplos cliques
      newStep = (sortStep + 1) % getMaxSteps(field);
      setSortStep(newStep);
    } else {
      // Nova coluna, reseta o step
      setSortField(field);
      setSortStep(0);
      newStep = 0;
    }
    
    // Aplica a ordenação baseada no campo e step
    const { direction, ordering } = getSortingConfig(field, newStep);
    setSortDirection(direction);
    
    setCurrentPage(1); // setando para voltar pra primeira pagina quando ordenar
  };

  const getMaxSteps = (field) => {
    switch (field) {
      case 'acao': return 2; // ordem alfabética → ordem reversa
      case 'timestamp': return 2; // mais recentes → mais antigos
      case 'modelo': return 2; // A→Z → Z→A
      case 'objeto_id': return 2; // crescente → decrescente
      default: return 2;
    }
  };

  const getSortingConfig = (field, step) => {
    // Para estrutura antiga dos logs, alguns campos podem não existir
    // Vamos usar campos que sempre existem
    
    switch (field) {
      case 'timestamp':
        return step === 0 
          ? { direction: 'desc', ordering: '-timestamp' } // Mais recentes primeiro
          : { direction: 'asc', ordering: 'timestamp' };   // Mais antigos primeiro
      
      case 'modelo':
        // Se o campo modelo não existir, vamos usar acao como fallback
        return step === 0 
          ? { direction: 'asc', ordering: 'acao' }  // A→Z (usando acao como fallback)
          : { direction: 'desc', ordering: '-acao' }; // Z→A
      
      case 'acao':
        return step === 0 
          ? { direction: 'asc', ordering: 'acao' }  // Ordem alfabética
          : { direction: 'desc', ordering: '-acao' }; // Ordem reversa
      
      case 'objeto_id':
        // Se o campo objeto_id não existir, vamos usar id como fallback
        return step === 0 
          ? { direction: 'asc', ordering: 'id' }   // Crescente
          : { direction: 'desc', ordering: '-id' }; // Decrescente
      
      default:
        return { direction: 'desc', ordering: '-timestamp' };
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <span className="sort-icon neutral">⇅</span>;
    
    // Mostra ícone baseado no step atual
    const currentStep = sortStep;
    
    // Para todos os campos, mostra setas baseadas no step
    if (currentStep === 0) {
      return field === 'timestamp' ? 
        <span className="sort-icon desc">↓</span> : // Mais recentes primeiro
        <span className="sort-icon asc">↑</span>;   // A→Z, crescente, ordem alfabética
    } else {
      return field === 'timestamp' ? 
        <span className="sort-icon asc">↑</span> :  // Mais antigos primeiro
        <span className="sort-icon desc">↓</span>;  // Z→A, decrescente, ordem reversa
    }
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
  };

  const closeModal = () => {
    setSelectedLog(null);
  };

  // funcao pra detectar estrutura do log (nova ou antiga)
  const isNewStructure = (log) => {
    return log.hasOwnProperty('modelo') && log.hasOwnProperty('objeto_id');
  };


  // funcao só pra voltar pra home
  const VoltarBtn = () => (
    <div>
      <Link to="/" className="voltar-btn">
        Voltar
      </Link>
    </div>
  );

  const PaginationControls = () => {
    if (totalPages <= 1) return null; //se só tiver uma pagina, nao mostra os botoes de pagina

    const pages = []; //array pra armazenar os botoes de pagina
    const maxVisiblePages = 5; //numero de paginas visiveis
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2)); //pagina inicial
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1); //pagina final

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1); //se o numero de paginas visiveis for menor que o numero de paginas, ajusta a pagina inicial
    }

    for (let i = startPage; i <= endPage; i++) { //loop pra criar os botoes de pagina
      pages.push( //push pra adicionar os botoes de pagina no array
        <button
          key={i}
          onClick={() => setCurrentPage(i)} //funcao pra mudar a pagina
          className={i === currentPage ? 'page-btn active' : 'page-btn'}
        >
          {i}
        </button>
      );
    }

    return ( //retorna os botoes de pagina
      <div className="pagination-controls">
        <button 
          onClick={() => setCurrentPage(1)} //funcao pra mudar a pagina para a primeira
          disabled={currentPage === 1}
          className="page-btn"
        >
          Primeira
        </button>
        <button 
          onClick={() => setCurrentPage(currentPage - 1)} //funcao pra mudar a pagina para anterior
          disabled={currentPage === 1}
          className="page-btn"
        >
          Anterior
        </button>
        
        {pages}
        
        <button 
          onClick={() => setCurrentPage(currentPage + 1)} //funcao pra mudar a pagina para proxima
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          Próxima
        </button>
        <button 
          onClick={() => setCurrentPage(totalPages)} //funcao pra mudar a pagina para ultima
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          Última
        </button>
      </div>
    );
  };

  if (loading) return <div>Carregando logs... </div>;
  if (error) return <div><VoltarBtn />{error}</div>;

  return (
    <div className="logs-container">
      <h2 className="logs-title">Relatório de Logs</h2>
      
      <div className="logs-info">
        <p>Total de logs: {totalCount} | Página {currentPage} de {totalPages}</p>
      </div>

      <table className="logs-table">
        <thead>
          <tr>
            <th 
              className="sortable" 
              onClick={() => handleSort('timestamp')} //funcao pra ordenar por data/hora
            >
              Data/Hora {getSortIcon('timestamp')}
            </th>
            <th 
              className="sortable" 
              onClick={() => handleSort('acao')} //funcao pra ordenar por acao
            >
              Ação {getSortIcon('acao')}
            </th>
            <th 
              className="sortable" 
              onClick={() => handleSort('modelo')} //funcao pra ordenar por modelo
            >
              Modelo {getSortIcon('modelo')}
            </th>
            <th>Usuário</th>
            <th 
              className="sortable" 
              onClick={() => handleSort('objeto_id')} //funcao pra ordenar por id do objeto
            >
              ID {getSortIcon('objeto_id')}
            </th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => {
            const isNew = isNewStructure(log); //funcao pra detectar estrutura do log (nova ou antiga)
            return ( //retorna a tabela com os logs
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>
                  {isNew ? log.acao : log.acao?.split(' de ')[0] || log.acao}
                </td>
                <td>
                  {isNew ? log.modelo : log.acao?.split(' de ')[1] || '-'}
                </td>
                <td>{log.usuario || '-'}</td>
                <td>{isNew ? log.objeto_id : 'N/A'}</td>
                <td>
                  <button 
                    className="details-btn"
                    onClick={() => handleLogClick(log)} //funcao pra ver detalhes completos
                    title="Ver detalhes completos"
                  >
                    <img 
                      src={eyeIcon} 
                      alt="Ver detalhes" 
                      className="eye-icon"
                    />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <PaginationControls />

      {/* tela de Detalhes */}
      {selectedLog && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Detalhes do Log - {
                  isNewStructure(selectedLog) 
                    ? `${selectedLog.acao} de ${selectedLog.modelo}`
                    : selectedLog.acao
                }
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="log-details">
                <div className="detail-section">
                  <h4>Informações Básicas</h4>
                  <p><strong>Data/Hora:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                  <p><strong>Ação:</strong> {isNewStructure(selectedLog) ? selectedLog.acao : selectedLog.acao?.split(' de ')[0] || selectedLog.acao}</p>
                  <p><strong>Modelo:</strong> {isNewStructure(selectedLog) ? selectedLog.modelo : selectedLog.acao?.split(' de ')[1] || '-'}</p>
                  <p><strong>ID do Objeto:</strong> {isNewStructure(selectedLog) ? selectedLog.objeto_id : 'N/A'}</p>
                  <p><strong>Usuário:</strong> {selectedLog.usuario || 'Não informado'}</p>
                </div>
                
                {isNewStructure(selectedLog) && selectedLog.detalhes_completos && (
                  <>
                    <div className="detail-section">
                      <h4>Estado Anterior</h4>
                      <pre className="json-display">
                        {JSON.stringify(selectedLog.detalhes_completos.antes, null, 2)}
                      </pre>
                    </div>
                    
                    <div className="detail-section">
                      <h4>Estado Atual</h4>
                      <pre className="json-display">
                        {JSON.stringify(selectedLog.detalhes_completos.depois, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
                
                {!isNewStructure(selectedLog) && (
                  <div className="detail-section">
                    <h4>Detalhes</h4>
                    <p>{selectedLog.detalhes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
}

export default Logs;
