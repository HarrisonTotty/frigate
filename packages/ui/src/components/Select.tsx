import React from 'react';
import clsx from 'clsx';

/**
 * Select Component
 * 
 * Flat, technical select dropdown following hard sci-fi aesthetics.
 * No rounded corners, consistent with spaceship interface design.
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width select */
  fullWidth?: boolean;
}

export function Select({
  size = 'md',
  fullWidth = false,
  className,
  style,
  ...props
}: SelectProps) {
  const baseStyles: React.CSSProperties = {
    fontFamily: 'var(--frigate-font-mono)',
    color: 'var(--frigate-text-primary)',
    backgroundColor: 'var(--frigate-bg-surface)',
    border: '1px solid var(--frigate-border-base)',
    borderRadius: 0,
    outline: 'none',
    textTransform: 'uppercase',
    width: fullWidth ? '100%' : undefined,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.5 : 1,
    transition: 'all 50ms ease',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888888' d='M6 9L2 5h8z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right var(--frigate-space-3) center',
    paddingRight: 'calc(var(--frigate-space-3) + 20px)',
  };

  const sizeStyles: React.CSSProperties = {
    sm: {
      padding: 'var(--frigate-space-2) var(--frigate-space-3)',
      fontSize: 'var(--frigate-font-small)',
    },
    md: {
      padding: 'var(--frigate-space-3) var(--frigate-space-4)',
      fontSize: 'var(--frigate-font-body)',
    },
    lg: {
      padding: 'var(--frigate-space-4) var(--frigate-space-6)',
      fontSize: 'var(--frigate-font-heading)',
    },
  }[size];

  const focusStyles: React.CSSProperties = {
    borderColor: 'var(--frigate-primary)',
  };

  return (
    <select
      className={clsx('frigate-select', className)}
      style={{ ...baseStyles, ...sizeStyles, ...style }}
      onFocus={(e) => {
        if (!props.disabled) {
          Object.assign(e.currentTarget.style, focusStyles);
        }
      }}
      onBlur={(e) => {
        if (!props.disabled) {
          e.currentTarget.style.borderColor = 'var(--frigate-border-base)';
        }
      }}
      {...props}
    />
  );
}
