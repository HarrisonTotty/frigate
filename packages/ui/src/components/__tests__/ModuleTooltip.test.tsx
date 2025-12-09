import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ModuleTooltip } from '../ModuleTooltip';

describe('ModuleTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders children without tooltip initially', () => {
      render(
        <ModuleTooltip title="Test Tooltip">
          <button>Hover me</button>
        </ModuleTooltip>
      );

      expect(screen.getByText('Hover me')).toBeDefined();
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('shows tooltip on mouse enter after delay', () => {
      render(
        <ModuleTooltip title="REACTOR CORE" delay={200}>
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      // Tooltip should not be visible yet
      expect(screen.queryByRole('tooltip')).toBeNull();

      // Advance timer past delay
      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Tooltip should now be visible
      expect(screen.getByRole('tooltip')).toBeDefined();
      expect(screen.getByText('REACTOR CORE')).toBeDefined();
    });

    it('hides tooltip on mouse leave', () => {
      render(
        <ModuleTooltip title="Test Title" delay={100}>
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;

      // Show tooltip
      fireEvent.mouseEnter(trigger);
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(screen.getByRole('tooltip')).toBeDefined();

      // Hide tooltip
      fireEvent.mouseLeave(trigger);

      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('does not show tooltip when disabled', () => {
      render(
        <ModuleTooltip title="Test Title" disabled={true} delay={100}>
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  describe('content', () => {
    it('displays title and subtitle', () => {
      render(
        <ModuleTooltip title="REACTOR CORE" subtitle="Power Generation" delay={0}>
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByText('REACTOR CORE')).toBeDefined();
      expect(screen.getByText('Power Generation')).toBeDefined();
    });

    it('displays description', () => {
      render(
        <ModuleTooltip
          title="REACTOR"
          description="Primary power source for all ship systems."
          delay={0}
        >
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByText('Primary power source for all ship systems.')).toBeDefined();
    });

    it('displays stat rows with labels and values', () => {
      render(
        <ModuleTooltip
          title="MODULE"
          stats={[
            { label: 'COST', value: 15, unit: 'BP' },
            { label: 'POWER', value: 500, unit: 'kW' },
          ]}
          delay={0}
        >
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByText('COST')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined();
      expect(screen.getByText('BP')).toBeDefined();
      expect(screen.getByText('POWER')).toBeDefined();
      expect(screen.getByText('500')).toBeDefined();
      expect(screen.getByText('kW')).toBeDefined();
    });

    it('displays tags', () => {
      render(
        <ModuleTooltip
          title="MODULE"
          tags={['[REQUIRED]', '[HAS VARIANTS]']}
          delay={0}
        >
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByText('[REQUIRED]')).toBeDefined();
      expect(screen.getByText('[HAS VARIANTS]')).toBeDefined();
    });
  });

  describe('styling', () => {
    it('applies monospace font family', () => {
      render(
        <ModuleTooltip title="Test" delay={0}>
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.style.fontFamily).toBe('var(--frigate-font-mono)');
    });

    it('renders CSS border', () => {
      render(
        <ModuleTooltip title="Test" delay={0}>
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      const tooltip = screen.getByRole('tooltip');
      // Tooltip uses CSS border instead of ASCII pre elements
      expect(tooltip.style.border).toBe('1px solid var(--frigate-primary)');
    });
  });

  describe('accessibility', () => {
    it('has tooltip role', () => {
      render(
        <ModuleTooltip title="Test" delay={0}>
          <button>Hover me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Hover me').parentElement!;
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByRole('tooltip')).toBeDefined();
    });

    it('shows tooltip on focus', () => {
      render(
        <ModuleTooltip title="Test Title" delay={0}>
          <button>Focus me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Focus me').parentElement!;
      fireEvent.focus(trigger);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByRole('tooltip')).toBeDefined();
    });

    it('hides tooltip on blur', () => {
      render(
        <ModuleTooltip title="Test Title" delay={0}>
          <button>Focus me</button>
        </ModuleTooltip>
      );

      const trigger = screen.getByText('Focus me').parentElement!;

      // Show tooltip
      fireEvent.focus(trigger);
      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByRole('tooltip')).toBeDefined();

      // Hide tooltip
      fireEvent.blur(trigger);

      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });
});
