import React from "react";
import { LoadingText } from "../loading";
import { ShipClassCard } from "../shipclass";
import type { ShipClassSummary } from "../types/shipClass";

interface GridProps {
  classes: ShipClassSummary[];
  isLoading: boolean;
  selectedClassId: string | null;
  onCardClick: (id: string) => void;
}

export function ShipClassGrid({ classes, isLoading, selectedClassId, onCardClick }: GridProps) {
  if (isLoading) {
    return (
      <div style={{ padding: "var(--frigate-space-8)" }}>
        <LoadingText message="LOADING SHIP CLASSES..." />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div
        style={{
          padding: "var(--frigate-space-8)",
          textAlign: "center",
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-small)",
          color: "var(--frigate-text-muted)",
        }}
      >
        NO SHIP CLASSES MATCH FILTERS
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: selectedClassId ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "var(--frigate-space-3)",
      }}
    >
      {classes.map((shipClass) => (
        <ShipClassCard
          key={shipClass.id}
          shipClass={shipClass}
          isSelected={shipClass.id === selectedClassId}
          onClick={() => onCardClick(shipClass.id)}
        />
      ))}
    </div>
  );
}
