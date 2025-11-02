import React from "react";
import { useAlert } from "../../context/AlertContext";
import "../../cssGlobal.css";

const AlertComponent = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  

  return (
    <>
      {/* Toats normais (canto inferior direito) */}
      <div className="alert-container">
        {alerts.filter(a => !a.isConfirm).map((alert) => (
          <div key={alert.id} className={`alert ${alert.type}`}>
            <span>{alert.message}</span>
          </div>
        ))}
      </div>

      {/* Alertas de confirmação (modal centralizado) */}
      {alerts.filter(a => a.isConfirm).map((alert) => (
        <div key={alert.id} className="alert-confirm-overlay">
          <div className="alert-confirm-box">
            <div className="alert-message">{alert.message}</div>
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
          </div>
        </div>
      ))}
    </>
  );
};

export default AlertComponent;
