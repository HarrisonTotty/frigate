import React from 'react';
import { Select, Button } from '../components';
import type { ShipSize, ShipRole, ShipClassSortBy, SortOrder } from '../types/shipClass';

interface FiltersProps {
  filterSize: ShipSize | 'all';
  setFilterSize: (v: ShipSize | 'all') => void;
  filterRole: ShipRole | 'all';
  setFilterRole: (v: ShipRole | 'all') => void;
  sortBy: ShipClassSortBy;
  setSortBy: (v: ShipClassSortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (v: SortOrder) => void;
  onClear: () => void;
  resultCount: number;
}

export function ShipClassFilters({
  filterSize,
  setFilterSize,
  filterRole,
  setFilterRole,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onClear,
  resultCount,
}: FiltersProps) {
  return (
    <div
      role="region"
      aria-label="Ship class filters and sorting"
      style={{
        padding: 'var(--frigate-space-3)',
        borderBottom: '1px solid var(--frigate-border-base)',
        backgroundColor: 'var(--frigate-bg-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--frigate-space-3)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--frigate-space-2)' }}>
          <label
            htmlFor="filter-size"
            style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            SIZE:
          </label>
          <Select
            id="filter-size"
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value as ShipSize | 'all')}
            aria-label="Filter by ship size"
          >
            <option value="all">ALL</option>
            <option value="Small">SMALL</option>
            <option value="Medium">MEDIUM</option>
            <option value="Large">LARGE</option>
          </Select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--frigate-space-2)' }}>
          <label
            htmlFor="filter-role"
            style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            ROLE:
          </label>
          <Select
            id="filter-role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as ShipRole | 'all')}
            aria-label="Filter by ship role"
          >
            <option value="all">ALL</option>
            <option value="Versatile">VERSATILE</option>
            <option value="Combat">COMBAT</option>
            <option value="Support">SUPPORT</option>
            <option value="Transport">TRANSPORT</option>
            <option value="Exploration">EXPLORATION</option>
            <option value="Offense">OFFENSE</option>
            <option value="Defense">DEFENSE</option>
          </Select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--frigate-space-2)' }}>
          <label
            htmlFor="sort-by"
            style={{
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'var(--frigate-font-small)',
              color: 'var(--frigate-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            SORT:
          </label>
          <Select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ShipClassSortBy)}
            aria-label="Sort ship classes by"
          >
            <option value="name">NAME</option>
            <option value="buildPoints">BUILD POINTS</option>
            <option value="maxModules">MAX MODULES</option>
            <option value="size">SIZE</option>
            <option value="role">ROLE</option>
          </Select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--frigate-space-2)' }}>
          <Button
            variant={sortOrder === 'asc' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSortOrder('asc')}
          >
            [ASC]
          </Button>
          <Button
            variant={sortOrder === 'desc' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSortOrder('desc')}
          >
            [DESC]
          </Button>
        </div>

        <Button variant="secondary" size="sm" onClick={onClear}>
          [CLEAR FILTERS]
        </Button>

        <div
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            color: 'var(--frigate-text-muted)',
          }}
        >
          {resultCount} SHIP {resultCount === 1 ? 'CLASS' : 'CLASSES'}
        </div>
      </div>
    </div>
  );
}
