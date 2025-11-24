import React from 'react';
import { Button } from '../components';

interface HeaderProps {
  selectedClassId: string | null;
  onSelect?: (id: string) => void;
  onClose: () => void;
}

export function ShipClassBrowserHeader({ selectedClassId, onSelect, onClose }: HeaderProps) {
  return (
    <div
      style={{
        padding: 'var(--frigate-space-4)',
        borderBottom: '2px solid var(--frigate-primary)',
        backgroundColor: 'var(--frigate-bg-surface)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2
          id="ship-class-browser-title"
          style={{
            margin: 0,
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-heading)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--frigate-text-primary)',
          }}
        >
          SHIP CLASS BROWSER
        </h2>
        <div style={{ display: 'flex', gap: 'var(--frigate-space-2)', alignItems: 'center' }}>
          {onSelect && selectedClassId && (
            <Button variant="primary" size="sm" onClick={() => onSelect(selectedClassId)}>
              [SELECT {selectedClassId.toUpperCase()}]
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            [CLOSE]
          </Button>
        </div>
      </div>
    </div>
  );
}
