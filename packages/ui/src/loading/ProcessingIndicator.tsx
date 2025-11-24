/**
 * Subtle processing indicator for background operations
 *
 * @example
 * ```tsx
 * <ProcessingIndicator processing={isSaving} processName="AUTOSAVE" />
 * ```
 */
import React from 'react';

export interface ProcessingIndicatorProps {
  /** Whether currently processing */
  processing: boolean;
  /** Process name */
  processName?: string;
  /** Additional CSS classes */
  className?: string;
}

export function ProcessingIndicator({
  processing,
  processName = 'PROC',
  className = '',
}: ProcessingIndicatorProps) {
  if (!processing) return null;

  return (
    <div
      className={className}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--frigate-font-mono)',
        fontSize: 'var(--frigate-font-tiny)',
        color: 'var(--frigate-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '2px 6px',
        border: '1px solid var(--frigate-border-base)',
        backgroundColor: 'var(--frigate-bg-surface)',
      }}
    >
      <span className="frigate-loading">[{processName}]</span>
    </div>
  );
}
