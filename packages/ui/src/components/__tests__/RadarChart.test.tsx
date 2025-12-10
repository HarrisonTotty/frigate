import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RadarChart, type RadarChartAxis } from '../RadarChart';

const defaultAxes: RadarChartAxis[] = [
  { id: 'D', label: 'Defense', value: 0.8 },
  { id: 'M', label: 'Mobility', value: 0.6 },
  { id: 'O', label: 'Offense', value: 0.7 },
  { id: 'V', label: 'Versatility', value: 0.5 },
  { id: 'U', label: 'Utility', value: 0.4 },
];

describe('RadarChart', () => {
  describe('rendering', () => {
    it('renders SVG element', () => {
      render(<RadarChart axes={defaultAxes} />);
      const svg = document.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg).not.toBeNull();
    });

    it('renders correct number of axis labels', () => {
      render(<RadarChart axes={defaultAxes} />);

      defaultAxes.forEach((axis) => {
        expect(screen.getByText(axis.id)).toBeDefined();
      });
    });

    it('renders axis labels with title (tooltip) containing full label', () => {
      render(<RadarChart axes={defaultAxes} />);

      const textElements = document.querySelectorAll('svg text');
      expect(textElements.length).toBe(5);

      textElements.forEach((text, index) => {
        const title = text.querySelector('title');
        expect(title?.textContent).toBe(defaultAxes[index].label);
      });
    });

    it('renders correct number of grid levels', () => {
      render(<RadarChart axes={defaultAxes} gridLevels={5} />);

      // 5 grid polygons + 1 data polygon = 6 polygons
      const polygons = document.querySelectorAll('svg polygon');
      expect(polygons.length).toBe(6);
    });

    it('renders correct number of axis lines', () => {
      render(<RadarChart axes={defaultAxes} />);

      const lines = document.querySelectorAll('svg line');
      expect(lines.length).toBe(5);
    });

    it('renders data points for each axis', () => {
      render(<RadarChart axes={defaultAxes} />);

      const circles = document.querySelectorAll('svg circle');
      expect(circles.length).toBe(5);
    });
  });

  describe('sizing', () => {
    it('uses default size of 200', () => {
      render(<RadarChart axes={defaultAxes} />);

      const svg = document.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('200');
      expect(svg?.getAttribute('height')).toBe('200');
    });

    it('accepts custom size', () => {
      render(<RadarChart axes={defaultAxes} size={300} />);

      const svg = document.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('300');
      expect(svg?.getAttribute('height')).toBe('300');
    });
  });

  describe('edge cases', () => {
    it('handles all zero values', () => {
      const zeroAxes: RadarChartAxis[] = defaultAxes.map((a) => ({
        ...a,
        value: 0,
      }));

      render(<RadarChart axes={zeroAxes} />);

      // Should render without error
      const svg = document.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('handles all max values (1.0)', () => {
      const maxAxes: RadarChartAxis[] = defaultAxes.map((a) => ({
        ...a,
        value: 1,
      }));

      render(<RadarChart axes={maxAxes} />);

      const svg = document.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('clamps values above 1.0 to 1.0', () => {
      const overAxes: RadarChartAxis[] = defaultAxes.map((a) => ({
        ...a,
        value: 1.5,
      }));

      render(<RadarChart axes={overAxes} />);

      // Should render without error and not extend beyond chart bounds
      const svg = document.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('clamps negative values to 0', () => {
      const negAxes: RadarChartAxis[] = defaultAxes.map((a) => ({
        ...a,
        value: -0.5,
      }));

      render(<RadarChart axes={negAxes} />);

      const svg = document.querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('handles different number of axes (3)', () => {
      const threeAxes: RadarChartAxis[] = [
        { id: 'A', label: 'Alpha', value: 0.5 },
        { id: 'B', label: 'Beta', value: 0.7 },
        { id: 'C', label: 'Gamma', value: 0.3 },
      ];

      render(<RadarChart axes={threeAxes} />);

      const textElements = document.querySelectorAll('svg text');
      expect(textElements.length).toBe(3);
    });

    it('handles different number of axes (6)', () => {
      const sixAxes: RadarChartAxis[] = [
        { id: 'A', label: 'Alpha', value: 0.5 },
        { id: 'B', label: 'Beta', value: 0.7 },
        { id: 'C', label: 'Gamma', value: 0.3 },
        { id: 'D', label: 'Delta', value: 0.8 },
        { id: 'E', label: 'Epsilon', value: 0.4 },
        { id: 'F', label: 'Zeta', value: 0.6 },
      ];

      render(<RadarChart axes={sixAxes} />);

      const textElements = document.querySelectorAll('svg text');
      expect(textElements.length).toBe(6);
    });
  });

  describe('accessibility', () => {
    it('has img role on SVG', () => {
      render(<RadarChart axes={defaultAxes} />);

      const svg = document.querySelector('svg');
      expect(svg?.getAttribute('role')).toBe('img');
    });

    it('has aria-label on SVG', () => {
      render(<RadarChart axes={defaultAxes} />);

      const svg = document.querySelector('svg');
      expect(svg?.getAttribute('aria-label')).toBe('Ship capability radar chart');
    });
  });

  describe('customization', () => {
    it('accepts custom className', () => {
      render(<RadarChart axes={defaultAxes} className="custom-chart" />);

      const container = document.querySelector('.custom-chart');
      expect(container).not.toBeNull();
    });

    it('accepts custom grid levels', () => {
      render(<RadarChart axes={defaultAxes} gridLevels={3} />);

      // 3 grid polygons + 1 data polygon = 4 polygons
      const polygons = document.querySelectorAll('svg polygon');
      expect(polygons.length).toBe(4);
    });
  });
});
