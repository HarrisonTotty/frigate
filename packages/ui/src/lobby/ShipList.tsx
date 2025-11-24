import React from 'react';
import { Stack, Panel } from '../layout';
import { Button, Badge } from '../components';
import { LoadingText } from '../loading';
import type { Blueprint } from './BlueprintList';
import type { ShipClassSummary } from '../types/shipClass';

export interface ShipListProps {
  ships: Blueprint[];
  loading: boolean;
  availableShipClasses: ShipClassSummary[];
  onSelectShip: (id: string) => void;
}

function generateAbbreviation(name: string): string {
  const words = name.toUpperCase().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 6);
  return words.map(w => w[0]).join('').substring(0, 6);
}

export function ShipList({ ships, loading, availableShipClasses, onSelectShip }: ShipListProps): React.ReactElement {
  return (
    <Panel title="SHIP SELECTION" fullHeight>
      <Stack gap={4}>
        {loading ? (
          <LoadingText message="LOADING SHIPS..." />
        ) : ships.length === 0 ? (
          <div style={{ padding: 'var(--frigate-space-8)', textAlign: 'center', color: 'var(--frigate-text-muted)', fontFamily: 'var(--frigate-font-mono)' }}>
            NO SHIPS AVAILABLE
          </div>
        ) : (
          <Stack gap={2}>
            {ships.map((ship) => {
              const classInfo = availableShipClasses.find(sc => sc.id === ship.class);
              const crewCount = ship.crew?.length || 0;
              const maxCrew = (classInfo as any)?.max_modules || 9;
              const isInMission = ship.crew?.some((c) => c.ready) || false;

              return (
                <div key={ship.id} style={{ backgroundColor: 'var(--frigate-bg-surface)', border: '1px solid var(--frigate-border-base)', padding: 'var(--frigate-space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--frigate-space-2)', marginBottom: 'var(--frigate-space-1)' }}>
                      <span style={{ fontFamily: 'var(--frigate-font-mono)', fontSize: 'var(--frigate-font-body)', color: 'var(--frigate-text-primary)', fontWeight: 600 }}>
                        {ship.name}
                      </span>
                      {isInMission && (<Badge variant="warning" size="sm">IN MISSION</Badge>)}
                    </div>
                    <div style={{ fontFamily: 'var(--frigate-font-mono)', fontSize: 'var(--frigate-font-small)', color: 'var(--frigate-text-secondary)' }}>
                      {classInfo ? generateAbbreviation(classInfo.name) : ship.class.toUpperCase()} • {crewCount}/{maxCrew} CREW
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => onSelectShip(ship.id)} disabled={isInMission}>
                    [JOIN]
                  </Button>
                </div>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Panel>
  );
}

export default ShipList;
