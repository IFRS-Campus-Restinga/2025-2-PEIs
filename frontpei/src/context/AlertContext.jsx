import React, { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);        // toasts globais
  const [fieldAlerts, setFieldAlerts] = useState({}); // mensagens inline por campo

  // Adiciona alerta global ou por campo
  const addAlert = (message, type = "info", options = {}) => {
    // alerta por campo (inline)
    if (options.fieldName) {
      setFieldAlerts(prev => ({
        ...prev,
        [options.fieldName]: { message, type }
      }));

      // Removido o timeout automático — agora só sai com clearFieldAlert()
      return;
    }

    // alerta global (toast)
    const id = Date.now();
    const newAlert = {
      id,
      message,
      type,
      isConfirm: type === "confirm",
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    };
    setAlerts(prev => [...prev, newAlert]);

    if (type !== "confirm") {
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
      }, 4000);
    }
  };

  const removeAlert = id =>
    setAlerts(prev => prev.filter(alert => alert.id !== id));

  // limpa o alerta de um campo específico — chame isso quando o usuário corrigir o campo
  const clearFieldAlert = fieldName => {
    setFieldAlerts(prev => {
      const copy = { ...prev };
      delete copy[fieldName];
      return copy;
    });
  };

  const clearAlerts = () => {
    setAlerts([]);
    setFieldAlerts({});
  };

  globalAlertManager = { addAlert, removeAlert, clearAlerts, clearFieldAlert };


  return (
    <AlertContext.Provider
      value={{
        alerts,
        fieldAlerts,
        addAlert,
        removeAlert,
        clearAlerts,
        clearFieldAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

// Hook para usar alertas em qualquer componente
export function useAlert() {
  return useContext(AlertContext);
}

// ------------------- Componente FieldAlert -------------------
export const FieldAlert = ({ fieldName }) => {
  const { fieldAlerts } = useAlert();
  const alert = fieldAlerts[fieldName];

  if (!alert) return null;

  return (
    <div className={`alert inline ${alert.type}`}>
      <span>{alert.message}</span>
    </div>
  );
};
// ---------- Permite acessar o contexto sem Hooks (útil fora de componentes React) ----------
let globalAlertManager = null;

export function getAlertManager() {
  return globalAlertManager;
}
