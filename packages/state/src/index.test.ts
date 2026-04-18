import { beforeEach, describe, expect, it, vi } from "vitest";

import { createFrigateStore } from "./index";
import type { DockingStatus, RestClient, Ship } from "@frigate/api-client";

const baseVector = { x: 0, y: 0, z: 0 } as const;
const baseRotation = { w: 1, x: 0, y: 0, z: 0 } as const;

const baseShip: Ship = {
  id: "ship-1",
  name: "Hyperion",
  classId: "class-1",
  faction: "Alliance",
  teamId: "team-1",
  position: baseVector,
  velocity: baseVector,
  rotation: baseRotation,
  hull: 100,
  maxHull: 100,
  shields: 100,
  maxShields: 100,
  power: 100,
  maxPower: 100,
  modules: [],
};

const helmKey = (shipId: string) => `helm.thrust:${shipId}`;
const dockKey = (shipId: string, stationId: string) => `${shipId}:${stationId}`;

beforeEach(() => {
  localStorage.clear();
});

describe("Frigate state store", () => {
  it("persists session updates to localStorage", () => {
    const store = createFrigateStore();

    store.getState().setSession({
      playerId: "player-1",
      teamId: "team-1",
      shipId: "ship-1",
      assignedRoles: ["helm"],
      permissions: ["helm:control"],
    });

    const saved = localStorage.getItem("frigate.session");
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved as string)).toMatchObject({
      playerId: "player-1",
      assignedRoles: ["helm"],
    });

    store.getState().setSession({
      playerId: null,
      teamId: null,
      shipId: null,
      assignedRoles: [],
      permissions: {},
    });

    expect(localStorage.getItem("frigate.session")).toBeNull();
  });

  it("updates ship telemetry when position events arrive", () => {
    const store = createFrigateStore();
    store.setState((state) => ({
      ...state,
      ships: { ...state.ships, [baseShip.id]: baseShip },
    }));

    store.getState().applyEvent({
      type: "ship_position",
      data: {
        shipId: baseShip.id,
        position: { x: 10, y: 5, z: -3 },
        velocity: { x: 1, y: 0, z: 0 },
        rotation: { w: 0.9, x: 0, y: 0.1, z: 0 },
      },
    });

    const updated = store.getState().ships[baseShip.id];
    expect(updated.position).toEqual({ x: 10, y: 5, z: -3 });
    expect(updated.velocity).toEqual({ x: 1, y: 0, z: 0 });
  });

  it("applies optimistic helm thrust updates and reconciles on success", async () => {
    const store = createFrigateStore();
    const shipId = "ship-optimistic";
    const initialStatus = {
      thrust: 10,
      rotationRate: { x: 0, y: 0, z: 0 },
      warpActive: false,
      dockingMode: false,
      effectiveWeight: 1,
    } as const;
    const finalStatus = {
      thrust: 55,
      rotationRate: { x: 0, y: 0.5, z: 0 },
      warpActive: false,
      dockingMode: false,
      effectiveWeight: 0.8,
    } as const;

    store.setState((state) => ({
      ...state,
      helmStatuses: { ...state.helmStatuses, [shipId]: initialStatus },
    }));

    const restClient = {
      helm: {
        setThrust: vi.fn(() => Promise.resolve()),
        status: vi.fn(() => Promise.resolve(finalStatus)),
      },
    } as unknown as RestClient;

    await store.getState().setHelmThrust(restClient, shipId, finalStatus.thrust);

    expect(restClient.helm.setThrust).toHaveBeenCalledWith(shipId, finalStatus.thrust);
    expect(restClient.helm.status).toHaveBeenCalledWith(shipId);
    expect(store.getState().helmStatuses[shipId]).toEqual(finalStatus);
    expect(store.getState().isMutationPending(helmKey(shipId))).toBe(false);
  });

  it("rolls back helm thrust mutations when the server rejects the update", async () => {
    const store = createFrigateStore();
    const shipId = "ship-error";
    const initialStatus = {
      thrust: 20,
      rotationRate: { x: 0, y: 0, z: 0 },
      warpActive: false,
      dockingMode: false,
      effectiveWeight: 1,
    } as const;

    store.setState((state) => ({
      ...state,
      helmStatuses: { ...state.helmStatuses, [shipId]: initialStatus },
    }));

    const error = new Error("network");
    const restClient = {
      helm: {
        setThrust: vi.fn(() => Promise.reject(error)),
        status: vi.fn(),
      },
    } as unknown as RestClient;

    await expect(store.getState().setHelmThrust(restClient, shipId, 75)).rejects.toBe(error);
    expect(restClient.helm.status).not.toHaveBeenCalled();
    expect(store.getState().helmStatuses[shipId]).toEqual(initialStatus);
    expect(store.getState().isMutationPending(helmKey(shipId))).toBe(false);
  });

  it("optimistically tracks docking requests and reconciles the server response", async () => {
    const store = createFrigateStore();
    const shipId = "ship-dock";
    const stationId = "station-7";
    const key = dockKey(shipId, stationId);

    let resolveDocking: (status: DockingStatus) => void = () => undefined;
    const dockingPromise = new Promise<DockingStatus>((resolve) => {
      resolveDocking = resolve;
    });

    const restClient = {
      communications: {
        requestDocking: vi.fn(() => dockingPromise),
      },
    } as unknown as RestClient;

    const mutation = store.getState().requestDocking(restClient, shipId, stationId);

    expect(store.getState().dockingStatuses[key]?.status).toBe("requested");
    expect(store.getState().isMutationPending(`dock.request:${key}`)).toBe(true);

    resolveDocking({ shipId, stationId, status: "approaching" });
    await mutation;

    expect(store.getState().dockingStatuses[key]?.status).toBe("approaching");
    expect(store.getState().isMutationPending(`dock.request:${key}`)).toBe(false);
  });

  it("restores prior docking state when a request fails", async () => {
    const store = createFrigateStore();
    const shipId = "ship-dock-error";
    const stationId = "station-9";
    const key = dockKey(shipId, stationId);
    const previousStatus: DockingStatus = { shipId, stationId, status: "docked" };

    store.setState((state) => ({
      ...state,
      dockingStatuses: { ...state.dockingStatuses, [key]: previousStatus },
    }));

    const error = new Error("denied");
    const restClient = {
      communications: {
        requestDocking: vi.fn(() => Promise.reject(error)),
      },
    } as unknown as RestClient;

    await expect(store.getState().requestDocking(restClient, shipId, stationId)).rejects.toBe(
      error
    );

    expect(store.getState().dockingStatuses[key]).toEqual(previousStatus);
    expect(store.getState().isMutationPending(`dock.request:${key}`)).toBe(false);
  });
});
