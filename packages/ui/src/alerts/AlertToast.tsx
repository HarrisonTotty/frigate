import React, { useState, useEffect } from 'react';
import { Alert, AlertSeverity } from '../alerts/types';
import { getSeverityClasses } from '../alerts/utils';

interface AlertToastProps {
  alert: Alert;
  onDismiss: () => void;
  onAcknowledge: () => void;
}

export function AlertToast({ alert, onDismiss, onAcknowledge }: AlertToastProps) {
  const classes = getSeverityClasses(alert.severity);
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss timer
  useEffect(() => {
    const timeout = alert.timeout ?? 0;
    if (timeout > 0 && !alert.requiresAck) {
      const timer = window.setTimeout(() => {
        setIsExiting(true);
        window.setTimeout(onDismiss, 150);
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [alert.timeout, alert.requiresAck, onDismiss]);

  const handleDismiss = () => {
    if (!alert.requiresAck) {
      setIsExiting(true);
      window.setTimeout(onDismiss, 150);
    }
  };

  const handleAcknowledge = () => {
    setIsExiting(true);
    onAcknowledge();
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '500px',
        padding: '12px',
        backgroundColor: classes.bg,
        border: `1px solid ${classes.border}`,
        fontFamily: 'var(--frigate-font-mono)',
        transition: `opacity ${isExiting ? '150ms' : '0ms'} ease, transform ${isExiting ? '150ms' : '0ms'} ease`,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateY(-10px)' : 'translateY(0)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Severity Label */}
        <div style={{
          fontSize: 'var(--frigate-font-small)',
          fontWeight: 600,
          color: classes.text,
          flexShrink: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {classes.label}
        </div>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            color: classes.text,
            fontSize: 'var(--frigate-font-small)',
            textTransform: 'uppercase',
            marginBottom: alert.message ? '4px' : 0,
          }}>
            {alert.title}
          </div>
          {alert.message && (
            <div style={{
              fontSize: 'var(--frigate-font-tiny)',
              color: 'var(--frigate-text-secondary)',
              fontFamily: 'var(--frigate-font-mono)',
            }}>
              {alert.message}
            </div>
          )}
          {/* Actions */}
          {(alert.requiresAck || !alert.requiresAck) && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              {alert.requiresAck && (
                <button
                  onClick={handleAcknowledge}
                  style={{
                    padding: '4px 8px',
                    fontSize: 'var(--frigate-font-tiny)',
                    fontWeight: 600,
                    fontFamily: 'var(--frigate-font-mono)',
                    textTransform: 'uppercase',
                    border: `1px solid ${classes.border}`,
                    backgroundColor: 'transparent',
                    color: classes.text,
                    cursor: 'pointer',
                    transition: 'background-color 50ms ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--frigate-bg-raised)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  [ACKNOWLEDGE]
                </button>
              )}
              {!alert.requiresAck && (
                <button
                  onClick={handleDismiss}
                  style={{
                    padding: '4px 8px',
                    fontSize: 'var(--frigate-font-tiny)',
                    fontFamily: 'var(--frigate-font-mono)',
                    textTransform: 'uppercase',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--frigate-text-muted)',
                    cursor: 'pointer',
                    transition: 'color 50ms ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--frigate-text-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--frigate-text-muted)'}
                >
                  [DISMISS]
                </button>
              )}
            </div>
          )}
        </div>
        {/* Close button (only if not requiring acknowledgment) */}
        {!alert.requiresAck && (
          <button
            onClick={handleDismiss}
            style={{
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-text-muted)',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              flexShrink: 0,
              padding: '0 4px',
              transition: 'color 50ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--frigate-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--frigate-text-muted)'}
          >
            [X]
          </button>
        )}
      </div>
    </div>
  );
}
