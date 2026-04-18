/**
 * Captain Console - Strategic overview and crew management
 *
 * Features:
 * - Tactical map showing ship position and nearby contacts
 * - Crew status display
 * - Alerts feed with acknowledge workflow
 * - Crew reassignment interface
 * - Captain's log entry system
 */

import React, { useState, useEffect } from "react";
import { Panel, Grid, Stack } from "../../layout";
import { Button, Badge } from "../../components";
import { useAlert } from "../../alerts";
import { RadarChart } from "../../charts";
import type { RadarContact } from "../../charts";

export interface CrewMember {
  player_id: string;
  player_name?: string;
  role: string;
  status: "active" | "offline" | "incapacitated";
}

export interface AlertMessage {
  id: string;
  timestamp: number;
  severity: "info" | "warning" | "critical";
  category: "combat" | "communications" | "docking" | "system" | "navigation";
  message: string;
  acknowledged: boolean;
}

export interface CaptainConsoleProps {
  /** Ship ID */
  shipId: string;
  /** API base URL */
  apiBaseUrl?: string;
  /** Current crew roster */
  crew?: CrewMember[];
  /** Recent alerts */
  alerts?: AlertMessage[];
  /** Callback when alert acknowledged */
  onAcknowledgeAlert?: (alertId: string) => void;
  /** Callback when crew reassigned */
  onReassignCrew?: (playerId: string, newRole: string) => void;
  /** Callback when log entry submitted */
  onSubmitLog?: (entry: string) => void;
}

/**
 * Captain Console Component
 *
 * Strategic command center providing overview of ship operations, crew status,
 * and alert management.
 *
 * Usage:
 * ```tsx
 * <CaptainConsole
 *   shipId="ship-001"
 *   apiBaseUrl="http://localhost:8000"
 *   crew={crewRoster}
 *   alerts={recentAlerts}
 * />
 * ```
 */
export function CaptainConsole({
  shipId,
  apiBaseUrl = "http://localhost:8000",
  crew = [],
  alerts = [],
  onAcknowledgeAlert,
  onReassignCrew: _onReassignCrew,
  onSubmitLog,
}: CaptainConsoleProps) {
  const [contacts, setContacts] = useState<RadarContact[]>([]);
  const [logEntry, setLogEntry] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const { info, success, danger } = useAlert();

  // Load contacts for tactical map
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
      // Silently fail - not critical for display
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    onAcknowledgeAlert?.(alertId);
    info("Alert acknowledged");
  };

  const handleSubmitLog = async () => {
    if (!logEntry.trim()) return;

    try {
      const response = await fetch(`${apiBaseUrl}/v1/ships/${shipId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry: logEntry }),
      });

      if (response.ok) {
        success("Log entry recorded");
        setLogEntry("");
        onSubmitLog?.(logEntry);
      } else {
        danger("Failed to record log entry");
      }
    } catch (error) {
      danger(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "danger";
      case "warning":
        return "warning";
      default:
        return "default";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "combat":
        return "CMBT";
      case "communications":
        return "COMM";
      case "docking":
        return "DOCK";
      case "navigation":
        return "NAV ";
      case "system":
        return "SYS ";
      default:
        return "INFO";
    }
  };

  const getRoleAbbreviation = (role: string): string => {
    const upperRole = role.toUpperCase();
    switch (upperRole) {
      case "CAPTAIN":
        return "CAPT";
      case "HELM":
        return "HELM";
      case "ENGINEERING":
        return "ENGR";
      case "TACTICAL":
        return "TACT";
      case "COMMUNICATIONS":
        return "COMM";
      case "SCIENCE":
        return "SCI ";
      default:
        return upperRole.substring(0, 4).padEnd(4, " ");
    }
  };

  const getStatusAbbreviation = (status: string): string => {
    switch (status) {
      case "active":
        return "ACTV";
      case "offline":
        return "OFFL";
      case "incapacitated":
        return "INCAP";
      default:
        return status.substring(0, 4).toUpperCase();
    }
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <Grid cols="1fr 1fr 1fr" gap={3}>
      {/* Tactical Map */}
      <div style={{ gridColumn: "span 2" }}>
        <Panel title="TACTICAL OVERVIEW" variant="default">
          <div style={{ height: "400px" }}>
            <RadarChart contacts={contacts} range={10000} showRings size={400} />
          </div>
          <div
            style={{
              marginTop: "var(--frigate-space-2)",
              fontSize: "var(--frigate-font-tiny)",
              color: "var(--frigate-text-tertiary)",
              fontFamily: "var(--frigate-font-mono)",
              letterSpacing: "0.05em",
            }}
          >
            CONTACTS: {contacts.length.toString().padStart(3, "0")}
          </div>
        </Panel>
      </div>

      {/* Crew Status */}
      <Panel title="CREW ROSTER" variant="default">
        <Stack direction="column" gap={1}>
          {crew.length === 0 ? (
            <p
              style={{
                color: "var(--frigate-text-tertiary)",
                fontSize: "var(--frigate-font-tiny)",
                fontFamily: "var(--frigate-font-mono)",
                letterSpacing: "0.05em",
              }}
            >
              [NO CREW ASSIGNED]
            </p>
          ) : (
            crew.map((member) => (
              <div
                key={member.player_id}
                style={{
                  padding: "6px 8px",
                  backgroundColor:
                    selectedCrew === member.player_id
                      ? "var(--frigate-surface-overlay)"
                      : "transparent",
                  border: "1px solid var(--frigate-border-base)",
                  cursor: "pointer",
                  transition: "background-color 50ms ease",
                }}
                onClick={() => setSelectedCrew(member.player_id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--frigate-font-small)",
                        fontFamily: "var(--frigate-font-mono)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {member.player_name || member.player_id}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--frigate-font-tiny)",
                        color: "var(--frigate-text-tertiary)",
                        fontFamily: "var(--frigate-font-mono)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {getRoleAbbreviation(member.role)}
                    </div>
                  </div>
                  <Badge
                    variant={
                      member.status === "active"
                        ? "success"
                        : member.status === "incapacitated"
                          ? "danger"
                          : "default"
                    }
                  >
                    {getStatusAbbreviation(member.status)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </Stack>
      </Panel>

      {/* Alerts Feed */}
      <div style={{ gridColumn: "span 2" }}>
        <Panel
          title={`ALERTS [${unacknowledgedAlerts.length.toString().padStart(2, "0")} UNACK]`}
          variant="default"
        >
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Stack direction="column" gap={1}>
              {alerts.length === 0 ? (
                <p
                  style={{
                    color: "var(--frigate-text-tertiary)",
                    fontSize: "var(--frigate-font-tiny)",
                    fontFamily: "var(--frigate-font-mono)",
                    letterSpacing: "0.05em",
                  }}
                >
                  [NO ALERTS]
                </p>
              ) : (
                alerts.slice(0, 10).map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: "6px 8px",
                      backgroundColor: alert.acknowledged
                        ? "transparent"
                        : "var(--frigate-surface-overlay)",
                      border: "1px solid",
                      borderColor: alert.acknowledged
                        ? "var(--frigate-border-muted)"
                        : `var(--frigate-${getSeverityColor(alert.severity)})`,
                      opacity: alert.acknowledged ? 0.5 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginBottom: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--frigate-font-mono)",
                              fontSize: "var(--frigate-font-tiny)",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                            }}
                          >
                            {getCategoryIcon(alert.category)}
                          </span>
                          <Badge
                            variant={
                              getSeverityColor(alert.severity) as "default" | "warning" | "danger"
                            }
                          >
                            {alert.severity === "critical"
                              ? "CRIT"
                              : alert.severity === "warning"
                                ? "WARN"
                                : "INFO"}
                          </Badge>
                          <span
                            style={{
                              fontSize: "var(--frigate-font-tiny)",
                              color: "var(--frigate-text-tertiary)",
                              fontFamily: "var(--frigate-font-mono)",
                            }}
                          >
                            {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "var(--frigate-font-small)",
                            fontFamily: "var(--frigate-font-mono)",
                            lineHeight: 1.4,
                          }}
                        >
                          {alert.message}
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          ACK
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </Stack>
          </div>
        </Panel>
      </div>

      {/* Captain's Log */}
      <Panel title="CAPTAIN'S LOG" variant="default">
        <Stack direction="column" gap={2}>
          <textarea
            value={logEntry}
            onChange={(e) => setLogEntry(e.target.value)}
            placeholder="[LOG ENTRY]"
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "8px",
              backgroundColor: "var(--frigate-surface-overlay)",
              border: "1px solid var(--frigate-border-base)",
              color: "var(--frigate-text-primary)",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
          <Button
            variant="primary"
            onClick={handleSubmitLog}
            disabled={!logEntry.trim()}
            style={{ width: "100%" }}
          >
            RECORD ENTRY
          </Button>
        </Stack>
      </Panel>
    </Grid>
  );
}
