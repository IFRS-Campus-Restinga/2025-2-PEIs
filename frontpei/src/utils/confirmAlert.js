import { getAlertManager } from "../context/AlertContext";

export function confirmAlert(message) {
  return new Promise((resolve) => {
    const alert = getAlertManager();
    if (!alert) return resolve(false);

    alert.addAlert(message, "confirm", {
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
