import React from "react";
import { Button } from "../components/Button";

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: "var(--frigate-space-2)",
    padding: "var(--frigate-space-2)",
    background: "var(--frigate-bg-surface)",
    borderBottom: "1px solid var(--frigate-primary)",
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-text-small)",
    color: "var(--frigate-text-primary)",
    transition: "background-color 0.15s ease",
  },
  moduleInfo: {
    flex: 1,
    minWidth: 200,
    display: "flex",
    flexDirection: "column",
    gap: "var(--frigate-space-1)",
  },
  slotType: {
    fontSize: "var(--frigate-text-tiny)",
    color: "var(--frigate-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  variantName: {
    fontWeight: "bold",
    color: "var(--frigate-text-primary)",
    fontSize: "var(--frigate-text-body)",
  },
  unconfigured: {
    color: "var(--frigate-warning)",
  },
  instanceId: {
    fontSize: "var(--frigate-text-tiny)",
    color: "var(--frigate-text-secondary)",
  },
  stats: {
    display: "flex",
    gap: "var(--frigate-space-3)",
    alignItems: "center",
    minWidth: 200,
    fontSize: "var(--frigate-text-small)",
  },
  stat: {
    color: "var(--frigate-text-secondary)",
    whiteSpace: "nowrap",
  },
  actions: {
    display: "flex",
    gap: "var(--frigate-space-1)",
  },
};

/**
 * Props for the ModuleInstanceRow component.
 *
 * @interface ModuleInstanceRowProps
 * @property {any} instance - Module instance object with id, slot_type, variant_id, etc.
 * @property {any} [variantInfo] - Optional variant information object
 * @property {(instanceId: string) => void} onEdit - Callback when [EDIT] button is clicked
 * @property {(instanceId: string) => void} onRemove - Callback when [REMOVE] button is clicked
 */
interface ModuleInstanceRowProps {
  instance: any;
  variantInfo?: any;
  onEdit: (instanceId: string) => void;
  onRemove: (instanceId: string) => void;
}

/**
 * ModuleInstanceRow - Display component for individual installed module instances.
 *
 * Renders a row showing an installed module with slot type, variant name (or unconfigured badge),
 * instance ID, key stats (PWR, HEAT, WEIGHT), and [EDIT]/[REMOVE] buttons. Includes hover
 * tooltip with full stats and keyboard navigation support (Tab to focus, Space to activate).
 *
 * @component
 * @example
 * ```tsx
 * <ModuleInstanceRow
 *   instance={{
 *     id: "inst-001",
 *     slot_type: "eng-001",
 *     variant_id: "var-eng-001"
 *   }}
 *   variantInfo={{
 *     name: "Standard Impulse Drive",
 *     power_draw: 50,
 *     heat_generation: 30,
 *     weight: 25
 *   }}
 *   onEdit={(id) => console.log("Edit:", id)}
 *   onRemove={(id) => console.log("Remove:", id)}
 * />
 * ```
 */
export const ModuleInstanceRow: React.FC<ModuleInstanceRowProps> = ({
  instance,
  variantInfo,
  onEdit,
  onRemove,
}) => {
  const instanceId = instance?.id || "[No ID]";
  const slotType = instance?.slot_type || "[Unknown Slot]";
  const variantName = variantInfo?.name || "[UNCONFIGURED]";

  // Extract key stats from variant info
  const powerDraw = variantInfo?.power_draw ?? 0;
  const heatGeneration = variantInfo?.heat_generation ?? 0;
  const weight = variantInfo?.weight ?? 0;

  const handleEditKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEdit(instanceId);
    }
  };

  const handleRemoveKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRemove(instanceId);
    }
  };

  return (
    <div
      style={styles.row}
      role="listitem"
      aria-label={`Module instance: ${variantName} in ${slotType}`}
      data-testid={`module-instance-row-${instanceId}`}
      title={`${slotType} | ${variantName} | PWR: ${powerDraw} | HEAT: ${heatGeneration} | WEIGHT: ${weight}`}
    >
      {/* Slot Type and Variant */}
      <div style={styles.moduleInfo}>
        <div style={styles.slotType}>{slotType}</div>
        <div
          style={{
            ...styles.variantName,
            ...(variantInfo ? {} : styles.unconfigured),
          }}
        >
          {variantName}
        </div>
        <div style={styles.instanceId}>ID: {instanceId}</div>
      </div>

      {/* Key Stats Display */}
      <div style={styles.stats}>
        <span style={styles.stat} aria-label={`Power draw: ${powerDraw}`}>
          PWR: <strong>{powerDraw}</strong>
        </span>
        <span style={styles.stat} aria-label={`Heat generation: ${heatGeneration}`}>
          HEAT: <strong>{heatGeneration}</strong>
        </span>
        <span style={styles.stat} aria-label={`Weight: ${weight}`}>
          WEIGHT: <strong>{weight}</strong>
        </span>
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <Button
          variant="primary"
          onClick={() => onEdit(instanceId)}
          onKeyDown={handleEditKey}
          aria-label={`Edit module instance ${instanceId}`}
          data-testid={`edit-instance-${instanceId}`}
        >
          [EDIT]
        </Button>
        <Button
          variant="danger"
          onClick={() => onRemove(instanceId)}
          onKeyDown={handleRemoveKey}
          aria-label={`Remove module instance ${instanceId}`}
          data-testid={`remove-instance-${instanceId}`}
        >
          [REMOVE]
        </Button>
      </div>
    </div>
  );
};

export type { ModuleInstanceRowProps };
