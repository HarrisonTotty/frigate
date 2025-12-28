/**
 * InventoryWorkspace Component
 *
 * Main workspace for loading ammunition and cargo onto a ship after design.
 * Provides a three-column layout with ammunition browser, loaded inventory,
 * and constraints panel.
 *
 * Workflow position: Ship Design → [REGISTER SCHEMATIC] → Inventory Workspace
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { Ammunition, ModuleInstance, ModuleVariant } from '@frigate/api-client';
import { useAmmunition } from '../hooks/useAmmunition';
import { useInventoryStore } from '../stores/inventoryStore';
import { useLobbyWorkflowStore } from './lobbyWorkflowStore';
import { useUiBlueprint } from '../hooks/useUiBlueprint';
import { useCatalog } from '../hooks/useCatalog';
import { AmmunitionBrowser } from './AmmunitionBrowser';
import { LoadedInventoryPanel } from './LoadedInventoryPanel';
import { InventoryConstraintsPanel, type InventoryStats } from './InventoryConstraintsPanel';
import { AmmunitionDetailModal } from './AmmunitionDetailModal';
import {
  extractWeaponCompatibility,
  getIncompatibilityReason,
  getCompatibleWeapons,
} from './utils/ammoCompatibility';

/**
 * Player information
 */
export interface Player {
  id: string;
  name: string;
}

/**
 * Team information
 */
export interface Team {
  id: string;
  name: string;
  credits: number;
}

/**
 * InventoryWorkspace Props
 */
export interface InventoryWorkspaceProps {
  /** API base URL */
  apiUrl: string;
  /** Player context */
  player: Player;
  /** Team context */
  team: Team;
  /** Blueprint ID for this ship */
  blueprintId: string;
  /** Remaining weight capacity after module installation (optional - fetched from blueprint if not provided) */
  availableWeight?: number;
  /** Blueprint's installed modules (optional - fetched from blueprint if not provided) */
  installedModules?: ModuleInstance[];
  /** Variant data for installed modules (optional - fetched from catalog if not provided) */
  variantsById?: Record<string, ModuleVariant>;
  /** Ship design credit cost (to calculate remaining credits) */
  shipDesignCost?: number;
  /** Callback when user clicks back */
  onBack?: () => void;
  /** Callback when user disconnects */
  onDisconnect?: () => void;
  /** Callback when cargo is registered */
  onRegisterCargo?: () => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Workspace Header Component
 */
interface WorkspaceHeaderProps {
  shipName?: string;
  blueprintId: string;
  onBack?: () => void;
}

function WorkspaceHeader({ shipName = 'SHIP INVENTORY', blueprintId, onBack }: WorkspaceHeaderProps) {
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
      <div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 'var(--frigate-font-display)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--frigate-text-primary)',
          }}
        >
          {shipName}
        </div>
        <div
          style={{
            fontSize: 'var(--frigate-font-tiny)',
            color: 'var(--frigate-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: 'var(--frigate-space-1)',
          }}
        >
          BLUEPRINT: {blueprintId}
        </div>
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
          aria-label="Go back to ship design"
        >
          [BACK]
        </button>
      )}
    </div>
  );
}

/**
 * Workspace Footer Component
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
        [WORKSPACE: INVENTORY PHASE | STATUS: ACTIVE]
      </div>
      <div style={{ letterSpacing: '0.05em' }}>
        [/] SEARCH  [F] FILTER  [+/-] QTY  [ENTER] ADD
      </div>
    </div>
  );
}

/**
 * InventoryWorkspace Component
 *
 * Main container for the ship inventory phase with three-column layout:
 *
 * **Left Column**: Ammunition Browser
 * - Browse ammunition by category (kinetic, missiles, torpedos)
 * - Search and filter functionality
 * - Compatibility filtering (enabled by default)
 * - Add items with [+] buttons
 *
 * **Center Column**: Loaded Inventory
 * - View currently loaded ammunition
 * - Quantity adjustment controls
 * - Remove items
 *
 * **Right Column**: Constraints Panel
 * - Weight capacity progress bar
 * - Credit budget progress bar
 * - Summary statistics
 * - Warnings for incompatible items
 * - Register Cargo button
 */
export function InventoryWorkspace({
  apiUrl,
  player,
  team,
  blueprintId,
  availableWeight: availableWeightProp,
  installedModules: installedModulesProp,
  variantsById: variantsByIdProp,
  shipDesignCost = 0,
  onBack,
  onRegisterCargo,
  className = '',
}: InventoryWorkspaceProps): React.ReactElement {
  // Fetch ammunition catalog
  const { ammunition, loading, error, refetch } = useAmmunition(apiUrl);

  // Fetch blueprint data from store (for installed modules)
  const { blueprint, ensureOpen } = useUiBlueprint({ blueprintId, apiBase: apiUrl });

  // Fetch module catalog (for variant data with ammo_type/ammo_size)
  const { variantsById: catalogVariantsById, getModuleVariants, getModuleSlots } = useCatalog(apiUrl);

  // Track whether we've already loaded data to prevent infinite loops
  const [dataLoaded, setDataLoaded] = useState(false);

  // Track whether compatibility data has been set in the store
  const [compatibilityReady, setCompatibilityReady] = useState(false);

  // Ensure blueprint is loaded - only run once on mount
  useEffect(() => {
    ensureOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprintId]);

  // Load module slots and variants for installed modules - only run once when blueprint is available
  useEffect(() => {
    // Skip if we've already loaded or if props were provided
    if (dataLoaded || installedModulesProp || variantsByIdProp) return;

    const instances = blueprint?.instances;
    if (!instances || instances.length === 0) return;

    const loadVariants = async () => {
      try {
        // First load all module slots
        await getModuleSlots();

        // Then load variants for each unique slot type in the blueprint
        const slotTypes = new Set(instances.map(inst => inst.module_slot_id));

        for (const slotType of slotTypes) {
          try {
            await getModuleVariants(slotType);
          } catch (err) {
            console.warn(`[InventoryWorkspace] Failed to load variants for slot ${slotType}:`, err);
          }
        }

        setDataLoaded(true);
      } catch (err) {
        console.error('[InventoryWorkspace] Failed to load module data:', err);
      }
    };

    loadVariants();
    // We intentionally only depend on blueprint?.instances and the prop flags
    // The getter functions change on every render due to their state dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprint?.instances, installedModulesProp, variantsByIdProp]);

  // Use props if provided, otherwise use data from hooks
  const installedModules = installedModulesProp ?? (blueprint?.instances ? Array.from(blueprint.instances) : []);
  const variantsById = variantsByIdProp ?? catalogVariantsById;

  // Calculate available weight from blueprint if not provided via props
  // Default to a reasonable value if we can't calculate it
  const availableWeight = availableWeightProp ?? 1000; // TODO: Calculate from ship class weight capacity minus module weight

  // Inventory store
  const {
    setAmmoCatalog,
    setConstraints,
    setCompatibility,
    addAmmo,
    removeAmmo,
    setAmmoQuantity,
    clearInventory,
    getTotalWeight,
    getTotalCost,
    getInventoryItems,
    canAddAmmo,
    isAmmoCompatible,
    ammoCatalog,
  } = useInventoryStore();

  // Workflow store
  const { goBack } = useLobbyWorkflowStore();

  // Compatibility filter state (enabled by default per design doc)
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(true);

  // Selected ammo for detail modal
  const [selectedAmmo, setSelectedAmmo] = useState<Ammunition | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Calculate available credits (team credits minus ship design cost)
  const availableCredits = Math.max(0, team.credits - shipDesignCost);

  // Extract weapon compatibility from installed modules
  const weaponCompatibility = useMemo(
    () => extractWeaponCompatibility(installedModules, variantsById as Record<string, ModuleVariant>),
    [installedModules, variantsById]
  );

  // Initialize store with ammunition catalog
  useEffect(() => {
    if (ammunition.length > 0) {
      setAmmoCatalog(ammunition);
    }
  }, [ammunition, setAmmoCatalog]);

  // Set constraints from props
  useEffect(() => {
    setConstraints(availableWeight, availableCredits);
  }, [availableWeight, availableCredits, setConstraints]);

  // Set compatibility info - use primitive dependencies to avoid infinite loops
  // Convert Set to sorted string for stable dependency comparison
  const kineticAmmoTypesKey = useMemo(
    () => Array.from(weaponCompatibility.kineticAmmoTypes).sort().join(','),
    [weaponCompatibility.kineticAmmoTypes]
  );

  useEffect(() => {
    setCompatibility(
      weaponCompatibility.kineticAmmoTypes,
      weaponCompatibility.hasMissileLaunchers,
      weaponCompatibility.hasTorpedoTubes
    );
    // Mark compatibility as ready once we've set it (even if empty - means no compatible weapons)
    // But only if we have some basis for the data (props provided or data loaded)
    if (installedModulesProp || variantsByIdProp || dataLoaded) {
      setCompatibilityReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- using kineticAmmoTypesKey as stable proxy for Set
  }, [kineticAmmoTypesKey, weaponCompatibility.hasMissileLaunchers, weaponCompatibility.hasTorpedoTubes, setCompatibility, installedModulesProp, variantsByIdProp, dataLoaded]);

  // Handle back button
  const handleBack = useCallback(() => {
    goBack();
    onBack?.();
  }, [goBack, onBack]);

  // Handle add ammo
  const handleAddAmmo = useCallback(
    (ammoId: string) => {
      addAmmo(ammoId, 1);
    },
    [addAmmo]
  );

  // Handle add quantity (from inventory panel)
  const handleAddQuantity = useCallback(
    (ammoId: string, amount = 1) => {
      addAmmo(ammoId, amount);
    },
    [addAmmo]
  );

  // Handle remove quantity (from inventory panel)
  const handleRemoveQuantity = useCallback(
    (ammoId: string, amount = 1) => {
      removeAmmo(ammoId, amount);
    },
    [removeAmmo]
  );

  // Handle set quantity (from inventory panel)
  const handleSetQuantity = useCallback(
    (ammoId: string, quantity: number) => {
      setAmmoQuantity(ammoId, quantity);
    },
    [setAmmoQuantity]
  );

  // Handle remove all (from inventory panel)
  const handleRemoveAll = useCallback(
    (ammoId: string) => {
      setAmmoQuantity(ammoId, 0);
    },
    [setAmmoQuantity]
  );

  // Handle show ammo details
  const handleShowAmmoDetails = useCallback((ammo: Ammunition) => {
    setSelectedAmmo(ammo);
    setIsDetailModalOpen(true);
  }, []);

  // Handle close detail modal
  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
  }, []);

  // Handle add from modal
  const handleAddFromModal = useCallback(
    (ammoId: string, quantity: number) => {
      addAmmo(ammoId, quantity);
    },
    [addAmmo]
  );

  // Check if can add specific quantity
  const canAddQuantity = useCallback(
    (ammoId: string, quantity: number): boolean => {
      return canAddAmmo(ammoId, quantity);
    },
    [canAddAmmo]
  );

  // Get incompatibility reason wrapper
  const getIncompatibilityReasonForAmmo = useCallback(
    (ammo: Ammunition): string | undefined => {
      return getIncompatibilityReason(ammo, weaponCompatibility);
    },
    [weaponCompatibility]
  );

  // Get compatible weapons for an ammo type
  const getCompatibleWeaponsForAmmo = useCallback(
    (ammo: Ammunition): string[] => {
      return getCompatibleWeapons(ammo, weaponCompatibility);
    },
    [weaponCompatibility]
  );

  // Build inventory stats for constraints panel
  const inventoryItems = getInventoryItems();
  const cargoWeight = getTotalWeight();
  const cargoCost = getTotalCost();

  // Generate warnings for incompatible ammo loaded
  const warnings: string[] = [];
  for (const item of inventoryItems) {
    const ammo = ammoCatalog.find((a) => a.id === item.itemId);
    if (ammo && !isAmmoCompatible(item.itemId)) {
      const reason = getIncompatibilityReasonForAmmo(ammo);
      if (reason && !warnings.includes(reason)) {
        warnings.push(reason);
      }
    }
  }

  const inventoryStats: InventoryStats = {
    cargoWeight,
    weightCapacity: availableWeight,
    cargoCost,
    creditBudget: availableCredits,
    ammoTypesLoaded: inventoryItems.length,
    totalItems: inventoryItems.reduce((sum, item) => sum + item.quantity, 0),
    warnings,
  };

  // Check if can register
  const canRegister = cargoWeight <= availableWeight && cargoCost <= availableCredits;

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
      <WorkspaceHeader
        shipName="SHIP INVENTORY"
        blueprintId={blueprintId}
        onBack={handleBack}
      />

      {/* Error Banner */}
      {error && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--frigate-space-2) var(--frigate-space-3)',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderBottom: '1px solid var(--frigate-danger)',
            color: 'var(--frigate-danger)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
          }}
          role="alert"
        >
          <span>[ERROR] FAILED TO LOAD AMMUNITION: {error}</span>
          <button
            onClick={refetch}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--frigate-danger)',
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              textDecoration: 'underline',
              opacity: loading ? 0.5 : 1,
            }}
            aria-label="Retry loading ammunition"
          >
            {loading ? '[RETRYING...]' : '[RETRY]'}
          </button>
        </div>
      )}

      {/* Main Content Area - Three Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 'var(--frigate-space-3)',
          padding: 'var(--frigate-space-3)',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left Column: Ammunition Browser */}
        <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AmmunitionBrowser
            ammunition={ammunition}
            loading={loading}
            error={error}
            showCompatibleOnly={compatibilityReady && showCompatibleOnly}
            onToggleCompatibleFilter={() => setShowCompatibleOnly(!showCompatibleOnly)}
            onAddAmmo={handleAddAmmo}
            onShowAmmoDetails={handleShowAmmoDetails}
            canAddAmmo={canAddAmmo}
            isAmmoCompatible={isAmmoCompatible}
            getIncompatibilityReason={getIncompatibilityReasonForAmmo}
            getCompatibleWeapons={getCompatibleWeaponsForAmmo}
          />
        </div>

        {/* Center Column: Loaded Inventory */}
        <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <LoadedInventoryPanel
            inventory={inventoryItems}
            ammoCatalog={ammoCatalog}
            onAddQuantity={handleAddQuantity}
            onRemoveQuantity={handleRemoveQuantity}
            onSetQuantity={handleSetQuantity}
            onRemoveAll={handleRemoveAll}
            onShowAmmoDetails={handleShowAmmoDetails}
          />
        </div>

        {/* Right Column: Constraints Panel */}
        <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <InventoryConstraintsPanel
            stats={inventoryStats}
            onRegisterCargo={onRegisterCargo}
            canRegister={canRegister}
          />
        </div>
      </div>

      {/* Footer */}
      <WorkspaceFooter />

      {/* Ammunition Detail Modal */}
      <AmmunitionDetailModal
        ammo={selectedAmmo}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onAddToInventory={handleAddFromModal}
        canAdd={selectedAmmo ? canAddAmmo(selectedAmmo.id) : false}
        canAddQuantity={canAddQuantity}
        isCompatible={selectedAmmo ? isAmmoCompatible(selectedAmmo.id) : true}
        incompatibilityReason={selectedAmmo ? getIncompatibilityReasonForAmmo(selectedAmmo) : undefined}
        compatibleWeapons={selectedAmmo ? getCompatibleWeaponsForAmmo(selectedAmmo) : undefined}
      />
    </div>
  );
}

export default InventoryWorkspace;
