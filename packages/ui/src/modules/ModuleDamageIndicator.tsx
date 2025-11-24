/**
 * Module Damage Indicator Component
 * 
 * Displays module health status with visual indicators, health bars,
 * and status badges. Used across bridge views to show module condition.
 */

import React from 'react';
import { ProgressBar } from '../components';

/**
 * Module status types
 */
export type ModuleStatus = 'operational' | 'degraded' | 'damaged' | 'critical' | 'offline';

/**
 * Props for ModuleDamageIndicator component
 */
export interface ModuleDamageIndicatorProps {
  /** Module name */
  name: string;
  /** Module health (0-100) */
  health: number;
  /** Module operational status */
  status: ModuleStatus;
  /** Show health bar */
  showHealthBar?: boolean;
  /** Show status badge */
  showStatusBadge?: boolean;
  /** Compact display mode */
  compact?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Callback when clicked */
  onClick?: () => void;
}

/**
 * Get status badge text and color
 */
function getStatusInfo(status: ModuleStatus, health: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (status) {
    case 'operational':
      return {
        label: 'OPER',
        color: 'var(--frigate-success)',
        bgColor: 'rgba(34, 197, 94, 0.1)',
      };
    case 'degraded':
      return {
        label: 'DEGR',
        color: 'var(--frigate-warning)',
        bgColor: 'rgba(234, 179, 8, 0.1)',
      };
    case 'damaged':
      return {
        label: 'DMGD',
        color: 'var(--frigate-warning)',
        bgColor: 'rgba(249, 115, 22, 0.1)',
      };
    case 'critical':
      return {
        label: 'CRIT',
        color: 'var(--frigate-danger)',
        bgColor: 'rgba(239, 68, 68, 0.1)',
      };
    case 'offline':
      return {
        label: 'OFFL',
        color: 'var(--frigate-danger)',
        bgColor: 'rgba(127, 29, 29, 0.2)',
      };
    default:
      return {
        label: 'UNKN',
        color: 'var(--frigate-text-secondary)',
        bgColor: 'rgba(128, 128, 128, 0.1)',
      };
  }
}

/**
 * Get health bar variant based on health percentage
 */
function getHealthVariant(health: number): 'success' | 'warning' | 'danger' {
  if (health > 70) return 'success';
  if (health > 30) return 'warning';
  return 'danger';
}

/**
 * Determine status from health if not explicitly provided
 */
export function determineStatus(health: number): ModuleStatus {
  if (health === 0) return 'offline';
  // Match test expectations: <=25 => critical, <=50 => damaged, <=75 => degraded
  if (health <= 25) return 'critical';
  if (health <= 50) return 'damaged';
  if (health <= 75) return 'degraded';
  return 'operational';
}

/**
 * ModuleDamageIndicator Component
 * 
 * Visual representation of module health and status for bridge displays.
 */
export const ModuleDamageIndicator: React.FC<ModuleDamageIndicatorProps> = ({
  name,
  health,
  status,
  showHealthBar = true,
  showStatusBadge = true,
  compact = false,
  className = '',
  onClick,
}) => {
  const statusInfo = getStatusInfo(status, health);
  const healthVariant = getHealthVariant(health);
  const isCritical = status === 'critical' || status === 'offline';

  if (compact) {
    // Compact mode: small status indicator with health percent (single text node)
    return (
      <div
        className={className}
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--frigate-space-1)',
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: statusInfo.color,
            animation: isCritical ? 'pulse 1s ease-in-out infinite' : 'none',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-tiny)',
            color: 'var(--frigate-text-primary)',
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-tiny)',
            color: statusInfo.color,
            fontWeight: 700,
          }}
        >
          {health}%
        </span>
      </div>
    );
  }

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: 'var(--frigate-space-2)',
        backgroundColor: isCritical ? statusInfo.bgColor : 'transparent',
        border: isCritical ? `1px solid ${statusInfo.color}` : 'none',
        animation: isCritical ? 'pulse-border 2s ease-in-out infinite' : 'none',
      }}
    >
      {/* Header with name and status badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: showHealthBar ? 'var(--frigate-space-1)' : 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-primary)',
            fontWeight: 600,
          }}
        >
          {name}
        </span>

        {showStatusBadge && (
          <div
            style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-tiny)',
              color: statusInfo.color,
              backgroundColor: statusInfo.bgColor,
              padding: '2px 6px',
              border: `1px solid ${statusInfo.color}`,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            {statusInfo.label}
          </div>
        )}
      </div>

      {/* Health bar */}
      {showHealthBar && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-tiny)',
                color: 'var(--frigate-text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Health
            </span>
            <span
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-tiny)',
                color: statusInfo.color,
                fontWeight: 700,
              }}
            >
              {health}%
            </span>
          </div>
          <ProgressBar value={health} max={100} variant={healthVariant} showLabel={false} />
        </div>
      )}

      {/* Critical warning */}
      {isCritical && (
        <div
          style={{
            marginTop: 'var(--frigate-space-2)',
            padding: 'var(--frigate-space-1)',
            backgroundColor: statusInfo.bgColor,
            border: `1px solid ${statusInfo.color}`,
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-tiny)',
            color: statusInfo.color,
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          {status === 'offline' ? '⚠ MODULE OFFLINE' : '⚠ CRITICAL DAMAGE'}
        </div>
      )}
    </div>
  );
};

/**
 * Module Damage List Component
 * 
 * Displays a list of modules with their damage indicators.
 */
export interface ModuleDamageListProps {
  modules: Array<{
    id: string;
    name: string;
    health: number;
    status: ModuleStatus;
  }>;
  onModuleClick?: (moduleId: string) => void;
  compact?: boolean;
  className?: string;
}

export const ModuleDamageList: React.FC<ModuleDamageListProps> = ({
  modules,
  onModuleClick,
  compact = false,
  className = '',
}) => {
  // Sort by health (critical first)
  const sortedModules = [...modules].sort((a, b) => {
    if (a.status === 'offline' && b.status !== 'offline') return -1;
    if (a.status !== 'offline' && b.status === 'offline') return 1;
    if (a.status === 'critical' && b.status !== 'critical') return -1;
    if (a.status !== 'critical' && b.status === 'critical') return 1;
    return a.health - b.health;
  });

  if (sortedModules.length === 0) {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--frigate-space-2)' }}>
        <div style={{ fontFamily: 'var(--frigate-font-mono)', fontSize: 'var(--frigate-font-small)', color: 'var(--frigate-text-secondary)' }}>
          No modules
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--frigate-space-2)' }}>
      {sortedModules.map((module) => (
        <ModuleDamageIndicator
          key={module.id}
          name={module.name}
          health={module.health}
          status={module.status}
          compact={compact}
          onClick={onModuleClick ? () => onModuleClick(module.id) : undefined}
        />
      ))}
    </div>
  );
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes pulse-border {
    0%, 100% { border-color: var(--frigate-danger); }
    50% { border-color: rgba(239, 68, 68, 0.5); }
  }
`;
document.head.appendChild(style);
