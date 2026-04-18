/**
 * Tactical Console - Weapons and targeting
 *
 * Features:
 * - Target selection from contacts
 * - Weapon controls (fire, auto-fire)
 * - Ammunition and heat status
 */

import React, { useState } from "react";
import { Panel, Grid } from "../../layout";
import { Button, Badge, ProgressBar } from "../../components";
import { useAlert } from "../../alerts";
import type { RadarContact } from "../../charts";

export interface WeaponSystem {
  id: string;
  name: string;
  type: "energy" | "kinetic" | "missile";
  ready: boolean;
  heat: number; // 0-100%
  ammunition?: number;
  max_ammunition?: number;
  auto_fire: boolean;
}

export interface TacticalConsoleProps {
  /** Ship ID */
  shipId: string;
  /** API base URL */
  apiBaseUrl?: string;
  /** Available weapons */
  weapons?: WeaponSystem[];
  /** Detected contacts */
  contacts?: RadarContact[];
  /** Current target ID */
  targetId?: string;
  /** Callback when target selected */
  onTargetSelected?: (targetId: string) => void;
  /** Callback when weapon fired */
  onWeaponFired?: (weaponId: string) => void;
}

/**
 * Tactical Console Component
 */
export function TacticalConsole({
  shipId,
  apiBaseUrl = "http://localhost:8000",
  weapons = [],
  contacts = [],
  targetId,
  onTargetSelected,
  onWeaponFired,
}: TacticalConsoleProps) {
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const { success, danger } = useAlert();

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case "hostile":
        return "danger";
      case "friendly":
        return "success";
      case "neutral":
        return "default";
      default:
        return "default";
    }
  };

  const getContactTypeAbbr = (type: string): string => {
    switch (type) {
      case "hostile":
        return "HSTL";
      case "friendly":
        return "FRND";
      case "neutral":
        return "NEUT";
      case "unknown":
        return "UNKN";
      default:
        return type.substring(0, 4).toUpperCase();
    }
  };

  const getWeaponTypeAbbr = (type: string): string => {
    switch (type) {
      case "energy":
        return "ENRG";
      case "kinetic":
        return "KNTC";
      case "missile":
        return "MSSL";
      default:
        return type.substring(0, 4).toUpperCase();
    }
  };

  const abbreviateWeaponName = (name: string): string => {
    const abbr: Record<string, string> = {
      "Pulse Laser": "PLS-LSR",
      "Beam Laser": "BM-LSR",
      Railgun: "RAILGUN",
      "Mass Driver": "MS-DRV",
      "Missile Launcher": "MSL-LCH",
      Torpedo: "TORPEDO",
      "Point Defense": "PD-SYS",
    };
    return abbr[name] || name.toUpperCase().substring(0, 8);
  };

  const fireWeapon = async (weaponId: string) => {
    if (!targetId) {
      danger("No target selected");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/v1/ships/${shipId}/weapons/${weaponId}/fire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_id: targetId }),
      });

      if (response.ok) {
        success("Weapon fired");
        onWeaponFired?.(weaponId);
      } else {
        danger("Weapon fire failed");
      }
    } catch (error) {
      danger(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const toggleAutoFire = async (weaponId: string, enabled: boolean) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/v1/ships/${shipId}/weapons/${weaponId}/auto-fire`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        }
      );

      if (response.ok) {
        success(enabled ? "Auto-fire enabled" : "Auto-fire disabled");
      }
    } catch (error) {
      danger(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <Grid cols="1fr 2fr" gap={3} fullHeight>
      {/* Target Selection */}
      <Panel title="CONTACTS" variant="default">
        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
          {contacts.length === 0 ? (
            <p
              style={{
                color: "var(--frigate-text-tertiary)",
                fontSize: "var(--frigate-font-tiny)",
                fontFamily: "var(--frigate-font-mono)",
                letterSpacing: "0.05em",
              }}
            >
              [NO CONTACTS]
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-2)" }}
            >
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => onTargetSelected?.(contact.id)}
                  style={{
                    padding: "6px 8px",
                    backgroundColor:
                      targetId === contact.id ? "var(--frigate-surface-overlay)" : "transparent",
                    border: "1px solid",
                    borderColor:
                      targetId === contact.id
                        ? "var(--frigate-primary)"
                        : "var(--frigate-border-base)",
                    cursor: "pointer",
                    transition: "background-color 50ms ease",
                  }}
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
                          fontWeight: 700,
                          fontFamily: "var(--frigate-font-mono)",
                          fontSize: "var(--frigate-font-small)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {contact.label || contact.id}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--frigate-font-tiny)",
                          color: "var(--frigate-text-tertiary)",
                          fontFamily: "var(--frigate-font-mono)",
                        }}
                      >
                        RNG: {Math.sqrt(contact.x ** 2 + contact.y ** 2).toFixed(1)}k
                      </div>
                    </div>
                    <Badge
                      variant={
                        getContactTypeColor(contact.type || "unknown") as
                          | "default"
                          | "success"
                          | "danger"
                      }
                    >
                      {getContactTypeAbbr(contact.type || "unknown")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Weapons Control */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-3)" }}>
        {/* Target Info */}
        <Panel title="CURRENT TARGET" variant="default">
          {targetId ? (
            (() => {
              const target = contacts.find((c) => c.id === targetId);
              return target ? (
                <div>
                  <div
                    style={{
                      fontSize: "var(--frigate-font-body)",
                      fontWeight: 700,
                      fontFamily: "var(--frigate-font-mono)",
                      letterSpacing: "0.05em",
                      marginBottom: "var(--frigate-space-2)",
                    }}
                  >
                    {target.label || target.id}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--frigate-space-4)",
                      fontSize: "var(--frigate-font-small)",
                      fontFamily: "var(--frigate-font-mono)",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          color: "var(--frigate-text-tertiary)",
                          fontSize: "var(--frigate-font-tiny)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        RNG:{" "}
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        {Math.sqrt(target.x ** 2 + target.y ** 2).toFixed(1)}k
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          color: "var(--frigate-text-tertiary)",
                          fontSize: "var(--frigate-font-tiny)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        TYPE:{" "}
                      </span>
                      <Badge
                        variant={
                          getContactTypeColor(target.type || "unknown") as
                            | "default"
                            | "success"
                            | "danger"
                        }
                      >
                        {getContactTypeAbbr(target.type || "unknown")}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    color: "var(--frigate-text-tertiary)",
                    fontFamily: "var(--frigate-font-mono)",
                    fontSize: "var(--frigate-font-tiny)",
                    letterSpacing: "0.05em",
                  }}
                >
                  [TARGET NOT FOUND]
                </p>
              );
            })()
          ) : (
            <p
              style={{
                color: "var(--frigate-text-tertiary)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-tiny)",
                letterSpacing: "0.05em",
              }}
            >
              [NO TARGET]
            </p>
          )}
        </Panel>

        {/* Weapons Grid */}
        <Panel title="WEAPON SYSTEMS" variant="default">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--frigate-space-3)",
            }}
          >
            {weapons.map((weapon) => (
              <div
                key={weapon.id}
                onClick={() => setSelectedWeapon(weapon.id)}
                style={{
                  padding: "8px",
                  backgroundColor:
                    selectedWeapon === weapon.id
                      ? "var(--frigate-surface-overlay)"
                      : "var(--frigate-surface-base)",
                  border: "1px solid var(--frigate-border-base)",
                  cursor: "pointer",
                  transition: "background-color 50ms ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "var(--frigate-space-2)",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: "var(--frigate-font-mono)",
                      fontSize: "var(--frigate-font-small)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {abbreviateWeaponName(weapon.name)}
                  </span>
                  <Badge variant={weapon.ready ? "success" : "default"}>
                    {weapon.ready ? "RDY" : "CHRG"}
                  </Badge>
                </div>

                <div
                  style={{
                    fontSize: "var(--frigate-font-tiny)",
                    fontFamily: "var(--frigate-font-mono)",
                    color: "var(--frigate-text-tertiary)",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--frigate-space-2)",
                  }}
                >
                  TYPE: {getWeaponTypeAbbr(weapon.type)}
                </div>

                <div style={{ marginBottom: "var(--frigate-space-2)" }}>
                  <div
                    style={{
                      fontSize: "var(--frigate-font-tiny)",
                      color: "var(--frigate-text-tertiary)",
                      fontFamily: "var(--frigate-font-mono)",
                      letterSpacing: "0.05em",
                      marginBottom: "4px",
                    }}
                  >
                    HEAT: {weapon.heat.toString().padStart(3, " ")}%
                  </div>
                  <ProgressBar
                    value={weapon.heat}
                    max={100}
                    variant={weapon.heat > 80 ? "danger" : weapon.heat > 50 ? "warning" : "success"}
                  />
                </div>

                {weapon.ammunition !== undefined && (
                  <div
                    style={{
                      fontSize: "var(--frigate-font-tiny)",
                      fontFamily: "var(--frigate-font-mono)",
                      letterSpacing: "0.05em",
                      marginBottom: "var(--frigate-space-2)",
                    }}
                  >
                    <span style={{ color: "var(--frigate-text-tertiary)" }}>AMMO: </span>
                    <span style={{ fontWeight: 700 }}>
                      {weapon.ammunition.toString().padStart(3, " ")}/{weapon.max_ammunition}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "var(--frigate-space-2)",
                    display: "flex",
                    gap: "var(--frigate-space-2)",
                  }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fireWeapon(weapon.id);
                    }}
                    disabled={!weapon.ready || !targetId}
                    style={{ flex: 1 }}
                  >
                    FIRE
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAutoFire(weapon.id, !weapon.auto_fire);
                    }}
                    style={{ flex: 1 }}
                  >
                    {weapon.auto_fire ? "AUTO:ON" : "AUTO:OFF"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Grid>
  );
}
