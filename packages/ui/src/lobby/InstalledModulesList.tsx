import React from "react";
import type { ModuleInstance, ModuleSlot } from "@frigate/api-client";
import { BOX_DRAWING } from "../constants";
import { ModuleTooltip, type TooltipStatRow } from "../components/ModuleTooltip";

/**
 * Installed Modules List Props
 */
export interface InstalledModulesListProps {
  /** Array of installed module instances */
  instances: ModuleInstance[];
  /** Maximum modules allowed on the ship */
  maxModules?: number;
  /** Module slots by ID for reference data */
  moduleSlots?: Record<string, ModuleSlot>;
  /** Callback when user clicks select type button to open variant modal */
  onSelectType?: (instanceId: string, slotType: ModuleSlot) => void;
  /** Callback when user clicks remove button */
  onRemove?: (instanceId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Module Instance Row Component
 *
 * Displays a single installed module instance with its slot type and variant status.
 * Shows [SELECT TYPE] button for slots with variants, and [REMOVE] button.
 */
interface ModuleInstanceRowProps {
  instance: ModuleInstance;
  index: number;
  isLast: boolean;
  slotType?: ModuleSlot;
  onSelectType: (instanceId: string, slotType: ModuleSlot) => void;
  onRemove: (instanceId: string) => void;
}

function ModuleInstanceRow({
  instance,
  index,
  isLast,
  slotType,
  onSelectType,
  onRemove,
}: ModuleInstanceRowProps) {
  // hasVariants is normalized by useCatalog - no need for fallback to legacy field name
  const hasVariants = slotType?.hasVariants ?? false;
  const variantStatus = instance.variant_id ? instance.variant_id : "[UNCONFIGURED]";
  const slotName = slotType?.name ?? instance.module_slot_id;
  const variantWarning = !instance.variant_id && hasVariants;

  // Build tooltip stats from instance data
  // Instance may have optional numeric fields from the API
  const inst = instance as unknown as Record<string, unknown>;
  const tooltipStats: TooltipStatRow[] = [];

  if (typeof inst.cost === "number") {
    tooltipStats.push({ label: "COST", value: inst.cost, unit: "cr" });
  }
  if (typeof inst.build_points === "number") {
    tooltipStats.push({ label: "BUILD PTS", value: inst.build_points, unit: "BP" });
  }
  if (typeof inst.weight === "number") {
    tooltipStats.push({ label: "WEIGHT", value: inst.weight, unit: "t" });
  }
  if (typeof inst.power === "number") {
    tooltipStats.push({ label: "POWER", value: inst.power, unit: "kW" });
  }
  if (typeof inst.heat === "number") {
    tooltipStats.push({ label: "HEAT", value: inst.heat, unit: "kWth" });
  }
  if (typeof inst.hp === "number") {
    tooltipStats.push({ label: "HP", value: inst.hp });
  }

  // Build tooltip tags
  const tooltipTags: string[] = [];
  if (variantWarning) tooltipTags.push("[UNCONFIGURED]");
  if (hasVariants && instance.variant_id) tooltipTags.push("[CONFIGURED]");

  return (
    <ModuleTooltip
      title={slotName}
      subtitle={instance.variant_id || undefined}
      description={slotType?.description || undefined}
      stats={tooltipStats.length > 0 ? tooltipStats : undefined}
      tags={tooltipTags.length > 0 ? tooltipTags : undefined}
      position="left"
      delay={300}
    >
      <div
        key={instance.id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--frigate-space-2)",
          borderBottom: !isLast ? "1px dashed var(--frigate-border-base)" : undefined,
          fontSize: "var(--frigate-font-small)",
          fontFamily: "var(--frigate-font-mono)",
        }}
        role="listitem"
        aria-label={`Module ${index + 1}: ${slotName} - ${variantStatus}`}
      >
        {/* Left: Module Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--frigate-space-1)",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", gap: "var(--frigate-space-2)" }}>
            <span style={{ fontWeight: 700, color: "var(--frigate-text-primary)" }}>
              {slotName}
            </span>
            {variantWarning && (
              <span style={{ color: "var(--frigate-warning)", fontWeight: 700 }}>
                [UNCONFIGURED]
              </span>
            )}
            {!variantWarning && instance.variant_id && (
              <span
                style={{
                  color: "var(--frigate-text-secondary)",
                  fontSize: "var(--frigate-font-tiny)",
                }}
              >
                {instance.variant_id}
              </span>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "var(--frigate-space-2)",
            marginLeft: "var(--frigate-space-3)",
          }}
        >
          {hasVariants && (
            <button
              style={{
                background: "none",
                border: "none",
                color: "var(--frigate-primary)",
                fontWeight: 700,
                padding: 0,
                cursor: "pointer",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-small)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
              onClick={() => slotType && onSelectType(instance.id, slotType)}
              aria-label={`Select variant for ${slotName}`}
            >
              [SELECT]
            </button>
          )}
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--frigate-danger)",
              fontWeight: 700,
              padding: 0,
              cursor: "pointer",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
            onClick={() => onRemove(instance.id)}
            aria-label={`Remove module ${instance.id}`}
          >
            [REMOVE]
          </button>
        </div>
      </div>
    </ModuleTooltip>
  );
}

/**
 * Module List Header Component
 *
 * Displays the list header with title and count indicator.
 */
interface ModuleListHeaderProps {
  count: number;
  maxModules: number;
}

function ModuleListHeader({ count, maxModules }: ModuleListHeaderProps) {
  const borderLine = `${BOX_DRAWING.TOP_LEFT}${BOX_DRAWING.HORIZONTAL.repeat(50)}${BOX_DRAWING.TOP_RIGHT}`;

  return (
    <div>
      <div
        style={{
          fontWeight: 800,
          fontSize: "var(--frigate-font-heading)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "var(--frigate-space-2)",
        }}
      >
        INSTALLED MODULES
      </div>
      <div
        style={{
          fontSize: "var(--frigate-font-tiny)",
          color: "var(--frigate-text-secondary)",
          marginBottom: "var(--frigate-space-2)",
        }}
      >
        COUNT: {count} / {maxModules}
      </div>
      <pre
        style={{
          margin: 0,
          color: "var(--frigate-primary)",
          fontWeight: 700,
          fontSize: "var(--frigate-font-tiny)",
          fontFamily: "var(--frigate-font-mono)",
          marginBottom: "var(--frigate-space-2)",
        }}
      >
        {borderLine}
      </pre>
    </div>
  );
}

/**
 * Module List Empty State Component
 *
 * Displays when no modules are installed.
 */
function ModuleListEmpty() {
  return (
    <div
      style={{
        padding: "var(--frigate-space-3) var(--frigate-space-2)",
        color: "var(--frigate-text-muted)",
        fontStyle: "italic",
        textAlign: "center",
        fontSize: "var(--frigate-font-small)",
      }}
    >
      NO MODULES INSTALLED
    </div>
  );
}

/**
 * Installed Modules List Component
 *
 * Displays all currently installed module instances on the ship blueprint.
 * Each instance shows its slot type and variant selection status.
 *
 * Features:
 * - [SELECT TYPE] button to choose module variants (when available)
 * - [REMOVE] button to delete module instances
 * - ASCII-style card borders for each module
 * - Visual feedback for unconfigured modules
 * - Responsive layout with proper spacing
 *
 * @example
 * ```tsx
 * <InstalledModulesList
 *   instances={modules}
 *   maxModules={12}
 *   moduleSlots={slots}
 *   onSelectType={(id, slot) => openCatalog(id, slot)}
 *   onRemove={(id) => deleteModule(id)}
 * />
 * ```
 */
export function InstalledModulesList({
  instances,
  maxModules = 12,
  moduleSlots = {},
  onSelectType,
  onRemove,
  className = "",
}: InstalledModulesListProps) {
  const borderBottom = `${BOX_DRAWING.BOTTOM_LEFT}${BOX_DRAWING.HORIZONTAL.repeat(50)}${BOX_DRAWING.BOTTOM_RIGHT}`;
  const isOverLimit = instances.length > maxModules;

  return (
    <div
      className={className}
      style={{
        fontFamily: "var(--frigate-font-mono)",
        backgroundColor: "var(--frigate-bg-surface)",
        color: "var(--frigate-text-primary)",
        borderRadius: 0,
        boxShadow: "none",
        border: "1px solid var(--frigate-border-base)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      role="list"
      aria-label="Installed Modules"
    >
      {/* Header */}
      <div
        style={{
          padding: "var(--frigate-space-3)",
          borderBottom: "1px solid var(--frigate-border-base)",
        }}
      >
        <ModuleListHeader count={instances.length} maxModules={maxModules} />
      </div>

      {/* Scrollable Content Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--frigate-space-3)" }}>
        {instances.length === 0 ? (
          <ModuleListEmpty />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--frigate-space-1)" }}>
            {instances.map((inst, idx) => (
              <ModuleInstanceRow
                key={inst.id}
                instance={inst}
                index={idx}
                isLast={idx === instances.length - 1}
                slotType={moduleSlots[inst.module_slot_id]}
                onSelectType={onSelectType || (() => {})}
                onRemove={onRemove || (() => {})}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "var(--frigate-space-3)",
          borderTop: "1px solid var(--frigate-border-base)",
        }}
      >
        <pre
          style={{
            margin: 0,
            color: "var(--frigate-primary)",
            fontWeight: 700,
            fontSize: "var(--frigate-font-tiny)",
            fontFamily: "var(--frigate-font-mono)",
            marginBottom: "var(--frigate-space-2)",
          }}
        >
          {borderBottom}
        </pre>

        {/* Warnings */}
        {isOverLimit && (
          <div
            style={{
              color: "var(--frigate-danger)",
              fontWeight: 700,
              fontSize: "var(--frigate-font-small)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "var(--frigate-space-2)",
            }}
          >
            [WARNING] MODULE LIMIT EXCEEDED ({instances.length}/{maxModules})
          </div>
        )}

        {/* Keyboard Hints */}
        <div
          style={{
            fontSize: "var(--frigate-font-tiny)",
            color: "var(--frigate-text-muted)",
            letterSpacing: "0.05em",
          }}
        >
          [KEYS: TAB NAV | ENTER: SELECT TYPE | DEL: REMOVE]
        </div>
      </div>
    </div>
  );
}

export default InstalledModulesList;
