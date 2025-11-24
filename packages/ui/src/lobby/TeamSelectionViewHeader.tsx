import React from 'react';
import { Button } from '../components';
import type { Player } from './PlayerSelectionView';
import { formatPlayerId } from './helpers';

interface HeaderProps {
  player: Player;
  onBack?: () => void;
  onDisconnect?: () => void;
  className?: string;
}

export function TeamSelectionViewHeader({ player, onBack, onDisconnect, className = '' }: HeaderProps) {
  return (
    <div className={className} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        backgroundColor: 'var(--frigate-bg-surface)',
        borderBottom: '1px solid var(--frigate-border-base)',
        padding: 'var(--frigate-space-3) var(--frigate-space-4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--frigate-space-2)' }}>
            <span style={{ fontFamily: 'var(--frigate-font-mono)', fontSize: 'var(--frigate-font-small)', color: 'var(--frigate-text-secondary)', textTransform: 'uppercase' }}>
              PLAYER:
            </span>
            <span style={{ fontFamily: 'var(--frigate-font-mono)', fontSize: 'var(--frigate-font-small)', color: 'var(--frigate-primary)', fontWeight: 600 }}>
              {player.name}_{formatPlayerId(player.id)}
            </span>
            <Button size="sm" variant="secondary" onClick={onBack}>[CHANGE]</Button>
          </div>
          {onDisconnect && <Button size="sm" variant="danger" onClick={onDisconnect}>[DISCONNECT]</Button>}
        </div>
      </div>
    </div>
  );
}

export default TeamSelectionViewHeader;
