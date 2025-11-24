import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstalledModulesList } from '../InstalledModulesList';
import type { ModuleInstance, ModuleSlot } from '@frigate/api-client';

describe('InstalledModulesList', () => {
  const mockSlot: ModuleSlot = {
    id: 'slot-propulsion-1',
    name: 'Primary Thruster',
    description: 'Main propulsion system',
    groups: ['Essential'],
    required: true,
    hasVariants: true,
    base_cost: 10,
    max_slots: 1,
    base_hp: 50,
    base_power_consumption: 10,
    base_heat_generation: 5,
    base_weight: 500,
  };

  const mockSlotNoVariants: ModuleSlot = {
    id: 'slot-weapons-1',
    name: 'Weapon Slot',
    description: 'Weapon mounting point',
    groups: ['Weapon'],
    required: false,
    hasVariants: false,
    base_cost: 5,
    max_slots: 4,
    base_hp: 20,
    base_power_consumption: 0,
    base_heat_generation: 0,
    base_weight: 100,
  };

  const mockModule: ModuleInstance = {
    id: 'inst1',
    module_slot_id: 'slot-propulsion-1',
    variant_id: 'impulse-drive-std',
  };

  const mockModule2: ModuleInstance = {
    id: 'inst2',
    module_slot_id: 'slot-weapons-1',
    variant_id: null,
  };

  const mockSlots: Record<string, ModuleSlot> = {
    'slot-propulsion-1': mockSlot,
    'slot-weapons-1': mockSlotNoVariants,
  };

  describe('rendering', () => {
    it('renders the component with header', () => {
      render(
        <InstalledModulesList instances={[]} onSelectType={() => {}} onRemove={() => {}} />
      );
      expect(screen.getByText('INSTALLED MODULES')).toBeDefined();
    });

    it('displays empty state when no modules', () => {
      render(
        <InstalledModulesList instances={[]} onSelectType={() => {}} onRemove={() => {}} />
      );
      expect(screen.getByText('NO MODULES INSTALLED')).toBeDefined();
    });

    it('displays module count header', () => {
      render(
        <InstalledModulesList
          instances={[mockModule]}
          maxModules={12}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      expect(screen.getByText('COUNT: 1 / 12')).toBeDefined();
    });

    it('renders all installed modules', () => {
      render(
        <InstalledModulesList
          instances={[mockModule, mockModule2]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      expect(screen.getByText('Primary Thruster')).toBeDefined();
      expect(screen.getByText('Weapon Slot')).toBeDefined();
    });

    it('displays variant status for each module', () => {
      render(
        <InstalledModulesList
          instances={[mockModule, mockModule2]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      expect(screen.getByText('impulse-drive-std')).toBeDefined();
      expect(screen.getByText('[UNCONFIGURED]')).toBeDefined();
    });

    it('displays [SELECT TYPE] button only for slots with variants', () => {
      render(
        <InstalledModulesList
          instances={[mockModule, mockModule2]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const selectButtons = screen.getAllByText('[SELECT TYPE]');
      // Should only have 1 SELECT TYPE button (for the slot with variants)
      expect(selectButtons.length).toBe(1);
    });

    it('displays remove button for each module', () => {
      render(
        <InstalledModulesList
          instances={[mockModule, mockModule2]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const removeButtons = screen.getAllByText('[REMOVE]');
      expect(removeButtons.length).toBe(2);
    });

    it('displays keyboard hints footer', () => {
      render(
        <InstalledModulesList instances={[]} onSelectType={() => {}} onRemove={() => {}} />
      );
      expect(screen.getByText(/KEYS:/)).toBeDefined();
    });
  });

  describe('interactions', () => {
    it('calls onSelectType when select type button clicked', () => {
      const onSelectType = vi.fn();
      render(
        <InstalledModulesList
          instances={[mockModule]}
          moduleSlots={mockSlots}
          onSelectType={onSelectType}
          onRemove={() => {}}
        />
      );
      const selectButtons = screen.getAllByText('[SELECT TYPE]');
      fireEvent.click(selectButtons[0]);
      expect(onSelectType).toHaveBeenCalledWith('inst1', mockSlot);
    });

    it('calls onRemove when remove button clicked', () => {
      const onRemove = vi.fn();
      render(
        <InstalledModulesList
          instances={[mockModule]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={onRemove}
        />
      );
      const removeButtons = screen.getAllByText('[REMOVE]');
      fireEvent.click(removeButtons[0]);
      expect(onRemove).toHaveBeenCalledWith('inst1');
    });

    it('handles missing onSelectType and onRemove callbacks gracefully', () => {
      const { container } = render(
        <InstalledModulesList instances={[mockModule]} moduleSlots={mockSlots} />
      );
      const selectButtons = screen.getAllByText('[SELECT TYPE]');
      fireEvent.click(selectButtons[0]);
      // Should not throw
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('warnings', () => {
    it('displays warning when module limit exceeded', () => {
      const modules = Array(13).fill(mockModule).map((m, i) => ({
        ...m,
        id: `inst${i}`,
      }));
      render(
        <InstalledModulesList
          instances={modules}
          maxModules={12}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      expect(screen.getByText(/MODULE LIMIT EXCEEDED/)).toBeDefined();
      expect(screen.getByText('13/12')).toBeDefined();
    });

    it('does not display warning when within limit', () => {
      render(
        <InstalledModulesList
          instances={[mockModule]}
          maxModules={12}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const warning = screen.queryByText(/MODULE LIMIT EXCEEDED/);
      expect(!warning).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('has proper role and aria-label on main container', () => {
      const { container } = render(
        <InstalledModulesList instances={[]} onSelectType={() => {}} onRemove={() => {}} />
      );
      const wrapper = container.querySelector('[role="list"]');
      expect(wrapper?.getAttribute('aria-label')).toBe('Installed Modules');
    });

    it('has proper role on each module item', () => {
      const { container } = render(
        <InstalledModulesList
          instances={[mockModule]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const items = container.querySelectorAll('[role="listitem"]');
      expect(items.length).toBe(1);
    });

    it('has aria-label for select type buttons', () => {
      render(
        <InstalledModulesList
          instances={[mockModule]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const selectButtons = screen.getAllByText('[SELECT TYPE]');
      expect(selectButtons[0]?.getAttribute('aria-label')).toContain('Select type');
    });

    it('has aria-label for remove buttons', () => {
      render(
        <InstalledModulesList
          instances={[mockModule]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const removeButtons = screen.getAllByText('[REMOVE]');
      expect(removeButtons[0]?.getAttribute('aria-label')).toContain('Remove module');
    });

    it('has aria-label for module items', () => {
      const { container } = render(
        <InstalledModulesList
          instances={[mockModule]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const items = container.querySelectorAll('[role="listitem"]');
      expect(items[0]?.getAttribute('aria-label')).toContain('Primary Thruster');
      expect(items[0]?.getAttribute('aria-label')).toContain('impulse-drive-std');
    });
  });

  describe('styling', () => {
    it('applies border styling', () => {
      const { container } = render(
        <InstalledModulesList instances={[]} onSelectType={() => {}} onRemove={() => {}} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.border).toContain('1px solid');
    });

    it('applies theme colors and fonts', () => {
      const { container } = render(
        <InstalledModulesList instances={[]} onSelectType={() => {}} onRemove={() => {}} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.fontFamily).toContain('monospace');
      expect(wrapper.style.backgroundColor).toBe('var(--frigate-bg-surface)');
    });

    it('applies custom className', () => {
      const { container } = render(
        <InstalledModulesList
          instances={[]}
          onSelectType={() => {}}
          onRemove={() => {}}
          className="custom-class"
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toBe('custom-class');
    });
  });

  describe('responsive layout', () => {
    it('handles multiple modules with proper spacing', () => {
      const modules = [mockModule, mockModule2];
      const { container } = render(
        <InstalledModulesList
          instances={modules}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const items = container.querySelectorAll('[role="listitem"]');
      expect(items.length).toBe(2);
    });

    it('displays modules in correct order', () => {
      const m1 = { ...mockModule, id: 'first', variant_id: 'var1' };
      const m2 = { ...mockModule2, id: 'second', variant_id: 'var2' };
      render(
        <InstalledModulesList
          instances={[m1, m2]}
          moduleSlots={mockSlots}
          onSelectType={() => {}}
          onRemove={() => {}}
        />
      );
      const items = screen.getAllByText(/VARIANT:/);
      expect(items.length).toBe(2);
    });
  });
});
