/**
 * AmmunitionTooltip Component
 *
 * Specialized tooltip for ammunition items following the hard sci-fi design philosophy.
 * Displays ammo stats, compatibility status, and description on hover.
 */
import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import type { Ammunition } from '@frigate/api-client';

/**
 * AmmunitionTooltip Props
 */
export interface AmmunitionTooltipProps {
  /** Element to attach tooltip to */
  children: ReactNode;
  /** Ammunition data to display */
  ammo: Ammunition;
  /** Whether this ammo is compatible with installed weapons */
  isCompatible: boolean;
  /** Reason for incompatibility (if not compatible) */
  incompatibilityReason?: string;
  /** Names of compatible weapons (if any) */
  compatibleWeapons?: string[];
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Max width of tooltip */
  maxWidth?: number;
}

/**
 * Format number with thousand separators
 */
function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Stat row component for tooltip
 */
function StatRow({
  label,
  value,
  unit = '',
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 0',
      }}
    >
      <span
        style={{
          color: 'var(--frigate-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
      <span style={{ fontWeight: 600, color: 'var(--frigate-text-primary)' }}>
        {value}
        {unit && (
          <span style={{ color: 'var(--frigate-text-muted)', marginLeft: '2px' }}>
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * AmmunitionTooltip Component
 *
 * Displays detailed ammunition information in a technical tooltip panel.
 *
 * Features:
 * - Follows mouse cursor with smart viewport positioning
 * - Monospace typography
 * - Stat rows with labels, values, and units
 * - Compatibility indicator with weapon names
 * - Category and type display
 *
 * @example
 * ```tsx
 * <AmmunitionTooltip
 *   ammo={ammoData}
 *   isCompatible={true}
 *   compatibleWeapons={['200mm Railgun Mk1']}
 * >
 *   <AmmunitionCard ... />
 * </AmmunitionTooltip>
 * ```
 */
export function AmmunitionTooltip({
  children,
  ammo,
  isCompatible,
  incompatibilityReason,
  compatibleWeapons = [],
  delay = 300,
  disabled = false,
  maxWidth = 300,
}: AmmunitionTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  // Calculate tooltip position based on mouse cursor
  const calculatePosition = useCallback(() => {
    if (!tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const offset = 16; // Distance from cursor

    let x = mouseCoords.x + offset;
    let y = mouseCoords.y + offset;

    // Keep tooltip within viewport
    if (x + tooltipRect.width > window.innerWidth - 8) {
      x = mouseCoords.x - tooltipRect.width - offset;
    }
    if (y + tooltipRect.height > window.innerHeight - 8) {
      y = mouseCoords.y - tooltipRect.height - offset;
    }
    // Ensure minimum margins from edges
    x = Math.max(8, x);
    y = Math.max(8, y);

    setCoords({ x, y });
  }, [mouseCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseCoords({ x: e.clientX, y: e.clientY });
  }, []);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = window.setTimeout(() => {
      setVisible(true);
    }, delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  }, []);

  // Recalculate position when visible or mouse moves
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [visible, calculatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Build type string (e.g., "KINETIC / 200MM / AP")
  const typeString = [
    ammo.category.toUpperCase(),
    ammo.ammo_size?.toUpperCase(),
    ammo.ammo_type?.toUpperCase(),
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    <>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onMouseMove={handleMouseMove}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: 'contents' }}
      >
        {children}
      </div>

      {visible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            zIndex: 9999,
            maxWidth: `${maxWidth}px`,
            pointerEvents: 'none',
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-tiny)',
            backgroundColor: 'var(--frigate-bg-raised)',
            border: '1px solid var(--frigate-primary)',
            color: 'var(--frigate-text-primary)',
            padding: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 'var(--frigate-space-2)',
              borderBottom: '1px solid var(--frigate-border-base)',
              backgroundColor: 'var(--frigate-bg-base)',
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 'var(--frigate-font-small)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {ammo.name}
            </div>
            <div
              style={{
                fontSize: 'var(--frigate-font-tiny)',
                color: 'var(--frigate-text-secondary)',
                marginTop: '2px',
              }}
            >
              {typeString}
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              padding: 'var(--frigate-space-2)',
              borderBottom: '1px solid var(--frigate-border-base)',
              color: 'var(--frigate-text-secondary)',
              lineHeight: 1.4,
            }}
          >
            {ammo.description}
          </div>

          {/* Stats Grid */}
          <div
            style={{
              padding: 'var(--frigate-space-2)',
              borderBottom: '1px solid var(--frigate-border-base)',
            }}
          >
            <StatRow label="COST" value={formatNumber(ammo.cost)} unit="CR" />
            <StatRow label="WEIGHT" value={ammo.weight} unit="t" />
            <StatRow label="DAMAGE" value={formatNumber(ammo.impact_damage)} />
            <StatRow label="VELOCITY" value={formatNumber(ammo.velocity)} unit="m/s" />
            <StatRow label="PENETRATION" value={ammo.armor_penetration} />
            {ammo.blast_radius > 0 && (
              <>
                <StatRow label="BLAST RADIUS" value={ammo.blast_radius} unit="m" />
                <StatRow label="BLAST DMG" value={formatNumber(ammo.blast_damage)} />
              </>
            )}
          </div>

          {/* Compatibility Section */}
          <div
            style={{
              padding: 'var(--frigate-space-2)',
              backgroundColor: isCompatible
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(245, 158, 11, 0.1)',
            }}
          >
            {isCompatible ? (
              <>
                <div
                  style={{
                    fontWeight: 700,
                    color: 'var(--frigate-success)',
                    marginBottom: compatibleWeapons.length > 0 ? '4px' : 0,
                  }}
                >
                  [COMPATIBLE]
                </div>
                {compatibleWeapons.length > 0 && (
                  <div style={{ color: 'var(--frigate-text-secondary)' }}>
                    {compatibleWeapons.map((weapon, idx) => (
                      <div key={idx} style={{ paddingLeft: 'var(--frigate-space-1)' }}>
                        {weapon}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, color: 'var(--frigate-warning)' }}>
                  [INCOMPATIBLE]
                </div>
                {incompatibilityReason && (
                  <div
                    style={{
                      color: 'var(--frigate-text-secondary)',
                      marginTop: '2px',
                    }}
                  >
                    {incompatibilityReason}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AmmunitionTooltip;
