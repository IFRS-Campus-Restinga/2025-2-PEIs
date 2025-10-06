import React from "react";
import { useAlert } from "../../context/AlertContext";
import "./AlertComponent.css";

const AlertComponent = () => {
  const { alerts, clearAlerts } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert ${alert.type}`}>
            {alert.message}
          </div>
        ))}
        {/* Botão único para fechar todos os alertas */}
        <button className="close-all-btn" onClick={clearAlerts}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default AlertComponent;
