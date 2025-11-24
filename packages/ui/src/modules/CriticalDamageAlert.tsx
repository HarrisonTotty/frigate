/**
 * Critical Damage Alert Component
 * 
 * Displays urgent alerts when critical ship modules are damaged or offline.
 * Shows across bridge stations to ensure crew awareness of critical issues.
 */

import React, { useEffect, useState } from 'react';
import { Button } from '../components';
import type { ModuleStatus } from './ModuleDamageIndicator';

/**
 * Critical module alert
 */
export interface CriticalModuleAlert {
  id: string;
  moduleId: string;
  moduleName: string;
  category: string;
  health: number;
  status: ModuleStatus;
  timestamp: number;
  acknowledged: boolean;
}

/**
 * Props for CriticalDamageAlert component
 */
export interface CriticalDamageAlertProps {
  /** Active critical alerts */
  alerts: CriticalModuleAlert[];
  /** Callback when alert acknowledged */
  onAcknowledge?: (alertId: string) => void;
  /** Callback when "Go to Engineering" clicked */
  onGoToEngineering?: () => void;
  /** Show dismiss button */
  allowDismiss?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * CriticalDamageAlert Component
 * 
 * Prominent alert display for critical module damage requiring immediate attention.
 */
export const CriticalDamageAlert: React.FC<CriticalDamageAlertProps> = ({
  alerts,
  onAcknowledge,
  onGoToEngineering,
  allowDismiss = true,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);
  const [flashOn, setFlashOn] = useState(true);

  // Flash animation for critical alerts
  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      setFlashOn((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [alerts.length]);

  // Auto-show when new critical alerts arrive
  useEffect(() => {
    if (alerts.length > 0) {
      setVisible(true);
    }
  }, [alerts.length]);

  if (alerts.length === 0 || !visible) return null;

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalCount = unacknowledgedAlerts.filter((a) => a.status === 'critical').length;
  const offlineCount = unacknowledgedAlerts.filter((a) => a.status === 'offline').length;
  const totalCount = unacknowledgedAlerts.length;

  return (
    <div
      className={`${className} ${flashOn ? 'flash' : ''}`.trim()}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        minWidth: '360px',
        maxWidth: '680px',
        backgroundColor: flashOn ? 'rgba(127, 29, 29, 0.95)' : 'rgba(127, 29, 29, 0.85)',
        border: `2px solid ${flashOn ? 'var(--frigate-danger)' : 'rgba(239, 68, 68, 0.7)'}`,
        padding: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: '16px',
            color: '#fff',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          ⚠ CRITICAL SYSTEM ALERT
        </div>
        {allowDismiss && (
          <Button size="sm" variant="ghost" onClick={() => setVisible(false)} aria-label="close-alert">
            ✕
          </Button>
        )}
      </div>

      <div style={{ marginTop: 8, marginBottom: 12, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--frigate-font-mono)' }}>
        <div style={{ fontWeight: 700 }}>{totalCount} module{totalCount !== 1 ? 's' : ''}</div>
        {offlineCount > 0 && <div style={{ marginTop: 4 }}>{offlineCount} offline</div>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {unacknowledgedAlerts.map((alert) => (
          <div
            key={alert.id}
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', padding: 8 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--frigate-font-mono)' }}>{alert.moduleName}</div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: alert.status === 'offline' ? '#ff6b6b' : '#ffa94d',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                {alert.status === 'offline' ? 'OFFLINE' : '!'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                {alert.category} • Health: <span>{alert.health}%</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAcknowledge?.(alert.id)}
                  aria-label={`dismiss-${alert.id}`}
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button
          variant="primary"
          onClick={onGoToEngineering}
          style={{ flex: 1, backgroundColor: '#fff', color: '#7f1d1d', fontWeight: 700 }}
        >
          Go to Engineering
        </Button>
        <Button
          variant="secondary"
          onClick={() => unacknowledgedAlerts.forEach((a) => onAcknowledge?.(a.id))}
          style={{ flex: 1 }}
        >
          Acknowledge
        </Button>
      </div>
    </div>
  );
};

/**
 * CriticalDamageToast Component
 * 
 * Smaller, less intrusive notification for critical damage.
 * Appears in corner of screen.
 */
export interface CriticalDamageToastProps {
  alerts: CriticalModuleAlert[];
  onDismiss?: () => void;
  onClick?: () => void;
  className?: string;
}

export const CriticalDamageToast: React.FC<CriticalDamageToastProps> = ({
  alerts,
  onDismiss,
  onClick,
  className = '',
}) => {
  const [flashOn, setFlashOn] = useState(true);

  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      setFlashOn((prev) => !prev);
    }, 800);

    return () => clearInterval(interval);
  }, [alerts.length]);

  if (alerts.length === 0) return null;

  const unacknowledged = alerts.filter((a) => !a.acknowledged);
  const criticalCount = unacknowledged.filter((a) => a.status === 'critical').length;
  const offlineCount = unacknowledged.filter((a) => a.status === 'offline').length;
  const totalCount = criticalCount + offlineCount;
  if (totalCount === 0) return null;

  const namesToShow = unacknowledged.slice(0, 3).map((a) => a.moduleName);
  const moreCount = Math.max(0, unacknowledged.length - namesToShow.length);

  const timeSince = (ts: number) => {
    const diff = Date.now() - ts;
    const sec = Math.round(diff / 1000);
    if (sec <= 1) return 'just now';
    return `${sec}s`;
  };

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        minWidth: 220,
        backgroundColor: flashOn ? 'rgba(127, 29, 29, 0.95)' : 'rgba(127, 29, 29, 0.85)',
        border: `2px solid ${flashOn ? 'var(--frigate-danger)' : 'rgba(239, 68, 68, 0.7)'}`,
        padding: 12,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--frigate-font-mono)', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>
          ⚠ {totalCount} Critical Issue{totalCount !== 1 ? 's' : ''}
        </div>
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            aria-label="dismiss-toast"
            style={{ color: '#fff' }}
          >
            ✕
          </Button>
        )}
      </div>

      <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--frigate-font-mono)', fontSize: 12 }}>
        {namesToShow.map((n) => (
          <div key={n}>{n}</div>
        ))}
        {moreCount > 0 && <div>and {moreCount} more</div>}
        {/* Show time since first alert */}
        {unacknowledged[0] && <div style={{ marginTop: 6, opacity: 0.9 }}>{timeSince(unacknowledged[0].timestamp)}</div>}
      </div>
    </div>
  );
};
