import React from 'react';
import clsx from 'clsx';
import { BOX_DRAWING } from './constants';

/**
 * Grid Layout Component
 * 
 * Provides a flexible grid system for bridge station layouts.
 * Supports 12-column grid with responsive breakpoints.
 */
export interface GridProps {
  children: React.ReactNode;
  /** Grid template columns (CSS grid-template-columns value) */
  cols?: string;
  /** Gap between grid items */
  gap?: number;
  /** Additional CSS classes */
  className?: string;
  /** Full height (stretches to container height) */
  fullHeight?: boolean;
}

export function Grid({ children, cols = '1fr', gap = 4, className, fullHeight = false }: GridProps) {
  return (
    <div
      className={clsx('frigate-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: cols,
        gap: `var(--frigate-space-${gap})`,
        height: fullHeight ? '100%' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Panel Component
 * 
 * Terminal-style surface container with ASCII box-drawing borders.
 * Emulates technical equipment readouts and data displays.
 */
export interface PanelProps {
  children: React.ReactNode;
  /** Panel title (displays in header with ASCII border) */
  title?: string;
  /** Status indicator for header */
  status?: 'online' | 'offline' | 'warning' | 'critical' | 'ready';
  /** Additional CSS classes */
  className?: string;
  /** Panel visual variant */
  variant?: 'default' | 'raised' | 'muted';
  /** Enable scrolling within panel content */
  scrollable?: boolean;
  /** Full height (stretches to container height) */
  fullHeight?: boolean;
  /** Use heavy (double-line) borders */
  heavyBorder?: boolean;
}

export function Panel({ 
  children, 
  title, 
  status,
  className, 
  variant = 'default',
  scrollable = false,
  fullHeight = false,
  heavyBorder = false,
}: PanelProps) {
  const bgColor = {
    default: 'var(--frigate-bg-surface)',
    raised: 'var(--frigate-bg-raised)',
    muted: 'var(--frigate-bg-base)',
  }[variant];

  const statusColors = {
    online: 'var(--frigate-success)',
    ready: 'var(--frigate-success)',
    offline: 'var(--frigate-text-tertiary)',
    warning: 'var(--frigate-warning)',
    critical: 'var(--frigate-danger)',
  };

  const statusLabels = {
    online: 'ONLN',
    ready: 'RDY',
    offline: 'OFFL',
    warning: 'WARN',
    critical: 'CRIT',
  };

  // Choose border style
  const cornerTL = heavyBorder ? BOX_DRAWING.TOP_LEFT_HEAVY : BOX_DRAWING.TOP_LEFT;
  const cornerTR = heavyBorder ? BOX_DRAWING.TOP_RIGHT_HEAVY : BOX_DRAWING.TOP_RIGHT;
  const cornerBL = heavyBorder ? BOX_DRAWING.BOTTOM_LEFT_HEAVY : BOX_DRAWING.BOTTOM_LEFT;
  const cornerBR = heavyBorder ? BOX_DRAWING.BOTTOM_RIGHT_HEAVY : BOX_DRAWING.BOTTOM_RIGHT;
  const hLine = heavyBorder ? BOX_DRAWING.HORIZONTAL_HEAVY : BOX_DRAWING.HORIZONTAL;
  const vLine = heavyBorder ? BOX_DRAWING.VERTICAL_HEAVY : BOX_DRAWING.VERTICAL;

  return (
    <div
      className={clsx('frigate-panel', heavyBorder && 'frigate-ascii-border-heavy', className)}
      style={{
        backgroundColor: bgColor,
        border: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        height: fullHeight ? '100%' : undefined,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--frigate-font-mono)',
        position: 'relative',
      }}
    >
      {title && (
        <div
          className="frigate-panel-header"
          style={{
            padding: 'var(--frigate-space-2) var(--frigate-space-3)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--frigate-text-secondary)',
            borderBottom: `1px solid var(--frigate-border-base)`,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--frigate-space-2)',
            lineHeight: 1,
          }}
        >
          <span style={{ opacity: 0.5 }}>{cornerTL}{hLine}</span>
          <span>{title}</span>
          {status && (
            <span style={{ 
              color: statusColors[status], 
              fontSize: 'var(--frigate-font-tiny)',
              fontWeight: 700,
            }}>
              [{statusLabels[status]}]
            </span>
          )}
          <span style={{ opacity: 0.5, marginLeft: 'auto' }}>{hLine}{cornerTR}</span>
        </div>
      )}
      <div
        className="frigate-panel-content"
        style={{
          padding: 'var(--frigate-space-3)',
          flex: 1,
          overflow: scrollable ? 'auto' : 'visible',
          position: 'relative',
        }}
      >
        {/* Left and right borders */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '1ch',
          color: 'var(--frigate-border-base)',
          opacity: 0.5,
          pointerEvents: 'none',
          lineHeight: 1.2,
          fontSize: 'var(--frigate-font-small)',
          overflow: 'hidden',
        }}>
          {vLine}
        </div>
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '1ch',
          color: 'var(--frigate-border-base)',
          opacity: 0.5,
          pointerEvents: 'none',
          lineHeight: 1.2,
          fontSize: 'var(--frigate-font-small)',
          textAlign: 'right',
          overflow: 'hidden',
        }}>
          {vLine}
        </div>
        {children}
      </div>
      {/* Bottom border */}
      <div style={{
        padding: '0 var(--frigate-space-3)',
        fontSize: 'var(--frigate-font-small)',
        color: 'var(--frigate-border-base)',
        opacity: 0.5,
        lineHeight: 1,
      }}>
        <span>{cornerBL}</span>
        <span>{hLine.repeat(10)}</span>
        <span style={{ float: 'right' }}>{cornerBR}</span>
      </div>
    </div>
  );
}

/**
 * Overlay Component
 * 
 * Semi-transparent backdrop for modals/dialogs.
 */
export interface OverlayProps {
  /** Overlay visibility */
  visible: boolean;
  /** Click handler for backdrop (for dismissing modals) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function Overlay({ visible, onClick, className }: OverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={clsx('frigate-overlay', className)}
      onClick={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--frigate-bg-overlay)',
        zIndex: 'var(--frigate-z-overlay)',
        animation: 'frigate-fade-in var(--frigate-transition-fast)',
      }}
    />
  );
}

/**
 * Modal Component
 * 
 * Terminal-style centered dialog with heavy ASCII borders.
 * Emulates secure system prompts and critical notifications.
 */
export interface ModalProps {
  children: React.ReactNode;
  /** Modal visibility */
  visible: boolean;
  /** Title displayed in modal header */
  title?: string;
  /** Close handler (called on overlay click or close button) */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg';
  /** Priority level (affects border color) */
  priority?: 'normal' | 'warning' | 'critical';
}

export function Modal({ 
  children, 
  visible, 
  title, 
  onClose, 
  className, 
  size = 'md',
  priority = 'normal',
}: ModalProps) {
  if (!visible) return null;

  const maxWidth = {
    sm: '400px',
    md: '600px',
    lg: '800px',
  }[size];

  const borderColors = {
    normal: 'var(--frigate-border-light)',
    warning: 'var(--frigate-warning)',
    critical: 'var(--frigate-danger)',
  };

  const priorityLabels = {
    normal: 'SYS',
    warning: 'WARN',
    critical: 'CRIT',
  };

  return (
    <>
      <Overlay visible={visible} onClick={onClose} />
      <div
        className={clsx('frigate-modal', 'frigate-ascii-border-heavy', className)}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 'var(--frigate-z-modal)',
          width: '90vw',
          maxWidth,
          maxHeight: '90vh',
          backgroundColor: 'var(--frigate-bg-base)',
          border: `2px solid ${borderColors[priority]}`,
          borderRadius: 0,
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          animation: 'frigate-scale-in var(--frigate-transition-base)',
          fontFamily: 'var(--frigate-font-mono)',
        }}
      >
        {title && (
          <div
            className="frigate-modal-header"
            style={{
              padding: 'var(--frigate-space-3) var(--frigate-space-4)',
              borderBottom: `2px solid ${borderColors[priority]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--frigate-bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--frigate-space-3)' }}>
              <span style={{
                fontSize: 'var(--frigate-font-small)',
                color: borderColors[priority],
                fontWeight: 700,
                opacity: 0.7,
              }}>
                {BOX_DRAWING.TOP_LEFT_HEAVY}{BOX_DRAWING.HORIZONTAL_HEAVY}
              </span>
              <span style={{
                fontSize: 'var(--frigate-font-tiny)',
                color: borderColors[priority],
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}>
                [{priorityLabels[priority]}]
              </span>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'var(--frigate-font-heading)',
                  fontWeight: 700,
                  color: 'var(--frigate-text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {title}
              </h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="frigate-modal-close"
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: `1px solid ${borderColors[priority]}`,
                  color: 'var(--frigate-text-secondary)',
                  fontSize: 'var(--frigate-font-body)',
                  fontFamily: 'var(--frigate-font-mono)',
                  cursor: 'pointer',
                  padding: 'var(--frigate-space-2)',
                  lineHeight: 1,
                  transition: 'all 50ms ease',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--frigate-text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--frigate-bg-raised)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--frigate-text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                [X]
              </button>
            )}
          </div>
        )}
        <div
          className="frigate-modal-content"
          style={{
            padding: 'var(--frigate-space-6)',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}


/**
 * Stack Component
 * 
 * Vertical or horizontal layout with consistent spacing.
 */
export interface StackProps {
  children: React.ReactNode;
  /** Stack direction */
  direction?: 'row' | 'column';
  /** Gap between items */
  gap?: number;
  /** Horizontal alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Vertical alignment */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  /** Additional CSS classes */
  className?: string;
}

export function Stack({ 
  children, 
  direction = 'column', 
  gap = 4, 
  align = 'stretch',
  justify = 'start',
  className 
}: StackProps) {
  return (
    <div
      className={clsx('frigate-stack', className)}
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: `var(--frigate-space-${gap})`,
        alignItems: align,
        justifyContent: justify,
      }}
    >
      {children}
    </div>
  );
}
