import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Logs.css";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const LOGS_URL = import.meta.env.VITE_LOGS_URL || "http://localhost:8000/logs/logs/";
        // Valor do token.txt via variável de ambiente
        const backendToken = import.meta.env.VITE_BACKEND_TOKEN;
        const response = await axios.get(LOGS_URL, {
          headers: {
            'X-BACKEND-TOKEN': backendToken
          }
        });

        setLogs(response.data);
      } catch (err) {
        setError("Erro ao buscar logs");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const VoltarBtn = () => (
    <div>
      <Link to="/" className="voltar-btn">
        Voltar para a Home
      </Link>
    </div>
  );

  if (loading) return <div>Carregando logs... </div>;
  if (error) return <div><VoltarBtn />{error}</div>;

  return (
    <div className="logs-container">
      <Link to="/" className="voltar-btn">Voltar para a Home</Link>
      <h2 className="logs-title">Relatório de Logs</h2>
      <table className="logs-table">
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Ação</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.acao}</td>
              <td>{log.detalhes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Logs;