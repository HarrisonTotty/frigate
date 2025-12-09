import React, { useMemo, useEffect, useCallback } from 'react';
import type { ModuleSlot, ModuleVariant, ModuleInstance } from '@frigate/api-client';
import type { ShipBlueprintCanvasProps, SlotPosition } from './types';
import { ShipSilhouette, SILHOUETTE_LAYOUT } from './ShipSilhouette';
import { ModuleSlotMarker } from './ModuleSlotMarker';
import { ConnectionLine } from './ConnectionLine';
import { getSilhouette } from './silhouettes';

/**
 * Convert a position from silhouette-relative (0-100%) to canvas-relative coordinates
 * The silhouette is positioned within the canvas with offsets defined in SILHOUETTE_LAYOUT
 */
function toCanvasCoords(silhouetteX: number, silhouetteY: number): { x: number; y: number } {
  // Convert from silhouette space (0-100) to canvas space
  // silhouetteX of 0 maps to SILHOUETTE_LAYOUT.left
  // silhouetteX of 100 maps to SILHOUETTE_LAYOUT.left + SILHOUETTE_LAYOUT.width
  const x = SILHOUETTE_LAYOUT.left + (silhouetteX / 100) * SILHOUETTE_LAYOUT.width;
  const y = SILHOUETTE_LAYOUT.top + (silhouetteY / 100) * SILHOUETTE_LAYOUT.height;
  return { x, y };
}

/**
 * Main ship blueprint canvas component
 *
 * Displays a ship silhouette with module slot markers positioned
 * at appropriate locations on the ship outline.
 */
export function ShipBlueprintCanvas({
  shipClassId,
  shipClassName,
  moduleSlots: _moduleSlots,
  moduleSlotsById,
  variantsById = {},
  instances,
  selectedInstanceId,
  onSelectInstance,
  onRemoveInstance,
  onClearSelection,
  isLoading = false,
  error = null,
}: ShipBlueprintCanvasProps) {
  // _moduleSlots is available in props for future use (e.g., showing all available slot types)

  // Handle Escape key to clear selection
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && selectedInstanceId) {
      onClearSelection?.();
    }
  }, [selectedInstanceId, onClearSelection]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  const silhouette = useMemo(
    () => getSilhouette(shipClassId),
    [shipClassId]
  );

  // Group instances by their module slot's group
  // If a slot isn't found in moduleSlotsById, use 'unknown' group to ensure it still displays
  const instancesByGroup = useMemo(() => {
    console.log('[ShipBlueprintCanvas] instancesByGroup computing...');
    console.log('[ShipBlueprintCanvas] instances:', instances.length);
    console.log('[ShipBlueprintCanvas] moduleSlotsById keys:', Object.keys(moduleSlotsById));
    // Log full slot data for debugging hasVariants issue
    for (const [slotId, slot] of Object.entries(moduleSlotsById)) {
      console.log(`[ShipBlueprintCanvas] slot in cache: id="${slotId}", name="${slot.name}", hasVariants=${slot.hasVariants}`);
    }
    const grouped: Record<string, typeof instances> = {};
    for (const instance of instances) {
      const slot = moduleSlotsById[instance.module_slot_id];
      console.log('[ShipBlueprintCanvas] instance.module_slot_id:', instance.module_slot_id, 'slot found:', !!slot);
      if (!slot) {
        console.warn(`[ShipBlueprintCanvas] SLOT NOT FOUND for module_slot_id="${instance.module_slot_id}". Available keys:`, Object.keys(moduleSlotsById));
      }
      // Use the slot's first group, or 'unknown' if slot not found
      const group = slot?.groups?.[0] ?? 'unknown';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(instance);
    }
    return grouped;
  }, [instances, moduleSlotsById]);

  // Build marker data: show ALL instances (added slots), positioned by their group
  // An instance without a variant_id is an "empty slot" awaiting module selection
  // An instance with a variant_id has a module installed
  const markerData = useMemo(() => {
    const markers: Array<{
      position: SlotPosition;
      instance: ModuleInstance;
      slot?: ModuleSlot;
      variant?: ModuleVariant;
      isEmpty: boolean; // true = slot added but no module selected yet
      key: string;
    }> = [];

    // For each group of instances, find positions from silhouette (or use fallback)
    // This ensures ALL instances appear, even if their group isn't in the silhouette
    for (const [group, groupInstances] of Object.entries(instancesByGroup)) {
      const positions = silhouette.slotPositions[group] ?? [];

      groupInstances.forEach((instance, instanceIndex) => {
        const slot = moduleSlotsById[instance.module_slot_id];
        const variant = instance.variant_id ? variantsById[instance.variant_id] : undefined;
        console.log('[ShipBlueprintCanvas] marker data:', {
          instanceId: instance.id,
          module_slot_id: instance.module_slot_id,
          module_slot_id_type: typeof instance.module_slot_id,
          slotFound: !!slot,
          slotName: slot?.name,
          slotHasVariants: slot?.hasVariants,
          slot_has_varients: (slot as any)?.has_varients,
          variantId: instance.variant_id,
          availableSlotIds: Object.keys(moduleSlotsById).slice(0, 5), // first 5 for brevity
        });

        // Use position from silhouette if available, otherwise use fallback
        let position: SlotPosition;
        if (instanceIndex < positions.length) {
          position = positions[instanceIndex];
        } else if (positions.length > 0) {
          // Stack additional instances with offset from last defined position
          const lastPosition = positions[positions.length - 1];
          position = {
            ...lastPosition,
            y: lastPosition.y + (instanceIndex - positions.length + 1) * 8,
          };
        } else {
          // Fallback position if no positions defined for this group
          // Distribute unknown groups vertically on the left side
          const groupIndex = Object.keys(instancesByGroup).indexOf(group);
          position = {
            group,
            x: 10,
            y: 20 + groupIndex * 15 + instanceIndex * 8,
            attachX: 25,
            attachY: 50,
            labelPosition: 'left',
          };
        }

        markers.push({
          position,
          instance,
          slot,
          variant,
          // isEmpty = slot needs a variant but none selected yet
          // Slots without variants (hasVariants = false) are never empty - they're finalized when added
          isEmpty: slot?.hasVariants === true && !instance.variant_id,
          key: instance.id,
        });
      });
    }

    return markers;
  }, [silhouette, instancesByGroup, moduleSlotsById, variantsById]);

  const handleMarkerClick = (marker: typeof markerData[0]) => {
    // All markers have an instance (they represent added slots)
    // Clicking any slot opens the catalog to select/change the module
    onSelectInstance?.(marker.instance.id);
  };

  const canvasStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '300px',
    backgroundColor: 'var(--frigate-bg-primary)',
    border: '1px solid var(--frigate-border-base)',
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    left: '8px',
    fontFamily: 'var(--frigate-font-mono)',
    fontSize: '12px',
    color: 'var(--frigate-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const centerMessageStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'var(--frigate-font-mono)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px',
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={canvasStyles}>
        <div style={headerStyles}>[LOADING] BLUEPRINT</div>
        <div style={{ ...centerMessageStyles, color: 'var(--frigate-text-muted)' }}>
          [LOADING SHIP DATA...]
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={canvasStyles}>
        <div style={headerStyles}>[ERROR] BLUEPRINT</div>
        <div style={{ ...centerMessageStyles, color: 'var(--frigate-danger)' }}>
          [LOAD FAILED]
          <div style={{ fontSize: '11px', marginTop: '8px', color: 'var(--frigate-text-muted)' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={canvasStyles}>
      {/* Header */}
      <div style={headerStyles}>
        [{shipClassName ?? silhouette.displayName}] BLUEPRINT
      </div>

      {/* Ship silhouette */}
      <ShipSilhouette silhouette={silhouette} />

      {/* Connection lines layer (SVG) */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {markerData.map((marker) => {
          // Convert attachment point from silhouette space to canvas space
          const attachCanvasCoords = toCanvasCoords(marker.position.attachX, marker.position.attachY);
          return (
            <ConnectionLine
              key={`line-${marker.key}`}
              startX={marker.position.x}
              startY={marker.position.y}
              endX={attachCanvasCoords.x}
              endY={attachCanvasCoords.y}
              isSelected={marker.instance?.id === selectedInstanceId}
              isEmpty={marker.isEmpty}
            />
          );
        })}
      </svg>

      {/* Module slot markers */}
      {markerData.map((marker) => (
        <ModuleSlotMarker
          key={marker.key}
          slot={marker.slot}
          instance={marker.instance}
          variant={marker.variant}
          position={marker.position}
          isSelected={marker.instance?.id === selectedInstanceId}
          isEmpty={marker.isEmpty}
          hasVariants={marker.slot?.hasVariants ?? false}
          onClick={() => handleMarkerClick(marker)}
          onRemove={marker.instance ? () => onRemoveInstance?.(marker.instance!.id) : undefined}
          groupLabel={marker.position.group}
        />
      ))}

      {/* Instructions footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          right: '8px',
          fontFamily: 'var(--frigate-font-mono)',
          fontSize: '10px',
          color: 'var(--frigate-text-muted)',
          textAlign: 'center',
        }}
      >
        [CLICK TO SELECT] [EMPTY SLOTS ADD MODULES]
      </div>
    </div>
  );
}
