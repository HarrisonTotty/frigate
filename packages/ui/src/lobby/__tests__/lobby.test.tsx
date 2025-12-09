import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstalledModulesList } from '../InstalledModulesList';
import { ShipStatsPanel, type ShipStats } from '../ShipStatsPanel';

describe('Lobby components', () => {
  describe('InstalledModulesList', () => {
    it('renders empty state with uppercase text', () => {
      render(<InstalledModulesList instances={[]} />);
      expect(screen.getByText('NO MODULES INSTALLED')).toBeDefined();
    });

    it('has proper ARIA role for list', () => {
      render(<InstalledModulesList instances={[]} />);
      expect(screen.getByRole('list')).toBeDefined();
    });
  });

  describe('ShipStatsPanel', () => {
    const mockStats: ShipStats = {
      cost: 1500,
      weight: 850,
      weightMax: 1000,
      hp: 100,
      power: 280,
      powerMax: 500,
      heat: 320,
      heatMax: 600,
      buildPointsUsed: 75,
      buildPointsMax: 100,
      warnings: [],
    };

    it('renders panel with header', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      // Header uses uppercase
      expect(screen.getByText('SHIP STATISTICS')).toBeDefined();
    });

    it('displays hull points stat', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      // HP is displayed as "HULL PTS" label with value and unit
      expect(screen.getByText('HULL PTS')).toBeDefined();
      expect(screen.getByText('100 HP')).toBeDefined();
    });

    it('displays weight constraint', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('WEIGHT ALLOCATION')).toBeDefined();
    });

    it('displays power constraint', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('POWER CONSUMPTION')).toBeDefined();
    });

    it('displays heat constraint', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('HEAT DISSIPATION')).toBeDefined();
    });

    it('displays build points allocation', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('BUILD POINTS ALLOCATION')).toBeDefined();
    });

    it('shows warning when weight exceeds limit', () => {
      const overweightStats: ShipStats = {
        ...mockStats,
        weight: 1200,
        weightMax: 1000,
      };
      render(<ShipStatsPanel stats={overweightStats} />);
      expect(screen.getByText('[OVER LIMIT]')).toBeDefined();
    });

    it('shows warning when power exceeds limit', () => {
      const overpowerStats: ShipStats = {
        ...mockStats,
        power: 600,
        powerMax: 500,
      };
      render(<ShipStatsPanel stats={overpowerStats} />);
      expect(screen.getByText('[OVER LIMIT]')).toBeDefined();
    });

    it('shows warning when heat exceeds limit', () => {
      const overheatStats: ShipStats = {
        ...mockStats,
        heat: 700,
        heatMax: 600,
      };
      render(<ShipStatsPanel stats={overheatStats} />);
      expect(screen.getByText('[OVER LIMIT]')).toBeDefined();
    });

    it('displays warnings from stats object', () => {
      const statsWithWarnings: ShipStats = {
        ...mockStats,
        warnings: ['Critical error', 'Power failure'],
      };
      render(<ShipStatsPanel stats={statsWithWarnings} />);
      // Warnings are displayed directly without per-warning prefix
      expect(screen.getByText('Critical error')).toBeDefined();
      expect(screen.getByText('Power failure')).toBeDefined();
    });

    it('has proper container structure', () => {
      const { container } = render(<ShipStatsPanel stats={mockStats} />);
      // ShipStatsPanel renders as a div container with proper styling
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.style.fontFamily).toBe('var(--frigate-font-mono)');
    });
  });
});
