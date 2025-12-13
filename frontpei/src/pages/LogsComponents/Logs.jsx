import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { Link } from "react-router-dom";
import eyeIcon from "../../assets/eye-show.svg";
import BotaoVoltar from "../../components/customButtons/botaoVoltar";
import "../../cssGlobal.css";

DataTable.use(DT);

function Logs() {
  const LOGS_URL = import.meta.env.VITE_LOGS_URL || "http://localhost:8000/logs/logs/";
  const backendToken = import.meta.env.VITE_BACKEND_TOKEN;

  const [tableData, setTableData] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarLogs() {
      try {
        setLoading(true);
        const response = await axios.get(LOGS_URL, {
          headers: { "X-BACKEND-TOKEN": backendToken },
        });
        const logs = response.data.results || response.data;

        const dadosFormatados = logs.map((log) => ({
          id: log.id,
          timestamp: new Date(log.timestamp).toLocaleString(),
          acao: log.acao,
          modelo: log.modelo || "-",
          usuario: log.usuario || "—",
          objeto_id: log.objeto_id || "N/A",
          detalhes: log,
        }));

        setTableData(dadosFormatados);
      } catch (err) {
        console.error("Erro ao buscar logs:", err);
        setError("Erro ao carregar logs.");
      } finally {
        setLoading(false);
      }
    }

    carregarLogs();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest(".ver-detalhes")) {
        const id = e.target.closest(".ver-detalhes").dataset.id;
        const logSelecionado = tableData.find((l) => l.id == id);
        if (logSelecionado) setSelectedLog(logSelecionado);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [tableData]);

  const handleVerDetalhes = (log) => setSelectedLog(log);
  const closeModal = () => setSelectedLog(null);

  if (loading) return <div>Carregando logs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="logs-container">
      <h2 className="logs-title">Relatório de Logs</h2>

      <DataTable
        data={tableData}
        columns={[
          { title: "Data/Hora", data: "timestamp" },
          { title: "Ação", data: "acao" },
          { title: "Modelo", data: "modelo" },
          { title: "Usuário", data: "usuario" },
          { title: "ID", data: "objeto_id" },
          {
            title: "Detalhes",
            data: "detalhes",
            render: (log) => `
              <button class="btn btn-sm btn-primary ver-detalhes" data-id="${log.id}">
                <img src="${eyeIcon}" alt="Ver detalhes" style="width:16px;height:16px;margin-right:4px;" />
                Ver
              </button>
            `,
          },
        ]}
        className="display table table-striped table-hover w-100"
        options={{
          pageLength: 10,
          language: {
            decimal: ",",
            thousands: ".",
            processing: "Processando...",
            search: "",
            searchPlaceholder: "Pesquisar",
            lengthMenu: '<span class="custom-lengthMenu-text">Mostrar _MENU_ registros',
            info: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 até 0 de 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros no total)",
            loadingRecords: "Carregando...",
            zeroRecords: "Nenhum registro encontrado",
            emptyTable: "Nenhum dado disponível",
            paginate: {
              first: "Primeiro",
              previous: "Anterior",
              next: "Próximo",
              last: "Último",
            },
          },
        }}
      />

{/* Modal de Detalhes */}
{selectedLog && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>📋 Detalhes do Log</h3>
        <button className="close-btn" onClick={closeModal}>×</button>
      </div>
      
      <div className="modal-body">
        {/* Informações Gerais */}
        <div className="log-info-grid">
          <div className="log-info-item">
            <span className="log-info-label">Data/Hora</span>
            <span className="log-info-value">{selectedLog.timestamp}</span>
          </div>
          
          <div className="log-info-item">
            <span className="log-info-label">Ação</span>
            <span className={`log-info-value ${selectedLog.acao.toLowerCase()}`}>
              {selectedLog.acao}
            </span>
          </div>
          
          <div className="log-info-item">
            <span className="log-info-label">Modelo</span>
            <span className="log-info-value">{selectedLog.modelo}</span>
          </div>
          
          <div className="log-info-item">
            <span className="log-info-label">Usuário</span>
            <span className="log-info-value">{selectedLog.usuario}</span>
          </div>
          
          <div className="log-info-item">
            <span className="log-info-label">ID do Objeto</span>
            <span className="log-info-value">{selectedLog.objeto_id}</span>
          </div>
        </div>

        {/* Comparação Antes/Depois */}
        {selectedLog.detalhes?.detalhes_completos ? (
          <div className="log-changes-section">
            <h4 className="log-section-title">
              🔄 Alterações Realizadas
            </h4>
            
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Antes</th>
                    <th>Depois</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const antes = selectedLog.detalhes.detalhes_completos.antes || {};
                    const depois = selectedLog.detalhes.detalhes_completos.depois || {};
                    const todasChaves = new Set([
                      ...Object.keys(antes),
                      ...Object.keys(depois)
                    ]);

                    return Array.from(todasChaves).map((chave) => {
                      const valorAntes = antes[chave];
                      const valorDepois = depois[chave];
                      const mudou = JSON.stringify(valorAntes) !== JSON.stringify(valorDepois);

                      return (
                        <tr key={chave}>
                          <td>
                            <span className="field-name">{chave}</span>
                          </td>
                          <td>
                            <div className={`field-value ${!valorAntes && valorAntes !== 0 ? 'empty' : ''}`}>
                              {valorAntes !== null && valorAntes !== undefined
                                ? typeof valorAntes === 'object'
                                  ? JSON.stringify(valorAntes, null, 2)
                                  : String(valorAntes)
                                : '—'}
                            </div>
                          </td>
                          <td>
                            <div className={`field-value ${mudou ? 'changed' : ''} ${!valorDepois && valorDepois !== 0 ? 'empty' : ''}`}>
                              {valorDepois !== null && valorDepois !== undefined
                                ? typeof valorDepois === 'object'
                                  ? JSON.stringify(valorDepois, null, 2)
                                  : String(valorDepois)
                                : '—'}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedLog.detalhes?.detalhes ? (
          /* Detalhes simples quando não há comparação */
          <div className="simple-details">
            <h4>📝 Detalhes</h4>
            <pre>{selectedLog.detalhes.detalhes}</pre>
          </div>
        ) : (
          <div className="no-changes">
            Nenhum detalhe adicional disponível para este log.
          </div>
        )}
      </div>
    </div>
  </div>
)}

      <BotaoVoltar />
    </div>
  );
}

export default Logs;