import React from 'react';
import clsx from 'clsx';

/**
 * Badge Component
 * 
 * Compact status indicator with abbreviated technical codes.
 * Uses standardized 3-4 character abbreviations for space efficiency.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge variant/status */
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'active' | 'offline' | 'standby' | 'primary' | 'default';
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  className,
  ...props
}: BadgeProps) {
  const baseStyles: React.CSSProperties = {
    fontFamily: 'var(--frigate-font-mono)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    border: '1px solid',
    boxShadow: 'none',
    borderRadius: 0,
    whiteSpace: 'nowrap',
  };

  const sizeStyles: React.CSSProperties = {
    sm: {
      padding: '2px var(--frigate-space-2)',
      fontSize: 'var(--frigate-font-tiny)',
      minWidth: '3ch',
    },
    md: {
      padding: 'var(--frigate-space-1) var(--frigate-space-2)',
      fontSize: 'var(--frigate-font-small)',
      minWidth: '4ch',
    },
    lg: {
      padding: 'var(--frigate-space-2) var(--frigate-space-3)',
      fontSize: 'var(--frigate-font-body)',
      minWidth: '5ch',
    },
  }[size];

  const variantStyles: React.CSSProperties = {
    success: {
      backgroundColor: 'var(--frigate-success)',
      color: 'var(--frigate-text-primary)',
      borderColor: 'var(--frigate-success)',
    },
    warning: {
      backgroundColor: 'var(--frigate-warning)',
      color: 'var(--frigate-bg-base)',
      borderColor: 'var(--frigate-warning)',
    },
    danger: {
      backgroundColor: 'var(--frigate-danger)',
      color: 'var(--frigate-text-primary)',
      borderColor: 'var(--frigate-danger)',
    },
    info: {
      backgroundColor: 'var(--frigate-primary)',
      color: 'var(--frigate-text-primary)',
      borderColor: 'var(--frigate-primary)',
    },
    primary: {
      backgroundColor: 'var(--frigate-primary)',
      color: 'var(--frigate-text-primary)',
      borderColor: 'var(--frigate-primary)',
    },
    neutral: {
      backgroundColor: 'var(--frigate-bg-raised)',
      color: 'var(--frigate-text-secondary)',
      borderColor: 'var(--frigate-border-base)',
    },
    default: {
      backgroundColor: 'var(--frigate-bg-raised)',
      color: 'var(--frigate-text-secondary)',
      borderColor: 'var(--frigate-border-base)',
    },
    active: {
      backgroundColor: 'var(--frigate-success)',
      color: 'var(--frigate-text-primary)',
      borderColor: 'var(--frigate-success)',
    },
    offline: {
      backgroundColor: 'transparent',
      color: 'var(--frigate-text-tertiary)',
      borderColor: 'var(--frigate-border-base)',
    },
    standby: {
      backgroundColor: 'transparent',
      color: 'var(--frigate-warning)',
      borderColor: 'var(--frigate-warning)',
    },
  }[variant];

  // Auto-format common status strings to abbreviations
  const formatBadgeText = (text: React.ReactNode): React.ReactNode => {
    if (typeof text !== 'string') return text;
    
    const abbrevMap: Record<string, string> = {
      'online': 'ONLN',
      'offline': 'OFFL',
      'ready': 'RDY',
      'active': 'ACTV',
      'standby': 'STBY',
      'waiting': 'WAIT',
      'processing': 'PROC',
      'complete': 'COMP',
      'completed': 'COMP',
      'failed': 'FAIL',
      'failure': 'FAIL',
      'critical': 'CRIT',
      'warning': 'WARN',
      'normal': 'NOML',
      'degraded': 'DEGR',
    };

    const lower = text.toLowerCase();
    return abbrevMap[lower] || text.toUpperCase();
  };

  return (
    <span
      className={clsx('frigate-badge', className)}
      style={{ ...baseStyles, ...sizeStyles, ...variantStyles }}
      {...props}
    >
      {formatBadgeText(children)}
    </span>
  );
}
