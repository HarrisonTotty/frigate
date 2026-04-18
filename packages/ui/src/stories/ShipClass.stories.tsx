/**
 * Ship Class Components Storybook Stories - Phase 4.12.6
 *
 * Comprehensive stories for ship class display components with various states.
 */

import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ShipClassDetailPanel,
  TechnicalSpecsGrid,
  BuildConstraintsPanel,
  ShipClassBonusList,
  ShipClassCard,
} from "../shipclass";
import type { ShipClassDetails, ShipClassSummary } from "../types/shipClass";

// Mock ship class data
const mockFrigate: ShipClassDetails = {
  id: "frigate",
  name: "Frigate",
  description:
    "A versatile medium-sized warship designed for multi-role operations. Balances firepower, defense, and speed for diverse mission profiles.",
  size: "Medium",
  role: "Versatile",
  max_weight: 50000,
  max_modules: 8,
  base_hull: 1000,
  base_shields: 500,
  build_points: 120,
  bonuses: {
    combat: [
      {
        id: "weapon_damage",
        name: "Weapon Damage",
        description: "Increases damage dealt by all weapons",
        value: 15,
        formatted_value: "+15%",
        applies_to: ["All Weapons"],
      },
      {
        id: "weapon_range",
        name: "Weapon Range",
        description: "Extends effective range of weapon systems",
        value: 10,
        formatted_value: "+10%",
        applies_to: ["Kinetic", "Energy"],
      },
    ],
    defense: [
      {
        id: "shield_regen",
        name: "Shield Regeneration",
        description: "Increases shield regeneration rate",
        value: 20,
        formatted_value: "+20%",
        applies_to: ["Shield Systems"],
      },
      {
        id: "hull_integrity",
        name: "Hull Integrity",
        description: "Additional structural reinforcement",
        value: 150,
        formatted_value: "+150 HP",
        applies_to: ["Hull"],
      },
    ],
    mobility: [
      {
        id: "turn_rate",
        name: "Turn Rate",
        description: "Improved maneuverability",
        value: 12,
        formatted_value: "+12%",
        applies_to: ["Thrusters"],
      },
    ],
    utility: [
      {
        id: "sensor_range",
        name: "Sensor Range",
        description: "Extended detection range",
        value: 25,
        formatted_value: "+25%",
        applies_to: ["Sensors"],
      },
    ],
    efficiency: [
      {
        id: "power_efficiency",
        name: "Power Efficiency",
        description: "Reduced power consumption",
        value: -8,
        formatted_value: "-8%",
        applies_to: ["All Systems"],
      },
    ],
  },
  technical_specs: {
    Length: "150m",
    Width: "45m",
    Height: "30m",
    Mass: "50,000 tonnes",
    Crew: "25-40",
    Cargo: "500 m³",
    "Max Acceleration": "35 m/s²",
    "Turn Rate": "25°/s",
    "Max Warp": "5.0c",
    "Sensor Range": "25,000 km",
    Range: "15 AU",
  },
  manufacturers: {
    "terran-federation": {
      manufacturer: "United Shipyards",
      variant: "Constitution-class",
      lore: "The Constitution-class represents the pinnacle of Federation engineering. Built with redundant systems and modular design for maximum flexibility.",
    },
    "mars-coalition": {
      manufacturer: "Olympus Heavy Industries",
      variant: "Ares-class",
      lore: "Martian frigates emphasize firepower and armor over speed. The Ares-class features reinforced hull plating and enhanced weapon mounts.",
    },
  },
  lore: "First commissioned in 2285, the frigate-class became the backbone of fleet operations across civilized space. Its balanced design allows it to excel in escort, patrol, and combat roles.",
  year_introduced: 2285,
  notable_ships: [
    "UNS Constitution",
    "UNS Enterprise",
    "MCS Olympus",
    "UNS Defiant",
    "BAV Ceres",
    "UNS Phoenix",
  ],
};

const mockCorvette: ShipClassSummary = {
  id: "corvette",
  name: "Corvette",
  description: "A small, fast attack craft designed for hit-and-run tactics and rapid response.",
  size: "Small",
  role: "Combat",
  max_weight: 25000,
  max_modules: 5,
  build_points: 80,
};

const mockCruiser: ShipClassSummary = {
  id: "cruiser",
  name: "Cruiser",
  description: "A large warship with heavy armament and extensive crew accommodations.",
  size: "Large",
  role: "Offense",
  max_weight: 100000,
  max_modules: 12,
  build_points: 200,
};

// ShipClassDetailPanel Stories
const DetailPanelMeta: Meta<typeof ShipClassDetailPanel> = {
  title: "Ship Class/Detail Panel",
  component: ShipClassDetailPanel,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export { DetailPanelMeta };

export const DetailPanelDefault: StoryObj<typeof ShipClassDetailPanel> = {
  args: {
    shipClass: mockFrigate,
  },
};

export const DetailPanelWithFaction: StoryObj<typeof ShipClassDetailPanel> = {
  args: {
    shipClass: mockFrigate,
    factionId: "terran-federation",
  },
};

export const DetailPanelMartianVariant: StoryObj<typeof ShipClassDetailPanel> = {
  args: {
    shipClass: mockFrigate,
    factionId: "mars-coalition",
  },
};

// TechnicalSpecsGrid Stories
const TechSpecsMeta: Meta<typeof TechnicalSpecsGrid> = {
  title: "Ship Class/Technical Specs Grid",
  component: TechnicalSpecsGrid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export { TechSpecsMeta };

export const TechSpecsDefault: StoryObj<typeof TechnicalSpecsGrid> = {
  args: {
    specs: mockFrigate.technical_specs,
  },
};

// BuildConstraintsPanel Stories
const BuildConstraintsMeta: Meta<typeof BuildConstraintsPanel> = {
  title: "Ship Class/Build Constraints Panel",
  component: BuildConstraintsPanel,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export { BuildConstraintsMeta };

export const BuildConstraintsEmpty: StoryObj<typeof BuildConstraintsPanel> = {
  args: {
    maxWeight: 50000,
    maxModules: 8,
    buildPoints: 120,
  },
};

export const BuildConstraintsPartiallyUsed: StoryObj<typeof BuildConstraintsPanel> = {
  args: {
    maxWeight: 50000,
    maxModules: 8,
    buildPoints: 120,
    currentWeight: 30000,
    currentModules: 5,
    currentBuildPoints: 85,
  },
};

export const BuildConstraintsNearLimit: StoryObj<typeof BuildConstraintsPanel> = {
  args: {
    maxWeight: 50000,
    maxModules: 8,
    buildPoints: 120,
    currentWeight: 47000,
    currentModules: 7,
    currentBuildPoints: 115,
  },
};

export const BuildConstraintsOverLimit: StoryObj<typeof BuildConstraintsPanel> = {
  args: {
    maxWeight: 50000,
    maxModules: 8,
    buildPoints: 120,
    currentWeight: 52000,
    currentModules: 9,
    currentBuildPoints: 125,
  },
};

// ShipClassBonusList Stories
const BonusListMeta: Meta<typeof ShipClassBonusList> = {
  title: "Ship Class/Bonus List",
  component: ShipClassBonusList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export { BonusListMeta };

export const BonusListDefault: StoryObj<typeof ShipClassBonusList> = {
  args: {
    bonuses: mockFrigate.bonuses,
  },
};

export const BonusListAllExpanded: StoryObj<typeof ShipClassBonusList> = {
  args: {
    bonuses: mockFrigate.bonuses,
    defaultExpandedCategories: ["combat", "defense", "mobility", "utility", "efficiency"],
  },
};

export const BonusListEmpty: StoryObj<typeof ShipClassBonusList> = {
  args: {
    bonuses: {
      combat: [],
      defense: [],
      mobility: [],
      utility: [],
      efficiency: [],
    },
  },
};

// ShipClassCard Stories
const CardMeta: Meta<typeof ShipClassCard> = {
  title: "Ship Class/Card",
  component: ShipClassCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export { CardMeta };

export const CardDefault: StoryObj<typeof ShipClassCard> = {
  args: {
    shipClass: mockCorvette,
    isSelected: false,
    onClick: () => console.log("Card clicked"),
  },
};

export const CardSelected: StoryObj<typeof ShipClassCard> = {
  args: {
    shipClass: mockCorvette,
    isSelected: true,
    onClick: () => console.log("Card clicked"),
  },
};

export const CardGrid: StoryObj<typeof ShipClassCard> = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
      <ShipClassCard shipClass={mockCorvette} onClick={() => {}} />
      <ShipClassCard shipClass={mockCorvette} isSelected onClick={() => {}} />
      <ShipClassCard shipClass={mockCruiser} onClick={() => {}} />
    </div>
  ),
};
