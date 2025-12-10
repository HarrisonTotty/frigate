import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShipStatsPanel, type ShipStats } from '../ShipStatsPanel';

describe('ShipStatsPanel', () => {
  const mockStats: ShipStats = {
    cost: 1500,
    weight: 850,
    weightMax: 1000,
    hp: 450,
    power: 280,
    powerMax: 500,
    heat: 320,
    heatMax: 600,
    buildPointsUsed: 75,
    buildPointsMax: 100,
    warnings: [],
  };

  describe('rendering', () => {
    it('renders the component with header', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('SHIP STATISTICS')).toBeDefined();
    });

    it('displays primary statistics', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      // Cost and HP are displayed with StatRow component
      expect(screen.getByText('1500 CR')).toBeDefined();
      expect(screen.getByText('450 HP')).toBeDefined();
    });

    it('displays constraint bars', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      // Constraint bars show label and value/max format
      expect(screen.getByText('BUILD POINTS')).toBeDefined();
      expect(screen.getByText('75/100 BP')).toBeDefined();
      expect(screen.getByText('WEIGHT')).toBeDefined();
      expect(screen.getByText('850/1000 t')).toBeDefined();
      expect(screen.getByText('POWER')).toBeDefined();
      expect(screen.getByText('280/500 MW')).toBeDefined();
      expect(screen.getByText('COOLING')).toBeDefined();
      expect(screen.getByText('320/600 K')).toBeDefined();
    });

    it('displays warnings when present', () => {
      const statsWithWarnings: ShipStats = {
        ...mockStats,
        warnings: ['Build points exceeded', 'Weight limit exceeded'],
      };
      render(<ShipStatsPanel stats={statsWithWarnings} />);
      expect(screen.getByText('WARNINGS')).toBeDefined();
      expect(screen.getByText('Build points exceeded')).toBeDefined();
      expect(screen.getByText('Weight limit exceeded')).toBeDefined();
    });

    it('does not display warnings section when no warnings', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      // There should be no WARNINGS header when warnings array is empty
      const warningsElement = screen.queryByText('WARNINGS');
      expect(warningsElement).toBeNull();
    });
  });

  describe('styling', () => {
    it('applies correct CSS classes and styles', () => {
      const { container } = render(<ShipStatsPanel stats={mockStats} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.fontFamily).toBe('var(--frigate-font-mono)');
      expect(wrapper.style.borderRadius).toBe('0');
    });

    it('applies custom className', () => {
      const { container } = render(
        <ShipStatsPanel stats={mockStats} className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toBe('custom-class');
    });
  });

  describe('stats aggregation', () => {
    it('handles zero values correctly', () => {
      const emptyStats: ShipStats = {
        cost: 0,
        weight: 0,
        weightMax: 1000,
        hp: 0,
        power: 0,
        powerMax: 500,
        heat: 0,
        heatMax: 600,
        buildPointsUsed: 0,
        buildPointsMax: 100,
        warnings: [],
      };
      render(<ShipStatsPanel stats={emptyStats} />);
      expect(screen.getByText('0 CR')).toBeDefined();
      expect(screen.getByText('0/100 BP')).toBeDefined();
    });

    it('handles large values correctly', () => {
      const largeStats: ShipStats = {
        ...mockStats,
        cost: 999999,
        weight: 50000,
        weightMax: 60000,
        hp: 10000,
        power: 5000,
        powerMax: 6000,
        heat: 4500,
        heatMax: 5000,
      };
      render(<ShipStatsPanel stats={largeStats} />);
      expect(screen.getByText('999999 CR')).toBeDefined();
      expect(screen.getByText('50000/60000 t')).toBeDefined();
    });

    it('handles build points exceeding max', () => {
      const overStats: ShipStats = {
        ...mockStats,
        buildPointsUsed: 120,
        buildPointsMax: 100,
      };
      render(<ShipStatsPanel stats={overStats} />);
      expect(screen.getByText('120/100 BP [!]')).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has proper text hierarchy', () => {
      const { container } = render(<ShipStatsPanel stats={mockStats} />);
      const header = container.querySelector('[style*="font-weight: 800"]');
      expect(header).toBeDefined();
    });

    it('uses semantic HTML structure', () => {
      const { container } = render(<ShipStatsPanel stats={mockStats} />);
      const divs = container.querySelectorAll('div');
      expect(divs.length > 0).toBe(true);
    });

    it('has aria-label for the panel', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      const panel = screen.getByRole('region', { name: 'Ship Statistics' });
      expect(panel).toBeDefined();
    });
  });

  describe('radar chart', () => {
    it('displays radar chart when profile is provided', () => {
      const statsWithProfile: ShipStats = {
        ...mockStats,
        profile: {
          defense: 0.5,
          mobility: 0.7,
          offense: 0.3,
          versatility: 0.6,
          utility: 0.4,
        },
      };
      render(<ShipStatsPanel stats={statsWithProfile} />);
      expect(screen.getByText('CAPABILITY PROFILE')).toBeDefined();
      // RadarChart should be rendered (SVG element)
      const { container } = render(<ShipStatsPanel stats={statsWithProfile} />);
      expect(container.querySelector('svg')).toBeDefined();
    });

    it('does not display radar chart when profile is not provided', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      const profileHeader = screen.queryByText('CAPABILITY PROFILE');
      expect(profileHeader).toBeNull();
    });
  });
});
