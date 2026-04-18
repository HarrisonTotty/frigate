import React from "react";
import { Stack, Panel } from "../layout";
import { Button, Badge } from "../components";
import { LoadingText } from "../loading";
import type { Blueprint } from "./BlueprintList";
import type { ShipClassSummary } from "../types/shipClass";

export interface ShipListProps {
  ships: Blueprint[];
  loading: boolean;
  availableShipClasses: ShipClassSummary[];
  onSelectShip: (id: string) => void;
}

function generateAbbreviation(name: string): string {
  const words = name.toUpperCase().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 6);
  return words
    .map((w) => w[0])
    .join("")
    .substring(0, 6);
}

/**
 * Empty state component - simple centered text
 */
function EmptyState(): React.ReactElement {
  return (
    <div
      style={{
        fontFamily: "var(--frigate-font-mono)",
        fontSize: "var(--frigate-font-small)",
        color: "var(--frigate-text-muted)",
        textAlign: "center",
        padding: "var(--frigate-space-6) var(--frigate-space-4)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      <div style={{ marginBottom: "var(--frigate-space-2)" }}>[ NO SHIPS AVAILABLE ]</div>
      <div style={{ fontSize: "var(--frigate-font-tiny)", opacity: 0.7 }}>
        CREATE OR JOIN A SHIP TO BEGIN
      </div>
    </div>
  );
}

/**
 * Ship row component
 */
function ShipRow({
  ship,
  classInfo,
  onSelect,
}: {
  ship: Blueprint;
  classInfo: ShipClassSummary | undefined;
  onSelect: () => void;
}): React.ReactElement {
  const crewCount = ship.crew?.length || 0;
  const maxCrew = (classInfo as { max_modules?: number })?.max_modules || 9;
  const isInMission = ship.crew?.some((c) => c.ready) || false;
  const classAbbrev = classInfo ? generateAbbreviation(classInfo.name) : ship.class.toUpperCase();

  return (
    <div
      style={{
        fontFamily: "var(--frigate-font-mono)",
        fontSize: "var(--frigate-font-small)",
        padding: "var(--frigate-space-2) var(--frigate-space-3)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--frigate-border-base)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--frigate-space-2)",
          }}
        >
          <span
            style={{
              color: "var(--frigate-text-primary)",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {ship.name}
          </span>
          {isInMission && (
            <Badge variant="warning" size="sm">
              [ACTIVE]
            </Badge>
          )}
        </div>
        <div
          style={{
            color: "var(--frigate-text-secondary)",
            marginTop: "var(--frigate-space-1)",
          }}
        >
          {classAbbrev} / CREW: {crewCount}/{maxCrew}
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={onSelect} disabled={isInMission}>
        JOIN
      </Button>
    </div>
  );
}

export function ShipList({
  ships,
  loading,
  availableShipClasses,
  onSelectShip,
}: ShipListProps): React.ReactElement {
  return (
    <Panel title="SHIP SELECTION" fullHeight>
      {loading ? (
        <LoadingText message="LOADING SHIPS..." />
      ) : ships.length === 0 ? (
        <EmptyState />
      ) : (
        <Stack gap={0}>
          {ships.map((ship) => {
            const classInfo = availableShipClasses.find((sc) => sc.id === ship.class);
            return (
              <ShipRow
                key={ship.id}
                ship={ship}
                classInfo={classInfo}
                onSelect={() => onSelectShip(ship.id)}
              />
            );
          })}
        </Stack>
      )}
    </Panel>
  );
}

export default ShipList;
