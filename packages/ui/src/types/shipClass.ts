/**
 * Ship class type definitions
 * 
 * Matches the HYPERION API ship class schema from Phase 2.6
 */

/**
 * Ship size categories
 */
export type ShipSize = 'Small' | 'Medium' | 'Large';

/**
 * Ship role categories
 */
export type ShipRole = 
  | 'Versatile'
  | 'Combat'
  | 'Support'
  | 'Transport'
  | 'Exploration'
  | 'Offense'
  | 'Defense';

/**
 * Bonus category for grouping related bonuses
 */
export type BonusCategory = 'combat' | 'defense' | 'mobility' | 'utility' | 'efficiency';

/**
 * Formatted bonus information from the API
 */
export interface ShipClassBonus {
  /** Bonus identifier (e.g., "module_hp", "weapon_damage") */
  id: string;
  /** Human-readable bonus name */
  name: string;
  /** Description of what the bonus does */
  description: string;
  /** Raw numeric value */
  value: number;
  /** Formatted value string (e.g., "+25%", "+10") */
  formatted_value: string;
  /** What modules/systems this bonus applies to */
  applies_to: string[];
}

/**
 * Category metadata for bonus grouping
 */
export interface BonusCategoryMetadata {
  id: BonusCategory;
  name: string;
  description: string;
  color: string;
  icon: string;
}

/**
 * Faction-specific manufacturer information
 */
export interface ManufacturerInfo {
  /** Manufacturer name (e.g., "United Shipyards") */
  manufacturer: string;
  /** Faction-specific variant name (e.g., "Constitution-class") */
  variant: string | null;
  /** Faction-specific lore or design philosophy */
  lore: string | null;
}

/**
 * Technical specifications for a ship class
 */
export interface TechnicalSpecs {
  /** Length in meters */
  Length?: string;
  /** Width in meters */
  Width?: string;
  /** Height in meters */
  Height?: string;
  /** Mass in metric tons */
  Mass?: string;
  /** Crew range (e.g., "25-40") */
  Crew?: string;
  /** Cargo capacity in cubic meters */
  Cargo?: string;
  /** Maximum acceleration */
  'Max Acceleration'?: string;
  /** Turn rate */
  'Turn Rate'?: string;
  /** Maximum warp speed */
  'Max Warp'?: string;
  /** Sensor range */
  'Sensor Range'?: string;
  /** Operational range */
  Range?: string;
  /** Additional dynamic specs */
  [key: string]: string | undefined;
}

/**
 * Summary of a ship class (from list endpoint)
 */
export interface ShipClassSummary {
  /** Unique ship class identifier */
  id: string;
  /** Display name */
  name: string;
  /** Overview description */
  description: string;
  /** Ship size category */
  size: ShipSize;
  /** Ship role category */
  role: ShipRole;
  /** Maximum weight in kg */
  max_weight: number;
  /** Maximum number of modules */
  max_modules: number;
  /** Build points required */
  build_points: number;
  /** Credit cost to construct this ship class */
  cost?: number;
}

/**
 * Full ship class details (from detail endpoint)
 */
export interface ShipClassDetails {
  /** Unique ship class identifier */
  id: string;
  /** Display name */
  name: string;
  /** Detailed description */
  description: string;
  /** Ship size category */
  size: ShipSize;
  /** Ship role category */
  role: ShipRole;
  
  // Build constraints
  /** Maximum weight in kg the ship can support */
  max_weight: number;
  /** Maximum number of modules that can be equipped */
  max_modules: number;
  /** Base hull integrity points */
  base_hull: number;
  /** Base shield capacity */
  base_shields: number;
  /** Build points required to construct this ship class */
  build_points: number;
  /** Credit cost to construct this ship class */
  cost?: number;
  /** Maximum power capacity in kilowatts (optional - may not be set for all ship classes) */
  max_power?: number;
  /** Maximum heat dissipation capacity in kilowatts thermal (optional - may not be set for all ship classes) */
  max_heat?: number;
  
  // Bonuses grouped by category
  /** Bonuses provided by this ship class, grouped by category */
  bonuses: Record<BonusCategory, ShipClassBonus[]>;
  
  // Technical specifications
  /** Technical specs with formatted values and units */
  technical_specs: TechnicalSpecs;
  
  // Faction-specific manufacturers
  /** Manufacturer information by faction ID */
  manufacturers: Record<string, ManufacturerInfo>;
  
  // Lore and flavor
  /** Historical background and design notes */
  lore: string | null;
  /** Year of introduction (in-universe) */
  year_introduced: number | null;
  /** Famous ships of this class */
  notable_ships: string[];
}

/**
 * Faction-specific ship class variant
 * Combines base ship class with faction-specific manufacturer data
 */
export interface ShipClassVariant extends ShipClassDetails {
  /** Selected faction ID */
  factionId: string;
  /** Faction-specific manufacturer info */
  manufacturer: ManufacturerInfo;
  /** Variant designation (e.g., "Constitution-class Frigate") */
  variantName: string;
}

/**
 * Operational metadata for ship class display
 */
export interface OperationalMetadata {
  /** Ship class designation with variant (e.g., "Constitution-class Frigate") */
  designation: string;
  /** Build cost in credits or resources */
  cost: number;
  /** Availability tier (common/uncommon/rare) */
  availability: 'common' | 'uncommon' | 'rare';
  /** Construction time in days */
  buildTime?: number;
  /** Maintenance cost per day */
  maintenanceCost?: number;
}

/**
 * Helper type for ship class filtering
 */
export interface ShipClassFilter {
  /** Filter by ship size */
  size?: ShipSize;
  /** Filter by ship role */
  role?: ShipRole;
  /** Filter by faction ID */
  faction?: string;
  /** Filter by minimum build points */
  minBuildPoints?: number;
  /** Filter by maximum build points */
  maxBuildPoints?: number;
}

/**
 * Helper type for ship class sorting
 */
export type ShipClassSortBy = 
  | 'name'
  | 'size'
  | 'role'
  | 'buildPoints'
  | 'maxWeight'
  | 'maxModules';

export type SortOrder = 'asc' | 'desc';

/**
 * Ship class comparison data for side-by-side view
 */
export interface ShipClassComparison {
  /** Ship classes being compared */
  classes: ShipClassDetails[];
  /** Differences highlighted by category */
  differences: {
    specs: Record<string, any>;
    bonuses: Record<BonusCategory, ShipClassBonus[]>;
  };
}
