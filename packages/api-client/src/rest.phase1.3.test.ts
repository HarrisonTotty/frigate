import { describe, it, expect, vi } from "vitest";
import { BlueprintsResource } from "./rest";
import type { AddModuleRequest, UpdateModuleVariantRequest } from "./types";

const mockHttp = {
  post: vi.fn((_url, _body, cb) => Promise.resolve(cb?.())),
  patch: vi.fn((_url, _body, cb) => Promise.resolve(cb?.())),
  delete: vi.fn((_url, cb) => Promise.resolve(cb?.())),
};

describe("BlueprintsResource (Phase 1.3)", () => {
  const resource = new BlueprintsResource(
    mockHttp as unknown as ConstructorParameters<typeof BlueprintsResource>[0]
  );

  it("addModule calls correct endpoint and body", async () => {
    const req: AddModuleRequest = {
      module_slot_id: "aux-support-system",
      variant_id: "aux-support-system-mk1",
    };
    await resource.addModule("bp-123", req);
    expect(mockHttp.post).toHaveBeenCalledWith(
      "/v1/blueprints/bp-123/modules",
      req,
      expect.any(Function)
    );
  });

  it("updateModuleVariant calls correct endpoint and body", async () => {
    const req: UpdateModuleVariantRequest = { variant_id: "aux-support-system-mk2" };
    await resource.updateModuleVariant("bp-123", "mod-456", req);
    expect(mockHttp.patch).toHaveBeenCalledWith(
      "/v1/blueprints/bp-123/modules/mod-456",
      req,
      expect.any(Function)
    );
  });

  it("removeModule calls correct endpoint", async () => {
    await resource.removeModule("bp-123", "mod-456");
    expect(mockHttp.delete).toHaveBeenCalledWith(
      "/v1/blueprints/bp-123/modules/mod-456",
      expect.any(Function)
    );
  });
});
