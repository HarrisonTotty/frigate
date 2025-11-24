import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShipStatsPanel, type ShipStats } from '../ShipStatsPanel';

describe('ShipStatsPanel', () => {
  const mockStats: ShipStats = {
    cost: 1500,
    weight: 850,
    hp: 450,
    power: 280,
    heat: 320,
    buildPointsUsed: 75,
    buildPointsMax: 100,
    warnings: [],
  };

  describe('rendering', () => {
    it('renders the component with header', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('SHIP STATISTICS [SHP]')).toBeDefined();
    });

    it('displays all primary statistics', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('1500')).toBeDefined(); // cost
      expect(screen.getByText('850')).toBeDefined(); // weight
      expect(screen.getByText('450')).toBeDefined(); // hp
      expect(screen.getByText('280')).toBeDefined(); // power
      expect(screen.getByText('320')).toBeDefined(); // heat
    });

    it('displays build points allocation', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('BUILD POINTS ALLOCATION')).toBeDefined();
      expect(screen.getByText('75 / 100')).toBeDefined();
    });

    it('displays constraints section', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText('CONSTRAINTS')).toBeDefined();
      expect(screen.getByText('MAX BUILD: 100 BP')).toBeDefined();
    });

    it('displays warnings when present', () => {
      const statsWithWarnings: ShipStats = {
        ...mockStats,
        warnings: ['Build points exceeded', 'Weight limit exceeded'],
      };
      render(<ShipStatsPanel stats={statsWithWarnings} />);
      expect(screen.getByText('WARNINGS [2]')).toBeDefined();
      expect(screen.getByText('Build points exceeded')).toBeDefined();
      expect(screen.getByText('Weight limit exceeded')).toBeDefined();
    });

    it('does not display warnings section when no warnings', () => {
      render(<ShipStatsPanel stats={mockStats} />);
      const warningsElement = screen.queryByText(/WARNINGS/);
      expect(!warningsElement).toBe(true);
    });
  });

  describe('styling', () => {
    it('applies correct CSS classes and styles', () => {
      const { container } = render(<ShipStatsPanel stats={mockStats} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.backgroundColor).toBe('var(--frigate-bg-surface)');
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
        hp: 0,
        power: 0,
        heat: 0,
        buildPointsUsed: 0,
        buildPointsMax: 100,
        warnings: [],
      };
      render(<ShipStatsPanel stats={emptyStats} />);
      expect(screen.getByText('0')).toBeDefined();
    });

    it('handles large values correctly', () => {
      const largeStats: ShipStats = {
        ...mockStats,
        cost: 999999,
        weight: 50000,
        hp: 10000,
        power: 5000,
        heat: 4500,
      };
      render(<ShipStatsPanel stats={largeStats} />);
      expect(screen.getByText('999999')).toBeDefined();
      expect(screen.getByText('50000')).toBeDefined();
    });

    it('handles build points exceeding max', () => {
      const overStats: ShipStats = {
        ...mockStats,
        buildPointsUsed: 120,
        buildPointsMax: 100,
      };
      render(<ShipStatsPanel stats={overStats} />);
      expect(screen.getByText('120 / 100')).toBeDefined();
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
  });
});
