// src/components/AlertComponent.jsx
import React from "react";
import { useAlert } from "../../context/AlertContext";
import "./AlertComponent.css";

const AlertComponent = () => {
  const { alerts } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert ${alert.type}`}>
            {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertComponent;
