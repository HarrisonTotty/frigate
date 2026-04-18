import { describe, it, expect } from "vitest";
import {
  extractWeaponCompatibility,
  checkAmmoCompatibility,
  getIncompatibilityReason,
  getCompatibleWeapons,
  filterCompatibleAmmo,
  type WeaponCompatibility,
} from "../ammoCompatibility";
import type { ModuleInstance, ModuleVariant, Ammunition } from "@frigate/api-client";

// Mock module instances
const mockModules: ModuleInstance[] = [
  {
    id: "module-1",
    variant_id: "variant-1",
    module_slot_id: "kinetic_weapon_1",
  },
  {
    id: "module-2",
    variant_id: "variant-2",
    module_slot_id: "kinetic_weapon_2",
  },
  {
    id: "module-3",
    variant_id: "variant-3",
    module_slot_id: "missile_launcher_1",
  },
  {
    id: "module-4",
    variant_id: "variant-4",
    module_slot_id: "torpedo_tube_1",
  },
];

// Mock variants
const mockVariantsById: Record<string, ModuleVariant> = {
  "variant-1": {
    id: "variant-1",
    module_id: "mod-kinetic",
    name: "200mm Railgun Mk1",
    description: "A 200mm railgun",
    cost: 100,
    credit_cost: 10000,
    weight: 50,
    hp: 100,
    power_consumption: 200,
    heat_generation: 150,
    ammo_type: "ap",
    ammo_size: "200mm",
  } as unknown as ModuleVariant,
  "variant-2": {
    id: "variant-2",
    module_id: "mod-kinetic",
    name: "200mm Railgun Mk2",
    description: "An upgraded 200mm railgun",
    cost: 150,
    credit_cost: 15000,
    weight: 55,
    hp: 120,
    power_consumption: 220,
    heat_generation: 160,
    ammo_type: "he",
    ammo_size: "200mm",
  } as unknown as ModuleVariant,
  "variant-3": {
    id: "variant-3",
    module_id: "mod-missile",
    name: "VLS Missile Launcher",
    description: "Vertical launch missile system",
    cost: 200,
    credit_cost: 20000,
    weight: 80,
    hp: 150,
    power_consumption: 100,
    heat_generation: 50,
  } as unknown as ModuleVariant,
  "variant-4": {
    id: "variant-4",
    module_id: "mod-torpedo",
    name: "Heavy Torpedo Tube",
    description: "Heavy torpedo launcher",
    cost: 250,
    credit_cost: 25000,
    weight: 100,
    hp: 200,
    power_consumption: 80,
    heat_generation: 30,
  } as unknown as ModuleVariant,
};

// Mock ammunition
const mockAmmunition: Ammunition[] = [
  {
    id: "ammo-1",
    name: "200mm AP",
    description: "Armor-piercing round",
    category: "kinetic",
    ammo_type: "ap",
    ammo_size: "200mm",
    cost: 100,
    weight: 0.5,
    velocity: 1500,
    impact_damage: 50,
    blast_damage: 0,
    blast_radius: 0,
    armor_penetration: 80,
  },
  {
    id: "ammo-2",
    name: "200mm HE",
    description: "High-explosive round",
    category: "kinetic",
    ammo_type: "he",
    ammo_size: "200mm",
    cost: 150,
    weight: 0.6,
    velocity: 1200,
    impact_damage: 30,
    blast_damage: 70,
    blast_radius: 5,
    armor_penetration: 20,
  },
  {
    id: "ammo-3",
    name: "100mm AP",
    description: "Small caliber armor-piercing",
    category: "kinetic",
    ammo_type: "ap",
    ammo_size: "100mm",
    cost: 50,
    weight: 0.2,
    velocity: 2000,
    impact_damage: 20,
    blast_damage: 0,
    blast_radius: 0,
    armor_penetration: 60,
  },
  {
    id: "ammo-4",
    name: "Harpoon Missile",
    description: "Anti-ship missile",
    category: "missiles",
    cost: 500,
    weight: 2.0,
    velocity: 800,
    impact_damage: 100,
    blast_damage: 150,
    blast_radius: 10,
    armor_penetration: 50,
  },
  {
    id: "ammo-5",
    name: "Mk48 Torpedo",
    description: "Heavy torpedo",
    category: "torpedos",
    cost: 1000,
    weight: 5.0,
    velocity: 50,
    impact_damage: 200,
    blast_damage: 300,
    blast_radius: 20,
    armor_penetration: 100,
  },
];

describe("ammoCompatibility", () => {
  describe("extractWeaponCompatibility", () => {
    it("extracts kinetic ammo types from installed modules", () => {
      const compatibility = extractWeaponCompatibility(mockModules, mockVariantsById);

      expect(compatibility.kineticAmmoTypes.has("ap:200mm")).toBe(true);
      expect(compatibility.kineticAmmoTypes.has("he:200mm")).toBe(true);
      expect(compatibility.kineticAmmoTypes.size).toBe(2);
    });

    it("tracks weapon names by ammo type", () => {
      const compatibility = extractWeaponCompatibility(mockModules, mockVariantsById);

      const apWeapons = compatibility.weaponsByAmmoType.get("ap:200mm");
      expect(apWeapons).toContain("200mm Railgun Mk1");

      const heWeapons = compatibility.weaponsByAmmoType.get("he:200mm");
      expect(heWeapons).toContain("200mm Railgun Mk2");
    });

    it("detects missile launchers by slot ID", () => {
      const compatibility = extractWeaponCompatibility(mockModules, mockVariantsById);

      expect(compatibility.hasMissileLaunchers).toBe(true);
    });

    it("detects torpedo tubes by slot ID", () => {
      const compatibility = extractWeaponCompatibility(mockModules, mockVariantsById);

      expect(compatibility.hasTorpedoTubes).toBe(true);
    });

    it("handles modules without variant", () => {
      const modules: ModuleInstance[] = [
        {
          id: "module-1",
          variant_id: "nonexistent",
          module_slot_id: "kinetic_weapon_1",
        },
      ];

      const compatibility = extractWeaponCompatibility(modules, mockVariantsById);

      expect(compatibility.kineticAmmoTypes.size).toBe(0);
      expect(compatibility.hasMissileLaunchers).toBe(false);
      expect(compatibility.hasTorpedoTubes).toBe(false);
    });

    it("handles empty modules array", () => {
      const compatibility = extractWeaponCompatibility([], mockVariantsById);

      expect(compatibility.kineticAmmoTypes.size).toBe(0);
      expect(compatibility.hasMissileLaunchers).toBe(false);
      expect(compatibility.hasTorpedoTubes).toBe(false);
      expect(compatibility.weaponsByAmmoType.size).toBe(0);
    });

    it("detects missile launcher by variant name", () => {
      const modules: ModuleInstance[] = [
        {
          id: "module-1",
          variant_id: "variant-missile-name",
          module_slot_id: "weapon_1",
        },
      ];
      const variants: Record<string, ModuleVariant> = {
        "variant-missile-name": {
          id: "variant-missile-name",
          module_id: "mod-1",
          name: "Heavy Missile Launcher",
          description: "Launches missiles",
          cost: 100,
          credit_cost: 10000,
          weight: 50,
          hp: 100,
          power_consumption: 100,
          heat_generation: 50,
        } as unknown as ModuleVariant,
      };

      const compatibility = extractWeaponCompatibility(modules, variants);

      expect(compatibility.hasMissileLaunchers).toBe(true);
    });

    it("detects torpedo by variant name", () => {
      const modules: ModuleInstance[] = [
        {
          id: "module-1",
          variant_id: "variant-torpedo-name",
          module_slot_id: "weapon_1",
        },
      ];
      const variants: Record<string, ModuleVariant> = {
        "variant-torpedo-name": {
          id: "variant-torpedo-name",
          module_id: "mod-1",
          name: "Torpedo Bay",
          description: "Launches torpedoes",
          cost: 100,
          credit_cost: 10000,
          weight: 50,
          hp: 100,
          power_consumption: 100,
          heat_generation: 50,
        } as unknown as ModuleVariant,
      };

      const compatibility = extractWeaponCompatibility(modules, variants);

      expect(compatibility.hasTorpedoTubes).toBe(true);
    });
  });

  describe("checkAmmoCompatibility", () => {
    let compatibility: WeaponCompatibility;

    beforeEach(() => {
      compatibility = extractWeaponCompatibility(mockModules, mockVariantsById);
    });

    it("returns compatible for matching kinetic ammo", () => {
      const result = checkAmmoCompatibility(mockAmmunition[0], compatibility); // 200mm AP

      expect(result.compatible).toBe(true);
      expect(result.weapons).toContain("200mm Railgun Mk1");
    });

    it("returns incompatible for non-matching kinetic ammo", () => {
      const result = checkAmmoCompatibility(mockAmmunition[2], compatibility); // 100mm AP

      expect(result.compatible).toBe(false);
      expect(result.reason).toBe("No 100mm ap weapons installed");
    });

    it("returns compatible for missiles when launcher installed", () => {
      const result = checkAmmoCompatibility(mockAmmunition[3], compatibility); // Missile

      expect(result.compatible).toBe(true);
    });

    it("returns incompatible for missiles when no launcher", () => {
      const noMissileCompatibility: WeaponCompatibility = {
        kineticAmmoTypes: new Set(),
        hasMissileLaunchers: false,
        hasTorpedoTubes: false,
        weaponsByAmmoType: new Map(),
      };

      const result = checkAmmoCompatibility(mockAmmunition[3], noMissileCompatibility);

      expect(result.compatible).toBe(false);
      expect(result.reason).toBe("No missile launchers installed");
    });

    it("returns compatible for torpedos when tube installed", () => {
      const result = checkAmmoCompatibility(mockAmmunition[4], compatibility); // Torpedo

      expect(result.compatible).toBe(true);
    });

    it("returns incompatible for torpedos when no tube", () => {
      const noTorpedoCompatibility: WeaponCompatibility = {
        kineticAmmoTypes: new Set(),
        hasMissileLaunchers: false,
        hasTorpedoTubes: false,
        weaponsByAmmoType: new Map(),
      };

      const result = checkAmmoCompatibility(mockAmmunition[4], noTorpedoCompatibility);

      expect(result.compatible).toBe(false);
      expect(result.reason).toBe("No torpedo tubes installed");
    });

    it("returns compatible for unknown category", () => {
      const unknownAmmo: Ammunition = {
        id: "unknown",
        name: "Unknown",
        description: "Unknown ammo",
        category: "special" as any,
        cost: 100,
        weight: 1,
        velocity: 100,
        impact_damage: 10,
        blast_damage: 0,
        blast_radius: 0,
        armor_penetration: 10,
      };

      const result = checkAmmoCompatibility(unknownAmmo, compatibility);

      expect(result.compatible).toBe(true);
    });
  });

  describe("getIncompatibilityReason", () => {
    let compatibility: WeaponCompatibility;

    beforeEach(() => {
      compatibility = extractWeaponCompatibility(mockModules, mockVariantsById);
    });

    it("returns undefined for compatible ammo", () => {
      const result = getIncompatibilityReason(mockAmmunition[0], compatibility);

      expect(result).toBeUndefined();
    });

    it("returns reason for incompatible ammo", () => {
      const result = getIncompatibilityReason(mockAmmunition[2], compatibility);

      expect(result).toBe("No 100mm ap weapons installed");
    });
  });

  describe("getCompatibleWeapons", () => {
    let compatibility: WeaponCompatibility;

    beforeEach(() => {
      compatibility = extractWeaponCompatibility(mockModules, mockVariantsById);
    });

    it("returns weapon names for kinetic ammo", () => {
      const result = getCompatibleWeapons(mockAmmunition[0], compatibility);

      expect(result).toContain("200mm Railgun Mk1");
    });

    it("returns empty array for incompatible kinetic ammo", () => {
      const result = getCompatibleWeapons(mockAmmunition[2], compatibility);

      expect(result).toEqual([]);
    });

    it("returns empty array for missiles", () => {
      const result = getCompatibleWeapons(mockAmmunition[3], compatibility);

      expect(result).toEqual([]);
    });

    it("returns empty array for torpedos", () => {
      const result = getCompatibleWeapons(mockAmmunition[4], compatibility);

      expect(result).toEqual([]);
    });
  });

  describe("filterCompatibleAmmo", () => {
    let compatibility: WeaponCompatibility;

    beforeEach(() => {
      compatibility = extractWeaponCompatibility(mockModules, mockVariantsById);
    });

    it("filters to only compatible ammunition", () => {
      const result = filterCompatibleAmmo(mockAmmunition, compatibility);

      // Should include: 200mm AP, 200mm HE, Harpoon Missile, Mk48 Torpedo
      // Should exclude: 100mm AP
      expect(result).toHaveLength(4);
      expect(result.find((a) => a.id === "ammo-1")).toBeDefined(); // 200mm AP
      expect(result.find((a) => a.id === "ammo-2")).toBeDefined(); // 200mm HE
      expect(result.find((a) => a.id === "ammo-3")).toBeUndefined(); // 100mm AP
      expect(result.find((a) => a.id === "ammo-4")).toBeDefined(); // Missile
      expect(result.find((a) => a.id === "ammo-5")).toBeDefined(); // Torpedo
    });

    it("returns empty array when nothing compatible", () => {
      const noWeaponsCompatibility: WeaponCompatibility = {
        kineticAmmoTypes: new Set(),
        hasMissileLaunchers: false,
        hasTorpedoTubes: false,
        weaponsByAmmoType: new Map(),
      };

      const result = filterCompatibleAmmo(mockAmmunition, noWeaponsCompatibility);

      expect(result).toHaveLength(0);
    });

    it("returns all ammo when everything compatible", () => {
      // weaponsByAmmoType must have entries for kinetic ammo to be compatible
      const weaponsByAmmoType = new Map<string, string[]>();
      weaponsByAmmoType.set("ap:200mm", ["200mm Railgun"]);
      weaponsByAmmoType.set("he:200mm", ["200mm Railgun"]);
      weaponsByAmmoType.set("ap:100mm", ["100mm Cannon"]);

      const fullCompatibility: WeaponCompatibility = {
        kineticAmmoTypes: new Set(["ap:200mm", "he:200mm", "ap:100mm"]),
        hasMissileLaunchers: true,
        hasTorpedoTubes: true,
        weaponsByAmmoType,
      };

      const result = filterCompatibleAmmo(mockAmmunition, fullCompatibility);

      expect(result).toHaveLength(5);
    });
  });
});
