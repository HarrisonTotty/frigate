import React, { useState } from 'react';
import type { ModuleSlotMarkerProps } from './types';
import { ModuleTooltip, type TooltipStatRow } from '../../components/ModuleTooltip';

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
 * Layout:
 * ┌─────────────────────────┬─────┐
 * │ Module Slot Name (bold) │ [X] │
 * │ Module Variant Name     │     │
 * │ or [SELECT MODULE]      │     │
 * └─────────────────────────┴─────┘
 *
 * Wraps content in ModuleTooltip for detailed hover information.
 */
export function ModuleSlotMarker({
  slot,
  instance,
  variant,
  position,
  isHighlighted = false,
  isEmpty = false,
  hasVariants = true,
  onClick,
  onRemove,
  onMouseEnter,
  onMouseLeave,
  groupLabel,
}: ModuleSlotMarkerProps) {
  // Track hover state for remove button
  const [isRemoveHovered, setIsRemoveHovered] = useState(false);

  // Determine if this marker is interactive (can open catalog)
  // Only slots with variants are interactive for configuration
  const isInteractive = hasVariants && !!onClick;

  // Slot type name (bold, first line)
  const slotTypeName = slot?.name ?? groupLabel ?? position.group;
  // Variant name (second line) or [SELECT MODULE] if empty
  const variantName = variant?.name;

  // Build tooltip content
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
    transform: position.labelPosition === 'left' ? 'translate(-100%, -50%)' : 'translate(0%, -50%)',
    fontFamily: 'var(--frigate-font-mono)',
    fontSize: '10px',
    lineHeight: 1.3,
    padding: '3px 6px',
    border: `1px solid ${isHighlighted ? 'var(--frigate-primary)' : isEmpty ? 'var(--frigate-border-muted)' : 'var(--frigate-border-base)'}`,
    backgroundColor: isHighlighted ? 'var(--frigate-bg-selected)' : 'var(--frigate-bg-surface)',
    color: isEmpty ? 'var(--frigate-text-muted)' : 'var(--frigate-text-primary)',
    cursor: isInteractive ? 'pointer' : 'default',
    userSelect: 'none',
    zIndex: isHighlighted ? 10 : 1,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    maxWidth: '140px',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only trigger onClick if the slot has variants to configure
    if (isInteractive) {
      onClick?.();
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
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

  const displayLabel = isEmpty
    ? `${slotTypeName} [EMPTY]`
    : variantName
      ? `${slotTypeName}: ${variantName}`
      : slotTypeName;

  const markerContent = (
    <div
      style={markerStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={0}
      role="button"
      aria-label={`${position.group} slot: ${displayLabel}`}
    >
      {/* Content area */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* Slot type name (bold) */}
        <div
          style={{
            fontWeight: 700,
            fontSize: '10px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--frigate-text-primary)',
          }}
        >
          {slotTypeName}
        </div>
        {/* Module name or [SELECT MODULE] */}
        <div
          style={{
            fontSize: '9px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: isEmpty ? 'var(--frigate-primary)' : 'var(--frigate-text-secondary)',
            cursor: isEmpty && isInteractive ? 'pointer' : 'inherit',
          }}
        >
          {isEmpty ? '[SELECT MODULE]' : (variantName ?? (hasVariants ? '[SELECT MODULE]' : '[FIXED]'))}
        </div>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={handleRemoveClick}
          onMouseEnter={() => setIsRemoveHovered(true)}
          onMouseLeave={() => setIsRemoveHovered(false)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: '9px',
            color: isRemoveHovered ? 'var(--frigate-danger)' : 'var(--frigate-text-muted)',
            cursor: 'pointer',
            lineHeight: 1,
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          aria-label={`Remove ${slotTypeName} from ship`}
          title="Remove slot"
        >
          [X]
        </button>
      )}
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
