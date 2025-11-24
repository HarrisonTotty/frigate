/**
 * Ship Class Browser Component - Phase 4.12.5
 * 
 * Standalone browser for exploring all available ship classes.
 * Features grid view, filtering, sorting, and detailed inspection.
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '../components';
import { Stack } from '../layout';
import { LoadingText } from '../loading';
import { ShipClassCard } from '../shipclass';
import { ShipClassBrowserHeader } from './ShipClassBrowserHeader';
import { ShipClassFilters } from './ShipClassFilters';
import { ShipClassGrid } from './ShipClassGrid';
import { ShipClassDetails } from './ShipClassDetails';
import { useShipClassStore } from '../stores/shipClassStore';
import type { ShipClassSummary, ShipSize, ShipRole, ShipClassSortBy, SortOrder } from '../types/shipClass';

export interface ShipClassBrowserProps {
  /** Optional faction filter */
  factionId?: string | null;
  /** Whether browser is open */
  isOpen: boolean;
  /** Callback when browser closes */
  onClose: () => void;
  /** Optional callback when ship class is selected */
  onSelect?: (shipClassId: string) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Ship Class Browser
 * 
 * Comprehensive browser for exploring ship classes:
 * - Grid view of all available classes
 * - Filter by size, role, faction
 * - Sort by various criteria
 * - Click to expand full details
 * - Optional selection for pre-populating creation
 */
export function ShipClassBrowser({
  factionId,
  isOpen,
  onClose,
  onSelect,
  className = '',
}: ShipClassBrowserProps): React.ReactElement | null {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [filterSize, setFilterSize] = useState<ShipSize | 'all'>('all');
  const [filterRole, setFilterRole] = useState<ShipRole | 'all'>('all');
  const [sortBy, setSortBy] = useState<ShipClassSortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [detailsLoading, setDetailsLoading] = useState(false);

  const shipClassStore = useShipClassStore();

  // Load ship classes when browser opens
  useEffect(() => {
    if (isOpen) {
      shipClassStore.loadShipClasses(factionId || undefined);
    }
  }, [isOpen, factionId]);

  // Load details when selection changes
  useEffect(() => {
    if (selectedClassId) {
      setDetailsLoading(true);
      shipClassStore.loadShipClassDetail(selectedClassId).finally(() => {
        setDetailsLoading(false);
      });
    }
  }, [selectedClassId]);

  // Apply filters
  const filteredClasses = shipClassStore.filterShipClasses({
    size: filterSize !== 'all' ? filterSize : undefined,
    role: filterRole !== 'all' ? filterRole : undefined,
  });

  // Apply sorting
  const sortedClasses = shipClassStore.sortShipClasses(
    filteredClasses,
    sortBy,
    sortOrder
  );

  // Get selected class details
  const selectedClassDetails = selectedClassId
    ? shipClassStore.shipClassDetails[selectedClassId]
    : null;

  const handleCardClick = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleSelect = () => {
    if (selectedClassId && onSelect) {
      onSelect(selectedClassId);
      onClose();
    }
  };

  const handleClearFilters = () => {
    setFilterSize('all');
    setFilterRole('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ship-class-browser-title"
      onKeyDown={handleKeyDown}
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
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={className}
        style={{
          width: '100%',
          maxWidth: '1600px',
          height: '90vh',
          maxHeight: '1000px',
          border: '2px solid var(--frigate-primary)',
          backgroundColor: 'var(--frigate-bg-base)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ShipClassBrowserHeader selectedClassId={selectedClassId} onSelect={onSelect ? handleSelect : undefined} onClose={onClose} />

        <ShipClassFilters
          filterSize={filterSize}
          setFilterSize={setFilterSize}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClear={handleClearFilters}
          resultCount={sortedClasses.length}
        />

        {/* Main Content - Grid and Details */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            gap: 'var(--frigate-space-4)',
            padding: 'var(--frigate-space-4)',
          }}
        >
          <div
            style={{
              width: selectedClassId ? '400px' : '100%',
              overflow: 'auto',
              transition: 'width 0.3s ease',
            }}
          >
            <ShipClassGrid classes={sortedClasses} isLoading={shipClassStore.isLoading} selectedClassId={selectedClassId} onCardClick={handleCardClick} />
          </div>

          {/* Right: Details Panel */}
          {selectedClassId && (
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                backgroundColor: 'var(--frigate-bg-base)',
                border: '1px solid var(--frigate-border-base)',
              }}
            >
              <ShipClassDetails details={selectedClassDetails} loading={detailsLoading} factionId={factionId || undefined} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
