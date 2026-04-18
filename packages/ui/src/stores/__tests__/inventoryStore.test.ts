import { describe, it, expect, beforeEach } from "vitest";
import { useInventoryStore } from "../inventoryStore";
import type { Ammunition } from "@frigate/api-client";

// Mock ammunition data
const mockAmmoCatalog: Ammunition[] = [
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
    id: "ammo-4",
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

// Helper to get fresh state
const getState = () => useInventoryStore.getState();

describe("inventoryStore", () => {
  beforeEach(() => {
    // Reset store state before each test using setState
    useInventoryStore.setState({
      ammunition: new Map(),
      ammoCatalog: [],
      availableWeight: 0,
      availableCredits: 0,
      compatibleAmmoTypes: new Set(),
      compatibleMissiles: false,
      compatibleTorpedos: false,
    });
  });

  describe("catalog management", () => {
    it("sets ammunition catalog", () => {
      getState().setAmmoCatalog(mockAmmoCatalog);

      expect(getState().ammoCatalog).toHaveLength(4);
      expect(getState().ammoCatalog[0].name).toBe("200mm AP");
    });

    it("gets ammo by ID", () => {
      getState().setAmmoCatalog(mockAmmoCatalog);

      const ammo = getState().getAmmoById("ammo-1");
      expect(ammo).toBeDefined();
      expect(ammo?.name).toBe("200mm AP");
    });

    it("returns undefined for unknown ammo ID", () => {
      getState().setAmmoCatalog(mockAmmoCatalog);

      const ammo = getState().getAmmoById("unknown");
      expect(ammo).toBeUndefined();
    });
  });

  describe("constraint management", () => {
    it("sets weight and credit constraints", () => {
      getState().setConstraints(100, 5000);

      expect(getState().availableWeight).toBe(100);
      expect(getState().availableCredits).toBe(5000);
    });

    it("sets compatibility info", () => {
      const ammoTypes = new Set(["ap:200mm", "he:200mm"]);
      getState().setCompatibility(ammoTypes, true, false);

      expect(getState().compatibleAmmoTypes.has("ap:200mm")).toBe(true);
      expect(getState().compatibleAmmoTypes.has("he:200mm")).toBe(true);
      expect(getState().compatibleMissiles).toBe(true);
      expect(getState().compatibleTorpedos).toBe(false);
    });
  });

  describe("adding ammunition", () => {
    beforeEach(() => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(100, 5000);
    });

    it("adds ammunition to inventory", () => {
      getState().addAmmo("ammo-1", 10);

      expect(getState().getAmmoQuantity("ammo-1")).toBe(10);
    });

    it("increments existing ammunition", () => {
      getState().addAmmo("ammo-1", 10);
      getState().addAmmo("ammo-1", 5);

      expect(getState().getAmmoQuantity("ammo-1")).toBe(15);
    });

    it("adds default quantity of 1", () => {
      getState().addAmmo("ammo-1");

      expect(getState().getAmmoQuantity("ammo-1")).toBe(1);
    });

    it("does not add if weight constraint exceeded", () => {
      getState().setConstraints(5, 5000); // Only 5 tons available

      // ammo-4 (torpedo) weighs 5 tons each, can only add 1
      getState().addAmmo("ammo-4", 1);
      expect(getState().getAmmoQuantity("ammo-4")).toBe(1);

      // Trying to add another should fail
      getState().addAmmo("ammo-4", 1);
      expect(getState().getAmmoQuantity("ammo-4")).toBe(1);
    });

    it("does not add if credit constraint exceeded", () => {
      getState().setConstraints(100, 500); // Only 500 credits available

      // ammo-3 (missile) costs 500 each, can only add 1
      getState().addAmmo("ammo-3", 1);
      expect(getState().getAmmoQuantity("ammo-3")).toBe(1);

      // Trying to add another should fail
      getState().addAmmo("ammo-3", 1);
      expect(getState().getAmmoQuantity("ammo-3")).toBe(1);
    });

    it("does not add unknown ammo", () => {
      getState().addAmmo("unknown", 10);

      expect(getState().getAmmoQuantity("unknown")).toBe(0);
    });
  });

  describe("removing ammunition", () => {
    beforeEach(() => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(100, 5000);
      getState().addAmmo("ammo-1", 10);
    });

    it("removes ammunition from inventory", () => {
      getState().removeAmmo("ammo-1", 5);

      expect(getState().getAmmoQuantity("ammo-1")).toBe(5);
    });

    it("removes default quantity of 1", () => {
      getState().removeAmmo("ammo-1");

      expect(getState().getAmmoQuantity("ammo-1")).toBe(9);
    });

    it("removes item when quantity reaches 0", () => {
      getState().removeAmmo("ammo-1", 10);

      expect(getState().getAmmoQuantity("ammo-1")).toBe(0);
      expect(
        getState()
          .getInventoryItems()
          .find((i) => i.itemId === "ammo-1")
      ).toBeUndefined();
    });

    it("removes item when quantity goes negative", () => {
      getState().removeAmmo("ammo-1", 15); // More than available

      expect(getState().getAmmoQuantity("ammo-1")).toBe(0);
    });
  });

  describe("setting quantity", () => {
    beforeEach(() => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(100, 5000);
    });

    it("sets exact quantity", () => {
      getState().setAmmoQuantity("ammo-1", 25);

      expect(getState().getAmmoQuantity("ammo-1")).toBe(25);
    });

    it("removes item when set to 0", () => {
      getState().addAmmo("ammo-1", 10);
      getState().setAmmoQuantity("ammo-1", 0);

      expect(getState().getAmmoQuantity("ammo-1")).toBe(0);
      expect(
        getState()
          .getInventoryItems()
          .find((i) => i.itemId === "ammo-1")
      ).toBeUndefined();
    });

    it("removes item when set to negative", () => {
      getState().addAmmo("ammo-1", 10);
      getState().setAmmoQuantity("ammo-1", -5);

      expect(getState().getAmmoQuantity("ammo-1")).toBe(0);
    });
  });

  describe("clearing inventory", () => {
    it("clears all ammunition", () => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(100, 5000);
      getState().addAmmo("ammo-1", 10);
      getState().addAmmo("ammo-2", 5);
      getState().addAmmo("ammo-3", 2);

      getState().clearInventory();

      expect(getState().getInventoryItems()).toHaveLength(0);
      expect(getState().getTotalWeight()).toBe(0);
      expect(getState().getTotalCost()).toBe(0);
    });
  });

  describe("weight calculations", () => {
    beforeEach(() => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(100, 10000);
    });

    it("calculates total weight", () => {
      getState().addAmmo("ammo-1", 10); // 10 * 0.5 = 5
      getState().addAmmo("ammo-2", 5); // 5 * 0.6 = 3

      expect(getState().getTotalWeight()).toBe(8);
    });

    it("detects over weight", () => {
      getState().setConstraints(5, 10000);
      getState().setAmmoQuantity("ammo-1", 20); // 20 * 0.5 = 10 tons (exceeds 5)

      expect(getState().isOverWeight()).toBe(true);
    });

    it("returns false when under weight", () => {
      getState().addAmmo("ammo-1", 5); // 2.5 tons

      expect(getState().isOverWeight()).toBe(false);
    });
  });

  describe("cost calculations", () => {
    beforeEach(() => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(100, 10000);
    });

    it("calculates total cost", () => {
      getState().addAmmo("ammo-1", 10); // 10 * 100 = 1000
      getState().addAmmo("ammo-3", 2); // 2 * 500 = 1000

      expect(getState().getTotalCost()).toBe(2000);
    });

    it("detects over budget", () => {
      getState().setConstraints(100, 500);
      getState().setAmmoQuantity("ammo-1", 10); // 10 * 100 = 1000 (exceeds 500)

      expect(getState().isOverBudget()).toBe(true);
    });

    it("returns false when under budget", () => {
      getState().addAmmo("ammo-1", 3); // 300 credits

      expect(getState().isOverBudget()).toBe(false);
    });
  });

  describe("canAddAmmo", () => {
    beforeEach(() => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(10, 1000);
    });

    it("returns true when within constraints", () => {
      expect(getState().canAddAmmo("ammo-1", 5)).toBe(true);
    });

    it("returns false when weight exceeded", () => {
      // Use setAmmoQuantity to bypass constraint check during setup
      // (addAmmo would fail since 18 * 100 = 1800 credits > 1000 limit)
      getState().setAmmoQuantity("ammo-1", 18); // 18 * 0.5 = 9 tons used

      // Adding 5 more would be 11.5 tons (exceeds 10)
      expect(getState().canAddAmmo("ammo-1", 5)).toBe(false);
    });

    it("returns false when credits exceeded", () => {
      getState().addAmmo("ammo-1", 8); // 800 credits used

      // Adding 5 more would be 1300 credits (exceeds 1000)
      expect(getState().canAddAmmo("ammo-1", 5)).toBe(false);
    });

    it("returns false for unknown ammo", () => {
      expect(getState().canAddAmmo("unknown", 1)).toBe(false);
    });

    it("defaults to quantity 1", () => {
      getState().setConstraints(0.4, 50); // Can fit exactly 0 of ammo-1 (0.5 weight)

      expect(getState().canAddAmmo("ammo-1")).toBe(false);
    });
  });

  describe("compatibility checking", () => {
    beforeEach(() => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(100, 10000);
    });

    it("checks kinetic ammo compatibility", () => {
      getState().setCompatibility(new Set(["ap:200mm"]), false, false);

      expect(getState().isAmmoCompatible("ammo-1")).toBe(true); // 200mm AP
      expect(getState().isAmmoCompatible("ammo-2")).toBe(false); // 200mm HE (different type)
    });

    it("checks missile compatibility", () => {
      getState().setCompatibility(new Set(), true, false);

      expect(getState().isAmmoCompatible("ammo-3")).toBe(true); // Missile
      expect(getState().isAmmoCompatible("ammo-4")).toBe(false); // Torpedo
    });

    it("checks torpedo compatibility", () => {
      getState().setCompatibility(new Set(), false, true);

      expect(getState().isAmmoCompatible("ammo-3")).toBe(false); // Missile
      expect(getState().isAmmoCompatible("ammo-4")).toBe(true); // Torpedo
    });

    it("returns false for unknown ammo", () => {
      getState().setCompatibility(new Set(["ap:200mm"]), true, true);

      expect(getState().isAmmoCompatible("unknown")).toBe(false);
    });
  });

  describe("getInventoryItems", () => {
    it("returns inventory as array", () => {
      getState().setAmmoCatalog(mockAmmoCatalog);
      getState().setConstraints(100, 10000);
      getState().addAmmo("ammo-1", 10);
      getState().addAmmo("ammo-2", 5);

      const items = getState().getInventoryItems();

      expect(items).toHaveLength(2);
      expect(items.find((i) => i.itemId === "ammo-1")?.quantity).toBe(10);
      expect(items.find((i) => i.itemId === "ammo-2")?.quantity).toBe(5);
    });

    it("returns empty array when inventory is empty", () => {
      expect(getState().getInventoryItems()).toEqual([]);
    });
  });
});
