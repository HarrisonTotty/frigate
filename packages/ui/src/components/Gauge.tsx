import React from "react";
import clsx from "clsx";

/**
 * Gauge Component
 *
 * Technical numerical readout with abbreviated labels and precise formatting.
 * Displays system metrics in a dense, monospace format.
 */
export interface GaugeProps {
  /** Display label (will be auto-abbreviated if possible) */
  label: string;
  /** Current value */
  value: number | string;
  /** Unit of measurement (abbreviated recommended) */
  unit?: string;
  /** Color variant */
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  /** Abbreviate label automatically */
  abbreviated?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function Gauge({
  label,
  value,
  unit,
  variant = "default",
  abbreviated = true,
  className,
}: GaugeProps) {
  const variantColors = {
    default: "var(--frigate-text-primary)",
    primary: "var(--frigate-primary)",
    success: "var(--frigate-success)",
    warning: "var(--frigate-warning)",
    danger: "var(--frigate-danger)",
  };

  // Abbreviate common labels
  const abbreviateLabel = (text: string): string => {
    if (!abbreviated) return text.toUpperCase();

    const abbrevMap: Record<string, string> = {
      POWER: "PWR",
      STATUS: "STS",
      SHIELDS: "SHLD",
      HULL: "HULL",
      TEMPERATURE: "TEMP",
      VELOCITY: "VEL",
      HEADING: "HDG",
      ALTITUDE: "ALT",
      RANGE: "RNG",
      BEARING: "BRG",
      DISTANCE: "DIST",
      FUEL: "FUEL",
      AMMUNITION: "AMMO",
      ENGINES: "ENG",
      COOLING: "COOL",
      REACTOR: "RCTR",
      THRUSTERS: "THRS",
    };

    const upper = text.toUpperCase();
    return abbrevMap[upper] || upper;
  };

  // Format value with proper precision
  const formatGaugeValue = (val: number | string): string => {
    if (typeof val === "string") return val;
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(1);
  };

  return (
    <div
      className={clsx("frigate-gauge", className)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        fontFamily: "var(--frigate-font-mono)",
      }}
    >
      <span
        style={{
          fontSize: "var(--frigate-font-tiny)",
          fontFamily: "var(--frigate-font-mono)",
          color: "var(--frigate-text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
        }}
      >
        {abbreviateLabel(label)}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "4px",
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontSize: "var(--frigate-font-display)",
            fontFamily: "var(--frigate-font-mono)",
            color: variantColors[variant],
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {formatGaugeValue(value)}
        </span>
        {unit && (
          <span
            style={{
              fontSize: "var(--frigate-font-small)",
              fontFamily: "var(--frigate-font-mono)",
              color: "var(--frigate-text-tertiary)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
