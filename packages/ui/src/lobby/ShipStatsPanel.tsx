import React from "react";
import { ProgressBar, RadarChart } from "../components";

/**
 * Validation state for the ship blueprint
 */
export type ValidationState = "valid" | "incomplete" | "conflict";

/**
 * Ship Profile Interface
 *
 * Normalized (0-1) values representing ship capabilities across five dimensions.
 */
export interface ShipProfile {
  /** Defense: HP and shield capacity relative to theoretical maximum */
  defense: number;
  /** Mobility: Thrust and maneuverability relative to theoretical maximum */
  mobility: number;
  /** Offense: Offensive module count relative to theoretical maximum */
  offense: number;
  /** Versatility: Number of unique module types installed */
  versatility: number;
  /** Utility: Aggregate utility from support modules */
  utility: number;
}

/**
 * Ship Statistics Interface
 *
 * Represents aggregated statistics for a ship blueprint.
 */
export interface ShipStats {
  /** Total construction cost in credits (legacy field, use creditCost instead) */
  cost: number;
  /** Total credit cost of ship design (ship class + all modules) */
  creditCost: number;
  /** Team's available credit budget */
  creditBudget: number;
  /** Credit cost of ship class alone (for breakdown display) */
  shipClassCost: number;
  /** Total ship weight in metric tons */
  weight: number;
  /** Maximum weight allowed by ship class (in metric tons) */
  weightMax: number;
  /** Total hull points (structural integrity) */
  hp: number;
  /** Total power consumption (MW) - sum of all module power draw */
  power: number;
  /** Total power production (MW) - from power core energy_production */
  powerMax: number;
  /** Total heat generation (K/s) - sum of all module heat output */
  heat: number;
  /** Total cooling capacity (K/s) - from cooling system generated_cooling */
  heatMax: number;
  /** Build points currently used */
  buildPointsUsed: number;
  /** Maximum build points available */
  buildPointsMax: number;
  /** Array of constraint warnings if any limits exceeded */
  warnings?: string[];
  /** Names of required modules that are missing */
  missingRequired?: string[];
  /** Ship capability profile for radar chart visualization */
  profile?: ShipProfile;
}

/**
 * Ship Statistics Panel Props
 */
export interface ShipStatsPanelProps {
  /** Ship statistics to display */
  stats: ShipStats;
  /** Optional CSS class name */
  className?: string;
  /** Callback when Register Schematic button is clicked */
  onRegister?: () => void;
}

/**
 * Determine validation state from ship stats
 */
function getValidationState(stats: ShipStats): ValidationState {
  const hasConflicts = (stats.warnings?.length ?? 0) > 0;
  const hasMissing = (stats.missingRequired?.length ?? 0) > 0;

  if (hasConflicts) return "conflict";
  if (hasMissing) return "incomplete";
  return "valid";
}

/**
 * Get button color based on validation state
 */
function getValidationColor(state: ValidationState): string {
  switch (state) {
    case "valid":
      return "var(--frigate-success, #22c55e)";
    case "incomplete":
      return "var(--frigate-warning, #f59e0b)";
    case "conflict":
      return "var(--frigate-danger, #ef4444)";
  }
}

/**
 * Ship Statistics Panel Header
 */
function ShipStatsPanelHeader() {
  return (
    <div
      style={{
        backgroundColor: "var(--frigate-bg-base)",
        padding: "var(--frigate-space-2)",
        borderBottom: "1px solid var(--frigate-border-base)",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: "var(--frigate-font-heading)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        SHIP STATISTICS
      </div>
      <div
        style={{
          fontSize: "var(--frigate-font-small)",
          color: "var(--frigate-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginTop: "var(--frigate-space-1)",
        }}
      >
        BLUEPRINT ANALYSIS
      </div>
    </div>
  );
}

/**
 * Ship Statistics Panel Footer
 */
function ShipStatsPanelFooter({ warningCount }: { warningCount: number }) {
  return (
    <div
      style={{
        fontSize: "var(--frigate-font-tiny)",
        color: warningCount > 0 ? "var(--frigate-danger)" : "var(--frigate-text-muted)",
        backgroundColor: "var(--frigate-bg-base)",
        padding: "var(--frigate-space-1) var(--frigate-space-2)",
        borderTop: "1px solid var(--frigate-border-base)",
        letterSpacing: "0.05em",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>[STATUS: {warningCount > 0 ? "WARNING" : "NOMINAL"}]</span>
      {warningCount > 0 && (
        <span>
          [{warningCount} ISSUE{warningCount > 1 ? "S" : ""}]
        </span>
      )}
    </div>
  );
}

/**
 * Register Schematic Button
 */
function RegisterSchematicButton({ stats, onClick }: { stats: ShipStats; onClick?: () => void }) {
  const validationState = getValidationState(stats);
  const buttonColor = getValidationColor(validationState);
  const isDisabled = validationState === "conflict";

  // Determine tooltip/status text
  const getStatusText = () => {
    if (validationState === "conflict") {
      return "Resolve conflicts before registering";
    }
    if (validationState === "incomplete") {
      const missing = stats.missingRequired ?? [];
      return `Missing: ${missing.join(", ")}`;
    }
    return "Ready to register";
  };

  return (
    <div
      style={{
        padding: "var(--frigate-space-2)",
        backgroundColor: "var(--frigate-bg-base)",
        borderTop: "1px solid var(--frigate-border-base)",
      }}
    >
      <button
        onClick={onClick}
        disabled={isDisabled}
        style={{
          width: "100%",
          padding: "var(--frigate-space-2) var(--frigate-space-3)",
          backgroundColor: "transparent",
          border: `2px solid ${buttonColor}`,
          color: buttonColor,
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-small)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = buttonColor;
            e.currentTarget.style.color = "var(--frigate-bg-base)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = buttonColor;
        }}
        title={getStatusText()}
        aria-label={`Register Schematic - ${getStatusText()}`}
      >
        REGISTER SCHEMATIC &gt;
      </button>
    </div>
  );
}

/**
 * Stat row component for consistent formatting
 */
function StatRow({
  label,
  value,
  unit = "",
  warning = false,
}: {
  label: string;
  value: number | string;
  unit?: string;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--frigate-space-1) 0",
      }}
    >
      <span
        style={{
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--frigate-font-small)",
          color: warning ? "var(--frigate-danger)" : "var(--frigate-text-primary)",
          fontWeight: 600,
          fontFamily: "var(--frigate-font-mono)",
        }}
      >
        {value}
        {unit}
      </span>
    </div>
  );
}

/**
 * Constraint bar component with label
 */
function ConstraintBar({
  label,
  value,
  max,
  unit,
  showOverLimit = false,
  formatValue,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  showOverLimit?: boolean;
  /** Optional formatter for large numbers (e.g., credits) */
  formatValue?: (v: number) => string;
}) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  const exceeded = value > max && max > 0;
  const status = exceeded ? "danger" : percent > 90 ? "warning" : "primary";
  const fmt = formatValue ?? ((v: number) => String(v));

  return (
    <div style={{ marginBottom: "var(--frigate-space-2)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2px",
        }}
      >
        <span
          style={{
            fontSize: "var(--frigate-font-tiny)",
            color: "var(--frigate-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "var(--frigate-font-tiny)",
            color: exceeded ? "var(--frigate-danger)" : "var(--frigate-text-muted)",
            fontWeight: exceeded ? 700 : 400,
          }}
        >
          {fmt(value)}/{max > 0 ? fmt(max) : "—"}
          {unit}
          {exceeded && showOverLimit && " [!]"}
        </span>
      </div>
      <ProgressBar
        value={Math.min(value, max)}
        max={max > 0 ? max : 1}
        variant={status}
        showLabel={false}
        blocks={15}
      />
    </div>
  );
}

/**
 * Ship Statistics Panel Component
 *
 * Displays aggregated ship blueprint statistics in a dense, technical format.
 * Shows key performance indicators with progress bars for constrained resources.
 * Features warning indicators when limits are approached or exceeded.
 */
export function ShipStatsPanel({ stats, className = "", onRegister }: ShipStatsPanelProps) {
  const warningCount = stats.warnings?.length ?? 0;

  // Check for constraint violations
  const weightExceeded = stats.weight > stats.weightMax && stats.weightMax > 0;
  const powerExceeded = stats.power > stats.powerMax && stats.powerMax > 0;
  const heatExceeded = stats.heat > stats.heatMax && stats.heatMax > 0;
  const bpExceeded = stats.buildPointsUsed > stats.buildPointsMax;
  const creditsExceeded = stats.creditBudget > 0 && stats.creditCost > stats.creditBudget;

  // Format credit values with thousand separators
  const formatCredits = (value: number): string => value.toLocaleString();

  return (
    <div
      className={className}
      style={{
        fontFamily: "var(--frigate-font-mono)",
        background: "var(--frigate-bg-base)",
        color: "var(--frigate-text-primary)",
        border: "1px solid var(--frigate-border-base)",
        borderRadius: 0,
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
      aria-label="Ship Statistics"
      role="region"
    >
      {/* Header */}
      <ShipStatsPanelHeader />

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "var(--frigate-space-2)",
          overflow: "auto",
          backgroundColor: "var(--frigate-bg-surface)",
        }}
      >
        {/* Primary Stats */}
        <div style={{ marginBottom: "var(--frigate-space-3)" }}>
          <StatRow
            label="COST"
            value={formatCredits(stats.creditCost)}
            unit=" CR"
            warning={creditsExceeded}
          />
          <StatRow label="HULL" value={stats.hp} unit=" HP" />
        </div>

        {/* Constraint Bars */}
        {stats.creditBudget > 0 && (
          <ConstraintBar
            label="CREDITS"
            value={stats.creditCost}
            max={stats.creditBudget}
            unit=" CR"
            showOverLimit={creditsExceeded}
            formatValue={formatCredits}
          />
        )}
        <ConstraintBar
          label="BUILD POINTS"
          value={stats.buildPointsUsed}
          max={stats.buildPointsMax}
          unit=" BP"
          showOverLimit={bpExceeded}
        />
        <ConstraintBar
          label="WEIGHT"
          value={stats.weight}
          max={stats.weightMax}
          unit=" t"
          showOverLimit={weightExceeded}
        />
        <ConstraintBar
          label="POWER"
          value={stats.power}
          max={stats.powerMax}
          unit=" MW"
          showOverLimit={powerExceeded}
        />
        <ConstraintBar
          label="COOLING"
          value={stats.heat}
          max={stats.heatMax}
          unit=" K"
          showOverLimit={heatExceeded}
        />

        {/* Warnings Section */}
        {warningCount > 0 && (
          <div
            style={{
              marginTop: "var(--frigate-space-3)",
              paddingTop: "var(--frigate-space-2)",
              borderTop: "1px solid var(--frigate-border-base)",
            }}
          >
            <div
              style={{
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-danger)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--frigate-space-1)",
                fontWeight: 700,
              }}
            >
              WARNINGS
            </div>
            {stats.warnings!.map((warning, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-danger)",
                  paddingLeft: "var(--frigate-space-1)",
                  borderLeft: "2px solid var(--frigate-danger)",
                  marginBottom: "2px",
                }}
              >
                {warning}
              </div>
            ))}
          </div>
        )}

        {/* Ship Profile Radar Chart */}
        {stats.profile && (
          <div
            style={{
              marginTop: "var(--frigate-space-3)",
              paddingTop: "var(--frigate-space-2)",
              borderTop: "1px solid var(--frigate-border-base)",
            }}
          >
            <div
              style={{
                fontSize: "var(--frigate-font-tiny)",
                color: "var(--frigate-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--frigate-space-2)",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              CAPABILITY PROFILE
            </div>
            <RadarChart
              axes={[
                { id: "D", label: "Defense", value: stats.profile.defense },
                { id: "M", label: "Mobility", value: stats.profile.mobility },
                { id: "O", label: "Offense", value: stats.profile.offense },
                { id: "V", label: "Versatility", value: stats.profile.versatility },
                { id: "U", label: "Utility", value: stats.profile.utility },
              ]}
              size={180}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <ShipStatsPanelFooter warningCount={warningCount} />

      {/* Register Schematic Button */}
      <RegisterSchematicButton stats={stats} onClick={onRegister} />
    </div>
  );
}

export default ShipStatsPanel;
