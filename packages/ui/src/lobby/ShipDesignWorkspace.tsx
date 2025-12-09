import React, { useEffect, useMemo, useState } from 'react';
import type { ModuleInstance, ModuleSlot } from '@frigate/api-client';
import ModuleSlotBrowser from './ModuleSlotBrowser';
import { ShipBlueprintCanvas } from './ShipBlueprintView';
import ShipStatsPanel, { ShipStats } from './ShipStatsPanel';
import { ModuleCatalog } from '../modules/ModuleCatalog';
import { useUiBlueprint } from '../hooks/useUiBlueprint';
import { useShipClass } from '../hooks/useShipClass';
import { useCatalog } from '../hooks/useCatalog';
import { useLobbyWorkflowStore } from './lobbyWorkflowStore';
import { Grid } from '../layout';

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
  player?: any;
  /** Optional team context */
  team?: any;
  /** Callback when user clicks back/exit */
  onBack?: () => void;
  /** Callback when user disconnects */
  onDisconnect?: () => void;
}

/**
 * Workspace Header Component
 * 
 * Displays the workspace title and quick actions.
 */
interface WorkspaceHeaderProps {
  blueprintName?: string;
  onBack?: () => void;
}

function WorkspaceHeader({ blueprintName = 'SHIP BLUEPRINT', onBack }: WorkspaceHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--frigate-space-3)',
        borderBottom: '1px solid var(--frigate-border-base)',
        backgroundColor: 'var(--frigate-bg-base)',
        marginBottom: 'var(--frigate-space-3)',
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 'var(--frigate-font-display)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--frigate-text-primary)',
        }}
      >
        {blueprintName}
      </div>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--frigate-text-secondary)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          aria-label="Go back"
        >
          [BACK]
        </button>
      )}
    </div>
  );
}

/**
 * Workspace Footer Component
 * 
 * Displays workspace-wide keyboard hints and status.
 */
function WorkspaceFooter() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: 'var(--frigate-space-2) var(--frigate-space-3)',
        borderTop: '1px solid var(--frigate-border-base)',
        backgroundColor: 'var(--frigate-bg-base)',
        marginTop: 'var(--frigate-space-3)',
        fontSize: 'var(--frigate-font-tiny)',
        color: 'var(--frigate-text-muted)',
      }}
    >
      <div style={{ letterSpacing: '0.05em' }}>
        [WORKSPACE: DESIGN PHASE | STATUS: ACTIVE]
      </div>
      <div style={{ letterSpacing: '0.05em' }}>
        [ALT+S: SAVE | ALT+C: CANCEL | F1: HELP]
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
  className = '',
  onBack,
}: ShipDesignWorkspaceProps) {
  const { blueprint, addInstance, removeInstance, setVariant, ensureOpen } = useUiBlueprint({ blueprintId, apiBase: apiUrl });
  const { slotsList, slotsById, variantsById, getModuleSlots, getModuleVariant } = useCatalog(apiUrl);
  const { goBack } = useLobbyWorkflowStore();
  
  // Fetch the full blueprint from API to get shipClass
  const [blueprintData, setBlueprintData] = useState<{ id: string; name: string; class: string; team_id: string } | null>(null);
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
      console.error('Failed to fetch blueprint:', errorObj.message);
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

  // Blueprint instances are the source of truth - convert to mutable array
  const instances = Array.from(blueprint?.instances ?? []);

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
    console.log('[ShipDesignWorkspace] handleModuleAdded called with slotId:', slotId);
    console.log('[ShipDesignWorkspace] slotsById keys:', Object.keys(slotsById));
    console.log('[ShipDesignWorkspace] slotsList length:', slotsList.length);
    console.log('[ShipDesignWorkspace] slot exists in slotsById:', !!slotsById[slotId]);
    try {
      await addInstance(slotId);
      // Don't auto-open catalog - let user add more slots or click to select module when ready
    } catch (err) {
      console.error('Failed to add module instance:', err);
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
      console.error('Failed to remove instance:', err);
    }
  };

  // Blueprint canvas handlers
  const handleSelectInstance = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    // Open catalog to select/change the module for this slot
    const instance = instances.find(i => i.id === instanceId);
    console.log('[ShipDesignWorkspace] handleSelectInstance:', {
      instanceId,
      instance,
      module_slot_id: instance?.module_slot_id,
      moduleSlotsById_keys: Object.keys(moduleSlotsById),
    });
    if (instance) {
      const slotType = moduleSlotsById[instance.module_slot_id];
      console.log('[ShipDesignWorkspace] slotType lookup:', {
        slotId: instance.module_slot_id,
        slotType,
        hasVariants: slotType?.hasVariants,
      });
      // Only open catalog if the slot type has variants to choose from
      // Slots without variants (like Deflector Plating) are "finalized" when added
      if (slotType?.hasVariants) {
        setEditingInstanceId(instanceId);
        setEditingSlotType(slotType);
        setCatalogOpen(true);
      } else {
        console.log('[ShipDesignWorkspace] Catalog NOT opened - slot has no variants:', slotType?.name);
      }
    }
  };

  // Compute aggregated stats from module slot data
  // Uses actual slot definitions for type-safe stat aggregation
  const stats: ShipStats = useMemo(() => {
    const s: ShipStats = {
      cost: 0,
      weight: 0,
      weightMax: shipClass?.max_weight ?? 0,
      hp: 0,
      power: 0,
      powerMax: shipClass?.max_power ?? 0,
      heat: 0,
      heatMax: shipClass?.max_heat ?? 0,
      buildPointsUsed: 0,
      buildPointsMax: shipClass?.build_points ?? 100,
      warnings: [],
    };

    let missingSlotCount = 0;

    for (const inst of instances) {
      // Look up the module slot definition to get base stats
      const slot = moduleSlotsById[inst.module_slot_id];

      if (slot) {
        // Type-safe access to slot base stats
        s.buildPointsUsed += typeof slot.base_cost === 'number' ? slot.base_cost : 0;
        s.weight += typeof slot.base_weight === 'number' ? slot.base_weight : 0;
        s.hp += typeof slot.base_hp === 'number' ? slot.base_hp : 0;
        s.power += typeof slot.base_power_consumption === 'number' ? slot.base_power_consumption : 0;
        s.heat += typeof slot.base_heat_generation === 'number' ? slot.base_heat_generation : 0;

        // Note: Variant additional stats would require variant data to be loaded
        // Currently, the component doesn't cache variant data for all instances
        // TODO: If variant_id is set, fetch/cache variant data to include additional_* stats
      } else {
        missingSlotCount++;
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
      s.warnings?.push('Build points exceeded');
    }
    // Weight constraint warning
    if (s.weightMax > 0 && s.weight > s.weightMax) {
      s.warnings?.push('Weight limit exceeded');
    }
    // Power constraint warning
    if (s.powerMax > 0 && s.power > s.powerMax) {
      s.warnings?.push('Power capacity exceeded');
    }
    // Heat constraint warning
    if (s.heatMax > 0 && s.heat > s.heatMax) {
      s.warnings?.push('Heat dissipation exceeded');
    }
    // Warn if ship class data failed to load (using default constraints)
    if (shipClassError) {
      s.warnings?.push('Ship class data unavailable - using defaults');
    }
    return s;
  }, [instances, moduleSlotsById, shipClass, shipClassError]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--frigate-bg-base)',
        color: 'var(--frigate-text-primary)',
        fontFamily: 'var(--frigate-font-mono)',
      }}
    >
      {/* Header */}
      <WorkspaceHeader blueprintName={blueprint?.name ?? 'SHIP BLUEPRINT'} onBack={handleBackClick} />

      {/* Error Banner - Blueprint Loading Failure */}
      {blueprintError && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--frigate-space-2) var(--frigate-space-3)',
            backgroundColor: 'var(--frigate-danger-bg, rgba(220, 38, 38, 0.1))',
            borderBottom: '1px solid var(--frigate-danger)',
            color: 'var(--frigate-danger)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
          }}
          role="alert"
        >
          <span>
            [ERROR] FAILED TO LOAD BLUEPRINT: {blueprintError.message || 'Unknown error'}
          </span>
          <button
            onClick={() => fetchBlueprintData()}
            disabled={blueprintLoading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--frigate-danger)',
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              fontWeight: 700,
              cursor: blueprintLoading ? 'wait' : 'pointer',
              textDecoration: 'underline',
              opacity: blueprintLoading ? 0.5 : 1,
            }}
            aria-label="Retry loading blueprint data"
          >
            {blueprintLoading ? '[RETRYING...]' : '[RETRY]'}
          </button>
        </div>
      )}

      {/* Error Banner - Ship Class Loading Failure */}
      {shipClassError && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--frigate-space-2) var(--frigate-space-3)',
            backgroundColor: 'var(--frigate-danger-bg, rgba(220, 38, 38, 0.1))',
            borderBottom: '1px solid var(--frigate-danger)',
            color: 'var(--frigate-danger)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
          }}
          role="alert"
        >
          <span>
            [ERROR] FAILED TO LOAD SHIP CLASS DATA: {shipClassError.message || 'Unknown error'} — USING DEFAULT CONSTRAINTS
          </span>
          <button
            onClick={refetchShipClass}
            disabled={shipClassLoading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--frigate-danger)',
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              fontWeight: 700,
              cursor: shipClassLoading ? 'wait' : 'pointer',
              textDecoration: 'underline',
              opacity: shipClassLoading ? 0.5 : 1,
            }}
            aria-label="Retry loading ship class data"
          >
            {shipClassLoading ? '[RETRYING...]' : '[RETRY]'}
          </button>
        </div>
      )}

      {/* Main Content Area - Three Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 4fr 3fr',
          gap: 'var(--frigate-space-3)',
          padding: 'var(--frigate-space-3)',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left Column: Module Slot Browser */}
        <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
        <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ShipBlueprintCanvas
            shipClassId={shipClass?.id ?? ''}
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
        <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <ShipStatsPanel stats={stats} />
        </div>
      </div>

      {/* Footer */}
      <WorkspaceFooter />

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
            console.error('Failed to set variant from workspace:', err);
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
    </div>
  );
}

export default ShipDesignWorkspace;
