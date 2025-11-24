/**
 * Ship Class Detail Panel Component - Phase 4.12.2
 * 
 * Displays comprehensive ship class information including:
 * - Name, designation, and description
 * - Faction-specific manufacturer information
 * - Lore and historical context
 * - Availability and cost information
 */

import React from 'react';
import { Panel, Stack } from '../layout';
import { Badge } from '../components';
import type { ShipClassDetails, ManufacturerInfo } from '../types/shipClass';

export interface ShipClassDetailPanelProps {
  /** Ship class details from API */
  shipClass: ShipClassDetails;
  /** Optional faction ID to show faction-specific info */
  factionId?: string;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Ship Class Detail Panel
 * 
 * Shows comprehensive information about a ship class including
 * faction-specific variants and lore.
 */
export function ShipClassDetailPanel({
  shipClass,
  factionId,
  className = '',
}: ShipClassDetailPanelProps): React.ReactElement {
  // Get faction-specific manufacturer if available
  const manufacturer: ManufacturerInfo | null = factionId
    ? shipClass.manufacturers[factionId] || null
    : null;

  // Generate designation (variant + class name)
  const designation = manufacturer?.variant
    ? `${manufacturer.variant} ${shipClass.name}`
    : shipClass.name;

  return (
    <div className={className}>
      <Stack gap={3}>
        {/* Header Section */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--frigate-space-3)',
              marginBottom: 'var(--frigate-space-2)',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-heading)',
                fontWeight: 'bold',
                color: 'var(--frigate-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {designation}
            </h3>
            <Badge variant="info" size="sm">
              {shipClass.size.toUpperCase()}
            </Badge>
            <Badge variant="neutral" size="sm">
              {shipClass.role.toUpperCase()}
            </Badge>
          </div>

          {/* Manufacturer Info (if faction-specific) */}
          {manufacturer && (
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-secondary)',
                marginBottom: 'var(--frigate-space-2)',
              }}
            >
              MANUFACTURED BY: {manufacturer.manufacturer.toUpperCase()}
            </div>
          )}

          {/* Year Introduced */}
          {shipClass.year_introduced && (
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-muted)',
              }}
            >
              INTRODUCED: {shipClass.year_introduced}
            </div>
          )}
        </div>

        {/* Description */}
        <div
          style={{
            backgroundColor: 'var(--frigate-bg-surface)',
            border: '1px solid var(--frigate-border-base)',
            padding: 'var(--frigate-space-3)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-text-secondary)',
              marginBottom: 'var(--frigate-space-2)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            OVERVIEW:
          </div>
          <div
            style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-text-primary)',
              lineHeight: 1.6,
            }}
          >
            {shipClass.description}
          </div>
        </div>

        {/* Faction-Specific Lore */}
        {manufacturer?.lore && (
          <div
            style={{
              backgroundColor: 'var(--frigate-bg-surface)',
              border: '1px solid var(--frigate-border-base)',
              padding: 'var(--frigate-space-3)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-secondary)',
                marginBottom: 'var(--frigate-space-2)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              MANUFACTURER NOTES:
            </div>
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-primary)',
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
              {manufacturer.lore}
            </div>
          </div>
        )}

        {/* General Lore */}
        {shipClass.lore && (
          <div
            style={{
              backgroundColor: 'var(--frigate-bg-surface)',
              border: '1px solid var(--frigate-border-base)',
              padding: 'var(--frigate-space-3)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-secondary)',
                marginBottom: 'var(--frigate-space-2)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              HISTORICAL RECORD:
            </div>
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-tiny)',
                color: 'var(--frigate-text-secondary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {shipClass.lore}
            </div>
          </div>
        )}

        {/* Notable Ships */}
        {shipClass.notable_ships && shipClass.notable_ships.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--frigate-bg-surface)',
              border: '1px solid var(--frigate-border-base)',
              padding: 'var(--frigate-space-3)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-secondary)',
                marginBottom: 'var(--frigate-space-2)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              NOTABLE VESSELS:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--frigate-space-2)' }}>
              {shipClass.notable_ships.map((ship, index) => (
                <div
                  key={index}
                  style={{
                    fontFamily: 'var(--frigate-font-mono)',
                    fontSize: 'var(--frigate-font-tiny)',
                    color: 'var(--frigate-primary)',
                    backgroundColor: 'var(--frigate-bg-base)',
                    padding: 'var(--frigate-space-1) var(--frigate-space-2)',
                    border: '1px solid var(--frigate-border-base)',
                  }}
                >
                  {ship}
                </div>
              ))}
            </div>
          </div>
        )}
      </Stack>
    </div>
  );
}
