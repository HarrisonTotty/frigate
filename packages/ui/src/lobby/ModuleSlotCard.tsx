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
  
  // Use a border width that fits within the 320px column container
  // accounting for padding (8px on each side = 16px) and scrollbar (~16px)
  // Available width: ~288px at ~8.5px per char = ~34 chars max
  const borderTop = '┌' + '─'.repeat(30) + '┐';
  const borderBottom = '└' + '─'.repeat(30) + '┘';

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
        padding: 0,
        color: 'var(--frigate-primary)', 
        fontWeight: 700,
        fontFamily: 'var(--frigate-font-mono)',
        fontSize: 'var(--frigate-font-body)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
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
              color: 'var(--frigate-primary)', 
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
        padding: 0,
        color: 'var(--frigate-primary)', 
        fontWeight: 700,
        fontFamily: 'var(--frigate-font-mono)',
        fontSize: 'var(--frigate-font-body)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        {borderBottom}
      </pre>
    </div>
  );
}

export default ModuleSlotCard;
