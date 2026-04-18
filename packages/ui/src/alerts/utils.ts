import { AlertSeverity } from "./types";

export function getSeverityClasses(severity: AlertSeverity): {
  bg: string;
  border: string;
  text: string;
  label: string;
} {
  switch (severity) {
    case "info":
      return {
        bg: "var(--frigate-bg-surface)",
        border: "var(--frigate-primary)",
        text: "var(--frigate-text-primary)",
        label: "[INFO]",
      };
    case "success":
      return {
        bg: "var(--frigate-bg-surface)",
        border: "var(--frigate-success)",
        text: "var(--frigate-success)",
        label: "[OK]",
      };
    case "warning":
      return {
        bg: "var(--frigate-bg-surface)",
        border: "var(--frigate-warning)",
        text: "var(--frigate-warning)",
        label: "[WARN]",
      };
    case "danger":
      return {
        bg: "var(--frigate-bg-surface)",
        border: "var(--frigate-danger)",
        text: "var(--frigate-danger)",
        label: "[CRIT]",
      };
    case "critical":
      return {
        bg: "var(--frigate-bg-surface)",
        border: "var(--frigate-danger)",
        text: "var(--frigate-danger)",
        label: "[!!]",
      };
  }
}

export function playAlertSound(severity: AlertSeverity) {
  if (typeof window === "undefined" || !window.AudioContext) return;
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    const frequencies: Record<AlertSeverity, number> = {
      info: 440,
      success: 523,
      warning: 587,
      danger: 659,
      critical: 880,
    };
    oscillator.frequency.value = frequencies[severity];
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.warn("Failed to play alert sound:", error);
  }
}
