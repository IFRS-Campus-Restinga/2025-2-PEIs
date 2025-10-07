import React, { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  // Exibe alerta comum OU de confirmação
  const addAlert = (message, type = "info", options = {}) => {
    const id = Date.now();
    const newAlert = {
      id,
      message,
      type,
      isConfirm: type === "confirm", // controla se é alerta de confirmação
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    };

    setAlerts((prev) => [...prev, newAlert]);

    // fecha automaticamente só se não for um alerta de confirmação
    if (type !== "confirm") {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      }, 4000);
    }
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, clearAlerts, removeAlert }}>
      {children}

      {/* Renderiza os alertas na tela */}
      <div className="alert-container">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert ${alert.type}`}>
            <span>{alert.message}</span>

            {/* Se for alerta de confirmação, renderiza os botões */}
            {alert.isConfirm ? (
              <div className="alert-buttons">
                <button
                  onClick={() => {
                    if (alert.onConfirm) alert.onConfirm();
                    removeAlert(alert.id);
                  }}
                >
                  Sim
                </button>
                <button
                  onClick={() => {
                    if (alert.onCancel) alert.onCancel();
                    removeAlert(alert.id);
                  }}
                >
                  Não
                </button>
              </div>
            ) : (
              <button className="close-btn" onClick={() => removeAlert(alert.id)}>
                x
              </button>
            )}
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

// Hook para usar o alerta em qualquer componente
export function useAlert() {
  return useContext(AlertContext);
}