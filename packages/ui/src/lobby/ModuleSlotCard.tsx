import React from 'react';
import type { ModuleSlot } from '@frigate/api-client';

export interface ModuleSlotCardProps {
  slot: ModuleSlot;
  currentCount: number;
  maxBuildPoints: number;
  buildPointsUsed: number;
  onAdd: (slot: ModuleSlot) => void;
  onToggleDetails: (id: string) => void;
  isExpanded: boolean;
  disabled?: boolean;
}

/**
 * Generate a top border with dynamic width
 */
function generateTopBorder(width: number): string {
  if (width < 3) return '┌┐';
  return '┌' + '─'.repeat(width - 2) + '┐';
}

/**
 * Generate a bottom border with dynamic width
 */
function generateBottomBorder(width: number): string {
  if (width < 3) return '└┘';
  return '└' + '─'.repeat(width - 2) + '┘';
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
}: ModuleSlotCardProps) {
  const safeName = typeof slot.name === 'string' && slot.name.length > 0 ? slot.name : '[Unnamed Slot]';
  const safeId = typeof slot.id === 'string' ? slot.id : '[No ID]';
  const safeGroups = Array.isArray(slot.groups) && slot.groups.length > 0 ? slot.groups : ['Other'];
  const safeBaseCost = typeof slot.base_cost === 'number' ? slot.base_cost : 0;
  const safeMaxSlots = typeof slot.max_slots === 'number' ? slot.max_slots : 1;
  const safeRequired = typeof slot.required === 'boolean' ? slot.required : false;
  const safeDescription = typeof slot.description === 'string' ? slot.description : '';
  const canAdd = safeBaseCost <= (maxBuildPoints - buildPointsUsed);
  
  // Calculate border width based on content
  // Use consistent fixed width for proper ASCII border alignment
  const borderWidth = 50;

  const borderTop = generateTopBorder(borderWidth);
  const borderBottom = generateBottomBorder(borderWidth);

  return (
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
      }}
      tabIndex={0}
      aria-label={`Module Slot ${safeName}`}
      role="group"
    >
      <pre style={{ 
        margin: 0, 
        color: '#3af', 
        fontWeight: 700,
        fontFamily: 'var(--frigate-font-mono)',
        lineHeight: 1.2,
        overflow: 'hidden',
      }}>
        {borderTop}
      </pre>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '4px 12px',
        fontFamily: 'var(--frigate-font-mono)',
      }}>
        <div>
          <span style={{ fontWeight: 700 }}>{safeName}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3af', 
              fontWeight: 700, 
              padding: 0, 
              cursor: canAdd && !disabled ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--frigate-font-mono)',
              fontSize: 'inherit',
            }}
            onClick={() => canAdd && !disabled && onAdd(slot)}
            disabled={!canAdd || disabled}
            aria-label={`Add slot ${safeName}`}
          >
            [ADD]
          </button>
        </div>
      </div>
      {/* No expanded details in catalog view */}
      <pre style={{ 
        margin: 0, 
        color: '#3af', 
        fontWeight: 700,
        fontFamily: 'var(--frigate-font-mono)',
        lineHeight: 1.2,
        overflow: 'hidden',
      }}>
        {borderBottom}
      </pre>
    </div>
  );
}

export default ModuleSlotCard;
