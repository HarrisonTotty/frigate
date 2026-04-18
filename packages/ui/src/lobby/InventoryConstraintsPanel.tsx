/**
 * InventoryConstraintsPanel Component
 *
 * Displays weight and credit constraints for ship inventory.
 * Shows progress bars for resource usage and warnings when limits approached.
 * Includes summary stats and Register Cargo button.
 * Follows the technical aesthetic with monospace typography and ASCII styling.
 */
import React from "react";
import { ProgressBar } from "../components";
import { formatNumber } from "../utils";

/**
 * Inventory statistics for display
 */
export interface InventoryStats {
  /** Current cargo weight */
  cargoWeight: number;
  /** Available weight capacity */
  weightCapacity: number;
  /** Current cargo credit cost */
  cargoCost: number;
  /** Available team credits */
  creditBudget: number;
  /** Number of ammo types loaded */
  ammoTypesLoaded: number;
  /** Total item count */
  totalItems: number;
  /** Compatibility warnings (e.g., "No torpedo tubes installed") */
  warnings: string[];
}

/**
 * InventoryConstraintsPanel Props
 */
export interface InventoryConstraintsPanelProps {
  /** Inventory statistics to display */
  stats: InventoryStats;
  /** Callback when Register Cargo button is clicked */
  onRegisterCargo?: () => void;
  /** Whether register is disabled (e.g., over limits) */
  canRegister?: boolean;
  /** Optional CSS class name */
  className?: string;
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
 * Stat row component for consistent formatting
 */
function StatRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string | number;
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
      </span>
    </div>
  );
}

/**
 * Panel Header Component
 */
function PanelHeader() {
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
        CARGO STATUS
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
        RESOURCE ALLOCATION
      </div>
    </div>
  );
}

/**
 * Panel Footer Component
 */
function PanelFooter({ warningCount }: { warningCount: number }) {
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
 * Register Cargo Button
 */
function RegisterCargoButton({
  onClick,
  disabled,
  stats,
}: {
  onClick?: () => void;
  disabled: boolean;
  stats: InventoryStats;
}) {
  // Determine button state
  const isOverWeight = stats.cargoWeight > stats.weightCapacity;
  const isOverBudget = stats.creditBudget > 0 && stats.cargoCost > stats.creditBudget;
  const hasConflicts = isOverWeight || isOverBudget;
  const hasWarnings = stats.warnings.length > 0;

  let buttonColor = "var(--frigate-success)";
  if (hasConflicts) {
    buttonColor = "var(--frigate-danger)";
  } else if (hasWarnings) {
    buttonColor = "var(--frigate-warning)";
  }

  const getStatusText = () => {
    if (isOverWeight) return "Cargo exceeds weight limit";
    if (isOverBudget) return "Insufficient credits";
    if (hasWarnings) return `${stats.warnings.length} warning(s)`;
    return "Ready to register cargo";
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
        disabled={disabled || hasConflicts}
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
          cursor: disabled || hasConflicts ? "not-allowed" : "pointer",
          opacity: disabled || hasConflicts ? 0.5 : 1,
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!disabled && !hasConflicts) {
            e.currentTarget.style.backgroundColor = buttonColor;
            e.currentTarget.style.color = "var(--frigate-bg-base)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = buttonColor;
        }}
        title={getStatusText()}
        aria-label={`Register Cargo - ${getStatusText()}`}
      >
        REGISTER CARGO &gt;
      </button>
    </div>
  );
}

/**
 * InventoryConstraintsPanel Component
 *
 * Displays cargo constraints and summary:
 * - Weight capacity progress bar
 * - Credit budget progress bar
 * - Summary stats (types loaded, total items)
 * - Warnings section for incompatible items
 * - Register Cargo button
 */
export function InventoryConstraintsPanel({
  stats,
  onRegisterCargo,
  canRegister = true,
  className = "",
}: InventoryConstraintsPanelProps): React.ReactElement {
  const warningCount = stats.warnings.length;
  const isOverWeight = stats.cargoWeight > stats.weightCapacity;
  const isOverBudget = stats.creditBudget > 0 && stats.cargoCost > stats.creditBudget;

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
      aria-label="Cargo Status"
      role="region"
    >
      {/* Header */}
      <PanelHeader />

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "var(--frigate-space-2)",
          overflow: "auto",
          backgroundColor: "var(--frigate-bg-surface)",
        }}
      >
        {/* Constraint Bars */}
        <ConstraintBar
          label="WEIGHT"
          value={stats.cargoWeight}
          max={stats.weightCapacity}
          unit=" t"
          showOverLimit={isOverWeight}
        />
        {stats.creditBudget > 0 && (
          <ConstraintBar
            label="CREDITS"
            value={stats.cargoCost}
            max={stats.creditBudget}
            unit=" CR"
            showOverLimit={isOverBudget}
            formatValue={formatNumber}
          />
        )}

        {/* Summary Stats */}
        <div
          style={{
            marginTop: "var(--frigate-space-3)",
            paddingTop: "var(--frigate-space-2)",
            borderTop: "1px solid var(--frigate-border-base)",
          }}
        >
          <StatRow label="AMMO TYPES" value={stats.ammoTypesLoaded} />
          <StatRow label="TOTAL ITEMS" value={formatNumber(stats.totalItems)} />
        </div>

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
                color: "var(--frigate-warning)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--frigate-space-1)",
                fontWeight: 700,
              }}
            >
              WARNINGS
            </div>
            {stats.warnings.map((warning, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-warning)",
                  paddingLeft: "var(--frigate-space-1)",
                  borderLeft: "2px solid var(--frigate-warning)",
                  marginBottom: "2px",
                }}
              >
                {warning}
              </div>
            ))}
          </div>
        )}

        {/* Over-limit Errors */}
        {(isOverWeight || isOverBudget) && (
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
              ERRORS
            </div>
            {isOverWeight && (
              <div
                style={{
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-danger)",
                  paddingLeft: "var(--frigate-space-1)",
                  borderLeft: "2px solid var(--frigate-danger)",
                  marginBottom: "2px",
                }}
              >
                Weight limit exceeded
              </div>
            )}
            {isOverBudget && (
              <div
                style={{
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-danger)",
                  paddingLeft: "var(--frigate-space-1)",
                  borderLeft: "2px solid var(--frigate-danger)",
                  marginBottom: "2px",
                }}
              >
                Credit budget exceeded
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <PanelFooter warningCount={warningCount + (isOverWeight ? 1 : 0) + (isOverBudget ? 1 : 0)} />

      {/* Register Cargo Button */}
      <RegisterCargoButton onClick={onRegisterCargo} disabled={!canRegister} stats={stats} />
    </div>
  );
}

export default InventoryConstraintsPanel;
