/**
 * ShipClassSelect - Ship class dropdown for ship creation modal
 */
import React from 'react';
import { Select, Badge } from '../components';
import type { ShipClassSummary, ShipClassDetails } from '../types/shipClass';

/**
 * Format credit values with thousand separators
 */
function formatCredits(value: number | undefined): string {
  if (value === undefined || value === null) return '---';
  return value.toLocaleString();
}

export interface ShipClassSelectProps {
  selectedClassId: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  isLoading: boolean;
  availableClasses: ShipClassSummary[];
  selectedClassDetails?: ShipClassDetails | null;
}

export function ShipClassSelect({
  selectedClassId,
  onChange,
  disabled = false,
  isLoading,
  availableClasses,
  selectedClassDetails,
}: ShipClassSelectProps) {
  return (
    <div>
      <label
        htmlFor="ship-class"
        style={{
          display: 'block',
          marginBottom: 'var(--frigate-space-2)',
          fontFamily: 'var(--frigate-font-mono)',
          fontSize: 'var(--frigate-font-small)',
          color: 'var(--frigate-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        SHIP CLASS:
      </label>
      <Select
        id="ship-class"
        value={selectedClassId}
        onChange={onChange}
        disabled={disabled || isLoading}
        fullWidth
      >
        {isLoading ? (
          <option>LOADING...</option>
        ) : availableClasses.length === 0 ? (
          <option>NO SHIP CLASSES AVAILABLE</option>
        ) : (
          availableClasses.map((shipClass) => (
            <option key={shipClass.id} value={shipClass.id}>
              {shipClass.name.toUpperCase()} - {formatCredits(shipClass.cost)} CR - {shipClass.build_points} BP
            </option>
          ))
        )}
      </Select>
      {selectedClassDetails && (
        <div
          style={{
            marginTop: 'var(--frigate-space-2)',
            padding: 'var(--frigate-space-2)',
            backgroundColor: 'var(--frigate-bg-surface)',
            border: '1px solid var(--frigate-border-base)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--frigate-space-2)', flexWrap: 'wrap' }}>
            <Badge variant="default" size="sm">
              {selectedClassDetails.size}
            </Badge>
            <Badge variant="primary" size="sm">
              {selectedClassDetails.role}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
