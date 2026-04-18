/**
 * Module Tooltip Component
 *
 * Specialized tooltip for module slots and instances following
 * the hard sci-fi design philosophy.
 */

import React, { useState, useRef, useEffect, useCallback, ReactNode } from "react";

/**
 * Stat row for displaying a key-value pair
 */
export interface TooltipStatRow {
  label: string;
  value: string | number;
  unit?: string;
  warning?: boolean;
}

/**
 * Module Tooltip Props
 */
export interface ModuleTooltipProps {
  /** Element to attach tooltip to */
  children: ReactNode;
  /** Tooltip title (displayed in header) */
  title: string;
  /** Optional subtitle or type designation */
  subtitle?: string;
  /** Description text */
  description?: string;
  /** Array of stat rows to display */
  stats?: TooltipStatRow[];
  /** Tags to display (e.g., "[REQUIRED]", "[HAS VARIANTS]") */
  tags?: string[];
  /** Tooltip position relative to target */
  position?: "top" | "bottom" | "left" | "right";
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Max width of tooltip */
  maxWidth?: number;
}

/**
 * Module Tooltip Component
 *
 * Displays detailed information about module slots and instances in a
 * technical tooltip panel that follows the mouse cursor.
 *
 * Features:
 * - Follows mouse cursor with smart viewport positioning
 * - Monospace typography
 * - Stat rows with labels, values, and units
 * - Warning highlighting for exceeded limits
 * - Bracket notation tags
 *
 * @example
 * ```tsx
 * <ModuleTooltip
 *   title="REACTOR CORE"
 *   subtitle="Power Generation"
 *   description="Primary power source for all ship systems."
 *   stats={[
 *     { label: 'COST', value: 15, unit: 'BP' },
 *     { label: 'POWER', value: 500, unit: 'kW' },
 *     { label: 'HEAT', value: 200, unit: 'kWth' },
 *   ]}
 *   tags={['[REQUIRED]', '[HAS VARIANTS]']}
 * >
 *   <div>Hover me</div>
 * </ModuleTooltip>
 * ```
 */
export function ModuleTooltip({
  children,
  title,
  subtitle,
  description,
  stats = [],
  tags = [],
  position: _position = "right",
  delay = 200,
  disabled = false,
  maxWidth = 280,
}: ModuleTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  // Calculate tooltip position based on mouse cursor
  const calculatePosition = useCallback(() => {
    if (!tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const offset = 16; // Distance from cursor

    let x = mouseCoords.x + offset;
    let y = mouseCoords.y + offset;

    // Keep tooltip within viewport
    // If tooltip would go off right edge, show it to the left of cursor
    if (x + tooltipRect.width > window.innerWidth - 8) {
      x = mouseCoords.x - tooltipRect.width - offset;
    }
    // If tooltip would go off bottom edge, show it above cursor
    if (y + tooltipRect.height > window.innerHeight - 8) {
      y = mouseCoords.y - tooltipRect.height - offset;
    }
    // Ensure minimum margins from edges
    x = Math.max(8, x);
    y = Math.max(8, y);

    setCoords({ x, y });
  }, [mouseCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseCoords({ x: e.clientX, y: e.clientY });
  }, []);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = window.setTimeout(() => {
      setVisible(true);
    }, delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  }, []);

  // Recalculate position when visible or mouse moves
  useEffect(() => {
    if (visible) {
      // Small delay to let the tooltip render
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [visible, calculatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onMouseMove={handleMouseMove}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: "contents" }}
      >
        {children}
      </div>

      {visible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: "fixed",
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: 9999,
            maxWidth: `${maxWidth}px`,
            pointerEvents: "none",
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-tiny)",
            backgroundColor: "var(--frigate-bg-raised)",
            border: "1px solid var(--frigate-primary)",
            color: "var(--frigate-text-primary)",
            padding: "var(--frigate-space-2)",
          }}
        >
          {/* Header */}
          <div
            style={{
              fontWeight: 700,
              fontSize: "var(--frigate-font-small)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: subtitle || tags.length > 0 ? "var(--frigate-space-1)" : 0,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-text-secondary)",
                marginBottom: tags.length > 0 ? "var(--frigate-space-1)" : 0,
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--frigate-space-1)",
                marginBottom: "var(--frigate-space-2)",
              }}
            >
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "var(--frigate-font-tiny)",
                    color:
                      tag.includes("WARNING") || tag.includes("REQUIRED")
                        ? "var(--frigate-warning)"
                        : "var(--frigate-primary)",
                    fontWeight: 700,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-text-secondary)",
                lineHeight: 1.4,
                marginBottom: stats.length > 0 ? "var(--frigate-space-2)" : 0,
                borderBottom: stats.length > 0 ? "1px dashed var(--frigate-border-base)" : "none",
                paddingBottom: stats.length > 0 ? "var(--frigate-space-2)" : 0,
              }}
            >
              {description}
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-1)" }}
            >
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "var(--frigate-text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {stat.label}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: stat.warning ? "var(--frigate-danger)" : "var(--frigate-text-primary)",
                    }}
                  >
                    {stat.value}
                    {stat.unit && (
                      <span style={{ color: "var(--frigate-text-muted)", marginLeft: "2px" }}>
                        {stat.unit}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ModuleTooltip;
