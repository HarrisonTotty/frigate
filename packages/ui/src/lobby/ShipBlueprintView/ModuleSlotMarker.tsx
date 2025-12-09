import React from 'react';
import type { ModuleSlotMarkerProps } from './types';
import { ModuleTooltip, type TooltipStatRow } from '../../components/ModuleTooltip';

/**
 * Abbreviation map for module slot groups
 */
const GROUP_ABBREVIATIONS: Record<string, string> = {
  propulsion: 'ENG',
  power: 'PWR',
  weapons: 'WPN',
  defense: 'DEF',
  sensors: 'SEN',
  utility: 'UTL',
  cargo: 'CRG',
  shields: 'SHD',
};

/**
 * Get abbreviated label for a module group
 */
function getGroupAbbreviation(group: string): string {
  return GROUP_ABBREVIATIONS[group.toLowerCase()] ?? group.slice(0, 3).toUpperCase();
}

/**
 * Build tooltip stats from slot and variant data
 */
function buildTooltipStats(
  slot: ModuleSlotMarkerProps['slot'],
  variant: ModuleSlotMarkerProps['variant']
): TooltipStatRow[] {
  const stats: TooltipStatRow[] = [];

  if (slot) {
    stats.push({ label: 'BASE COST', value: slot.base_cost, unit: 'BP' });
    stats.push({ label: 'BASE HP', value: slot.base_hp });
    stats.push({ label: 'POWER', value: slot.base_power_consumption, unit: 'MW' });
    stats.push({ label: 'HEAT', value: slot.base_heat_generation, unit: 'kWth' });
    stats.push({ label: 'WEIGHT', value: slot.base_weight, unit: 'kg' });
  }

  if (variant) {
    // Show variant-specific stats
    if (variant.cost > 0) {
      stats.push({ label: 'VARIANT COST', value: `+${variant.cost}`, unit: 'BP' });
    }
    if (variant.additional_hp !== 0) {
      stats.push({ label: 'VARIANT HP', value: variant.additional_hp > 0 ? `+${variant.additional_hp}` : variant.additional_hp.toString() });
    }
  }

  return stats;
}

/**
 * Build tooltip tags from slot data
 */
function buildTooltipTags(
  slot: ModuleSlotMarkerProps['slot'],
  isEmpty: boolean
): string[] {
  const tags: string[] = [];

  if (isEmpty) {
    tags.push('[EMPTY]');
  }

  if (slot?.required) {
    tags.push('[REQUIRED]');
  }

  if (slot?.hasVariants || slot?.has_varients) {
    tags.push('[HAS VARIANTS]');
  }

  return tags;
}

/**
 * Individual module slot marker on the blueprint
 *
 * Displays as bracketed text label following the design philosophy:
 * - Empty slots: [ENG] EMPTY
 * - Installed: [ENG] Module Name
 * - Selected: highlighted background
 *
 * Wraps content in ModuleTooltip for detailed hover information.
 */
export function ModuleSlotMarker({
  slot,
  instance,
  variant,
  position,
  isSelected = false,
  isEmpty = false,
  hasVariants = true,
  onClick,
  onRemove,
  groupLabel,
}: ModuleSlotMarkerProps) {
  const abbreviation = getGroupAbbreviation(position.group);

  // Determine if this marker is interactive (can open catalog)
  // Only slots with variants are interactive for configuration
  const isInteractive = hasVariants && !!onClick;

  // Determine display label
  // Empty slot (needs variant): show slot type name + [EMPTY] indicator
  // Filled slot or no-variant slot: show slot type name + variant name if applicable
  const slotTypeName = slot?.name ?? groupLabel ?? position.group;
  const variantName = variant?.name;
  const displayLabel = isEmpty
    ? `${slotTypeName} [EMPTY]`
    : variantName
      ? `${slotTypeName}: ${variantName}`
      : slotTypeName;

  // Build tooltip content
  // Show slot name as title, variant info as subtitle when installed
  const tooltipTitle = slot?.name ?? position.group.toUpperCase();
  const tooltipSubtitle = variant
    ? `${variant.name}${variant.manufacturer ? ` — ${variant.manufacturer}` : ''}${variant.model ? ` ${variant.model}` : ''}`
    : isEmpty ? '[EMPTY SLOT - CLICK TO CONFIGURE]' : (hasVariants ? undefined : '[NO CONFIGURATION REQUIRED]');
  const tooltipDescription = variant?.description ?? variant?.desc ?? slot?.description ?? slot?.desc;
  const tooltipStats = buildTooltipStats(slot, variant);
  const tooltipTags = buildTooltipTags(slot, isEmpty);

  const markerStyles: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: 'translate(-50%, -50%)',
    fontFamily: 'var(--frigate-font-mono)',
    fontSize: '11px',
    lineHeight: 1.2,
    padding: '4px 8px',
    border: `1px solid ${isSelected ? 'var(--frigate-primary)' : isEmpty ? 'var(--frigate-border-muted)' : 'var(--frigate-border-base)'}`,
    backgroundColor: isSelected ? 'var(--frigate-bg-selected)' : 'var(--frigate-bg-surface)',
    color: isEmpty ? 'var(--frigate-text-muted)' : 'var(--frigate-text-primary)',
    cursor: isInteractive ? 'pointer' : 'default',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    zIndex: isSelected ? 10 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only trigger onClick if the slot has variants to configure
    if (isInteractive) {
      onClick?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isInteractive) {
      e.preventDefault();
      onClick?.();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && onRemove) {
      e.preventDefault();
      onRemove();
    }
  };

  const markerContent = (
    <div
      style={markerStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${position.group} slot: ${displayLabel}${isSelected ? ', selected' : ''}`}
      aria-pressed={isSelected}
    >
      <span style={{ color: 'var(--frigate-primary)' }}>[{abbreviation}]</span>
      {' '}
      <span style={{
        borderBottom: isEmpty ? '1px dashed var(--frigate-border-muted)' : 'none',
      }}>
        {displayLabel}
      </span>
    </div>
  );

  // Wrap in tooltip if we have slot or variant info to show
  if (slot || variant) {
    return (
      <ModuleTooltip
        title={tooltipTitle}
        subtitle={tooltipSubtitle}
        description={tooltipDescription}
        stats={tooltipStats}
        tags={tooltipTags}
        delay={300}
      >
        {markerContent}
      </ModuleTooltip>
    );
  }

  return markerContent;
}
