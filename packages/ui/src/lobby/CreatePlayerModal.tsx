import React from 'react';
import { Stack } from '../layout';
import { Button } from '../components';

export interface CreatePlayerModalProps {
  visible: boolean;
  name: string;
  onChangeName: (v: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  creating?: boolean;
}

export function CreatePlayerModal({
  visible,
  name,
  onChangeName,
  onCreate,
  onCancel,
  creating = false,
}: CreatePlayerModalProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div style={{
        width: '500px',
        maxWidth: '90vw',
        border: '2px solid var(--frigate-primary)',
        borderRadius: 0,
        backgroundColor: 'var(--frigate-bg-base)',
        boxShadow: 'none',
      }}>
        <div style={{
          padding: 'var(--frigate-space-4)',
          borderBottom: '2px solid var(--frigate-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--frigate-bg-surface)',
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--frigate-font-mono)',
            fontSize: 'var(--frigate-font-heading)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--frigate-text-primary)',
          }}>REGISTER NEW PERSONNEL FILE</h2>
          <Button variant="secondary" size="sm" onClick={onCancel}>[X]</Button>
        </div>

        <div style={{ padding: 'var(--frigate-space-6)' }}>
          <Stack gap={4}>
            <div>
              <label htmlFor="player-name" style={{
                display: 'block',
                marginBottom: 'var(--frigate-space-2)',
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-small)',
                color: 'var(--frigate-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>NAME:</label>
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) => onChangeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !creating) {
                    onCreate();
                  } else if (e.key === 'Escape') {
                    onCancel();
                  }
                }}
                placeholder="ENTER NAME OR IDENTIFIER"
                disabled={creating}
                style={{
                  width: '100%',
                  padding: 'var(--frigate-space-3)',
                  fontFamily: 'var(--frigate-font-mono)',
                  fontSize: 'var(--frigate-font-body)',
                  color: 'var(--frigate-text-primary)',
                  backgroundColor: 'var(--frigate-bg-surface)',
                  border: '1px solid var(--frigate-border-base)',
                  borderRadius: 0,
                  outline: 'none',
                  textTransform: 'uppercase',
                }}
                autoFocus
              />
              <div style={{
                marginTop: 'var(--frigate-space-2)',
                fontFamily: 'var(--frigate-font-mono)',
                fontSize: 'var(--frigate-font-tiny)',
                color: 'var(--frigate-text-muted)',
              }}>3-32 CHARACTERS, LETTERS/NUMBERS/UNDERSCORES ONLY</div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--frigate-space-3)', marginTop: 'var(--frigate-space-4)' }}>
              <Button variant="primary" onClick={onCreate} disabled={creating || !name.trim()} style={{ flex: 1 }}>
                {creating ? '[CREATING...]' : '[CREATE]'}
              </Button>
              <Button variant="secondary" onClick={onCancel} disabled={creating}>[CANCEL]</Button>
            </div>
          </Stack>
        </div>
      </div>
    </div>
  );
}

export default CreatePlayerModal;
