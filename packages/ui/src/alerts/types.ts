export type AlertSeverity = "info" | "success" | "warning" | "danger" | "critical";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message?: string;
  requiresAck?: boolean;
  timeout?: number;
  playSound?: boolean;
  timestamp: number;
  acknowledged?: boolean;
}
