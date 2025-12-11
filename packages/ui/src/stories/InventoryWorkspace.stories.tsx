import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InventoryWorkspace } from '../lobby/InventoryWorkspace';
import { AmmunitionBrowser } from '../lobby/AmmunitionBrowser';
import { LoadedInventoryPanel } from '../lobby/LoadedInventoryPanel';
import { InventoryConstraintsPanel, type InventoryStats } from '../lobby/InventoryConstraintsPanel';
import { AmmunitionCard } from '../lobby/AmmunitionCard';
import { AmmunitionDetailModal } from '../lobby/AmmunitionDetailModal';
import type { Ammunition, ModuleInstance, ModuleVariant } from '@frigate/api-client';

/**
 * Inventory Workspace Stories
 *
 * Demonstrates the Ship Inventory Workspace for loading ammunition and cargo.
 * This workspace appears after ship design when the player clicks "REGISTER SCHEMATIC".
 *
 * ## Workflow Position
 * Player Selection → Team Selection → Ship Selection → Ship Design → **Inventory Workspace**
 *
 * ## Features
 * - Browse and search ammunition catalog
 * - Filter by compatibility with installed weapons
 * - Add/remove ammunition with quantity controls
 * - Track weight and credit constraints
 * - Register cargo to proceed to next step
 */

// Mock ammunition data
const mockAmmunition: Ammunition[] = [
  {
    id: 'kinetic-ap-200mm',
    name: '200mm AP',
    description: 'Armor-piercing round designed for penetrating heavy armor. High velocity sabot with tungsten core.',
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
    id: 'kinetic-he-200mm',
    name: '200mm HE',
    description: 'High-explosive round for area damage. Effective against unarmored targets and structures.',
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
    id: 'kinetic-ap-100mm',
    name: '100mm AP',
    description: 'Small caliber armor-piercing for point defense weapons.',
    category: 'kinetic',
    ammo_type: 'ap',
    ammo_size: '100mm',
    cost: 50,
    weight: 0.2,
    velocity: 2000,
    impact_damage: 20,
    blast_damage: 0,
    blast_radius: 0,
    armor_penetration: 60,
  },
  {
    id: 'kinetic-he-100mm',
    name: '100mm HE',
    description: 'Small caliber explosive round for suppression.',
    category: 'kinetic',
    ammo_type: 'he',
    ammo_size: '100mm',
    cost: 75,
    weight: 0.25,
    velocity: 1800,
    impact_damage: 15,
    blast_damage: 40,
    blast_radius: 3,
    armor_penetration: 15,
  },
  {
    id: 'missile-harpoon',
    name: 'Harpoon Anti-Ship Missile',
    description: 'Long-range anti-ship missile with terminal guidance. Sea-skimming flight profile.',
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
    id: 'missile-sidewinder',
    name: 'AIM-9X Sidewinder',
    description: 'Short-range infrared-guided missile for point defense.',
    category: 'missiles',
    cost: 300,
    weight: 0.8,
    velocity: 2200,
    impact_damage: 60,
    blast_damage: 40,
    blast_radius: 5,
    armor_penetration: 30,
  },
  {
    id: 'torpedo-mk48',
    name: 'Mk48 ADCAP Torpedo',
    description: 'Heavy torpedo with wire guidance and active/passive homing. Devastating against large targets.',
    category: 'torpedos',
    cost: 1000,
    weight: 5.0,
    velocity: 50,
    impact_damage: 200,
    blast_damage: 300,
    blast_radius: 20,
    armor_penetration: 100,
  },
  {
    id: 'torpedo-mk54',
    name: 'Mk54 Lightweight Torpedo',
    description: 'Lightweight torpedo for anti-submarine warfare.',
    category: 'torpedos',
    cost: 600,
    weight: 2.5,
    velocity: 40,
    impact_damage: 100,
    blast_damage: 150,
    blast_radius: 15,
    armor_penetration: 70,
  },
];

// Mock installed modules with 200mm kinetic weapons and missile launchers
const mockInstalledModules: ModuleInstance[] = [
  {
    id: 'module-1',
    variant_id: 'variant-kinetic-200mm',
    module_slot_id: 'kinetic_weapon_1',
  },
  {
    id: 'module-2',
    variant_id: 'variant-kinetic-200mm',
    module_slot_id: 'kinetic_weapon_2',
  },
  {
    id: 'module-3',
    variant_id: 'variant-missile',
    module_slot_id: 'missile_launcher_1',
  },
];

// Mock variants with ammo_type and ammo_size
const mockVariantsById: Record<string, ModuleVariant> = {
  'variant-kinetic-200mm': {
    id: 'variant-kinetic-200mm',
    module_id: 'mod-kinetic',
    name: '200mm Railgun Mk1',
    description: 'A 200mm railgun',
    cost: 100,
    credit_cost: 10000,
    weight: 50,
    hp: 100,
    power_consumption: 200,
    heat_generation: 150,
    ammo_type: 'ap',
    ammo_size: '200mm',
  } as unknown as ModuleVariant,
  'variant-missile': {
    id: 'variant-missile',
    module_id: 'mod-missile',
    name: 'VLS Missile Launcher',
    description: 'Vertical launch system',
    cost: 200,
    credit_cost: 20000,
    weight: 80,
    hp: 150,
    power_consumption: 100,
    heat_generation: 50,
  } as unknown as ModuleVariant,
};

// Mock player and team
const mockPlayer = { id: 'player-1', name: 'Commander Smith' };
const mockTeam = { id: 'team-1', name: 'Alpha Squadron', credits: 100000 };

// ============================================================================
// AmmunitionBrowser Stories
// ============================================================================

const browserMeta: Meta<typeof AmmunitionBrowser> = {
  title: 'Lobby/Inventory/AmmunitionBrowser',
  component: AmmunitionBrowser,
  parameters: {
    layout: 'padded',
  },
};

export default browserMeta;
type BrowserStory = StoryObj<typeof AmmunitionBrowser>;

export const Default: BrowserStory = {
  args: {
    ammunition: mockAmmunition,
    loading: false,
    error: null,
    showCompatibleOnly: false,
    onToggleCompatibleFilter: () => {},
    onAddAmmo: (id) => console.log('Add ammo:', id),
    onShowAmmoDetails: (ammo) => console.log('Show details:', ammo),
    canAddAmmo: () => true,
    isAmmoCompatible: () => true,
    getIncompatibilityReason: () => undefined,
    getCompatibleWeapons: () => [],
  },
};

export const Loading: BrowserStory = {
  args: {
    ...Default.args,
    loading: true,
    ammunition: [],
  },
};

export const Error: BrowserStory = {
  args: {
    ...Default.args,
    error: 'Failed to fetch ammunition catalog from server',
    ammunition: [],
  },
};

export const Empty: BrowserStory = {
  args: {
    ...Default.args,
    ammunition: [],
  },
};

export const CompatibleOnly: BrowserStory = {
  args: {
    ...Default.args,
    showCompatibleOnly: true,
    isAmmoCompatible: (id) => id.includes('200mm') || id.includes('missile'),
  },
};

export const WithIncompatibleItems: BrowserStory = {
  args: {
    ...Default.args,
    showCompatibleOnly: false,
    isAmmoCompatible: (id) => id.includes('200mm') || id.includes('missile'),
    getIncompatibilityReason: (ammo) => {
      if (ammo.category === 'kinetic' && ammo.ammo_size === '100mm') {
        return 'No 100mm weapons installed';
      }
      if (ammo.category === 'torpedos') {
        return 'No torpedo tubes installed';
      }
      return undefined;
    },
  },
};

export const ConstraintLimited: BrowserStory = {
  args: {
    ...Default.args,
    canAddAmmo: (id) => !id.includes('torpedo'), // Can't add torpedos (too heavy)
  },
};

// ============================================================================
// LoadedInventoryPanel Stories
// ============================================================================

export const LoadedInventoryEmpty: StoryObj<typeof LoadedInventoryPanel> = {
  render: () => (
    <LoadedInventoryPanel
      inventory={[]}
      ammoCatalog={mockAmmunition}
      onAddQuantity={() => {}}
      onRemoveQuantity={() => {}}
      onSetQuantity={() => {}}
      onRemoveAll={() => {}}
      onShowAmmoDetails={() => {}}
    />
  ),
};

export const LoadedInventoryWithItems: StoryObj<typeof LoadedInventoryPanel> = {
  render: () => (
    <LoadedInventoryPanel
      inventory={[
        { itemId: 'kinetic-ap-200mm', quantity: 50 },
        { itemId: 'kinetic-he-200mm', quantity: 25 },
        { itemId: 'missile-harpoon', quantity: 8 },
      ]}
      ammoCatalog={mockAmmunition}
      onAddQuantity={(id, qty) => console.log('Add', id, qty)}
      onRemoveQuantity={(id, qty) => console.log('Remove', id, qty)}
      onSetQuantity={(id, qty) => console.log('Set', id, qty)}
      onRemoveAll={(id) => console.log('Remove all', id)}
      onShowAmmoDetails={(ammo) => console.log('Details', ammo)}
    />
  ),
};

// ============================================================================
// InventoryConstraintsPanel Stories
// ============================================================================

const normalStats: InventoryStats = {
  cargoWeight: 45,
  weightCapacity: 100,
  cargoCost: 15000,
  creditBudget: 50000,
  ammoTypesLoaded: 3,
  totalItems: 83,
  warnings: [],
};

export const ConstraintsPanelNormal: StoryObj<typeof InventoryConstraintsPanel> = {
  render: () => (
    <InventoryConstraintsPanel
      stats={normalStats}
      onRegisterCargo={() => console.log('Register cargo')}
      canRegister={true}
    />
  ),
};

export const ConstraintsPanelOverWeight: StoryObj<typeof InventoryConstraintsPanel> = {
  render: () => (
    <InventoryConstraintsPanel
      stats={{
        ...normalStats,
        cargoWeight: 120,
        weightCapacity: 100,
      }}
      onRegisterCargo={() => {}}
      canRegister={false}
    />
  ),
};

export const ConstraintsPanelOverBudget: StoryObj<typeof InventoryConstraintsPanel> = {
  render: () => (
    <InventoryConstraintsPanel
      stats={{
        ...normalStats,
        cargoCost: 60000,
        creditBudget: 50000,
      }}
      onRegisterCargo={() => {}}
      canRegister={false}
    />
  ),
};

export const ConstraintsPanelWithWarnings: StoryObj<typeof InventoryConstraintsPanel> = {
  render: () => (
    <InventoryConstraintsPanel
      stats={{
        ...normalStats,
        warnings: [
          'No 100mm weapons installed',
          'No torpedo tubes installed',
        ],
      }}
      onRegisterCargo={() => console.log('Register cargo')}
      canRegister={true}
    />
  ),
};

// ============================================================================
// AmmunitionCard Stories
// ============================================================================

export const AmmunitionCardCompatible: StoryObj<typeof AmmunitionCard> = {
  render: () => (
    <AmmunitionCard
      ammo={mockAmmunition[0]}
      isCompatible={true}
      canAdd={true}
      onAdd={() => console.log('Add')}
      onShowDetails={() => console.log('Details')}
      compatibleWeapons={['200mm Railgun Mk1', '200mm Railgun Mk2']}
    />
  ),
};

export const AmmunitionCardIncompatible: StoryObj<typeof AmmunitionCard> = {
  render: () => (
    <AmmunitionCard
      ammo={mockAmmunition[2]}
      isCompatible={false}
      incompatibilityReason="No 100mm weapons installed"
      canAdd={true}
      onAdd={() => console.log('Add')}
      onShowDetails={() => console.log('Details')}
    />
  ),
};

export const AmmunitionCardCannotAdd: StoryObj<typeof AmmunitionCard> = {
  render: () => (
    <AmmunitionCard
      ammo={mockAmmunition[6]}
      isCompatible={true}
      canAdd={false}
      onAdd={() => {}}
      onShowDetails={() => console.log('Details')}
    />
  ),
};

// ============================================================================
// AmmunitionDetailModal Stories
// ============================================================================

export const DetailModalCompatible: StoryObj<typeof AmmunitionDetailModal> = {
  render: () => (
    <AmmunitionDetailModal
      ammo={mockAmmunition[0]}
      isOpen={true}
      onClose={() => {}}
      onAddToInventory={(id, qty) => console.log('Add', id, qty)}
      canAdd={true}
      canAddQuantity={() => true}
      isCompatible={true}
      compatibleWeapons={['200mm Railgun Mk1']}
    />
  ),
};

export const DetailModalIncompatible: StoryObj<typeof AmmunitionDetailModal> = {
  render: () => (
    <AmmunitionDetailModal
      ammo={mockAmmunition[6]}
      isOpen={true}
      onClose={() => {}}
      onAddToInventory={(id, qty) => console.log('Add', id, qty)}
      canAdd={true}
      canAddQuantity={() => true}
      isCompatible={false}
      incompatibilityReason="No torpedo tubes installed"
    />
  ),
};

// ============================================================================
// Full InventoryWorkspace Story
// ============================================================================

export const FullWorkspace: StoryObj<typeof InventoryWorkspace> = {
  render: () => (
    <div style={{ height: '100vh' }}>
      <InventoryWorkspace
        apiUrl="http://localhost:3000"
        player={mockPlayer}
        team={mockTeam}
        blueprintId="bp-destroyer-001"
        availableWeight={100}
        installedModules={mockInstalledModules}
        variantsById={mockVariantsById}
        shipDesignCost={50000}
        onBack={() => console.log('Back')}
        onRegisterCargo={() => console.log('Register cargo')}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
