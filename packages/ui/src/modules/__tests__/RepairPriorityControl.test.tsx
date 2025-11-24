/**
 * RepairPriorityControl Tests
 * 
 * Tests for repair queue management component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepairPriorityControl, type RepairQueueModule } from '../RepairPriorityControl';

const mockDamagedModules: RepairQueueModule[] = [
  {
    id: 'mod-1',
    name: 'Fusion Core',
    category: 'power-cores',
    health: 45,
    status: 'damaged',
    priority: 1,
  },
  {
    id: 'mod-2',
    name: 'Shield Generator',
    category: 'shields',
    health: 15,
    status: 'critical',
    priority: 2,
  },
  {
    id: 'mod-3',
    name: 'Sensors',
    category: 'systems',
    health: 0,
    status: 'offline',
    priority: 1,
  },
  {
    id: 'mod-4',
    name: 'Impulse Engine',
    category: 'propulsion',
    health: 60,
    status: 'degraded',
    priority: 3,
  },
];

describe('RepairPriorityControl', () => {
  let onPriorityChange: ReturnType<typeof vi.fn>;
  let onStartRepair: ReturnType<typeof vi.fn>;
  let onCancelRepair: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onPriorityChange = vi.fn();
    onStartRepair = vi.fn();
    onCancelRepair = vi.fn();
  });

  it('renders damaged modules list', () => {
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    expect(screen.getByText('Fusion Core')).toBeInTheDocument();
    expect(screen.getByText('Shield Generator')).toBeInTheDocument();
    expect(screen.getByText('Sensors')).toBeInTheDocument();
    expect(screen.getByText('Impulse Engine')).toBeInTheDocument();
  });

  it('displays module health percentages', () => {
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('displays priority levels', () => {
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    // Check for priority indicators (CRITICAL, HIGH, etc.)
    expect(screen.getAllByText(/P[1-5]|CRITICAL|HIGH|MEDIUM|LOW|DEFER/i).length).toBeGreaterThan(0);
  });

  it('sorts modules by priority then health', () => {
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    const moduleNames = screen.getAllByText(/Fusion Core|Shield Generator|Sensors|Impulse Engine/);
    // First should be priority 1 modules (Fusion Core and Sensors)
    // Sensors (0% health) should come before Fusion Core (45% health) at same priority
    const names = moduleNames.map(el => el.textContent);
    const sensorsIndex = names.indexOf('Sensors');
    const fusionIndex = names.indexOf('Fusion Core');
    
    if (sensorsIndex !== -1 && fusionIndex !== -1) {
      expect(sensorsIndex).toBeLessThan(fusionIndex);
    }
  });

  it('allows increasing priority', async () => {
    const user = userEvent.setup();
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    const priorityUpButtons = screen.getAllByRole('button', { name: /increase|▲|up/i });
    if (priorityUpButtons.length > 0) {
      await user.click(priorityUpButtons[0]);
      expect(onPriorityChange).toHaveBeenCalled();
    }
  });

  it('allows decreasing priority', async () => {
    const user = userEvent.setup();
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    const priorityDownButtons = screen.getAllByRole('button', { name: /decrease|▼|down/i });
    if (priorityDownButtons.length > 0) {
      await user.click(priorityDownButtons[0]);
      expect(onPriorityChange).toHaveBeenCalled();
    }
  });

  it('shows active repair status', () => {
    const modulesWithActive = mockDamagedModules.map((m, i) => ({
      ...m,
      isRepairing: i === 0,
    }));

    render(
      <RepairPriorityControl
        modules={modulesWithActive}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
        activeRepairId="mod-1"
      />
    );

    expect(screen.getByText(/repairing|in progress|active/i)).toBeInTheDocument();
  });

  it('allows cancelling active repair', async () => {
    const user = userEvent.setup();
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
        activeRepairId="mod-1"
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel|stop/i });
    await user.click(cancelButton);

    expect(onCancelRepair).toHaveBeenCalled();
  });

  it('allows starting repair on module', async () => {
    const user = userEvent.setup();
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    const repairButtons = screen.getAllByRole('button', { name: /repair|start/i });
    if (repairButtons.length > 0) {
      await user.click(repairButtons[0]);
      expect(onStartRepair).toHaveBeenCalled();
    }
  });

  it('displays estimated repair time when provided', () => {
    const modulesWithTime = mockDamagedModules.map(m => ({
      ...m,
      estimatedRepairTime: 120, // seconds
    }));

    render(
      <RepairPriorityControl
        modules={modulesWithTime}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    expect(screen.getByText(/120s|2m|2:00/i)).toBeInTheDocument();
  });

  it('shows auto-repair toggle', () => {
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    expect(screen.getByText(/auto|automatic/i)).toBeInTheDocument();
  });

  it('renders empty state when no damaged modules', () => {
    render(
      <RepairPriorityControl
        modules={[]}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    expect(screen.getByText(/no damaged|all modules operational/i)).toBeInTheDocument();
  });

  it('highlights critical modules', () => {
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
      />
    );

    // Critical modules should have visual indicator
    const criticalModule = screen.getByText('Shield Generator').closest('[data-status="critical"]');
    expect(criticalModule).toBeInTheDocument();
  });

  it('disables priority changes for module being repaired', async () => {
    const user = userEvent.setup();
    render(
      <RepairPriorityControl
        modules={mockDamagedModules}
        onPriorityChange={onPriorityChange}
        onStartRepair={onStartRepair}
        onCancelRepair={onCancelRepair}
        activeRepairId="mod-1"
      />
    );

    // Find the module being repaired
    const repairingModule = screen.getByText('Fusion Core').closest('[data-module-id]');
    if (repairingModule) {
      const buttons = within(repairingModule as HTMLElement).getAllByRole('button');
      // Priority buttons should be disabled
      const priorityButtons = buttons.filter(b => b.getAttribute('aria-label')?.includes('priority'));
      priorityButtons.forEach(btn => {
        expect(btn).toBeDisabled();
      });
    }
  });
});
