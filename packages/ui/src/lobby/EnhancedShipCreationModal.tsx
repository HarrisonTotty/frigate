/**
 * Enhanced Ship Creation Modal - Phase 4.12.4
 * 
 * Two-column modal for ship creation with comprehensive ship class details.
 * Left column: ship name input and class selection
 * Right column: real-time detail panel with specs, bonuses, and constraints
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components';
import { Stack } from '../layout';
import { LoadingText } from '../loading';
import { useShipClassStore } from '../stores/shipClassStore';
// ...existing code...
import { ShipNameInput } from './ShipNameInput';
import { ShipClassSelect } from './ShipClassSelect';
import { ModalBuildConstraintsPanel } from './ModalBuildConstraintsPanel';
import { ModalShipClassDetailPanel } from './ModalShipClassDetailPanel';
// ...existing code...
import type { ShipClassSummary, ShipClassDetails } from '../types/shipClass';

/** Schematic data structure for pre-loading ship configurations */
export interface SchematicDataForModal {
  version: number;
  name: string;
  ship_class: string;
  modules: { slot: string; module: string | null }[];
}

export interface EnhancedShipCreationModalProps {
  /** Team faction ID for faction-specific data */
  factionId: string | null;
  /** Team object with credits for cost validation */
  team?: { id: string; credits: number } | null;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Callback when ship is created */
  onCreate: (shipName: string, shipClassId: string) => Promise<void>;
  /** Whether creation is in progress */
  isCreating?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Callback to load schematic from file - returns schematic data or null if cancelled */
  onLoadSchematic?: () => Promise<SchematicDataForModal | null>;
  /** Callback when schematic is loaded (to store for later application) */
  onSchematicLoaded?: (schematic: SchematicDataForModal) => void;
  /** Whether schematic file operation is in progress */
  schematicLoading?: boolean;
  /** Initial schematic data to pre-fill the form (from external [LOAD SCHEMATIC] button) */
  initialSchematic?: SchematicDataForModal | null;
}

/**
 * Format credit values with thousand separators
 */
function formatCredits(value: number | undefined): string {
  if (value === undefined || value === null) return '---';
  return value.toLocaleString();
}

/**
 * Generate abbreviation from ship class name
 */
function generateAbbreviation(name: string): string {
  const words = name.toUpperCase().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 6);
  }
  return words.map(w => w[0]).join('').substring(0, 6);
}

/**
 * Enhanced Ship Creation Modal
 * 
 * Comprehensive ship creation interface with:
 * - Two-column responsive layout
 * - Real-time ship class detail updates
 * - Faction-aware manufacturer display
 * - Complete specs, bonuses, and constraints
 */
export function EnhancedShipCreationModal({
  factionId,
  team,
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
  className = '',
  onLoadSchematic,
  onSchematicLoaded,
  schematicLoading = false,
  initialSchematic,
}: EnhancedShipCreationModalProps): React.ReactElement | null {
  const [shipName, setShipName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [schematicIndicator, setSchematicIndicator] = useState<string | null>(null);
  const [schematicWarning, setSchematicWarning] = useState<string | null>(null);

  // Ref to track which schematic has been applied (to prevent re-applying)
  const appliedSchematicRef = useRef<SchematicDataForModal | null>(null);
  // Ref for callback to avoid dependency issues
  const onSchematicLoadedRef = useRef(onSchematicLoaded);
  onSchematicLoadedRef.current = onSchematicLoaded;

  const shipClassStore = useShipClassStore();
  
  // Load ship classes filtered by faction
  useEffect(() => {
    if (isOpen) {
      shipClassStore.loadShipClasses(factionId || undefined);
    } else {
      // Reset applied schematic ref when modal closes
      appliedSchematicRef.current = null;
    }
  }, [isOpen, factionId]);
  
  // Load detailed info for selected ship class
  useEffect(() => {
    if (selectedClassId) {
      setDetailsLoading(true);
      shipClassStore.loadShipClassDetail(selectedClassId).finally(() => {
        setDetailsLoading(false);
      });
    }
  }, [selectedClassId]);
  
  // Get available ship classes (sorted by build points)
  const availableClasses = shipClassStore.sortShipClasses(
    shipClassStore.shipClasses,
    'buildPoints',
    'asc'
  );
  
  // Set default selection when data loads
  useEffect(() => {
    if (availableClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(availableClasses[0].id);
    }
  }, [availableClasses, selectedClassId]);

  // Apply initial schematic when modal opens with one (from external LOAD SCHEMATIC button)
  useEffect(() => {
    // Guard: only apply if we haven't already applied this exact schematic
    if (isOpen && initialSchematic && availableClasses.length > 0 && appliedSchematicRef.current !== initialSchematic) {
      appliedSchematicRef.current = initialSchematic;

      // Pre-fill name and class from schematic
      setShipName(initialSchematic.name);

      // Find matching ship class by ID
      const matchingClass = availableClasses.find(
        (c) => c.id.toLowerCase() === initialSchematic.ship_class.toLowerCase()
      );
      if (matchingClass) {
        setSelectedClassId(matchingClass.id);
      } else {
        // Warn user that schematic's ship class is not available
        setSchematicWarning(
          `Schematic ship class "${initialSchematic.ship_class}" not available for this faction. Please select a compatible class manually.`
        );
      }

      // Store schematic for later application in design workspace (use ref to avoid dependency)
      onSchematicLoadedRef.current?.(initialSchematic);

      // Show indicator that schematic is loaded
      setSchematicIndicator(initialSchematic.name);
    }
  }, [isOpen, initialSchematic, availableClasses]);

  // Get detailed info for selected class
  const selectedClassDetails = selectedClassId 
    ? shipClassStore.shipClassDetails[selectedClassId] 
    : null;
  
  const handleCreate = async () => {
    if (!shipName.trim() || !selectedClassId) return;

    await onCreate(shipName, selectedClassId);
    // Reset form
    setShipName('');
    setSchematicIndicator(null);
    setSchematicWarning(null);
  };

  // Handle load schematic button
  const handleLoadSchematic = async () => {
    if (!onLoadSchematic) return;

    // Clear previous warnings
    setSchematicWarning(null);

    const schematic = await onLoadSchematic();
    if (schematic) {
      // Pre-fill name and class from schematic
      setShipName(schematic.name);

      // Find matching ship class by ID
      const matchingClass = availableClasses.find(
        (c) => c.id.toLowerCase() === schematic.ship_class.toLowerCase()
      );
      if (matchingClass) {
        setSelectedClassId(matchingClass.id);
      } else {
        // Warn user that schematic's ship class is not available
        setSchematicWarning(
          `Schematic ship class "${schematic.ship_class}" not available for this faction. Please select a compatible class manually.`
        );
      }

      // Store schematic for later application in design workspace
      onSchematicLoaded?.(schematic);

      // Show indicator that schematic is loaded
      setSchematicIndicator(schematic.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating && shipName.trim()) {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-ship-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--frigate-space-4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCreating) {
          onClose();
        }
      }}
    >
      <div
        className={className}
        style={{
          width: '100%',
          maxWidth: '1400px',
          height: '90vh',
          maxHeight: '900px',
          border: '2px solid var(--frigate-primary)',
          backgroundColor: 'var(--frigate-bg-base)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'var(--frigate-space-4)',
            borderBottom: '2px solid var(--frigate-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--frigate-bg-surface)',
          }}
        >
          <h2
            id="create-ship-modal-title"
            style={{
              margin: 0,
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-heading)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--frigate-text-primary)',
            }}
          >
            CREATE NEW SHIP
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isCreating}
          >
            [X]
          </Button>
        </div>

        {/* Modal Body - Two Column Layout */}
        <div 
          style={{ 
            flex: 1, 
            overflow: 'hidden',
            display: 'flex',
            gap: 'var(--frigate-space-4)',
            padding: 'var(--frigate-space-4)',
          }}
        >
          {/* Left Column - Selection */}
          <div
            style={{
              width: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--frigate-space-4)',
            }}
          >
            {/* Ship Name Input */}
            <ShipNameInput
              shipName={shipName}
              onChange={setShipName}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
            />

            {/* Ship Class Selection */}
            <ShipClassSelect
              selectedClassId={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              disabled={isCreating}
              isLoading={shipClassStore.isLoading}
              availableClasses={availableClasses}
              selectedClassDetails={selectedClassDetails}
            />

            {/* Build Constraints */}
            {selectedClassDetails && (
              <ModalBuildConstraintsPanel
                maxWeight={selectedClassDetails.max_weight}
                maxModules={selectedClassDetails.max_modules}
                buildPoints={selectedClassDetails.build_points}
                shipClassCost={selectedClassDetails.cost}
                teamCredits={team?.credits}
              />
            )}

            {/* Action Buttons */}
            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--frigate-space-2)',
              }}
            >
              {/* Schematic loaded indicator */}
              {schematicIndicator && (
                <div
                  style={{
                    padding: 'var(--frigate-space-2)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid var(--frigate-success, #22c55e)',
                    fontFamily: 'var(--frigate-font-mono)',
                    fontSize: 'var(--frigate-font-tiny)',
                    color: 'var(--frigate-success, #22c55e)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  [✓] SCHEMATIC LOADED: {schematicIndicator}
                </div>
              )}
              {/* Schematic ship class mismatch warning */}
              {schematicWarning && (
                <div
                  style={{
                    padding: 'var(--frigate-space-2)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid var(--frigate-warning, #f59e0b)',
                    fontFamily: 'var(--frigate-font-mono)',
                    fontSize: 'var(--frigate-font-tiny)',
                    color: 'var(--frigate-warning, #f59e0b)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  [!] {schematicWarning}
                </div>
              )}
              {/* Insufficient credits warning */}
              {team && selectedClassDetails?.cost !== undefined && team.credits < selectedClassDetails.cost && (
                <div
                  style={{
                    padding: 'var(--frigate-space-2)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--frigate-danger)',
                    fontFamily: 'var(--frigate-font-mono)',
                    fontSize: 'var(--frigate-font-tiny)',
                    color: 'var(--frigate-danger)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  [!] INSUFFICIENT CREDITS: NEED {formatCredits(selectedClassDetails.cost)} CR, HAVE {formatCredits(team.credits)} CR
                </div>
              )}
              {/* Load Schematic Button */}
              {onLoadSchematic && (
                <Button
                  variant="secondary"
                  onClick={handleLoadSchematic}
                  disabled={isCreating || schematicLoading}
                  style={{ width: '100%' }}
                >
                  {schematicLoading ? '[LOADING...]' : '[LOAD SCHEMATIC]'}
                </Button>
              )}
              <div style={{ display: 'flex', gap: 'var(--frigate-space-3)' }}>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  disabled={
                    isCreating ||
                    schematicLoading ||
                    !shipName.trim() ||
                    !selectedClassId ||
                    (team !== undefined && team !== null && selectedClassDetails?.cost !== undefined && team.credits < selectedClassDetails.cost)
                  }
                  style={{ flex: 1 }}
                >
                  {isCreating ? '[CREATING...]' : '[CREATE]'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isCreating || schematicLoading}
                >
                  [CANCEL]
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              backgroundColor: 'var(--frigate-bg-base)',
              border: '1px solid var(--frigate-border-base)',
            }}
          >
            {shipClassStore.isLoading || detailsLoading ? (
              <div style={{ padding: 'var(--frigate-space-8)' }}>
                <LoadingText message="LOADING SHIP CLASS DETAILS..." />
              </div>
            ) : selectedClassDetails ? (
              <div style={{ padding: 'var(--frigate-space-4)' }}>
                <ModalShipClassDetailPanel
                  shipClass={selectedClassDetails}
                  factionId={factionId || undefined}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: 'var(--frigate-space-8)',
                  textAlign: 'center',
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'var(--frigate-font-small)',
                  color: 'var(--frigate-text-muted)',
                }}
              >
                SELECT A SHIP CLASS TO VIEW DETAILS
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
