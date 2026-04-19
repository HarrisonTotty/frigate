import { describe, it, expect } from "vitest";
import {
  parseSchematicYaml,
  serializeSchematicYaml,
  type SchematicFile,
  type SchematicModule,
} from "../schematicYaml";

/**
 * Schematic YAML Parsing and Serialization Tests
 *
 * These tests verify the YAML parsing and serialization helpers exported from
 * `../schematicYaml`, which is the canonical source used by both the web and
 * desktop `useSchematicFile` hooks.
 */

describe("Schematic YAML Parsing", () => {
  describe("parseSchematicYaml", () => {
    it("parses a valid schematic with modules", () => {
      const yaml = `
version: 1
name: USS Enterprise
ship_class: destroyer
modules:
  - slot: kinetic-weapon
    module: autocannon-mk2
  - slot: power-core
    module: fusion-reactor
`;

      const schematic = parseSchematicYaml(yaml);

      expect(schematic.version).toBe(1);
      expect(schematic.name).toBe("USS Enterprise");
      expect(schematic.ship_class).toBe("destroyer");
      expect(schematic.modules).toHaveLength(2);
      expect(schematic.modules[0]).toEqual({
        slot: "kinetic-weapon",
        module: "autocannon-mk2",
      });
      expect(schematic.modules[1]).toEqual({
        slot: "power-core",
        module: "fusion-reactor",
      });
    });

    it("handles null module values", () => {
      const yaml = `
version: 1
name: Test Ship
ship_class: frigate
modules:
  - slot: shield
    module: null
  - slot: engine
    module:
`;

      const schematic = parseSchematicYaml(yaml);

      expect(schematic.modules).toHaveLength(2);
      expect(schematic.modules[0].module).toBeNull();
      expect(schematic.modules[1].module).toBeNull();
    });

    it("handles empty modules list", () => {
      const yaml = `
version: 1
name: Empty Ship
ship_class: shuttle
modules:
`;

      const schematic = parseSchematicYaml(yaml);

      expect(schematic.version).toBe(1);
      expect(schematic.name).toBe("Empty Ship");
      expect(schematic.ship_class).toBe("shuttle");
      expect(schematic.modules).toHaveLength(0);
    });

    it("handles names with colons", () => {
      const yaml = `
version: 1
name: Ship: The Destroyer
ship_class: cruiser
modules:
`;

      const schematic = parseSchematicYaml(yaml);

      expect(schematic.name).toBe("Ship: The Destroyer");
    });

    it("handles names with special characters", () => {
      const yaml = `
version: 1
name: Ship's "Ultimate" Test!
ship_class: cruiser
modules:
`;

      const schematic = parseSchematicYaml(yaml);

      expect(schematic.name).toBe('Ship\'s "Ultimate" Test!');
    });

    it("ignores comments", () => {
      const yaml = `
# This is a comment
version: 1
# Another comment
name: Test Ship
ship_class: frigate
modules:
  # Module comment
  - slot: engine
    module: ion-drive
`;

      const schematic = parseSchematicYaml(yaml);

      expect(schematic.version).toBe(1);
      expect(schematic.name).toBe("Test Ship");
      expect(schematic.modules).toHaveLength(1);
    });

    it("ignores empty lines", () => {
      const yaml = `
version: 1

name: Test Ship

ship_class: frigate

modules:

  - slot: engine
    module: ion-drive

`;

      const schematic = parseSchematicYaml(yaml);

      expect(schematic.version).toBe(1);
      expect(schematic.modules).toHaveLength(1);
    });

    it("throws error for missing version", () => {
      const yaml = `
name: Test Ship
ship_class: frigate
modules:
`;

      expect(() => parseSchematicYaml(yaml)).toThrow("Missing version field");
    });

    it("throws error for missing name", () => {
      const yaml = `
version: 1
ship_class: frigate
modules:
`;

      expect(() => parseSchematicYaml(yaml)).toThrow("Missing name field");
    });

    it("throws error for missing ship_class", () => {
      const yaml = `
version: 1
name: Test Ship
modules:
`;

      expect(() => parseSchematicYaml(yaml)).toThrow("Missing ship_class field");
    });

    it("handles module values with colons", () => {
      const yaml = `
version: 1
name: Test Ship
ship_class: frigate
modules:
  - slot: weapon
    module: laser:mk2:variant
`;

      const schematic = parseSchematicYaml(yaml);

      expect(schematic.modules[0].module).toBe("laser:mk2:variant");
    });
  });

  describe("serializeSchematicYaml", () => {
    it("serializes a schematic with modules", () => {
      const schematic: SchematicFile = {
        version: 1,
        name: "USS Enterprise",
        ship_class: "destroyer",
        modules: [
          { slot: "kinetic-weapon", module: "autocannon-mk2" },
          { slot: "power-core", module: "fusion-reactor" },
        ],
      };

      const yaml = serializeSchematicYaml(schematic);

      expect(yaml).toContain("version: 1");
      expect(yaml).toContain("name: USS Enterprise");
      expect(yaml).toContain("ship_class: destroyer");
      expect(yaml).toContain("- slot: kinetic-weapon");
      expect(yaml).toContain("module: autocannon-mk2");
      expect(yaml).toContain("- slot: power-core");
      expect(yaml).toContain("module: fusion-reactor");
    });

    it('serializes null modules as "null"', () => {
      const schematic: SchematicFile = {
        version: 1,
        name: "Test Ship",
        ship_class: "frigate",
        modules: [{ slot: "shield", module: null }],
      };

      const yaml = serializeSchematicYaml(schematic);

      expect(yaml).toContain("module: null");
    });

    it("serializes empty modules list", () => {
      const schematic: SchematicFile = {
        version: 1,
        name: "Empty Ship",
        ship_class: "shuttle",
        modules: [],
      };

      const yaml = serializeSchematicYaml(schematic);

      expect(yaml).toContain("version: 1");
      expect(yaml).toContain("name: Empty Ship");
      expect(yaml).toContain("modules:");
      expect(yaml).not.toContain("- slot:");
    });

    it("preserves special characters in name", () => {
      const schematic: SchematicFile = {
        version: 1,
        name: 'Ship: The "Ultimate" Test!',
        ship_class: "cruiser",
        modules: [],
      };

      const yaml = serializeSchematicYaml(schematic);

      expect(yaml).toContain('name: Ship: The "Ultimate" Test!');
    });
  });

  describe("Round-trip serialization", () => {
    it("round-trips a basic schematic", () => {
      const original: SchematicFile = {
        version: 1,
        name: "Test Ship",
        ship_class: "frigate",
        modules: [
          { slot: "engine", module: "ion-drive" },
          { slot: "shield", module: null },
        ],
      };

      const yaml = serializeSchematicYaml(original);
      const parsed = parseSchematicYaml(yaml);

      expect(parsed.version).toBe(original.version);
      expect(parsed.name).toBe(original.name);
      expect(parsed.ship_class).toBe(original.ship_class);
      expect(parsed.modules).toEqual(original.modules);
    });

    it("round-trips a schematic with many modules", () => {
      const modules: SchematicModule[] = [];
      for (let i = 0; i < 50; i++) {
        modules.push({
          slot: `slot-${i}`,
          module: i % 2 === 0 ? `module-${i}` : null,
        });
      }

      const original: SchematicFile = {
        version: 1,
        name: "Large Ship",
        ship_class: "dreadnought",
        modules,
      };

      const yaml = serializeSchematicYaml(original);
      const parsed = parseSchematicYaml(yaml);

      expect(parsed.modules).toHaveLength(50);
      expect(parsed.modules[0].module).toBe("module-0");
      expect(parsed.modules[1].module).toBeNull();
      expect(parsed.modules[48].module).toBe("module-48");
      expect(parsed.modules[49].module).toBeNull();
    });

    it("round-trips a schematic with special characters", () => {
      const original: SchematicFile = {
        version: 1,
        name: "Captain's Pride: Mark II",
        ship_class: "cruiser",
        modules: [{ slot: "weapon:primary", module: "laser:heavy:mk2" }],
      };

      const yaml = serializeSchematicYaml(original);
      const parsed = parseSchematicYaml(yaml);

      expect(parsed.name).toBe(original.name);
      expect(parsed.modules[0].slot).toBe(original.modules[0].slot);
      expect(parsed.modules[0].module).toBe(original.modules[0].module);
    });

    it("round-trips an empty modules list", () => {
      const original: SchematicFile = {
        version: 1,
        name: "Empty",
        ship_class: "shuttle",
        modules: [],
      };

      const yaml = serializeSchematicYaml(original);
      const parsed = parseSchematicYaml(yaml);

      expect(parsed.modules).toHaveLength(0);
    });
  });
});
