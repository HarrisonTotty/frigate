/**
 * Bridge Shell - Root container for bridge station views
 *
 * Provides shared infrastructure for all bridge stations including:
 * - Ship status header
 * - Station selector
 * - Alert system integration
 * - Multi-window support foundation
 */

import React from "react";

export type BridgeStation =
  | "captain"
  | "helm"
  | "engineering"
  | "tactical"
  | "science"
  | "comms"
  | "countermeasures"
  | "kinetic_weapons"
  | "missile_weapons";

export interface ShipStatus {
  ship_id: string;
  ship_name: string;
  hull_integrity: number; // 0-100
  shield_strength: number; // 0-100
  power_available: number; // 0-100
  power_total: number;
  alert_level: "green" | "yellow" | "red" | "blue";
  mission_time?: number; // seconds since mission start
}

export interface BridgeShellProps {
  /** Current ship status */
  shipStatus?: ShipStatus;
  /** Currently active station */
  currentStation: BridgeStation;
  /** Callback when station changes */
  onStationChange?: (station: BridgeStation) => void;
  /** Station content to render */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get alert level color
 */
function getAlertColor(level: string): string {
  switch (level) {
    case "red":
      return "#ef4444";
    case "yellow":
      return "#eab308";
    case "blue":
      return "#3b82f6";
    case "green":
    default:
      return "#22c55e";
  }
}

/**
 * Format mission time as HH:MM:SS
 */
function formatMissionTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Bridge Shell Component
 *
 * Root container for all bridge station views. Provides shared header with
 * ship status, station selector, and consistent layout.
 *
 * Usage:
 * ```tsx
 * <BridgeShell
 *   shipStatus={currentShipStatus}
 *   currentStation="helm"
 *   onStationChange={setStation}
 * >
 *   <HelmConsole shipId={shipStatus.ship_id} />
 * </BridgeShell>
 * ```
 */
export function BridgeShell({
  shipStatus,
  currentStation,
  onStationChange,
  children,
  className = "",
}: BridgeShellProps) {
  const alertColor = shipStatus ? getAlertColor(shipStatus.alert_level) : "#22c55e";

  return (
    <div
      className={className}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* Ship Status Header */}
      <div
        style={{
          backgroundColor: "var(--surface-base)",
          borderBottom: "2px solid",
          borderColor: alertColor,
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.9rem",
        }}
      >
        {/* Left: Ship Info */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>SHIP</div>
            <div style={{ fontWeight: 600, fontSize: "1rem" }}>
              {shipStatus?.ship_name || "NOT CONNECTED"}
            </div>
          </div>
          {shipStatus && (
            <>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>HULL</div>
                <div
                  style={{
                    fontWeight: 600,
                    color:
                      shipStatus.hull_integrity < 30
                        ? "#ef4444"
                        : shipStatus.hull_integrity < 70
                          ? "#eab308"
                          : "#22c55e",
                  }}
                >
                  {shipStatus.hull_integrity.toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>SHIELDS</div>
                <div
                  style={{
                    fontWeight: 600,
                    color:
                      shipStatus.shield_strength < 30
                        ? "#ef4444"
                        : shipStatus.shield_strength < 70
                          ? "#eab308"
                          : "#22c55e",
                  }}
                >
                  {shipStatus.shield_strength.toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>POWER</div>
                <div style={{ fontWeight: 600 }}>
                  {shipStatus.power_available.toFixed(0)}/{shipStatus.power_total}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center: Alert Level */}
        {shipStatus && (
          <div
            style={{
              padding: "0.5rem 1.5rem",
              backgroundColor: alertColor + "20",
              border: "2px solid " + alertColor,
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: alertColor,
              textTransform: "uppercase",
            }}
          >
            {shipStatus.alert_level} ALERT
          </div>
        )}

        {/* Right: Mission Time & Station */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {shipStatus?.mission_time !== undefined && (
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                MISSION TIME
              </div>
              <div style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {formatMissionTime(shipStatus.mission_time)}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>STATION</div>
            <div
              style={{ fontWeight: 600, textTransform: "uppercase", color: "var(--color-primary)" }}
            >
              {currentStation.replace("_", " ")}
            </div>
          </div>
        </div>
      </div>

      {/* Station Selector Tabs */}
      <div
        style={{
          backgroundColor: "var(--surface-base)",
          borderBottom: "1px solid var(--border-base)",
          display: "flex",
          gap: "0",
          padding: "0 1rem",
          overflow: "auto",
        }}
      >
        {(["captain", "helm", "engineering", "tactical"] as BridgeStation[]).map((station) => (
          <button
            key={station}
            onClick={() => onStationChange?.(station)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor:
                currentStation === station ? "var(--surface-overlay)" : "transparent",
              border: "none",
              borderBottom:
                currentStation === station
                  ? "3px solid var(--color-primary)"
                  : "3px solid transparent",
              color: currentStation === station ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: currentStation === station ? 600 : 400,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-mono)",
            }}
          >
            {station}
          </button>
        ))}
      </div>

      {/* Station Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>{children}</div>
    </div>
  );
}
