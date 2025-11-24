/**
 * Ship Class Card Component - Phase 4.12.5
 * 
 * Compact card display for ship class in grid view.
 * Shows key stats and badges, clickable to expand details.
 */

import React from 'react';
import { Badge } from '../components';
import type { ShipClassSummary } from '../types/shipClass';

export interface ShipClassCardProps {
  /** Ship class summary data */
  shipClass: ShipClassSummary;
  /** Whether this card is selected/expanded */
  isSelected?: boolean;
  /** Click handler */
  onClick: () => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Ship Class Card
 * 
 * Compact card for grid display of ship classes.
 * Shows name, size/role badges, build points, and modules.
 * Highlights when selected, clickable to expand details.
 */
export function ShipClassCard({
  shipClass,
  isSelected = false,
  onClick,
  className = '',
}: ShipClassCardProps): React.ReactElement {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={className}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${shipClass.name}, ${shipClass.size} ${shipClass.role}, ${shipClass.max_modules} modules, ${shipClass.build_points} build points`}
      style={{
        backgroundColor: isSelected ? 'var(--frigate-bg-surface)' : 'var(--frigate-bg-base)',
        border: isSelected 
          ? '2px solid var(--frigate-primary)' 
          : '1px solid var(--frigate-border-base)',
        padding: 'var(--frigate-space-3)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--frigate-border-hover)';
          e.currentTarget.style.backgroundColor = 'var(--frigate-bg-surface)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--frigate-border-base)';
          e.currentTarget.style.backgroundColor = 'var(--frigate-bg-base)';
        }
      }}
    >
      {/* Ship Class Name */}
      <div
        style={{
          fontFamily: 'var(--frigate-font-mono)',
          fontSize: 'var(--frigate-font-body)',
          fontWeight: 600,
          color: isSelected ? 'var(--frigate-primary)' : 'var(--frigate-text-primary)',
          marginBottom: 'var(--frigate-space-2)',
          textTransform: 'uppercase',
        }}
      >
        {shipClass.name}
      </div>

      {/* Badges */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--frigate-space-1)',
          marginBottom: 'var(--frigate-space-2)',
          flexWrap: 'wrap',
        }}
      >
        <Badge variant="default" size="sm">
          {shipClass.size}
        </Badge>
        <Badge variant="primary" size="sm">
          {shipClass.role}
        </Badge>
      </div>

      {/* Description */}
      <div
        style={{
          fontFamily: 'var(--frigate-font-sans)',
          fontSize: 'var(--frigate-font-small)',
          color: 'var(--frigate-text-secondary)',
          marginBottom: 'var(--frigate-space-3)',
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {shipClass.description}
      </div>

      {/* Stats */}
      <div
        style={{
          borderTop: '1px solid var(--frigate-border-base)',
          paddingTop: 'var(--frigate-space-2)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--frigate-space-2)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-tiny)',
                color: 'var(--frigate-text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Modules:
            </div>
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-primary)',
                fontWeight: 600,
              }}
            >
              {shipClass.max_modules}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-tiny)',
                color: 'var(--frigate-text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Build Points:
            </div>
            <div
              style={{
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-primary)',
                fontWeight: 600,
              }}
            >
              {shipClass.build_points}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div
          style={{
            marginTop: 'var(--frigate-space-2)',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-tiny)',
            color: 'var(--frigate-primary)',
            textAlign: 'center',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          ▶ SELECTED
        </div>
      )}
    </div>
  );
}
