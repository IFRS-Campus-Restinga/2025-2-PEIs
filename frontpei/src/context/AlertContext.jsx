import React, { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = "info") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 4000); // mantém o fechamento automático
  };

  const clearAlerts = () => {
    setAlerts([]); // remove todos os alertas imediatamente
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  );
}

// Hook para consumir em qualquer componente
export function useAlert() {
  return useContext(AlertContext);
}
