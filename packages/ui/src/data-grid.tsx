import React from 'react';
import clsx from 'clsx';
import { BOX_DRAWING, SYSTEM_ABBR } from './constants';

/**
 * DataGrid Component
 * 
 * Terminal-style table with monospace alignment and ASCII separators.
 * Designed for dense technical data display with perfect column alignment.
 */
export interface DataGridColumn<T> {
  /** Column identifier */
  id: string;
  /** Column header label (will be converted to technical abbreviation if possible) */
  label: string;
  /** Width in characters (monospace units) or CSS value */
  width?: string | number;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer */
  render?: (row: T) => React.ReactNode;
  /** Accessor function for sorting */
  accessor?: (row: T) => string | number;
  /** Is column sortable */
  sortable?: boolean;
  /** Use abbreviated header (default: true) */
  abbreviated?: boolean;
}

export interface DataGridProps<T> {
  /** Column definitions */
  columns: DataGridColumn<T>[];
  /** Row data */
  data: T[];
  /** Row key accessor */
  getRowKey: (row: T) => string | number;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys */
  selectedRows?: Set<string | number>;
  /** Row selection handler */
  onRowSelect?: (keys: Set<string | number>) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode (minimal padding) */
  compact?: boolean;
  /** Show ASCII borders */
  bordered?: boolean;
}

export function DataGrid<T>({
  columns,
  data,
  getRowKey,
  selectable = false,
  selectedRows = new Set(),
  onRowSelect,
  onRowClick,
  className,
  compact = true,
  bordered = true,
}: DataGridProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (column: DataGridColumn<T>) => {
    if (!column.sortable || !column.accessor) return;

    if (sortColumn === column.id) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.id);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    const column = columns.find((col) => col.id === sortColumn);
    if (!column || !column.accessor) return data;

    return [...data].sort((a, b) => {
      const aVal = column.accessor!(a);
      const bVal = column.accessor!(b);

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, columns]);

  const handleRowSelect = (key: string | number) => {
    if (!onRowSelect) return;

    const newSelected = new Set(selectedRows);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    onRowSelect(newSelected);
  };

  const handleSelectAll = () => {
    if (!onRowSelect) return;

    if (selectedRows.size === data.length) {
      onRowSelect(new Set());
    } else {
      onRowSelect(new Set(data.map(getRowKey)));
    }
  };

  // Abbreviate header labels for technical density
  const abbreviateHeader = (label: string): string => {
    const upper = label.toUpperCase();
    
    // Check SYSTEM_ABBR mappings
    const abbrevMap: Record<string, string> = {
      'STATUS': 'STS',
      'POWER': 'PWR',
      'TARGET': 'TGT',
      'RANGE': 'RNG',
      'BEARING': 'BRG',
      'VELOCITY': 'VEL',
      'HEADING': 'HDG',
      'ALTITUDE': 'ALT',
      'DISTANCE': 'DIST',
      'TEMPERATURE': 'TEMP',
      'COOLING': 'COOL',
      'SHIELDS': 'SHLD',
      'HULL': 'HULL',
      'ARMOR': 'ARMR',
      'AMMUNITION': 'AMMO',
      'FUEL': 'FUEL',
      'CHARGE': 'CHRG',
      'ENGINES': 'ENG',
      'MISSILES': 'MSLR',
      'BEAM': 'BEAM',
      'TYPE': 'TYPE',
      'NAME': 'NAME',
      'ID': 'ID',
      'PRIORITY': 'PRIO',
      'THREAT': 'THRT',
      'CONTACT': 'CONT',
    };

    return abbrevMap[upper] || upper;
  };

  const cellPadding = compact ? '4px 8px' : 'var(--frigate-space-3)';

  return (
    <div className={clsx('frigate-data-grid', className)} style={{ 
      overflowX: 'auto',
      fontFamily: 'var(--frigate-font-mono)',
    }}>
      {bordered && (
        <div style={{
          color: 'var(--frigate-border-base)',
          fontSize: 'var(--frigate-font-small)',
          lineHeight: 1,
          marginBottom: '2px',
        }}>
          {BOX_DRAWING.TOP_LEFT}{BOX_DRAWING.HORIZONTAL.repeat(60)}{BOX_DRAWING.TOP_RIGHT}
        </div>
      )}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'var(--frigate-font-mono)',
          fontSize: 'var(--frigate-font-small)',
          border: bordered ? `1px solid var(--frigate-border-base)` : 'none',
          borderTop: 'none',
          borderBottom: 'none',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: `1px solid var(--frigate-border-base)`,
              backgroundColor: 'var(--frigate-bg-base)',
            }}
          >
            {selectable && (
              <th
                style={{
                  padding: cellPadding,
                  textAlign: 'center',
                  width: '30px',
                  borderRight: bordered ? `1px solid var(--frigate-border-muted)` : 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                  style={{ cursor: 'pointer' }}
                />
              </th>
            )}
            {columns.map((column, idx) => (
              <th
                key={column.id}
                onClick={() => handleSort(column)}
                style={{
                  padding: cellPadding,
                  textAlign: column.align || 'left',
                  width: column.width,
                  cursor: column.sortable ? 'pointer' : 'default',
                  color: 'var(--frigate-text-secondary)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: 'var(--frigate-font-tiny)',
                  letterSpacing: '0.1em',
                  userSelect: 'none',
                  borderRight: bordered && idx < columns.length - 1 ? `1px solid var(--frigate-border-muted)` : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {column.abbreviated !== false ? abbreviateHeader(column.label) : column.label.toUpperCase()}
                {column.sortable && sortColumn === column.id && (
                  <span style={{ marginLeft: '4px', opacity: 0.7 }}>
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIdx) => {
            const key = getRowKey(row);
            const isSelected = selectedRows.has(key);

            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: rowIdx < sortedData.length - 1 ? `1px solid var(--frigate-border-muted)` : 'none',
                  backgroundColor: isSelected ? 'var(--frigate-primary-muted)' : 'transparent',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 50ms ease',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick && !isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--frigate-bg-raised)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onRowClick && !isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {selectable && (
                  <td
                    style={{
                      padding: cellPadding,
                      textAlign: 'center',
                      borderRight: bordered ? `1px solid var(--frigate-border-muted)` : 'none',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRowSelect(key)}
                      aria-label={`Select row ${key}`}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                )}
                {columns.map((column, idx) => (
                  <td
                    key={column.id}
                    style={{
                      padding: cellPadding,
                      textAlign: column.align || 'left',
                      color: 'var(--frigate-text-primary)',
                      borderRight: bordered && idx < columns.length - 1 ? `1px solid var(--frigate-border-muted)` : 'none',
                      fontFamily: 'var(--frigate-font-mono)',
                      fontSize: 'var(--frigate-font-small)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {column.render ? column.render(row) : String((row as any)[column.id] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {bordered && (
        <div style={{
          color: 'var(--frigate-border-base)',
          fontSize: 'var(--frigate-font-small)',
          lineHeight: 1,
          marginTop: '2px',
        }}>
          {BOX_DRAWING.BOTTOM_LEFT}{BOX_DRAWING.HORIZONTAL.repeat(60)}{BOX_DRAWING.BOTTOM_RIGHT}
        </div>
      )}
      {data.length === 0 && (
        <div
          style={{
            padding: 'var(--frigate-space-8)',
            textAlign: 'center',
            color: 'var(--frigate-text-tertiary)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-small)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          [NO DATA]
        </div>
      )}
    </div>
  );
}
