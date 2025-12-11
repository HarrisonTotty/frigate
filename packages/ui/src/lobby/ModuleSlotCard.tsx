import React from 'react';
import type { ModuleSlot } from '@frigate/api-client';
import { ModuleTooltip, type TooltipStatRow } from '../components/ModuleTooltip';

/**
 * Format credit values with thousand separators
 */
function formatCredits(value: number | undefined): string {
  if (value === undefined || value === null || value === 0) return '---';
  return value.toLocaleString();
}

export interface ModuleSlotCardProps {
  slot: ModuleSlot;
  currentCount: number;
  maxBuildPoints: number;
  buildPointsUsed: number;
  onAdd: (slot: ModuleSlot) => void;
  onToggleDetails: (id: string) => void;
  isExpanded: boolean;
  disabled?: boolean;
  /** Show compact view (hides description) */
  compact?: boolean;
}

export function ModuleSlotCard({
  slot,
  currentCount,
  maxBuildPoints,
  buildPointsUsed,
  onAdd,
  onToggleDetails,
  isExpanded,
  disabled = false,
  compact = false,
}: ModuleSlotCardProps) {
  const safeName = typeof slot.name === 'string' && slot.name.length > 0 ? slot.name : '[Unnamed Slot]';
  const safeId = typeof slot.id === 'string' ? slot.id : '[No ID]';
  const safeGroups = Array.isArray(slot.groups) && slot.groups.length > 0 ? slot.groups : ['Other'];
  const safeBaseCost = typeof slot.base_cost === 'number' ? slot.base_cost : 0;
  const safeMaxSlots = typeof slot.max_slots === 'number' ? slot.max_slots : 1;
  const safeRequired = typeof slot.required === 'boolean' ? slot.required : false;
  const safeDescription = typeof slot.description === 'string' ? slot.description : '';
  const canAdd = safeBaseCost <= (maxBuildPoints - buildPointsUsed);
  const atMaxSlots = currentCount >= safeMaxSlots;

  // Truncate description to ~50 chars for display in card
  const truncatedDescription = safeDescription.length > 50
    ? safeDescription.substring(0, 47) + '...'
    : safeDescription;

  // ASCII borders are decorative - use CSS to contain them within card width
  // The card uses overflow: hidden to clip any overflow gracefully

  // Get credit cost (optional field)
  const safeCreditCost = typeof slot.credit_cost === 'number' ? slot.credit_cost : 0;

  // Build tooltip stats
  const tooltipStats: TooltipStatRow[] = [
    { label: 'BASE COST', value: safeBaseCost, unit: 'BP' },
    { label: 'CREDIT COST', value: safeCreditCost > 0 ? formatCredits(safeCreditCost) : '---', unit: safeCreditCost > 0 ? 'CR' : '' },
    { label: 'MAX SLOTS', value: safeMaxSlots },
    { label: 'INSTALLED', value: currentCount },
  ];

  // Build tooltip tags
  const tooltipTags: string[] = [];
  if (safeRequired) tooltipTags.push('[REQUIRED]');
  // hasVariants is normalized by useCatalog
  if (slot.hasVariants) tooltipTags.push('[HAS VARIANTS]');
  if (!canAdd) tooltipTags.push('[OVER BUDGET]');

  return (
    <ModuleTooltip
      title={safeName}
      subtitle={safeGroups.join(' / ')}
      description={safeDescription || undefined}
      stats={tooltipStats}
      tags={tooltipTags}
      position="right"
      delay={300}
    >
      <div
        className="frigate-ascii-border frigate-dense-layout"
        style={{
          fontFamily: 'var(--frigate-font-mono)',
          background: 'var(--frigate-bg-surface)',
          color: 'var(--frigate-text-primary)',
          marginBottom: 'var(--frigate-space-1)',
          borderRadius: 'var(--frigate-radius-none)',
          boxShadow: 'none',
          padding: 0,
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          border: '1px solid var(--frigate-primary)',
        }}
        tabIndex={0}
        aria-label={`Module Slot ${safeName}`}
        role="group"
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '4px 12px',
          fontFamily: 'var(--frigate-font-mono)',
          gap: '2px',
        }}>
          {/* Row 1: Name, badges, and slot count */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {safeName}
              </span>
              {safeRequired && (
                <span style={{
                  color: 'var(--frigate-warning)',
                  fontWeight: 700,
                  fontSize: 'var(--frigate-font-tiny)',
                  whiteSpace: 'nowrap',
                }}>
                  [REQ]
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Slot count indicator */}
              <span style={{
                color: atMaxSlots ? 'var(--frigate-text-muted)' : 'var(--frigate-text-secondary)',
                fontSize: 'var(--frigate-font-tiny)',
                fontWeight: 600,
              }}>
                {currentCount}/{safeMaxSlots}
              </span>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: canAdd && !disabled && !atMaxSlots ? 'var(--frigate-primary)' : 'var(--frigate-text-muted)',
                  fontWeight: 700,
                  padding: 0,
                  cursor: canAdd && !disabled && !atMaxSlots ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'inherit',
                }}
                onClick={() => canAdd && !disabled && !atMaxSlots && onAdd(slot)}
                disabled={!canAdd || disabled || atMaxSlots}
                aria-label={`Add slot ${safeName}${atMaxSlots ? ' (max reached)' : ''}`}
              >
                [ADD]
              </button>
            </div>
          </div>
          {/* Row 2: Description (when not compact and has description) */}
          {!compact && truncatedDescription && (
            <div style={{
              color: 'var(--frigate-text-muted)',
              fontSize: 'var(--frigate-font-tiny)',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {truncatedDescription}
            </div>
          )}
          {/* Row 3: Cost indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--frigate-font-tiny)',
            color: 'var(--frigate-text-secondary)',
          }}>
            <span>
              {safeBaseCost} BP
              {safeCreditCost > 0 && (
                <span style={{ marginLeft: '8px', color: 'var(--frigate-text-muted)' }}>
                  | {formatCredits(safeCreditCost)} CR
                </span>
              )}
            </span>
            {!canAdd && (
              <span style={{ color: 'var(--frigate-warning)', fontWeight: 700 }}>
                [OVER BUDGET]
              </span>
            )}
          </div>
        </div>
      </div>
    </ModuleTooltip>
  );
}

export default ModuleSlotCard;
