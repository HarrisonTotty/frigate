import React from "react";
import { useAlerts } from "../alerts/context";
import { AlertToast } from "../alerts/AlertToast";

export function AlertManager() {
  const { alerts, removeAlert, acknowledgeAlert } = useAlerts();

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: "var(--frigate-z-toast)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        pointerEvents: "none",
        maxWidth: "500px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          pointerEvents: "auto",
        }}
      >
        {alerts.map((alert) => (
          <AlertToast
            key={alert.id}
            alert={alert}
            onDismiss={() => removeAlert(alert.id)}
            onAcknowledge={() => acknowledgeAlert(alert.id)}
          />
        ))}
      </div>
    </div>
  );
}
