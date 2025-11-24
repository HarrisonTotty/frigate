import type {
  CombatEvent,
  CommunicationEvent,
  DockingEvent,
  HyperionEvent,
  HyperionEventType,
  ShipPositionEvent,
  ShipStatusEvent
} from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function ensureString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function ensureNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

export function ensureBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function ensureVector3(value: unknown) {
  if (!isRecord(value)) {
    return { x: 0, y: 0, z: 0 } as const;
  }
  return {
    x: ensureNumber(value.x),
    y: ensureNumber(value.y),
    z: ensureNumber(value.z)
  } as const;
}

export function ensureQuaternion(value: unknown) {
  if (!isRecord(value)) {
    return { w: 1, x: 0, y: 0, z: 0 } as const;
  }
  return {
    w: ensureNumber(value.w, 1),
    x: ensureNumber(value.x),
    y: ensureNumber(value.y),
    z: ensureNumber(value.z)
  } as const;
}

export function parseHyperionEvent(payload: unknown): HyperionEvent {
  if (!isRecord(payload)) {
    return { type: "unknown", data: payload as Record<string, unknown> };
  }

  const type = ensureString(payload.type) as HyperionEventType;
  const data = payload.data;

  switch (type) {
    case "ship_position": {
      if (isRecord(data)) {
        const event: ShipPositionEvent = {
          shipId: ensureString(data.ship_id),
          position: ensureVector3(data.position),
          velocity: ensureVector3(data.velocity),
          rotation: ensureQuaternion(data.rotation)
        };
        return { type, data: event };
      }
      break;
    }
    case "combat": {
      if (isRecord(data)) {
        const event: CombatEvent = {
          attackerId: ensureString(data.attacker_id),
          targetId: ensureString(data.target_id),
          weaponType: ensureString(data.weapon_type),
          hullDamage: ensureNumber(data.hull_damage),
          shieldDamage: ensureNumber(data.shield_damage),
          critical: ensureBoolean(data.critical)
        };
        return { type, data: event };
      }
      break;
    }
    case "ship_status": {
      if (isRecord(data)) {
        const event: ShipStatusEvent = {
          shipId: ensureString(data.ship_id),
          hull: ensureNumber(data.hull),
          shields: ensureNumber(data.shields),
          power: ensureNumber(data.power),
          statusEffects: Array.isArray(data.status_effects)
            ? (data.status_effects.filter((value) => typeof value === "string") as string[])
            : []
        };
        return { type, data: event };
      }
      break;
    }
    case "communication": {
      if (isRecord(data)) {
        const event: CommunicationEvent = {
          fromShip: ensureString(data.from_ship),
          toShip: ensureString(data.to_ship),
          message: ensureString(data.message),
          tone: ensureString(data.tone)
        };
        return { type, data: event };
      }
      break;
    }
    case "docking": {
      if (isRecord(data)) {
        const event: DockingEvent = {
          shipId: ensureString(data.ship_id),
          stationId: ensureString(data.station_id),
          status: ensureString(data.status) as DockingEvent["status"]
        };
        return { type, data: event };
      }
      break;
    }
    default:
      break;
  }

  return { type, data: (data ?? {}) as Record<string, unknown> };
}
