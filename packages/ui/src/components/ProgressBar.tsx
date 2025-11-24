import React from 'react';
import clsx from 'clsx';

/**
 * ProgressBar Component
 * 
 * Technical progress indicator using Unicode block characters.
 * Displays precise percentage and optional system label.
 */
export interface ProgressBarProps {
  /** Current value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Show percentage label */
  showLabel?: boolean;
  /** System or component label */
  label?: string;
  /** Number of block characters to display */
  blocks?: number;
  /** Additional CSS classes */
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  showLabel = true,
  label,
  blocks = 20,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filledBlocks = Math.round((percentage / 100) * blocks);
  const emptyBlocks = blocks - filledBlocks;

  const variantColors = {
    primary: 'var(--frigate-primary)',
    success: 'var(--frigate-success)',
    warning: 'var(--frigate-warning)',
    danger: 'var(--frigate-danger)',
  };

  const containerStyles: React.CSSProperties = {
    fontFamily: 'var(--frigate-font-mono)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--frigate-space-1)',
  };

  const barContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--frigate-space-2)',
    fontSize: 'var(--frigate-font-body)',
    lineHeight: 1,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: 'var(--frigate-font-tiny)',
    color: 'var(--frigate-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  };

  const percentageStyles: React.CSSProperties = {
    fontSize: 'var(--frigate-font-small)',
    color: 'var(--frigate-text-primary)',
    minWidth: '3.5ch',
    textAlign: 'right',
    fontWeight: 700,
  };

  return (
    <div className={clsx('frigate-progress', className)} style={containerStyles}>
      {label && <div style={labelStyles}>{label}</div>}
      <div style={barContainerStyles}>
        <span style={{ color: variantColors[variant], letterSpacing: '-0.05em' }}>
          {'█'.repeat(filledBlocks)}
        </span>
        <span style={{ color: 'var(--frigate-text-tertiary)', letterSpacing: '-0.05em', opacity: 0.3 }}>
          {'░'.repeat(emptyBlocks)}
        </span>
        {showLabel && (
          <span style={percentageStyles}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
