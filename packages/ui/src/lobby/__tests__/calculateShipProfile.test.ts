import { describe, it, expect } from 'vitest';
import {
  calculateShipProfile,
  DEFAULT_PROFILE_CONFIG,
  type ModuleSlotDef,
  type ModuleVariantData,
  type ModuleInstanceData,
} from '../calculateShipProfile';

describe('calculateShipProfile', () => {
  const mockSlotsById: Record<string, ModuleSlotDef> = {
    'shield-generator': { id: 'shield-generator', groups: ['Defense'] },
    'impulse-engine': { id: 'impulse-engine', groups: ['Propulsion'] },
    'maneuvering-thruster': { id: 'maneuvering-thruster', groups: ['Propulsion'] },
    'kinetic-weapon': { id: 'kinetic-weapon', groups: ['Offense'] },
    'missile-launcher': { id: 'missile-launcher', groups: ['Offense'] },
    'sensor-array': { id: 'sensor-array', groups: ['Support'] },
    'cooling-system': { id: 'cooling-system', groups: ['Support'] },
    'power-core': { id: 'power-core', groups: ['Support'] },
    'stealth-system': { id: 'stealth-system', groups: ['Support'] },
    'warp-jump-core': { id: 'warp-jump-core', groups: ['Support'] },
  };

  const mockVariantsById: Record<string, ModuleVariantData> = {
    'heavy-shield': { max_shield_strength: 4000 },
    'light-shield': { max_shield_strength: 800 },
    'plasma-engine': { max_thrust: 1800 },
    'ion-engine': { max_thrust: 400 },
    'plasma-thruster': { angular_thrust: 1600 },
    'ion-thruster': { angular_thrust: 400 },
    'long-range-sensors': { scan_range: 30000 },
    'short-range-sensors': { scan_range: 5000 },
    'cryogenic-cooling': { generated_cooling: 600 },
    'basic-radiator': { generated_cooling: 200 },
    'boson-reactor': { energy_production: 500 },
    'fission-reactor': { energy_production: 150 },
    'active-cloak': { detectability_reduction: 0.90 },
    'passive-stealth': { detectability_reduction: 0.25 },
    'warp-drive': { warp_type: 'warp' },
    'jump-drive': { warp_type: 'jump' },
  };

  describe('empty state', () => {
    it('returns undefined when no instances', () => {
      const result = calculateShipProfile([], mockSlotsById, mockVariantsById, 100);
      expect(result).toBeUndefined();
    });
  });

  describe('defense calculation', () => {
    it('calculates defense score from shields', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator', variant_id: 'heavy-shield' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Defense = (100 / 300) * 0.4 + (4000 / 4000) * 0.6 = 0.133 + 0.6 = 0.733
      expect(result?.defense).toBeCloseTo(0.733, 2);
    });

    it('calculates defense score with low shields', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator', variant_id: 'light-shield' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Defense = (100 / 300) * 0.4 + (800 / 4000) * 0.6 = 0.133 + 0.12 = 0.253
      expect(result?.defense).toBeCloseTo(0.253, 2);
    });

    it('factors in HP for defense', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator', variant_id: 'light-shield' },
      ];
      // High HP = 300 (max is 100 + 200 = 300)
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 300);

      // Defense = (300 / 300) * 0.4 + (800 / 4000) * 0.6 = 0.4 + 0.12 = 0.52
      expect(result?.defense).toBeCloseTo(0.52, 2);
    });
  });

  describe('mobility calculation', () => {
    it('calculates mobility from thrust', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'impulse-engine', variant_id: 'plasma-engine' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Mobility = (1800 / 1800) * 0.6 + (0 / 1600) * 0.4 = 0.6
      expect(result?.mobility).toBeCloseTo(0.6, 2);
    });

    it('calculates mobility from angular thrust', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'maneuvering-thruster', variant_id: 'plasma-thruster' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Mobility = (0 / 1800) * 0.6 + (1600 / 1600) * 0.4 = 0.4
      expect(result?.mobility).toBeCloseTo(0.4, 2);
    });

    it('calculates combined mobility', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'impulse-engine', variant_id: 'plasma-engine' },
        { module_slot_id: 'maneuvering-thruster', variant_id: 'plasma-thruster' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Mobility = (1800 / 1800) * 0.6 + (1600 / 1600) * 0.4 = 1.0
      expect(result?.mobility).toBeCloseTo(1.0, 2);
    });
  });

  describe('offense calculation', () => {
    it('calculates offense from weapon count', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'kinetic-weapon' },
        { module_slot_id: 'kinetic-weapon' },
        { module_slot_id: 'missile-launcher' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Offense = 3 / 10 = 0.3
      expect(result?.offense).toBeCloseTo(0.3, 2);
    });

    it('caps offense at 1.0', () => {
      const instances: ModuleInstanceData[] = Array(15).fill(null).map(() => ({
        module_slot_id: 'kinetic-weapon',
      }));
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      expect(result?.offense).toBe(1.0);
    });

    it('returns 0 offense when no weapons', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator', variant_id: 'light-shield' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      expect(result?.offense).toBe(0);
    });
  });

  describe('versatility calculation', () => {
    it('calculates versatility from unique slot types', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator' },
        { module_slot_id: 'impulse-engine' },
        { module_slot_id: 'kinetic-weapon' },
      ];
      const config = { ...DEFAULT_PROFILE_CONFIG, totalSlotTypes: 10 };
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100, config);

      // Versatility = 3 / 10 = 0.3
      expect(result?.versatility).toBeCloseTo(0.3, 2);
    });

    it('does not double-count same slot type', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'kinetic-weapon' },
        { module_slot_id: 'kinetic-weapon' },
        { module_slot_id: 'kinetic-weapon' },
      ];
      const config = { ...DEFAULT_PROFILE_CONFIG, totalSlotTypes: 10 };
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100, config);

      // Versatility = 1 / 10 = 0.1
      expect(result?.versatility).toBeCloseTo(0.1, 2);
    });
  });

  describe('utility calculation', () => {
    it('calculates utility from sensors', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'sensor-array', variant_id: 'long-range-sensors' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Utility = (30000/30000) * 0.25 = 0.25
      expect(result?.utility).toBeCloseTo(0.25, 2);
    });

    it('calculates utility from cooling', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'cooling-system', variant_id: 'cryogenic-cooling' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Utility = (600/600) * 0.20 = 0.20
      expect(result?.utility).toBeCloseTo(0.20, 2);
    });

    it('calculates utility from power production', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'power-core', variant_id: 'boson-reactor' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Utility = (500/500) * 0.25 = 0.25
      expect(result?.utility).toBeCloseTo(0.25, 2);
    });

    it('calculates utility from stealth', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'stealth-system', variant_id: 'active-cloak' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Utility = (0.90/0.90) * 0.15 = 0.15
      expect(result?.utility).toBeCloseTo(0.15, 2);
    });

    it('adds warp bonus', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'warp-jump-core', variant_id: 'warp-drive' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Utility = 1 * 0.15 = 0.15 (warp bonus)
      expect(result?.utility).toBeCloseTo(0.15, 2);
    });

    it('calculates combined utility', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'sensor-array', variant_id: 'long-range-sensors' },
        { module_slot_id: 'cooling-system', variant_id: 'cryogenic-cooling' },
        { module_slot_id: 'power-core', variant_id: 'boson-reactor' },
        { module_slot_id: 'stealth-system', variant_id: 'active-cloak' },
        { module_slot_id: 'warp-jump-core', variant_id: 'warp-drive' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Utility = 0.25 + 0.20 + 0.25 + 0.15 + 0.15 = 1.0
      expect(result?.utility).toBeCloseTo(1.0, 2);
    });
  });

  describe('edge cases', () => {
    it('handles missing slot definitions', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'unknown-slot' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Should still return a profile (with zeros) since instances.length > 0
      expect(result).toBeDefined();
      expect(result?.versatility).toBe(0);
    });

    it('handles missing variant definitions', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator', variant_id: 'unknown-variant' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Should work but with no shield contribution
      expect(result).toBeDefined();
      expect(result?.defense).toBeCloseTo(0.133, 2); // Just HP contribution
    });

    it('handles instances without variant_id', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator' }, // No variant selected
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      expect(result).toBeDefined();
      expect(result?.versatility).toBeCloseTo(1 / 18, 2);
    });

    it('uses best stealth value (max, not sum)', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'stealth-system', variant_id: 'passive-stealth' },
        { module_slot_id: 'stealth-system', variant_id: 'active-cloak' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 100);

      // Should use max (0.90), not sum (1.15)
      // Utility stealth component = (0.90 / 0.90) * 0.15 = 0.15
      expect(result?.utility).toBeCloseTo(0.15, 2);
    });

    it('caps all scores at 1.0', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator', variant_id: 'heavy-shield' },
        { module_slot_id: 'shield-generator', variant_id: 'heavy-shield' },
        { module_slot_id: 'shield-generator', variant_id: 'heavy-shield' },
      ];
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 500);

      // Even with excessive shields, defense should cap at 1.0
      expect(result?.defense).toBeLessThanOrEqual(1.0);
    });
  });

  describe('full ship profile', () => {
    it('calculates complete profile for a balanced ship', () => {
      const instances: ModuleInstanceData[] = [
        { module_slot_id: 'shield-generator', variant_id: 'light-shield' },
        { module_slot_id: 'impulse-engine', variant_id: 'ion-engine' },
        { module_slot_id: 'maneuvering-thruster', variant_id: 'ion-thruster' },
        { module_slot_id: 'kinetic-weapon' },
        { module_slot_id: 'kinetic-weapon' },
        { module_slot_id: 'sensor-array', variant_id: 'short-range-sensors' },
        { module_slot_id: 'cooling-system', variant_id: 'basic-radiator' },
        { module_slot_id: 'power-core', variant_id: 'fission-reactor' },
      ];
      const config = { ...DEFAULT_PROFILE_CONFIG, totalSlotTypes: 10 };
      const result = calculateShipProfile(instances, mockSlotsById, mockVariantsById, 150, config);

      expect(result).toBeDefined();
      expect(result?.defense).toBeGreaterThan(0);
      expect(result?.mobility).toBeGreaterThan(0);
      expect(result?.offense).toBeGreaterThan(0);
      expect(result?.versatility).toBeGreaterThan(0);
      expect(result?.utility).toBeGreaterThan(0);

      // All should be between 0 and 1
      expect(result?.defense).toBeLessThanOrEqual(1);
      expect(result?.mobility).toBeLessThanOrEqual(1);
      expect(result?.offense).toBeLessThanOrEqual(1);
      expect(result?.versatility).toBeLessThanOrEqual(1);
      expect(result?.utility).toBeLessThanOrEqual(1);
    });
  });
});
