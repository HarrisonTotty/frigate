import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, cleanup } from "@testing-library/react";
import { useFrigateStore } from "@frigate/state";
import useUiBlueprint from "../useUiBlueprint";
import React from "react";

describe("useUiBlueprint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  function createHookConsumer(blueprintId: string, apiBase: string) {
    const methods: any = {};
    function Consumer() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const hook = useUiBlueprint({ blueprintId, apiBase });
      Object.assign(methods, hook);
      return null;
    }
    return { Consumer, methods } as const;
  }

  it("optimistically adds an instance and replaces temp id with server id on success", async () => {
    const blueprintId = "bp-1";
    const apiBase = "http://api.test";

    const serverCreated = { id: "srv-123", module_slot_id: "slot-1", variant_id: null };
    vi.stubGlobal(
      "fetch",
      vi.fn((url, opts) => {
        if ((opts as any)?.method === "POST") {
          return Promise.resolve({ ok: true, json: async () => serverCreated });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      })
    );

    const { Consumer, methods } = createHookConsumer(blueprintId, apiBase);
    await act(async () => {
      render(<Consumer />);
    });

    // open blueprint editor via hook helper to avoid relying on store.getState()
    act(() => {
      methods.ensureOpen({ id: blueprintId, instances: [] });
    });

    // add instance
    await act(async () => {
      await methods.addInstance("slot-1");
    });

    const uiState = useFrigateStore.getState().uiBlueprints[blueprintId];
    const hasServer = uiState.instances.some((i: any) => i.id === serverCreated.id);
    expect(hasServer).toBe(true);
  });

  it("optimistically removes instance and keeps removed on success", async () => {
    const blueprintId = "bp-2";
    const apiBase = "http://api.test";

    vi.stubGlobal(
      "fetch",
      vi.fn((url, opts) => {
        if ((opts as any)?.method === "DELETE") {
          return Promise.resolve({ ok: true });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      })
    );

    const { Consumer, methods } = createHookConsumer(blueprintId, apiBase);
    await act(async () => {
      render(<Consumer />);
    });

    act(() => {
      methods.ensureOpen({
        id: blueprintId,
        instances: [{ id: "to-remove", module_slot_id: "slot-x", variant_id: null }],
      });
    });

    await act(async () => {
      const removed = await methods.removeInstance("to-remove");
      expect(removed).toBe(true);
    });

    const uiState = useFrigateStore.getState().uiBlueprints[blueprintId];
    expect(uiState.instances.find((i: any) => i.id === "to-remove")).toBeUndefined();
  });

  it("sets variant optimistically and performs server PATCH", async () => {
    const blueprintId = "bp-3";
    const apiBase = "http://api.test";

    vi.stubGlobal(
      "fetch",
      vi.fn((url, opts) => {
        if ((opts as any)?.method === "PATCH") {
          return Promise.resolve({ ok: true });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      })
    );

    const { Consumer, methods } = createHookConsumer(blueprintId, apiBase);
    await act(async () => {
      render(<Consumer />);
    });

    act(() => {
      methods.ensureOpen({
        id: blueprintId,
        instances: [{ id: "inst-1", module_slot_id: "slot-a", variant_id: null }],
      });
    });

    await act(async () => {
      const ok = await methods.setVariant("inst-1", "var-9");
      expect(ok).toBe(true);
    });

    const uiState = useFrigateStore.getState().uiBlueprints[blueprintId];
    const inst = uiState.instances.find((i: any) => i.id === "inst-1");
    expect(inst?.variant_id).toBe("var-9");
  });
});
