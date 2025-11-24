import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstalledModulesList } from '../InstalledModulesList';
import { ShipStatsPanel } from '../ShipStatsPanel';

describe('Lobby components', () => {
  it('renders InstalledModulesList empty state', () => {
    render(<InstalledModulesList instances={[]} />);
    expect(screen.getByText('No modules installed')).toBeDefined();
  });

  it('renders ShipStatsPanel with stats', () => {
    render(<ShipStatsPanel stats={{ cost: 0, weight: 0, hp: 100, power: 0, heat: 0, buildPointsUsed: 0, buildPointsMax: 10 }} />);
    expect(screen.getByText('Ship Statistics')).toBeDefined();
    expect(screen.getByText('HP: 100')).toBeDefined();
  });
});
