/**
 * ShipNameInput - Ship name entry field for ship creation modal
 */
import React from "react";

export interface ShipNameInputProps {
  shipName: string;
  onChange: (name: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}

export function ShipNameInput({
  shipName,
  onChange,
  onKeyDown,
  disabled = false,
}: ShipNameInputProps) {
  return (
    <div>
      <label
        htmlFor="ship-name"
        style={{
          display: "block",
          marginBottom: "var(--frigate-space-2)",
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-small)",
          color: "var(--frigate-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        SHIP NAME:
      </label>
      <input
        id="ship-name"
        type="text"
        value={shipName}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="ENTER SHIP NAME"
        disabled={disabled}
        style={{
          width: "100%",
          padding: "var(--frigate-space-3)",
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-body)",
          color: "var(--frigate-text-primary)",
          backgroundColor: "var(--frigate-bg-surface)",
          border: "1px solid var(--frigate-border-base)",
          outline: "none",
          textTransform: "uppercase",
        }}
        autoFocus
      />
      <div
        style={{
          marginTop: "var(--frigate-space-2)",
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-muted)",
        }}
      >
        3-32 CHARACTERS
      </div>
    </div>
  );
}
