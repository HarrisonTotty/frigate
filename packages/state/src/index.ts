import { create } from "zustand";
import type { StateCreator } from "zustand/vanilla";

import {
  type Blueprint,
  type CommunicationEvent,
  type ConnectionStatus,
  type DockingStatus,
  type EngineeringStatus,
  type HelmStatus,
  type HyperionEvent,
  type ModuleStatus,
  type Player,
  type ScienceContact,
  type Ship,
  type Station,
  type Team,
  type ThreatContact,
  type Vector3,
  RestClient,
  WebSocketManager
} from "@frigate/api-client";
import type { ModuleInstance } from "@frigate/api-client";
import blueprintReducer, { initialBlueprintState, type BlueprintState } from './blueprint';
import { indexById } from "@frigate/utils";

export interface SessionState {
  playerId: string | null;
  teamId: string | null;
  shipId: string | null;
  assignedRoles: string[];
  permissions: Record<string, boolean>;
}

export type SessionUpdate = Partial<Omit<SessionState, "permissions" | "assignedRoles">> & {
  readonly assignedRoles?: readonly string[];
  readonly permissions?: readonly string[] | Record<string, boolean>;
};

interface RotationCommand {
  readonly pitch: number;
  readonly yaw: number;
  readonly roll: number;
}

interface FrigateStoreState {
  session: SessionState;
  connectionStatus: ConnectionStatus;
  players: Record<string, Player>;
  teams: Record<string, Team>;
  blueprints: Record<string, Blueprint>;
  ships: Record<string, Ship>;
  stations: Record<string, Station>;
  scienceContacts: Record<string, ScienceContact>;
  threatContacts: Record<string, ThreatContact>;
  helmStatuses: Record<string, HelmStatus>;
  engineeringStatuses: Record<string, EngineeringStatus>;
  moduleStatuses: Record<string, Record<string, ModuleStatus>>;
  uiBlueprints: Record<string, BlueprintState>;
  dockingStatuses: Record<string, DockingStatus>;
  mutationCounters: Record<string, number>;
  communications: CommunicationEvent[];
  recentEvents: HyperionEvent[];
  setSession(update: SessionUpdate): void;
  hasPermission(permission: string): boolean;
  setConnectionStatus(status: ConnectionStatus): void;
  loadInitialData(client: RestClient): Promise<void>;
  refreshHelmStatus(shipId: string, client: RestClient): Promise<void>;
  refreshEngineeringStatus(shipId: string, client: RestClient): Promise<void>;
  refreshModuleStatuses(shipId: string, client: RestClient): Promise<void>;
  setHelmThrust(client: RestClient, shipId: string, thrust: number): Promise<void>;
  rotateHelm(client: RestClient, shipId: string, rotation: RotationCommand): Promise<void>;
  stopHelm(client: RestClient, shipId: string): Promise<void>;
  requestDocking(client: RestClient, shipId: string, stationId: string): Promise<void>;
  undock(client: RestClient, shipId: string): Promise<void>;
  isMutationPending(key: string): boolean;
  upsertPlayers(players: readonly Player[]): void;
  upsertTeams(teams: readonly Team[]): void;
  upsertBlueprints(blueprints: readonly Blueprint[]): void;
  /** UI-local blueprint editing helpers (transient editor state) */
  openUiBlueprint(blueprintId: string, blueprint?: Partial<BlueprintState>): void;
  closeUiBlueprint(blueprintId: string): void;
  uiAddInstance(blueprintId: string, instance: ModuleInstance): void;
  uiRemoveInstance(blueprintId: string, instanceId: string): void;
  uiSetInstanceVariant(blueprintId: string, instanceId: string, variantId: string | null): void;
  loadUiBlueprintRemote(apiBase: string, blueprintId: string): Promise<any | null>;
  // Remote-backed optimistic blueprint operations
  addInstanceRemote(apiBase: string, blueprintId: string, slotTypeId: string, variantId?: string | null): Promise<ModuleInstance>;
  removeInstanceRemote(apiBase: string, blueprintId: string, instanceId: string): Promise<boolean>;
  setInstanceVariantRemote(apiBase: string, blueprintId: string, instanceId: string, variantId: string | null): Promise<boolean>;
  upsertShips(ships: readonly Ship[]): void;
  upsertStations(stations: readonly Station[]): void;
  setScienceContacts(contacts: readonly ScienceContact[]): void;
  setThreatContacts(contacts: readonly ThreatContact[]): void;
  clearContacts(): void;
  applyEvent(event: HyperionEvent): void;
  updateDockingStatus(status: DockingStatus): void;
  recordCommunication(event: CommunicationEvent): void;
  recordEvent(event: HyperionEvent): void;
  removeShip(shipId: string): void;
}

type FrigateStoreCreator = StateCreator<FrigateStoreState, [], [], FrigateStoreState>;

type EventOf<TType extends HyperionEvent["type"]> = Extract<HyperionEvent, { readonly type: TType }>;

const RECENT_EVENT_LIMIT = 100;
const COMMUNICATION_LIMIT = 200;

const ZERO_VECTOR: Vector3 = { x: 0, y: 0, z: 0 };
const SESSION_STORAGE_KEY = "frigate.session";
const isBrowserEnvironment = typeof window !== "undefined";

function cloneVector(value: Vector3 = ZERO_VECTOR): Vector3 {
  return { x: value.x, y: value.y, z: value.z };
}

function createDefaultHelmStatus(): HelmStatus {
  return {
    thrust: 0,
    rotationRate: cloneVector(),
    warpActive: false,
    dockingMode: false,
    effectiveWeight: 0
  };
}

function mergeHelmStatus(status: HelmStatus | undefined, partial: Partial<HelmStatus>): HelmStatus {
  const base = status ?? createDefaultHelmStatus();
  return {
    thrust: partial.thrust ?? base.thrust,
    rotationRate: cloneVector(partial.rotationRate ?? base.rotationRate),
    warpActive: partial.warpActive ?? base.warpActive,
    dockingMode: partial.dockingMode ?? base.dockingMode,
    effectiveWeight: partial.effectiveWeight ?? base.effectiveWeight
  };
}

function convertRotationToVector(rotation: RotationCommand): Vector3 {
  return { x: rotation.pitch, y: rotation.yaw, z: rotation.roll };
}

function updateMutationCount(record: Record<string, number>, key: string, delta: number): Record<string, number> {
  const current = record[key] ?? 0;
  const next = current + delta;
  if (next <= 0) {
    const { [key]: _ignored, ...rest } = record;
    return rest;
  }
  return { ...record, [key]: next };
}

function removeKey<TValue>(record: Record<string, TValue>, key: string): Record<string, TValue> {
  const { [key]: _ignored, ...rest } = record;
  return rest;
}

function createMutationKey(scope: string, identifier: string): string {
  return `${scope}:${identifier}`;
}

function mapModulesById(modules: readonly ModuleStatus[]): Record<string, ModuleStatus> {
  return modules.reduce<Record<string, ModuleStatus>>((acc, moduleStatus) => {
    acc[moduleStatus.moduleId] = moduleStatus;
    return acc;
  }, {});
}

function findDockingEntryForShip(record: Record<string, DockingStatus>, shipId: string): { key: string; status: DockingStatus } | null {
  for (const [key, status] of Object.entries(record)) {
    if (status.shipId === shipId) {
      return { key, status };
    }
  }
  return null;
}

function loadSessionFromStorage(): SessionState | null {
  if (!isBrowserEnvironment) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const assignedRoles = Array.isArray(parsed.assignedRoles)
      ? parsed.assignedRoles.filter((role): role is string => typeof role === "string")
      : [];
    const permissions: Record<string, boolean> = {};
    if (parsed.permissions && typeof parsed.permissions === "object") {
      Object.entries(parsed.permissions as Record<string, unknown>).forEach(([permission, value]) => {
        permissions[permission] = Boolean(value);
      });
    }
    return {
      playerId: typeof parsed.playerId === "string" ? parsed.playerId : null,
      teamId: typeof parsed.teamId === "string" ? parsed.teamId : null,
      shipId: typeof parsed.shipId === "string" ? parsed.shipId : null,
      assignedRoles,
      permissions
    };
  } catch {
    return null;
  }
}

function persistSession(session: SessionState): void {
  if (!isBrowserEnvironment) {
    return;
  }
  try {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        playerId: session.playerId,
        teamId: session.teamId,
        shipId: session.shipId,
        assignedRoles: session.assignedRoles,
        permissions: session.permissions
      })
    );
  } catch {
    // Ignore storage errors to keep session updates resilient.
  }
}

function clearPersistedSession(): void {
  if (!isBrowserEnvironment) {
    return;
  }
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors to keep logout resilient.
  }
}

function shouldPersistSession(session: SessionState): boolean {
  return session.playerId != null;
}

const dockingKey = (shipId: string, stationId: string) => `${shipId}:${stationId}`;

function toPermissionMap(permissions?: readonly string[] | Record<string, boolean>): Record<string, boolean> {
  if (!permissions) {
    return {};
  }
  if (Array.isArray(permissions)) {
    return permissions.reduce<Record<string, boolean>>((acc, permission) => {
      acc[permission] = true;
      return acc;
    }, {});
  }
  return { ...(permissions as Record<string, boolean>) };
}

function appendLimited<T>(items: T[], next: T, limit: number): T[] {
  if (items.length >= limit) {
    return [...items.slice(items.length - limit + 1), next];
  }
  return [...items, next];
}

const createBaseSession = (): SessionState => ({
  playerId: null,
  teamId: null,
  shipId: null,
  assignedRoles: [],
  permissions: {}
});

const initialSessionState = loadSessionFromStorage() ?? createBaseSession();

const storeCreator: FrigateStoreCreator = (set, get) => ({
  session: initialSessionState,
  connectionStatus: "idle",
  players: {},
  teams: {},
  blueprints: {},
  ships: {},
  stations: {},
  scienceContacts: {},
  threatContacts: {},
  helmStatuses: {},
  engineeringStatuses: {},
  moduleStatuses: {},
  dockingStatuses: {},
  mutationCounters: {},
  communications: [],
  recentEvents: [],
  uiBlueprints: {},
  setSession: (update: SessionUpdate) => {
    set((state: FrigateStoreState) => {
      const nextSession: SessionState = {
        ...state.session,
        ...update,
        assignedRoles: update.assignedRoles ? [...update.assignedRoles] : [...state.session.assignedRoles],
        permissions: update.permissions ? toPermissionMap(update.permissions) : { ...state.session.permissions }
      };
      if (shouldPersistSession(nextSession)) {
        persistSession(nextSession);
      } else {
        clearPersistedSession();
      }
      return { ...state, session: nextSession };
    });
  },
  hasPermission: (permission: string) => Boolean(get().session.permissions[permission]),
  setConnectionStatus: (status: ConnectionStatus) => {
    set((state: FrigateStoreState) => (state.connectionStatus === status ? state : { ...state, connectionStatus: status }));
  },
  loadInitialData: async (client: RestClient) => {
    const [players, teams, blueprints, ships, stations] = await Promise.all([
      client.players.list(),
      client.teams.list(),
      client.blueprints.list(),
      client.ships.list(),
      client.stations.list()
    ]);

    set((state: FrigateStoreState) => ({
      ...state,
      players: indexById(players),
      teams: indexById(teams),
      blueprints: indexById(blueprints),
      ships: indexById(ships),
      stations: indexById(stations)
    }));
  },
  openUiBlueprint: (blueprintId: string, blueprint?: Partial<BlueprintState>) => {
    set((state: FrigateStoreState) => {
      if (state.uiBlueprints[blueprintId]) {
        return state;
      }
      const initial = { ...initialBlueprintState, ...blueprint } as BlueprintState;
      return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: initial } };
    });
  },
  loadUiBlueprintRemote: async (apiBase: string, blueprintId: string) => {
    try {
      const res = await fetch(`${apiBase}/v1/blueprints/${blueprintId}`);
      if (!res.ok) return null;
      const data = await res.json();
      set((state: FrigateStoreState) => ({ ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: { ...initialBlueprintState, ...data } } }));
      return data;
    } catch (err) {
      return null;
    }
  },
  closeUiBlueprint: (blueprintId: string) => {
    set((state: FrigateStoreState) => {
      if (!state.uiBlueprints[blueprintId]) {
        return state;
      }
      const { [blueprintId]: _ignored, ...rest } = state.uiBlueprints;
      return { ...state, uiBlueprints: rest };
    });
  },
  uiAddInstance: (blueprintId: string, instance: ModuleInstance) => {
    set((state: FrigateStoreState) => {
      const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
      const next = blueprintReducer(current, { type: 'blueprint/addInstance', payload: instance });
      return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
    });
  },
  uiRemoveInstance: (blueprintId: string, instanceId: string) => {
    set((state: FrigateStoreState) => {
      const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
      const next = blueprintReducer(current, { type: 'blueprint/removeInstance', payload: { instanceId } });
      return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
    });
  },
  uiSetInstanceVariant: (blueprintId: string, instanceId: string, variantId: string | null) => {
    set((state: FrigateStoreState) => {
      const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
      const next = blueprintReducer(current, { type: 'blueprint/setVariant', payload: { instanceId, variantId } });
      return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
    });
  },
  // Remote-backed optimistic blueprint operations
  addInstanceRemote: async (apiBase: string, blueprintId: string, slotTypeId: string, variantId?: string | null) => {
    const tempId = `tmp-${Math.random().toString(36).slice(2, 9)}`;
    const instance: ModuleInstance = { id: tempId, module_slot_id: slotTypeId, variant_id: variantId ?? null } as ModuleInstance;
    // optimistic locally
    set((state: FrigateStoreState) => {
      const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
      const next = blueprintReducer(current, { type: 'blueprint/addInstance', payload: instance });
      return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
    });

    if (!blueprintId) return instance;
    try {
      const res = await fetch(`${apiBase}/v1/blueprints/${blueprintId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_slot_id: slotTypeId, variant_id: variantId }),
      });
      if (res.ok) {
        const created = await res.json();
        // replace temporary
        set((state: FrigateStoreState) => {
          const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
          const afterRemove = blueprintReducer(current, { type: 'blueprint/removeInstance', payload: { instanceId: tempId } });
          const afterAdd = blueprintReducer(afterRemove, { type: 'blueprint/addInstance', payload: created as ModuleInstance });
          return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: afterAdd } };
        });
        return created as ModuleInstance;
      }
    } catch (err) {
      // rollback
      set((state: FrigateStoreState) => {
        const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
        const next = blueprintReducer(current, { type: 'blueprint/removeInstance', payload: { instanceId: tempId } });
        return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
      });
      throw err;
    }
    // in non-ok case, rollback
    set((state: FrigateStoreState) => {
      const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
      const next = blueprintReducer(current, { type: 'blueprint/removeInstance', payload: { instanceId: tempId } });
      return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
    });
    return instance;
  },
  removeInstanceRemote: async (apiBase: string, blueprintId: string, instanceId: string) => {
    const backup = (get().uiBlueprints[blueprintId] ?? initialBlueprintState).instances.find(i => i.id === instanceId) ?? null;
    // optimistic remove
    set((state: FrigateStoreState) => {
      const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
      const next = blueprintReducer(current, { type: 'blueprint/removeInstance', payload: { instanceId } });
      return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
    });

    if (!blueprintId) return false;
    try {
      const res = await fetch(`${apiBase}/v1/blueprints/${blueprintId}/modules/${instanceId}`, { method: 'DELETE' });
      if (res.ok) {
        return true;
      }
      // rollback
      if (backup) {
        set((state: FrigateStoreState) => {
          const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
          const next = blueprintReducer(current, { type: 'blueprint/addInstance', payload: backup });
          return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
        });
      }
      return false;
    } catch (err) {
      if (backup) {
        set((state: FrigateStoreState) => {
          const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
          const next = blueprintReducer(current, { type: 'blueprint/addInstance', payload: backup });
          return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
        });
      }
      throw err;
    }
  },
  setInstanceVariantRemote: async (apiBase: string, blueprintId: string, instanceId: string, variantId: string | null) => {
    // optimistic set
    set((state: FrigateStoreState) => {
      const current = state.uiBlueprints[blueprintId] ?? initialBlueprintState;
      const next = blueprintReducer(current, { type: 'blueprint/setVariant', payload: { instanceId, variantId } });
      return { ...state, uiBlueprints: { ...state.uiBlueprints, [blueprintId]: next } };
    });

    if (!blueprintId) return false;
    try {
      const res = await fetch(`${apiBase}/v1/blueprints/${blueprintId}/modules/${instanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant_id: variantId }),
      });
      if (res.ok) {
        return true;
      }
      // server rejected — caller should reload; rollback is possible but we'll let caller handle reload
      return false;
    } catch (err) {
      throw err;
    }
  },
  refreshHelmStatus: async (shipId: string, client: RestClient) => {
    const status = await client.helm.status(shipId);
    set((state: FrigateStoreState) => ({
      ...state,
      helmStatuses: { ...state.helmStatuses, [shipId]: status }
    }));
  },
  refreshEngineeringStatus: async (shipId: string, client: RestClient) => {
    const status = await client.engineering.status(shipId);
    set((state: FrigateStoreState) => ({
      ...state,
      engineeringStatuses: { ...state.engineeringStatuses, [shipId]: status }
    }));
  },
  refreshModuleStatuses: async (shipId: string, client: RestClient) => {
    const statuses = await client.engineering.modulesStatus(shipId);
    set((state: FrigateStoreState) => ({
      ...state,
      moduleStatuses: { ...state.moduleStatuses, [shipId]: mapModulesById(statuses) }
    }));
  },
  setHelmThrust: async (client: RestClient, shipId: string, thrust: number) => {
    const mutationKey = createMutationKey("helm.thrust", shipId);
    const previousStatus = get().helmStatuses[shipId];
    const optimisticStatus = mergeHelmStatus(previousStatus, { thrust });
    set((state: FrigateStoreState) => ({
      ...state,
      helmStatuses: { ...state.helmStatuses, [shipId]: optimisticStatus },
      mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, 1)
    }));
    try {
      await client.helm.setThrust(shipId, thrust);
      const latest = await client.helm.status(shipId);
      set((state: FrigateStoreState) => ({
        ...state,
        helmStatuses: { ...state.helmStatuses, [shipId]: latest }
      }));
    } catch (error) {
      set((state: FrigateStoreState) => ({
        ...state,
        helmStatuses:
          previousStatus != null
            ? { ...state.helmStatuses, [shipId]: previousStatus }
            : removeKey(state.helmStatuses, shipId)
      }));
      throw error;
    } finally {
      set((state: FrigateStoreState) => ({
        ...state,
        mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, -1)
      }));
    }
  },
  rotateHelm: async (client: RestClient, shipId: string, rotation: RotationCommand) => {
    const mutationKey = createMutationKey("helm.rotate", shipId);
    const previousStatus = get().helmStatuses[shipId];
    const optimisticStatus = mergeHelmStatus(previousStatus, { rotationRate: convertRotationToVector(rotation) });
    set((state: FrigateStoreState) => ({
      ...state,
      helmStatuses: { ...state.helmStatuses, [shipId]: optimisticStatus },
      mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, 1)
    }));
    try {
      await client.helm.rotate(shipId, rotation);
      const latest = await client.helm.status(shipId);
      set((state: FrigateStoreState) => ({
        ...state,
        helmStatuses: { ...state.helmStatuses, [shipId]: latest }
      }));
    } catch (error) {
      set((state: FrigateStoreState) => ({
        ...state,
        helmStatuses:
          previousStatus != null
            ? { ...state.helmStatuses, [shipId]: previousStatus }
            : removeKey(state.helmStatuses, shipId)
      }));
      throw error;
    } finally {
      set((state: FrigateStoreState) => ({
        ...state,
        mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, -1)
      }));
    }
  },
  stopHelm: async (client: RestClient, shipId: string) => {
    const mutationKey = createMutationKey("helm.stop", shipId);
    const previousStatus = get().helmStatuses[shipId];
    const optimisticStatus = mergeHelmStatus(previousStatus, { thrust: 0, rotationRate: cloneVector() });
    set((state: FrigateStoreState) => ({
      ...state,
      helmStatuses: { ...state.helmStatuses, [shipId]: optimisticStatus },
      mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, 1)
    }));
    try {
      await client.helm.stop(shipId);
      const latest = await client.helm.status(shipId);
      set((state: FrigateStoreState) => ({
        ...state,
        helmStatuses: { ...state.helmStatuses, [shipId]: latest }
      }));
    } catch (error) {
      set((state: FrigateStoreState) => ({
        ...state,
        helmStatuses:
          previousStatus != null
            ? { ...state.helmStatuses, [shipId]: previousStatus }
            : removeKey(state.helmStatuses, shipId)
      }));
      throw error;
    } finally {
      set((state: FrigateStoreState) => ({
        ...state,
        mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, -1)
      }));
    }
  },
  requestDocking: async (client: RestClient, shipId: string, stationId: string) => {
    const key = dockingKey(shipId, stationId);
    const mutationKey = createMutationKey("dock.request", key);
    const previousStatus = get().dockingStatuses[key];
    const optimisticStatus: DockingStatus = { shipId, stationId, status: "requested" };
    set((state: FrigateStoreState) => ({
      ...state,
      dockingStatuses: { ...state.dockingStatuses, [key]: optimisticStatus },
      mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, 1)
    }));
    try {
      const result = await client.communications.requestDocking(shipId, stationId);
      set((state: FrigateStoreState) => ({
        ...state,
        dockingStatuses: { ...state.dockingStatuses, [key]: result }
      }));
    } catch (error) {
      set((state: FrigateStoreState) => ({
        ...state,
        dockingStatuses:
          previousStatus != null
            ? { ...state.dockingStatuses, [key]: previousStatus }
            : removeKey(state.dockingStatuses, key)
      }));
      throw error;
    } finally {
      set((state: FrigateStoreState) => ({
        ...state,
        mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, -1)
      }));
    }
  },
  undock: async (client: RestClient, shipId: string) => {
    const existing = findDockingEntryForShip(get().dockingStatuses, shipId);
    const mutationKey = createMutationKey("dock.undock", shipId);
    if (existing) {
      set((state: FrigateStoreState) => ({
        ...state,
        dockingStatuses: {
          ...state.dockingStatuses,
          [existing.key]: { shipId, stationId: existing.status.stationId, status: "undocking" }
        },
        mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, 1)
      }));
    } else {
      set((state: FrigateStoreState) => ({
        ...state,
        mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, 1)
      }));
    }
    try {
      await client.communications.undock(shipId);
      if (existing) {
        const refreshed = await client.stations.getDockingStatus(existing.status.stationId, shipId).catch(() => null);
        set((state: FrigateStoreState) => ({
          ...state,
          dockingStatuses:
            refreshed != null
              ? { ...state.dockingStatuses, [existing.key]: refreshed }
              : removeKey(state.dockingStatuses, existing.key)
        }));
      }
    } catch (error) {
      if (existing) {
        set((state: FrigateStoreState) => ({
          ...state,
          dockingStatuses: { ...state.dockingStatuses, [existing.key]: existing.status }
        }));
      }
      throw error;
    } finally {
      set((state: FrigateStoreState) => ({
        ...state,
        mutationCounters: updateMutationCount(state.mutationCounters, mutationKey, -1)
      }));
    }
  },
  isMutationPending: (key: string) => Boolean(get().mutationCounters[key]),
  upsertPlayers: (players: readonly Player[]) => {
    if (!players.length) {
      return;
    }
    set((state: FrigateStoreState) => {
      const nextPlayers = { ...state.players };
      for (const player of players) {
        nextPlayers[player.id] = player;
      }
      return { ...state, players: nextPlayers };
    });
  },
  upsertTeams: (teams: readonly Team[]) => {
    if (!teams.length) {
      return;
    }
    set((state: FrigateStoreState) => {
      const nextTeams = { ...state.teams };
      for (const team of teams) {
        nextTeams[team.id] = team;
      }
      return { ...state, teams: nextTeams };
    });
  },
  upsertBlueprints: (blueprints: readonly Blueprint[]) => {
    if (!blueprints.length) {
      return;
    }
    set((state: FrigateStoreState) => {
      const nextBlueprints = { ...state.blueprints };
      for (const blueprint of blueprints) {
        nextBlueprints[blueprint.id] = blueprint;
      }
      return { ...state, blueprints: nextBlueprints };
    });
  },
  upsertShips: (ships: readonly Ship[]) => {
    if (!ships.length) {
      return;
    }
    set((state: FrigateStoreState) => {
      const nextShips = { ...state.ships };
      for (const ship of ships) {
        nextShips[ship.id] = ship;
      }
      return { ...state, ships: nextShips };
    });
  },
  upsertStations: (stations: readonly Station[]) => {
    if (!stations.length) {
      return;
    }
    set((state: FrigateStoreState) => {
      const nextStations = { ...state.stations };
      for (const station of stations) {
        nextStations[station.id] = station;
      }
      return { ...state, stations: nextStations };
    });
  },
  setScienceContacts: (contacts: readonly ScienceContact[]) => {
    set((state: FrigateStoreState) => ({ ...state, scienceContacts: indexById(contacts) }));
  },
  setThreatContacts: (contacts: readonly ThreatContact[]) => {
    set((state: FrigateStoreState) => ({ ...state, threatContacts: indexById(contacts) }));
  },
  clearContacts: () => {
    set((state: FrigateStoreState) => {
      if (Object.keys(state.scienceContacts).length === 0 && Object.keys(state.threatContacts).length === 0) {
        return state;
      }
      return { ...state, scienceContacts: {}, threatContacts: {} };
    });
  },
  applyEvent: (event: HyperionEvent) => {
    set((state: FrigateStoreState) => {
      const recentEvents = appendLimited(state.recentEvents, event, RECENT_EVENT_LIMIT);

      switch (event.type) {
        case "ship_position": {
          const { data: payload } = event as EventOf<"ship_position">;
          const ship = state.ships[payload.shipId];
          if (!ship) {
            return { ...state, recentEvents };
          }
          return {
            ...state,
            ships: {
              ...state.ships,
              [payload.shipId]: {
                ...ship,
                position: payload.position,
                velocity: payload.velocity,
                rotation: payload.rotation
              }
            },
            recentEvents
          };
        }
        case "ship_status": {
          const { data: payload } = event as EventOf<"ship_status">;
          const ship = state.ships[payload.shipId];
          if (!ship) {
            return { ...state, recentEvents };
          }
          return {
            ...state,
            ships: {
              ...state.ships,
              [payload.shipId]: {
                ...ship,
                hull: payload.hull,
                shields: payload.shields,
                power: payload.power
              }
            },
            recentEvents
          };
        }
        case "communication": {
          const { data: payload } = event as EventOf<"communication">;
          return {
            ...state,
            communications: appendLimited(state.communications, payload, COMMUNICATION_LIMIT),
            recentEvents
          };
        }
        case "docking": {
          const { data: payload } = event as EventOf<"docking">;
          return {
            ...state,
            dockingStatuses: {
              ...state.dockingStatuses,
              [dockingKey(payload.shipId, payload.stationId)]: {
                shipId: payload.shipId,
                stationId: payload.stationId,
                status: payload.status
              }
            },
            recentEvents
          };
        }
        default:
          return { ...state, recentEvents };
      }
    });
  },
  updateDockingStatus: (status: DockingStatus) => {
    set((state: FrigateStoreState) => ({
      ...state,
      dockingStatuses: {
        ...state.dockingStatuses,
        [dockingKey(status.shipId, status.stationId)]: status
      }
    }));
  },
  recordCommunication: (event: CommunicationEvent) => {
    set((state: FrigateStoreState) => ({
      ...state,
      communications: appendLimited(state.communications, event, COMMUNICATION_LIMIT)
    }));
  },
  recordEvent: (event: HyperionEvent) => {
    set((state: FrigateStoreState) => ({
      ...state,
      recentEvents: appendLimited(state.recentEvents, event, RECENT_EVENT_LIMIT)
    }));
  },
  removeShip: (shipId: string) => {
    set((state: FrigateStoreState) => {
      if (!state.ships[shipId]) {
        return state;
      }
      const nextShips = { ...state.ships };
      delete nextShips[shipId];
      return { ...state, ships: nextShips };
    });
  }
});

export const createFrigateStore = () => create<FrigateStoreState>()(storeCreator);

export const useFrigateStore = createFrigateStore();

export type { FrigateStoreState };

export function useSessionStore(): SessionState;
export function useSessionStore<T>(selector: (session: SessionState) => T): T;
export function useSessionStore<T>(selector?: (session: SessionState) => T): SessionState | T {
  if (selector) {
    return useFrigateStore((state: FrigateStoreState) => selector(state.session));
  }
  return useFrigateStore((state: FrigateStoreState) => state.session);
}

export function useUiBlueprintStore(): Record<string, BlueprintState>;
export function useUiBlueprintStore<T>(selector: (ui: Record<string, BlueprintState>) => T): T;
export function useUiBlueprintStore<T>(selector?: (ui: Record<string, BlueprintState>) => T): Record<string, BlueprintState> | T {
  if (selector) {
    return useFrigateStore((state: FrigateStoreState) => selector(state.uiBlueprints));
  }
  return useFrigateStore((state: FrigateStoreState) => state.uiBlueprints);
}

/**
 * Convenience selector to get a blueprint editor state by id (reactive hook)
 */
export function useBlueprintById(blueprintId: string) {
  return useFrigateStore((state: FrigateStoreState) => state.uiBlueprints[blueprintId]);
}

/**
 * Convenience hook to bind blueprint-related actions to a specific blueprint id.
 */
export function useBlueprintActions(blueprintId: string) {
  const openUiBlueprint = useFrigateStore((s) => s.openUiBlueprint);
  const closeUiBlueprint = useFrigateStore((s) => s.closeUiBlueprint);
  const uiAddInstance = useFrigateStore((s) => s.uiAddInstance);
  const uiRemoveInstance = useFrigateStore((s) => s.uiRemoveInstance);
  const uiSetInstanceVariant = useFrigateStore((s) => s.uiSetInstanceVariant);
  const addInstanceRemote = useFrigateStore((s) => s.addInstanceRemote);
  const removeInstanceRemote = useFrigateStore((s) => s.removeInstanceRemote);
  const setInstanceVariantRemote = useFrigateStore((s) => s.setInstanceVariantRemote);

  return {
    openUiBlueprint: (initial?: Partial<BlueprintState>) => openUiBlueprint(blueprintId, initial),
    closeUiBlueprint: () => closeUiBlueprint(blueprintId),
    uiAddInstance: (instance: ModuleInstance) => uiAddInstance(blueprintId, instance),
    uiRemoveInstance: (instanceId: string) => uiRemoveInstance(blueprintId, instanceId),
    uiSetInstanceVariant: (instanceId: string, variantId: string | null) => uiSetInstanceVariant(blueprintId, instanceId, variantId),
    // remote-backed helpers
    addInstanceRemote: (apiBase: string, slotTypeId: string, variantId?: string | null) => addInstanceRemote(apiBase, blueprintId, slotTypeId, variantId),
    removeInstanceRemote: (apiBase: string, instanceId: string) => removeInstanceRemote(apiBase, blueprintId, instanceId),
    setInstanceVariantRemote: (apiBase: string, instanceId: string, variantId: string | null) => setInstanceVariantRemote(apiBase, blueprintId, instanceId, variantId),
  };
}

export function bindWebSocketToStore(manager: WebSocketManager): () => void {
  const unsubscribeEvents = manager.subscribe((event) => {
    useFrigateStore.getState().applyEvent(event);
  });
  const unsubscribeStatus = manager.onStatusChange((status) => {
    useFrigateStore.getState().setConnectionStatus(status);
  });
  void manager.connect();
  return () => {
    unsubscribeEvents();
    unsubscribeStatus();
    manager.disconnect();
  };
}

export { SessionProvider, useHasPermission, useSessionContext } from "./session-context";

// Blueprint state helpers (minimal exports for components to reference types)
export type { BlueprintState };
export { blueprintReducer };
