/**
 * Auto-Setup Overlay
 *
 * Terminal-style progress display during CLI-driven auto-setup.
 * Shows step-by-step progress and error handling.
 */

import React from "react";
import type { AutoSetupState, CliArgs, StepDisplayInfo } from "../types/cli";

export interface AutoSetupOverlayProps {
  /** Current auto-setup state */
  state: AutoSetupState;
  /** CLI arguments for display */
  cliArgs: CliArgs | null;
  /** Called when user clicks "Continue Manually" */
  onContinueManually?: () => void;
}

/** Map steps to display info */
function getStepDisplayInfo(state: AutoSetupState, cliArgs: CliArgs | null): StepDisplayInfo[] {
  const { step, progress } = state;

  const steps: StepDisplayInfo[] = [];

  // Connection step (always present)
  const connectTarget = cliArgs?.connect || "server";
  if (step === "connecting") {
    steps.push({ label: `Connecting to ${connectTarget}`, status: "active" });
  } else if (progress.connected) {
    steps.push({ label: `Connected to ${connectTarget}`, status: "complete" });
  } else if (step === "error" && !progress.connected) {
    steps.push({ label: `Connecting to ${connectTarget}`, status: "error" });
  } else {
    steps.push({ label: `Connect to ${connectTarget}`, status: "pending" });
  }

  // Player step (only if --user provided)
  if (cliArgs?.user) {
    const playerName = cliArgs.user;
    if (step === "selecting-player") {
      steps.push({ label: `Selecting player: ${playerName}`, status: "active" });
    } else if (step === "creating-player") {
      steps.push({ label: `Creating player: ${playerName}`, status: "active" });
    } else if (progress.playerId) {
      steps.push({ label: `Player selected: ${playerName}`, status: "complete" });
    } else if (step === "error" && progress.connected && !progress.playerId) {
      steps.push({ label: `Player: ${playerName}`, status: "error" });
    } else if (progress.connected) {
      steps.push({ label: `Select player: ${playerName}`, status: "pending" });
    }
  }

  // Team step (only if --team provided)
  if (cliArgs?.team) {
    const teamName = cliArgs.team;
    if (step === "selecting-team") {
      steps.push({ label: `Selecting team: ${teamName}`, status: "active" });
    } else if (step === "creating-team") {
      steps.push({
        label: `Creating team: ${teamName}`,
        detail: cliArgs.faction ? `faction: ${cliArgs.faction}` : undefined,
        status: "active",
      });
    } else if (progress.teamId) {
      steps.push({ label: `Team selected: ${teamName}`, status: "complete" });
    } else if (step === "error" && progress.playerId && !progress.teamId) {
      steps.push({ label: `Team: ${teamName}`, status: "error" });
    } else if (progress.playerId) {
      steps.push({ label: `Select team: ${teamName}`, status: "pending" });
    }
  }

  // Ship step (only if --ship provided)
  if (cliArgs?.ship) {
    const shipName = cliArgs.ship;
    if (step === "selecting-ship") {
      steps.push({ label: `Selecting ship: ${shipName}`, status: "active" });
    } else if (step === "creating-ship") {
      steps.push({
        label: `Creating ship: ${shipName}`,
        detail: cliArgs.ship_class ? `class: ${cliArgs.ship_class}` : undefined,
        status: "active",
      });
    } else if (progress.blueprintId) {
      steps.push({ label: `Ship selected: ${shipName}`, status: "complete" });
    } else if (step === "error" && progress.teamId && !progress.blueprintId) {
      steps.push({ label: `Ship: ${shipName}`, status: "error" });
    } else if (progress.teamId) {
      steps.push({ label: `Select ship: ${shipName}`, status: "pending" });
    }
  }

  return steps;
}

/** Status indicator character */
function StatusIndicator({ status }: { status: StepDisplayInfo["status"] }) {
  switch (status) {
    case "complete":
      return <span style={{ color: "var(--frigate-success, #00ff00)" }}>[X]</span>;
    case "active":
      return <span style={{ color: "var(--frigate-text-primary, #ffffff)" }}>[~]</span>;
    case "error":
      return <span style={{ color: "var(--frigate-error, #ff0000)" }}>[!]</span>;
    case "pending":
    default:
      return <span style={{ color: "var(--frigate-text-secondary, #808080)" }}>[ ]</span>;
  }
}

/** Step line component */
function StepLine({ info }: { info: StepDisplayInfo }) {
  const textColor =
    info.status === "pending"
      ? "var(--frigate-text-secondary, #808080)"
      : "var(--frigate-text-primary, #ffffff)";

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
      <StatusIndicator status={info.status} />
      <span style={{ color: textColor }}>{info.label}</span>
      {info.detail && (
        <span style={{ color: "var(--frigate-text-secondary, #808080)", fontSize: "0.85em" }}>
          ({info.detail})
        </span>
      )}
      {info.status === "active" && (
        <span
          style={{
            color: "var(--frigate-text-primary, #ffffff)",
            animation: "blink 1s step-end infinite",
          }}
        >
          _
        </span>
      )}
    </div>
  );
}

/**
 * Terminal-style overlay shown during auto-setup
 */
export function AutoSetupOverlay({ state, cliArgs, onContinueManually }: AutoSetupOverlayProps) {
  const steps = getStepDisplayInfo(state, cliArgs);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--frigate-bg-primary, #0a0a0a)",
        fontFamily: 'var(--frigate-font-mono, "IBM Plex Mono", monospace)',
        fontSize: "14px",
        lineHeight: 1.6,
        padding: "2rem",
      }}
    >
      <style>
        {`
          @keyframes blink {
            50% { opacity: 0; }
          }
        `}
      </style>

      <div
        style={{
          maxWidth: "600px",
          width: "100%",
        }}
      >
        {/* Header */}
        <div
          style={{
            color: "var(--frigate-text-primary, #ffffff)",
            marginBottom: "1.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          INITIALIZING SESSION...
        </div>

        {/* Progress steps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {steps.map((info, index) => (
            <StepLine key={index} info={info} />
          ))}
        </div>

        {/* Error message */}
        {state.step === "error" && state.error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "var(--frigate-bg-secondary, #1a1a1a)",
              border: "1px solid var(--frigate-error, #ff0000)",
              color: "var(--frigate-error, #ff0000)",
            }}
          >
            <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>ERROR</div>
            <div style={{ color: "var(--frigate-text-primary, #ffffff)" }}>{state.error}</div>
          </div>
        )}

        {/* Continue manually button */}
        {state.step === "error" && onContinueManually && (
          <div style={{ marginTop: "1.5rem" }}>
            <button
              onClick={onContinueManually}
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--frigate-text-secondary, #808080)",
                color: "var(--frigate-text-primary, #ffffff)",
                padding: "0.5rem 1rem",
                fontFamily: "inherit",
                fontSize: "inherit",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--frigate-text-primary, #ffffff)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--frigate-text-secondary, #808080)";
              }}
            >
              Continue Manually
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
