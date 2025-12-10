import React, { useMemo, useEffect, useCallback, useState } from 'react';
import type { ModuleSlot, ModuleVariant, ModuleInstance } from '@frigate/api-client';
import type { ShipBlueprintCanvasProps, SlotPosition } from './types';
import { ShipSilhouette, SILHOUETTE_LAYOUT } from './ShipSilhouette';
import { ModuleSlotMarker } from './ModuleSlotMarker';
import { ConnectionLine } from './ConnectionLine';
import {
  getSilhouetteBySize,
  inferShipSize,
  generateSlotPositions,
  type ShipSize,
} from './silhouettes';

/**
 * Convert a position from silhouette-relative (0-100%) to canvas-relative coordinates
 * The silhouette is positioned within the canvas with offsets defined in SILHOUETTE_LAYOUT
 */
function toCanvasCoords(silhouetteX: number, silhouetteY: number): { x: number; y: number } {
  const x = SILHOUETTE_LAYOUT.left + (silhouetteX / 100) * SILHOUETTE_LAYOUT.width;
  const y = SILHOUETTE_LAYOUT.top + (silhouetteY / 100) * SILHOUETTE_LAYOUT.height;
  return { x, y };
}

/**
 * Main ship blueprint canvas component
 *
 * Displays a top-down ship silhouette with module slot markers positioned
 * dynamically based on module group and instance ID.
 */
export function ShipBlueprintCanvas({
  shipClassId,
  shipClassName,
  shipSize: explicitShipSize,
  moduleSlots: _moduleSlots,
  moduleSlotsById,
  variantsById = {},
  instances,
  selectedInstanceId: _selectedInstanceId,
  onSelectInstance,
  onRemoveInstance,
  onClearSelection: _onClearSelection,
  isLoading = false,
  error = null,
}: ShipBlueprintCanvasProps) {
  // Track which instance is currently hovered for highlighting
  const [hoveredInstanceId, setHoveredInstanceId] = useState<string | null>(null);

  // Determine ship size (explicit or inferred from class name)
  const shipSize: ShipSize = useMemo(() => {
    if (explicitShipSize) return explicitShipSize;
    return inferShipSize(shipClassId, shipClassName);
  }, [explicitShipSize, shipClassId, shipClassName]);

  // Get the appropriate silhouette for this ship size
  const silhouette = useMemo(
    () => getSilhouetteBySize(shipSize),
    [shipSize]
  );

  // Generate dynamic slot positions for all instances
  const instancePositions = useMemo(() => {
    return generateSlotPositions(instances, moduleSlotsById, shipSize);
  }, [instances, moduleSlotsById, shipSize]);

  // Build marker data with dynamically generated positions
  const markerData = useMemo(() => {
    const markers: Array<{
      position: SlotPosition;
      instance: ModuleInstance;
      slot?: ModuleSlot;
      variant?: ModuleVariant;
      isEmpty: boolean;
      key: string;
    }> = [];

    for (const instance of instances) {
      const slot = moduleSlotsById[instance.module_slot_id];
      const variant = instance.variant_id ? variantsById[instance.variant_id] : undefined;

      // Get the dynamically generated position for this instance
      const position = instancePositions.get(instance.id);

      if (!position) {
        // Fallback position if somehow not generated
        const fallbackPosition: SlotPosition = {
          group: slot?.groups?.[0] ?? 'unknown',
          x: 8,
          y: 50,
          attachX: 50,
          attachY: 50,
          labelPosition: 'left',
        };
        markers.push({
          position: fallbackPosition,
          instance,
          slot,
          variant,
          isEmpty: slot?.hasVariants === true && !instance.variant_id,
          key: instance.id,
        });
        continue;
      }

      markers.push({
        position,
        instance,
        slot,
        variant,
        isEmpty: slot?.hasVariants === true && !instance.variant_id,
        key: instance.id,
      });
    }

    return markers;
  }, [instances, moduleSlotsById, variantsById, instancePositions]);

  const handleMarkerClick = (marker: typeof markerData[0]) => {
    onSelectInstance?.(marker.instance.id);
  };

  const canvasStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '400px',
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

  // Size indicator for display
  const sizeLabel = shipSize === 'small' ? 'LIGHT' : shipSize === 'large' ? 'CAPITAL' : 'MEDIUM';

  return (
    <div style={canvasStyles}>
      {/* Header */}
      <div style={headerStyles}>
        [{shipClassName ?? silhouette.displayName}] BLUEPRINT
        <span style={{ marginLeft: '12px', opacity: 0.6 }}>
          [{sizeLabel}]
        </span>
      </div>

      {/* Ship silhouette (top-down view) */}
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
          const attachCanvasCoords = toCanvasCoords(marker.position.attachX, marker.position.attachY);
          return (
            <ConnectionLine
              key={`line-${marker.key}`}
              startX={marker.position.x}
              startY={marker.position.y}
              endX={attachCanvasCoords.x}
              endY={attachCanvasCoords.y}
              isHighlighted={marker.instance?.id === hoveredInstanceId}
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
          isHighlighted={marker.instance?.id === hoveredInstanceId}
          isEmpty={marker.isEmpty}
          hasVariants={marker.slot?.hasVariants ?? false}
          onClick={() => handleMarkerClick(marker)}
          onRemove={marker.instance ? () => onRemoveInstance?.(marker.instance!.id) : undefined}
          onMouseEnter={() => setHoveredInstanceId(marker.instance?.id ?? null)}
          onMouseLeave={() => setHoveredInstanceId(null)}
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
        [HOVER TO HIGHLIGHT] [CLICK TO CONFIGURE]
      </div>
    </div>
  );
}
