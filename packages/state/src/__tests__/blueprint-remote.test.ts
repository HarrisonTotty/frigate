import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useFrigateStore } from "../index";

describe("blueprint remote helpers", () => {
  beforeEach(() => {
    // reset minimal store slice
    useFrigateStore.setState({ uiBlueprints: {} });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("addInstanceRemote - success replaces temp id with created instance", async () => {
    const blueprintId = "bp-1";
    // open blueprint
    useFrigateStore.getState().openUiBlueprint(blueprintId, {} as any);

    const created = { id: "created-1", module_slot_id: "slot-x", variant_id: null } as any;

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => created }))
    );

    const instance = await useFrigateStore
      .getState()
      .addInstanceRemote("", blueprintId, "slot-x", null);

    expect(instance.id).toBe("created-1");
    const state = useFrigateStore.getState();
    const instances = state.uiBlueprints[blueprintId].instances;
    expect(instances.find((i: any) => i.id === "created-1")).toBeDefined();
    // no tmp ids should remain
    expect(instances.some((i: any) => typeof i.id === "string" && i.id.startsWith("tmp-"))).toBe(
      false
    );
  });

  it("addInstanceRemote - network error rollbacks temp instance and throws", async () => {
    const blueprintId = "bp-err";
    useFrigateStore.getState().openUiBlueprint(blueprintId, {} as any);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      })
    );

    await expect(
      useFrigateStore.getState().addInstanceRemote("", blueprintId, "slot-x", null)
    ).rejects.toThrow();

    const instances = useFrigateStore.getState().uiBlueprints[blueprintId].instances;
    // temp instance should have been rolled back
    expect(instances.length).toBe(0);
  });

  it("removeInstanceRemote - success removes instance", async () => {
    const blueprintId = "bp-remove";
    const instance = { id: "inst-1", module_slot_id: "slot-a", variant_id: null } as any;
    useFrigateStore.getState().openUiBlueprint(blueprintId, { instances: [instance] } as any);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true }))
    );

    const ok = await useFrigateStore.getState().removeInstanceRemote("", blueprintId, "inst-1");
    expect(ok).toBe(true);
    const instances = useFrigateStore.getState().uiBlueprints[blueprintId].instances;
    expect(instances.find((i: any) => i.id === "inst-1")).toBeUndefined();
  });

  it("removeInstanceRemote - non-ok rolls back and returns false", async () => {
    const blueprintId = "bp-remove-fail";
    const instance = { id: "inst-2", module_slot_id: "slot-b", variant_id: null } as any;
    useFrigateStore.getState().openUiBlueprint(blueprintId, { instances: [instance] } as any);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false }))
    );

    const ok = await useFrigateStore.getState().removeInstanceRemote("", blueprintId, "inst-2");
    expect(ok).toBe(false);
    const instances = useFrigateStore.getState().uiBlueprints[blueprintId].instances;
    expect(instances.find((i: any) => i.id === "inst-2")).toBeDefined();
  });

  it("setInstanceVariantRemote - success returns true and leaves variant", async () => {
    const blueprintId = "bp-set";
    const instance = { id: "inst-3", module_slot_id: "slot-c", variant_id: null } as any;
    useFrigateStore.getState().openUiBlueprint(blueprintId, { instances: [instance] } as any);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true }))
    );

    const ok = await useFrigateStore
      .getState()
      .setInstanceVariantRemote("", blueprintId, "inst-3", "v1");
    expect(ok).toBe(true);
    const inst = useFrigateStore
      .getState()
      .uiBlueprints[blueprintId].instances.find((i: any) => i.id === "inst-3");
    expect(inst).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(inst!.variant_id).toBe("v1");
  });

  it("setInstanceVariantRemote - non-ok returns false but optimistic set remains", async () => {
    const blueprintId = "bp-set-fail";
    const instance = { id: "inst-4", module_slot_id: "slot-d", variant_id: null } as any;
    useFrigateStore.getState().openUiBlueprint(blueprintId, { instances: [instance] } as any);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false }))
    );

    const ok = await useFrigateStore
      .getState()
      .setInstanceVariantRemote("", blueprintId, "inst-4", "v2");
    expect(ok).toBe(false);
    const inst = useFrigateStore
      .getState()
      .uiBlueprints[blueprintId].instances.find((i: any) => i.id === "inst-4");
    expect(inst).toBeDefined();
    // optimistic change was applied and not rolled back by helper
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(inst!.variant_id).toBe("v2");
  });
});
