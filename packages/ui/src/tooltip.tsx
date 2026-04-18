/**
 * Tooltip component with technical documentation style
 *
 * Provides hover tooltips with TUI aesthetic - monospace fonts, abbreviated labels,
 * and optional glossary definitions for technical terms.
 */

import React, { useState, useRef, useEffect, ReactNode } from "react";

/**
 * Tooltip props
 */
export interface TooltipProps {
  /** Content to display in tooltip */
  content: ReactNode;
  /** Element to attach tooltip to */
  children: ReactNode;
  /** Tooltip position relative to target */
  position?: "top" | "bottom" | "left" | "right";
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show abbreviated term definition */
  abbreviation?: string;
}

/**
 * Tooltip component with technical styling
 */
export function Tooltip({
  content,
  children,
  position = "top",
  delay = 300,
  className = "",
  abbreviation,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  const showTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      if (targetRef.current && tooltipRef.current) {
        const targetRect = targetRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        let x = 0;
        let y = 0;

        switch (position) {
          case "top":
            x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
            y = targetRect.top - tooltipRect.height - 8;
            break;
          case "bottom":
            x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
            y = targetRect.bottom + 8;
            break;
          case "left":
            x = targetRect.left - tooltipRect.width - 8;
            y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
            break;
          case "right":
            x = targetRect.right + 8;
            y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
            break;
        }

        // Keep tooltip within viewport
        x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
        y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

        setCoords({ x, y });
        setVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };

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
        style={{ display: "inline-block" }}
      >
        {children}
      </div>

      {visible && (
        <div
          ref={tooltipRef}
          className={className}
          style={{
            position: "fixed",
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: "var(--frigate-z-toast)",
            padding: "var(--frigate-space-2) var(--frigate-space-3)",
            backgroundColor: "var(--frigate-bg-raised)",
            border: "1px solid var(--frigate-border-light)",
            color: "var(--frigate-text-primary)",
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-tiny)",
            letterSpacing: "0.05em",
            maxWidth: "300px",
            pointerEvents: "none",
            lineHeight: 1.5,
          }}
        >
          {abbreviation && (
            <div
              style={{
                fontWeight: 700,
                color: "var(--frigate-primary)",
                marginBottom: "var(--frigate-space-1)",
                letterSpacing: "0.1em",
              }}
            >
              {abbreviation}
            </div>
          )}
          <div>{content}</div>
        </div>
      )}
    </>
  );
}

/**
 * Technical abbreviation with automatic tooltip
 */
export interface AbbrProps {
  /** Abbreviated term */
  term: string;
  /** Full definition */
  definition: string;
  /** Additional description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

export function Abbr({ term, definition, description, className = "" }: AbbrProps) {
  return (
    <Tooltip
      abbreviation={term}
      content={
        <>
          <div
            style={{ fontWeight: 600, marginBottom: description ? "var(--frigate-space-1)" : 0 }}
          >
            {definition}
          </div>
          {description && (
            <div
              style={{
                color: "var(--frigate-text-tertiary)",
                fontSize: "var(--frigate-font-tiny)",
              }}
            >
              {description}
            </div>
          )}
        </>
      }
      delay={200}
    >
      <abbr
        title={definition}
        className={className}
        style={{
          textDecoration: "none",
          borderBottom: "1px dotted var(--frigate-border-light)",
          cursor: "help",
          fontFamily: "var(--frigate-font-mono)",
          letterSpacing: "0.05em",
        }}
      >
        {term}
      </abbr>
    </Tooltip>
  );
}
