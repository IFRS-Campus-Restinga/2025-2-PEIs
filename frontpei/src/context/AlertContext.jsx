import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AlertContext = createContext();
let globalAlertManager = null;

// Normaliza qualquer tipo de mensagem para string
const normalize = (msg) => {
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "object") return JSON.stringify(msg);
  return String(msg);
};

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);        // Toasts globais
  const [fieldAlerts, setFieldAlerts] = useState({}); // Mensagens inline
  const location = useLocation();

  // Fecha toasts ao trocar de rota
  useEffect(() => {
    setAlerts([]);
  }, [location]);

  // Adiciona alerta global ou inline
  const addAlert = (message, type = "info", options = {}) => {
    message = normalize(message);

    // Se for alerta inline (de campo)
    if (options.fieldName) {
      setFieldAlerts(prev => ({
        ...prev,
        [options.fieldName]: { message, type }
      }));
      return;
    }

    // Se for sucesso, limpa tudo antes
    if (type === "success") {
      setAlerts([]);      
      setFieldAlerts({});
    }

    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const newAlert = {
      id,
      message,
      type,
      isConfirm: type === "confirm",
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    };

    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearFieldAlert = (fieldName) => {
    setFieldAlerts(prev => {
      const copy = { ...prev };
      delete copy[fieldName];
      return copy;
    });

    setAlerts(prev => prev.filter(alert => alert.type !== "error"));
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

export function useAlert() {
  return useContext(AlertContext);
}

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

export function getAlertManager() {
  return globalAlertManager;
}
