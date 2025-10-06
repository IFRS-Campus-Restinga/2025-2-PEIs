import React from "react";
import { useAlert } from "../../context/AlertContext";
import "./AlertComponent.css";

const AlertComponent = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert ${alert.type}`}>
            <div className="alert-message">{alert.message}</div>

            {alert.isConfirm ? (
              <div className="alert-buttons">
                <button
                  className="alert-btn confirm"
                  onClick={() => {
                    if (alert.onConfirm) alert.onConfirm();
                    removeAlert(alert.id);
                  }}
                >
                  Sim
                </button>
                <button
                  className="alert-btn cancel"
                  onClick={() => {
                    if (alert.onCancel) alert.onCancel();
                    removeAlert(alert.id);
                  }}
                >
                  Não
                </button>
              </div>
            ) : (
              <button className="close-all-btn" onClick={() => removeAlert(alert.id)}>
                Fechar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertComponent;
