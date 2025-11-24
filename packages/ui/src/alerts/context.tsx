import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from './types';
import { playAlertSound } from './utils';

interface AlertContextValue {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => string;
  removeAlert: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  clearAll: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function useAlerts(): AlertContextValue {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
}

export function useAlert() {
  const { addAlert } = useAlerts();
  return {
    info: (title: string, message?: string, options?: Partial<Alert>) =>
      addAlert({ severity: 'info', title, message, ...options }),
    success: (title: string, message?: string, options?: Partial<Alert>) =>
      addAlert({ severity: 'success', title, message, timeout: 3000, ...options }),
    warning: (title: string, message?: string, options?: Partial<Alert>) =>
      addAlert({ severity: 'warning', title, message, timeout: 5000, ...options }),
    danger: (title: string, message?: string, options?: Partial<Alert>) =>
      addAlert({ severity: 'danger', title, message, timeout: 0, requiresAck: true, ...options }),
    critical: (title: string, message?: string, options?: Partial<Alert>) =>
      addAlert({ severity: 'critical', title, message, timeout: 0, requiresAck: true, playSound: true, ...options }),
  };
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp'>): string => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: Alert = {
      ...alert,
      id,
      timestamp: Date.now(),
      timeout: alert.timeout ?? (alert.requiresAck ? 0 : 5000),
    };
    setAlerts(prev => [...prev, newAlert]);
    if (soundEnabled && alert.playSound) {
      playAlertSound(alert.severity);
    }
    return id;
  }, [soundEnabled]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    );
    setTimeout(() => removeAlert(id), 300);
  }, [removeAlert]);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  const value: AlertContextValue = {
    alerts,
    addAlert,
    removeAlert,
    acknowledgeAlert,
    clearAll,
    soundEnabled,
    setSoundEnabled,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}
