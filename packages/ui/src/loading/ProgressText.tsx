/**
 * Text-based progress indicator
 *
 * Shows progress percentage with optional status message.
 *
 * @example
 * ```tsx
 * <ProgressText progress={75} message="COMPILING SYSTEMS" />
 * ```
 */
import React from 'react';

export interface ProgressTextProps {
  /** Current progress (0-100) */
  progress: number;
  /** Status message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

export function ProgressText({
  progress,
  message,
  className = '',
}: ProgressTextProps) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--frigate-font-mono)',
        fontSize: 'var(--frigate-font-small)',
        color: 'var(--frigate-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}
    >
      {message && (
        <div style={{ marginBottom: '4px', color: 'var(--frigate-text-muted)' }}>
          {message}
        </div>
      )}
      <div style={{
        fontWeight: 600,
        color: 'var(--frigate-primary)',
      }}>
        {Math.round(progress)}% COMPLETE
      </div>
    </div>
  );
}
