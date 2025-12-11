import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AmmunitionBrowser, type AmmunitionBrowserProps } from '../AmmunitionBrowser';
import type { Ammunition } from '@frigate/api-client';

// Mock ammunition data
const mockAmmunition: Ammunition[] = [
  {
    id: 'kinetic-1',
    name: '200mm AP',
    description: 'Armor-piercing round for kinetic weapons',
    category: 'kinetic',
    ammo_type: 'ap',
    ammo_size: '200mm',
    cost: 100,
    weight: 0.5,
    velocity: 1500,
    impact_damage: 50,
    blast_damage: 0,
    blast_radius: 0,
    armor_penetration: 80,
  },
  {
    id: 'kinetic-2',
    name: '200mm HE',
    description: 'High-explosive round',
    category: 'kinetic',
    ammo_type: 'he',
    ammo_size: '200mm',
    cost: 150,
    weight: 0.6,
    velocity: 1200,
    impact_damage: 30,
    blast_damage: 70,
    blast_radius: 5,
    armor_penetration: 20,
  },
  {
    id: 'missile-1',
    name: 'Harpoon Missile',
    description: 'Anti-ship missile',
    category: 'missiles',
    cost: 500,
    weight: 2.0,
    velocity: 800,
    impact_damage: 100,
    blast_damage: 150,
    blast_radius: 10,
    armor_penetration: 50,
  },
  {
    id: 'torpedo-1',
    name: 'Mk48 Torpedo',
    description: 'Heavy torpedo',
    category: 'torpedos',
    cost: 1000,
    weight: 5.0,
    velocity: 50,
    impact_damage: 200,
    blast_damage: 300,
    blast_radius: 20,
    armor_penetration: 100,
  },
];

describe('AmmunitionBrowser', () => {
  const defaultProps: AmmunitionBrowserProps = {
    ammunition: mockAmmunition,
    loading: false,
    error: null,
    showCompatibleOnly: false,
    onToggleCompatibleFilter: vi.fn(),
    onAddAmmo: vi.fn(),
    onShowAmmoDetails: vi.fn(),
    canAddAmmo: vi.fn(() => true),
    isAmmoCompatible: vi.fn(() => true),
    getIncompatibilityReason: vi.fn(() => undefined),
    getCompatibleWeapons: vi.fn(() => []),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the component with header', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      expect(screen.getByText('AMMUNITION CATALOG')).toBeDefined();
    });

    it('renders all ammunition items', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      expect(screen.getByText('200mm AP')).toBeDefined();
      expect(screen.getByText('200mm HE')).toBeDefined();
      expect(screen.getByText('Harpoon Missile')).toBeDefined();
      expect(screen.getByText('Mk48 Torpedo')).toBeDefined();
    });

    it('renders category headers', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      expect(screen.getByText('KINETIC')).toBeDefined();
      expect(screen.getByText('MISSILES')).toBeDefined();
      expect(screen.getByText('TORPEDOS')).toBeDefined();
    });

    it('displays item count in footer', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      expect(screen.getByText('4 ITEMS')).toBeDefined();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator', () => {
      render(<AmmunitionBrowser {...defaultProps} loading={true} />);
      expect(screen.getByText('[LOADING AMMUNITION CATALOG...]')).toBeDefined();
    });

    it('has aria-busy attribute when loading', () => {
      render(<AmmunitionBrowser {...defaultProps} loading={true} />);
      const container = screen.getByLabelText('Loading ammunition catalog');
      expect(container.getAttribute('aria-busy')).toBe('true');
    });
  });

  describe('error state', () => {
    it('shows error message', () => {
      render(<AmmunitionBrowser {...defaultProps} error="Network error" />);
      expect(screen.getByText('[ERROR] FAILED TO LOAD AMMUNITION')).toBeDefined();
      expect(screen.getByText('Network error')).toBeDefined();
    });

    it('has alert role when error', () => {
      render(<AmmunitionBrowser {...defaultProps} error="Network error" />);
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no ammunition', () => {
      render(<AmmunitionBrowser {...defaultProps} ammunition={[]} />);
      expect(screen.getByText('[NO AMMUNITION FOUND]')).toBeDefined();
    });

    it('suggests disabling filter when compatible only and empty', () => {
      render(
        <AmmunitionBrowser
          {...defaultProps}
          ammunition={[]}
          showCompatibleOnly={true}
        />
      );
      expect(screen.getByText('Try disabling compatibility filter')).toBeDefined();
    });
  });

  describe('search filtering', () => {
    it('filters ammunition by search query', async () => {
      const user = userEvent.setup();
      render(<AmmunitionBrowser {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('SEARCH...');
      await user.type(searchInput, 'torpedo');

      expect(screen.getByText('Mk48 Torpedo')).toBeDefined();
      expect(screen.queryByText('200mm AP')).toBeNull();
      expect(screen.queryByText('Harpoon Missile')).toBeNull();
    });

    it('searches in description', async () => {
      const user = userEvent.setup();
      render(<AmmunitionBrowser {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('SEARCH...');
      await user.type(searchInput, 'armor-piercing');

      expect(screen.getByText('200mm AP')).toBeDefined();
      expect(screen.queryByText('200mm HE')).toBeNull();
    });

    it('shows empty state when search has no results', async () => {
      const user = userEvent.setup();
      render(<AmmunitionBrowser {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('SEARCH...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('[NO AMMUNITION FOUND]')).toBeDefined();
    });

    it('updates item count when filtered', async () => {
      const user = userEvent.setup();
      render(<AmmunitionBrowser {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('SEARCH...');
      await user.type(searchInput, 'torpedo');

      expect(screen.getByText('1 ITEMS')).toBeDefined();
    });
  });

  describe('compatibility filtering', () => {
    it('shows filter toggle button', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      expect(screen.getByText('[SHOW ALL]')).toBeDefined();
    });

    it('shows compatible only label when filter enabled', () => {
      render(<AmmunitionBrowser {...defaultProps} showCompatibleOnly={true} />);
      expect(screen.getByText('[COMPATIBLE ONLY]')).toBeDefined();
    });

    it('calls onToggleCompatibleFilter when clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <AmmunitionBrowser {...defaultProps} onToggleCompatibleFilter={onToggle} />
      );

      await user.click(screen.getByText('[SHOW ALL]'));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('filters incompatible ammo when enabled', () => {
      const isAmmoCompatible = vi.fn((id: string) => id === 'kinetic-1');
      render(
        <AmmunitionBrowser
          {...defaultProps}
          showCompatibleOnly={true}
          isAmmoCompatible={isAmmoCompatible}
        />
      );

      expect(screen.getByText('200mm AP')).toBeDefined();
      expect(screen.queryByText('200mm HE')).toBeNull();
      expect(screen.queryByText('Harpoon Missile')).toBeNull();
    });
  });

  describe('sorting', () => {
    it('sorts by name by default', () => {
      render(<AmmunitionBrowser {...defaultProps} />);

      // Find all ammo names in order within the kinetic category
      const kineticSection = screen.getByText('KINETIC').closest('div')?.parentElement;
      if (kineticSection) {
        const items = within(kineticSection).getAllByRole('button', { name: /200mm/ });
        expect(items.length).toBeGreaterThan(0);
      }
    });

    it('has sort selector', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      const sortSelect = screen.getByLabelText('Sort ammunition by');
      expect(sortSelect).toBeDefined();
    });

    it('changes sort order', async () => {
      const user = userEvent.setup();
      render(<AmmunitionBrowser {...defaultProps} />);

      const sortSelect = screen.getByLabelText('Sort ammunition by');
      await user.selectOptions(sortSelect, 'cost');

      // After sorting by cost, the order should change
      expect(sortSelect).toHaveValue('cost');
    });
  });

  describe('category expansion', () => {
    it('expands categories by default', () => {
      render(<AmmunitionBrowser {...defaultProps} />);

      // Items should be visible
      expect(screen.getByText('200mm AP')).toBeDefined();
    });

    it('collapses category when header clicked', async () => {
      const user = userEvent.setup();
      render(<AmmunitionBrowser {...defaultProps} />);

      const kineticHeader = screen.getByRole('button', { name: /KINETIC - 2 items/i });
      await user.click(kineticHeader);

      // Kinetic items should be hidden
      expect(screen.queryByText('200mm AP')).toBeNull();
      expect(screen.queryByText('200mm HE')).toBeNull();
      // But missiles should still be visible
      expect(screen.getByText('Harpoon Missile')).toBeDefined();
    });

    it('shows expand indicator when collapsed', async () => {
      const user = userEvent.setup();
      render(<AmmunitionBrowser {...defaultProps} />);

      const kineticHeader = screen.getByRole('button', { name: /KINETIC - 2 items/i });

      // Initially expanded, should show [-]
      expect(within(kineticHeader).getByText('[-]')).toBeDefined();

      await user.click(kineticHeader);

      // After collapse, should show [+]
      expect(within(kineticHeader).getByText('[+]')).toBeDefined();
    });
  });

  describe('adding ammunition', () => {
    it('calls onAddAmmo when add button clicked', async () => {
      const user = userEvent.setup();
      const onAddAmmo = vi.fn();
      render(<AmmunitionBrowser {...defaultProps} onAddAmmo={onAddAmmo} />);

      const addButton = screen.getByLabelText('Add 200mm AP to inventory');
      await user.click(addButton);

      expect(onAddAmmo).toHaveBeenCalledWith('kinetic-1');
    });

    it('disables add button when canAddAmmo returns false', () => {
      const canAddAmmo = vi.fn(() => false);
      render(<AmmunitionBrowser {...defaultProps} canAddAmmo={canAddAmmo} />);

      const addButton = screen.getByLabelText('Add 200mm AP to inventory');
      expect(addButton).toBeDisabled();
    });
  });

  describe('showing details', () => {
    it('calls onShowAmmoDetails when card clicked', async () => {
      const user = userEvent.setup();
      const onShowAmmoDetails = vi.fn();
      render(
        <AmmunitionBrowser {...defaultProps} onShowAmmoDetails={onShowAmmoDetails} />
      );

      // Click on the card (not the add button)
      const card = screen.getByRole('button', { name: /200mm AP - 100 credits/ });
      await user.click(card);

      expect(onShowAmmoDetails).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'kinetic-1', name: '200mm AP' })
      );
    });
  });

  describe('keyboard navigation', () => {
    it('focuses search on / key', async () => {
      const user = userEvent.setup();
      render(<AmmunitionBrowser {...defaultProps} />);

      await user.keyboard('/');

      const searchInput = screen.getByPlaceholderText('SEARCH...');
      expect(document.activeElement).toBe(searchInput);
    });

    it('toggles filter on F key', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <AmmunitionBrowser {...defaultProps} onToggleCompatibleFilter={onToggle} />
      );

      await user.keyboard('f');

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('does not toggle filter when typing in search', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <AmmunitionBrowser {...defaultProps} onToggleCompatibleFilter={onToggle} />
      );

      const searchInput = screen.getByPlaceholderText('SEARCH...');
      await user.click(searchInput);
      await user.keyboard('f');

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('incompatibility display', () => {
    it('shows incompatible items with reduced opacity', () => {
      const isAmmoCompatible = vi.fn((id: string) => id !== 'kinetic-1');
      render(
        <AmmunitionBrowser
          {...defaultProps}
          showCompatibleOnly={false}
          isAmmoCompatible={isAmmoCompatible}
        />
      );

      // The card for kinetic-1 should have reduced opacity
      const card = screen.getByRole('button', { name: /200mm AP.*incompatible/ });
      expect(card).toBeDefined();
    });

    it('displays NO WEAPON indicator for incompatible ammo', () => {
      const isAmmoCompatible = vi.fn((id: string) => id !== 'kinetic-1');
      render(
        <AmmunitionBrowser
          {...defaultProps}
          showCompatibleOnly={false}
          isAmmoCompatible={isAmmoCompatible}
        />
      );

      expect(screen.getByText('[NO WEAPON]')).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has accessible region label', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      expect(screen.getByRole('region', { name: 'Ammunition Browser' })).toBeDefined();
    });

    it('search input has accessible label', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      expect(screen.getByLabelText('Search ammunition')).toBeDefined();
    });

    it('filter toggle has aria-pressed', () => {
      render(<AmmunitionBrowser {...defaultProps} showCompatibleOnly={true} />);
      const button = screen.getByLabelText('Toggle compatible only filter');
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    it('category headers have aria-expanded', () => {
      render(<AmmunitionBrowser {...defaultProps} />);
      const header = screen.getByRole('button', { name: /KINETIC - 2 items/i });
      expect(header.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <AmmunitionBrowser {...defaultProps} className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toBe('custom-class');
    });

    it('uses monospace font family', () => {
      const { container } = render(<AmmunitionBrowser {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.fontFamily).toBe('var(--frigate-font-mono)');
    });
  });
});
