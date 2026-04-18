/**
 * Required Modules Checklist Component
 *
 * Displays a quick checklist of required modules for a ship blueprint,
 * showing which required modules are installed and which are missing.
 * Users can click on items to scroll to the corresponding module category.
 */

import React from "react";

import type { ModuleSlot, ModuleInstance } from "@frigate/api-client";

export interface RequiredModulesChecklistProps {
  /** List of all module slots from catalog */
  moduleSlots: ModuleSlot[];
  /** List of installed module instances */
  installedModules: ModuleInstance[];
  /** Callback when clicking on a required module */
  onModuleSlotClick?: (slotId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RequiredModulesChecklist Component
 *
 * Shows a compact checklist of required modules with visual indicators
 * for installed (✓) and missing (✗) modules. Clicking an item scrolls
 * to the corresponding module category.
 */
export function RequiredModulesChecklist({
  moduleSlots,
  installedModules,
  onModuleSlotClick,
  className = "",
}: RequiredModulesChecklistProps): React.ReactElement | null {
  // Get required slots
  const requiredSlots = React.useMemo(() => {
    return moduleSlots.filter((slot) => slot.required);
  }, [moduleSlots]);

  // Check which required slots are satisfied
  const installedSlotIds = React.useMemo(() => {
    return new Set(installedModules.map((m) => m.module_slot_id));
  }, [installedModules]);

  // Group by installed/missing
  const installed = requiredSlots.filter((slot) => installedSlotIds.has(slot.id));
  const missing = requiredSlots.filter((slot) => !installedSlotIds.has(slot.id));

  if (requiredSlots.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div>REQUIRED MODULES</div>
      {/* Installed required modules */}
      {installed.length > 0 && (
        <div>
          {installed.map((slot) => (
            <div
              key={slot.id}
              onClick={() => onModuleSlotClick?.(slot.id)}
              style={{ cursor: "pointer", color: "var(--frigate-success)" }}
            >
              ✓ {slot.name}
            </div>
          ))}
        </div>
      )}
      {/* Missing required modules */}
      {missing.length > 0 && (
        <div>
          {missing.map((slot) => (
            <div
              key={slot.id}
              onClick={() => onModuleSlotClick?.(slot.id)}
              style={{ cursor: "pointer", color: "var(--frigate-danger)" }}
            >
              ✗ {slot.name}
            </div>
          ))}
        </div>
      )}
      {/* Summary */}
      <div>
        {installed.length} / {requiredSlots.length} Required
      </div>
    </div>
  );
}
