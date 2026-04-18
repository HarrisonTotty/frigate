import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { ModuleSlot } from "@frigate/api-client";
import ModuleSlotBrowser from "./ModuleSlotBrowser";
import { ShipBlueprintCanvas } from "./ShipBlueprintView";
import ShipStatsPanel, { ShipStats } from "./ShipStatsPanel";
import { calculateShipProfile } from "./calculateShipProfile";
import { ModuleCatalog } from "../modules/ModuleCatalog";
import { useUiBlueprint } from "../hooks/useUiBlueprint";
import { useShipClass } from "../hooks/useShipClass";
import { useCatalog } from "../hooks/useCatalog";
import { useLobbyWorkflowStore } from "./lobbyWorkflowStore";
import { ConfirmationModal } from "../modals";
import { useAlertSafe } from "../alerts";

/**
 * Schematic module slot assignment
 */
export interface SchematicModule {
  slot: string;
  module: string | null;
}

/**
 * Ship schematic data structure
 */
export interface SchematicData {
  version: number;
  name: string;
  ship_class: string;
  modules: SchematicModule[];
}

/**
 * Ship Design Workspace Props
 */
export interface ShipDesignWorkspaceProps {
  /** API base URL */
  apiUrl: string;
  /** Blueprint ID for this design session */
  blueprintId: string;
  /** Optional CSS class name */
  className?: string;
  /** Optional player context */
  player?: unknown;
  /** Optional team context */
  team?: { credits?: number } & Record<string, unknown>;
  /** Callback when user clicks back/exit */
  onBack?: () => void;
  /** Callback when user disconnects */
  onDisconnect?: () => void;
  /** Callback to save current design as schematic file */
  onSaveSchematic?: (schematic: SchematicData) => Promise<boolean>;
  /** Callback to load schematic from file - returns schematic or null if cancelled */
  onLoadSchematic?: () => Promise<SchematicData | null>;
  /** Whether a schematic file operation is in progress */
  schematicLoading?: boolean;
}

/**
 * Workspace Header Component
 *
 * Displays the workspace title and quick actions.
 */
interface WorkspaceHeaderProps {
  blueprintName?: string;
  onBack?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  saveDisabled?: boolean;
  schematicLoading?: boolean;
}

function WorkspaceHeader({
  blueprintName = "SHIP BLUEPRINT",
  onBack,
  onSave,
  onLoad,
  saveDisabled,
  schematicLoading,
}: WorkspaceHeaderProps) {
  const buttonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "var(--frigate-text-secondary)",
    fontFamily: "var(--frigate-font-mono)",
    fontSize: "var(--frigate-font-small)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    cursor: "pointer",
    textDecoration: "underline",
  };

  const disabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: "not-allowed",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--frigate-space-3)",
        borderBottom: "1px solid var(--frigate-border-base)",
        backgroundColor: "var(--frigate-bg-base)",
        marginBottom: "var(--frigate-space-3)",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: "var(--frigate-font-display)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--frigate-text-primary)",
        }}
      >
        {blueprintName}
      </div>
      <div style={{ display: "flex", gap: "var(--frigate-space-3)" }}>
        {onLoad && (
          <button
            onClick={onLoad}
            disabled={schematicLoading}
            style={schematicLoading ? disabledStyle : buttonStyle}
            aria-label="Load schematic from file"
          >
            {schematicLoading ? "[LOADING...]" : "[LOAD]"}
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            disabled={saveDisabled || schematicLoading}
            style={saveDisabled || schematicLoading ? disabledStyle : buttonStyle}
            aria-label="Save schematic to file"
          >
            {schematicLoading ? "[SAVING...]" : "[SAVE]"}
          </button>
        )}
        {onBack && (
          <button onClick={onBack} style={buttonStyle} aria-label="Go back">
            [BACK]
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Workspace Footer Component
 *
 * Displays workspace-wide keyboard hints and status.
 */
interface WorkspaceFooterProps {
  hasSchematicSupport?: boolean;
}

function WorkspaceFooter({ hasSchematicSupport }: WorkspaceFooterProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "var(--frigate-space-2) var(--frigate-space-3)",
        borderTop: "1px solid var(--frigate-border-base)",
        backgroundColor: "var(--frigate-bg-base)",
        marginTop: "var(--frigate-space-3)",
        fontSize: "var(--frigate-font-tiny)",
        color: "var(--frigate-text-muted)",
      }}
    >
      <div style={{ letterSpacing: "0.05em" }}>[WORKSPACE: DESIGN PHASE | STATUS: ACTIVE]</div>
      <div style={{ letterSpacing: "0.05em" }}>
        {hasSchematicSupport
          ? "[ALT+S: SAVE SCHEMATIC | ALT+L: LOAD SCHEMATIC | ALT+C: CANCEL | F1: HELP]"
          : "[ALT+S: SAVE | ALT+C: CANCEL | F1: HELP]"}
      </div>
    </div>
  );
}

/**
 * Ship Design Workspace Component
 *
 * Main design interface for ship blueprints with three-column layout:
 *
 * **Left Column**: Module Slot Browser
 * - Browse available module slots by category
 * - View build points allocation
 * - Add modules to design with [ADD] buttons
 *
 * **Center Column**: Installed Modules List
 * - View all currently installed modules
 * - Edit module variants with [EDIT]
 * - Remove modules with [REMOVE]
 * - See module count and limit status
 *
 * **Right Column**: Ship Statistics Panel
 * - View aggregated ship statistics (cost, weight, HP, power, heat)
 * - Monitor build points usage with visual progress
 * - See constraint warnings if limits exceeded
 *
 * **Modal**: Module Catalog
 * - Select and configure module variants
 * - View variant details and specifications
 * - Confirm selections and return to main workspace
 *
 * Features:
 * - Responsive three-column layout with fixed widths
 * - Real-time stats updates as modules are added/removed
 * - Keyboard navigation throughout
 * - Technical aesthetic with monospace typography
 * - Accessible design with proper ARIA labels
 *
 * @example
 * ```tsx
 * <ShipDesignWorkspace
 *   apiUrl="http://localhost:3000"
 *   blueprintId="bp123"
 *   onBack={() => navigate('/ships')}
 * />
 * ```
 */
export function ShipDesignWorkspace({
  apiUrl,
  blueprintId,
  className = "",
  team,
  onBack,
  onSaveSchematic,
  onLoadSchematic,
  schematicLoading = false,
}: ShipDesignWorkspaceProps) {
  const { blueprint, addInstance, removeInstance, setVariant, ensureOpen } = useUiBlueprint({
    blueprintId,
    apiBase: apiUrl,
  });
  const { slotsList, slotsById, variantsById, getModuleSlots, getModuleVariant } =
    useCatalog(apiUrl);
  const { goBack, registerSchematic, pendingSchematic, clearPendingSchematic } =
    useLobbyWorkflowStore();
  const alert = useAlertSafe();

  // Confirmation modal state for loading schematic
  const [loadConfirmOpen, setLoadConfirmOpen] = useState(false);
  const [pendingLoadSchematic, setPendingLoadSchematic] = useState<SchematicData | null>(null);

  // Fetch the full blueprint from API to get shipClass
  const [blueprintData, setBlueprintData] = useState<{
    id: string;
    name: string;
    class: string;
    team_id: string;
  } | null>(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [blueprintError, setBlueprintError] = useState<Error | null>(null);

  const fetchBlueprintData = async () => {
    if (!blueprintId || !apiUrl) return;

    setBlueprintLoading(true);
    setBlueprintError(null);

    try {
      const response = await fetch(`${apiUrl}/v1/blueprints/${blueprintId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setBlueprintData(data);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error("Failed to fetch blueprint:", errorObj.message);
      setBlueprintError(errorObj);
    } finally {
      setBlueprintLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprintData();
  }, [blueprintId, apiUrl]);

  // Use the useShipClass hook to fetch ship class details using the class from the blueprint
  const {
    shipClass,
    loading: shipClassLoading,
    error: shipClassError,
    refetch: refetchShipClass,
  } = useShipClass(blueprintData?.class, apiUrl);
  useEffect(() => {
    ensureOpen({ id: blueprintId, instances: [] });
  }, [blueprintId, ensureOpen]);

  // Load module slots catalog when component mounts
  useEffect(() => {
    getModuleSlots();
  }, [getModuleSlots]);

  // Handle back button - use workflow store first, then fallback to onBack callback
  const handleBackClick = () => {
    goBack();
    if (onBack) onBack();
  };

  // Handle register schematic - transition to inventory workspace
  const handleRegisterSchematic = () => {
    // Use the blueprint ID as the schematic ID for now
    // In a full implementation, this might create a new schematic record on the server
    console.log(
      "[ShipDesignWorkspace] handleRegisterSchematic called with blueprintId:",
      blueprintId
    );
    registerSchematic(blueprintId);
    console.log("[ShipDesignWorkspace] registerSchematic completed");
  };

  // Blueprint instances are the source of truth - convert to mutable array
  const instances = Array.from(blueprint?.instances ?? []);

  // Build schematic from current blueprint state
  const buildSchematicFromBlueprint = useCallback((): SchematicData | null => {
    if (!blueprintData) return null;

    const modules: SchematicModule[] = instances.map((instance) => ({
      slot: instance.module_slot_id,
      module: instance.variant_id || null,
    }));

    return {
      version: 1,
      name: blueprintData.name,
      ship_class: blueprintData.class,
      modules,
    };
  }, [blueprintData, instances]);

  // Apply loaded schematic to current blueprint
  const applySchematicToBlueprint = useCallback(
    async (schematic: SchematicData): Promise<{ success: boolean; warnings: string[] }> => {
      const warnings: string[] = [];

      // Note: When loading in design workspace, name and ship_class are IGNORED
      // Only modules are applied to the current blueprint

      // Validate schematic version
      if (schematic.version !== 1) {
        const msg = `Unsupported schematic version: ${schematic.version}`;
        console.error("[ShipDesignWorkspace]", msg);
        return { success: false, warnings: [msg] };
      }

      // Check for ship class mismatch (warning only, still proceed)
      if (blueprintData && schematic.ship_class !== blueprintData.class) {
        warnings.push(
          `Schematic is for ship class '${schematic.ship_class}', but current blueprint is '${blueprintData.class}'. Some modules may not be compatible.`
        );
      }

      // Clear existing modules first
      for (const instance of instances) {
        try {
          await removeInstance(instance.id);
        } catch (err) {
          console.warn(
            "[ShipDesignWorkspace] Failed to remove instance during schematic load:",
            err
          );
        }
      }

      // Add modules from schematic, tracking any that fail
      let addedCount = 0;
      const failedSlots: string[] = [];

      for (const mod of schematic.modules) {
        // Validate slot exists in catalog
        const slotExists = slotsById[mod.slot];
        if (!slotExists) {
          failedSlots.push(mod.slot);
          console.warn(`[ShipDesignWorkspace] Unknown module slot '${mod.slot}' - skipping`);
          continue;
        }

        try {
          await addInstance(mod.slot, mod.module);
          addedCount++;

          // Fetch variant details into the catalog cache so stats can be calculated
          if (mod.module) {
            try {
              await getModuleVariant(mod.slot, mod.module);
            } catch (variantErr) {
              console.warn(
                `[ShipDesignWorkspace] Failed to fetch variant '${mod.module}' for slot '${mod.slot}':`,
                variantErr
              );
            }
          }
        } catch (err) {
          failedSlots.push(mod.slot);
          console.warn(`[ShipDesignWorkspace] Failed to add module slot '${mod.slot}':`, err);
        }
      }

      // Report failed slots
      if (failedSlots.length > 0) {
        warnings.push(
          `${failedSlots.length} module(s) could not be loaded: ${failedSlots.join(", ")}`
        );
      }

      console.log(
        `[ShipDesignWorkspace] Applied schematic: ${addedCount}/${schematic.modules.length} modules loaded`
      );

      return { success: true, warnings };
    },
    [instances, removeInstance, addInstance, slotsById, blueprintData, getModuleVariant]
  );

  // Handle save schematic button
  const handleSaveSchematic = useCallback(async () => {
    if (!onSaveSchematic) return;

    const schematic = buildSchematicFromBlueprint();
    if (schematic) {
      const saved = await onSaveSchematic(schematic);
      if (saved) {
        console.log("[ShipDesignWorkspace] Schematic saved successfully");
      }
    }
  }, [buildSchematicFromBlueprint, onSaveSchematic]);

  // Handle load schematic button - with confirmation if modules exist
  const handleLoadSchematic = useCallback(async () => {
    if (!onLoadSchematic) return;

    const schematic = await onLoadSchematic();
    if (schematic) {
      // If there are existing modules, show confirmation dialog
      if (instances.length > 0) {
        setPendingLoadSchematic(schematic);
        setLoadConfirmOpen(true);
      } else {
        // No modules to replace, apply directly
        const result = await applySchematicToBlueprint(schematic);
        if (!result.success) {
          alert.danger("SCHEMATIC LOAD FAILED", result.warnings[0]);
        } else if (result.warnings.length > 0) {
          // Show warnings but operation succeeded
          for (const warning of result.warnings) {
            alert.warning("SCHEMATIC WARNING", warning);
          }
          alert.success("SCHEMATIC LOADED", `Loaded "${schematic.name}" configuration`);
        } else {
          alert.success("SCHEMATIC LOADED", `Loaded "${schematic.name}" configuration`);
        }
      }
    }
  }, [onLoadSchematic, applySchematicToBlueprint, instances.length, alert]);

  // Confirm loading schematic (replaces existing modules)
  const handleConfirmLoadSchematic = useCallback(async () => {
    if (!pendingLoadSchematic) return;

    const result = await applySchematicToBlueprint(pendingLoadSchematic);
    if (!result.success) {
      alert.danger("SCHEMATIC LOAD FAILED", result.warnings[0]);
    } else if (result.warnings.length > 0) {
      // Show warnings but operation succeeded
      for (const warning of result.warnings) {
        alert.warning("SCHEMATIC WARNING", warning);
      }
      alert.success("SCHEMATIC LOADED", `Loaded "${pendingLoadSchematic.name}" configuration`);
    } else {
      alert.success("SCHEMATIC LOADED", `Loaded "${pendingLoadSchematic.name}" configuration`);
    }

    setPendingLoadSchematic(null);
    setLoadConfirmOpen(false);
  }, [pendingLoadSchematic, applySchematicToBlueprint, alert]);

  // Cancel loading schematic
  const handleCancelLoadSchematic = useCallback(() => {
    setPendingLoadSchematic(null);
    setLoadConfirmOpen(false);
  }, []);

  // Keyboard shortcuts for schematic operations
  useEffect(() => {
    if (!onSaveSchematic && !onLoadSchematic) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+S: Save schematic
      if (e.altKey && e.key.toLowerCase() === "s" && onSaveSchematic) {
        e.preventDefault();
        handleSaveSchematic();
      }
      // Alt+L: Load schematic
      if (e.altKey && e.key.toLowerCase() === "l" && onLoadSchematic) {
        e.preventDefault();
        handleLoadSchematic();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSaveSchematic, onLoadSchematic, handleSaveSchematic, handleLoadSchematic]);

  // Apply pending schematic on mount (from ship creation modal)
  // Wait for slotsById to be populated before applying
  // Use a ref to prevent multiple applications (state updates can cause re-runs)
  const pendingSchematicAppliedRef = useRef(false);
  const slotsLoaded = Object.keys(slotsById).length > 0;
  useEffect(() => {
    if (pendingSchematic && blueprintId && !pendingSchematicAppliedRef.current && slotsLoaded) {
      pendingSchematicAppliedRef.current = true;
      console.log("[ShipDesignWorkspace] Applying pending schematic from creation modal");
      applySchematicToBlueprint(pendingSchematic).then((result) => {
        clearPendingSchematic();
        console.log("[ShipDesignWorkspace] Pending schematic applied and cleared");
        // Show any warnings from the load
        if (!result.success) {
          alert.danger("SCHEMATIC LOAD FAILED", result.warnings[0]);
        } else if (result.warnings.length > 0) {
          for (const warning of result.warnings) {
            alert.warning("SCHEMATIC WARNING", warning);
          }
        }
      });
    }
  }, [
    pendingSchematic,
    blueprintId,
    slotsLoaded,
    applySchematicToBlueprint,
    clearPendingSchematic,
    alert,
  ]);

  // Use the catalog's slotsById directly - it's populated by getModuleSlots()
  // This ensures we're using the same data source as the ModuleSlotBrowserCore
  const moduleSlotsById = slotsById;

  // catalog modal state
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [editingSlotType, setEditingSlotType] = useState<ModuleSlot | null>(null);

  // Blueprint canvas selection state
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  const handleModuleAdded = async (slotId: string) => {
    // Called from ModuleSlotBrowser - creates empty slot instance
    // The empty slot appears on the blueprint; user can later click it to select a module
    // This allows users to add multiple slots first, then fill them one at a time
    try {
      await addInstance(slotId);
      // Don't auto-open catalog - let user add more slots or click to select module when ready
    } catch (err) {
      console.error("Failed to add module instance:", err);
    }
  };

  const handleRemove = async (instanceId: string) => {
    try {
      await removeInstance(instanceId);
      // Clear selection if removed instance was selected
      if (selectedInstanceId === instanceId) {
        setSelectedInstanceId(null);
      }
    } catch (err) {
      console.error("Failed to remove instance:", err);
    }
  };

  // Blueprint canvas handlers
  const handleSelectInstance = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    // Open catalog to select/change the module for this slot
    const instance = instances.find((i) => i.id === instanceId);
    if (instance) {
      const slotType = moduleSlotsById[instance.module_slot_id];
      // Only open catalog if the slot type has variants to choose from
      // Slots without variants (like Deflector Plating) are "finalized" when added
      if (slotType?.hasVariants) {
        setEditingInstanceId(instanceId);
        setEditingSlotType(slotType);
        setCatalogOpen(true);
      }
    }
  };

  // Compute aggregated stats from module slot and variant data
  // Power production comes from power core variants (energy_production)
  // Cooling capacity comes from cooling system variants (generated_cooling) + base ship cooling
  // Power consumption and heat generation come from all modules
  const stats: ShipStats = useMemo(() => {
    // Base native cooling capacity based on ship size
    const getBaseCooling = (size: string | undefined): number => {
      switch (size) {
        case "Small":
          return 100;
        case "Medium":
          return 200;
        case "Large":
          return 400;
        default:
          return 100; // Default to small if unknown
      }
    };

    // Get ship class credit cost
    const shipClassCreditCost = shipClass?.cost ?? 0;

    // Get team credit budget (passed via team prop, default to 0 if not available)
    const teamCredits = team?.credits ?? 0;

    const s: ShipStats = {
      cost: 0, // Legacy field
      creditCost: shipClassCreditCost, // Start with ship class cost
      creditBudget: teamCredits,
      shipClassCost: shipClassCreditCost,
      weight: 0,
      weightMax: shipClass?.max_weight ?? 0,
      hp: 0,
      power: 0, // Total power consumption
      powerMax: 0, // Total power production (from power cores)
      heat: 0, // Total heat generation
      heatMax: getBaseCooling(shipClass?.size), // Base cooling + cooling systems
      buildPointsUsed: 0,
      buildPointsMax: shipClass?.build_points ?? 100,
      warnings: [],
      missingRequired: [],
    };

    let missingSlotCount = 0;

    // Track which slot types have been installed
    const installedSlotTypes = new Set<string>();

    for (const inst of instances) {
      // Look up the module slot definition to get base stats
      const slot = moduleSlotsById[inst.module_slot_id];

      if (slot) {
        installedSlotTypes.add(slot.id);

        // Check if this is a weapon (Offense group) - weapons only consume power when firing
        const isWeapon = Array.isArray(slot.groups) && slot.groups.includes("Offense");

        // Add base stats from slot definition
        s.buildPointsUsed += typeof slot.base_cost === "number" ? slot.base_cost : 0;
        // Add slot credit cost
        s.creditCost += typeof slot.credit_cost === "number" ? slot.credit_cost : 0;
        s.weight += typeof slot.base_weight === "number" ? slot.base_weight : 0;
        s.hp += typeof slot.base_hp === "number" ? slot.base_hp : 0;
        // Weapons only consume power when firing, so exclude from baseline power calculation
        if (!isWeapon) {
          s.power +=
            typeof slot.base_power_consumption === "number" ? slot.base_power_consumption : 0;
        }
        s.heat += typeof slot.base_heat_generation === "number" ? slot.base_heat_generation : 0;

        // If a variant is selected, add variant stats
        if (inst.variant_id && variantsById[inst.variant_id]) {
          const variant = variantsById[inst.variant_id] as unknown as Record<string, unknown>;

          // Add variant cost to build points
          if (typeof variant.cost === "number") {
            s.buildPointsUsed += variant.cost;
          }
          // Add variant credit cost
          if (typeof variant.credit_cost === "number") {
            s.creditCost += variant.credit_cost;
          }

          // Add variant additional stats
          if (typeof variant.additional_weight === "number") {
            s.weight += variant.additional_weight;
          }
          if (typeof variant.additional_hp === "number") {
            s.hp += variant.additional_hp;
          }
          // Weapons only consume power when firing, so exclude from baseline power calculation
          if (!isWeapon && typeof variant.additional_power_consumption === "number") {
            s.power += variant.additional_power_consumption;
          }
          if (typeof variant.additional_heat_generation === "number") {
            s.heat += variant.additional_heat_generation;
          }

          // Power cores provide energy_production (adds to powerMax)
          if (slot.id === "power-core" && typeof variant.energy_production === "number") {
            s.powerMax += variant.energy_production;
          }

          // Cooling systems provide generated_cooling (adds to heatMax)
          if (slot.id === "cooling-system" && typeof variant.generated_cooling === "number") {
            s.heatMax += variant.generated_cooling;
          }
        }
      } else {
        missingSlotCount++;
      }
    }

    // Check for required modules that haven't been installed
    for (const slot of slotsList) {
      if (slot.required && !installedSlotTypes.has(slot.id)) {
        s.missingRequired?.push(slot.name);
      }
    }

    // Log warning if slot definitions are missing (helps debug API/data issues)
    if (missingSlotCount > 0) {
      console.warn(
        `[ShipDesignWorkspace] Stats aggregation: ${missingSlotCount} instance(s) have missing slot definitions. ` +
          `Ensure module slots catalog is loaded before computing stats.`
      );
    }

    if (s.buildPointsUsed > s.buildPointsMax) {
      s.warnings?.push("Build points exceeded");
    }
    // Credit constraint warning
    if (s.creditBudget > 0 && s.creditCost > s.creditBudget) {
      s.warnings?.push("Insufficient credits");
    }
    // Weight constraint warning
    if (s.weightMax > 0 && s.weight > s.weightMax) {
      s.warnings?.push("Weight limit exceeded");
    }
    // Power constraint warning - consumption exceeds production
    if (s.powerMax > 0 && s.power > s.powerMax) {
      s.warnings?.push("Power consumption exceeds production");
    }
    // Note: Heat exceeding cooling is informational only, not a blocking constraint
    // Ships can operate with heat deficits (reduced performance, not prevented registration)
    // Warn if ship class data failed to load (using default constraints)
    if (shipClassError) {
      s.warnings?.push("Ship class data unavailable - using defaults");
    }

    // Calculate ship profile for radar chart using extracted function
    s.profile = calculateShipProfile(
      instances,
      moduleSlotsById,
      variantsById as unknown as Record<string, Record<string, unknown>>,
      s.hp,
      { totalSlotTypes: slotsList.length || 18 }
    );

    return s;
  }, [instances, moduleSlotsById, variantsById, slotsList, shipClass, shipClassError, team]);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--frigate-bg-base)",
        color: "var(--frigate-text-primary)",
        fontFamily: "var(--frigate-font-mono)",
      }}
    >
      {/* Header */}
      <WorkspaceHeader
        blueprintName={blueprint?.name ?? "SHIP BLUEPRINT"}
        onBack={handleBackClick}
        onSave={onSaveSchematic ? handleSaveSchematic : undefined}
        onLoad={onLoadSchematic ? handleLoadSchematic : undefined}
        saveDisabled={!blueprintData}
        schematicLoading={schematicLoading}
      />

      {/* Error Banner - Blueprint Loading Failure */}
      {blueprintError && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--frigate-space-2) var(--frigate-space-3)",
            backgroundColor: "var(--frigate-danger-bg, rgba(220, 38, 38, 0.1))",
            borderBottom: "1px solid var(--frigate-danger)",
            color: "var(--frigate-danger)",
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
          }}
          role="alert"
        >
          <span>[ERROR] FAILED TO LOAD BLUEPRINT: {blueprintError.message || "Unknown error"}</span>
          <button
            onClick={() => fetchBlueprintData()}
            disabled={blueprintLoading}
            style={{
              background: "none",
              border: "none",
              color: "var(--frigate-danger)",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              fontWeight: 700,
              cursor: blueprintLoading ? "wait" : "pointer",
              textDecoration: "underline",
              opacity: blueprintLoading ? 0.5 : 1,
            }}
            aria-label="Retry loading blueprint data"
          >
            {blueprintLoading ? "[RETRYING...]" : "[RETRY]"}
          </button>
        </div>
      )}

      {/* Error Banner - Ship Class Loading Failure */}
      {shipClassError && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--frigate-space-2) var(--frigate-space-3)",
            backgroundColor: "var(--frigate-danger-bg, rgba(220, 38, 38, 0.1))",
            borderBottom: "1px solid var(--frigate-danger)",
            color: "var(--frigate-danger)",
            fontFamily: "var(--frigate-font-mono)",
            fontSize: "var(--frigate-font-small)",
          }}
          role="alert"
        >
          <span>
            [ERROR] FAILED TO LOAD SHIP CLASS DATA: {shipClassError.message || "Unknown error"} —
            USING DEFAULT CONSTRAINTS
          </span>
          <button
            onClick={refetchShipClass}
            disabled={shipClassLoading}
            style={{
              background: "none",
              border: "none",
              color: "var(--frigate-danger)",
              fontFamily: "var(--frigate-font-mono)",
              fontSize: "var(--frigate-font-small)",
              fontWeight: 700,
              cursor: shipClassLoading ? "wait" : "pointer",
              textDecoration: "underline",
              opacity: shipClassLoading ? 0.5 : 1,
            }}
            aria-label="Retry loading ship class data"
          >
            {shipClassLoading ? "[RETRYING...]" : "[RETRY]"}
          </button>
        </div>
      )}

      {/* Main Content Area - Three Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          gap: "var(--frigate-space-3)",
          padding: "var(--frigate-space-3)",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Left Column: Module Slot Browser */}
        <div style={{ minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ModuleSlotBrowser
            apiUrl={apiUrl}
            blueprintId={blueprintId}
            installedModules={instances}
            moduleSlots={slotsList}
            buildPointsUsed={stats.buildPointsUsed}
            maxBuildPoints={stats.buildPointsMax}
            onModuleAdded={handleModuleAdded}
          />
        </div>

        {/* Center Column: Ship Blueprint View */}
        <div style={{ minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ShipBlueprintCanvas
            shipClassId={shipClass?.id ?? ""}
            shipClassName={shipClass?.name}
            moduleSlots={slotsList}
            moduleSlotsById={moduleSlotsById}
            variantsById={variantsById}
            instances={instances}
            selectedInstanceId={selectedInstanceId}
            onSelectInstance={handleSelectInstance}
            onRemoveInstance={handleRemove}
            onClearSelection={() => setSelectedInstanceId(null)}
          />
        </div>

        {/* Right Column: Ship Statistics Panel */}
        <div style={{ minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
          <ShipStatsPanel stats={stats} onRegister={handleRegisterSchematic} />
        </div>
      </div>

      {/* Footer */}
      <WorkspaceFooter hasSchematicSupport={!!onSaveSchematic || !!onLoadSchematic} />

      {/* Module Catalog Modal */}
      <ModuleCatalog
        isOpen={catalogOpen}
        blueprintId={blueprintId}
        instanceId={editingInstanceId ?? undefined}
        apiBase={apiUrl}
        slotType={editingSlotType}
        buildPointsUsed={stats.buildPointsUsed}
        maxBuildPoints={stats.buildPointsMax}
        className="ship-design-catalog"
        onSelect={async (variantId: string) => {
          // Set the selected module variant on the existing slot instance
          try {
            if (editingInstanceId && editingSlotType) {
              await setVariant(editingInstanceId, variantId);
              // Fetch the variant details into the workspace's catalog cache
              // so the blueprint marker can display the variant name and tooltip
              await getModuleVariant(editingSlotType.id, variantId);
            }
          } catch (err) {
            console.error("Failed to set variant from workspace:", err);
          } finally {
            setCatalogOpen(false);
            setEditingInstanceId(null);
            setEditingSlotType(null);
          }
        }}
        onClose={() => {
          setCatalogOpen(false);
          setEditingInstanceId(null);
          setEditingSlotType(null);
        }}
      />

      {/* Load Schematic Confirmation Modal */}
      <ConfirmationModal
        title="REPLACE MODULE CONFIGURATION?"
        message={`Loading schematic "${pendingLoadSchematic?.name ?? "unknown"}" will replace your current ${instances.length} module(s). This action cannot be undone.`}
        isOpen={loadConfirmOpen}
        onConfirm={handleConfirmLoadSchematic}
        onCancel={handleCancelLoadSchematic}
        confirmLabel="LOAD SCHEMATIC"
        cancelLabel="CANCEL"
        isDanger={true}
      />
    </div>
  );
}

export default ShipDesignWorkspace;
