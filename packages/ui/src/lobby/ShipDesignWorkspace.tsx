import React, { useEffect, useMemo, useState } from 'react';
import type { ModuleInstance, ModuleSlot } from '@frigate/api-client';
import ModuleSlotBrowser from './ModuleSlotBrowser';
import InstalledModulesList from './InstalledModulesList';
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
  const { slotsList, getModuleSlots } = useCatalog(apiUrl);
  const { goBack } = useLobbyWorkflowStore();
  
  // Fetch the full blueprint from API to get shipClass
  const [blueprintData, setBlueprintData] = useState<{ id: string; name: string; class: string; team_id: string } | null>(null);
  
  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        const response = await fetch(`${apiUrl}/v1/blueprints/${blueprintId}`);
        if (response.ok) {
          const data = await response.json();
          setBlueprintData(data);
        }
      } catch (error) {
        console.error('Failed to fetch blueprint:', error);
      }
    };
    
    if (blueprintId && apiUrl) {
      fetchBlueprint();
    }
  }, [blueprintId, apiUrl]);
  
  // Use the useShipClass hook to fetch ship class details using the class from the blueprint
  const { shipClass } = useShipClass(blueprintData?.class, apiUrl);
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

  // Build module slots lookup by ID
  const moduleSlotsById = useMemo(() => {
    const map: Record<string, ModuleSlot> = {};
    slotsList.forEach(slot => {
      map[slot.id] = slot;
    });
    return map;
  }, [slotsList]);

  // catalog modal state
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [editingSlotType, setEditingSlotType] = useState<ModuleSlot | null>(null);

  const handleModuleAdded = () => {
    // ModuleSlotBrowser performs the actual addInstance(slotId) call (optimistic).
    // Try to open the catalog for the latest instance in the blueprint. If the
    // store hasn't updated yet, retry briefly a few times rather than invoking
    // hooks inside this handler (which would violate hook rules and can cause
    // unexpected re-renders).
    const tryOpenLatest = (attempt = 0) => {
      const latest = blueprint?.instances?.slice(-1)[0];
      if (latest) {
        const slotType = moduleSlotsById[latest.module_slot_id];
        if (slotType && slotType.hasVariants) {
          setEditingInstanceId(latest.id);
          setEditingSlotType(slotType);
          setCatalogOpen(true);
        }
      } else if (attempt < 5) {
        setTimeout(() => tryOpenLatest(attempt + 1), 50);
      }
    };
    tryOpenLatest();
  };

  const handleSelectType = (instanceId: string, slotType: ModuleSlot) => {
    setEditingInstanceId(instanceId);
    setEditingSlotType(slotType);
    setCatalogOpen(true);
  };

  const handleRemove = async (instanceId: string) => {
    try {
      await removeInstance(instanceId);
    } catch (err) {
      console.error('Failed to remove instance:', err);
    }
  };

  // compute aggregated stats (best-effort using instance fields)
  const stats: ShipStats = useMemo(() => {
    const s: ShipStats = {
      cost: 0,
      weight: 0,
      hp: 0,
      power: 0,
      heat: 0,
      buildPointsUsed: 0,
      buildPointsMax: shipClass?.build_points ?? 100,
      warnings: [],
    };
    for (const inst of instances) {
      // instance may include numeric summary fields; fall back to 0
      // these are optional on the api type so guard with + to coerce
      s.cost += +(inst as any).cost || 0;
      s.weight += +(inst as any).weight || 0;
      s.hp += +(inst as any).hp || 0;
      s.power += +(inst as any).power || 0;
      s.heat += +(inst as any).heat || 0;
      s.buildPointsUsed += +(inst as any).build_points || 0;
    }
    if (s.buildPointsUsed > s.buildPointsMax) {
      s.warnings?.push('Build points exceeded');
    }
    return s;
  }, [instances, shipClass]);

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

      {/* Main Content Area - Three Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr 300px',
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
            buildPointsUsed={stats.buildPointsUsed}
            maxBuildPoints={stats.buildPointsMax}
            onModuleAdded={handleModuleAdded}
          />
        </div>

        {/* Center Column: Installed Modules List */}
        <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <InstalledModulesList
            instances={instances}
            maxModules={12}
            moduleSlots={moduleSlotsById}
            onSelectType={handleSelectType}
            onRemove={handleRemove}
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
        className="ship-design-catalog"
        onSelect={async (variantId: string) => {
          try {
            if (editingInstanceId) await setVariant(editingInstanceId, variantId);
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
