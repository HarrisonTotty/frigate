export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Quaternion {
  readonly w: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly teamId: string | null;
}

export interface Team {
  readonly id: string;
  readonly name: string;
  readonly faction: string;
  readonly members: readonly string[];
  /** Team's current credit balance */
  readonly credits: number;
}

export interface BlueprintModule {
  readonly moduleId: string;
  readonly position: Vector3;
  readonly kind?: string | null;
}

export interface Blueprint {
  readonly id: string;
  readonly name: string;
  readonly shipClass: string;
  readonly faction: string;
  readonly teamId: string;
  readonly roles: Record<string, string>;
  readonly modules: readonly BlueprintModule[];
  readonly readyPlayerIds: readonly string[];
}

export interface ShipModuleInstance {
  readonly id: string;
  readonly moduleId: string;
  readonly health: number;
  readonly status: "operational" | "damaged" | "offline";
  readonly powerAllocation?: number;
  readonly coolingAllocation?: number;
  readonly tags?: readonly string[];
}

export interface Ship {
  readonly id: string;
  readonly name: string;
  readonly classId: string;
  readonly faction: string;
  readonly teamId: string;
  readonly position: Vector3;
  readonly velocity: Vector3;
  readonly rotation: Quaternion;
  readonly hull: number;
  readonly maxHull: number;
  readonly shields: number;
  readonly maxShields: number;
  readonly power: number;
  readonly maxPower: number;
  readonly modules: readonly ShipModuleInstance[];
}

export interface Station {
  readonly id: string;
  readonly name: string;
  readonly position: Vector3;
  readonly faction: string;
  readonly services: readonly string[];
  readonly size: "small" | "medium" | "large" | "massive";
}

export interface HelmStatus {
  readonly thrust: number;
  readonly rotationRate: Vector3;
  readonly warpActive: boolean;
  readonly dockingMode: boolean;
  readonly effectiveWeight: number;
}

export interface PowerAllocation {
  readonly weapons: number;
  readonly shields: number;
  readonly engines: number;
  readonly sensors?: number;
  readonly auxiliary?: number;
}

export interface CoolingAllocation {
  readonly reactor: number;
  readonly weapons: number;
  readonly engines: number;
  readonly shields?: number;
}

export interface EngineeringStatus {
  readonly hullIntegrity: number;
  readonly shieldStrength: number;
  readonly powerLevel: number;
  readonly heatLevel: number;
  readonly damagedModules: readonly string[];
  readonly statusEffects: readonly string[];
}

export interface ModuleStatus {
  readonly moduleId: string;
  readonly health: number;
  readonly efficiency: number;
  readonly powerAllocation: number;
  readonly coolingAllocation: number;
  readonly status: "operational" | "damaged" | "offline";
}

export interface EnergyWeaponStatus {
  readonly weapons: readonly {
    readonly id: string;
    readonly type: string;
    readonly power: number;
    readonly heat: number;
    readonly ready: boolean;
    readonly autoFire: boolean;
    readonly tags: readonly string[];
  }[];
  readonly currentTarget: string | null;
}

export interface KineticWeaponStatus {
  readonly weapons: readonly {
    readonly id: string;
    readonly kind: string;
    readonly ammoType: string | null;
    readonly ammoCount: number | null;
    readonly ready: boolean;
    readonly autoFire: boolean;
  }[];
  readonly currentTarget: string | null;
}

export interface MissileWeaponStatus {
  readonly weapons: readonly {
    readonly id: string;
    readonly ordnanceType: string | null;
    readonly loaded: boolean;
    readonly ammoCount: number | null;
    readonly ready: boolean;
    readonly lockQuality: number | null;
    readonly autoFire: boolean;
  }[];
  readonly currentTarget: string | null;
}

export interface ShieldStatus {
  readonly active: boolean;
  readonly strength: number;
  readonly maxStrength: number;
  readonly rechargeRate: number;
  readonly coverage: {
    readonly forward: number;
    readonly aft: number;
    readonly port: number;
    readonly starboard: number;
  };
}

export interface CountermeasureInventory {
  readonly type: "chaff" | "antimissile" | "antitorpedo";
  readonly loaded: number;
  readonly capacity: number;
}

export interface ScienceContact {
  readonly id: string;
  readonly type: "ship" | "station" | "anomaly" | "projectile";
  readonly distance: number;
  readonly bearing: {
    readonly azimuth: number;
    readonly elevation: number;
  };
  readonly velocity: Vector3;
}

export interface ThreatContact {
  readonly id: string;
  readonly type: "missile" | "torpedo" | "fighter";
  readonly distance: number;
  readonly etaSeconds: number;
  readonly status: "tracking" | "engaging" | "evading";
}

export interface NavigationSolution {
  readonly targetId: string;
  readonly distance: number;
  readonly heading: Vector3;
  readonly etaSeconds: number;
  readonly interceptCourse: {
    readonly pitch: number;
    readonly yaw: number;
  };
}

export interface ScanResult {
  readonly targetId: string;
  readonly classification: string;
  readonly hullIntegrity: number;
  readonly shieldStrength: number;
  readonly weaponSystems: readonly string[];
  readonly threatLevel: "low" | "moderate" | "high" | "critical";
}

export interface AnalyzeResult {
  readonly targetId: string;
  readonly analysisType: string;
  readonly details: Record<string, unknown>;
}

export interface DockingStatus {
  readonly stationId: string;
  readonly shipId: string;
  readonly status: "requested" | "approaching" | "docked" | "undocking" | "denied";
}

export interface FighterCommandResponse {
  readonly status: "accepted" | "rejected";
  readonly reason?: string;
}

export interface UniverseSummary {
  readonly generatedAt: string;
  readonly starCount: number;
  readonly factionCount: number;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly nextCursor?: string;
}

export interface CommunicationsMessage {
  readonly targetId: string;
  readonly message: string;
  readonly tone?: "friendly" | "neutral" | "hostile" | "distress";
}

export interface EventSubscriptionFilter {
  readonly shipId?: string;
  readonly teamId?: string;
}

export interface ShipPositionEvent {
  readonly shipId: string;
  readonly position: Vector3;
  readonly velocity: Vector3;
  readonly rotation: Quaternion;
}

export interface CombatEvent {
  readonly attackerId: string;
  readonly targetId: string;
  readonly weaponType: string;
  readonly hullDamage: number;
  readonly shieldDamage: number;
  readonly critical: boolean;
}

export interface ShipStatusEvent {
  readonly shipId: string;
  readonly hull: number;
  readonly shields: number;
  readonly power: number;
  readonly statusEffects: readonly string[];
}

export interface CommunicationEvent {
  readonly fromShip: string;
  readonly toShip: string;
  readonly message: string;
  readonly tone: string;
}

export interface DockingEvent {
  readonly shipId: string;
  readonly stationId: string;
  readonly status: "requested" | "approaching" | "docked" | "undocking" | "denied";
}

export interface GenericEvent<TType extends string = string, TData = Record<string, unknown>> {
  readonly type: TType;
  readonly data: TData;
}

export type HyperionEvent =
  | { readonly type: "ship_position"; readonly data: ShipPositionEvent }
  | { readonly type: "combat"; readonly data: CombatEvent }
  | { readonly type: "ship_status"; readonly data: ShipStatusEvent }
  | { readonly type: "communication"; readonly data: CommunicationEvent }
  | { readonly type: "docking"; readonly data: DockingEvent }
  | GenericEvent;

export type HyperionEventType = HyperionEvent["type"];

export type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

// ============================================================================
// Module System Types (Two-Tier Architecture)
// ============================================================================

/**
 * Module slot type definition from HYPERION API
 *
 * Represents a type of module slot that can be added to a ship blueprint.
 * Defined in HYPERION `data/module-slots/*.yaml` files.
 *
 * Examples: "power-core", "impulse-engine", "shield-generator"
 */
export interface ModuleSlot {
  /** Unique slot type ID */
  readonly id: string;

  /** Display name of the module slot */
  readonly name: string;

  /** Brief description of the module slot */
  readonly description: string;
  /** Deprecated alias for description (kept for backward compatibility) */
  readonly desc?: string;

  /** Extended description for lore/details */
  readonly extendedDescription?: string;
  /** Deprecated alias for extendedDescription */
  readonly extended_desc?: string;

  /** Module groups for UI filtering and ship bonuses */
  readonly groups: readonly string[];

  /** Whether at least one of this module type is required on a ship */
  readonly required: boolean;

  /** Whether this module slot has different variants */
  readonly hasVariants: boolean;
  /** Deprecated alias (existing server field) */
  readonly has_varients?: boolean;

  /** Base cost in build points to add this slot to a ship */
  readonly base_cost: number;

  /** Credit cost to add this slot to a ship */
  readonly credit_cost?: number;

  /** Maximum number of slots of this type allowed on a ship */
  readonly max_slots: number;

  /** Base hit points allocated to a module of this type */
  readonly base_hp: number;

  /** Base power consumption at 100% power, per second (MW) */
  readonly base_power_consumption: number;

  /** Base heat generation at 100% power, per second (K) */
  readonly base_heat_generation: number;

  /** Base weight of the module slot (kg) */
  readonly base_weight: number;
}

/**
 * Module variant definition from HYPERION API
 *
 * Represents a specific implementation of a module slot type.
 * Defined in HYPERION data/modules/ subdirectories (YAML files).
 *
 * Examples: "mk2-fusion-reactor" (variant of "power-core")
 */
export interface ModuleVariant {
  /** Unique variant ID */
  readonly id: string;

  /** Module slot type this variant fits into (references ModuleSlot.id) */
  readonly type: string;

  /** Display name - the "title" shown to users */
  readonly name: string;

  /** Model identifier for lore/details */
  readonly model: string;

  /** Manufacturer name for lore/details */
  readonly manufacturer: string;

  /** Brief description */
  readonly description: string;
  readonly desc?: string;

  /** Extended description/backstory for lore purposes */
  readonly lore?: string;

  /** Variant cost in build points (added to slot base_cost) */
  readonly cost: number;

  /** Credit cost of this variant (added to slot credit_cost) */
  readonly credit_cost?: number;

  /** Additional HP beyond slot base_hp */
  readonly additional_hp: number;

  /** Additional power consumption beyond slot base (MW) */
  readonly additional_power_consumption: number;

  /** Additional heat generation beyond slot base (K) */
  readonly additional_heat_generation: number;

  /** Additional weight beyond slot base (kg) */
  readonly additional_weight: number;

  /** Type-specific stats (e.g., energy_production for power cores, max_thrust for engines) */
  readonly stats: Record<string, unknown>;
}

/**
 * Aggregated ship statistics computed from installed modules
 */
export interface ShipAggregateStats {
  readonly cost: number;
  readonly weight: number;
  readonly hp: number;
  readonly power: number;
  readonly heat: number;
  readonly buildPointsUsed: number;
  readonly buildPointsMax: number;
  readonly warnings: readonly string[];
}

/**
 * Module instance on a ship blueprint
 *
 * Represents an installed module slot with optional variant selection.
 * This is what gets stored on a Blueprint.
 */
export interface ModuleInstance {
  /** Unique instance ID */
  readonly id: string;

  /** Module slot type ID (references ModuleSlot.id) */
  readonly module_slot_id: string;

  /** Selected variant ID (null if slot doesn't have variants or not yet selected) */
  readonly variant_id: string | null;
}

/**
 * Module slots catalog response from HYPERION API
 *
 * Response from GET /v1/catalog/module-slots
 */
export interface ModuleSlotsResponse {
  /** List of all available module slot types */
  readonly slots: readonly ModuleSlot[];

  /** Total count of module slot types */
  readonly count: number;
}

/**
 * Module variants catalog response from HYPERION API
 *
 * Response from GET /v1/catalog/modules/<slot_id>
 */
export interface ModuleVariantsResponse {
  /** Module slot type ID these variants belong to */
  readonly module_id: string;

  /** List of available variants for this module slot type */
  readonly variants: readonly ModuleVariant[];

  /** Total count of variants */
  readonly count: number;
}

/**
 * Request to add a module slot to a blueprint
 *
 * Used with POST /v1/blueprints/<id>/modules
 */
export interface AddModuleRequest {
  /** Module slot type ID to add */
  readonly module_slot_id: string;

  /** Optional: variant ID to select immediately */
  readonly variant_id?: string;
}

/**
 * Request to update a module variant selection
 *
 * Used with PATCH /v1/blueprints/<id>/modules/<module_id>
 */
export interface UpdateModuleVariantRequest {
  /** Variant ID to configure for this module instance */
  readonly variant_id: string;
}

// ============================================================================
// Ammunition & Inventory Types
// ============================================================================

/**
 * Ammunition category identifiers
 *
 * Categories correspond to weapon system types:
 * - kinetic: Projectile weapons (railguns, cannons) - requires ammo_type + ammo_size match
 * - missiles: Guided missiles - any missile works if launcher installed
 * - torpedos: Heavy torpedoes - any torpedo works if tube installed
 */
export type AmmoCategory = "kinetic" | "missiles" | "torpedos";

/**
 * Ammunition configuration from catalog API
 *
 * Defined in HYPERION `data/ammo/<category>/*.yaml` files.
 * Fetched via GET /v1/catalog/ammo/<category>/<ammo_id>
 */
export interface Ammunition {
  /** Unique ammunition ID */
  readonly id: string;

  /** Display name */
  readonly name: string;

  /** Brief description */
  readonly description: string;

  /** Ammunition category (kinetic, missiles, torpedos) */
  readonly category: AmmoCategory;

  /**
   * Ammo type for kinetic weapons (e.g., "shell", "slug", "ap")
   * Used with ammo_size to match compatible weapons
   */
  readonly ammo_type?: string;

  /**
   * Ammo size for kinetic weapons (e.g., "50mm", "100mm", "200mm")
   * Used with ammo_type to match compatible weapons
   */
  readonly ammo_size?: string;

  /** Cost per unit in credits */
  readonly cost: number;

  /** Weight per unit in metric tons */
  readonly weight: number;

  /** Impact damage on direct hit */
  readonly impact_damage: number;

  /** Blast radius for explosive rounds in meters (0 for pure kinetic) */
  readonly blast_radius: number;

  /** Blast damage within radius */
  readonly blast_damage: number;

  /** Projectile velocity in m/s */
  readonly velocity: number;

  /** Armor penetration value (higher = better against armored targets) */
  readonly armor_penetration: number;
}

/**
 * Inventory item representing loaded ammunition or cargo
 */
export interface InventoryItem {
  /** Ammunition or cargo item ID */
  readonly itemId: string;

  /** Quantity loaded */
  readonly quantity: number;
}

/**
 * Ship inventory state
 *
 * Represents cargo loaded onto a ship after design is complete.
 * Weight and credit constraints apply.
 */
export interface ShipInventory {
  /** Loaded ammunition by category */
  readonly ammunition: readonly InventoryItem[];

  /** Other cargo items (future expansion) */
  readonly cargo: readonly InventoryItem[];

  /** Total weight of all inventory items */
  readonly totalWeight: number;

  /** Total credit cost of all inventory items */
  readonly totalCost: number;
}

/**
 * Ammunition catalog response from HYPERION API
 *
 * Response from GET /v1/catalog/ammo/<category>
 */
export interface AmmoCategoryResponse {
  /** Category ID */
  readonly category: AmmoCategory;

  /** List of ammunition IDs in this category */
  readonly ammo: readonly string[];
}

/**
 * Request to add ammunition to ship inventory
 */
export interface AddInventoryItemRequest {
  /** Ammunition ID to add */
  readonly item_id: string;

  /** Quantity to add */
  readonly quantity: number;
}

/**
 * Request to update inventory item quantity
 */
export interface UpdateInventoryItemRequest {
  /** New quantity (0 to remove) */
  readonly quantity: number;
}
