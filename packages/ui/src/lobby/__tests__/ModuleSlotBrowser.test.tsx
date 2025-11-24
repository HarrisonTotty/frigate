import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModuleSlotBrowser } from '../ModuleSlotBrowser';

describe('ModuleSlotBrowser', () => {
  const mockProps = {
    apiUrl: 'http://localhost:3000',
    blueprintId: 'bp-test',
    installedModules: [],
    buildPointsUsed: 45,
    maxBuildPoints: 100,
  };

  describe('rendering', () => {
    it('renders the component with header', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      expect(screen.getByText('MODULE SLOT BROWSER')).toBeDefined();
    });

    it('displays build points information', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      expect(screen.getByText('BUILD POINTS: 45 / 100')).toBeDefined();
    });

    it('displays percentage', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      expect(screen.getByText('45%')).toBeDefined();
    });

    it('displays keyboard hints footer', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      expect(screen.getByText(/KEYS:/)).toBeDefined();
    });

    it('has proper ARIA role and label', () => {
      const { container } = render(<ModuleSlotBrowser {...mockProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('role')).toBe('region');
      expect(wrapper.getAttribute('aria-label')).toBe('Module Slot Browser');
    });
  });

  describe('styling', () => {
    it('applies theme colors and fonts', () => {
      const { container } = render(<ModuleSlotBrowser {...mockProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.fontFamily).toBe('var(--frigate-font-mono)');
      expect(wrapper.style.background).toBe('var(--frigate-bg-base)');
      expect(wrapper.style.color).toBe('var(--frigate-text-primary)');
      expect(wrapper.style.borderRadius).toBe('0');
      expect(wrapper.style.boxShadow).toBe('none');
    });

    it('applies proper border styling', () => {
      const { container } = render(<ModuleSlotBrowser {...mockProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.border).toContain('1px solid');
    });
  });

  describe('build points display', () => {
    it('shows warning status when > 70%', () => {
      render(
        <ModuleSlotBrowser
          {...mockProps}
          buildPointsUsed={75}
          maxBuildPoints={100}
        />
      );
      expect(screen.getByText('BUILD POINTS: 75 / 100')).toBeDefined();
      expect(screen.getByText('75%')).toBeDefined();
    });

    it('shows danger status when > 90%', () => {
      render(
        <ModuleSlotBrowser
          {...mockProps}
          buildPointsUsed={95}
          maxBuildPoints={100}
        />
      );
      expect(screen.getByText('BUILD POINTS: 95 / 100')).toBeDefined();
      expect(screen.getByText('95%')).toBeDefined();
    });

    it('shows success status when <= 70%', () => {
      render(
        <ModuleSlotBrowser
          {...mockProps}
          buildPointsUsed={50}
          maxBuildPoints={100}
        />
      );
      expect(screen.getByText('BUILD POINTS: 50 / 100')).toBeDefined();
      expect(screen.getByText('50%')).toBeDefined();
    });

    it('handles edge case of 0 build points', () => {
      render(
        <ModuleSlotBrowser
          {...mockProps}
          buildPointsUsed={0}
          maxBuildPoints={100}
        />
      );
      expect(screen.getByText('BUILD POINTS: 0 / 100')).toBeDefined();
      expect(screen.getByText('0%')).toBeDefined();
    });

    it('handles full build points', () => {
      render(
        <ModuleSlotBrowser
          {...mockProps}
          buildPointsUsed={100}
          maxBuildPoints={100}
        />
      );
      expect(screen.getByText('BUILD POINTS: 100 / 100')).toBeDefined();
      expect(screen.getByText('100%')).toBeDefined();
    });
  });

  describe('layout', () => {
    it('has flex layout with proper structure', () => {
      const { container } = render(<ModuleSlotBrowser {...mockProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.display).toBe('flex');
      expect(wrapper.style.flexDirection).toBe('column');
      expect(wrapper.style.minHeight).toBe('400px');
    });

    it('has minimum height for content', () => {
      const { container } = render(<ModuleSlotBrowser {...mockProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.minHeight).toBe('400px');
    });
  });

  describe('keyboard hints', () => {
    it('displays all keyboard navigation hints', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      const hints = screen.getByText(/KEYS:/);
      expect(hints.textContent).toContain('TAB NAV');
      expect(hints.textContent).toContain('↑/↓ SELECT');
      expect(hints.textContent).toContain('ENTER: ADD');
      expect(hints.textContent).toContain('ESC: CLOSE');
    });
  });

  describe('header component', () => {
    it('renders title with uppercase styling', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      const title = screen.getByText('MODULE SLOT BROWSER');
      expect(title?.style.textTransform).toBe('uppercase');
      expect(title?.style.letterSpacing).toBe('0.1em');
      expect(title?.style.fontWeight).toBe('800');
    });

    it('renders build points label with uppercase styling', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      const label = screen.getByText('BUILD POINTS: 45 / 100');
      expect(label?.style.textTransform).toBe('uppercase');
    });
  });

  describe('footer component', () => {
    it('renders footer with muted text color', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      const footer = screen.getByText(/KEYS:/);
      expect(footer?.style.color).toBe('var(--frigate-text-muted)');
    });

    it('applies uppercase letter spacing', () => {
      render(<ModuleSlotBrowser {...mockProps} />);
      const footer = screen.getByText(/KEYS:/);
      expect(footer?.style.letterSpacing).toBe('0.05em');
    });
  });

  describe('default values', () => {
    it('uses default maxBuildPoints if not provided', () => {
      render(
        <ModuleSlotBrowser
          apiUrl={mockProps.apiUrl}
          blueprintId={mockProps.blueprintId}
        />
      );
      expect(screen.getByText('BUILD POINTS: 0 / 100')).toBeDefined();
    });

    it('uses default installedModules if not provided', () => {
      const { container } = render(
        <ModuleSlotBrowser
          apiUrl={mockProps.apiUrl}
          blueprintId={mockProps.blueprintId}
        />
      );
      expect(container.firstChild).toBeDefined();
    });
  });
});
