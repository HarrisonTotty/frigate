/**
 * Helm Console - Navigation and propulsion control
 *
 * Features:
 * - Heading and speed indicators
 * - Radar plot for navigation
 * - Thrust and rotation controls
 * - Warp/jump/docking interface
 * - FTL readiness status
 */

import React, { useState, useEffect } from "react";
import { Panel, Grid } from "../../layout";
import { Button, ProgressBar } from "../../components";
import { RadarChart } from "../../charts";
import { useAlert } from "../../alerts";
import type { RadarContact } from "../../charts";

export interface HelmStatus {
  heading: number; // 0-359 degrees
  speed: number; // current speed
  max_speed: number;
  rotation_rate: number; // degrees per second
  ftl_ready: boolean;
  ftl_charge: number; // 0-100%
  docked: boolean;
  autopilot: boolean;
}

export interface HelmConsoleProps {
  /** Ship ID */
  shipId: string;
  /** API base URL */
  apiBaseUrl?: string;
  /** Current helm status */
  status?: HelmStatus;
  /** Callback when helm commands issued */
  onHelmCommand?: (command: string, params: Record<string, unknown>) => void;
}

/**
 * Helm Console Component
 *
 * Navigation control station providing heading, speed, and propulsion management.
 *
 * Usage:
 * ```tsx
 * <HelmConsole
 *   shipId="ship-001"
 *   apiBaseUrl="http://localhost:8000"
 *   status={currentHelmStatus}
 * />
 * ```
 */
export function HelmConsole({
  shipId,
  apiBaseUrl = "http://localhost:8000",
  status,
  onHelmCommand,
}: HelmConsoleProps) {
  const [targetHeading, setTargetHeading] = useState(status?.heading || 0);
  const [targetSpeed, setTargetSpeed] = useState(status?.speed || 0);
  const [contacts, setContacts] = useState<RadarContact[]>([]);
  const [loading, setLoading] = useState(false);
  const { success, danger, info } = useAlert();

  // Load navigation contacts
  useEffect(() => {
    loadContacts();
    const interval = setInterval(loadContacts, 2000);
    return () => clearInterval(interval);
  }, [shipId]);

  const loadContacts = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/v1/ships/${shipId}/contacts`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const executeCommand = async (
    endpoint: string,
    method: string = "POST",
    body?: Record<string, unknown>
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/v1/ships/${shipId}${endpoint}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) {
        success("Command executed");
        onHelmCommand?.(endpoint, body || {});
      } else {
        const error = await response.json().catch(() => ({ message: "Command failed" }));
        danger(error.message || "Command failed");
      }
    } catch (error) {
      danger(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const setThrust = (percentage: number) => {
    const speed = ((status?.max_speed || 100) * percentage) / 100;
    setTargetSpeed(speed);
    executeCommand("/helm/thrust", "POST", { thrust_percentage: percentage });
  };

  const setHeading = (degrees: number) => {
    const normalized = ((degrees % 360) + 360) % 360;
    setTargetHeading(normalized);
    executeCommand("/helm/heading", "POST", { heading: normalized });
  };

  const emergencyStop = () => {
    setTargetSpeed(0);
    executeCommand("/helm/stop", "POST");
  };

  const engageWarp = () => {
    if (!status?.ftl_ready) {
      info("FTL drive not ready");
      return;
    }
    executeCommand("/helm/warp", "POST");
  };

  const initiateJump = () => {
    if (!status?.ftl_ready) {
      info("FTL drive not ready");
      return;
    }
    executeCommand("/helm/jump", "POST");
  };

  const requestDocking = () => {
    executeCommand("/helm/dock-request", "POST");
  };

  const undock = () => {
    executeCommand("/helm/undock", "POST");
  };

  return (
    <Grid cols="2fr 1fr" gap={3} fullHeight>
      {/* Left Column: Navigation Display */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-3)" }}>
        {/* Radar Display */}
        <Panel title="NAV RADAR" variant="default">
          <div
            style={{ display: "flex", justifyContent: "center", padding: "var(--frigate-space-3)" }}
          >
            <RadarChart contacts={contacts} range={10000} showRings size={450} />
          </div>
        </Panel>

        {/* Heading & Speed Gauges */}
        <Grid cols="1fr 1fr" gap={3}>
          <Panel title="HDG" variant="default">
            <div style={{ textAlign: "center", padding: "var(--frigate-space-4) 0" }}>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "var(--frigate-primary)",
                  fontFamily: "var(--frigate-font-mono)",
                  letterSpacing: "-0.02em",
                }}
              >
                {(status?.heading || 0).toFixed(0).padStart(3, "0")}°
              </div>
              <div
                style={{
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-tertiary)",
                  fontFamily: "var(--frigate-font-mono)",
                  letterSpacing: "0.05em",
                }}
              >
                CURRENT HEADING
              </div>
            </div>
            <div style={{ marginTop: "var(--frigate-space-3)" }}>
              <input
                type="range"
                min="0"
                max="359"
                value={targetHeading}
                onChange={(e) => setTargetHeading(Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "var(--frigate-space-2)",
                  gap: "var(--frigate-space-2)",
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHeading(targetHeading)}
                  disabled={loading}
                >
                  SET {targetHeading.toString().padStart(3, "0")}°
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHeading((status?.heading || 0) + 90)}
                  disabled={loading}
                >
                  +90°
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="VEL" variant="default">
            <div style={{ textAlign: "center", padding: "var(--frigate-space-4) 0" }}>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "var(--frigate-success)",
                  fontFamily: "var(--frigate-font-mono)",
                  letterSpacing: "-0.02em",
                }}
              >
                {(status?.speed || 0).toFixed(1)}
              </div>
              <div
                style={{
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-tertiary)",
                  fontFamily: "var(--frigate-font-mono)",
                  letterSpacing: "0.05em",
                }}
              >
                M/S [MAX: {status?.max_speed || 100}]
              </div>
            </div>
            <div style={{ marginTop: "var(--frigate-space-3)" }}>
              <input
                type="range"
                min="0"
                max="100"
                value={(targetSpeed / (status?.max_speed || 100)) * 100}
                onChange={(e) =>
                  setTargetSpeed((Number(e.target.value) * (status?.max_speed || 100)) / 100)
                }
                style={{ width: "100%" }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "var(--frigate-space-2)",
                  marginTop: "var(--frigate-space-2)",
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setThrust(0)}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  STOP
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setThrust(50)}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  1/2
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setThrust(100)}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  FULL
                </Button>
              </div>
            </div>
          </Panel>
        </Grid>
      </div>

      {/* Right Column: Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-3)" }}>
        {/* FTL Status */}
        <Panel title="FTL DRIVE" variant="default">
          <div style={{ marginBottom: "var(--frigate-space-3)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "var(--frigate-space-2)",
              }}
            >
              <span
                style={{
                  fontSize: "var(--frigate-font-tiny)",
                  color: "var(--frigate-text-tertiary)",
                  fontFamily: "var(--frigate-font-mono)",
                  letterSpacing: "0.05em",
                }}
              >
                CHARGE
              </span>
              <span
                style={{
                  fontSize: "var(--frigate-font-small)",
                  fontWeight: 700,
                  fontFamily: "var(--frigate-font-mono)",
                }}
              >
                {(status?.ftl_charge || 0).toFixed(0).padStart(3, " ")}%
              </span>
            </div>
            <ProgressBar
              value={status?.ftl_charge || 0}
              max={100}
              variant={status?.ftl_ready ? "success" : "warning"}
            />
            <div
              style={{
                marginTop: "var(--frigate-space-2)",
                fontSize: "var(--frigate-font-tiny)",
                fontFamily: "var(--frigate-font-mono)",
                letterSpacing: "0.05em",
                color: status?.ftl_ready
                  ? "var(--frigate-success)"
                  : "var(--frigate-text-tertiary)",
              }}
            >
              {status?.ftl_ready ? "[OK] FTL READY" : "[...] CHARGING"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-2)" }}>
            <Button
              variant="primary"
              onClick={engageWarp}
              disabled={!status?.ftl_ready || loading}
              style={{ width: "100%" }}
            >
              ENGAGE WARP
            </Button>
            <Button
              variant="primary"
              onClick={initiateJump}
              disabled={!status?.ftl_ready || loading}
              style={{ width: "100%" }}
            >
              INITIATE JUMP
            </Button>
          </div>
        </Panel>

        {/* Docking Controls */}
        <Panel title="DOCKING" variant="default">
          <div
            style={{
              marginBottom: "var(--frigate-space-3)",
              fontSize: "var(--frigate-font-small)",
            }}
          >
            <span
              style={{
                color: "var(--frigate-text-tertiary)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-tiny)",
                letterSpacing: "0.05em",
              }}
            >
              STATUS:{" "}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontFamily: "var(--frigate-font-mono)",
                color: status?.docked ? "var(--frigate-success)" : "var(--frigate-text-primary)",
                letterSpacing: "0.05em",
              }}
            >
              {status?.docked ? "DOCKED" : "FREE NAV"}
            </span>
          </div>

          {status?.docked ? (
            <Button
              variant="secondary"
              onClick={undock}
              disabled={loading}
              style={{ width: "100%" }}
            >
              UNDOCK
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={requestDocking}
              disabled={loading}
              style={{ width: "100%" }}
            >
              REQUEST DOCK
            </Button>
          )}
        </Panel>

        {/* Emergency Controls */}
        <Panel title="EMERGENCY" variant="default">
          <Button
            variant="danger"
            onClick={emergencyStop}
            disabled={loading}
            style={{ width: "100%" }}
          >
            EMERGENCY STOP
          </Button>
          <div
            style={{
              marginTop: "var(--frigate-space-2)",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-tertiary)",
              textAlign: "center",
              fontFamily: "var(--frigate-font-mono)",
              letterSpacing: "0.05em",
            }}
          >
            HALT ALL PROPULSION
          </div>
        </Panel>

        {/* Autopilot */}
        <Panel title="AUTOPILOT" variant="default">
          <div
            style={{
              marginBottom: "var(--frigate-space-3)",
              fontSize: "var(--frigate-font-small)",
            }}
          >
            <span
              style={{
                color: "var(--frigate-text-tertiary)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-tiny)",
                letterSpacing: "0.05em",
              }}
            >
              MODE:{" "}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontFamily: "var(--frigate-font-mono)",
                letterSpacing: "0.05em",
              }}
            >
              {status?.autopilot ? "ENGAGED" : "MANUAL"}
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              executeCommand("/helm/autopilot", "POST", { enabled: !status?.autopilot })
            }
            disabled={loading}
            style={{ width: "100%" }}
          >
            {status?.autopilot ? "DISENGAGE" : "ENGAGE"}
          </Button>
        </Panel>
      </div>
    </Grid>
  );
}
