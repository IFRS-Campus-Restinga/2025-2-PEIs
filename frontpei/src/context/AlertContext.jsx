import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const AlertContext = createContext();
let globalAlertManager = null;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);        // Toasts globais
  const [fieldAlerts, setFieldAlerts] = useState({}); // Mensagens inline
  const location = useLocation();

  // Fecha todos os toasts automaticamente ao mudar de tela
  useEffect(() => {
    setAlerts([]);
  }, [location]);

  // Adiciona alerta global ou inline
  const addAlert = (message, type = "info", options = {}) => {
  // Se for alerta de campo (inline)
  if (options.fieldName) {
    setFieldAlerts(prev => ({
      ...prev,
      [options.fieldName]: { message, type }
    }));
    return;
  }

  // Se for sucesso → limpa todos os toasts e alertas inline antes de exibir
  if (type === "success") {
    setAlerts([]);      // limpa toasts
    setFieldAlerts({}); // limpa alertas inline
  }

  // Cria novo alerta global (toast)
  const id = Date.now();
  const newAlert = {
    id,
    message,
    type,
    isConfirm: type === "confirm",
    onConfirm: options.onConfirm || null,
    onCancel: options.onCancel || null
  };

  // Adiciona o novo alerta
  setAlerts(prev => [...prev, newAlert]);
};


  // Remove toast específico
  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Limpa mensagens inline e erros globais quando o campo for corrigido
  const clearFieldAlert = (fieldName) => {
    setFieldAlerts(prev => {
      const copy = { ...prev };
      delete copy[fieldName];
      return copy;
    });

    // remove toasts de erro globais (ex: “Erro ao cadastrar”)
    setAlerts(prev => prev.filter(alert => alert.type !== "error"));
  };

  // Limpa tudo (toasts + inline)
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
